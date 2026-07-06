### Dead Store Elimination

The seventh registered transform (`src/ir_passes/dead_store.rs`) removes
`store_local` instructions whose stored value is never read on any path before
the slot is overwritten or the function exits. Unlike dead instruction
elimination, which works at SSA-value granularity, this pass reasons about local
*slots*: it runs a backward dataflow that gens a slot at each `load_local` and
kills it at each `store_local`, iterating to a fixed point so live-out is the
union of successor live-in sets. A store is dead when its slot is not live
immediately after it, so an earlier store with no intervening read also dies.

The pass is restricted to slots that are (1) ordinary `PhpLocal`s, (2) of a
non-refcounted storage type (`!php_type_needs_lifetime_tracking`), (3) named only
by plain `load_local`/`store_local`, and (4) never address-escaped by reference.
The refcounting restriction is the key correctness boundary: assignment lowering
wraps a refcounted slot's store with separate `acquire`/`release` instructions
and releases the prior occupant, so dropping the `store_local` alone would leak
the acquired value. Scalar slots carry no such ownership ops and their scope-exit
cleanup is a no-op, so removing a dead scalar store is refcount-neutral. Any other
slot-naming op (ref-cell promote/alias/release, `unset_local`, static-local or
global access) makes a slot ineligible because it could read or alias the slot in
a way the pass does not model.

Condition (4) is subtle: a by-reference call argument (`new Box($v)` for a
`public int &$value` constructor) or a by-reference closure capture
(`use (&$x)`) is lowered as an ordinary `load_local`, and codegen later resolves
that argument value back to its defining `load_local` and passes the slot's
*address* — so the callee reads or mutates the slot through an alias that forward
`load_local`-only liveness cannot see. Because a single-function pass has no
callee signatures (which parameters are by-reference), the pass uses a
conservative default-deny allowlist: a slot is excluded whenever any of its
`load_local` results is consumed by an instruction that is not a proven
value-only consumer (arithmetic, comparison, cast, output, store, string, or
refcount op). Every call, object construction, closure capture, property/array
access, and any future opcode is treated as a possible by-reference escape.
Feeding a load into a value-only op first is safe because codegen only traces a
*direct* `load_local` back to a slot.

This complements the peephole pass's per-block, value-equality store forwarding
(which drops a store of the value already resident): dead store elimination is
liveness-based and crosses block boundaries, so it removes a store of a
*different* value whose result is never observed. Stores are neutralized to
`nop`; a pure value left feeding a removed store is then cleaned up by dead
instruction elimination on a later driver sweep.

### Branch Simplification

The eighth registered transform (`src/ir_passes/branch_simplify.rs`) prunes the
CFG in three ways:

- **Constant-condition folding** — a `cond_br` whose condition resolves to a
  constant (`const_bool`, `const_i64` via PHP truthiness, or `const_null`) becomes
  an unconditional `br` to the taken edge. A `switch` on a `const_i64`/`const_bool`
  scrutinee folds to a `br` to the matching case (or the default). A `while (true)`
  loop, for example, lowers to a constant `cond_br` that this fold collapses.
- **Empty-block jump threading** — a non-entry block with no parameters and only
  `nop` instructions that ends in an unconditional `br` is a forwarding block.
  Edges targeting it are redirected to the end of the forwarding chain (with cycle
  detection). Because forwarding blocks have no parameters, every edge into them
  carries empty arguments, so retargeting needs no argument rewriting.
- **Unreachable-block neutralization** — blocks no longer reachable from the entry
  have their terminator set to `Unreachable` and their instructions rewritten to
  `nop`.

Like the other passes, unreachable blocks are neutralized **in place** rather than
physically removed. The validator requires `block.id == index` and reports any
*use* in an unreachable block as `UseNotDominated` (an unreachable block's
dominator set collapses to itself). Neutralizing clears every use — terminator
and instruction operands — so the block stays valid, while the block, value, and
instruction table slots keep their indices. This avoids renumbering and, crucially,
keeps `try` handler block-id tokens (encoded in `try_push_handler` immediates)
correct. Functions that use any exception-handling opcode are skipped wholesale,
because their handler blocks are reachable through implicit edges absent from the
terminator graph, so terminator-only reachability could wrongly neutralize a live
handler. Removing edges only enlarges dominator sets and threaded forwarding blocks
carry no definitions, so simplification never invalidates a use that was valid
before; cross-block cascades converge through the fixed-point driver.

### Small-Function Inlining

`src/ir_passes/inline.rs` is a **cross-function**, module-level pass (not a member
of the per-function `IrPass` set) that splices a small callee's body into its
caller at the call site. The original call is removed; the callee's blocks are
transplanted with fresh ids, arguments are bound into the remapped parameter slots
with `store_local`, the caller block jumps into the transplanted entry, and each
callee `return` becomes a `br` to a fresh continuation block that carries the
result through a block parameter.

