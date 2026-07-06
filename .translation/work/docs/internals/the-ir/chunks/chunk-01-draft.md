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
