### Supporting AST Metadata

这些辅助 AST enums 和 records 不一定会 lower 为独立的 EIR instructions，但必须在 metadata 中表示，或被 lowering 消费。

| AST surface | EIR contract |
|---|---|
| `MagicConstant::Dir`, `File`, `Function`, `Class`, `Method`, `Namespace`, `Trait` | 必须在 EIR 前 lower 为普通 constants。原始 `MagicConstant` values 会被 validator 拒绝。 |
| `CastType::Int`, `Float`, `String`, `Bool`, `Array` | 选择 `Cast(to_php_type)` 或特定 scalar/string/array conversion opcode。 |
| `StaticReceiver::Named`, `Self_`, `Static`, `Parent` | 存储在 receiver metadata 中。`Named`、`Self_` 和 `Parent` 通常会在 backend lowering 前解析；`Static` 可能需要 late-static runtime behavior。 |
| `InstanceOfTarget::Name` | 固定 class/interface target metadata。 |
| `InstanceOfTarget::Expr` | 动态 target expression；发出 runtime class-string/object target checks。 |
| `CallableTarget::Function` | 函数的 first-class callable 或 callable-array metadata。 |
| `CallableTarget::StaticMethod` | static method 和 receiver 的 first-class callable 或 callable-array metadata。 |
| `CallableTarget::Method` | object-bound method 的 first-class callable metadata。 |
| `UseKind::Class`, `Function`, `Const` | Name resolver 在 EIR 前消费这些；残留 `UseDecl` 是 metadata/no-op。 |
| `AttributeGroup` / `Attribute` | 携带在 declaration metadata 上，用于 reflection/attribute builtins；attribute argument expressions 会在需要时 lower 为 metadata values。 |
| `EnumCaseDecl` | Enum metadata 加可选 scalar/object case value。 |
| `TraitUse` / `TraitAdaptation` | Type checking/name resolution 会在 EIR method lowering 前 flatten traits；metadata 可保留用于 diagnostics。 |
| `ClassProperty` / `PropertyHooks` | Class metadata、property layout、readonly/final/static flags、hooks、defaults 和 attributes。 |
| `ClassConst` | Class/interface/trait constant metadata 和 value expression。 |
| `ClassMethod` | 独立的 `Function` 加 method metadata 和 vtable/static dispatch metadata。 |
| `CType::Int`, `Float`, `Str`, `Bool`, `Void`, `Ptr`, `TypedPtr`, `Callable` | 由 `ExternCall`、extern globals 和 callback trampolines 消费的 extern ABI metadata。 |
| `ExternParam` | Extern function parameter metadata。 |
| `ExternField` | Extern class/struct field offset/type metadata。 |
| `PackedField` | Packed class field offset/type metadata。 |

### Expression Variants

