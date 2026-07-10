## Register Allocation

The `src/ir_passes/` module runs a linear-scan register allocator
(Poletto-Sarkar) over each function before backend lowering. It is the default;
`--regalloc=stack` (or `ELEPHC_REGALLOC=stack`) selects the original
spill-everything path, which keeps every SSA value in a stack slot.

The pass has four stages:

1. **Liveness** (`liveness.rs`): backward dataflow to a fixed point producing
   per-block live-in/live-out value sets. Block parameters are definitions at
   block entry; branch arguments are uses at the predecessor's terminator.
2. **Intervals** (`intervals.rs`): blocks are numbered in reverse postorder and
   each value gets one contiguous `[start, end]` live interval. A value live
   across edges or a loop back-edge spans the intervening positions.
3. **Scan** (`regalloc.rs`): intervals are walked in start order against an
   active set; a free register from the matching pool is assigned, otherwise the
   use-weighted spill heuristic evicts the cheapest interval. Integer and float
   values draw from separate pools.
4. **Frame integration** (`codegen_ir/frame.rs`): the allocation is stored in
   the frame layout, each used callee-saved register gets a save slot, and the
   value-access chokepoints (`load_value_to_result`, `load_value_to_reg`,
   `store_result_value`) read and write registers instead of slots.

### Caller-saved reuse for non-call-crossing intervals

The allocator distinguishes two register classes. A value whose live range
never crosses a **clobber point** — any instruction or terminator whose lowering
emits a call or touches a caller-saved register — is *call-free* and prefers a
**caller-saved** register, which needs no prologue save/restore. A value that
does live across a clobber point uses a **callee-saved** register, which survives
calls. `src/ir_passes/clobber.rs` holds the audited allowlist of volatile-safe
opcodes (constants, integer/float arithmetic, comparisons, scalar conversions);
it is safe-by-default, so an unlisted opcode merely forgoes the caller-saved
optimization rather than risking a clobbered value. The caller-saved pools are
disjoint from every register those volatile-safe lowerings touch:

| Class | aarch64 int | aarch64 float | x86_64 int | x86_64 float |
|---|---|---|---|---|
| Caller-saved | `x12`–`x15` | `d16`–`d23` | `rsi`,`rdi`,`r8`,`r9` | `xmm2`–`xmm7` |
| Callee-saved | `x21`–`x28` | `d8`–`d14` | `rbx` | (none) |

This is especially valuable on x86_64, where the callee-saved integer pool is
just `rbx` and there are no callee-saved XMM registers at all: call-free integer
and float values can now use the caller-saved pools instead of always spilling.
On x86_64 `r14` and `r15` are still never allocated — they are used as scratch by
hand-written runtime routines and shared heap-marker codegen without
ABI-compliant save/restore. A float that lives across a call on x86_64 still
spills, because no XMM register survives the call.

The spill heuristic is use-weighted: under pressure the allocator evicts the
interval with the lowest use count, breaking ties toward the furthest end (the
classic furthest-use rule), so frequently-used "hot" values keep their
registers.

The prologue saves and the epilogue restores exactly the callee-saved registers
the allocator used; caller-saved registers need neither.

The first cut register-allocates only single-word `NonHeap` scalars (`I64`,
`F64`) that are neither block parameters nor branch arguments, keeping the
slot-based block-parameter moves and the ownership/GC cleanup paths unchanged.
Generators and functions containing exception handlers fall back to all-spilled.

## Phase 02 Implementation Contract

The `src/ir/` module should implement at least:

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

Phase 02 does not need AST lowering or assembly codegen. Its unit tests can
construct modules by hand and validate/print them.

## Closure Audit

This specification closes the first EIR roadmap item because it defines:

- the EIR type lattice and exact mapping from every current `PhpType`
- module/function/block/value/local structures
- instruction families and representative opcodes for all current expression,
  statement, builtin, runtime, ownership, exception, generator, fiber, pointer,
  buffer, packed, object, callable, and include/resolver surfaces
- all terminators, including generator suspension
- the effect lattice and effect sources
- ownership states and ownership validation rules
- textual format requirements and examples
- an exhaustive current `ExprKind`, `BinOp`, and `StmtKind` lowering catalogue
- validator requirements sufficient for Phase 02