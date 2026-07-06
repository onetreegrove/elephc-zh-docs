---
title: "代码生成器"
description: "类型化 AST 节点如何变成所选目标平台的原生汇编。"
sidebar:
  order: 7
---

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

## 旧版 AST 表达式代码生成

**文件：**`src/codegen/expr.rs`、`src/codegen/expr/`

冻结的 `--ast-backend` 路径仍使用 `emit_expr()` 接收一个表达式节点，并生成会把结果留在标准寄存器中的代码。默认后端则通过 `src/ir_lower/` 中的 EIR lowering 和 `src/codegen_ir/` 中的指令 lowering 抵达同一组 ABI/运行时 helper。顶层旧版 `expr.rs` 文件主要分发到 `expr/` 下更聚焦的 helper，例如 `scalars.rs`、`variables.rs`、`binops/`、`arrays.rs`、`compare/`、`calls/` 和 `objects/`。

| 类型 | 结果位置 |
|---|---|
| `Int` / `Bool` / `Void` / `Resource` | `x0` |
| `Float` | `d0` |
| `Str` | `x1`（pointer）、`x2`（length） |
| `Array` / `AssocArray` / `Iterable` | `x0`（heap pointer） |
| `Mixed` | `x0`（指向 boxed mixed cell 的指针） |
| `Object` | `x0`（heap pointer） |
| `Callable` / `Pointer` | `x0` |
| `Buffer` / `Packed` | `x0`（heap pointer） |
| `Union` | `x0`（与 Mixed 相同，即 boxed runtime-tagged payload） |

### 表达式 AST 分发覆盖范围

旧版表达式 dispatcher 有意保持很薄。它把每个 `ExprKind` variant 路由到下面某个聚焦的 lowering 路径；EIR 路径则通过 `src/ir_lower/expr/` 映射同样的 PHP 可见覆盖范围：

| Variants | Lowering 路径 |
|---|---|
| `StringLiteral`, `IntLiteral`, `FloatLiteral`, `BoolLiteral`, `Null`, `Negate`, `Not`, `BitNot`, `Cast`, `Print`, `ErrorSuppress` | 标量、强制转换、stdout 和诊断 helper |
| `Variable`, `This`, `PreIncrement`, `PostIncrement`, `PreDecrement`, `PostDecrement`, `Assignment` | 变量加载/存储和赋值表达式 helper |
| `BinaryOp`, `InstanceOf`, `NullCoalesce`, `Pipe`, `Ternary`, `ShortTernary`, `Throw` | 运算符、比较、call-pipe、分支和异常感知表达式 helper |
| `ArrayLiteral`, `ArrayLiteralAssoc`, `ArrayAccess`, `Spread`, `Match` | 索引数组、关联数组、解包、字符串索引和 match 表达式 helper |
| `FunctionCall`, `NamedArg`, `ClosureCall`, `ExprCall`, `Closure`, `FirstClassCallable` | 共享的调用参数规划器、闭包 wrapper 和 callable 分发 helper |
| `ConstRef`, `ClassConstant`, `ScopedConstantAccess`, `MagicConstant` | 编译期常量和类常量加载。`MagicConstant` 应该已经在 codegen 之前由前端降低。 |
| `NewObject`, `NewDynamic`, `NewScopedObject`, `NewDynamicObject`, `PropertyAccess`, `DynamicPropertyAccess`, `NullsafePropertyAccess`, `NullsafeDynamicPropertyAccess`, `StaticPropertyAccess`, `MethodCall`, `NullsafeMethodCall`, `StaticMethodCall` | 对象分配（包括经由 `NewDynamic` 的 `new $var()` 和内部 runtime-class-string 工厂 `NewDynamicObject`）、属性/成员访问、nullsafe 链 lowering、vtable 分发和 late-static-binding helper |
| `PtrCast`, `BufferNew`, `Yield`, `YieldFrom` | 指针/buffer 扩展和 generator 状态机 lowering |

### Intrinsic Calls

大多数方法调用使用普通的类元数据路径：求值 receiver，物化参数，选择 vtable 或直接方法目标，然后调用已生成的 PHP 方法主体。少量由运行时管理的核心对象不能把合成 PHP stub 当作真实实现。对于这些对象，`src/intrinsics.rs` 会按 PHP 类和方法名记录一个 `IntrinsicCall` 条目，`src/codegen/expr/objects/dispatch/intrinsic.rs` 则会在普通 receiver 和参数设置完成后生成直接的运行时 helper 调用。

当前 intrinsic 调用点覆盖 `Fiber` 实例/静态 API，以及由运行时支持的 `Generator` 方法表面。具有相同方法名的用户类不受影响，因为查找会包含已解析的类名。

### 字面量

```php
42        →  mov x0, #42
3.14      →  adrp x9, _float_0@PAGE  /  add x9, ...  /  ldr d0, [x9]
"hello"   →  adrp x1, _str_0@PAGE  /  add x1, ...  /  mov x2, #5
true      →  mov x0, #1
null      →  movz x0, #0xFFFE  /  movk x0, ...  (load null sentinel)
```

