## Effects

每条 instruction 和 terminator 都携带一个由 builder 赋予的不可变 `Effects` summary。Effects 是保守的，并且以 PHP 可观察行为为准。

```rust
pub struct Effects {
    pub reads_local: bool,
    pub writes_local: bool,
    pub reads_heap: bool,
    pub writes_heap: bool,
    pub reads_global: bool,
    pub writes_global: bool,
    pub reads_fs: bool,
    pub writes_fs: bool,
    pub reads_process: bool,
    pub writes_process: bool,
    pub output: bool,
    pub alloc_heap: bool,
    pub alloc_concat: bool,
    pub refcount_op: bool,
    pub may_throw: bool,
    pub may_fatal: bool,
    pub may_warn: bool,
    pub may_deopt: bool,
}
```

| Effect | Required when |
|---|---|
| `reads_local` / `writes_local` | 访问 local、hidden temp、ref cell、static local 或 global alias slot。 |
| `reads_heap` / `writes_heap` | 观察或修改 array/hash/object/mixed/callable/buffer/generator/fiber 状态。 |
| `reads_global` / `writes_global` | 观察或修改 PHP globals、static properties、constants、runtime global symbols 或 JSON error state。 |
| `reads_fs` / `writes_fs` | 使用 filesystem、streams、stat cache、directory 或 path APIs。 |
| `reads_process` / `writes_process` | 使用 environment、time、process execution、argv、sleep 或 platform state。 |
| `output` | 发生 `echo`、`print`、`printf`、`var_dump`、`print_r`、passthru/system output 或 stdout/stderr 写入。 |
| `alloc_heap` | 可能发生运行时堆分配。 |
| `alloc_concat` | 可能使用 concat scratch buffer。 |
| `refcount_op` | Refcount 或 callable descriptor 生命周期可能改变。 |
| `may_throw` | 可能抛出可捕获异常。 |
| `may_fatal` | PHP fatal/value error/unhandled match/bounds/null pointer 路径可能终止。 |
| `may_warn` | 可能发出 PHP warning 或 diagnostic。 |
| `may_deopt` | 动态行为依赖运行时类型、动态派发、动态 callback、动态类或对象 magic behavior。 |

Effect 来源：

- 标量算术和比较：由 opcode 硬编码。
- Builtins：来自 `src/optimize/effects/builtins.rs`，并为 EIR 扩展为完整 bitset。
- 用户函数/方法/闭包：来自分析出的函数体 effects。
- Callable aliases 和 first-class callables：来自 `src/optimize/effects/calls.rs` 和 descriptor metadata。
- Extern calls：保守处理，除非 extern 声明之后获得显式 purity metadata。
- Runtime calls：来自按 helper 名称/类别索引的 EIR runtime effect table。

Pure 表示没有任何 flag 被设置。pure 操作如果结果未使用，可以被 CSE 或移除。任何带有 `may_throw`、`may_fatal`、`may_warn`、`output`、`writes_*`、`alloc_*` 或 `refcount_op` 的操作都是可观察的，除非后续 pass 证明不是。

## 指令集

每条 instruction 包含：

- opcode
- operands
- result type（void 时为 `None`）
- PHP type metadata
- ownership result
- effects
- source span

### Constants and Data

| Op | Operands | Result | Effects | Lowering |
|---|---|---|---|---|
| `ConstI64(value)` | none | `I64` | pure | target immediate or data load |
| `ConstF64(data_id)` | none | `F64` | pure | data-section load |
| `ConstStr(data_id)` | none | `Str` | pure | label plus length |
| `ConstNull` | none | `I64` or `Void` context dependent | pure | zero/null sentinel |
| `ConstBool(value)` | none | `I64` | pure | 0/1 |
| `ConstClassName(class_id)` | none | `Str` | pure | static class-string |
| `ConstEnumCase(enum_id, case_id)` | none | object or scalar | may allocate if object case | enum metadata/runtime path |
| `DataAddr(data_id)` | none | `I64` | pure | address materialization |

### Locals, Globals, and Static Storage

