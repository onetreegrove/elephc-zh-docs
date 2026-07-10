**Status:** EIR is the default user-facing backend. The diagnostic `--emit-ir`
path lowers the checked and optimized AST into validated textual EIR, and the
normal executable/cdylib path lowers that same EIR into assembly. The legacy
AST backend remains available only as the temporary `--ast-backend` fallback.

**Implementation phases:** `.plans/eir-*.md`

**Authoritative source audit for this spec:**

- `src/types/model.rs`
- `src/parser/ast/expr.rs`
- `src/parser/ast/stmt.rs`
- `src/parser/ast/operators.rs`
- `src/parser/ast/types.rs`
- `src/parser/ast/oop.rs`
- `src/parser/ast/ffi.rs`
- `src/ir/`
- `src/ir_lower/`
- `src/codegen_ir/`
- `src/codegen/expr.rs` and `src/codegen/expr/`
- `src/codegen/stmt.rs` and `src/codegen/stmt/`
- `src/codegen/functions/locals.rs`
- `src/codegen/context.rs`
- `src/codegen/builtins/`
- `src/codegen/runtime/emitters.rs`
- `src/optimize/effects.rs` and `src/optimize/effects/`

EIR is elephc's intermediate representation. It sits between the AST-level
optimizer and the assembly emitter, giving the compiler a function-wide
control-flow and value model without replacing the hand-written assembly
backend.

EIR is intentionally PHP-shaped. Arrays, hashes, Mixed boxing, callable
descriptors, copy-on-write checks, fatal paths, exception paths, runtime calls,
and exact source evaluation order are first-class compiler concepts. EIR is not
a generic LLVM- or Cranelift-style IR.

## Historical Design Boundary

The first roadmap item originally covered this document only:

```text
EIR design specification (`docs/internals/the-ir.md`) - types, instructions,
terminators, effects, ownership, textual format
```

That first item did **not** include:

- EIR -> assembly backend
- `--ir-backend`
- register allocation
- IR optimization passes

That design-only milestone is complete. The current implementation has since
added `src/ir/`, `src/ir_lower/`, `--emit-ir`, and the default EIR assembly
backend under `src/codegen_ir/`. Register allocation and IR optimization passes
remain follow-up work.

## Pipeline Position

Current default production path:

```text
PHP source
  -> Lexer
  -> Parser
  -> Magic constants
  -> Conditional compilation
  -> Resolver
  -> NameResolver
  -> Autoload insertion
  -> AST constant folding
  -> Type checker / warnings
  -> AST optimizer passes
  -> AST -> EIR lowering
  -> EIR validation
  -> EIR optimization passes (fixed-point driver)
  -> EIR -> assembly backend
  -> runtime cache
  -> assembler / linker
  -> binary
```

Temporary legacy fallback path (`--ast-backend`):

```text
PHP source
  -> Lexer
  -> Parser
  -> Magic constants
  -> Conditional compilation
  -> Resolver
  -> NameResolver
  -> Autoload insertion
  -> AST constant folding
  -> Type checker / warnings
  -> AST optimizer passes
  -> AST -> assembly codegen
  -> runtime cache
  -> assembler / linker
  -> binary
```

The AST optimizer remains in front of EIR. It handles PHP-preserving rewrites
that are naturally expressed over syntax: constant folding, local scalar
propagation, control-flow pruning, control-flow normalization, and DCE. EIR
adds what the AST cannot express well: value identity, basic blocks, block
parameters, liveness, dominance, register placement, CSE, LICM, and inlining.

## Backend Selection

The compiler currently supports two assembly backends:

- EIR backend, selected by default and also by explicit `--ir-backend`
- legacy AST backend, selected only by `--ast-backend`