| `ExprKind` | Lowering contract |
|---|---|
| `StringLiteral` | `ConstStr`；ownership 为 `Persistent`；保留 source span。 |
| `IntLiteral` | `ConstI64`；`php_type = Int`。 |
| `FloatLiteral` | `ConstF64`；data pool entry 保存精确 bits。 |
| `Variable` | 根据已解析 storage 使用 `LoadLocal`、`LoadGlobal`、`LoadStaticLocal` 或 ref-cell load。 |
| `BinaryOp` | 按源码顺序先 lower left 再 lower right；根据 `BinOp` 和 operand PHP types 派发。 |
| `InstanceOf` | Lower value 和 target；fixed target 使用 metadata，expression target 使用 dynamic class-string/runtime lookup。 |
| `BoolLiteral` | `ConstBool`；`php_type = Bool`。 |
| `Null` | `ConstNull`；物化为 PHP null sentinel 或 void context。 |
| `Negate` | Lower inner；发出 `INeg`、`FNeg` 或 mixed numeric conversion/op。 |
| `Not` | Lower inner；发出 truthiness conversion 和 boolean negation。 |
| `BitNot` | Lower inner；发出 integer/string/mixed bit-not semantics。 |
| `Throw` | Lower exception expression；发出 `Throw` terminator 或 `ThrowException` path。 |
| `ErrorSuppress` | 在 inner expression 周围发出 suppress begin/end；保留 inner result 和除 diagnostics 外的 effects。 |
| `Print` | Lower value，写 stdout，返回 `ConstI64(1)`。 |
| `NullCoalesce` | 构建保留 short-circuiting 的 null-check CFG。 |
| `Pipe` | 先 lower value，再 lower callable expression，然后 single-argument call。 |
| `Assignment` | Lower prelude，只写 target 一次，并在存在 `result_target`/temp 时保留 expression result。 |
| `PreIncrement` | Load local，increment，store，返回 new value。 |
| `PostIncrement` | Load local，保存 old value，increment，store，返回 old value。 |
| `PreDecrement` | Load local，decrement，store，返回 new value。 |
| `PostDecrement` | Load local，保存 old value，decrement，store，返回 old value。 |
| `FunctionCall` | 如果是 extern：`ExternCall`；如果是 builtin：`BuiltinCall`；否则在共享 argument planning 后使用 `Call`/variant dispatch。 |
| `ArrayLiteral` | 分配 indexed array，并按源码顺序插入 elements，包括 spread handling。 |
| `ArrayLiteralAssoc` | 分配 hash table，并按源码顺序插入 key/value pairs；empty hash 保留 mixed key/value metadata。 |
| `Match` | Lower subject 一次；构建 strict-comparison arm CFG；缺少 default 时可能通过 match-unhandled runtime `Fatal`。 |
| `ArrayAccess` | Lower base/index；根据 type 需要派发到 array/hash/mixed/object ArrayAccess/buffer access。 |
| `Ternary` | Lower condition，然后 branch CFG；result block 合并 branch values。 |
| `ShortTernary` | Lower value 一次；truthy path 复用 value；false path lower default。 |
| `Cast` | Lower expression 后发出 `Cast`/specific conversion op。 |
| `Closure` | 发出 callable descriptor、capture metadata 和 deferred closure function body。 |
| `NamedArg` | 由 call argument planning 消费；standalone lowering 只为 diagnostics/fallback lower `value`。 |
| `Spread` | 由 call/array literal lowering 消费；standalone lowering 只为 diagnostics/fallback lower inner expression。 |
| `ClosureCall` | Load callable local/descriptor 并发出 closure/descriptor invocation。 |
| `ExprCall` | Lower callee expression 一次；派发 runtime string、callable array、callable descriptor、closure、invokable object 或 fatal path。 |
| `ConstRef` | 使用已解析 constant metadata；non-literal constants 会 lower 其 stored expression。 |
| `NewObject` | 为 fixed class 发出 object allocation 和 constructor call。 |
| `NewDynamicObject` | Lower class-string expression；执行 runtime class lookup、parent constraint check、object allocation、constructor call。 |
| `PropertyAccess` | Fixed property read 或 mixed/stdClass property runtime read。 |
| `DynamicPropertyAccess` | Lower object 和 property expression；dynamic property runtime read。 |
| `NullsafePropertyAccess` | 对 object 做 null-check；null path 返回 null，object path 发出 property read。 |
| `NullsafeDynamicPropertyAccess` | 对 object 做 null-check；object path 发出 dynamic property read。 |
| `StaticPropertyAccess` | Fixed 或 late-static storage read。 |
| `MethodCall` | Lower receiver 和 args；发出 method dispatch/vtable/descriptor path。 |
| `NullsafeMethodCall` | 对 receiver 做 null-check；null path 返回 null，object path 发出 method call。 |
| `StaticMethodCall` | Resolve receiver metadata 或 late-static dispatch；发出 static method call。 |
| `FirstClassCallable` | 为 function、static method 或 method target 发出 descriptor/wrapper metadata；object-method targets 携带已求值 receiver 作为 `FirstClassCallableNew` operand。 |
| `This` | Load current object receiver。 |
| `PtrCast` | Lower expression；保留 pointer bits 并改变 `php_type` metadata。 |
| `BufferNew` | Lower length 并发出 `BufferNew`。 |
| `ClassConstant` | Fixed receiver 发出 class-string constant；`static` 使用 late-bound class runtime path。 |
| `ScopedConstantAccess` | Resolve class constant 或 enum case metadata；发出 scalar/object result。 |
| `NewScopedObject` | 分配 `self`、`parent` 或 late-static object，并调用 constructor。 |
| `MagicConstant` | 不能到达 EIR；validator 会拒绝它，因为 magic constants 会更早 lower。 |
| `Yield` | 通过 generator state-machine path lower；发出 `GeneratorYield`/`GeneratorSuspend`。 |
| `YieldFrom` | 通过 generator state-machine path lower iterable forwarding。 |