| Op | Operands | Result | Effects |
|---|---|---|---|
| `LoadLocal(slot)` | none | slot type | `reads_local` |
| `StoreLocal(slot, value)` | value | `Void` | `writes_local`, maybe `refcount_op` |
| `LoadRefCell(slot)` | none | value or address | `reads_local`, maybe `reads_heap` |
| `StoreRefCell(slot, value)` | value | `Void` | `writes_local`, maybe `writes_heap`, `refcount_op` |
| `LoadGlobal(name)` | none | declared type | `reads_global` |
| `StoreGlobal(name, value)` | value | `Void` | `writes_global`, maybe `refcount_op` |
| `LoadStaticLocal(slot)` | none | slot type | `reads_global` |
| `StoreStaticLocal(slot, value)` | value | `Void` | `writes_global`, maybe `refcount_op` |
| `InitStaticLocal(slot, value)` | value | `Void` | `reads_global`, `writes_global`, maybe allocation/refcount effects |
| `LoadStaticProperty(class, property)` | none | property type | `reads_global`, maybe `may_deopt` for late static |
| `StoreStaticProperty(class, property, value)` | value | `Void` | `writes_global`, maybe `refcount_op`, `may_deopt` |

### Integer, Float, and Bitwise Operations

| Op | Operands | Result | Effects |
|---|---|---|---|
| `IAdd`, `ISub`, `IMul` | `I64`, `I64` | `I64` | pure |
| `IDiv` | `I64`, `I64` | `F64` or `I64` depending on PHP operator context | `may_fatal` on invalid divisor |
| `ISDiv` | `I64`, `I64` | `I64` | `may_fatal` |
| `ISMod` | `I64`, `I64` | `I64` | `may_fatal` |
| `IPow` | `I64`, `I64` | `I64` or `F64` per PHP result | pure or libcall |
| `INeg`, `IBitNot` | `I64` | `I64` | pure |
| `IBitAnd`, `IBitOr`, `IBitXor`, `IShl`, `IShrA` | `I64`, `I64` | `I64` | pure |
| `FAdd`, `FSub`, `FMul`, `FDiv`, `FPow`, `FNeg` | `F64` operands | `F64` | pure or libcall |
| `MixedNumericBinop(add\|sub\|mul)` | mixed/union operands | mixed/scalar | `reads_heap`, maybe `alloc_heap`, `may_warn`, `may_fatal`, `may_deopt` |

`BinOp::Div` 遵循 PHP 除法行为，并可能产生 float。`BinOp::Pow`
保留 PHP 指数运算的结果规则。

### Comparison and Truthiness

| Op | Operands | Result | Effects |
|---|---|---|---|
| `ICmp(predicate)` | `I64`, `I64` | `I64` bool | pure |
| `FCmp(predicate)` | `F64`, `F64` | `I64` bool | pure |
| `StrEq`, `StrCmp`, `StrLooseEq` | `Str`, `Str` | `I64` or compare int | `reads_heap` only if non-static bytes require helper reads |
| `StrictEq`, `StrictNotEq` | typed values | `I64` bool | pure for scalars, `reads_heap` for mixed/refcounted |
| `LooseEq`, `LooseNotEq`, `Spaceship` | typed values | `I64` or compare int | may coerce, `reads_heap`, `may_warn`, `may_deopt` |
| `IsNull`, `IsTruthy`, `IsEmpty` | typed value | `I64` bool | pure for scalars, `reads_heap` for mixed/containers |
| `InstanceOf` | value, target metadata | `I64` bool | `reads_heap`, `reads_global`, maybe `may_deopt` |

### Conversions and Boxing

