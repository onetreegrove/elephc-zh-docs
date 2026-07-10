### Dead Store Elimination

第七个注册的 transform（`src/ir_passes/dead_store.rs`）会移除那些 stored value 在被覆盖或函数退出前的任何路径上都不会再读取的 `store_local` instructions。不同于以 SSA-value 粒度工作的 dead instruction elimination，本 pass 会针对 local *slots* 推理：它运行 backward dataflow，在每个 `load_local` 处 gen 一个 slot，在每个 `store_local` 处 kill 它，并迭代到固定点，使 live-out 成为 successor live-in sets 的并集。如果一个 store 之后该 slot 不是 live，那么该 store 就是 dead，因此中间没有 read 的较早 store 也会死亡。

本 pass 仅限于满足以下条件的 slots：（1）普通 `PhpLocal`，（2）非引用计数存储类型（`!php_type_needs_lifetime_tracking`），（3）只被普通 `load_local`/`store_local` 命名，（4）永远不会通过 reference address-escape。引用计数限制是关键正确性边界：assignment lowering 会把 refcounted slot 的 store 包在独立的 `acquire`/`release` instructions 中，并释放之前的 occupant，因此只删除 `store_local` 会泄漏 acquired value。Scalar slots 没有这类 ownership ops，它们的 scope-exit cleanup 是 no-op，所以移除 dead scalar store 对 refcount 保持中性。任何其他命名 slot 的 op（ref-cell promote/alias/release、`unset_local`、static-local 或 global access）都会让 slot 不符合条件，因为它可能以本 pass 不建模的方式读取或 alias 该 slot。

条件（4）很微妙：by-reference call argument（例如 `new Box($v)`，构造函数参数是 `public int &$value`）或 by-reference closure capture（`use (&$x)`）会 lower 为普通 `load_local`，而 codegen 之后会把该 argument value 回溯到定义它的 `load_local`，并传递 slot 的 *address*，因此 callee 会通过 forward `load_local`-only liveness 看不到的 alias 读取或修改 slot。由于 single-function pass 没有 callee signatures（哪些 parameters 是 by-reference），该 pass 使用 conservative default-deny allowlist：只要某个 slot 的任何 `load_local` result 被非已证明 value-only consumer 消费，该 slot 就会被排除（value-only consumer 包括 arithmetic、comparison、cast、output、store、string 或 refcount op）。每个 call、object construction、closure capture、property/array access，以及任何 future opcode 都会被视为可能的 by-reference escape。先把 load 喂给 value-only op 是安全的，因为 codegen 只会把 *direct* `load_local` 回溯到 slot。

这补充了 peephole pass 的 per-block、value-equality store forwarding（它会删除存储同一个 resident value 的 store）：dead store elimination 基于 liveness，并且跨 block 边界，因此能移除 stored result 从未被观察到的 *different* value store。Stores 会被 neutralized to `nop`；之后给已移除 store 供值的 pure value 会在后续 driver sweep 中由 dead instruction elimination 清理。

### Branch Simplification

第八个注册的 transform（`src/ir_passes/branch_simplify.rs`）会用三种方式剪枝 CFG：

- **Constant-condition folding** — 条件解析为 constant（`const_bool`、通过 PHP truthiness 的 `const_i64`，或 `const_null`）的 `cond_br` 会变成指向 taken edge 的 unconditional `br`。以 `const_i64`/`const_bool` scrutinee 为条件的 `switch` 会折叠为指向匹配 case（或 default）的 `br`。例如 `while (true)` loop 会 lower 为 constant `cond_br`，该 fold 会将其折叠。
- **Empty-block jump threading** — 非 entry block 如果没有 parameters、只有 `nop` instructions，并且以 unconditional `br` 结束，就是 forwarding block。指向它的 edges 会重定向到 forwarding chain 的末端（带 cycle detection）。由于 forwarding blocks 没有 parameters，每条进入它们的 edge 都携带空 arguments，所以 retargeting 不需要 argument rewriting。
- **Unreachable-block neutralization** — 从 entry 不再可达的 blocks 会把 terminator 设为 `Unreachable`，并把 instructions 重写为 `nop`。

和其他 passes 一样，unreachable blocks 会**就地** neutralize，而不是物理删除。Validator 要求 `block.id == index`，并把 unreachable block 中的任何 *use* 报告为 `UseNotDominated`（unreachable block 的 dominator set 会收缩为自身）。Neutralizing 会清除每个 use，包括 terminator 和 instruction operands，因此 block 保持 valid，同时 block、value 和 instruction table slots 保留索引。这样避免了 renumbering，更关键的是保持 `try` handler block-id tokens（编码在 `try_push_handler` immediates 中）正确。使用任何 exception-handling opcode 的 functions 会整体跳过，因为它们的 handler blocks 可以通过 terminator graph 中不存在的 implicit edges 到达，所以只基于 terminator 的 reachability 可能错误地 neutralize live handler。移除 edges 只会扩大 dominator sets，而 threaded forwarding blocks 不携带 definitions，因此 simplification 永远不会让之前 valid 的 use 失效；cross-block cascades 会通过 fixed-point driver 收敛。

### Small-Function Inlining

`src/ir_passes/inline.rs` 是一个**跨函数**、module-level pass（不是 per-function `IrPass` 集合的成员），会在 call site 把小 callee 的 body 拼接到 caller 中。原 call 被移除；callee 的 blocks 以 fresh ids 移植，arguments 通过 `store_local` 绑定到 remapped parameter slots，caller block 跳入移植后的 entry，每个 callee `return` 都变成指向 fresh continuation block 的 `br`，并通过 block parameter 传递 result。

