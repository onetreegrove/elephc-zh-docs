elephc 管理内存时不会直接为 PHP 值调用 `malloc`/`free`。存储位置包括：**栈**（自动，按函数分配）、固定 BSS 区域，以及由编译器管理的**堆缓冲区**（包含空闲链表分配器、引用计数，以及针对数组/哈希表/对象图的定向循环回收器）。最终生成的二进制文件仍然会链接目标平台的系统 C 库，以使用 OS 和 libc 服务。

本页面说明运行时每个值在内存中的位置。

## 运行时内存区域

```
┌─────────────────────────────┐  高地址
│         Stack                │  ← 向下增长（sp 递减）
│  (function frames, locals)   │
├─────────────────────────────┤
│         (unused)             │
├─────────────────────────────┤
│       Heap buffer            │  _heap_buf：默认 8MB（--heap-size）
│  (arrays, hash tables,       │  空闲链表 + bump 分配器
│   objects, persisted strings) │
├─────────────────────────────┤
│     String buffer            │  _concat_buf：64KB，暂存区
│  (temporary string results)  │  每条语句重置
├─────────────────────────────┤
│     I/O and stream buffers   │  _cstr_buf/_cstr_buf2, _eof_flags,
│  (C strings, streams, TLS,   │  _stream_*, _http_*, _ftp_*, wrapper/filter
│   wrappers, filters)         │  表，协议/服务/主体查找缓冲区
├─────────────────────────────┤
│   Runtime metadata (BSS)     │  _concat_off, _global_argc/_argv,
│  (heap state, counters,      │  _heap_off, _heap_free_list,
│   globals, static storage)   │  _heap_small_bins, _heap_debug_enabled,
│                              │  _gc_allocs/_frees/_live/_peak,
│                              │  _gc_collecting/_gc_release_suppressed,
│                              │  _exc_handler_top, _exc_call_frame_top,
│                              │  _exc_value, _rt_diag_suppression,
│                              │  _json_last_error, _json_active_*,
│                              │  _json_indent_depth, _json_validate_*,
│                              │  _json_decode_assoc, _json_error_*,
│                              │  _fiber_current, _fiber_main_saved_*,
│                              │  _generator_class_id,
│                              │  _include_once_*, _fn_variant_active_*,
│                              │  _elephc_crypto_*_fn, _elephc_tls_*_fn, ...
├─────────────────────────────┤
│       Data section           │  字符串字面量，浮点常量
│  (.data — read-only)         │
├─────────────────────────────┤
│       Code section           │  指令
│  (.text — executable)        │
└─────────────────────────────┘  低地址
```

## 栈

