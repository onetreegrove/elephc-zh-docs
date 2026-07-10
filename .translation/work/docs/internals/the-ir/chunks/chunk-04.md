### Identity Arithmetic Folding

The first registered transform (`src/ir_passes/identity_arith.rs`) folds
algebraic identities on integer and float arithmetic/bitwise operations using
two dominance-safe, validator-clean rewrites:

- Fold-to-operand: when the result equals an existing operand `x` (`x + 0`,
  `x * 1`, `x | 0`, `x << 0`, `x & x`, `x / 1`, `x * 1.0`, …), the instruction is
  neutralized to `nop` and its result uses are redirected to `x`. `x` was already
  an operand, so it dominates every use.
- Fold-to-zero: when the result is the integer `0` (`x ^ x`, `x - x`, `x * 0`,
  `x & 0`, `x % 1`), the instruction is rewritten in place to `const_i64 0`,
  keeping the same result value id so no use-rewrite is needed.

Only PHP-equivalent identities are folded. Integer `x / 0` and `x % 0` are left
to trap at runtime, and float additive-zero and `x * 0.0` are excluded because
signed zero and `NaN` make them observable. Fold-to-operand chains within one
sweep (`a = x + 0; b = a * 1`) are resolved transitively so a neutralized,
dead value is never used as a replacement target.

### Peephole Patterns

The second registered transform (`src/ir_passes/peephole/`) applies local
rewrites to the shape of lowered EIR. Each pattern collects rewrite intents into
a shared accumulator (a fold-to-operand RAUW map, instructions to neutralize, and
`str_concat` instructions to convert to interned `const_str`), and a single apply
phase commits them, sharing `replace_all_uses`, `resolve_chains`, and
`neutralize_to_nop` with the identity pass.

- **Box/unbox cancellation** — `unbox(box(x)) → x`, only for scalar (`NonHeap`)
  payloads with matching ir/php type, so boxing a heap value (where unbox
  extracts a borrowed reference) is never folded.
- **Redundant `move`/`borrow`** — these pure forwarding ops fold to their operand
  only when the result shares the operand's ownership and type, so RAUW cannot
  shift cleanup responsibility. (Current lowering does not emit them; the rewrite
  keeps them correct if it ever does.)
- **Load/store forwarding and dead stores** — a per-block value-numbering tracks
  the value resident in each scalar (`NonHeap`) `PhpLocal`/`HiddenTemp`/
  `NamedArgTemp` slot. A `load_local` of a slot with a known resident value folds
  to it; a `store_local` of the resident value is dropped. Any instruction naming
  the slot (unset, ref-cell promote/alias/release/store) invalidates it, and state
  resets at block boundaries — writes through aliases are never crossed. By-ref
  locals use ref cells, not plain load/store, so plain scalar slots are not
  aliased.
- **Paired acquire/release cancellation** — an `acquire` whose result is used
  exactly once, by its `release`, drops both. The single-use guard makes this
  refcount-neutral on every path regardless of distance between the two ops.
- **String-literal concat folding** — `str_concat(const_str a, const_str b)`
  interns `a ++ b` into the data pool and becomes a single `const_str` marked
  `persistent` so cleanup never frees the literal. Nested concats converge across
  driver sweeps.

### Constant Folding

The third registered transform (`src/ir_passes/const_fold.rs`) folds operations
whose operands are all compile-time constants into a single `const_*`
instruction, rewriting the instruction in place and keeping its result value id
(no use-rewrite needed). A single forward scan over the instruction table tracks
the constant carried by each value — constants in SSA are program-wide, so one
sweep discovers constant operands and collapses chains like `(2 + 3) * 4` at
once. It folds integer `iadd`/`isub`/`imul`, bitwise `and`/`or`/`xor`, in-range
(`0..=63`) `ishl`/`ishr_a`, unary `ineg`/`ibit_not`, float
`fadd`/`fsub`/`fmul`/`fneg`, signed `icmp`, and the `is_null`/`is_truthy`
predicates.

Each fold reproduces exactly what the op's lowering computes at runtime, so the
compiled result is unchanged: integers wrap at 64 bits (matching native
`add`/`sub`/`mul`), shifts fold only for in-range counts, and floats use exact
IEEE-754. The trapping integer division/modulo, float division (PHP's
`DivisionByZeroError` versus IEEE infinity), and `NaN`-sensitive `fcmp` are left
unfolded, the same conservatism as identity arithmetic.

