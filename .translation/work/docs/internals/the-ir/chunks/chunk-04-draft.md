### Identity Arithmetic Folding

第一个注册的 transform（`src/ir_passes/identity_arith.rs`）会用两种 dominance-safe、validator-clean 的重写来折叠整数和浮点算术/位运算上的代数恒等式：

- Fold-to-operand：当结果等于已有 operand `x`（`x + 0`、`x * 1`、`x | 0`、`x << 0`、`x & x`、`x / 1`、`x * 1.0` 等）时，该 instruction 会被 neutralized to `nop`，并且其结果 uses 会被重定向到 `x`。`x` 已经是 operand，因此它支配每个 use。
- Fold-to-zero：当结果是整数 `0`（`x ^ x`、`x - x`、`x * 0`、`x & 0`、`x % 1`）时，该 instruction 会就地重写为 `const_i64 0`，保留相同的 result value id，因此不需要 use-rewrite。

只折叠与 PHP 等价的恒等式。Integer `x / 0` 和 `x % 0` 保留为运行时 trap；float additive-zero 和 `x * 0.0` 被排除，因为 signed zero 和 `NaN` 会让它们可观察。Fold-to-operand chains 会在一次 sweep 内传递解析（`a = x + 0; b = a * 1`），因此被 neutralized 的 dead value 永远不会用作 replacement target。

### Peephole Patterns

第二个注册的 transform（`src/ir_passes/peephole/`）会对 lowered EIR 的形状应用局部重写。每个 pattern 都把 rewrite intents 收集到共享 accumulator（fold-to-operand RAUW map、要 neutralize 的 instructions，以及要转换为 interned `const_str` 的 `str_concat` instructions），再由一个 apply phase 统一提交，并与 identity pass 共享 `replace_all_uses`、`resolve_chains` 和 `neutralize_to_nop`。

- **Box/unbox cancellation** — `unbox(box(x)) → x`，仅适用于 scalar（`NonHeap`）payload 且 ir/php type 匹配，所以装箱 heap value（unbox 会抽出 borrowed reference）永远不会被折叠。
- **Redundant `move`/`borrow`** — 这些 pure forwarding ops 只在结果与 operand 具有相同 ownership 和 type 时折叠到 operand，因此 RAUW 不会转移 cleanup responsibility。（当前 lowering 不会发出它们；如果将来发出，这个 rewrite 会保持正确。）
- **Load/store forwarding and dead stores** — per-block value-numbering 会跟踪每个 scalar（`NonHeap`）`PhpLocal`/`HiddenTemp`/`NamedArgTemp` slot 中驻留的 value。如果某个 slot 有已知 resident value，对该 slot 的 `load_local` 会折叠为该值；存储同一个 resident value 的 `store_local` 会被删除。任何命名该 slot 的 instruction（unset、ref-cell promote/alias/release/store）都会使其失效，状态也会在 block 边界重置，因此永远不会跨过通过 alias 的写入。By-ref locals 使用 ref cells，而不是普通 load/store，所以普通 scalar slots 不会被 alias。
- **Paired acquire/release cancellation** — 如果一个 `acquire` 的结果恰好被它的 `release` 使用一次，则两者都会删除。single-use guard 保证不管两者距离多远，每条路径上的 refcount 都保持中性。
- **String-literal concat folding** — `str_concat(const_str a, const_str b)` 会把 `a ++ b` intern 到 data pool，并变成单个标记为 `persistent` 的 `const_str`，因此 cleanup 永远不会释放该 literal。Nested concats 会跨 driver sweeps 收敛。

### Constant Folding

第三个注册的 transform（`src/ir_passes/const_fold.rs`）会把所有 operands 都是编译期常量的 operations 折叠为单个 `const_*` instruction，就地重写 instruction 并保留它的 result value id（不需要 use-rewrite）。它对 instruction table 做一次前向扫描，跟踪每个 value 携带的 constant；SSA 中的常量是全程序范围的，因此一次 sweep 就能发现 constant operands，并立即折叠 `(2 + 3) * 4` 这样的链。它会折叠 integer `iadd`/`isub`/`imul`、bitwise `and`/`or`/`xor`、范围内（`0..=63`）的 `ishl`/`ishr_a`、unary `ineg`/`ibit_not`、float `fadd`/`fsub`/`fmul`/`fneg`、signed `icmp`，以及 `is_null`/`is_truthy` predicates。

每个 fold 都精确复现 op 的 lowering 在运行时计算出的结果，因此编译结果不变：integers 按 64 位 wrap（匹配原生 `add`/`sub`/`mul`），shifts 只在 count 范围内时 fold，floats 使用精确 IEEE-754。可能 trap 的 integer division/modulo、float division（PHP 的 `DivisionByZeroError` 与 IEEE infinity）以及对 `NaN` 敏感的 `fcmp` 会保留不折叠，与 identity arithmetic 一样保守。