栈是局部变量的主要存储区域。基础知识请参阅 [ARM64 汇编简介](arm64-assembly.md#the-stack-function-local-storage)。

### 栈帧布局

每个函数都有一个栈帧。[代码生成器](the-codegen.md)在编译期间通过统计所有局部变量来计算其大小：

```
                         x29 (frame pointer)
                          │
                          ▼
┌────────────┬────────────┬────────────┬────────────┐
│  saved x29 │  saved x30 │   $x (8B)  │   $y (8B)  │ ...
└────────────┴────────────┴────────────┴────────────┘
  [x29, #0]    [x29, #8]   [x29, #-8]   [x29, #-16]
```

- `x29` 和 `x30` 保存在帧顶部（`x29` 的正偏移处）
- 局部变量位于 `x29` 的**负偏移处**
- 字符串占用**两个槽位**（16 字节）：指针在 `[x29, #-offset]`，长度在 `[x29, #-(offset-8)]`
- 帧总大小始终按 16 字节对齐（ARM64 ABI 要求）

在 EIR 后端，帧还会为线性扫描寄存器分配器使用的每个被调用者保存寄存器预留一个保存槽位，短生命周期的标量 SSA 临时值可能驻留在寄存器中而非栈槽。PHP 局部变量本身仍以上述方式通过槽位存储。寄存器分配过程请参阅 [IR 说明](the-ir.md)。

### 变量分配

变量的栈槽由[代码生成器](the-codegen.md)在扫描函数体（`collect_local_vars`）时分配。分配在编译期确定——不存在动态栈增长。

对于堆托管的值，栈槽在代码生成阶段还携带编译期所有权元数据：`Owned`、`Borrowed`、`MaybeOwned` 或 `NonHeap`。该元数据不会存入生成的二进制文件，仅用于指导代码生成器：在将借用的堆值存入新所有者之前是否需要先 retain，以及哪些局部别名不可盲目递减引用计数。

| 类型 | 栈空间 | 存储形式 |
|---|---|---|
| `Int` | 8 字节 | 有符号 64 位整数 |
| `Float` | 8 字节 | IEEE 754 双精度浮点 |
| `Bool` | 8 字节 | 0 或 1（为对齐以 64 位存储） |
| `Str` | 16 字节 | 8 字节指针 + 8 字节长度 |
| `Array` | 8 字节 | 指向堆分配头部的指针 |
| `AssocArray` | 8 字节 | 指向堆分配哈希表的指针 |
| `Iterable` | 8 字节 | 数组或 Traversable 对象的类型擦除堆指针 |
| `Mixed` | 8 字节 | 指向堆分配的装箱 mixed 单元的指针 |
| `Void`（null）| 8 字节 | 哨兵值 `0x7FFFFFFFFFFFFFFE` |
| `Object` | 8 字节 | 指向堆分配对象的指针 |
| `Callable` | 8 字节 | 函数指针 |
| `Pointer` | 8 字节 | 原始 64 位地址 |
| `Resource` | 8 字节 | 原生资源载荷，例如流描述符 |
| `Buffer` | 8 字节 | 指向 buffer 头部的指针 |
| `Packed` | 8 字节 | 仅元数据的名义类型，通过指针访问 |
| `Union` | 8 字节 | 装箱的运行时标签载荷（与 Mixed 存储方式相同） |
| `TaggedScalar` | 16 字节 | 8 字节载荷 + 8 字节运行时标签（tagged null 表示） |

### Null 的表示方式

elephc 对标量槽中 PHP `null` 有两种表示方式，通过 `--null-repr=sentinel|tagged`（或 `ELEPHC_NULL_REPR`）在编译期选择。tagged 表示方式为默认值；sentinel 是旧版可选退出方式。

#### 带内哨兵（旧版可选退出）

`null` 被表示为整数 `0x7FFFFFFFFFFFFFFE`（`PHP_INT_MAX - 1`）。由于每个 64 位模式都是合法的 PHP int，该哨兵会与真实整数 `9223372036854775806` 冲突，null 检查会将其误判为 `null`。在算术运算前，代码生成器会检查该哨兵并将其替换为 0：

```asm
; coerce null to zero
movz x9, #0xFFFE
movk x9, #0xFFFF, lsl #16
movk x9, #0xFFFF, lsl #32
movk x9, #0x7FFF, lsl #48
cmp x0, x9
csel x0, xzr, x0, eq      ; if x0 == sentinel, replace with 0
```

`movz`/`movk` 的工作原理请参阅 [ARM64 指令参考](arm64-instructions.md#move-and-immediate)。

#### Tagged 标量表示（默认）

在 tagged 表示方式下，可为 null 的标量槽使用内联的双字 `{payload, tag}` 对（`TaggedScalar`），而非带内哨兵：载荷通过整数结果寄存器（`x0`/`rax`）传递，运行时标签通过相邻寄存器（`x1`/`rdx`）传递，与字符串指针/长度的惯例相同。标签复用运行时值标签体系（0 = int，8 = null），因此 tagged 标量与装箱的 Mixed 单元的 tag/payload 字按字兼容。在栈上，载荷位于 `offset`，标签位于 `offset - 8`。

可产生 null 的生产者——可能缺失的 int 数组读取、对 int 数组的 `array_pop`/`array_shift`——产出 tagged 标量；消费者（`echo`、`var_dump`、`is_null`、`??`、`??=`、`isset`、`empty`、`gettype`、类型转换、算术窄化、经由 Mixed 装箱路径的 `===`）根据标签字进行分派。普通的非可空 `Int` 在静态分析中永远不为 null，因此其哨兵检查完全消失，且完整的 64 位范围可无损往返传递：

```asm
; null check on a tagged scalar
cmp x1, #8                ; runtime tag 8 = PHP null
b.eq value_is_null
```

tagged null 以旧版哨兵作为其载荷字，因此将其装箱到 Mixed 单元中会精确产生旧版的 `{tag 8, sentinel}` 字对，未经审计的消费者会退化为旧版行为。`?int` 的参数、返回值和属性在两种模式下均保持其装箱的 Mixed 表示。

### 指针值

指针以原始 64 位地址存储。不透明指针与类型化的 `ptr<T>` 值具有相同的运行时表示；类型标签仅存在于类型检查器中。空指针使用地址 `0x0`，解引用辅助函数通过 `__rt_ptr_check_nonnull` 对空指针显式触发陷阱。

### Fiber 栈与调度器状态

`Fiber` 对象拥有各自的原生栈，而非借用调用者的栈。运行时通过 `mmap` 为每个 fiber 栈分配内存（默认可用 256 KiB，另加一个保护页），用 `mprotect(PROT_NONE)` 将底部 16 KiB 保护为保护页，并将映射基址和总映射大小存入 Fiber 对象，以便 `__rt_fiber_free_stack` 在之后通过 `munmap` 归还。

当前运行的 fiber 通过 `_fiber_current` 跟踪。当执行从主栈切换离开时，`_fiber_main_saved_sp`、`_fiber_main_saved_exc` 和 `_fiber_main_saved_call_frame` 分别保存主栈指针、异常处理链和活动记录清理链。挂起的 Fiber 将相同的状态存储在其对象载荷中（`saved_sp`、`own_exc_head` 和 `own_call_frame`），因此 `__rt_fiber_switch` 可以在主上下文与 fiber 上下文之间切换，而不会混淆各自的异常或清理链。

## 字符串缓冲区（暂存区）

```asm
.comm _concat_buf, 65536    ; 64KB scratch buffer
.comm _concat_off, 8        ; current write offset (reset per statement, to the frame base)
```

字符串缓冲区（`_concat_buf`）是一个 64KB 的暂存区域，供所有字符串操作使用——`itoa`、`ftoa`、`concat`、`strtolower`、`str_replace` 等。每个操作将结果写入当前偏移处并推进偏移量。

**缓冲区在每条语句开始时重置——重置到帧的继承基址，而非必然为 0。** 缓冲区中的字符串是临时的：它们仅在一条语句求值期间有效，*此外*（对于传入调用的参数）还延伸至被调用者的生命周期。详见下文的[跨调用切片参数](#cross-call-slice-arguments)。

### 工作原理

对于单条语句 `echo strtolower("HELLO") . " " . $name;`：

```
_concat_buf:
┌──────────┬──────────┬──────────────┬──────────────────┐
│  "hello" │  " "     │  "hello Joe" │  (free space)    │
└──────────┴──────────┴──────────────┴──────────────────┘
 offset=0    offset=5   offset=6      _concat_off = 17
```

每个子表达式将其结果依次写入缓冲区。语句执行完毕后（echo 将内容写入 stdout），下一条语句将 `_concat_off` 重置回当前帧的基址偏移（`main` 中为 0）。

### 跨调用切片参数

字符串操作返回的是对 `_concat_buf` 的*借用切片*（指针 + 长度），而非堆上的副本。当这样的切片**作为参数**传入函数、方法或闭包时，被调用者会执行自己的语句——若将 `_concat_off` 一路重置到 0，则会在被调用者读取之前就覆盖调用者的切片字节。

为防止这种情况，每个帧在进入时会记录它从调用者继承的 `_concat_off` 值（即调用者活跃切片下方的高水位线），该值即为帧的**基址**：按语句的重置会将 `_concat_off` 恢复到基址而非 0，从而使被调用者自身的拼接追加在调用者切片的*上方*，而不会覆盖它们。`main`（及其他根上下文）的基址为 0，因此其行为不变。每次嵌套调用前后还会保存/恢复游标，以便被调用者返回后调用者可以继续拼接。

其后果是：`_concat_buf` 的使用量随*持有活跃切片参数*的嵌套调用深度而增长（每个帧都会保留调用者的区域）。实践中，这种深度很浅；深度递归的字符串构建器若会造成积累，则属于独立的、已知的编译期限制，因此 64KB 的预算对于普通代码来说并不成问题。

### 写时复制到存储（Copy-on-store）

当字符串结果被存入变量时（例如 `$x = "a" . "b";`），代码生成器会调用 `__rt_str_persist`，将字符串从 concat 缓冲区复制到**堆**上。这确保了：

- **变量始终指向堆内存**，而非暂存缓冲区
- **缓冲区可以安全重置**，不会使已存储的值失效
- **哈希表键**也会被持久化到堆上（通过 `str_persist`）
