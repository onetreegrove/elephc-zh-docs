---
title: "EIR 设计"
description: "AST 优化与汇编发射之间 elephc 默认中间表示的规格。"
sidebar:
  order: 13
---

**状态：** EIR 是默认的面向用户后端。诊断用的 `--emit-ir`
路径会把已检查并优化过的 AST 降低为经过验证的文本 EIR，而普通的
executable/cdylib 路径会把同一份 EIR 降低为汇编。旧版 AST 后端仅作为临时
`--ast-backend` 回退保留。

**实现阶段：** `.plans/eir-*.md`

**本规格的权威源码审计范围：**

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

EIR 是 elephc 的中间表示。它位于 AST 层优化器和汇编发射器之间，在不替换手写汇编后端的前提下，为编译器提供函数级的控制流和值模型。

EIR 有意保持 PHP 形态。数组、哈希表、Mixed 装箱、callable 描述符、copy-on-write 检查、fatal 路径、异常路径、运行时调用，以及精确的源码求值顺序，都是一等编译器概念。EIR 不是通用的 LLVM 或 Cranelift 风格 IR。

## 历史设计边界

最初的第一个路线图项只覆盖本文档：

```text
EIR design specification (`docs/internals/the-ir.md`) - types, instructions,
terminators, effects, ownership, textual format
```

第一个项目**不**包括：

- EIR -> assembly backend
- `--ir-backend`
- register allocation
- IR optimization passes

仅设计的里程碑已经完成。当前实现随后加入了 `src/ir/`、`src/ir_lower/`、`--emit-ir`，以及 `src/codegen_ir/` 下的默认 EIR 汇编后端。寄存器分配和 IR 优化 pass 仍是后续工作。

## 流水线位置

当前默认生产路径：

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

临时旧版回退路径（`--ast-backend`）：

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

AST 优化器仍位于 EIR 之前。它处理适合用语法表达、且保持 PHP 语义的重写：常量折叠、局部标量传播、控制流剪枝、控制流规范化和 DCE。EIR 补上 AST 难以表达的内容：值身份、基本块、块参数、活跃性、支配关系、寄存器放置、CSE、LICM 和内联。

## 后端选择

编译器当前支持两个汇编后端：

- EIR 后端，默认选择，也可通过显式 `--ir-backend` 选择
- 旧版 AST 后端，仅通过 `--ast-backend` 选择