| Op | From | To | Effects |
|---|---|---|---|
| `IToF` | `I64` | `F64` | pure |
| `FToI` | `F64` | `I64` | pure PHP truncation |
| `IToStr`, `FToStr`, `BoolToStr` | scalar | `Str` | `alloc_concat` or static string |
| `StrToI`, `StrToF`, `StrToNumber` | `Str` | scalar or mixed numeric | reads bytes, maybe `may_warn` |
| `ResourceToStr` | `I64` resource | `Str` | may allocate, may warn |
| `Cast(to_php_type)` | typed value | matching IR type | PHP cast effects |
| `MixedBox` | non-mixed value | `Heap(Mixed)` | `alloc_heap`, maybe `refcount_op` |
| `MixedUnbox(expected)` | `Heap(Mixed)` | expected storage | `reads_heap`, `may_fatal` |
| `MixedTagOf` | `Heap(Mixed)` | `I64` | `reads_heap` |
| `ArrayToMixed`, `HashToMixed` | array/hash | `Heap(Mixed)` | `alloc_heap`, `refcount_op` |
| `MixedCastBool`, `MixedCastInt`, `MixedCastFloat`, `MixedCastString` | `Heap(Mixed)` | scalar/string | `reads_heap`, maybe `alloc_concat`, `may_warn` |

### Strings

| Op | Operands | Result | Effects |
|---|---|---|---|
| `StrConcat` | `Str`, `Str` | `Str` | `alloc_concat` |
| `StrLen` | `Str` | `I64` | pure |
| `StrPersist` | `Str` | `Str` | `alloc_heap`, `refcount_op` when copy needed |
| `StrCharAt` | `Str`, `I64` | `Str` | `may_fatal`, `alloc_concat` |
| `StrInterpolate` | string parts and values | `Str` | combined value effects, `alloc_concat` |
| `ConcatReset` | none | `Void` | `writes_global` |
| `WriteStrStdout` | `Str` | `Void` | `output` |

Concat-buffer 操作对语句边界敏感。Lowering 必须发出语句边界，避免 EIR pass 将 `alloc_concat` 操作重排到 reset 点另一侧。

### Arrays and Hashes

| Op | Operands | Result | Effects |
|---|---|---|---|
| `ArrayNew(element_type, capacity)` | none | `Heap(Array)` | `alloc_heap` |
| `HashNew(key_type, value_type, capacity)` | none | `Heap(Hash)` | `alloc_heap` |
| `ArrayLen`, `HashLen` | container | `I64` | `reads_heap` |
| `ArrayGet` | array, index | element type | `reads_heap`, `may_warn`, maybe `may_fatal` |
| `HashGet` | hash, key | value type | `reads_heap`, `may_warn`, maybe `may_fatal` |
| `ArraySet` | array, index, value | `Void` | `writes_heap`, maybe `alloc_heap`, `refcount_op` |
| `HashSet` | hash, key, value | `Void` | `writes_heap`, maybe `alloc_heap`, `refcount_op` |
| `ArrayPush`, `HashAppend` | container, value | `Void` | `writes_heap`, maybe `alloc_heap`, `refcount_op` |
| `ArrayEnsureUnique`, `HashEnsureUnique` | container | same container | `reads_heap`, maybe `alloc_heap`, `refcount_op` |
| `ArrayCloneShallow`, `HashCloneShallow` | container | same kind | `alloc_heap`, `refcount_op` |
| `ArrayUnion`, `HashUnion`, `ArrayHashUnion`, `HashArrayUnion` | containers | container | `reads_heap`, `alloc_heap`, `refcount_op` |
| `ArrayToHash` | array | hash | `reads_heap`, `alloc_heap` |
| `ArrayKeyExists`, `OffsetExists` | container, key | `I64` bool | `reads_heap` |
| `OffsetUnset` | container, key | `Void` | `writes_heap`, `refcount_op` |
| `ListUnpack` | array value, slot list | `Void` | `reads_heap`, `writes_local` |

所有 mutating 操作都必须保留 copy-on-write。除非已有所有权证明使其不必要，否则 builder 会在 mutation 前发出 `ArrayEnsureUnique`/`HashEnsureUnique`。

### Iterables, SPL, and Foreach

| Op | Operands | Result | Effects |
|---|---|---|---|
| `IterStart` | iterable value | iterator state | `reads_heap`, maybe `alloc_heap`, `may_deopt` |
| `IterCurrentKey` | iterator state | key value | `reads_heap`, maybe `may_deopt` |
| `IterCurrentValue` | iterator state | value | `reads_heap`, maybe `may_deopt` |
| `IterNext` | iterator state | `I64` bool | `reads_heap`, `writes_heap`, maybe `may_deopt` |
| `IterEnd` | iterator state | `Void` | maybe `refcount_op` |
| `IteratorMethodCall` | object, method metadata | typed value | method effects, `may_deopt` |
| `SplRuntimeCall` | runtime helper, args | typed value | helper effect summary |

