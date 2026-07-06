**来源：**默认后端 `src/ir_lower/`、`src/ir/` 和 `src/codegen_ir/`；共享的目标平台/运行时基础设施位于 `src/codegen/abi/`、`src/codegen/runtime/`、`src/codegen/platform/`、`src/codegen/emit.rs` 和 `src/codegen/data_section.rs`；冻结的旧版 AST 后端位于 `src/codegen/expr.rs`、`src/codegen/expr/`、`src/codegen/stmt.rs`、`src/codegen/stmt/`、`src/codegen/functions/` 和 `src/codegen/builtins/`；intrinsic 方法注册表：`src/intrinsics.rs`

代码生成器（codegen）是编译器的核心。默认路径会先把已经检查和优化过的 AST 降低为 EIR，然后根据该 EIR 为选定目标平台生成原生汇编文本。临时的 `--ast-backend` 回退路径仍会直接遍历已检查的 AST 并生成汇编，因为旧版 emitter 还保留在代码树中。

elephc 目前支持不止一个后端。AArch64 仍然是代码库和本文档中最清晰的参考路径，同时 Linux `x86_64` 也是受支持的后端，并且会经过同一套高层 lowering 流程。

下面大多数片段使用 AArch64，因为它的指令形式紧凑，相关文档也已经详细解释过。涉及目标平台特定 ABI 或运行时行为的章节会明确指出 Linux `x86_64`。

AArch64 入门请参见 [Introduction to ARM64 Assembly](arm64-assembly.md)。

## 概览

在默认路径中，`src/ir_lower/` 遍历已检查、已优化的 AST，生成经过验证的 EIR；`src/codegen_ir/` 则为每个 EIR 函数、指令和 terminator 生成汇编。CLI 的主要输出是**用户程序汇编**；共享运行时 helper 通常会单独汇编，并从运行时对象缓存中复用。面向用户的 `.s` 文件仍然具有以下结构：

```asm
.global _main
.align 2

; --- user-defined functions ---
_fn_factorial:
    ...
    ret

; --- class methods ---
_method_Point_move:
    ...
    ret

; --- main program ---
_main:
    ; prologue (stack frame setup)
    ; global argc/argv initialization
    ; program statements
    ; epilogue (exit syscall)

; --- deferred closures emitted after _main ---
_closure_1:
    ...
    ret

; --- data section ---
.data
_str_0: .ascii "hello"
_float_0: .quad 0x400921FB54442D18

; --- source markers used by --source-map ---
; @src line=12 col=5
```

trait 组合不会增加单独的运行时分发层。trait 会在类型检查期间被展平到每个具体类中，然后再叠加继承元数据。Codegen 仍会生成 `_method_Class_method` / `_static_Class_method` 标签，但实例调用现在使用由 `class_id` 索引的 vtable slot，因此子类 override 可以通过继承方法正常生效。

具体的 directive 和符号修饰会因目标平台而异。上面的示例有意采用 AArch64 风格，但同样的结构阶段也适用于 Linux `x86_64`。

调用旧版库式入口 `codegen::generate(...)` 时，elephc 仍会显式暴露两个部分，即 `(user_asm, runtime_asm)`。正常 CLI 路径会降低到 EIR，调用 `codegen_ir::generate_user_asm_from_ir_with_options(...)`，并链接运行时对象缓存；这样重复编译时无需每次重新汇编同一份共享运行时文本。

## Emitter

**文件：**`src/codegen/emit.rs`

`Emitter` 是一个简单的字符串缓冲区，带有若干 helper 方法：

| 方法 | 输出 |
|---|---|
| `instruction("mov x0, #42")` | `    mov x0, #42\n`（带缩进） |
| `label("_main")` | `_main:\n` |
| `comment("load variable")` | `    ; load variable\n` |
| `raw(".global _main")` | `.global _main\n`（无缩进） |
| `blank()` | `\n` |

所有汇编都会先构造成文本，然后写入 `.s` 文件。

语句生成还会注入形如 `@src line=<N> col=<M>` 的源码标记。它们作为注释会被汇编器忽略，但当启用 `--source-map` 时，CLI 后续可以扫描这些标记来构建简单的 source map sidecar 文件。

## 运行时拆分、缓存和源码映射

编译器的 codegen/runtime 交接现在会产生三个不同的产物：