### Binary Operators

| `BinOp` | EIR lowering |
|---|---|
| `Add`, `Sub`, `Mul`, `Div`, `Mod`, `Pow` | Numeric scalar 或带 PHP coercions 的 mixed numeric op。 |
| `Concat` | String coercions 后跟 `StrConcat`。 |
| `Eq`, `NotEq` | Loose equality op，`NotEq` 取反。 |
| `StrictEq`, `StrictNotEq` | Strict type-aware equality op，`StrictNotEq` 取反。 |
| `Lt`, `Gt`, `LtEq`, `GtEq` | 带 PHP coercions 的 ordered comparison。 |
| `And`, `Or` | Short-circuit CFG。 |
| `Xor` | 两个 operands 的 truthiness；两个都求值后不再 short-circuit。 |
| `BitAnd`, `BitOr`, `BitXor`, `ShiftLeft`, `ShiftRight` | 按 PHP type rules 做 integer/string/mixed bitwise lowering。 |
| `Spaceship` | Three-way comparison op。 |
| `NullCoalesce` | 与 `ExprKind::NullCoalesce` 相同的 CFG 语义。 |

### Statement Variants

| `StmtKind` | Lowering contract |
|---|---|
| `Echo` | Lower expression 并发出 stdout write。 |
| `Assign` | Lower RHS，store 到 local/global/ref cell，更新 ownership。 |
| `RefAssign` | 将 target ref cell 绑定到 source storage；不复制 value。 |
| `If` | Lower condition 和 branch CFG，包括 elseif clauses 和可选 else。 |
| `IfDef` | 应由 conditional pass 移除；残留形式会 lower selected/resolved body，或由 validator 报告 unresolved conditional。 |
| `While` | 带 break/continue targets 的 header/body/exit CFG。 |
| `DoWhile` | Body 先于 condition 执行；带 break/continue targets 的 loop CFG。 |
| `For` | 按 source-order semantics lower optional init、condition、update、body。 |
| `ArrayAssign` | Load array local，确保 COW uniqueness，写 index，store/update ownership。 |
| `NestedArrayAssign` | Lower non-local target chain，保留 intermediate side effects，执行 final write。 |
| `ArrayPush` | Load array local，确保 uniqueness/growth，append value。 |
| `TypedAssign` | Lower RHS，按需 enforce/check declared type，store local。 |
| `Foreach` | Lower iterable 一次；构建 iterator loop、key/value binding、by-ref/by-value semantics、cleanup。 |
| `Switch` | Lower subject 一次；构建 case/default CFG，保留 fallthrough 和 `break`。 |
| `Include` | Resolver 后不应到达 EIR；如果 unresolved，则 validator/compiler error。 |
| `IncludeOnceMark` | 发出 include-once marker metadata/global state update。 |
| `IncludeOnceGuard` | 使用 include-once state 在 body 周围发出 guard branch。 |
| `Throw` | Lower expression 并发出 throw terminator/path。 |
| `Synthetic` | 按顺序 lower contained statements。 |
| `Try` | 创建 try handler slot、protected body、catch landing blocks 和可选 finally edges。 |
| `Break` | 完成所需 cleanup 后 branch 到已解析 loop/switch target。 |
| `Continue` | 完成所需 cleanup 后 branch 到已解析 loop update/header target。 |
| `ExprStmt` | Lower expression，丢弃 result，release owned discarded value。 |
| `NamespaceDecl` | 应由 name resolver flatten；残留 statement 是 metadata/no-op。 |
| `NamespaceBlock` | 应被 flatten；残留 body 按顺序 lower。 |
| `UseDecl` | 应由 name resolver 解析；残留 statement 是 metadata/no-op。 |
| `FunctionDecl` | 发出/注册独立 `Function`；declaration statement 本身在运行时是 no-op。 |
| `FunctionVariantGroup` | 注册 include-variant dispatch metadata。 |
| `FunctionVariantDispatch` | 声明一个 include-loaded function variant group，用于 dispatcher emission。 |
| `FunctionVariantMark` | 发出 variant marker state。 |
| `Return` | Lower optional expression，执行 cleanup，发出 `Return`。 |
| `ConstDecl` | 记录 constant metadata；value expression 保留给 `ConstRef`。 |
| `ListUnpack` | Lower RHS array，load elements，assign locals。 |
| `Global` | 将 local names 绑定到 global storage aliases。 |
| `StaticVar` | 发出 guarded static initialization 和 local alias/load。 |
| `ClassDecl` | 记录 class metadata；methods 单独 lower。 |
| `EnumDecl` | 记录 enum metadata 和 cases。 |
| `PackedClassDecl` | 记录 packed layout metadata。 |
| `InterfaceDecl` | 记录 interface metadata。 |
| `TraitDecl` | 记录 trait metadata；trait flattening 应该已经 type-checked。 |
| `PropertyAssign` | Lower object 和 value，执行 property write。 |
| `StaticPropertyAssign` | Lower value，执行 static property write。 |
| `StaticPropertyArrayPush` | Load static property array/hash，确保 uniqueness，append，store。 |
| `StaticPropertyArrayAssign` | Load static property array/hash，确保 uniqueness，indexed/key write，store。 |
| `PropertyArrayPush` | Load object property array/hash，确保 uniqueness，append，store property。 |
| `PropertyArrayAssign` | Load object property array/hash，确保 uniqueness，indexed/key write，store property。 |
| `ExternFunctionDecl` | 为 `ExternCall` 记录 extern function metadata；没有 runtime statement。 |
| `ExternClassDecl` | 记录 extern class/struct layout metadata。 |
| `ExternGlobalDecl` | 记录 extern global metadata，用于 load/store。 |

## Runtime Boundary

EIR 不发出 runtime helper assembly。它通过 `RuntimeCall` 或专用 opcodes，按 symbol 和 category 引用 runtime helpers。

Runtime effect categories：

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

`RuntimeFeatures` 仍是可选 runtime categories（例如 regex）的机制。当 EIR lowering 发出需要 optional helpers 的 operations 时，必须设置 required runtime features。

## Target-Aware Backend Boundary

EIR 不选择物理寄存器、spill slots、callee-saved preservation、stack alignment、syscall numbers、object file directives 或 symbol decoration。这些仍保留在 `src/codegen/abi/` 和 platform helpers 中。

EIR 后端消费：

- `Module.target`
- `IrType` and `php_type`
- call signatures and normalized argument plans
- `LocalSlot` metadata
- `DataPool`
- runtime feature requirements

然后物化：

- ABI argument registers/stack slots
- frame layout and hidden slots
- target-specific branch/call instructions
- runtime helper calls
- source-map comments
- instruction comments at the repository-required column