`--ast-backend` is a deprecated escape hatch while the legacy emitter remains
in-tree. It emits a warning and will be removed after the default EIR path has
completed its validation window. EIR preserves the existing hand-written assembly
style and adds linear-scan register allocation plus a fixed-point IR optimization
pass driver (see [Optimization Passes](#optimization-passes)); further IR passes
are incremental follow-up work.

## Design Invariants

- EIR preserves PHP source evaluation order separately from ABI parameter order.
- EIR values are SSA: each value is defined exactly once.
- Blocks use block parameters instead of phi nodes.
- PHP runtime concepts remain explicit: `Mixed`, COW arrays/hashes, callables,
  exception/fatal behavior, and ownership operations are not hidden inside a
  generic "call".
- EIR is target-aware through metadata and the selected `Target`, but it does
  not hardcode ARM64/x86_64 register names or stack layouts.
- `src/codegen/abi/` remains authoritative for physical ABI lowering.
- Runtime helpers remain outside the EIR `Module`; EIR references them through
  `RuntimeCall` or specialized opcodes.
- Source spans must survive lowering for diagnostics, source maps, and `--emit-ir`
  readability.
- Builder-created effect summaries are conservative. A pass may refine effects
  only when it can prove PHP-visible behavior is preserved.

## Type System

EIR uses a small storage lattice. PHP type details that share the same storage
class are preserved in `Value.php_type` and opcode metadata.

```rust
pub enum IrType {
    I64,
    F64,
    Str,
    Heap(IrHeapKind),
    Void,
}

pub enum IrHeapKind {
    Array,
    Hash,
    Object(String),
    Mixed,
    Iterable,
    Union,
    Buffer(Box<PhpType>),
    Packed(String),
}
```

`IrType` is a storage contract, not a replacement for `PhpType`. Every value
also carries the original or inferred PHP type:

```rust
pub struct Value {
    pub ir_type: IrType,
    pub php_type: PhpType,
    pub def: ValueDef,
    pub ownership: Ownership,
}
```

### PHP Type Mapping

| `PhpType` | `IrType` | Notes |
|---|---|---|
| `Int` | `I64` | Signed 64-bit integer storage. |
| `Float` | `F64` | 64-bit floating-point storage. |
| `Str` | `Str` | `(ptr, len)` pair; ownership may be transient, owned, borrowed, or persistent. |
| `Bool` | `I64` | `0` or `1`, with `php_type = Bool`. |
| `Void` | `Void` when no value is materialized; `I64` null sentinel only when a null value is stored or boxed. |
| `Never` | `Void` | Never materialized; produced paths end in `Return`, `Throw`, `Fatal`, or `Unreachable`. |
| `Iterable` | `Heap(Iterable)` | Type-erased array or traversable object pointer. |
| `Mixed` | `Heap(Mixed)` | Pointer to runtime tagged Mixed cell. |
| `Array(inner)` | `Heap(Array)` | Indexed array heap object; element type stays in `php_type`. |
| `AssocArray { key, value }` | `Heap(Hash)` | Hash table heap object; key/value types stay in `php_type`. |
| `Buffer(inner)` | `Heap(Buffer(inner))` | Fixed-size elephc buffer header; not PHP array COW storage. |
| `Callable` | `I64` | Callable descriptor address; ownership is tracked separately and released via callable descriptor runtime. |
| `Object(name)` | `Heap(Object(name))` | Runtime object pointer and class metadata. |
| `Packed(name)` | `Heap(Packed(name))` | Pointer/layout handle for packed POD data. |
| `Pointer(tag)` | `I64` | Raw native pointer; optional type tag remains in `php_type`. |
| `Resource(kind)` | `I64` | Runtime/native resource handle; optional kind remains in `php_type`. |
| `Union(members)` | `Heap(Union)` | Runtime representation is boxed like `Mixed`; member set stays in `php_type`. |

`Callable`, `Str`, and refcounted heap values can be owned even when their
storage type is not `Heap(...)`. Ownership is a separate value property.

### Parsed Type Expressions

`TypeExpr` maps into `PhpType` during type checking before EIR lowering. EIR
does not store syntactic type expressions except where metadata needs to point
back to a source declaration.

| `TypeExpr` | EIR relevance |
|---|---|
| `Int`, `Float`, `Bool`, `Str`, `Void`, `Never`, `Iterable` | Lower through the resolved `PhpType`. |
| `Ptr(Option<Name>)` | Lowers to `PhpType::Pointer(_)`, then `IrType::I64`. |
| `Buffer(inner)` | Lowers to `PhpType::Buffer(_)`, then `Heap(Buffer(_))`. |
| `Named(name)` | Resolved to object, packed class, enum, interface-compatible object, or builtin type before EIR. |
| `Nullable(inner)` | Lowered as `Union([inner, Void])` or the checker-approved nullable runtime shape. |
| `Union(members)` | Lowered as `PhpType::Union(_)`, represented as `Heap(Union)`. |

### C Type Mapping

Extern declarations use `CType`. EIR preserves the C-facing type in
`ExternDecl` metadata so the IR backend can use the correct C ABI helpers.

| `CType` | EIR storage |
|---|---|
| `Int`, `Bool`, `Ptr`, `TypedPtr(_)`, `Callable` | `I64` |
| `Float` | `F64` |
| `Str` | `I64` native C string pointer; PHP strings are converted at the boundary. |
| `Void` | `Void` |

## Module Structure

```rust
pub struct Module {
    pub target: Target,
    pub functions: Vec<Function>,
    pub class_methods: Vec<Function>,
    pub closures: Vec<Function>,
    pub fiber_wrappers: Vec<Function>,
    pub callback_wrappers: Vec<Function>,
    pub extern_callback_trampolines: Vec<Function>,
    pub runtime_callable_invokers: Vec<Function>,
    pub data: DataPool,
    pub extern_decls: Vec<ExternDecl>,
    pub class_table: ClassTable,
    pub enum_table: EnumTable,
    pub interface_table: InterfaceTable,
    pub packed_layouts: PackedLayoutTable,
    pub required_runtime_features: RuntimeFeatures,
}
```

The separate function vectors mirror current deferred codegen surfaces in
`src/codegen/context.rs`: closures, fiber wrappers, callback wrappers, extern
callback trampolines, and runtime callable invokers. Phase 02 may store them in
one `functions` vector with flags, but the semantic distinction must remain
representable.

```rust
pub struct Function {
    pub id: FunctionId,
    pub name: String,
    pub params: Vec<FunctionParam>,
    pub return_type: IrType,
    pub return_php_type: PhpType,
    pub locals: Vec<LocalSlot>,
    pub blocks: Vec<BasicBlock>,
    pub values: Vec<Value>,
    pub instructions: Vec<Instruction>,
    pub entry: BlockId,
    pub source_signature: Option<FunctionSigRef>,
    pub flags: FunctionFlags,
}

pub struct BasicBlock {
    pub id: BlockId,
    pub name: String,
    pub params: Vec<ValueId>,
    pub instructions: Vec<InstId>,
    pub terminator: Terminator,
}

pub struct LocalSlot {
    pub name: Option<String>,
    pub ir_type: IrType,
    pub php_type: PhpType,
    pub kind: LocalKind,
}

pub enum LocalKind {
    PhpLocal,
    GlobalAlias,
    StaticLocal,
    RefCell,
    HiddenTemp,
    TryHandler,
    ClosureCapture,
    NamedArgTemp,
    IteratorState,
    GeneratorState,
}
```

`LocalSlot` exists even in SSA form because PHP locals, globals, statics,
references, try handlers, and hidden temporaries have addressable storage or
observable lifetime behavior.

## Value Ownership

Ownership mirrors the current `HeapOwnership` model but is attached to every
SSA value, not only context locals.

```rust
pub enum Ownership {
    NonHeap,
    Owned,
    Borrowed,
    MaybeOwned,
    Persistent,
    Moved,
}
```

| State | Meaning |
|---|---|
| `NonHeap` | Plain scalar or native handle with no release operation. |
| `Owned` | The value owns cleanup responsibility. |
| `Borrowed` | The value aliases storage owned elsewhere. |
| `MaybeOwned` | CFG merge or dynamic path where ownership must be resolved before cleanup. |
| `Persistent` | Static data, interned/static string, or runtime-persistent value that must not be released. |
| `Moved` | Value has transferred ownership and cannot be used again except by validator diagnostics. |

Ownership-producing operations:

| Operation | Ownership result |
|---|---|
| Scalar constants | `NonHeap` |
| Static string literal | `Persistent` unless persisted/copied into heap |
| Runtime allocation | `Owned` |
| Local/global/static load | Slot metadata determines `Owned`, `Borrowed`, or `MaybeOwned` |
| `Borrow(value)` | `Borrowed` |
| `Move(value)` | Transfers source to `Moved`, result keeps prior ownership |
| `Acquire(value)` | Produces or records an owned retain |
| `Return(owned)` | Transfers ownership to caller |

Ownership operations:

| Op | Operand | Result | Effects | Lowering |
|---|---|---|---|---|
| `Acquire` | refcounted/string/callable value | `Void` or retained value alias | `REFCOUNT_OP`, maybe `WRITES_HEAP` | `__rt_incref`, string persist/retain, callable descriptor retain if added |
| `Release` | owned value | `Void` | `REFCOUNT_OP`, maybe `WRITES_HEAP`, debug may fatal | `__rt_decref_any`, `__rt_heap_free_safe`, callable descriptor release |
| `Move` | any value | same type | pure validator operation | no machine instruction |
| `Borrow` | value with live owner | same type | pure validator operation | no machine instruction |
| `EnsureOwned` | maybe-owned value | same type | may branch, refcount effect | emits conditional retain/ownership normalization |

Strings are not modeled as generic heap pointers because their ABI is `(ptr,
len)`, but string ownership still participates in validator checks.