`--ast-backend` 是旧版发射器仍留在源码树中时的弃用逃生口。它会发出警告，并会在默认 EIR 路径完成验证窗口后移除。EIR 保留现有手写汇编风格，并加入线性扫描寄存器分配和固定点 IR 优化 pass driver（见 [Optimization Passes](#optimization-passes)）；更多 IR pass 会作为增量后续工作加入。

## 设计不变量

- EIR 将 PHP 源码求值顺序与 ABI 参数顺序分开保留。
- EIR 值是 SSA：每个值只定义一次。
- 块使用块参数，而不是 phi 节点。
- PHP 运行时概念保持显式：`Mixed`、COW 数组/哈希表、callable、异常/fatal 行为和所有权操作，都不会隐藏在通用的 "call" 中。
- EIR 通过元数据和选中的 `Target` 感知目标平台，但不会硬编码 ARM64/x86_64 寄存器名或栈布局。
- `src/codegen/abi/` 仍是物理 ABI lowering 的权威来源。
- 运行时 helper 保持在 EIR `Module` 之外；EIR 通过 `RuntimeCall` 或专用 opcode 引用它们。
- source span 必须在 lowering 后保留，用于诊断、源码映射和 `--emit-ir` 可读性。
- builder 创建的 effect summary 是保守的。只有当某个 pass 能证明 PHP 可见行为被保留时，才可以细化 effects。

## 类型系统

EIR 使用一个很小的存储格。共享同一存储类别的 PHP 类型细节会保留在 `Value.php_type` 和 opcode 元数据中。

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

`IrType` 是存储契约，不是 `PhpType` 的替代品。每个值还携带原始或推断出的 PHP 类型：

```rust
pub struct Value {
    pub ir_type: IrType,
    pub php_type: PhpType,
    pub def: ValueDef,
    pub ownership: Ownership,
}
```

### PHP 类型映射

| `PhpType` | `IrType` | Notes |
|---|---|---|
| `Int` | `I64` | 有符号 64 位整数存储。 |
| `Float` | `F64` | 64 位浮点存储。 |
| `Str` | `Str` | `(ptr, len)` 对；所有权可以是 transient、owned、borrowed 或 persistent。 |
| `Bool` | `I64` | `0` 或 `1`，并带有 `php_type = Bool`。 |
| `Void` | `Void` when no value is materialized; `I64` null sentinel only when a null value is stored or boxed. |
| `Never` | `Void` | 从不物化；生成它的路径以 `Return`、`Throw`、`Fatal` 或 `Unreachable` 结束。 |
| `Iterable` | `Heap(Iterable)` | 类型擦除后的数组或 traversable 对象指针。 |
| `Mixed` | `Heap(Mixed)` | 指向运行时 tagged Mixed 单元的指针。 |
| `Array(inner)` | `Heap(Array)` | 索引数组堆对象；元素类型保留在 `php_type` 中。 |
| `AssocArray { key, value }` | `Heap(Hash)` | 哈希表堆对象；key/value 类型保留在 `php_type` 中。 |
| `Buffer(inner)` | `Heap(Buffer(inner))` | 固定大小的 elephc buffer 头部；不是 PHP 数组 COW 存储。 |
| `Callable` | `I64` | Callable 描述符地址；所有权单独跟踪，并通过 callable 描述符运行时释放。 |
| `Object(name)` | `Heap(Object(name))` | 运行时对象指针和类元数据。 |
| `Packed(name)` | `Heap(Packed(name))` | packed POD 数据的指针/layout handle。 |
| `Pointer(tag)` | `I64` | 原始原生指针；可选类型标签保留在 `php_type` 中。 |
| `Resource(kind)` | `I64` | 运行时/原生资源句柄；可选 kind 保留在 `php_type` 中。 |
| `Union(members)` | `Heap(Union)` | 运行时表示像 `Mixed` 一样装箱；成员集合保留在 `php_type` 中。 |

`Callable`、`Str` 和引用计数堆值即使存储类型不是 `Heap(...)`，也可以是 owned。所有权是独立的值属性。

### 已解析类型表达式

`TypeExpr` 在 EIR lowering 之前的类型检查期间映射到 `PhpType`。除了元数据需要指回源码声明的地方，EIR 不存储语法层面的类型表达式。

| `TypeExpr` | EIR relevance |
|---|---|
| `Int`, `Float`, `Bool`, `Str`, `Void`, `Never`, `Iterable` | 通过已解析的 `PhpType` lower。 |
| `Ptr(Option<Name>)` | Lower 到 `PhpType::Pointer(_)`，再到 `IrType::I64`。 |
| `Buffer(inner)` | Lower 到 `PhpType::Buffer(_)`，再到 `Heap(Buffer(_))`。 |
| `Named(name)` | 在进入 EIR 前解析为 object、packed class、enum、interface-compatible object 或 builtin type。 |
| `Nullable(inner)` | Lower 为 `Union([inner, Void])` 或类型检查器批准的 nullable 运行时形态。 |
| `Union(members)` | Lower 为 `PhpType::Union(_)`，表示为 `Heap(Union)`。 |

### C 类型映射

Extern 声明使用 `CType`。EIR 在 `ExternDecl` 元数据中保留面向 C 的类型，使 IR 后端可以使用正确的 C ABI helper。

| `CType` | EIR storage |
|---|---|
| `Int`, `Bool`, `Ptr`, `TypedPtr(_)`, `Callable` | `I64` |
| `Float` | `F64` |
| `Str` | `I64` native C string pointer; PHP strings are converted at the boundary. |
| `Void` | `Void` |

## 模块结构

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

这些独立的函数向量对应 `src/codegen/context.rs` 中当前的 deferred codegen 表面：closures、fiber wrappers、callback wrappers、extern callback trampolines 和 runtime callable invokers。Phase 02 可以用带 flags 的单个 `functions` 向量保存它们，但必须仍能表达这些语义区别。

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

`LocalSlot` 即使在 SSA 形式下也存在，因为 PHP locals、globals、statics、references、try handlers 和 hidden temporaries 具有可寻址存储或可观察的生命周期行为。

## 值所有权

所有权映射当前的 `HeapOwnership` 模型，但会附加到每个 SSA 值，而不只附加到 context locals。

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
| `NonHeap` | 没有释放操作的普通标量或原生句柄。 |
| `Owned` | 该值拥有清理责任。 |
| `Borrowed` | 该值别名到其他位置拥有的存储。 |
| `MaybeOwned` | CFG 合并或动态路径，必须在清理前解析所有权。 |
| `Persistent` | 静态数据、interned/static string，或不能释放的运行时持久值。 |
| `Moved` | 值已经转移所有权，除 validator 诊断外不能再次使用。 |

产生所有权的操作：

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

所有权操作：

| Op | Operand | Result | Effects | Lowering |
|---|---|---|---|---|
| `Acquire` | refcounted/string/callable value | `Void` or retained value alias | `REFCOUNT_OP`, maybe `WRITES_HEAP` | `__rt_incref`, string persist/retain, callable descriptor retain if added |
| `Release` | owned value | `Void` | `REFCOUNT_OP`, maybe `WRITES_HEAP`, debug may fatal | `__rt_decref_any`, `__rt_heap_free_safe`, callable descriptor release |
| `Move` | any value | same type | pure validator operation | no machine instruction |
| `Borrow` | value with live owner | same type | pure validator operation | no machine instruction |
| `EnsureOwned` | maybe-owned value | same type | may branch, refcount effect | emits conditional retain/ownership normalization |

字符串不会被建模为通用堆指针，因为它们的 ABI 是 `(ptr,
len)`，但字符串所有权仍参与 validator 检查。

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

指针和 extern memory effects 是保守的，因为它们可以别名到 PHP 堆之外的数据。

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

`Yield` 和 `YieldFrom` 目前不会通过普通表达式结果路径发出。EIR 必须通过 generator state-machine lowering 建模它们，而不是把它们当作普通表达式 instruction。

### Include and Resolver Artifacts

| Op | Operands | Result | Effects |
|---|---|---|---|
| `IncludeOnceMark(label)` | none | `Void` | `writes_global` |
| `IncludeOnceGuard(label)` | none | branch condition | `reads_global`, `writes_global` |
| `FunctionVariantDispatch(group)` | none | `Void` | pure metadata for dispatcher emission |
| `FunctionVariantMark(name, variant)` | none | `Void` | `writes_global` marker state |

普通 `Include` 在正常操作中不应经过 resolver 后到达 EIR。如果到达，lowering 必须产生编译器错误，而不是静默发出不完整 IR。

## Terminators

每个 block 都以且仅以一个 terminator 结束。Terminators 拥有无法表示为 instruction 后跟 fallthrough 的控制流 effects。

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
| `Br` | Destination arg 数量和类型必须匹配 destination block params。 |
| `CondBr` | `cond` 必须是 `I64` bool/truthiness value。两个 destination 都接收匹配的 args。 |
| `Switch` | Cases 保留 PHP `switch`/`match` 语义。`switch` 的 fallthrough 由 block 结构表示，而不是隐式 terminator 行为。 |
| `Return` | 将返回的 owned value 的所有权转移给 caller。`Never` 函数不能正常返回。 |
| `Throw` | 将 exception object 转移到运行时 exception state，并且不会 fall through。 |
| `Fatal` | 结束程序路径；fatal 之后没有 cleanup，除非 cleanup 已在之前显式表示。 |
| `GeneratorSuspend` | 捕获 generator frame state，并在 `resume` 处恢复。 |
| `Unreachable` | 只允许出现在从 `Never`、fatal、throw 或不可能分支证明出来之后。 |

`try`/`catch`/`finally` 表示为显式 handler instructions 和指向 landing blocks 的 CFG edges。Validator 会把 active exception regions 视为控制流契约的一部分。

## 文本格式

文本格式只由 printer 生成。它用于 `--emit-ir`、测试、调试和审阅。在 v0.24.x 轨道中不要求 parser。

必需属性：

- deterministic function order
- deterministic block order
- stable value numbering per function
- source spans shown when available
- effects printed when non-pure
- ownership printed for values whose ownership is not obvious
- heap subkind and PHP type shown for heap/boxed values

## 使用 `--emit-ir`

`--emit-ir` 是诊断输出模式：

```bash
cargo run -- --emit-ir examples/hello/main.php
```

编译器会按正常 frontend 顺序运行到类型检查和 AST 优化，将优化后的 AST 降低为 EIR，验证 module，将文本格式打印到 stdout，然后在 runtime-cache preparation、assembly generation、assembling 或 linking 之前退出。

`--emit-ir`、`--emit-asm` 和 `--check` 互斥，因为它们都是同一个源码文件的终端输出模式。

示例：

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

带 block parameters 的示例：

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

文本语法要求：

- Function header: `function <name>(params) -> <IrType> flags(...)`.
- Block header: `<label>(params):`.
- Instruction: `vN: <IrType> php=<PhpType> own=<Ownership> = <op> ...`.
- Void instruction: `<op> ...`.
- Terminator: `return`, `br`, `cond_br`, `switch`, `throw`, `fatal`,
  `generator_suspend`, or `unreachable`.
- Effects comment: `; effects: reads_heap, writes_heap, may_throw`.
- Source span comment: `; span: line:col`.

## Validator

Validation 有两种模式：

- **Structural mode：** 便宜，在 builder operations 之后以及每个 pass 之后运行。
- **Full mode：** structural + dominance + ownership + effects，在为测试打印前和 EIR 后端 codegen 前运行。

### Structural Rules

1. 每个 block 只属于一个 function。
2. 每个 block 都有且仅有一个 terminator。
3. Terminators 只能作为 block terminator 出现。
4. 每个 `ValueId` 都只定义一次。
5. 每个 `InstId` 都只属于一个 block。
6. 每个 operand 都引用同一 function 中存在的 value。
7. 每个 use 都受其 definition 支配，除非该 value 是由所有 incoming branches 提供的 destination block parameter。
8. Destination block argument count 匹配 destination block parameter count。
9. Destination block argument types 匹配 destination block parameter types。
10. Entry block 没有 block parameters。
11. 每个 value 的 `IrType` 和 `php_type` 都兼容。
12. Void instructions 不能作为 operands 使用。
13. `Never`-typed PHP operations 以 non-returning control flow 结束。

### Opcode Rules

1. Integer ops 只接受 `I64` operands。
2. Float ops 只接受 `F64` operands。
3. String ops 只接受 `Str` operands，除非 opcode 显式 cast。
4. Array ops 要求 `Heap(Array)`。
5. Hash ops 要求 `Heap(Hash)`。
6. Object property ops 要求 `Heap(Object(_))`、`Heap(Mixed)`，或可以在运行时验证的 dynamic receiver opcode。
7. Mixed ops 要求 `Heap(Mixed)` 或 `Heap(Union)`。
8. Callable descriptor ops 即使存储类型为 `I64`，也要求 `PhpType::Callable` metadata。
9. Pointer ops 要求 `PhpType::Pointer(_)` metadata。
10. Buffer ops 要求 `Heap(Buffer(_))`。

### Ownership Rules

1. 每个 owned value 在每条可达路径上都恰好消费一次。
2. `Release`、`Move` 和 `Return` 消费所有权。
3. 返回 owned value 会把所有权转移给 caller。
4. 返回 borrowed value 要求在 `Return` 前执行 `Acquire`。
5. `Borrow` 不能比 source owner 活得更久。
6. `Moved` values 不能读取。
7. `Persistent` values 不能释放。
8. CFG joins 必须显式合并 ownership。如果 incoming ownership states 不匹配，joined value 为 `MaybeOwned`。
9. `MaybeOwned` values 必须在 unconditional cleanup 前解析。
10. Exception、early return、break、continue、fatal 和 generator suspend 路径必须对仍需 cleanup 的 values 做平衡 cleanup。

### Effect Rules

1. Pure operations 不能设置隐藏 memory、output、diagnostic、allocation 或 control-flow effects。
2. 带有 `output`、`may_warn`、`may_throw`、`may_fatal`、`writes_*`、`alloc_*` 或 `refcount_op` 的 operations 是可观察的。
3. Passes 不能把 `may_throw` 或 `may_fatal` operations 移过其他可观察 operations，除非它们证明 PHP 行为等价。
4. `alloc_concat` operations 不能跨越 statement-boundary concat resets。
5. `writes_global` 会使关于 globals、statics、runtime global symbols、JSON error state 和 include-once/function-variant state 的假设失效。
6. `writes_heap` 会使对可能别名的 arrays、hashes、objects、mixed cells、iterators、buffers、generators、fibers 和 callable descriptors 的读取失效。

## Optimization Passes

Lowering 和一次性 module validation 之后，EIR 会在 codegen 前运行固定点 pass driver（`src/ir_passes/driver.rs`）。IR 级变换都放在这个 driver 中，也就是 AST 优化器无法表达的重写，因为这些重写需要 value identity、basic blocks 或 dominance。

Pass 实现 `IrPass` trait：稳定的 `name()`，以及一个会就地修改 function 并报告是否发生变化的 `run(&mut Function, &mut DataPool) -> bool`。`DataPool` 是 module 的共享 literal pool，会被一路传入，这样需要物化新常量的 pass（peephole string-literal fold 会 intern 拼接后的字符串）可以使用它；不需要新 literal 的 pass 会忽略它。Driver 会对每个 function-like body（functions、methods、closures、trampolines、invokers）反复运行已注册 passes，直到完整一轮没有变化，并受固定迭代预算限制。

整个流水线运行到**module-level fixed point**：`optimize_module`
会把跨函数 [small-function inliner](#small-function-inlining) 与这些 per-function passes 交错执行，并重复整轮直到两层都不再变化（受单独的 module-iteration budget 限制）。交错让两者彼此供给：内联后的 body 暴露新的常量和死代码给 per-function passes；被简化的函数又暴露新的（更小的）inline candidates。第一轮复现之前的 "inline once, then optimize" 行为，所以后续轮次只会进一步优化，不会改变语义。

在 debug 和 test builds（`debug_assertions`）中，driver 会在每个 pass 后用 `validate_function` 重新验证 function；如果某个 pass 产生了 malformed IR，就会 panic 并点名 offending pass。同样的 build 中，如果 pass set 在上限内无法收敛也会 panic，这只会发生在 non-converging pass bug 中。两个 guard 都会在 `--release` 中编译掉；达到上限时会简单停止并继续使用当前 IR。

Mutating passes 共享 use-rewriting helper `replace_all_uses`
（`src/ir_passes/rewrite.rs`），它会把某个 value 的每个 *use* 重定向到 replacement，覆盖 instruction operands 和所有 terminator slots，但不触碰 definitions（block parameters 和 instruction results）。

### Identity Arithmetic Folding

第一个注册的 transform（`src/ir_passes/identity_arith.rs`）会用两种 dominance-safe、validator-clean 的重写来折叠整数和浮点算术/位运算上的代数恒等式：

- Fold-to-operand：当结果等于已有 operand `x`（`x + 0`、`x * 1`、`x | 0`、`x << 0`、`x & x`、`x / 1`、`x * 1.0` 等）时，该 instruction 会被 neutralized to `nop`，并且其结果 uses 会被重定向到 `x`。`x` 已经是 operand，因此它支配每个 use。
- Fold-to-zero：当结果是整数 `0`（`x ^ x`、`x - x`、`x * 0`、`x & 0`、`x % 1`）时，该 instruction 会就地重写为 `const_i64 0`，保留相同的 result value id，因此不需要 use-rewrite。

只折叠与 PHP 等价的恒等式。Integer `x / 0` 和 `x % 0` 保留为运行时 trap；float additive-zero 和 `x * 0.0` 被排除，因为 signed zero 和 `NaN` 会让它们可观察。Fold-to-operand chains 会在一次 sweep 内传递解析（`a = x + 0; b = a * 1`），因此被 neutralized 的 dead value 永远不会用作 replacement target。

### Peephole Patterns

第二个注册的 transform（`src/ir_passes/peephole/`）会对 lowered EIR 的形状应用局部重写。每个 pattern 都把 rewrite intents 收集到共享 accumulator（fold-to-operand RAUW map、要 neutralize 的 instructions，以及要转换为 interned `const_str` 的 `str_concat` instructions），再由一个 apply phase 统一提交，并与 identity pass 共享 `replace_all_uses`、`resolve_chains` 和 `neutralize_to_nop`。

- **Box/unbox cancellation** — `unbox(box(x)) → x`，仅适用于 scalar（`NonHeap`）payload 且 ir/php type 匹配，所以装箱 heap value（unbox 会抽出 borrowed reference）永远不会被折叠。
- **Redundant `move`/`borrow`** — 这些 pure forwarding ops 只在结果与 operand 具有相同 ownership 和 type 时折叠到 operand，因此 RAUW 不会转移 cleanup responsibility。（当前 lowering 不会发出它们；如果将来发出，这个 rewrite 会保持正确。）
- **Load/store forwarding and dead stores** — per-block value-numbering 会跟踪每个 scalar（`NonHeap`）`PhpLocal`/`HiddenTemp`/`NamedArgTemp` slot 中驻留的 value。如果某个 slot 有已知 resident value，对该 slot 的 `load_local` 会折叠为该值；存储同一个 resident value 的 `store_local` 会被删除。任何命名该 slot 的 instruction（unset、ref-cell promote/alias/release/store）都会使其失效，状态也会在 block 边界重置，因此永远不会跨过通过 alias 的写入。By-ref locals 使用 ref cells，而不是普通 load/store，所以普通 scalar slots 不会被 alias。
- **Paired acquire/release cancellation** — 如果一个 `acquire` 的结果恰好被它的 `release` 使用一次，则两者都会删除。single-use guard 保证不管两者距离多远，每条路径上的 refcount 都保持中性。
- **String-literal concat folding** — `str_concat(const_str a, const_str b)` 会把 `a ++ b` intern 到 data pool，并变成单个标记为 `persistent` 的 `const_str`，因此 cleanup 永远不会释放该 literal。Nested concats 会跨 driver sweeps 收敛。

### Constant Folding

第三个注册的 transform（`src/ir_passes/const_fold.rs`）会把所有 operands 都是编译期常量的 operations 折叠为单个 `const_*` instruction，就地重写 instruction 并保留它的 result value id（不需要 use-rewrite）。它对 instruction table 做一次前向扫描，跟踪每个 value 携带的 constant；SSA 中的常量是全程序范围的，因此一次 sweep 就能发现 constant operands，并立即折叠 `(2 + 3) * 4` 这样的链。它会折叠 integer `iadd`/`isub`/`imul`、bitwise `and`/`or`/`xor`、范围内（`0..=63`）的 `ishl`/`ishr_a`、unary `ineg`/`ibit_not`、float `fadd`/`fsub`/`fmul`/`fneg`、signed `icmp`，以及 `is_null`/`is_truthy` predicates。

每个 fold 都精确复现 op 的 lowering 在运行时计算出的结果，因此编译结果不变：integers 按 64 位 wrap（匹配原生 `add`/`sub`/`mul`），shifts 只在 count 范围内时 fold，floats 使用精确 IEEE-754。可能 trap 的 integer division/modulo、float division（PHP 的 `DivisionByZeroError` 与 IEEE infinity）以及对 `NaN` 敏感的 `fcmp` 会保留不折叠，与 identity arithmetic 一样保守。

通过 local slots 的传播由它和 peephole 的 scalar load/store value-numbering 组合实现：peephole 会把存入 local 的 constant 转发到之后的 `load_local` uses；本 pass 再折叠由此产生的 constant-operand operation。两者在 fixed-point driver 下共同形成基于 EIR value ids 和 local slots 的 per-block constant propagation。Identity arithmetic 暴露出的常量也会喂给它（`$argc * 0` → `const_i64 0` → downstream folds），而 dead constant producers 会由 dead instruction elimination 清理。

### Common Subexpression Elimination

第四个注册的 transform（`src/ir_passes/cse.rs`）会移除已有相同 predecessor 且该 predecessor 支配它的 pure computation，将 redundant result 重定向到较早的 value（RAUW），并把它 neutralize to `nop`。它在一次 dominator-tree value-numbering traversal 中覆盖 per-block 和 cross-block redundancy：scoped hash table 会把每个 pure instruction 的 key `(op, result type, immediate, canonicalized operands)` 映射到第一次计算它的 value。由于 blocks 按 dominator-tree preorder 访问，table 恰好保存了支配当前 block 的 definitions，包括自身较早的 instructions 和 dominating blocks 的 definitions；因此命中时一定是 dominating value，使重定向 dominance-safe。某个 block 插入的 entries 会在整个 subtree 完成后移除。

只有 **pure**（`Effects::PURE`）、至少有一个 operand，且 result 为 `NonHeap` 或 `Persistent` 的 instructions 才符合条件：purity 表示该 value 只由 operands 决定（没有 memory/state dependency，也不会 fault），ownership 限制保证 rewrite 对 refcount 保持中性，也就是 dead-instruction elimination 允许删除的同一类 value。由于 SSA operands 按 value 相等，identical pure ops 在 identical operand values 上会计算出 identical results。Nullary constant 和 address materializations（`const_*`、`data_addr`）故意不去重：在每个 use 处重新物化更便宜，不需要在整个跨度内保持活跃，所以 CSE 只处理 computations。
包含 exception handlers 的函数会跳过：它们的 handler blocks 可以通过 terminator graph 中不存在的隐式 edges 到达，因此 terminator-graph dominator 可能在运行时被 throw 绕过，这会使 cross-block redirect 不可靠。这个限制与 branch simplification 相同。CSE 使用 [Dominance Analysis](#dominance-analysis)，并与 branch simplification 共享 `cfg::has_exception_handlers`。

### Loop-Invariant Code Motion

第五个注册的 transform（`src/ir_passes/licm.rs`）会把 operands 在 loop 中不变的 pure computation 从 loop body 移到 loop preheader，使其只运行一次而不是每次迭代运行。它基于 [dominator tree](#dominance-analysis) 构建 [loop forest](#loop-analysis)，然后对每个 loop 把 invariant set 增长到固定点：当某条 instruction 的每个 operand 要么由同一 loop 中也将被 hoist 的另一条 instruction 定义，要么由支配 preheader 的 definition 定义时，该 instruction 就是 invariant。

只有 **pure**（`Effects::PURE`）、至少有一个 operand，且 result 为 `NonHeap`/`Persistent` 的 instructions 符合条件；purity 表示 value 只依赖 operands，op 既不读取可变状态也不会 fault，因此把它无条件提前到 preheader 执行一次是安全的，即使它原来的 block 只在部分迭代中运行也没有 speculation hazard；ownership 边界让移动对 refcount 保持中性。Nullary constant/address materializations 不会 hoist（重新物化比让它们跨 loop 保持活跃更便宜）。Loops 以内层优先处理，并立即应用 moves，因此在多个嵌套 loops 中不变的 value 会在一次 run 中到达最外层 preheader。Instructions 会在 block 的 instruction lists 之间迁移，它们的 result `ValueDef`s（block + index）会在最后统一重算，使 value table 匹配新布局。没有检测到 preheader 的 loops，以及包含 exception handlers 的 functions，会被跳过。（PHP loop variables 存在 local slots 中，通过 impure `load_local` 重新加载，因此 invariant source expression 还不能 hoist；随着更多 values 以 SSA 形式跨 loops 流动，该 pass 的可触达范围会扩大。）

### Dead Instruction Elimination

第六个注册的 transform（`src/ir_passes/dead_inst.rs`）会移除那些结果-producing、其 values 在 CFG 上不再 live，且 effect metadata 表明它们是 pure 的 instructions。它用 successor live-in sets 计算 liveness，用这些 live-out values 加上 terminator uses 初始化每个 block 的 backward walk，然后把 dead instructions neutralize to `nop`。

Neutralization 会保留 instruction/result value table slots，因此 validator 不需要 value renumbering 或 block-list surgery。Read-only、allocation、mutation、refcounting、output、warning、fatal、throw 和 deopt-capable instructions 会保持不变；dead read elimination 会推迟到后续 pass，直到能证明 PHP 和 ownership behavior 等价。一个 block 内的 dead chains 会在 backward walk 中折叠；跨 block 边界的 chains 会在 fixed-point pass driver 重新计算 liveness 后收敛。

### Dead Store Elimination

第七个注册的 transform（`src/ir_passes/dead_store.rs`）会移除那些 stored value 在被覆盖或函数退出前的任何路径上都不会再读取的 `store_local` instructions。不同于以 SSA-value 粒度工作的 dead instruction elimination，本 pass 会针对 local *slots* 推理：它运行 backward dataflow，在每个 `load_local` 处 gen 一个 slot，在每个 `store_local` 处 kill 它，并迭代到固定点，使 live-out 成为 successor live-in sets 的并集。如果一个 store 之后该 slot 不是 live，那么该 store 就是 dead，因此中间没有 read 的较早 store 也会死亡。

本 pass 仅限于满足以下条件的 slots：（1）普通 `PhpLocal`，（2）非引用计数存储类型（`!php_type_needs_lifetime_tracking`），（3）只被普通 `load_local`/`store_local` 命名，（4）永远不会通过 reference address-escape。引用计数限制是关键正确性边界：assignment lowering 会把 refcounted slot 的 store 包在独立的 `acquire`/`release` instructions 中，并释放之前的 occupant，因此只删除 `store_local` 会泄漏 acquired value。Scalar slots 没有这类 ownership ops，它们的 scope-exit cleanup 是 no-op，所以移除 dead scalar store 对 refcount 保持中性。任何其他命名 slot 的 op（ref-cell promote/alias/release、`unset_local`、static-local 或 global access）都会让 slot 不符合条件，因为它可能以本 pass 不建模的方式读取或 alias 该 slot。

条件（4）很微妙：by-reference call argument（例如 `new Box($v)`，构造函数参数是 `public int &$value`）或 by-reference closure capture（`use (&$x)`）会 lower 为普通 `load_local`，而 codegen 之后会把该 argument value 回溯到定义它的 `load_local`，并传递 slot 的 *address*，因此 callee 会通过 forward `load_local`-only liveness 看不到的 alias 读取或修改 slot。由于 single-function pass 没有 callee signatures（哪些 parameters 是 by-reference），该 pass 使用 conservative default-deny allowlist：只要某个 slot 的任何 `load_local` result 被非已证明 value-only consumer 消费，该 slot 就会被排除（value-only consumer 包括 arithmetic、comparison、cast、output、store、string 或 refcount op）。每个 call、object construction、closure capture、property/array access，以及任何 future opcode 都会被视为可能的 by-reference escape。先把 load 喂给 value-only op 是安全的，因为 codegen 只会把 *direct* `load_local` 回溯到 slot。

这补充了 peephole pass 的 per-block、value-equality store forwarding（它会删除存储同一个 resident value 的 store）：dead store elimination 基于 liveness，并且跨 block 边界，因此能移除 stored result 从未被观察到的 *different* value store。Stores 会被 neutralized to `nop`；之后给已移除 store 供值的 pure value 会在后续 driver sweep 中由 dead instruction elimination 清理。

### Branch Simplification

第八个注册的 transform（`src/ir_passes/branch_simplify.rs`）会用三种方式剪枝 CFG：

- **Constant-condition folding** — 条件解析为 constant（`const_bool`、通过 PHP truthiness 的 `const_i64`，或 `const_null`）的 `cond_br` 会变成指向 taken edge 的 unconditional `br`。以 `const_i64`/`const_bool` scrutinee 为条件的 `switch` 会折叠为指向匹配 case（或 default）的 `br`。例如 `while (true)` loop 会 lower 为 constant `cond_br`，该 fold 会将其折叠。
- **Empty-block jump threading** — 非 entry block 如果没有 parameters、只有 `nop` instructions，并且以 unconditional `br` 结束，就是 forwarding block。指向它的 edges 会重定向到 forwarding chain 的末端（带 cycle detection）。由于 forwarding blocks 没有 parameters，每条进入它们的 edge 都携带空 arguments，所以 retargeting 不需要 argument rewriting。
- **Unreachable-block neutralization** — 从 entry 不再可达的 blocks 会把 terminator 设为 `Unreachable`，并把 instructions 重写为 `nop`。

和其他 passes 一样，unreachable blocks 会**就地** neutralize，而不是物理删除。Validator 要求 `block.id == index`，并把 unreachable block 中的任何 *use* 报告为 `UseNotDominated`（unreachable block 的 dominator set 会收缩为自身）。Neutralizing 会清除每个 use，包括 terminator 和 instruction operands，因此 block 保持 valid，同时 block、value 和 instruction table slots 保留索引。这样避免了 renumbering，更关键的是保持 `try` handler block-id tokens（编码在 `try_push_handler` immediates 中）正确。使用任何 exception-handling opcode 的 functions 会整体跳过，因为它们的 handler blocks 可以通过 terminator graph 中不存在的 implicit edges 到达，所以只基于 terminator 的 reachability 可能错误地 neutralize live handler。移除 edges 只会扩大 dominator sets，而 threaded forwarding blocks 不携带 definitions，因此 simplification 永远不会让之前 valid 的 use 失效；cross-block cascades 会通过 fixed-point driver 收敛。

### Small-Function Inlining

`src/ir_passes/inline.rs` 是一个**跨函数**、module-level pass（不是 per-function `IrPass` 集合的成员），会在 call site 把小 callee 的 body 拼接到 caller 中。原 call 被移除；callee 的 blocks 以 fresh ids 移植，arguments 通过 `store_local` 绑定到 remapped parameter slots，caller block 跳入移植后的 entry，每个 callee `return` 都变成指向 fresh continuation block 的 `br`，并通过 block parameter 传递 result。

Callee 只有在最多 **24** 条非 `nop` instructions、entry block 有 0 个 parameters、不包含 exception-handling ops、不是 generator/fiber wrapper，并且**非递归**时才会被 inline。递归判断包括直接和互递归，通过 call-graph cycle analysis 排除任何可达自身的 function（per-caller fuel cap 兜底保证终止）。Eligibility 还进一步限制在可证明 ownership-safe 的 **destructor-free** boundary 和 body 上（scalars、strings，以及 destructor-free types 的 arrays/unions；没有 by-ref/variadic params，也没有 ref-cell/static/global/capture locals）。

跨边界正确性不依赖显式 epilogue：拼接把 `return` 替换为 `br`，绕过 callee 的隐式 codegen epilogue cleanup，因此移植会复现该 cleanup 的 per-slot decisions：parameter slots 和直接返回的 slots 变成 epilogue-excluded `HiddenTemp`（匹配 callee，因为它的 argument 是 borrowed，return ownership 被 moved 给 caller），而普通 refcounted internal locals 仍为 `PhpLocal`，仍由 host epilogue 释放。destructor-free 限制使一个残余差异不可观察，也就是把这些 internal frees 延迟到 host epilogue（没有 `__destruct`，没有 array identity），因此 reference-counting 和 copy-on-write behaviour 逐字节保留。两个 call-site guards 完成正确性：arguments 必须在无 coercion 的情况下绑定到 parameter slots（storage types 匹配，因此 spread/named-boxed-`mixed` 和 `int`↔`float` sites 保持普通 calls），并且任何 `string` argument 都必须来自 non-scratch source（`const_str`/`load_local`），因为拼接后的 body 会在 host frame 中运行 callee 的 statement-boundary concat-buffer reset，否则会释放仍在使用中的 scratch string argument。Call-site name resolution（`call` Data immediates 和 `function_variant_call` include-variant refs）使用 mutation 前取得的 snapshots，因此 rewrite loop 不会在持有 function 时 alias module。

## Dominance Analysis

`src/ir_passes/dominance.rs` 是一个只读 sidecar analysis（类似 liveness，不是 driver transform），会构建每个 function 的 dominator tree，这是后续 dominance-aware cross-block passes（common-subexpression elimination、natural-loop detection、loop-invariant code motion）的基础。

`compute_dominance` 使用 Cooper–Harvey–Kennedy 迭代算法：它按 reverse postorder 遍历 reachable blocks，并把每个 block 的 immediate dominator 重算为已处理 predecessors 的 idoms 交集，也就是按 postorder numbers 做 two-finger walk，直到固定点。它对任意 CFG 都能收敛，并且在 EIR 产生的小函数上速度很快。

生成的 `DominanceInfo` 可回答 `immediate_dominator`、自反的 `dominates` / `strictly_dominates`、dominator-tree `children`（top-down traversal）、`nearest_common_dominator` 和 `is_reachable`。只有从 entry 可达的 blocks 参与；unreachable blocks（branch simplification 会就地 neutralize 但保留在 table 中）会从 tree 中排除，并回答 `false`/`None`。内部 idom table 在 entry 处 self-rooted，使 intersect 和 dominance walks 不需要特殊情况即可终止。该 analysis 使用共享的 `cfg::predecessors` helper。

## Loop Analysis

`src/ir_passes/loops.rs` 是一个只读 sidecar analysis，在 dominator tree 上构建 function 的 natural-loop forest，是 loop-invariant code motion 和其他 loop optimizations 的基础。

`compute_loops(func, &dominance)` 首先找出 **back edges**，也就是 CFG edge `latch -> header` 且 target 支配 source，因此 loop detection 是 dominance 之上的薄层。共享同一个 header 的 back edges 形成一个带多个 latches 的 [`NaturalLoop`]。Loop body 是 header 加上每个能不经过 header 到达 latch 的 block，通过对 reachable predecessors 进行 backward walk 找到，并在 header 停止。

每个 `NaturalLoop` 暴露其 `header`、`latches`、排序后的 `blocks`（带 binary-search `contains`）、nesting forest 中的 `parent` 和 `depth`，以及 `preheader`。**Nesting** 按 block-set containment 判断：当 loop `A` 的 header 位于 loop `B` 的 body 中时，`A` 嵌套在 `B` 中，immediate parent 是满足条件的最小 `B`；lowerer 发出 reducible CFGs，所以 loops 要么正确嵌套，要么互不相交。`LoopInfo` 还可按 block/function 回答 `innermost_loop`、`loop_depth`、`is_loop_header` 和 `back_edges`。

**Preheader** 被检测为 header 唯一 reachable 的 out-of-loop predecessor，且该 predecessor 的唯一 successor 是 header。PHP loops lower 为 slot-based CFGs（loop variable 位于 local slot，而不是 block parameter），因此分支进入 header 的 init block 是天然 preheader；当进入 loop 的路径在多个 blocks 或 conditional 之间共享时，就不存在 preheader，需要 preheader 的 optimization 会插入它。

## AST Lowering Catalogue

Lowering 必须覆盖 `src/parser/ast/expr.rs` 和 `src/parser/ast/stmt.rs` 中的每个 variant。下面的目录对当前源码树是穷尽的。

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
