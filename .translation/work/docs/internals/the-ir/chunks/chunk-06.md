### Supporting AST Metadata

These supporting AST enums and records do not always lower to standalone EIR
instructions, but they must be represented in metadata or consumed by lowering.

| AST surface | EIR contract |
|---|---|
| `MagicConstant::Dir`, `File`, `Function`, `Class`, `Method`, `Namespace`, `Trait` | Must be lowered before EIR to ordinary constants. Raw `MagicConstant` values are rejected by the validator. |
| `CastType::Int`, `Float`, `String`, `Bool`, `Array` | Selects `Cast(to_php_type)` or a specific scalar/string/array conversion opcode. |
| `StaticReceiver::Named`, `Self_`, `Static`, `Parent` | Stored in receiver metadata. `Named`, `Self_`, and `Parent` usually resolve before backend lowering; `Static` may require late-static runtime behavior. |
| `InstanceOfTarget::Name` | Fixed class/interface target metadata. |
| `InstanceOfTarget::Expr` | Dynamic target expression; emits runtime class-string/object target checks. |
| `CallableTarget::Function` | First-class callable or callable-array metadata for a function. |
| `CallableTarget::StaticMethod` | First-class callable or callable-array metadata for a static method and receiver. |
| `CallableTarget::Method` | First-class callable metadata for an object-bound method. |
| `UseKind::Class`, `Function`, `Const` | Name resolver consumes these before EIR; residual `UseDecl` is metadata/no-op. |
| `AttributeGroup` / `Attribute` | Carried on declaration metadata for reflection/attribute builtins; attribute argument expressions lower as metadata values where needed. |
| `EnumCaseDecl` | Enum metadata plus optional scalar/object case value. |
| `TraitUse` / `TraitAdaptation` | Type checking/name resolution flatten traits before EIR method lowering; metadata can be retained for diagnostics. |
| `ClassProperty` / `PropertyHooks` | Class metadata, property layout, readonly/final/static flags, hooks, defaults, and attributes. |
| `ClassConst` | Class/interface/trait constant metadata and value expression. |
| `ClassMethod` | Separate `Function` plus method metadata and vtable/static dispatch metadata. |
| `CType::Int`, `Float`, `Str`, `Bool`, `Void`, `Ptr`, `TypedPtr`, `Callable` | Extern ABI metadata consumed by `ExternCall`, extern globals, and callback trampolines. |
| `ExternParam` | Extern function parameter metadata. |
| `ExternField` | Extern class/struct field offset/type metadata. |
| `PackedField` | Packed class field offset/type metadata. |

### Expression Variants

