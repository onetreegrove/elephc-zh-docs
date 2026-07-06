## Register Allocation

`src/ir_passes/` 模块会在 backend lowering 前，对每个 function 运行一个线性扫描寄存器分配器（Poletto-Sarkar）。它是默认路径；`--regalloc=stack`（或 `ELEPHC_REGALLOC=stack`）选择原始的 spill-everything 路径，也就是把每个 SSA value 都放在 stack slot 中。

该 pass 有四个阶段：

1. **Liveness**（`liveness.rs`）：向后 dataflow 到固定点，生成 per-block live-in/live-out value sets。Block parameters 是 block entry 处的 definitions；branch arguments 是 predecessor terminator 处的 uses。
2. **Intervals**（`intervals.rs`）：blocks 按 reverse postorder 编号，每个 value 获得一个连续的 `[start, end]` live interval。跨 edges 或 loop back-edge live 的 value 会覆盖中间 positions。
3. **Scan**（`regalloc.rs`）：按 start 顺序遍历 intervals，与 active set 比对；从匹配 pool 分配 free register，否则 use-weighted spill heuristic 会驱逐最便宜的 interval。Integer 和 float values 使用不同 pools。
4. **Frame integration**（`codegen_ir/frame.rs`）：allocation 存入 frame layout，每个用到的 callee-saved register 获得一个 save slot，value-access chokepoints（`load_value_to_result`、`load_value_to_reg`、`store_result_value`）读写 registers 而不是 slots。

### Caller-saved reuse for non-call-crossing intervals

Allocator 区分两个 register classes。Live range 从不跨越 **clobber point** 的 value 是 *call-free*，并优先使用无需 prologue save/restore 的 **caller-saved** register；clobber point 是任何 lowering 会发出 call 或触碰 caller-saved register 的 instruction 或 terminator。确实跨越 clobber point 的 value 使用能跨调用存活的 **callee-saved** register。`src/ir_passes/clobber.rs` 保存经过审计的 volatile-safe opcodes allowlist（constants、integer/float arithmetic、comparisons、scalar conversions）；它默认安全，因此未列出的 opcode 只会放弃 caller-saved optimization，而不会冒着 value 被 clobber 的风险。Caller-saved pools 与这些 volatile-safe lowerings 会触碰的每个 register 都不相交：

| Class | aarch64 int | aarch64 float | x86_64 int | x86_64 float |
|---|---|---|---|---|
| Caller-saved | `x12`–`x15` | `d16`–`d23` | `rsi`,`rdi`,`r8`,`r9` | `xmm2`–`xmm7` |
| Callee-saved | `x21`–`x28` | `d8`–`d14` | `rbx` | (none) |

这在 x86_64 上尤其有价值，因为 callee-saved integer pool 只有 `rbx`，并且完全没有 callee-saved XMM registers：call-free integer 和 float values 现在可以使用 caller-saved pools，而不必总是 spill。在 x86_64 上，`r14` 和 `r15` 仍然永远不会被分配，因为它们被手写 runtime routines 和共享 heap-marker codegen 当作 scratch 使用，且没有 ABI-compliant save/restore。跨 call live 的 x86_64 float 仍会 spill，因为没有 XMM register 能跨调用存活。

Spill heuristic 按 use-weighted：在寄存器压力下，allocator 会驱逐 use count 最低的 interval，平局时偏向 furthest end（经典 furthest-use 规则），因此频繁使用的 "hot" values 会保留寄存器。

Prologue 只保存 allocator 使用过的 callee-saved registers；epilogue 也只恢复这些 registers。Caller-saved registers 不需要保存或恢复。

第一版只为 single-word `NonHeap` scalars（`I64`、`F64`）分配寄存器，并且这些 values 既不是 block parameters，也不是 branch arguments，从而保持 slot-based block-parameter moves 和 ownership/GC cleanup paths 不变。Generators 和包含 exception handlers 的 functions 会回退到 all-spilled。

## Phase 02 Implementation Contract

`src/ir/` 模块至少应实现：

- `types.rs`: `IrType`, `IrHeapKind`, `PhpType` mapping helpers
- `value.rs`: `ValueId`, `Value`, `ValueDef`, `Ownership`
- `instr.rs`: `Instruction`, `Op`, `InstId`, operand/result helpers
- `effects.rs`: `Effects` bitset/struct and common constructors
- `block.rs`: `BlockId`, `BasicBlock`, `Terminator`, switch case records
- `function.rs`: `Function`, `FunctionParam`, `LocalSlot`, flags
- `module.rs`: `Module`, data pool, metadata records, extern declarations
- `builder.rs`: checked construction API that assigns values/instructions
- `validator.rs`: structural, opcode, dominance, ownership, and effect checks
- `print.rs`: deterministic textual printer

Phase 02 不需要 AST lowering 或 assembly codegen。它的 unit tests 可以手动构造 modules，并验证/打印它们。

## Closure Audit

本规格关闭第一个 EIR 路线图项，因为它定义了：

- EIR type lattice，以及从每个当前 `PhpType` 到 EIR 的精确映射
- module/function/block/value/local structures
- 覆盖所有当前 expression、statement、builtin、runtime、ownership、exception、generator、fiber、pointer、buffer、packed、object、callable 和 include/resolver surfaces 的 instruction families 和 representative opcodes
- 所有 terminators，包括 generator suspension
- effect lattice 和 effect sources
- ownership states 和 ownership validation rules
- textual format requirements and examples
- exhaustive current `ExprKind`, `BinOp`, and `StmtKind` lowering catalogue
- Phase 02 所需的 validator requirements
