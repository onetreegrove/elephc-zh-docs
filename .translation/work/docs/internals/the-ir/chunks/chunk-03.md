### Externs, Pointers, Buffers, and Packed Data

| Op | Operands | Result | Effects |
|---|---|---|---|
| `PtrCast(target_type)` | pointer value | `I64` | pure type metadata change |
| `PtrRead(width)` | pointer | `I64` | `reads_heap`/native memory, `may_fatal` |
| `PtrWrite(width)` | pointer, value | `Void` | `writes_heap`/native memory, `may_fatal` |
| `PtrReadString`, `PtrWriteString` | pointer and string/len | string or int | native memory effects, maybe `alloc_heap`, `may_fatal` |
| `PtrOffset` | pointer, byte offset | `I64` pointer | pure arithmetic, but php_type tag preserved |
| `PtrCheckNonnull` | pointer | `Void` | `may_fatal` |
| `BufferNew(element_type, len)` | length | `Heap(Buffer)` | `alloc_heap`, `may_fatal` |
| `BufferLen` | buffer | `I64` | `reads_heap`, `may_fatal` on freed buffer |
| `BufferGet`, `BufferSet` | buffer, index, value | typed value or `Void` | `reads_heap`/`writes_heap`, bounds `may_fatal` |
| `BufferFree` | buffer | `Void` | `writes_heap`, `may_fatal` on invalid state |
| `PackedFieldGet`, `PackedFieldSet` | packed pointer, field metadata | typed value or `Void` | raw memory effects |
| `ExternGlobalLoad`, `ExternGlobalStore` | global metadata | typed value or `Void` | external state effects |

Pointer and extern memory effects are conservative because they can alias data
outside PHP's heap.

### Output, Diagnostics, Exceptions, Fibers, and Generators

| Op | Operands | Result | Effects |
|---|---|---|---|
| `EchoValue`, `PrintValue`, `WriteStdout` | value | `Void` or `I64` for print | `output`, value conversion effects |
| `VarDump`, `PrintR` | value | `Void` or string/int per builtin | `output` or `alloc_concat` |
| `ErrorSuppressBegin`, `ErrorSuppressEnd` | none | `Void` | diagnostic state effects |
| `Warn(message_id)` | args | `Void` | `may_warn`, `output`/diagnostic effect |
| `ThrowException` | exception object | terminator path | `may_throw`, `writes_global` exception state |
| `TryPushHandler`, `TryPopHandler` | handler slot metadata | `Void` | `writes_local`, `writes_global` exception stack |
| `CatchBind` | exception object, optional local | `Void` | `writes_local`, ownership transfer |
| `FinallyEnter`, `FinallyExit` | finally state | `Void` | control-flow bookkeeping effects |
| `FiberRuntimeCall` | helper, args | typed value | runtime effects, `may_throw`, `may_fatal` |
| `GeneratorNew` | frame metadata | `Heap(Object)` or generator handle | `alloc_heap` |
| `GeneratorYield` | key, value | suspend/resume value | `writes_heap`, `may_throw`, suspension effect |
| `GeneratorYieldFrom` | iterable | yielded values | iterator/generator effects |
| `GeneratorReturn` | value | `Void` | writes generator return state |

`Yield` and `YieldFrom` are not emitted through the normal expression result
path today. EIR must model them through generator state-machine lowering rather
than ordinary expression instructions.

### Include and Resolver Artifacts

| Op | Operands | Result | Effects |
|---|---|---|---|
| `IncludeOnceMark(label)` | none | `Void` | `writes_global` |
| `IncludeOnceGuard(label)` | none | branch condition | `reads_global`, `writes_global` |
| `FunctionVariantDispatch(group)` | none | `Void` | pure metadata for dispatcher emission |
| `FunctionVariantMark(name, variant)` | none | `Void` | `writes_global` marker state |

Plain `Include` should not reach EIR after resolver in normal operation. If it
does, lowering must produce a compiler error, not silently emit incomplete IR.

## Terminators

Every block ends with exactly one terminator. Terminators own control-flow
effects that cannot be represented by an instruction followed by a fallthrough.