| `ExprKind` | Lowering contract |
|---|---|
| `StringLiteral` | `ConstStr`; ownership `Persistent`; source span retained. |
| `IntLiteral` | `ConstI64`; `php_type = Int`. |
| `FloatLiteral` | `ConstF64`; data pool entry for exact bits. |
| `Variable` | `LoadLocal`, `LoadGlobal`, `LoadStaticLocal`, or ref-cell load depending on resolved storage. |
| `BinaryOp` | Lower left then right in source order; dispatch by `BinOp` and operand PHP types. |
| `InstanceOf` | Lower value and target; fixed target uses metadata, expression target uses dynamic class-string/runtime lookup. |
| `BoolLiteral` | `ConstBool`; `php_type = Bool`. |
| `Null` | `ConstNull`; materialized as PHP null sentinel or void context. |
| `Negate` | Lower inner; emit `INeg`, `FNeg`, or mixed numeric conversion/op. |
| `Not` | Lower inner; emit truthiness conversion and boolean negation. |
| `BitNot` | Lower inner; emit integer/string/mixed bit-not semantics. |
| `Throw` | Lower exception expression; emit `Throw` terminator or `ThrowException` path. |
| `ErrorSuppress` | Emit suppress begin/end around inner expression; preserve inner result and effects except diagnostics. |
| `Print` | Lower value, write stdout, return `ConstI64(1)`. |
| `NullCoalesce` | Build null-check CFG preserving short-circuiting. |
| `Pipe` | Lower value first, then callable expression, then single-argument call. |
| `Assignment` | Lower prelude, write target exactly once, preserve expression result via `result_target`/temp when present. |
| `PreIncrement` | Load local, increment, store, return new value. |
| `PostIncrement` | Load local, save old value, increment, store, return old value. |
| `PreDecrement` | Load local, decrement, store, return new value. |
| `PostDecrement` | Load local, save old value, decrement, store, return old value. |
| `FunctionCall` | If extern: `ExternCall`; if builtin: `BuiltinCall`; otherwise `Call`/variant dispatch after shared argument planning. |
| `ArrayLiteral` | Allocate indexed array and insert elements in source order, including spread handling. |
| `ArrayLiteralAssoc` | Allocate hash table and insert key/value pairs in source order; empty hash keeps mixed key/value metadata. |
| `Match` | Lower subject once; build strict-comparison arm CFG; default absence may `Fatal` via match-unhandled runtime. |
| `ArrayAccess` | Lower base/index; dispatch to array/hash/mixed/object ArrayAccess/buffer access as type requires. |
| `Ternary` | Lower condition, then branch CFG; result block joins branch values. |
| `ShortTernary` | Lower value once; truthy path reuses value; false path lowers default. |
| `Cast` | Lower expression then emit `Cast`/specific conversion op. |
| `Closure` | Emit callable descriptor, capture metadata, and deferred closure function body. |
| `NamedArg` | Consumed by call argument planning; standalone lowering lowers `value` only for diagnostics/fallback. |
| `Spread` | Consumed by call/array literal lowering; standalone lowering lowers inner expression only for diagnostics/fallback. |
| `ClosureCall` | Load callable local/descriptor and emit closure/descriptor invocation. |
| `ExprCall` | Lower callee expression once; dispatch runtime string, callable array, callable descriptor, closure, invokable object, or fatal path. |
| `ConstRef` | Use resolved constant metadata; non-literal constants lower their stored expression. |
| `NewObject` | Emit object allocation and constructor call for fixed class. |
| `NewDynamicObject` | Lower class-string expression; runtime class lookup, parent constraint check, object allocation, constructor call. |
| `PropertyAccess` | Fixed property read or mixed/stdClass property runtime read. |
| `DynamicPropertyAccess` | Lower object and property expression; dynamic property runtime read. |
| `NullsafePropertyAccess` | Null-check object; null path returns null, object path emits property read. |
| `NullsafeDynamicPropertyAccess` | Null-check object; object path emits dynamic property read. |
| `StaticPropertyAccess` | Fixed or late-static storage read. |
| `MethodCall` | Lower receiver and args; emit method dispatch/vtable/descriptor path. |
| `NullsafeMethodCall` | Null-check receiver; null path returns null, object path emits method call. |
| `StaticMethodCall` | Resolve receiver metadata or late-static dispatch; emit static method call. |
| `FirstClassCallable` | Emit descriptor/wrapper metadata for function, static method, or method target; object-method targets carry the evaluated receiver as the `FirstClassCallableNew` operand. |
| `This` | Load current object receiver. |
| `PtrCast` | Lower expression; preserve pointer bits and change `php_type` metadata. |
| `BufferNew` | Lower length and emit `BufferNew`. |
| `ClassConstant` | Fixed receiver emits class-string constant; `static` uses late-bound class runtime path. |
| `ScopedConstantAccess` | Resolve class constant or enum case metadata; emit scalar/object result. |
| `NewScopedObject` | Allocate `self`, `parent`, or late-static object and call constructor. |
| `MagicConstant` | Must not reach EIR; validator rejects it because magic constants are lowered earlier. |
| `Yield` | Lower through generator state-machine path; emits `GeneratorYield`/`GeneratorSuspend`. |
| `YieldFrom` | Lower iterable forwarding through generator state-machine path. |

### Binary Operators

| `BinOp` | EIR lowering |
|---|---|
| `Add`, `Sub`, `Mul`, `Div`, `Mod`, `Pow` | Numeric scalar or mixed numeric op with PHP coercions. |
| `Concat` | String coercions followed by `StrConcat`. |
| `Eq`, `NotEq` | Loose equality op, negated for `NotEq`. |
| `StrictEq`, `StrictNotEq` | Strict type-aware equality op, negated for `StrictNotEq`. |
| `Lt`, `Gt`, `LtEq`, `GtEq` | Ordered comparison with PHP coercions. |
| `And`, `Or` | Short-circuit CFG. |
| `Xor` | Truthiness of both operands, no short-circuit after both evaluated. |
| `BitAnd`, `BitOr`, `BitXor`, `ShiftLeft`, `ShiftRight` | Integer/string/mixed bitwise lowering per PHP type rules. |
| `Spaceship` | Three-way comparison op. |
| `NullCoalesce` | Same CFG semantics as `ExprKind::NullCoalesce`. |

### Statement Variants