1. **用户汇编** — 由选定后端生成到每次构建的 `.s` 文件中
2. **运行时对象** — 由共享运行时汇编一次，并按编译器版本、目标平台、堆大小和生成的运行时汇编哈希缓存在 `~/.cache/elephc/`（或 `XDG_CACHE_HOME`）下
3. **可选 source map** — 从用户汇编注释中嵌入的 `@src` 标记生成的 JSON sidecar

这意味着正常 CLI 构建不再在汇编前把运行时文本拼接到每个输出汇编文件中。它们会：

- 准备或复用缓存的运行时对象
- 只把用户 `.s` 文件汇编成 `file.o`
- 将 `file.o` 与缓存的运行时对象链接

source map 文件有意保持简单。目前它存储 `(asm_line, php_line, php_col)` 条目列表，让工具和人工都能在不需要完整 DWARF 调试信息的情况下，把生成的汇编关联回原始 PHP 语句。

AST 优化器仍然有意在后端选择之前运行。默认 EIR 后端运行时，常量表达式和一部分死控制流已经被移除；EIR 还补充了函数范围内的值与控制流形状，供线性扫描寄存器分配器（`src/ir_passes/`，参见 [The IR](the-ir.md)）和未来 IR 优化使用。当选择 `--ast-backend` 时，旧版 AST 后端看到的也是同一份优化后的 AST。

## 生成模式：可执行文件与 cdylib

Codegen 以 `--emit` flag 选择的两种生成模式之一运行。`executable`（默认）会生成本文一直描述的独立二进制形态：`main` 入口点、顶层语句以及进程退出 epilogue。`cdylib` 则生成共享库：不会生成 `main` 主体，并且会在用户函数之后为每个标记了 `#[Export]` 的函数追加一组 C-ABI trampoline，以及四个 `elephc_*` 生命周期入口点（参见 [Shared Libraries](../beyond-php/cdylib.md)）。

Cdylib 生成还会把 emitter 切换到位置无关模式（`pic_data_refs`）：通过 `abi::symbols` helper 生成的全局数据引用会改为经由 GOT 解析（x86_64 上是 `@GOTPCREL`，AArch64 上是 `:got:`/`:got_lo12:`），而不是直接的 PC-relative 寻址；运行时对象也会以 PIC 变体单独生成和缓存。在 ELF 目标上，最后一轮 pass（`src/codegen/visibility.rs`）会为每个内部全局追加 `.hidden` directive，使 `.so` 只导出公开 ABI，内部运行时状态不能被已加载模块抢占。

## Context

**文件：**`src/codegen/context.rs`

`Context` 跟踪代码生成期间的状态：

```rust
pub struct Context {
    pub variables: HashMap<String, VarInfo>,  // variable → type + stack offset
    pub stack_offset: usize,                  // next available stack slot
    pub loop_stack: Vec<LoopLabels>,          // for break/continue
    pub return_label: Option<String>,         // for early returns
    pub functions: HashMap<String, FunctionSig>,
    pub function_variant_groups: HashSet<String>, // include-loaded function dispatchers
    pub deferred_closures: Vec<DeferredClosure>, // closures emitted after current function
    pub deferred_fiber_wrappers: Vec<DeferredFiberWrapper>,
    pub deferred_callback_wrappers: Vec<DeferredCallbackWrapper>,
    pub constants: HashMap<String, (ExprKind, PhpType)>, // compile-time constants
    pub global_vars: HashSet<String>,         // globals active in current scope
    pub static_vars: HashSet<String>,         // statics active in current scope
    pub ref_params: HashSet<String>,          // pass-by-reference params
    pub local_ref_cell_flags: HashMap<String, LocalRefCellFlag>, // compiler-created ref cells
    pub in_main: bool,                        // whether we're compiling top-level code
    pub all_global_var_names: HashSet<String>,
    pub all_static_vars: HashMap<(String, String), PhpType>,
    pub closure_sigs: HashMap<String, FunctionSig>,
    pub callable_param_sigs: HashMap<(String, String), FunctionSig>,
    pub closure_captures: HashMap<String, Vec<(String, PhpType, bool)>>,
    pub runtime_callable_builtin_wrappers: HashMap<String, String>,
    pub runtime_callable_extern_wrappers: HashMap<String, String>,
    pub runtime_callable_static_method_wrappers: HashMap<String, String>,
    pub first_class_callable_targets: HashMap<String, CallableTarget>,
    pub variable_fcc_label: HashMap<String, String>,
    pub classes: HashMap<String, ClassInfo>,
    pub interfaces: HashMap<String, InterfaceInfo>,
    pub traits: HashSet<String>,
    pub enums: HashMap<String, EnumInfo>,
    pub packed_classes: HashMap<String, PackedClassInfo>,
    pub current_class: Option<String>,
    pub extern_functions: HashMap<String, ExternFunctionSig>,
    pub extern_classes: HashMap<String, ExternClassInfo>,
    pub extern_globals: HashMap<String, PhpType>,
    pub return_type: PhpType,
    pub activation_prev_offset: Option<usize>,
    pub activation_cleanup_offset: Option<usize>,
    pub activation_frame_base_offset: Option<usize>,
    pub pending_action_offset: Option<usize>,
    pub pending_target_offset: Option<usize>,
    pub nested_concat_offset_offset: Option<usize>,
    pub pending_return_value_offset: Option<usize>,
    pub try_slot_offsets: Vec<usize>,
    pub next_try_slot_idx: usize,
    pub finally_stack: Vec<FinallyContext>,
}
```