```rust
pub enum Terminator {
    Br { target: BlockId, args: Vec<ValueId> },
    CondBr {
        cond: ValueId,
        then_target: BlockId,
        then_args: Vec<ValueId>,
        else_target: BlockId,
        else_args: Vec<ValueId>,
    },
    Switch {
        scrutinee: ValueId,
        cases: Vec<SwitchCase>,
        default: BlockId,
        default_args: Vec<ValueId>,
    },
    Return { value: Option<ValueId> },
    Throw { value: ValueId },
    Fatal { message: DataId },
    GeneratorSuspend {
        key: Option<ValueId>,
        value: Option<ValueId>,
        resume: BlockId,
        resume_args: Vec<ValueId>,
    },
    Unreachable,
}
```

| Terminator | Rules |
|---|---|
| `Br` | Destination arg count and types must match destination block params. |
| `CondBr` | `cond` must be `I64` bool/truthiness value. Both destinations receive matching args. |
| `Switch` | Cases preserve PHP `switch`/`match` semantics. Fallthrough for `switch` is represented by block structure, not implicit terminator behavior. |
| `Return` | Transfers ownership of returned owned value to caller. `Never` functions cannot return normally. |
| `Throw` | Transfers exception object to runtime exception state and does not fall through. |
| `Fatal` | Ends program path; no cleanup after fatal unless explicitly represented before it. |
| `GeneratorSuspend` | Captures generator frame state and resumes at `resume`. |
| `Unreachable` | Only allowed after proof from `Never`, fatal, throw, or impossible branch. |

`try`/`catch`/`finally` is represented as explicit handler instructions and CFG
edges to landing blocks. The validator treats active exception regions as part
of the control-flow contract.

## Textual Format

The textual format is printer-only. It is for `--emit-ir`, tests, debugging,
and review. There is no parser requirement in the v0.24.x track.

Required properties:

- deterministic function order
- deterministic block order
- stable value numbering per function
- source spans shown when available
- effects printed when non-pure
- ownership printed for values whose ownership is not obvious
- heap subkind and PHP type shown for heap/boxed values

## Using `--emit-ir`

`--emit-ir` is a diagnostic output mode:

```bash
cargo run -- --emit-ir examples/hello/main.php
```

The compiler runs the normal frontend order through type checking and AST
optimization, lowers the optimized AST to EIR, validates the module, prints the
textual format to stdout, and exits before runtime-cache preparation,
assembly generation, assembling, or linking.

`--emit-ir`, `--emit-asm`, and `--check` are mutually exclusive because each is
a terminal output mode for the same source file.

Example:

```eir
module target=macos-aarch64 {
  data str[0] = "hello\n"

  function main() -> Void flags(main) {
    entry:
      v0: Str php=string own=persistent = const_str str[0]
      echo v0                              ; effects: output
      return
  }
}
```

Example with block parameters:

```eir
function sum_to(p0: I64 php=int) -> I64 {
  entry:
    v0: I64 php=int = const_i64 0
    v1: I64 php=int = const_i64 1
    br loop(v1, v0)

  loop(i: I64 php=int, acc: I64 php=int):
    v2: I64 php=bool = icmp sle i, p0
    cond_br v2, body(i, acc), exit(acc)

  body(i: I64 php=int, acc: I64 php=int):
    v3: I64 php=int = iadd acc, i
    v4: I64 php=int = iadd i, 1
    br loop(v4, v3)

  exit(result: I64 php=int):
    return result
}
```

Textual syntax requirements:

- Function header: `function <name>(params) -> <IrType> flags(...)`.
- Block header: `<label>(params):`.
- Instruction: `vN: <IrType> php=<PhpType> own=<Ownership> = <op> ...`.
- Void instruction: `<op> ...`.
- Terminator: `return`, `br`, `cond_br`, `switch`, `throw`, `fatal`,
  `generator_suspend`, or `unreachable`.
- Effects comment: `; effects: reads_heap, writes_heap, may_throw`.
- Source span comment: `; span: line:col`.

## Validator

Validation has two modes:

- **Structural mode:** cheap, runs after builder operations and after every pass.
- **Full mode:** structural + dominance + ownership + effects, runs before
  printing for tests and before EIR backend codegen.

### Structural Rules

1. Every block belongs to exactly one function.
2. Every block has exactly one terminator.
3. Terminators appear only as the block terminator.
4. Every `ValueId` is defined exactly once.
5. Every `InstId` belongs to exactly one block.
6. Every operand references an existing value in the same function.
7. Every use is dominated by its definition, unless the value is a destination
   block parameter supplied by all incoming branches.