大整数（> 65535 或负数）使用 `movz` + `movk` 序列。参见 [ARM64 Instruction Reference](arm64-instructions.md#loading-large-constants)。

### 二元运算的 push/pop 模式

像 `$a + $b` 这样的二元运算需要两个操作数同时位于寄存器中，但 `emit_expr` 对每个表达式都使用相同寄存器。解决办法是：**把左侧结果 push 到栈上，求值右侧，然后再把左侧 pop 回来**。

```php
$a + $b
```

```asm
; Step 1: evaluate left ($a)
ldur x0, [x29, #-8]              ; x0 = $a

; Step 2: push left onto stack
str x0, [sp, #-16]!              ; save x0 to stack, decrement sp

; Step 3: evaluate right ($b)
ldur x0, [x29, #-16]             ; x0 = $b  (overwrites left!)

; Step 4: pop left back into a different register
ldr x1, [sp], #16                ; restore left into x1, increment sp

; Step 5: operate
add x0, x1, x0                   ; x0 = left + right
```

对于字符串（使用两个寄存器），push 会保存 `x1` 和 `x2`，pop 会把它们恢复到 `x3` 和 `x4`。

对于浮点数，push/pop 使用 `d0`/`d1`：

```asm
str d0, [sp, #-16]!              ; push left float
; ... evaluate right → d0 ...
ldr d1, [sp], #16                ; pop left float into d1
fadd d0, d1, d0                  ; d0 = left + right
```

### 比较运算符

比较使用 `cmp`（整数）或 `fcmp`（浮点数），后接 `cset`：

```php
$x > 5
```

```asm
; ... push $x, evaluate 5 ...
cmp x1, x0                       ; compare left with right
cset x0, gt                      ; x0 = 1 if greater, 0 otherwise
```

结果始终位于 `x0`，值为 0 或 1（`PhpType::Bool`）。

### 短路逻辑运算符

`&&`、`||`、`and` 和 `or` 使用**短路求值**：如果左侧已经决定结果，就不会求值右侧。`xor` 也是逻辑运算符，但它会求值两个操作数，因为异或需要两个 truthiness 值。

```php
$a && $b
```

```asm
; evaluate $a
cmp x0, #0
b.eq _sc_end_1          ; if $a is falsy, skip $b entirely (result = 0)
; evaluate $b
cmp x0, #0
cset x0, ne             ; result = whether $b is truthy
_sc_end_1:
```

### 字符串拼接

`.` 运算符调用运行时的 `__rt_concat`：

```php
"hello" . " world"
```

```asm
; push left string (x1, x2)
; evaluate right string → x1, x2
; pop left → x3, x4
; call concat
mov x3, ...              ; left ptr
mov x4, ...              ; left len
bl __rt_concat           ; result → x1 (ptr), x2 (len)
```

关于 `__rt_concat` 的工作方式，参见 [The Runtime](the-runtime.md)。

### 位运算

位运算符（`&`、`|`、`^`、`~`、`<<`、`>>`）作用于整数，并生成单条 ARM64 指令：

```php
$a & $b    →  and x0, x1, x0     // bitwise AND
$a | $b    →  orr x0, x1, x0     // bitwise OR
$a ^ $b    →  eor x0, x1, x0     // bitwise XOR
$a << $b   →  lsl x0, x1, x0     // logical shift left
$a >> $b   →  asr x0, x1, x0     // arithmetic shift right (preserves sign)
~$a        →  mvn x0, x0         // bitwise complement (one's complement)
```

和其他二元运算一样，位运算也使用 push/pop 模式：求值左侧、push、求值右侧、pop 左侧、应用运算。

### Spaceship operator

spaceship operator（`<=>`）会根据比较结果返回 -1、0 或 1。它使用条件选择指令：

```php
$a <=> $b
```

```asm
; ... push $a, evaluate $b ...
cmp x1, x0                      ; compare left with right
cset x0, gt                     ; x0 = 1 if left > right, else 0
csinv x0, x0, xzr, ge           ; if left < right: x0 = ~0 = -1 (all ones)
```

`csinv`（conditional select invert）会反转 `xzr`（零寄存器），在条件不满足时产生 -1。

对于浮点数，会用 `fcmp` 替代 `cmp`，但仍采用相同的 `cset`/`csinv` 模式。

### 数组 union

当 `+` 的两个操作数都是数组时，codegen 会把表达式路由到 PHP 数组 union lowering，而不是数值加法。索引数组调用 `__rt_array_union`：它克隆左操作数，并只追加右侧中左侧缺失 key 对应的数值后缀。关联数组调用 `__rt_hash_union`：它克隆左侧 hash，按插入顺序遍历右侧 hash，并且只插入克隆中不存在的 key。混合索引/关联操作数会返回 hash 结果：`__rt_array_hash_union` 会先把左侧索引位置映射为整数 hash key，再合并右侧 hash；`__rt_hash_array_union` 则克隆左侧 hash，并把右侧索引位置作为整数 key 探测。

### Null coalescing operator

`??` 运算符在左操作数非 null 时返回左操作数，否则返回右操作数：

```php
$x ?? "default"
```

```asm
; evaluate $x
; compare with null sentinel (0x7FFFFFFFFFFFFFFE)
b.ne _nc_done_1          ; if not null, keep left value
; evaluate "default"      ; otherwise, use right side
_nc_done_1:
```

null 检查会把值与 [null sentinel](memory-model.md) 比较。该运算符是右结合的（`$a ?? $b ?? $c` = `$a ?? ($b ?? $c)`）。

Null coalescing assignment 会被解析为 `$x = $x ?? expr`，但赋值 lowering 会识别这个确切形态并生成条件存储：

```php
$x ??= "default";
```

生成的代码会加载 `$x`，在其非 null 时跳过赋值，并且只在 null 路径上求值/存储右侧。这保留了 PHP 的 `??=` 短路行为，并避免把已经 owned 的堆值重新写回同一个局部 slot。

### Pipe operator

PHP 8.5 的 `value |> callable` 通过 `src/codegen/expr/calls/pipe.rs` 降低。
`emit_expr()` 会先把左值存入隐藏的局部 slot，确保左侧在 callable 目标之前可观察地完成求值。随后它会使用该隐藏局部作为唯一位置参数，构建一个合成的一参数调用。

pipe lowering 会尽可能委托给现有调用路径：first-class function 目标变成 `FunctionCall`，first-class static method 目标变成 `StaticMethodCall`，first-class instance method 目标变成 `MethodCall`，局部 callable 变量变成 `ClosureCall`，其他 callable 表达式变成 `ExprCall`。因此，参数规划、ABI 物化、所有权和诊断都能与普通调用保持一致。

### Error-control operator

`@` 运算符会降低为一对带作用域的运行时诊断抑制调用：

1. 调用 `__rt_diag_push_suppression`
2. 正常求值操作数
3. 以适当的 ABI 结果形态保存操作数结果
4. 调用 `__rt_diag_pop_suppression`
5. 恢复操作数结果

异常 handler frame 还会在 `setjmp()` 之前快照当前抑制深度，并在 `longjmp()` 进入 catch 分发后恢复它。这可以防止 `@` 内部抛出的表达式把 warning 抑制泄漏到后续代码。

### Nullsafe operator

`?->` 运算符会把 nullable receiver 经由 nullable 和 union 存储所使用的 boxed mixed 路径降低。Codegen 会展平包含 nullsafe segment 的 postfix 链，只求值一次 base，并在 nullsafe receiver 为 null 时分支到共享的 boxed-`null` 结果。该分支会跳过链的其余部分，包括后续普通 `->` segment、数组索引、方法参数和 callable 参数。如果普通 segment 后续从非短路路径接收到真实 null 值，它仍会遵循 PHP 的 warning 或 fatal 行为。

### 类型强制转换

当类型需要匹配时（例如 int + float），codegen 会插入转换指令：

```asm
scvtf d0, x0             ; convert signed integer (x0) → double (d0)
fcvtzs x0, d0            ; convert double (d0) → signed integer (x0)
```

`.`（concat）运算符也会强制转换非字符串：

- `Int` → 调用 `__rt_itoa` 得到字符串
- `Float` → 调用 `__rt_ftoa`
- `Bool true` → 字符串 "1"
- `Bool false` / `Null` → 空字符串（长度 0）

### 常量引用

```php
const MAX = 100;
echo MAX;
```

使用 `const` 或 `define()` 声明的常量会在编译期解析。当 codegen 遇到 `ConstRef` 时，它会查找常量值并将其作为字面量生成：整数会生成 `mov x0, #100`，字符串则会从 data section 加载字符串标签。`define()` 调用点仍会生成每个常量的运行时 seen flag，使调用仅在第一次运行时定义时返回 `true`，重复尝试时返回 `false` 并产生可抑制的 warning。

Enum case 复用同一思路，但通过 enum 元数据而不是标量常量实现：parser 输出会对 `Color::Red` 使用 `ExprKind::ScopedConstantAccess`，codegen 会检测 enum receiver，并加载 runtime data 中生成的规范 enum-case 符号。`Enum::from()` / `Enum::tryFrom()` 等 helper builtins 会通过 `Context` 中携带的 checker/codegen enum table 进行 lowering；缺失的 `Enum::from()` 值会构造一个可 catch 的 `ValueError`，并带有兼容 PHP 的 backing-value 消息。

### 指针值和强制转换

指针表达式以普通 64 位地址形式保存在 `x0` 中：

- `ptr($var)` 计算一个栈 slot 或全局 slot 的地址，并在 `x0` 中返回
- `ptr_null()` 加载零地址
- `ptr_cast<T>($p)` 只改变 checker 看到的静态类型 tag，因此 codegen 会生成内部表达式并保持地址不变
- 指针打印通过 `__rt_ptoa`，它会在写出之前把地址格式化为 `0x...` 字符串

### Buffer 分配和 packed 热路径访问

`buffer_new<T>(len)` 会直接从 `ExprKind::BufferNew` 降低：codegen 求值元素数量，从类型元数据加载已检查的元素 stride，并调用 `__rt_buffer_new`。`x0` 中得到的指针引用的是连续的 `[length][stride][payload...]` 块，而不是 PHP array/hash 结构。

当 `T` 是标量 POD 类型时，读写会使用从 buffer base 加上 `index * stride` 的直接地址计算。当 `T` 是 `packed class` 时，codegen 会把 buffer 元素 stride 与 `packed_classes` 元数据中的字段偏移结合起来，并对 packed payload 生成直接的带类型 loads/stores。

### 函数调用

```php
my_func($a, $b, $c)
```

1. 求值每个参数，并把结果 push 到栈上
2. 把参数 pop 到正确的 ABI 寄存器（整数为 `x0`-`x7`，浮点数为 `d0`-`d7`，字符串每个占两个寄存器）
3. 如果某个堆支持参数是从现有 owner 借用的（例如局部变量或容器读取），则在传给 callee 前 retain 它
4. `bl _fn_my_func` — branch with link（保存返回地址）
5. 结果根据返回类型位于 `x0`/`d0`/`x1`+`x2`

命名参数调用会拆分求值顺序和 ABI 顺序。`src/codegen/expr/calls/args.rs` 按源码从左到右求值参数，把任何乱序值存入临时 slot，在后续命名表达式运行后验证 spread prefix，然后按 ABI 顺序物化最终参数列表。命名参数之前的 spread prefix 只会求值一次；多个 prefix spread 会先合并，再执行运行时长度/覆盖检查；针对必需参数的过短位置 spread 会失败，而不是越过数组 payload 读取。运行时关联数组 spread 是动态命名 provider：它们按参数名查找字符串 key，为位置 slot 回退到数值 key，并让每个参数的 missing/default 分支决定是否存在必需值。Built-in 和 extern 命名调用会在其规范化位置 emitter 运行前使用相同的源码顺序预求值步骤；可变 built-in 会把目标参数标记为 ref-like，使预求值不会把写入重定向到临时值。Extern 调用先保留 PHP 源码求值顺序，然后才加载 C ABI 寄存器。

## 闭包代码生成

### 匿名函数和箭头函数

闭包（`function($x) { ... }`）和箭头函数（`fn($x) => ...`）会被编译为独立的带标签函数，类似用户定义函数。关键区别是**延迟生成**：闭包主体不会内联生成。具体流程如下：

1. **在闭包表达式位置**：codegen 生成唯一入口标签（例如 `_closure_1`），在 `.data` 中创建静态 callable descriptor，并把 descriptor 地址加载到 `x0`。该 descriptor 包含签名/default/by-reference/variadic 元数据、捕获与隐藏参数绑定、调用形态等 side record。然后 descriptor 指针会作为 `Callable`（8 字节）存入变量的栈 slot。

2. **主体会被延迟**：闭包的参数列表、主体语句、捕获变量和标签会被 push 到 `ctx.deferred_closures`。这避免了在当前函数的指令流中间生成函数代码。

3. **在 `_main` 之后**：所有延迟闭包都会像用户定义函数一样，作为独立带标签函数生成（prologue、body、epilogue）。

### `use` 捕获

闭包可以通过 `use ($var1, $var2)` 从外层作用域捕获变量：

```php
$greeting = "Hello";
$fn = function($name) use ($greeting) {
    echo $greeting . " " . $name;
};
```

只有显式 `use (...)` 捕获会存储在 AST 中，并作为隐藏闭包参数转发。箭头函数仍被解析为闭包，但它们使用 `is_arrow = true` 且 `captures` 列表为空。

AST 会把捕获的变量名存入 `Closure` 表达式的 `captures` 字段。在调用点，捕获变量会作为**额外参数**在显式参数之后传递：

1. **在闭包表达式位置**：捕获变量名和类型会与延迟闭包一起记录在 `ctx.closure_captures` 中。
2. **在调用点**（`$fn("World")`）：codegen 查找捕获变量，从调用方作用域求值它们，并在显式参数之后作为额外参数传递。
3. **在闭包主体中**：捕获值作为额外参数进入，并存入局部栈 slot，使其可像普通局部变量一样访问。

这意味着捕获是**按值**传递的：在闭包内修改捕获变量不会影响外层作用域（符合 PHP 语义）。

### 闭包调用

当闭包变量被调用（`$fn(1, 2)`）时，codegen 会：

1. 求值每个参数，并把结果 push 到栈上
2. 从变量的栈 slot 把闭包 descriptor 加载到 `x9`
3. 从 descriptor 的 entry slot 加载原生入口地址
4. 在把参数 pop 到 ABI 寄存器时临时 push `x9`
5. pop 回 `x9` 并调用 `blr x9` — 通过寄存器进行间接分支

`blr`（Branch with Link to Register）类似 `bl`，但目标地址来自寄存器而不是标签。正是它让闭包可以工作：编译器在编译期并不知道会调用哪个函数，因此使用间接跳转。

### 作为 callback 参数的闭包

`array_map`、`array_filter`、`array_reduce`、`array_walk`、`usort`、`uksort`、`uasort` 和 `preg_replace_callback` 等 built-in 函数接受 callback 值。PHP callable 存储会携带 descriptor 指针；callback 运行时接收从该 descriptor 加载出的原生 entry，以及一个可选 environment pointer，然后通过 `blr` 调用该 entry。

对于通过 `array_map`、`array_filter`、`array_reduce`、`array_walk`、`usort`、`uksort`、`uasort` 和 `preg_replace_callback` 等 callback 运行时传入的捕获闭包，codegen 会构建一个临时 callback environment，其中包含原始 entry 地址及其隐藏的 `use (...)` 值。运行时把该 environment 传给生成的 callback wrapper，wrapper 会在调用闭包之前重新物化原始可见参数和隐藏捕获。`array_map()`、`array_filter()`、`array_reduce()`、`array_walk()`、`usort()`、`uksort()`、`uasort()` 和 `preg_replace_callback()` 会把 descriptor-valued callable 变量和 `callable` 参数路由到 descriptor-backed callback wrapper，因此存储的闭包捕获和 first-class-callable receiver environment 来自 descriptor，而不是来自可能已经改变的源码局部变量。这些 callback 运行时还会为运行时 callable-array 变量（例如 `[$object, $method]` 或 `[$class, $method]`）选择 descriptor case，并在运行时 receiver/class 和方法字符串匹配 public 方法后构建同样的 descriptor callback environment。这些运行时还可以把分支形态的捕获 callable 表达式路由到 descriptor-backed callback wrapper：environment 存储选中的 descriptor，wrapper 把可见参数装箱进临时 Mixed 参数数组，调用 descriptor 的 uniform invoker，为 callback 运行时强制转换或丢弃 boxed 结果，并在生成的 invoker 周围保留 runtime-loop callee-saved 寄存器。`CallbackFilterIterator` 和 `RecursiveCallbackFilterIterator` 使用该 descriptor environment 的堆支持变体，使分支选中的捕获 descriptor 以及运行时选中的 callable-array 变量或字面量 descriptor 能保持附着在 iterator 对象和递归子 filter 上。`iterator_apply()` 对分支形态的捕获 callback 和运行时选中的 callable-array 变量使用同一个 uniform descriptor invoker，其 callback 参数数组会在 iterator loop 之前求值一次，并在每次调用时复用。产生字符串的 descriptor-backed `array_map()` 和 `preg_replace_callback()` 调用会在释放 invoker 结果之前，把字符串结果从 boxed Mixed 值中 detach 出来。`call_user_func()` 和 `call_user_func_array()` 可以直接通过 callable descriptor 分发：带隐藏上下文的闭包和 first-class-callable 值会分配运行时 descriptor 副本，其静态 header 后跟 16 字节捕获 slot。动态 callback 分发使用携带 descriptor 标签的 `codegen::callable_dispatch` case，其中包含 PHP 可见名称、签名元数据、defaults、by-reference flag、variadic 元数据和隐藏捕获。Descriptor-selected callback 会把 entry slot 与用户函数和已生成的 closure/FCC wrapper 比较；当匹配的 case 暴露 invoker 时，调用点切回实际 descriptor 并调用 uniform wrapper。运行时字符串名 callback 会与用户函数、extern-wrapper、builtin-wrapper 和静态方法名进行大小写不敏感比较，物化匹配的 descriptor，然后调用 descriptor 的 uniform invoker wrapper。编译期静态方法 callable array 也会对直接变量和字面量调用、`call_user_func()` 调用和 `call_user_func_array()` 调用使用 static-method descriptor，包括 indexed spread 之前的关联 variadic tail 和位置 prefix。直接实例方法 callable-array 变量调用会从存储的 callable array slot 读取 receiver，而直接字面量调用会在可见调用参数之前求值 receiver；二者随后都会构建 receiver-prefixed descriptor 参数容器。直接 invokable-object 变量调用会从局部对象构建同样的 receiver-prefixed descriptor 参数容器，并使用 object-invoke 调用形态。带 receiver 绑定的 `call_user_func()` 调用如果只有一个 spread source，就会把该 source 容器通过 receiver-prefix normalizer 和 descriptor invoker 传递，而不是回退到直接方法生成。带 receiver 绑定的调用如果包含位置 prefix 后跟 indexed spread，会构建一个原始 Mixed-slot 索引参数数组，把 receiver 作为 descriptor slot zero 前置，追加 prefix 值，合并克隆的 indexed spread tail，然后让 descriptor normalizer 克隆并装箱该容器以供调用。把 spread prefix 与命名参数组合在一起的直接分支选中表达式调用，会从源码顺序的位置 prefix 加上命名 suffix 条目构建临时 Mixed hash；而唯一参数 segment 是一个 spread source 的直接调用，会把该 source 容器传给同一个 descriptor invoker。带位置 prefix 后跟 indexed spread 的直接 descriptor 调用使用同一个原始 Mixed-slot 索引容器 builder，但不添加 receiver slot。当局部调用点不再具备可信的静态签名或捕获列表时，对 callable 变量或数组元素的间接调用会回退到 descriptor invoker；indexed 容器中的变量参数、indexed spread 之前的位置 prefix，以及关联命名参数 hash 会被编码为 ref-cell marker，使生成的 invoker 可以应用 descriptor 中的运行时 by-reference flag，或为 by-value 参数解引用同一个 marker。Invoker 接收 `(descriptor, boxed argument container)`，自行加载 entry slot，在存在隐藏捕获时从 descriptor 重新加载，基于 boxed 容器 tag 分支到 indexed-array 或 associative-hash 物化，为声明为 array 的参数解箱 boxed array/hash payload，应用匹配签名，并返回 boxed `mixed`。`call_user_func_array()` descriptor invoker 接收一个克隆的临时参数容器，该容器被拓宽为 boxed `Mixed`，因此 wrapper 按 callable 签名共享，而不是按调用方的静态元素类型或参数数组形态共享。当 `call_user_func_array()` 目标是 by-reference callback 且接收字面量参数数组时，codegen 会为 by-reference 位置中的变量元素传递 frame-slot 地址，而不是加载数组 payload 值。

接收 descriptor 值的 extern `callable` 参数使用单独的 C-ABI trampoline 路径。Codegen 为每个调用点生成一个可变 descriptor slot 和一个 trampoline 符号；extern 调用把 retained descriptor 存入该 slot，把 trampoline 地址传给 C，然后 trampoline 在调用 descriptor invoker 之前把传入的标量/指针 callback 参数装箱。这让只有原始函数指针 slot 的 C API 能保留闭包捕获、first-class 方法 receiver 和分支选中的 descriptor 状态，而无需改变 C 签名。

当 callable 目标携带上下文时，First-class callable wrapper 会复用这条隐藏参数路径。`$obj->method(...)` 会把 receiver 记录为隐藏捕获；非局部 receiver 表达式会在 wrapper 创建前求值一次并存入隐藏临时值。`static::method(...)` 会记录转发的 called-class id，或在实例方法中记录 `$this`，从而为直接 callable 调用以及会转发 environment 的 callback 路径保留 late static binding。

## Generator 代码生成

**文件：**`src/codegen/functions/generator/`、`src/codegen/runtime/generators/`、`src/codegen/expr/objects/dispatch/vtable.rs`

包含 `yield` 的函数或闭包主体不会作为普通函数主体生成。Codegen 会生成两个符号：

1. `_fn_<name>` — 一个 wrapper，分配堆上的 `GeneratorFrame`，把它标记为内建 `Generator` 对象，把受支持的标量参数/捕获复制到 frame slot，清零局部 slot，并返回 frame 指针。
2. `_fn_<name>__resume` — 状态机入口点。状态 `0` 进入主体；每个 yield 都有一个编号 resume label。在 yield 处，resume 函数会把 key/value 装箱到 Mixed cell 中，替换 frame 的 last key/value slot，存储下一个 state index，并返回调用方。

Generator 闭包复用与普通延迟闭包相同的路径，但其隐藏的 `use (...)` 捕获会与可见参数一起复制进 generator frame。`yield from` 会把活跃的内部 generator 存储到 frame 的 `delegated_iter` slot，并通过用户可见 `Generator` 方法所使用的同一组 `__rt_gen_*` 运行时 helper 恢复它。

生成的 `Generator` 对象使用自定义 payload layout，而不是普通 PHP 属性。`current`、`key`、`valid`、`next`、`rewind`、`send`、`throw` 和 `getReturn` 的方法分发会在 vtable 查找前被拦截，并直接路由到 `__rt_gen_*`。AArch64 和 Linux `x86_64` 都遵循同样的高层状态机模型；wrapper、resume dispatcher 和运行时 helper emitter 会在内部选择目标平台特定的指令序列。

## Fiber 代码生成

**文件：**`src/codegen/expr/objects/allocation.rs`、`src/codegen/expr/objects/dispatch/`、`src/codegen/expr/objects/fiber_callable.rs`、`src/codegen/expr/objects/fiber_wrapper.rs`、`src/codegen/functions/fiber_wrapper.rs`、`src/codegen/runtime/fibers/`

`Fiber` 是内建类，但 codegen 不会通过普通对象构造器和方法分发路径降低它。`new Fiber($callable)` 会被拦截，把原始字符串 callback、callable-array 和 invokable-object 形态物化为 callable descriptor，然后委托给 `__rt_fiber_construct`；后者会分配更大的运行时管理 Fiber 对象，创建受保护的原生栈，存储 callable descriptor 指针，并记录用于把 Fiber start 值适配到 callback ABI 的生成 wrapper 标签。存储的实例方法 callable array 会把 `$callback[0]` 中的 receiver 绑定进 descriptor capture，因此后续对源 callable 变量的写入无法改变 Fiber 主体。内联 receiver 表达式、invokable-object 表达式，以及运行时选中的 callable-array 变量或字面量会在构造时求值一次，然后 receiver 才被存入 descriptor。

每个被接受的 Fiber callback 都会获得一个延迟 entry wrapper，与延迟闭包主体一起生成。Wrapper 在 Fiber 栈上运行，从 `start_args[0..6]` 重新加载 boxed `start()` 值，把它们解箱为 callback 声明的参数类型，从存储的 callable descriptor 的运行时捕获 slot 重新加载隐藏捕获或方法 receiver，从该 descriptor 加载原始 entry，以普通 ABI 物化方式调用它，并把最终返回值重新装箱为 `mixed`。

实例和静态 Fiber 方法也会被拦截：

- `$fiber->start(...)` 会把最多七个 boxed `mixed` start 参数 spill 到 Fiber 对象中，然后调用 `__rt_fiber_start`；callable 捕获和 receiver 已经存储在 descriptor 中，不会被 start 参数覆盖。
- `$fiber->resume($value)`、`$fiber->throw($exception)`、`$fiber->getReturn()` 和状态 predicate 会直接分支到各自的 `__rt_fiber_*` 运行时 helper。
- `Fiber::suspend($value)` 和 `Fiber::getCurrent()` 会降低为运行时 helper 调用，而不是普通静态方法分发。

AArch64 和 Linux `x86_64` 使用同一套高层 lowering。最终的寄存器移动、临时栈 layout、直接/间接调用和 frame setup 都通过 ABI 模块完成，使 Fiber wrapper 遵循各目标平台的调用约定，而不是在共享代码中硬编码 ARM64 寄存器名。

## 关联数组代码生成

关联数组使用存储在堆上的 hash table。Codegen 在各个层面都不同于索引数组：

### 字面量创建

```php
$m = ["name" => "Alice", "age" => "30"];
```

1. 用初始容量和值类型 tag 调用 `__rt_hash_new` → `x0` = hash table pointer
2. 对每个 key-value pair：求值 key（string → `x1`/`x2`），求值 value，调用 `__rt_hash_set`

### 访问

```php
$m["name"]
```

1. 在栈上保存 hash table pointer
2. 求值 key 表达式 → `x1`/`x2`（string）
3. 调用 `__rt_hash_get` → `x0` = found（0/1），`x1` = value_lo，`x2` = value_hi，`x3` = 每个 entry 的 value tag
4. 根据值类型把结果移动到标准寄存器；如果静态结果是 `Mixed`，则先把 payload 装箱到堆 cell 中

### 关联数组上的函数

`array_key_exists`、`in_array`、`array_keys`、`array_values` 等 builtin 函数会在编译期按数组类型分发：

- `PhpType::Array` → 使用索引运行时例程（例如边界检查、线性扫描）
- `PhpType::AssocArray` → 使用 hash table 例程（例如 `__rt_hash_get`、`__rt_hash_iter_next`）

### 关联数组上的 `foreach`

当 `foreach` 迭代 `PhpType::AssocArray` 时，lowering 不同于索引数组：

1. 在栈上保存 hash 指针和迭代游标（`0` 表示“从 header.head 开始”）
2. 调用 `__rt_hash_iter_next`
3. 如果 `x0 == -1`，退出循环
4. 否则保存返回的游标，把 `x1`/`x2` 存入可选 key 变量，并根据推断出的元素类型把 `x3`/`x4`/`x5` 存入 value 变量；`Mixed` 循环变量会按需复用或分配 boxed mixed cell
5. 生成循环主体，然后分支回 iterator 调用

这会保留 PHP 风格的插入顺序，因为 `__rt_hash_iter_next` 遍历的是 hash table 的链式插入顺序链，而不是扫描物理 bucket。

hash table 例程细节参见 [The Runtime](the-runtime.md)，hash table 内存布局参见 [Memory Model](memory-model.md)。

## 字符串索引代码生成

同一个 `ArrayAccess` AST 节点也覆盖 `$str[1]` 或 `$str[-1]` 这样的字符串索引。在 `src/codegen/expr/arrays.rs` 中，`emit_array_access()` 会检查 `PhpType::Str`，并内联降低该操作：

1. 在求值 index 表达式时保存字符串指针/长度
2. 按字符串末尾调整负索引
3. 把小于 `-len` 的偏移 clamp 到开头，把越过末尾的偏移 clamp 到末尾
4. 把字符串指针推进到选中的 byte
5. 当偏移未越界时返回单字符字符串（`x1` + `x2 = 1`），否则返回空字符串

因此该行为类似 slice，但不会调用 `substr()` 或专用运行时 helper。

## 语句代码生成

**文件：**`src/codegen/stmt.rs`、`src/codegen/stmt/`

`emit_stmt()` 同样拆分到 `stmt/` 下聚焦的 helper 中：赋值/存储逻辑、数组语句、include-once guard 和控制流 lowering（`branching`、`foreach`、`loops`）现在都位于很薄的顶层 dispatcher 之外。`stmt/includes.rs` 生成 resolver 产生的 `IncludeOnceMark` 和 `IncludeOnceGuard` 节点所使用的 `.comm` flag 与分支序列，以及 include 点加载隐藏函数实现时使用的 active-variant store。借用结果 retain、局部 slot 所有权更新、static-init guard、索引数组元数据 stamping 等小型共享 statement-side policy 现在位于 `stmt/helpers.rs`，而不是让 `stmt.rs` 自身膨胀。存储 lowering 也已拆分：`stmt/storage.rs` 只是边界，`storage/locals.rs` 处理普通 global/static 符号访问，`storage/extern_globals.rs` 负责 extern-global load/store 约定。赋值 lowering 也更深入地拆了一层：`stmt/assignments/locals.rs` 处理普通 local/global/ref 写入，而 `stmt/assignments/properties.rs` 现在跨 `properties/target.rs`、`magic_set.rs` 和 `storage.rs` 编排属性写入。数组索引写入现在也遵循同样模式：`stmt/arrays/assign.rs` 只是 dispatcher，而 `stmt/arrays/assign/buffer.rs` 和 `assoc.rs` 隔离非索引容器路径，`stmt/arrays/assign/indexed.rs` 则跨 `indexed/prepare.rs`、`normalize.rs`、`store.rs` 和 `extend.rs` 编排索引数组写入。Branching lowering 现在也采用同样形态：`stmt/control_flow/branching.rs` 只是边界，而 `branching/if_stmt.rs` 和 `branching/switch_stmt.rs` 负责不同 lowering 路径。异常 lowering 遵循同样结构：`stmt/control_flow/exceptions.rs` 编排高层 try/catch/finally 流程，而 `exceptions/handlers.rs`、`catches.rs` 和 `finally.rs` 负责更低层的 handler stack、catch matching 和 pending-action/finally 分发机制。循环 lowering 也已拆分：`stmt/control_flow/loops.rs` 现在只是边界，`loops/iterative.rs` 处理 `for`/`while`/`do...while`，`loops/exits.rs` 负责 `break`/`continue`/`return`。`foreach` lowering 现在同样遵循该模式：`stmt/control_flow/foreach.rs` 会在 `foreach/indexed.rs`、`foreach/assoc.rs` 和 `foreach/iterator.rs` 之间分发，覆盖数组、hash、`Iterator`、`IteratorAggregate` 和 object-backed `iterable` 值。

### 语句 AST 分发覆盖范围

语句 dispatcher 会把 `StmtKind` variant 映射到存储、控制流、声明、include 或扩展路径：

| Variants | Lowering 路径 |
|---|---|
| `Echo`, `ExprStmt`, `Throw`, `Synthetic` | 直接语句 helper、表达式分发、异常 throw，或已经降低的语句序列 |
| `Assign`, `RefAssign`, `TypedAssign`, `ArrayAssign`, `NestedArrayAssign`, `ArrayPush`, `ListUnpack`, `PropertyAssign`, `StaticPropertyAssign`, `PropertyArrayPush`, `PropertyArrayAssign`, `StaticPropertyArrayPush`, `StaticPropertyArrayAssign` | Local/global/static 存储、引用别名、数组存储、解构和属性存储 helper |
| `If`, `IfDef`, `While`, `DoWhile`, `For`, `Foreach`, `Switch`, `Try`, `Break`, `Continue`, `Return` | Branching、编译期条件 lowering、循环、foreach 分发、switch lowering、异常/finally 控制流、循环退出和 return epilogue |
| `Include`, `IncludeOnceMark`, `IncludeOnceGuard`, `FunctionVariantGroup`, `FunctionVariantMark` | resolver 生成的 include guard 和 include-loaded function variant activation |
| `NamespaceDecl`, `NamespaceBlock`, `UseDecl`, `ConstDecl` | 主要是前端/name-resolution 产物；常量仍可通过 codegen context 使用 |
| `FunctionDecl`, `ClassDecl`, `EnumDecl`, `InterfaceDecl`, `TraitDecl`, `PackedClassDecl` | 延迟函数/方法生成，以及由元数据驱动的类、enum、interface、trait 和 packed-record setup |
| `Global`, `StaticVar` | 由符号支持的局部别名和每函数 static 存储 |
| `ExternFunctionDecl`, `ExternClassDecl`, `ExternGlobalDecl` | 语句生成期间仅注册；表达式/调用 lowering 使用收集到的 FFI 元数据 |

### Echo 和 print

```php
echo $x;
echo "a", "b";
$status = print $x;
```

1. 按源码顺序求值每个 `echo` 表达式 → 结果在寄存器中
2. 检查 null/false（若是则跳过打印，这匹配 PHP 中 `echo false` 不输出任何内容的行为）
3. 从 [ABI module](#the-abi-module) 调用 `emit_write_stdout()`

`print` 表达式复用同一个 stdout helper，然后把整数 `1` 写入表达式结果寄存器，使该值可被赋值、拼接或传给另一个表达式。

### 赋值

```php
$x = expr;
```

1. 求值表达式
2. 如果结果是借用的堆值，则在局部 slot 成为新 owner 前 retain 它
3. 覆盖堆支持 slot 时，释放 `$x` 之前 owned 的堆值
4. `emit_store()` — 把结果写入 `$x` 的栈 slot，并把堆支持类型的局部 slot 归类为 `Owned`

`int $x = 42;` 或 `buffer<int> $xs = buffer_new<int>(8);` 等带类型局部声明，在 checker 已将 `StmtKind::TypedAssign` 解析为具体 `PhpType` 后，会共享同一条存储路径。

### 常量声明

```php
const MAX = 100;
```

`ConstDecl` 注册编译期常量。值存储在 codegen context 中，并在任何通过 `ConstRef` 引用该常量的位置直接替换。不需要运行时存储或栈分配。

### 全局变量

```php
$x = 10;
function inc() {
    global $x;
    $x++;
}
```

函数内部的 `global` 语句声明变量引用的是全局存储，而不是局部栈 slot。Codegen 使用 BSS 分配的存储（`_gvar_NAME`，每个 16 字节）表示全局变量：

1. 在 `global $x;` 处：变量会在 context 中标记为 global。当前值从 `_gvar_x` 加载到局部栈 slot。
   局部视图会被跟踪为 BSS-backed owner 的借用别名。
2. 对全局变量赋值时：codegen 通过 `adrp`/`add`/`str` 写入 BSS 存储（`_gvar_x`），而不是写入局部栈 slot（或除局部栈 slot 外也写入 BSS）。
3. 在 `_main` 中：当 main 作用域赋值给任何函数声明为 `global` 的变量时，该值也会写入 `_gvar_NAME`，以便函数读取。

### Extern 声明

`ExternFunctionDecl`、`ExternClassDecl` 和 `ExternGlobalDecl` 在 codegen 期间是仅注册语句。它们的元数据已经由类型检查器收集并复制进 `Context`，因此 `emit_stmt()` 会把声明本身视为 no-op，而后续表达式 codegen 会使用记录的 FFI 数据。

Extern globals 通过 GOT-relative 寻址（`adrp ...@GOTPAGE` / `ldr ...@GOTPAGEOFF`）加载，而不是通过普通栈或 BSS slot。

### Static 变量

```php
function counter() {
    static $count = 0;
    $count++;
    echo $count;
}
```

Static 变量的值会跨函数调用保持。每个 static 变量获得两个 BSS slot：

- `_static_FUNC_VAR`（16 字节）— 存储持久值
- `_static_FUNC_VAR_init`（8 字节）— 初始化 flag（0 = 尚未初始化）

`static $count = 0;` 的 codegen：

1. 检查 init flag；如果已经初始化，跳到加载持久值
2. 如果尚未初始化：求值 init 表达式，存储到 BSS slot，把 init flag 设为 1
3. 把持久值加载到局部栈 slot

该每次调用的局部 slot 被跟踪为 `Borrowed`；持久 static 存储仍是长生命周期 owner。

在函数 epilogue 中，标记为 static 的变量会被写回它们的 BSS 存储。

### Static 属性

Static 属性按每个有效声明类属性使用一个全局 16 字节存储 slot：

- `_static_prop_CLASS_PROP` 存储当前值 payload
- 继承的 static 属性会指回声明类 slot，直到子类重新声明该属性
- 重新声明的 static 属性会获得单独的子类 slot

程序启动时，`_main` 会在用户语句运行前求值 static 属性默认值并存入这些 slot。`ClassName::$count` 这样的读取会直接从已解析符号加载，赋值则会在类型强制转换和对堆支持值释放旧值之后，把新结果存回同一符号。`static::$count` 使用转发的 called-class id（或实例方法中的 `$this`）在运行时选择重新声明的后代 slot；如果 late-bound slot 是 private 且当前方法作用域无法访问，生成的代码会发出 fatal private-static-property 诊断。

### List 解包

```php
[$a, $b, $c] = [10, 20, 30];
```

简单的局部位置解构仍是 `ListUnpack` 语句。Codegen 会：

1. 求值右侧表达式（数组）
2. 在栈上保存数组指针
3. 对列表中的每个变量：从数组中加载对应索引处的元素，将其存入变量栈 slot，并把堆支持元素标记为源容器的借用别名

更丰富的 PHP 解构模式会在检查和 codegen 之前由 parser 降低为普通合成赋值。跳过的条目不生成赋值，带 key 的条目变成用给定 key 读取数组，嵌套模式为嵌套源数组绑定隐藏临时值，非局部目标则复用与 `$arr[$i] = ...`、`$arr[] = ...`、`$obj->prop = ...` 和 static-property 写入相同的赋值 emitter。

### If / Elseif / Else

```php
if ($cond1) { body1 } elseif ($cond2) { body2 } else { body3 }
```

```asm
; evaluate $cond1
cmp x0, #0
b.eq _elseif_1           ; skip to next branch if falsy

; body1
b _end_if_1               ; done — skip all remaining branches

_elseif_1:
; evaluate $cond2
cmp x0, #0
b.eq _else_1

; body2
b _end_if_1

_else_1:
; body3

_end_if_1:
```

### While loop

```php
while ($cond) { body }
```

```asm
_while_1:                  ; ← continue jumps here
; evaluate $cond
cmp x0, #0
b.eq _end_while_1         ; exit if falsy ← break jumps here

; body
b _while_1                 ; loop back

_end_while_1:
```

### For loop

```php
for ($i = 0; $i < 10; $i++) { body }
```

```asm
; emit init ($i = 0)

_for_1:
; evaluate condition ($i < 10)
cmp x0, #0
b.eq _end_for_1

; body

_for_cont_1:               ; ← continue jumps here
; emit update ($i++)
b _for_1

_end_for_1:                 ; ← break jumps here
```

### Foreach

```php
foreach ($arr as $v) { body }
```

对于索引数组：

1. 在栈上保存数组指针、长度和 index counter（3 个 16 字节 slot）
2. 循环：加载当前索引处的元素；当静态元素类型为 `Mixed` 时，通过运行时 `value_type` tag 解箱；存入 `$v`；并把堆支持循环变量归类为被迭代容器的借用别名
3. 分支回条件检查
4. 清理：释放 48 字节

对于关联数组，参见 [Associative array codegen](#associative-array-codegen)：循环会存储 hash 指针和游标，然后通过 `__rt_hash_iter_next` 前进。

对于 `Iterator` 对象，codegen 会把 receiver 停放在一个 16 字节栈 slot 中，分发 `rewind()`，然后通过 `valid()`、`key()`、`current()` 和 `next()` 驱动循环。key 和 value 会被装箱为 `Mixed`，因为具体运行时 payload 可能因 iterator 实现而异。`IteratorAggregate` 值会先分发 `getIterator()`，然后复用相同的 iterator 循环路径。类型为 `iterable` 的值会通过运行时 heap-kind 和 interface 元数据分支，使数组、直接 `Iterator` 对象和 aggregate-backed 对象选择正确的 lowering。

在第一次 `valid()` 调用之前，foreach 目标 slot 会被规范化为 boxed `Mixed`。这让空 iterator 与 PHP 兼容：已有目标变量保持有效 mixed cell，新鲜循环变量保持 null-like，receiver 别名则在循环清理前保持存活。

### Break / Continue

`break` 会生成一个到所选 loop/switch end label 的 `b`（无条件跳转）。
`continue` 会生成一个到所选 continue label 的 `b`（对 `while` 是条件检查，对 `for` 是 update，对 PHP 风格的 `switch` 内 `continue` 是 switch end label）。

`Context` 中的 `loop_stack` 跟踪嵌套循环和 switch 的标签。
`break 2;` 和 `continue 2;` 等多级形式会反向索引该栈。每个 `LoopLabels` 条目还携带 `sp_adjust` 字段，使多级退出和 return 能在跳转到所选目标或共享函数 epilogue 之前，撤销任何被跳过的 switch-subject 临时栈 slot。如果退出跨过 `finally`，codegen 会记录所选目标，并在恢复分支之前运行活跃的 `finally` 链。

类型检查器会拒绝会从 `finally` 主体跳出的 `break` / `continue`，因此 codegen 只需要把受保护的 `try` 或 `catch` 主体中的合法退出通过 `finally_stack` 路由。

### Exceptions 和 `finally`

异常 lowering 位于 `src/codegen/stmt/control_flow/exceptions.rs`。基本策略是：

1. 求值被抛出的对象，并把它发布到 `_exc_value`
2. 调用 `__rt_throw_current`，它会展开 activation record，并 `longjmp` 到最近的 handler
3. 对于 `try`，生成一个 `_setjmp` resume point，以及 `_exc_handler_top` 中的链式 handler record
4. 通过 `__rt_exception_matches` 按 class id 或 interface id 测试每个 catch 目标
5. 通过 `finally_stack` 路由 `return`、`break`、`continue` 和 rethrow，使每个外层 `finally` 都在控制流离开受保护区域前运行。Checker 会拒绝从 `finally` 内部发起并以外层 loop/switch 为目标的 `break` / `continue`。

这意味着 `finally` 是普通控制流 lowering 的一部分，而不是单独的运行时 pass。运行时只负责展开 frame 并选择 landing pad；编译器生成的标签仍会决定执行是在匹配的 `catch`、`finally` 还是外层 handler 中恢复。

### Switch

```php
switch ($x) {
    case 1: echo "one"; break;
    case 2: echo "two"; break;
    default: echo "other"; break;
}
```

1. 求值 subject 表达式一次，并把结果 push 到栈上
2. 对每个 case：pop subject，求值 case value，比较（整数使用 `cmp` + `b.ne`，字符串使用 `bl __rt_str_eq`）
3. 如果匹配：生成 case body，其中可能包含 `break`（跳到 end label）或 fall through 到下一个 case
4. Default case：无条件生成 body
5. 所有 case 之后的 end label

Switch 使用 loop stack，因此 case body 中的 `break` 会跳到 switch end label，而不是外层循环。

### Match expression

Match 是表达式（返回值），不是语句。它使用严格比较（`===`），且没有 fall-through：

```php
$result = match($x) {
    1 => "one",
    2 => "two",
    default => "other",
};
```

1. 求值 subject，push 到栈上
2. 对每个 arm：把 subject 与该 arm 的 pattern list 中每个 pattern 比较
3. 如果任意 pattern 匹配：求值该 arm 的结果表达式，跳到 end
4. Default arm：无条件求值结果
5. 结果留在标准寄存器中（`x0`、`d0` 或 `x1`/`x2`）

## 类代码生成

### 对象分配（`new ClassName(...)`）

当 codegen 遇到 `NewObject` 表达式时：

1. **计算对象大小**：`8 + (num_properties × 16) + dyn_props_slot` — class ID 占 8 字节，完整继承 layout 中每个属性占 16 字节，若类携带 `#[\AllowDynamicProperties]`，还会为 dynamic-property hash pointer 增加一个可选 8 字节 slot
2. **分配堆内存**：以计算出的大小调用 `__rt_heap_alloc`
3. **零初始化**：把所有属性 slot 清零
4. **存储 class ID**：在 offset 0 写入类标识符
5. **应用默认值**：对具有默认值的属性，在其固定 offset 处求值并存储默认值
6. **调用构造器**：如果类暴露 `__construct`，则把新对象指针作为 `x0`（`$this`）传入，后跟构造器参数，然后分支到类元数据中记录的实现标签（可能来自继承构造器）

声明了 PHP 8.2 `#[\AllowDynamicProperties]` 属性的类会保留一个尾随的 per-object hash slot，使未声明属性的写/读能经由运行时 side table 路由，而不是在编译期失败。

结果是 `x0` 中的对象指针。

### Attribute reflection objects

`new ReflectionClass(...)`、`new ReflectionMethod(...)` 和 `new ReflectionProperty(...)` 会被 `src/codegen/expr/objects/reflection.rs` 拦截，而不是依赖普通用户定义构造器主体。类型检查器已经在普通调用参数规划之后强制其 class/member 参数为编译期字符串，因此 codegen 可以直接查找目标 `ClassInfo`，并用新构建的 `array<ReflectionAttribute>` 填充 private `__attrs` slot。

`src/codegen/reflection.rs` 负责共享的物化路径。它会分配每个合成 `ReflectionAttribute`，写入已解析的 `__name`，从受支持的字面量 attribute 参数构建 `array<mixed>` `__args` payload，并存储确定性的 `__factory` id。随后 `ReflectionAttribute::newInstance()` 会在 `src/codegen/class_methods.rs` 中生成为这些 factory id 上的分支表；每个分支会用捕获的字面量 args 构造真实 attribute 类，fallback 会在无法物化已定义 attribute 类时返回 `null`。

`_class_attribute_*` 运行时数据表仍会从同一组 `ClassInfo` 字段生成类级 attribute 元数据，但受支持的 Reflection owner 构造器会在编译期物化，不会为类、方法或属性执行运行时名称查找。

### 类型检查（`$obj instanceof ClassName`）

`ExprKind::InstanceOf` 会精确求值左侧一次，从生成的元数据中物化目标 class 或 interface id，并在 `x0` 中返回 boolean。直接对象值会调用 `__rt_exception_matches`，也就是异常 catch lowering 使用的同一个元数据 matcher，因此继承类和已实现 interface 会通过同一组 parent-id 和 class-interface table 处理。

对于命名目标，当左侧被降低为 `Mixed` 或 `Union` 时，codegen 会改为调用 `__rt_mixed_instanceof`。该 helper 会解开嵌套 mixed box，对 scalar、array、null 和 unknown payload tag 返回 `false`，并且只把对象 payload 转发到 `__rt_exception_matches`。这让 nullable 和 union 对象检查保持 PHP 兼容，而不会把 boxed mixed cell 自身当作对象指针。

命名目标会在 codegen 前解析。命名 class/interface 会变成具体元数据 id，`self` 和 `parent` 在当前词法类上下文中解析，`static` 使用转发的 called-class id 实现 late static binding。动态目标会在左侧求值后再求值和验证；字符串目标通过生成的大小写不敏感 class/interface 名称元数据解析，对象目标加载目标对象的运行时 class id，无效目标 payload 会分支到 fatal 运行时诊断，而非对象左侧 payload 会在该验证步骤之后变成 `false`。

### 属性访问（`$obj->prop`）

属性访问通常使用从 `ClassInfo.property_offsets` 编译期计算出的固定 offset：

```asm
; $obj->prop where prop resolved to offset 24
ldur x0, [x29, #-offset]            ; load object pointer
ldur x0, [x0, #24]                  ; load property at resolved inherited offset
```

如果属性不存在但类暴露 `__get($name)`，codegen 会把属性名物化为字符串字面量，将其作为参数 push，并通过普通对象调用路径分发实例方法。返回值随后会根据推断出的返回类型流回普通结果寄存器。

对于属性赋值（`$obj->prop = value`），先求值 value，然后存储到已解析的 inherited offset。如果属性缺失但类暴露 `__set($name, $value)`，codegen 会把 value 装箱为 `Mixed`，物化属性名，并分发 `__set`，而不是生成直接 store。

Property-array 写入会先使用同一套固定 offset 属性解析，然后委托给普通数组存储路径处理嵌套容器。`$obj->items[] = $value` 通过 `PropertyArrayPush` 降低，`$obj->items[$key] = $value` 通过 `PropertyArrayAssign` 降低；二者都要求属性是具体 array/assoc-array，而不是 magic `__set` fallback。

### 方法调用（`$obj->method(args)`）

1. 求值对象表达式，在 `x0` 中得到指针
2. 把对象指针 push 到栈上
3. 求值并 push 所有参数
4. 把参数 pop 到 ABI 寄存器，其中对象指针作为第一个参数（`x0`）
5. 加载对象的 `class_id`，从 `_class_vtable_ptrs` 获取 class vtable pointer，加载 method slot，并用 `blr` 跳转到已解析实现
6. 结果根据返回类型位于标准寄存器中

在方法主体内，`$this` 是第一个参数，并存在函数的第一个栈 slot 中。

Private 实例方法是例外：它们没有 vtable slot，因此解析为当前词法类 private 方法的调用会使用直接 `_method_Class_method` 分支，而不是虚分发。

### 静态方法调用（`ClassName::method(args)`）

静态方法像普通函数一样调用，但使用 `_static_ClassName_methodName` 标签。不传递对象指针：

```asm
bl _static_Point_origin              ; call static method
; result in x0 (object pointer)
```

`self::method()` 会作为针对当前词法类的直接调用处理。如果它解析为实例方法，codegen 会加载隐式 `$this` receiver，并直接分支到已解析的 `_method_Class_method` 标签。`parent::method()` 以同样方式针对直接父类工作。对于静态目标，codegen 现在还会把一个隐藏的 "called class id" 参数穿过静态方法主体：命名的 `ClassName::method()` 调用会把该 id 固定为命名类，而 `self::` 和 `parent::` 会转发当前 called class。`static::method()` 随后会使用该转发的 class id，在运行时从 per-class static-method table 加载目标。

## ABI 模块

**文件：**`src/codegen/abi/mod.rs`、`src/codegen/abi/`

集中管理寄存器约定，确保各处保持一致：

### 大 offset 寻址

ARM64 的 `stur`/`ldur` 指令只支持 9 位有符号 immediate（最大 offset 为 255）。局部变量很多的函数可能超过这个限制。ABI 模块通过 `store_at_offset()` 和 `load_at_offset()` 透明处理：

- **Offsets <= 255**：单条 `stur`/`ldur` 指令（快速路径）
- **Offsets 256-4095**：两条指令序列 — 用 `sub x9, x29, #offset` 在 scratch register 中计算地址，然后通过该寄存器执行 `str`/`ldr`

这意味着所有访问栈变量的 codegen 都会通过 ABI helper，而不是直接生成 `stur`/`ldur`，因此大栈 frame 可以自动工作。同一边界现在还负责按引用参数和重 mutation 表达式路径使用的间接 `[*ptr]` loads/stores，因此 x86_64 特定内存语法不会泄漏回 `expr.rs`。

当 codegen 需要局部 slot 自身的地址而不是其中存储的值时，`emit_frame_slot_address()` 会补充这些 helper。按引用调用、`ptr($var)` 和 exception-frame bookkeeping 现在都复用该 helper，而不是开放编码 frame-slot 地址计算。

### Frame 和返回值 helper

`abi/` 模块现在集中管理 `_main` 和普通函数共同使用的 frame-management primitive：

- `emit_frame_prologue()` / `emit_frame_restore()` — 共享的栈 frame setup 和 teardown
- `emit_cleanup_callback_prologue()` / `emit_cleanup_callback_epilogue()` — 异常清理 callback 使用的小型 helper frame
- `emit_preserve_return_value()` / `emit_restore_return_value()` — 在 epilogue 副作用或 `finally` 分发期间 spill/reload 标量、浮点和字符串返回值

这把 prologue/epilogue 机制从更高层 walker 中移出，并让 ABI 层负责的不只是局部 slot 寻址。

### Incoming argument lowering

Incoming 参数解码现在通过 `IncomingArgCursor` 加 `emit_store_incoming_param()` 完成。

该 cursor 跟踪：

- 当前整数参数寄存器索引
- 当前浮点参数寄存器索引
- 参数传递何时溢出到调用方栈
- 后续 spilled 参数的 caller-stack 字节 offset

这些 helper 现在同时理解 AArch64 调用约定和 Linux `x86_64` SysV AMD64 目标。函数 codegen 会把 incoming-parameter lowering 委托给 ABI 层，而不是内联开放编码寄存器名或 caller-stack offset。

### Outgoing call argument lowering

Outgoing 调用现在也使用 ABI 所有的 helper：

- `build_outgoing_arg_assignments_for_target()` 决定每个参数是落入整数寄存器、浮点寄存器，还是溢出到所选目标平台的 caller-visible stack area
- `materialize_outgoing_args()` 把临时 pushed-argument 栈重写为调用点期望的最终 ABI layout

该逻辑由普通函数调用、间接/callable 分发、对象/方法调用、构造器/静态分发，以及 `call_user_func_array()` 等 helper 共享。赋值/物化规则现在覆盖 AArch64 和 Linux `x86_64` SysV layout，因此 call ABI policy 位于一处，而不是在多个分发路径中重复。

同一模块现在还拥有更高层 walker 使用的一层薄 call-site 和 temporary-stack primitive：

- `emit_call_label()` / `emit_call_reg()` 为当前目标平台生成直接和间接调用
- `emit_push_reg()`、`emit_pop_reg()`、`emit_push_float_reg()`、`emit_pop_float_reg()`、`emit_push_reg_pair()`、`emit_pop_reg_pair()` 和 `emit_push_result_value()` 管理临时参数栈，而不在每条调用路径中硬编码 ARM64 push/pop 形式
- `emit_reserve_temporary_stack()`、`emit_temporary_stack_address()` 和 `emit_load_temporary_stack_slot()` 现在还支持 FFI extern-call 路径，其中借用的 C-string 临时值会在外部调用返回后被跟踪并释放
- `emit_release_temporary_stack()` 和 `emit_store_zero_to_local_slot()` 集中管理目标平台特定的栈清理和零初始化细节
- `emit_store_process_args_to_globals()`、`emit_enable_heap_debug_flag()`、`emit_copy_frame_pointer()` 和 `emit_exit()` 覆盖 `_main` bootstrap/teardown 路径，而不在更高层 driver 中硬编码进程入口寄存器或退出序列

这让目标平台特定 ABI 工作集中在 `abi/` 内，而不是把 `call`、`blr`、`add sp`、`rsp` 或零寄存器假设散落到函数、闭包、callable 和方法分发代码中。

同一个 `abi/` 层现在还负责编译器管理的全局符号 slot 管道，例如 `_gvar_*`、`_static_*`、`_exc_*`、`_global_*`，以及字符串 builder、堆 bookkeeping、GC 状态使用的高频运行时符号，如 `_concat_off`、`_heap_*` 和 `_gc_*`：计算符号地址、把结果寄存器移动到符号存储中、把符号存储加载回结果寄存器，以及在 epilogue 期间把局部 frame slot 复制到符号支持的存储中。Extern globals 现在也使用同一边界，因此 GOT/GOTPCREL 地址物化位于 `abi/` 中，而不是在表达式和语句 lowering 中分别开放编码。

### `emit_store(emitter, type, offset)`

把当前结果存储到栈变量。内部使用 `store_at_offset()` 处理大 offset：

| Type | 存储内容 |
|---|---|
| `Int` / `Bool` / `Resource` | `stur x0, [x29, #-offset]`（大 offset 时使用 2-insn 序列） |
| `Float` | `stur d0, [x29, #-offset]` |
| `Str` | `bl __rt_str_persist`，然后 `stur x1, [x29, #-offset]` + `stur x2, [x29, #-(offset-8)]` |
| `Array` / `AssocArray` / `Iterable` | `stur x0, [x29, #-offset]` |
| `Mixed` | `stur x0, [x29, #-offset]` |
| `Object` | `stur x0, [x29, #-offset]` |
| `Callable` / `Pointer` | `stur x0, [x29, #-offset]` |
| `Buffer` / `Packed` / `Union` | `stur x0, [x29, #-offset]` |

### `emit_load(emitter, type, offset)`

把栈变量加载到结果寄存器中（store 的逆操作）。内部使用 `load_at_offset()`。

### `emit_write_stdout(emitter, type)`

生成把值打印到 stdout 的代码：

| Type | 打印方式 |
|---|---|
| `Str` | 把字符串指针/长度移动到 `__rt_stdout_write` 的约定位置，然后 `bl __rt_stdout_write` |
| `Int` | `bl __rt_itoa` → 然后写出 |
| `Float` | `bl __rt_ftoa` → 然后写出 |
| `Bool` | `true` 打印 "1"，`false` 不打印任何内容 |
| `Pointer` | `bl __rt_ptoa` → 然后写出 |
| `Mixed` | `bl __rt_mixed_write_stdout` → 检查 boxed runtime tag，然后写出 |
| `Void`/`Array`/`AssocArray`/`Callable`/`Object` | 不打印 |

终端写入本身会经过一个共享运行时间接层 `__rt_stdout_write(ptr, len)`（byte pointer 位于 `x0`/`rdi`，长度位于 `x1`/`rsi`）。它会直接执行平台 `write(1, ptr, len)` syscall。在 `--web` 构建中，它会先检查 `_elephc_web_capture` flag；当 capture 启用时，会把 bytes 交给 `elephc_web_write`，从而捕获每个请求的响应主体；非 web 二进制文件绝不会引用 web 符号。（`Mixed` / `Resource` / `Iterable` writer 仍会发出自己的 syscall，并绕过该间接层。）

对于 Linux `x86_64`，同一写路径现在遵循 SysV ABI 和更广的原生运行时切片，而不是 AArch64 特定 helper 序列。字符串结果使用 Linux syscall 寄存器 layout，整数和浮点 echo 经过 x86_64 `__rt_itoa` / `__rt_ftoa`，`_main` 只在需要时初始化 `$argc` / `$argv`，bootstrap 运行时现在覆盖大量数组、字符串、数学、文件系统、FFI、enum、异常、GC 和 mixed-value helper，而不会把 AArch64-only 假设泄漏回更高层 walker。

同一 bootstrap system slice 现在还包括通过 libc `gettimeofday()` 实现的 x86_64-native `time()` / `microtime(true)`，通过 libc `uname()` 实现的 target-aware `php_uname()`，以及经由共享 symbol-address ABI helper 实现的 `phpversion()` 包版本 lowering 和 `sys_get_temp_dir()` 常量字符串 lowering，而不是 ARM64-only `adrp` / `add_lo12` 序列。

x86_64 数学表面现在也更广：libc-backed 浮点 builtin 系列（`sin`、`cos`、`tan`、`asin`、`acos`、`atan`、`sinh`、`cosh`、`tanh`、`exp`、`log`、`log2`、`log10`、`atan2`、`hypot`、`pow`）和纯浮点 helper（`sqrt`、`pi`、`deg2rad`、`rad2deg`、`min`、`max`）全部使用 SysV 浮点寄存器加共享 temporary-stack ABI helper，而不是原始 AArch64 `d0` / `scvtf` / `str d0` lowering。表达式 codegen 中的 `**` 运算符同样如此，它现在通过 x86_64 `pow()` libc 调用路径，并使用正确的浮点参数顺序。标量随机 helper（`rand()`、`mt_rand()`、`random_int()`）现在也位于该 target-aware ABI 路径上，因此它们的 `[min, max]` 范围物化不再在 Linux x86_64 上生成原始 AArch64 栈 spill。由 comparator 驱动的索引数组排序也位于同一路径：`usort()`、`uasort()` 和 `uksort()` 现在通过共享 symbol/stack ABI helper 解析 callback 地址，并通过 x86_64 `__rt_usort` bubble-sort 运行时分发，而不是硬编码 ARM64 `adrp` / `blr` 序列。

## 函数代码生成

**文件：**`src/codegen/functions/mod.rs`、`src/codegen/functions/`

### `emit_function()`

编译用户定义函数：

1. **收集局部变量** — 扫描函数主体，找出所有变量及其类型
2. **计算栈 frame 大小** — 16 字节对齐，包含所有局部变量空间
3. **生成 prologue** — 调用共享 ABI frame helper
4. **存储参数** — 通过 ABI helper 把 incoming 参数降低到栈 slot，把 by-value 堆参数标记为 `Owned`，把 by-reference 参数标记为调用方存储的借用别名
5. **生成主体** — 所有语句
6. **生成 epilogue** — 保存返回寄存器，通过共享 ABI 存储 helper 把 static locals 写回 BSS，只清理 `Owned` + `epilogue_cleanup_safe` 的堆局部变量，然后调用共享 ABI frame-restore helper 和 `ret`

### 按引用传递

```php
function increment(&$val) {
    $val++;
}
```

当参数使用 `&` 声明时，codegen 传递的是参数的**栈地址**，而不是其值：

1. 在调用点：计算参数栈 slot 的地址（`sub x_n, x29, #offset`），并在参数寄存器中传递。
2. 在函数 prologue 中：地址存入参数的栈 slot（它保存的是指针，不是值）。
3. 读取时：codegen 解引用该指针（`ldr x0, [x0]`）来获取实际值。
4. 写入时：codegen 通过该指针存储（`str x0, [addr]`），直接修改调用方变量。

Context 通过 `ctx.ref_params` 跟踪哪些参数是按引用传递的。

### Variadic 参数和 spread operator

```php
function sum(...$nums) { /* $nums is an array */ }
sum(1, 2, 3);
sum(...$arr);  // spread
```

**Variadic 函数**：最后一个参数可以带有 `...` 前缀，用于把所有剩余参数收集到一个数组中。在调用点，codegen 会：

1. 通过寄存器正常传递常规（非 variadic）参数
2. 使用 `src/codegen/expr/calls/args.rs` 中的共享 helper 准备 normalized/defaulted 参数列表，降低 pass-by-reference slot，处理 spread-into-named 参数，并在需要时构建尾部 variadic 数组
3. 把数组指针作为最后一个参数寄存器传递

**Spread operator**（`...$arr`）：用 `...$arr` 调用函数时，数组会被解包为位置参数。对于 `function f($a, ...$rest)`，`f(...[1, 2, 3])` 会把 `1` 传给 `$a`，并把 `[2, 3]` 收集到 `$rest`。关联数组 spread 会把字符串 key 映射到命名参数，保留数值 key 作为位置参数，并在规划前把重复的静态字符串 key 折叠为最后一个值。命名参数之前的变量 `AssocArray` spread 可以在运行时通过字符串 key 满足后续参数，因此 codegen 会跳过该动态 provider 的固定 prefix 长度检查，改为生成每参数 lookup/default 处理。在数组字面量中，spread operator 使用 `__rt_array_merge_into` 把 spread 数组中的所有元素追加到目标数组。

### 默认参数值

函数和闭包支持默认参数值：

```php
function greet($name, $greeting = "Hello") { ... }
```

当调用点省略具有默认值的参数时，codegen 会填入默认值。在调用点，编译器检查实际传入了多少参数，并对每个缺失且带默认值的参数求值默认表达式，将其放入适当的参数寄存器。这在编译期处理，不需要运行时检查。

### `collect_local_vars()`

在函数主体 AST 上预扫描，找出将要使用的每个变量。这是必要的，因为栈空间必须在 prologue 中、任何代码运行之前分配。

它会在代码生成前遍历语句树，并递归处理主要的局部绑定形式（`Assign`、控制流块、`For`/`Foreach`、`ListUnpack`、`Global`、`StaticVar` 和相关情况）。确切匹配由 `functions/` 模块中的实现驱动，因此此列表是示意性的，并非穷尽。

## 主程序代码生成

**文件：**`src/codegen/mod.rs`

`generate()` 函数编排所有内容：

1. **生成用户函数** — 扫描 AST 中的 `FunctionDecl`，并生成每个函数
2. **生成类方法** — 构造器、实例方法和静态方法使用各自的标签
3. **生成 `_main`**：
   - Prologue（全局变量的栈 frame）
   - 保存来自 OS 的 `argc` 和 `argv`（它们位于 `x0` 和 `x1`）
   - 通过 `__rt_build_argv` 运行时调用构建 `$argv` 数组
   - 注册 main activation record，使异常也能通过顶层代码展开
   - 生成所有非函数语句
   - Epilogue：清理 owned locals，注销 activation record，然后 `exit(0)`
4. **生成延迟闭包** — 早期表达式 codegen 期间记录的闭包主体
5. **生成运行时例程** — 所有 `__rt_*` helper 函数
6. **生成 data section** — 字符串和浮点字面量
7. **生成 runtime data / BSS** — 全局 buffer、globals、statics 和 lookup table

Linux x86_64 使用与 AArch64 目标相同的共享运行时生成表面。数组变换、排序 helper、copy-on-write 路径、GC 计数、堆 debug helper、字符串搜索/格式化 helper、内联数组/字符串 accessor 和 list unpacking 都通过 target-aware emitter 和 ABI 模块路由，而不是单独的缩减运行时切片。

当某个操作需要架构特定汇编时，叶子运行时模块会在内部选择原生序列。例如，x86_64 helper 会在需要时使用 SysV 寄存器、RIP-relative 寻址和 x86_64 堆标记，而 AArch64 helper 会使用自己的寄存器和重定位约定。更高层 lowering 应继续调用共享运行时标签和 ABI helper，而不是基于原始 ARM64 或 x86_64 细节分支。