Callee 只有在最多 **24** 条非 `nop` instructions、entry block 有 0 个 parameters、不包含 exception-handling ops、不是 generator/fiber wrapper，并且**非递归**时才会被 inline。递归判断包括直接和互递归，通过 call-graph cycle analysis 排除任何可达自身的 function（per-caller fuel cap 兜底保证终止）。Eligibility 还进一步限制在可证明 ownership-safe 的 **destructor-free** boundary 和 body 上（scalars、strings，以及 destructor-free types 的 arrays/unions；没有 by-ref/variadic params，也没有 ref-cell/static/global/capture locals）。

跨边界正确性不依赖显式 epilogue：拼接把 `return` 替换为 `br`，绕过 callee 的隐式 codegen epilogue cleanup，因此移植会复现该 cleanup 的 per-slot decisions：parameter slots 和直接返回的 slots 变成 epilogue-excluded `HiddenTemp`（匹配 callee，因为它的 argument 是 borrowed，return ownership 被 moved 给 caller），而普通 refcounted internal locals 仍为 `PhpLocal`，仍由 host epilogue 释放。destructor-free 限制使一个残余差异不可观察，也就是把这些 internal frees 延迟到 host epilogue（没有 `__destruct`，没有 array identity），因此 reference-counting 和 copy-on-write behaviour 逐字节保留。两个 call-site guards 完成正确性：arguments 必须在无 coercion 的情况下绑定到 parameter slots（storage types 匹配，因此 spread/named-boxed-`mixed` 和 `int`↔`float` sites 保持普通 calls），并且任何 `string` argument 都必须来自 non-scratch source（`const_str`/`load_local`），因为拼接后的 body 会在 host frame 中运行 callee 的 statement-boundary concat-buffer reset，否则会释放仍在使用中的 scratch string argument。Call-site name resolution（`call` Data immediates 和 `function_variant_call` include-variant refs）使用 mutation 前取得的 snapshots，因此 rewrite loop 不会在持有 function 时 alias module。

## Dominance Analysis

`src/ir_passes/dominance.rs` 是一个只读 sidecar analysis（类似 liveness，不是 driver transform），会构建每个 function 的 dominator tree，这是后续 dominance-aware cross-block passes（common-subexpression elimination、natural-loop detection、loop-invariant code motion）的基础。

`compute_dominance` 使用 Cooper–Harvey–Kennedy 迭代算法：它按 reverse postorder 遍历 reachable blocks，并把每个 block 的 immediate dominator 重算为已处理 predecessors 的 idoms 交集，也就是按 postorder numbers 做 two-finger walk，直到固定点。它对任意 CFG 都能收敛，并且在 EIR 产生的小函数上速度很快。

生成的 `DominanceInfo` 可回答 `immediate_dominator`、自反的 `dominates` / `strictly_dominates`、dominator-tree `children`（top-down traversal）、`nearest_common_dominator` 和 `is_reachable`。只有从 entry 可达的 blocks 参与；unreachable blocks（branch simplification 会就地 neutralize 但保留在 table 中）会从 tree 中排除，并回答 `false`/`None`。内部 idom table 在 entry 处 self-rooted，使 intersect 和 dominance walks 不需要特殊情况即可终止。该 analysis 使用共享的 `cfg::predecessors` helper。

## Loop Analysis

`src/ir_passes/loops.rs` 是一个只读 sidecar analysis，在 dominator tree 上构建 function 的 natural-loop forest，是 loop-invariant code motion 和其他 loop optimizations 的基础。

`compute_loops(func, &dominance)` 首先找出 **back edges**，也就是 CFG edge `latch -> header` 且 target 支配 source，因此 loop detection 是 dominance 之上的薄层。共享同一个 header 的 back edges 形成一个带多个 latches 的 [`NaturalLoop`]。Loop body 是 header 加上每个能不经过 header 到达 latch 的 block，通过对 reachable predecessors 进行 backward walk 找到，并在 header 停止。

每个 `NaturalLoop` 暴露其 `header`、`latches`、排序后的 `blocks`（带 binary-search `contains`）、nesting forest 中的 `parent` 和 `depth`，以及 `preheader`。**Nesting** 按 block-set containment 判断：当 loop `A` 的 header 位于 loop `B` 的 body 中时，`A` 嵌套在 `B` 中，immediate parent 是满足条件的最小 `B`；lowerer 发出 reducible CFGs，所以 loops 要么正确嵌套，要么互不相交。`LoopInfo` 还可按 block/function 回答 `innermost_loop`、`loop_depth`、`is_loop_header` 和 `back_edges`。

**Preheader** 被检测为 header 唯一 reachable 的 out-of-loop predecessor，且该 predecessor 的唯一 successor 是 header。PHP loops lower 为 slot-based CFGs（loop variable 位于 local slot，而不是 block parameter），因此分支进入 header 的 init block 是天然 preheader；当进入 loop 的路径在多个 blocks 或 conditional 之间共享时，就不存在 preheader，需要 preheader 的 optimization 会插入它。

## AST Lowering Catalogue

Lowering 必须覆盖 `src/parser/ast/expr.rs` 和 `src/parser/ast/stmt.rs` 中的每个 variant。下面的目录对当前源码树是穷尽的。