数组/哈希表上的 `foreach` 使用容器专用 iterator 操作。对象上的 `foreach` 使用 iterator dispatch metadata，并且可能调用用户代码。

### Objects, Classes, Enums, and Attributes

| Op | Operands | Result | Effects |
|---|---|---|---|
| `ObjectNew(class_id, args)` | constructor args | `Heap(Object)` | `alloc_heap`, constructor effects |
| `DynamicObjectNew(class_expr, fallback, required_parent, args)` | class-string and args | `Heap(Object)` | `reads_global`, `alloc_heap`, `may_fatal`, `may_deopt` |
| `PropGet(class_id, property)` | object | property type | `reads_heap`, maybe `may_deopt` |
| `PropSet(class_id, property, value)` | object, value | `Void` | `writes_heap`, `refcount_op`, maybe `may_deopt` |
| `DynamicPropGet`, `DynamicPropSet` | object, property string/value | value or `Void` | `reads_heap`/`writes_heap`, `may_deopt`, maybe `may_warn` |
| `NullsafePropGet`, `NullsafeMethodCall` | nullable object and metadata | nullable result | branch plus underlying op effects |
| `MethodLookup` | object, method id | callable entry | `reads_heap`, `reads_global`, `may_deopt` |
| `MethodCall` | object, method id, args | return type | method effects |
| `StaticMethodCall` | receiver metadata, method id, args | return type | method effects, maybe `may_deopt` for late static |
| `ClassConstant` | receiver | `Str` | pure for fixed receivers, `may_deopt` for `static` |
| `ScopedConstantGet` | receiver, constant name | typed value | `reads_global`, maybe enum/object effects |
| `ClassAttrNames`, `ClassAttrArgs`, `ClassGetAttributes` | class metadata | arrays/objects | `alloc_heap`, `reads_global` |
| `InstanceOfDynamic` | value, runtime class-string | `I64` bool | `reads_global`, `reads_heap`, `may_deopt` |

Class、interface、trait、enum、packed-class、property、method、constant 和 attribute 声明主要向 module 贡献元数据。Method 和 closure body 会作为普通 `Function` 值 lowering。

### Calls and Callables

| Op | Operands | Result | Effects |
|---|---|---|---|
| `Call(function_id, args)` | normalized args | return type | callee effect summary |
| `FunctionVariantCall(group, args)` | normalized args | return type | union of variant effects |
| `BuiltinCall(name, args)` | normalized args | builtin return | builtin effect summary |
| `RuntimeCall(helper, args)` | ABI args | helper return | runtime helper effect summary |
| `ExternCall(name, args)` | C ABI args | extern return | conservative FFI effects |
| `ClosureNew` | captures | `I64` callable descriptor | `alloc_heap`, `refcount_op` |
| `ClosureCall` | descriptor/local callable, args | return type | target effect summary or conservative |
| `ExprCall` | runtime callee expression, args | return type | conservative dynamic callable effects |
| `FirstClassCallableNew` | target metadata, optional object receiver | `I64` callable descriptor | `alloc_heap`, `refcount_op` |
| `CallableArrayNew` | receiver/class/function parts | callable descriptor or array | `alloc_heap`, `refcount_op` |
| `CallableDescriptorInvoke` | descriptor, normalized mixed args | `Heap(Mixed)` or typed value | descriptor effect summary |
| `PipeCall` | value, callable | callable return | evaluates value before callable invocation |

调用参数规则不会在每个 opcode 中重新实现。EIR lowering 使用 `src/types/call_args.rs` 中共享的语义规划器，并保留可观察顺序：

1. 按 PHP 源码顺序求值参数。
2. 在 PHP 可观察点保留 named/spread 检查。
3. 在 ABI 物化前存储所需 hidden temporaries。
4. 在后端中按 callee signature 顺序物化 ABI 参数。
5. 避免为 ref-like 和 mutating 参数做 temp preevaluation。
