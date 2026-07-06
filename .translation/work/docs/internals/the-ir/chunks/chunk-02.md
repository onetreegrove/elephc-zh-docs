## Effects

Each instruction and terminator carries an immutable `Effects` summary assigned
by the builder. Effects are conservative and PHP-observable.

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
| `reads_local` / `writes_local` | Local, hidden temp, ref cell, static local, or global alias slot access. |
| `reads_heap` / `writes_heap` | Array/hash/object/mixed/callable/buffer/generator/fiber state is observed or mutated. |
| `reads_global` / `writes_global` | PHP globals, static properties, constants, runtime global symbols, or JSON error state are observed or mutated. |
| `reads_fs` / `writes_fs` | Filesystem, streams, stat cache, directory, or path APIs are used. |
| `reads_process` / `writes_process` | Environment, time, process execution, argv, sleep, or platform state are used. |
| `output` | `echo`, `print`, `printf`, `var_dump`, `print_r`, passthru/system output, or stdout/stderr writes occur. |
| `alloc_heap` | Runtime heap allocation may occur. |
| `alloc_concat` | Concat scratch buffer may be used. |
| `refcount_op` | Refcount or callable descriptor lifetime may change. |
| `may_throw` | A catchable exception may be raised. |
| `may_fatal` | A PHP fatal/value error/unhandled match/bounds/null pointer path may terminate. |
| `may_warn` | A PHP warning or diagnostic may be emitted. |
| `may_deopt` | Dynamic behavior depends on runtime type, dynamic dispatch, dynamic callback, dynamic class, or object magic behavior. |

Effect sources:

- Scalar arithmetic and comparison: hardcoded by opcode.
- Builtins: from `src/optimize/effects/builtins.rs`, broadened to full bitsets
  for EIR.
- User functions/methods/closures: from analyzed function body effects.
- Callable aliases and first-class callables: from `src/optimize/effects/calls.rs`
  and descriptor metadata.
- Extern calls: conservative unless the extern declaration later gains explicit
  purity metadata.
- Runtime calls: from an EIR runtime effect table keyed by helper name/category.

Pure means no flags set. A pure operation may be CSE'd or removed if its result
is unused. Any operation with `may_throw`, `may_fatal`, `may_warn`, `output`,
`writes_*`, `alloc_*`, or `refcount_op` is observable unless a later pass proves
otherwise.

## Instruction Set

Each instruction has:

- opcode
- operands
- result type (`None` for void)
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

`BinOp::Div` follows PHP division behavior and may produce float. `BinOp::Pow`
preserves PHP exponentiation result rules.

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

Concat-buffer operations are statement-boundary-sensitive. Lowering must emit
statement boundaries so EIR passes do not reorder `alloc_concat` operations
across a reset point.

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

All mutating operations must preserve copy-on-write. The builder emits
`ArrayEnsureUnique`/`HashEnsureUnique` before mutation unless prior ownership
proofs make it unnecessary.

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

`foreach` over arrays/hashes uses container-specific iterator operations.
`foreach` over objects uses iterator dispatch metadata and may call user code.

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

Class, interface, trait, enum, packed-class, property, method, constant, and
attribute declarations primarily contribute metadata to the module. Method and
closure bodies lower as normal `Function` values.

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

Call argument rules are not reimplemented in each opcode. EIR lowering consumes
the shared semantic planner in `src/types/call_args.rs` and preserves the
observable order:

1. Evaluate arguments in PHP source order.
2. Preserve named/spread checks at the PHP-observable point.
3. Store required hidden temporaries before ABI materialization.
4. Materialize ABI parameters in callee signature order in the backend.
5. Avoid temp preevaluation for ref-like and mutating parameters.