8. Destination block argument count matches destination block parameter count.
9. Destination block argument types match destination block parameter types.
10. Entry block has no block parameters.
11. `IrType` and `php_type` are compatible for every value.
12. Void instructions cannot be used as operands.
13. `Never`-typed PHP operations end in non-returning control flow.

### Opcode Rules

1. Integer ops accept `I64` operands only.
2. Float ops accept `F64` operands only.
3. String ops accept `Str` operands only unless the opcode explicitly casts.
4. Array ops require `Heap(Array)`.
5. Hash ops require `Heap(Hash)`.
6. Object property ops require `Heap(Object(_))`, `Heap(Mixed)`, or a dynamic
   receiver opcode that can validate at runtime.
7. Mixed ops require `Heap(Mixed)` or `Heap(Union)`.
8. Callable descriptor ops require `PhpType::Callable` metadata even when the
   storage type is `I64`.
9. Pointer ops require `PhpType::Pointer(_)` metadata.
10. Buffer ops require `Heap(Buffer(_))`.

### Ownership Rules

1. Every owned value is consumed exactly once on each reachable path.
2. `Release`, `Move`, and `Return` consume ownership.
3. Returning an owned value transfers ownership to the caller.
4. Returning a borrowed value requires an `Acquire` before `Return`.
5. `Borrow` must not outlive the source owner.
6. `Moved` values cannot be read.
7. `Persistent` values cannot be released.
8. CFG joins must merge ownership explicitly. If incoming ownership states do
   not match, the joined value is `MaybeOwned`.
9. `MaybeOwned` values must be resolved before unconditional cleanup.
10. Exception, early return, break, continue, fatal, and generator suspend paths
    must have balanced cleanup for values whose cleanup is still required.

### Effect Rules

1. Pure operations may not set hidden memory, output, diagnostic, allocation, or
   control-flow effects.
2. Operations with `output`, `may_warn`, `may_throw`, `may_fatal`, `writes_*`,
   `alloc_*`, or `refcount_op` are observable.
3. Passes cannot move `may_throw` or `may_fatal` operations across other
   observable operations unless they prove equivalent PHP behavior.
4. `alloc_concat` operations cannot cross statement-boundary concat resets.
5. `writes_global` invalidates assumptions about globals, statics, runtime
   global symbols, JSON error state, and include-once/function-variant state.
6. `writes_heap` invalidates reads of possibly aliasing arrays, hashes, objects,
   mixed cells, iterators, buffers, generators, fibers, and callable descriptors.

## Optimization Passes

After lowering and the one-shot module validation, EIR runs a fixed-point pass
driver (`src/ir_passes/driver.rs`) before codegen. The driver is where
IR-level transformations live — the rewrites the AST optimizer could not express
because they need value identity, basic blocks, or dominance.

A pass implements the `IrPass` trait: a stable `name()` and a
`run(&mut Function, &mut DataPool) -> bool` that mutates the function in place and
reports whether it changed anything. The `DataPool` is the module's shared
literal pool, threaded through so passes that materialize new constants (the
peephole string-literal fold interns the joined string) can do so; passes that
need no new literals ignore it. The driver runs the registered passes over each
function-like body (functions, methods, closures, trampolines, invokers)
repeatedly until a full sweep reports no change, capped at a fixed iteration
budget.

The whole pipeline runs to a **module-level fixed point**: `optimize_module`
interleaves the cross-function [small-function inliner](#small-function-inlining)
with these per-function passes and repeats the round until neither layer changes
anything (capped by a separate module-iteration budget). Interleaving lets the two
feed each other — inlined bodies expose new constants and dead code for the
per-function passes, and the simplified functions expose new (smaller) inline
candidates. The first round reproduces the prior "inline once, then optimize"
behavior, so later rounds only optimize further and never change semantics.

In debug and test builds (`debug_assertions`), the driver re-validates the
function with `validate_function` after every pass and panics — naming the
offending pass — if any pass produced malformed IR. The same builds panic if a
pass set fails to converge within the cap, which only happens for a
non-converging pass bug. Both guards compile out of `--release`, where hitting
the cap simply stops and proceeds with the current IR.

Mutating passes share the use-rewriting helper `replace_all_uses`
(`src/ir_passes/rewrite.rs`), which redirects every *use* of a value — across
instruction operands and all terminator slots — to a replacement, leaving
definitions (block parameters and instruction results) untouched.