A callee is inlined only when it is at most **24** non-`nop` instructions, has a
0-parameter entry block, contains no exception-handling ops, is not a
generator/fiber wrapper, and is **non-recursive** — directly or mutually, via a
call-graph cycle analysis that excludes any function reachable from itself (a
per-caller fuel cap backstops termination). Eligibility is further restricted to a
provably ownership-safe **destructor-free** boundary and body (scalars, strings,
and arrays/unions of destructor-free types; no by-ref/variadic params and no
ref-cell/static/global/capture locals).

Correctness across the boundary is preserved without an explicit epilogue: the
splice replaces `return` with `br`, bypassing the callee's implicit codegen
epilogue cleanup, so the transplant reproduces that cleanup's per-slot decisions —
parameter slots and directly-returned slots become epilogue-excluded `HiddenTemp`
(matching the callee, whose argument is borrowed and whose return ownership is
moved to the caller), while ordinary refcounted internal locals stay `PhpLocal` and
are still freed by the host epilogue. The destructor-free restriction makes the one
residual difference — deferring those internal frees to the host epilogue —
unobservable (no `__destruct`, no array identity), so reference-counting and
copy-on-write behaviour are byte-for-byte preserved. Two call-site guards complete
correctness: arguments must bind to parameter slots without coercion (matching
storage types, so spread/named-boxed-`mixed` and `int`↔`float` sites stay ordinary
calls), and any `string` argument must come from a non-scratch source
(`const_str`/`load_local`), because the spliced body runs the callee's
statement-boundary concat-buffer reset in the host frame and would otherwise free an
in-flight scratch string argument. Call-site name resolution (`call` Data immediates
and `function_variant_call` include-variant refs) uses snapshots taken before
mutation, so the rewrite loop never aliases the module while holding a function.

## Dominance Analysis

`src/ir_passes/dominance.rs` is a read-only sidecar analysis (like liveness, not
a driver transform) that builds each function's dominator tree, the foundation
for the dominance-aware cross-block passes that follow (common-subexpression
elimination, natural-loop detection, loop-invariant code motion).

`compute_dominance` uses the Cooper–Harvey–Kennedy iterative algorithm: it walks
reachable blocks in reverse postorder and recomputes each block's immediate
dominator as the intersection of its already-processed predecessors' idoms — a
two-finger walk over postorder numbers — until a fixed point. It converges for
arbitrary CFGs and is fast on the small functions EIR produces.

The resulting `DominanceInfo` answers `immediate_dominator`, reflexive
`dominates` / `strictly_dominates`, dominator-tree `children` (top-down
traversal), `nearest_common_dominator`, and `is_reachable`. Only blocks reachable
from the entry participate; unreachable blocks (which branch simplification
neutralizes in place but leaves in the table) are excluded from the tree and
answer `false`/`None`. The internal idom table is self-rooted at the entry so the
intersect and dominance walks terminate without special cases. The analysis uses
the shared `cfg::predecessors` helper.

## Loop Analysis

`src/ir_passes/loops.rs` is a read-only sidecar analysis that builds the
function's natural-loop forest on top of the dominator tree, the foundation for
loop-invariant code motion and other loop optimizations.

`compute_loops(func, &dominance)` first finds **back edges** — CFG edges
`latch -> header` whose target dominates their source — so loop detection is a
thin layer over dominance. Back edges sharing one header form a single
[`NaturalLoop`] with multiple latches. The loop body is the header plus every
block that can reach a latch without passing through the header, found by a
backward walk over reachable predecessors that stops at the header.

Each `NaturalLoop` exposes its `header`, `latches`, sorted `blocks` (with a
binary-search `contains`), `parent` and `depth` in the nesting forest, and its
`preheader`. **Nesting** is by block-set containment: loop `A` is nested in `B`
when `A`'s header lies in `B`'s body, and the immediate parent is the smallest
such `B`; the lowerer emits reducible CFGs, so loops are properly nested or
disjoint. `LoopInfo` additionally answers `innermost_loop`, `loop_depth`,
`is_loop_header`, and `back_edges` per block/function.

A **preheader** is detected as the unique reachable out-of-loop predecessor of
the header whose only successor is the header. PHP loops lower to slot-based CFGs
(the loop variable lives in a local slot, not a block parameter), so the init
block that branches into the header is a natural preheader; when entry into the
loop is shared between blocks or conditional, no preheader exists and an
optimization that needs one inserts it.

## AST Lowering Catalogue

Lowering must cover every variant in `src/parser/ast/expr.rs` and
`src/parser/ast/stmt.rs`. The catalogue below is exhaustive for the current
source tree.