通过 local slots 的传播由它和 peephole 的 scalar load/store value-numbering 组合实现：peephole 会把存入 local 的 constant 转发到之后的 `load_local` uses；本 pass 再折叠由此产生的 constant-operand operation。两者在 fixed-point driver 下共同形成基于 EIR value ids 和 local slots 的 per-block constant propagation。Identity arithmetic 暴露出的常量也会喂给它（`$argc * 0` → `const_i64 0` → downstream folds），而 dead constant producers 会由 dead instruction elimination 清理。

### Common Subexpression Elimination

第四个注册的 transform（`src/ir_passes/cse.rs`）会移除已有相同 predecessor 且该 predecessor 支配它的 pure computation，将 redundant result 重定向到较早的 value（RAUW），并把它 neutralize to `nop`。它在一次 dominator-tree value-numbering traversal 中覆盖 per-block 和 cross-block redundancy：scoped hash table 会把每个 pure instruction 的 key `(op, result type, immediate, canonicalized operands)` 映射到第一次计算它的 value。由于 blocks 按 dominator-tree preorder 访问，table 恰好保存了支配当前 block 的 definitions，包括自身较早的 instructions 和 dominating blocks 的 definitions；因此命中时一定是 dominating value，使重定向 dominance-safe。某个 block 插入的 entries 会在整个 subtree 完成后移除。

只有 **pure**（`Effects::PURE`）、至少有一个 operand，且 result 为 `NonHeap` 或 `Persistent` 的 instructions 才符合条件：purity 表示该 value 只由 operands 决定（没有 memory/state dependency，也不会 fault），ownership 限制保证 rewrite 对 refcount 保持中性，也就是 dead-instruction elimination 允许删除的同一类 value。由于 SSA operands 按 value 相等，identical pure ops 在 identical operand values 上会计算出 identical results。Nullary constant 和 address materializations（`const_*`、`data_addr`）故意不去重：在每个 use 处重新物化更便宜，不需要在整个跨度内保持活跃，所以 CSE 只处理 computations。
包含 exception handlers 的函数会跳过：它们的 handler blocks 可以通过 terminator graph 中不存在的隐式 edges 到达，因此 terminator-graph dominator 可能在运行时被 throw 绕过，这会使 cross-block redirect 不可靠。这个限制与 branch simplification 相同。CSE 使用 [Dominance Analysis](#dominance-analysis)，并与 branch simplification 共享 `cfg::has_exception_handlers`。

### Loop-Invariant Code Motion

第五个注册的 transform（`src/ir_passes/licm.rs`）会把 operands 在 loop 中不变的 pure computation 从 loop body 移到 loop preheader，使其只运行一次而不是每次迭代运行。它基于 [dominator tree](#dominance-analysis) 构建 [loop forest](#loop-analysis)，然后对每个 loop 把 invariant set 增长到固定点：当某条 instruction 的每个 operand 要么由同一 loop 中也将被 hoist 的另一条 instruction 定义，要么由支配 preheader 的 definition 定义时，该 instruction 就是 invariant。

只有 **pure**（`Effects::PURE`）、至少有一个 operand，且 result 为 `NonHeap`/`Persistent` 的 instructions 符合条件；purity 表示 value 只依赖 operands，op 既不读取可变状态也不会 fault，因此把它无条件提前到 preheader 执行一次是安全的，即使它原来的 block 只在部分迭代中运行也没有 speculation hazard；ownership 边界让移动对 refcount 保持中性。Nullary constant/address materializations 不会 hoist（重新物化比让它们跨 loop 保持活跃更便宜）。Loops 以内层优先处理，并立即应用 moves，因此在多个嵌套 loops 中不变的 value 会在一次 run 中到达最外层 preheader。Instructions 会在 block 的 instruction lists 之间迁移，它们的 result `ValueDef`s（block + index）会在最后统一重算，使 value table 匹配新布局。没有检测到 preheader 的 loops，以及包含 exception handlers 的 functions，会被跳过。（PHP loop variables 存在 local slots 中，通过 impure `load_local` 重新加载，因此 invariant source expression 还不能 hoist；随着更多 values 以 SSA 形式跨 loops 流动，该 pass 的可触达范围会扩大。）

### Dead Instruction Elimination

第六个注册的 transform（`src/ir_passes/dead_inst.rs`）会移除那些结果-producing、其 values 在 CFG 上不再 live，且 effect metadata 表明它们是 pure 的 instructions。它用 successor live-in sets 计算 liveness，用这些 live-out values 加上 terminator uses 初始化每个 block 的 backward walk，然后把 dead instructions neutralize to `nop`。

Neutralization 会保留 instruction/result value table slots，因此 validator 不需要 value renumbering 或 block-list surgery。Read-only、allocation、mutation、refcounting、output、warning、fatal、throw 和 deopt-capable instructions 会保持不变；dead read elimination 会推迟到后续 pass，直到能证明 PHP 和 ownership behavior 等价。一个 block 内的 dead chains 会在 backward walk 中折叠；跨 block 边界的 chains 会在 fixed-point pass driver 重新计算 liveness 后收敛。