Propagation through local slots is realized by composition with the peephole's
scalar load/store value-numbering, which forwards a constant stored to a local
onto its later `load_local` uses; this pass then folds the resulting
constant-operand operation. Together, under the fixed-point driver, they form
per-block constant propagation over EIR value ids and local slots. Constants
surfaced by identity arithmetic feed it too (`$argc * 0` → `const_i64 0` →
downstream folds), and dead constant producers are cleaned up by dead
instruction elimination.

### Common Subexpression Elimination

The fourth registered transform (`src/ir_passes/cse.rs`) removes a pure
computation whose identical predecessor already dominates it, redirecting the
redundant result to the earlier value (RAUW) and neutralizing it to `nop`. It
covers per-block and cross-block redundancy in one dominator-tree value-numbering
traversal: a scoped hash table maps each pure instruction's key
`(op, result type, immediate, canonicalized operands)` to the value that first
computed it. Because blocks are visited in dominator-tree preorder, the table
holds exactly the definitions that dominate the current block — its own earlier
instructions plus those of dominating blocks — so a match is always a dominating
value, making the redirect dominance-safe. Entries a block inserts are removed
when its whole subtree is done.

Only **pure** (`Effects::PURE`) instructions that have at least one operand and
whose result is `NonHeap` or `Persistent` are eligible: purity makes the value a
function of its operands alone (no memory/state dependence, no fault), and the
ownership restriction keeps the rewrite refcount-neutral — the same value class
dead-instruction elimination is allowed to drop. Since SSA operands are
equal-by-value, identical pure ops on identical operand values compute identical
results. Nullary constant and address materializations (`const_*`, `data_addr`)
are deliberately not deduplicated: they are cheaper to rematerialize at each use
than to keep live across the span, so CSE only targets computations.
Functions with exception handlers are skipped: their handler blocks are reachable
through implicit edges absent from the terminator graph, so a terminator-graph
dominator can be bypassed at runtime by a throw, which would make a cross-block
redirect unsound — the same restriction branch simplification uses. CSE uses the
[Dominance Analysis](#dominance-analysis) and shares
`cfg::has_exception_handlers` with branch simplification.

### Loop-Invariant Code Motion

The fifth registered transform (`src/ir_passes/licm.rs`) moves a pure computation
whose operands do not change across a loop out of the loop body into the loop
preheader, so it runs once instead of per iteration. It builds the
[loop forest](#loop-analysis) on the [dominator tree](#dominance-analysis), then
for each loop grows the invariant set to a fixed point: an instruction is
invariant when each operand is defined by another instruction being hoisted from
the same loop or has a definition that dominates the preheader.

Only **pure** (`Effects::PURE`) instructions with at least one operand and a
`NonHeap`/`Persistent` result are eligible — purity means the value depends only
on the operands and the op neither reads mutable state nor faults, so evaluating
it once in the preheader, unconditionally even when its original block ran only on
some iterations, is safe (no speculation hazard); the ownership bound keeps the
move refcount-neutral. Nullary constant/address materializations are not hoisted
(rematerializing them is cheaper than keeping them live across the loop). Loops
are processed innermost-first with moves applied immediately, so a value invariant
in several nested loops reaches the outermost preheader in one run. Instructions
are relocated between blocks' instruction lists and their result `ValueDef`s
(block + index) are recomputed once at the end so the value table matches the new
layout. Loops without a detected preheader, and functions with exception
handlers, are skipped. (PHP loop variables live in local slots reloaded through
impure `load_local`, so an invariant source expression is not yet hoistable; the
pass's reach grows as more values flow as SSA across loops.)

### Dead Instruction Elimination

The sixth registered transform (`src/ir_passes/dead_inst.rs`) removes
result-producing instructions whose values are not live over the CFG and whose
effect metadata says they are pure. It computes liveness with successor live-in
sets, initializes each block's backward walk with those live-out values plus
terminator uses, and then neutralizes dead instructions to `nop`.

Neutralization preserves instruction/result value table slots, so the validator
does not need value renumbering or block-list surgery. Read-only, allocation,
mutation, refcounting, output, warning, fatal, throw, and deopt-capable
instructions stay intact; dead read elimination is deferred until a later pass
can prove equivalent PHP and ownership behavior. Dead chains in one block
collapse during the backward walk; chains that cross block boundaries converge
through the fixed-point pass driver after liveness is recomputed.