每个变量都有一个 `VarInfo`：

```rust
pub struct VarInfo {
    pub ty: PhpType,                  // current runtime storage type
    pub static_ty: PhpType,           // declared/static type retained for checks and calls
    pub stack_offset: usize,          // offset from frame pointer (x29)
    pub ownership: HeapOwnership,     // NonHeap / Owned / Borrowed / MaybeOwned
    pub epilogue_cleanup_safe: bool,  // false for locals populated through still-ambiguous control-flow/alias paths
}
```

`HeapOwnership` 是仅供 codegen 使用的所有权格，用于描述流经栈 slot 的堆支持值：

- `NonHeap` — 整数、浮点数、bool、null、resource、原始指针
- `Owned` — 该 slot 明确拥有当前堆支持值
- `Borrowed` — 该 slot 当前别名到其他位置拥有的堆存储
- `MaybeOwned` — 控制流合并了所有权状态不同的堆支持路径

这个格现在贯穿主要的局部变量路径。函数 epilogue 只会对被归类为 `Owned` 且仍标记为 `epilogue_cleanup_safe` 的 slot 重新启用清理；来自仍不明确控制流或别名路径的局部变量会被有意跳过。诸如 `$this`、按引用参数、globals 和 statics 等特殊别名会被明确排除在 epilogue 清理之外，因为当前 frame 并不拥有它们的存储。复制容器的 builtins 现在也会在元素/值类型为堆支持类型时分发到专用的 `_refcounted` 运行时 helper，从而在新容器成为 owner 之前保留嵌套的 array/hash/object/string payload。

与异常相关的字段让 codegen 能够把 `try` / `catch` / `finally` 串接进非局部控制流。函数和 `_main` frame 会向运行时清理栈发布 activation record，预先为 `setjmp` buffer 分配 handler slot，并使用 `finally_stack` 加上 `pending_*` slot 来延迟 `return`、`break` 和 `continue`，直到最内层的 `finally` 主体执行完。

### 标签生成

`ctx.next_label("while")` 会生成 `_while_1`、`_while_2` 等标签。全局原子计数器确保标签不会在函数或编译单元之间冲突。

## Data Section

**文件：**`src/codegen/data_section.rs`

字符串字面量和浮点常量存储在 `.data` section 中：

```rust
pub struct DataSection {
    entries: Vec<(String, Vec<u8>)>,          // string label → bytes
    float_entries: Vec<(String, u64)>,        // float label → bit pattern
    counter: usize,                           // next unique label suffix
    dedup: HashMap<Vec<u8>, String>,          // avoid duplicate strings
    float_dedup: HashMap<u64, String>,        // avoid duplicate floats
}
```

当 codegen 遇到 `"hello"` 时，它会调用 `data.add_string(b"hello")`，返回一个标签（`_str_0`）和长度（`5`）。相同字符串会被去重，两个 `"hello"` 字面量会共享同一个标签。

浮点数按其原始 64 位 IEEE 754 位模式（`.quad` directive）存储。
