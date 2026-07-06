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