| `StmtKind` | Lowering contract |
|---|---|
| `Echo` | Lower expression and emit stdout write. |
| `Assign` | Lower RHS, store to local/global/ref cell, update ownership. |
| `RefAssign` | Bind target ref cell to source storage; no value copy. |
| `If` | Lower condition and branch CFG, including elseif clauses and optional else. |
| `IfDef` | Should be removed by conditional pass; residual form lowers selected/resolved body or validator reports unresolved conditional. |
| `While` | Header/body/exit CFG with break/continue targets. |
| `DoWhile` | Body executes before condition; loop CFG with break/continue targets. |
| `For` | Lower optional init, condition, update, body with source-order semantics. |
| `ArrayAssign` | Load array local, ensure COW uniqueness, write index, store/update ownership. |
| `NestedArrayAssign` | Lower non-local target chain, preserve intermediate side effects, perform final write. |
| `ArrayPush` | Load array local, ensure uniqueness/growth, append value. |
| `TypedAssign` | Lower RHS, enforce/check declared type if needed, store local. |
| `Foreach` | Lower iterable once; build iterator loop, key/value binding, by-ref/by-value semantics, cleanup. |
| `Switch` | Lower subject once; build case/default CFG preserving fallthrough and `break`. |
| `Include` | Should not reach EIR after resolver; validator/compiler error if unresolved. |
| `IncludeOnceMark` | Emit include-once marker metadata/global state update. |
| `IncludeOnceGuard` | Emit guard branch around body using include-once state. |
| `Throw` | Lower expression and emit throw terminator/path. |
| `Synthetic` | Lower contained statements in order. |
| `Try` | Create try handler slot, protected body, catch landing blocks, optional finally edges. |
| `Break` | Branch to resolved loop/switch target after required cleanup. |
| `Continue` | Branch to resolved loop update/header target after required cleanup. |
| `ExprStmt` | Lower expression, discard result, release owned discarded value. |
| `NamespaceDecl` | Should be flattened by name resolver; residual statement is metadata/no-op. |
| `NamespaceBlock` | Should be flattened; residual body lowers in order. |
| `UseDecl` | Should be resolved by name resolver; residual statement is metadata/no-op. |
| `FunctionDecl` | Emit/register separate `Function`; declaration statement itself is no-op at runtime. |
| `FunctionVariantGroup` | Register include-variant dispatch metadata. |
| `FunctionVariantDispatch` | Declare an include-loaded function variant group for dispatcher emission. |
| `FunctionVariantMark` | Emit variant marker state. |
| `Return` | Lower optional expression, perform cleanup, emit `Return`. |
| `ConstDecl` | Record constant metadata; value expression retained for `ConstRef`. |
| `ListUnpack` | Lower RHS array, load elements, assign locals. |
| `Global` | Bind local names to global storage aliases. |
| `StaticVar` | Emit guarded static initialization and local alias/load. |
| `ClassDecl` | Record class metadata; lower methods separately. |
| `EnumDecl` | Record enum metadata and cases. |
| `PackedClassDecl` | Record packed layout metadata. |
| `InterfaceDecl` | Record interface metadata. |
| `TraitDecl` | Record trait metadata; trait flattening should already be type-checked. |
| `PropertyAssign` | Lower object and value, perform property write. |
| `StaticPropertyAssign` | Lower value, perform static property write. |
| `StaticPropertyArrayPush` | Load static property array/hash, ensure uniqueness, append, store. |
| `StaticPropertyArrayAssign` | Load static property array/hash, ensure uniqueness, indexed/key write, store. |
| `PropertyArrayPush` | Load object property array/hash, ensure uniqueness, append, store property. |
| `PropertyArrayAssign` | Load object property array/hash, ensure uniqueness, indexed/key write, store property. |
| `ExternFunctionDecl` | Record extern function metadata for `ExternCall`; no runtime statement. |
| `ExternClassDecl` | Record extern class/struct layout metadata. |
| `ExternGlobalDecl` | Record extern global metadata for load/store. |

## Runtime Boundary

EIR does not emit runtime helper assembly. It references runtime helpers by
symbol and category through `RuntimeCall` or specialized opcodes.

Runtime effect categories:

| Runtime category | EIR modeling |
|---|---|
| diagnostics | warnings, fatal messages, heap-debug fatals |
| strings | conversions, concat, comparisons, hashing/string builtins |
| callables | descriptor release, callable introspection, runtime invocation |
| system | argv, time/date, JSON, regex, process execution, match-unhandled |
| exceptions | throw/rethrow, cleanup frames, class/interface matching |
| generators | generator frame/state/send/throw/return helpers |
| arrays/hash/mixed/gc | heap allocation, COW, hash operations, Mixed boxing, refcount, GC |
| SPL | runtime-managed containers and iterator helpers |
| objects | stdClass, mixed property/array access, JSON object encode |
| buffers | buffer allocation, length, bounds, freed-buffer checks |
| I/O | streams, filesystem, stat/path helpers |
| pointers | C string conversion and pointer string helpers |
| fibers | stack allocation, switch, start/resume/suspend/throw/getters |

`RuntimeFeatures` remains the mechanism for optional runtime categories such as
regex. EIR lowering must set required runtime features when it emits operations
that need optional helpers.

## Target-Aware Backend Boundary

EIR does not choose physical registers, spill slots, callee-saved preservation,
stack alignment, syscall numbers, object file directives, or symbol decoration.
Those remain in `src/codegen/abi/` and platform helpers.

The EIR backend consumes:

- `Module.target`
- `IrType` and `php_type`
- call signatures and normalized argument plans
- `LocalSlot` metadata
- `DataPool`
- runtime feature requirements

Then it materializes:

- ABI argument registers/stack slots
- frame layout and hidden slots
- target-specific branch/call instructions
- runtime helper calls
- source-map comments
- instruction comments at the repository-required column