---
title: "内存模型"
description: "栈帧、堆分配和内存管理。"
sidebar:
  order: 9
---



elephc 管理内存时不会直接为 PHP 值调用 `malloc`/`free`。存储位置包括：**栈**（自动，按函数分配）、固定 BSS 区域，以及由编译器管理的**堆缓冲区**（包含空闲链表分配器、引用计数，以及针对数组/哈希表/对象图的定向循环回收器）。最终生成的二进制文件仍然会链接目标平台的系统 C 库，以使用 OS 和 libc 服务。

本页面说明运行时每个值在内存中的位置。

## 运行时内存区域

```
┌─────────────────────────────┐  High addresses
│         Stack                │  ← grows downward (sp decreases)
│  (function frames, locals)   │
├─────────────────────────────┤
│         (unused)             │
├─────────────────────────────┤
│       Heap buffer            │  _heap_buf: 8MB default (--heap-size)
│  (arrays, hash tables,       │  Free-list + bump allocator
│   objects, persisted strings) │
├─────────────────────────────┤
│     String buffer            │  _concat_buf: 64KB, scratch pad
│  (temporary string results)  │  Reset at each statement
├─────────────────────────────┤
│     I/O and stream buffers   │  _cstr_buf/_cstr_buf2, _eof_flags,
│  (C strings, streams, TLS,   │  _stream_*, _http_*, _ftp_*, wrapper/filter
│   wrappers, filters)         │  tables, protocol/service/principal lookup buffers
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
│       Data section           │  String literals, float constants
│  (.data — read-only)         │
├─────────────────────────────┤
│       Code section           │  Instructions
│  (.text — executable)        │
└─────────────────────────────┘  Low addresses
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

### 影响

- **用量有界。** 由于缓冲区在每条语句结束后重置，只需保证单条语句的字符串操作能放入 64KB 以内——加上当前调用栈上所有外层调用持有的切片参数（参见 [跨调用切片参数](#cross-call-slice-arguments)）。对于常规代码，64KB 已绰绰有余。
- **不可变更。** 字符串无法原地修改——每次都必须创建新字符串。
- **仅作暂存。** 缓冲区严格用于临时目的，任何需要持久存活的数据必须放入堆。

## 堆

```asm
.comm _heap_buf, 8388608    ; 8MB buffer (configurable via --heap-size)
.comm _heap_off, 8          ; current bump allocation offset
.comm _heap_free_list, 8    ; head of the general free block linked list
.comm _heap_small_bins, 32  ; 4 x 8-byte heads for <=8/16/32/64-byte cached blocks
.comm _heap_debug_enabled, 8 ; heap-debug toggle
.comm _gc_collecting, 8     ; cycle collector re-entry guard
.comm _gc_release_suppressed, 8 ; suppress nested collection during deep free
.comm _gc_allocs, 8         ; allocation counter
.comm _gc_frees, 8          ; free counter
.comm _gc_live, 8           ; current live heap footprint in bytes
.comm _gc_peak, 8           ; heap high-water mark
```

堆（`_heap_buf`）默认为 8MB 区域，用于存储动态大小的数据——数组、哈希表、对象以及持久化字符串。它采用**空闲链表 + bump 混合分配器**，并为最频繁的小块分配提供分隔式小块存储桶。

### 堆分配工作原理

每次分配都有一个 **16 字节的头部**：两个 32 位字段分别存储块大小和引用计数，紧随其后是一个 8 字节的统一堆类型标签：

```
┌───────────┬────────────┬────────────┬──────────────────┐
│ size (4B) │ refcnt (4B)│ kind (8B)  │  user data ...   │
└───────────┴────────────┴────────────┴──────────────────┘
       header (16 bytes total)          ← pointer returned to caller
```

大小存储在头部偏移量 `+0` 处，引用计数在 `+4`，堆类型标签在 `+8`。新分配的块初始 refcount 为 `1`；类型构造函数随后将 kind 标记为 `1=string`、`2=indexed array`、`3=assoc/hash`、`4=object`、`5=boxed mixed`，而原始辅助缓冲区保持 `0`。Generator 帧被标记为 kind `4`（对象块），因为 `Generator` 是一个带有自定义载荷布局的内置类。对于数组/哈希容器，kind 字的低 16 位是持久元数据：低字节仍为堆类型，有序数组在下一字节打包其运行时 `value_type`，第 15 位保留为持久写时复制容器标志。更高位保留为临时回收器元数据。

运行时例程 `__rt_heap_alloc`：

1. **探测分隔式小块存储桶** —— 对于不超过 64 字节的请求，首先检查 `_heap_small_bins`（`<=8`、`<=16`、`<=32`、`<=64`），从可用的最小匹配类中复用缓存块。
2. **遍历通用空闲链表** —— 若无合适的缓存小块，则检查按地址排序的空闲链表（首次适配）。若找到 `size >= requested` 的块，则整块摘出或拆分（剩余部分留在空闲链表），然后将已分配块的 refcount 重置为 1 并返回。
3. **Bump 分配** —— 若两条空闲路径均不满足，则从堆尾分配：向头部写入大小和 refcount=1，推进 `_heap_off`，返回用户指针。
4. **边界检查** —— 若 bump 分配会超出 `_heap_max`，则打印致命错误并退出。

最小分配单元为 8 字节（以便块释放后能存放 next 指针）。

### 堆释放工作原理

运行时例程 `__rt_heap_free`：

1. 从 `user_pointer - 16` 处的 16 字节头部读取块大小（32 位）
2. 若该块恰好位于 bump 尾部，则立即收缩 `_heap_off`
3. 否则，载荷不超过 64 字节的块会被缓存到四个分隔式小块存储桶头节点之一（`<=8`、`<=16`、`<=32`、`<=64`），供后续小块分配复用，无需扫描较大的空闲链表
4. 更大的非尾部块按地址顺序插入通用空闲链表，并与相邻空闲邻块合并，同时反复将现已空闲的尾部链条裁剪回 `_heap_off`
5. 空闲块复用同一个 16 字节头部，将 kind 清零为 `0`，然后在其后紧接着存储 next 指针：`[size:4][refcnt:4][kind:8][next_ptr:8][...unused...]`

变体 `__rt_heap_free_safe` 会在释放前验证指针是否在 `_heap_buf` 范围内——可安全地用于垃圾指针、null 或 `.data` 段指针。

### 堆调试模式

传入 `--heap-debug` 可启用额外的运行时验证，不改变正常的所有权行为：

- `__rt_heap_free` 拒绝将同一块重复插入空闲链表（`double free`）
- `__rt_incref` / `__rt_decref_*` 在修改前拒绝 refcount 为零的堆块（`bad refcount`）
- `__rt_heap_alloc` / `__rt_heap_free` 会验证有序空闲链表及分隔式小块存储桶链，并在发现越界、重叠、循环、大小不匹配或仅相邻的空闲块时触发陷阱（`free-list corruption`）
- `__rt_heap_free` 用 `0xA5` 毒化已释放的载荷字节，使过期的原始读取在调试复现时立刻暴露
- 进程退出时打印堆调试摘要，包括分配/释放计数、存活块数、存活字节数、泄漏摘要行以及峰值存活字节水位

当上述任一检查触发时，程序以致命的堆调试错误退出，而非继续在已损坏的分配器状态下运行。

### 内存释放时机

- **变量重新赋值**：当堆支持的本地/全局/静态槽被覆写时，代码生成器通过相应的运行时路径释放前一个所有者（对持久化字符串使用 `__rt_heap_free_safe`，对引用计数的数组/哈希/对象使用 `__rt_decref_*`）
- **`unset()`**：在将槽清空之前，释放当前堆支持的值
- **定向循环回收**：当 decref 到达一个可能仅靠自身保持存活的容器/对象图时，`__rt_gc_collect_cycles` 统计仅来自堆的入边，标记外部可达块，并深层释放剩余的不可达数组/哈希/对象孤岛
- **Generator 帧释放**：Generator 帧是 object-kind 堆块，但其自定义 Mixed 槽和活跃的 `yield from` 委托由对象深层释放中 Generator 专用分支负责释放
- **对象析构函数（`__destruct`）**：在 `__rt_object_free_deep` 的顶部、释放任何属性载荷之前，`__rt_call_object_destructor` 通过以 class_id 为索引的 `_class_destruct_ptrs` 表查找对象所属类，若该类（或其祖先）声明了 `__destruct`，则以借用的 `$this` 调用它。refcount 字中有一个位标记"析构进行中"，以防函数体内形如 `$tmp = $this;` 的平衡操作重新进入释放路径；对象复活被故意不支持（块仍会被释放）。没有析构函数的类在表中对应条目为 `0`，仅需一次加载和分支判断
- **进程退出**：所有内存由操作系统回收

### 可配置堆大小

默认堆为 8MB。若程序需要更多（或更少）内存，请使用：

```bash
elephc --heap-size=16777216 heavy.php    # 16MB heap
elephc --gc-stats heavy.php              # print alloc/free counters to stderr
elephc --heap-debug heavy.php            # enable runtime heap verification
```

最小值为 64KB。

## 数组布局

数组在堆上分配，具有 24 字节的头部，后跟连续的元素：

```
_heap_buf + offset:
┌──────────┬──────────┬──────────┬──────┬──────┬──────┬─────┐
│ length   │ capacity │ elem_sz  │ [0]  │ [1]  │ [2]  │ ... │
│ (8 bytes)│ (8 bytes)│ (8 bytes)│      │      │      │     │
└──────────┴──────────┴──────────┴──────┴──────┴──────┴─────┘
 offset+0   offset+8   offset+16  offset+24  ...
```

| 字段 | 大小 | 描述 |
|---|---|---|
| `length` | 8 字节 | 当前元素数量 |
| `capacity` | 8 字节 | 已分配槽位数量 |
| `elem_size` | 8 字节 | 每个元素大小：8（int）或 16（string） |

### 整数数组

每个元素占 8 字节（一个 `i64`）：

```
Header (24 bytes) │ elem[0] (8B) │ elem[1] (8B) │ elem[2] (8B) │ ...
```

访问方式：`base + 24 + (index × 8)`

### 字符串数组

每个元素占 16 字节（指针 + 长度）：

```
Header (24 bytes) │ ptr[0] (8B) │ len[0] (8B) │ ptr[1] (8B) │ len[1] (8B) │ ...
```

访问方式：`base + 24 + (index × 16)`（指针），`base + 24 + (index × 16) + 8`（长度）

### 数组扩容

当 `array_push` 发现 `length >= capacity` 时，数组会自动扩容：

1. `__rt_array_grow` 首先运行 `__rt_array_ensure_unique`，共享数组在重新分配前先分裂
2. 分配一个 **2× 容量**（最小为 8）的新数组
3. 将 24 字节头部及所有元素复制到新数组
4. 释放之前的独占存储并返回新数组指针

调用方将其存储的指针更新为新数组。这意味着数组是真正动态的——可以无限 push 元素（仅受堆大小限制）。对空数组的直接下标写入现在也会扩展后备存储，并将 `length` 延伸至涵盖已写入的最高索引。

### 写时复制容器

有序数组和关联数组现遵循**共享直至修改**语义：

1. 普通赋值或按值传参会共享现有堆容器并递增其 refcount
2. 首次发生修改性写入时，运行时执行 `__rt_array_ensure_unique` 或 `__rt_hash_ensure_unique`
3. 若 refcount 已为 1，则直接原地写入
4. 若 refcount 大于 1，运行时克隆容器结构，保留嵌套的堆支持子项（或重新持久化不可变字符串/键），递减修改方旧所有者槽的引用计数，将修改方所有者槽指向克隆，然后才执行写入

这正是 PHP 风格的代码（如 `$b = $a; $b[0] = 9;`）能在不对每次赋值进行深拷贝的情况下保持 `$a` 不变的原因。嵌套数组和哈希在各自首次发生修改之前保持浅层共享。

## 哈希表布局（关联数组）

关联数组使用一个单独的堆分配结构：一个用于查找的开放寻址哈希表，加上一条贯穿各条目的按插入顺序排列的链表。

### 头部（40 字节）

```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│  count   │ capacity │ val_type │   head   │   tail   │
│ (8 bytes)│ (8 bytes)│ (8 bytes)│ (8 bytes)│ (8 bytes)│
└──────────┴──────────┴──────────┴──────────┴──────────┘
 offset+0   offset+8   offset+16  offset+24  offset+32
```

| 字段 | 大小 | 描述 |
|---|---|---|
| `count` | 8 字节 | 已占用条目数量 |
| `capacity` | 8 字节 | 槽位总数 |
| `val_type` | 8 字节 | 粗粒度值类型摘要（0=int，1=str，2=float，3=bool，4=array，5=assoc，6=object，7=mixed） |
| `head` | 8 字节 | 首个插入条目的槽位索引，空时为 `-1` |
| `tail` | 8 字节 | 最近插入条目的槽位索引，空时为 `-1` |

### 条目（每个 64 字节）

从偏移量 +40 开始，每个槽位占 64 字节：

```
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ occupied │ key_ptr  │ key_len  │ value_lo │ value_hi │ value_tag│   prev   │   next   │
│ (8 bytes)│ (8 bytes)│ (8 bytes)│ (8 bytes)│ (8 bytes)│ (8 bytes)│ (8 bytes)│ (8 bytes)│
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

| 字段 | 描述 |
|---|---|
| `occupied` | 0 = 空，1 = 已占用，2 = 墓碑（已删除） |
| `key_ptr` | 字符串键指针；当 `key_len == -1` 时存储整数键载荷 |
| `key_len` | 字符串键长度；整数键时为哨兵值 `-1` |
| `value_lo` | 值（整数）或值指针（字符串） |
| `value_hi` | 字符串长度（字符串值时），单字载荷时不使用 |
| `value_tag` | 权威的逐条目运行时标签，用于查找、迭代、JSON、搜索和 GC |
| `prev` | 上一个插入槽位的索引；头条目时为 `-1` |
| `next` | 下一个插入槽位的索引；尾条目时为 `-1` |

### 哈希与冲突处理

字符串键在查找或插入前会进行规范化：PHP 中形如整数的数字字符串会转换为整数键，而带前导零的字符串（如 `"01"`）仍保持为字符串键。字符串键使用 **FNV-1a** 算法进行哈希（对短字符串速度快、分布均匀）；整数键使用标量整数混合算法。冲突通过**线性探测**解决——若槽位 `hash % capacity` 已被占用，则依次尝试 `(hash + 1) % capacity`，以此类推。

条目地址：`base + 40 + (slot_index × 64)`

### 迭代顺序

查找时仍会探测物理桶，但迭代是沿 `head -> next -> ... -> tail` 链表进行遍历。头部的 `val_type` 现在仅作概要信息，正确性敏感路径会读取每个条目自身的 `value_tag`。以下场景均能保留 PHP 的插入顺序：

- 关联数组的 `foreach`
- `array_keys()` 和 `array_values()`
- 存在重复值时的 `array_search()` / `in_array()`
- 关联数组的 `json_encode()`
- 扩容时的重哈希与写时复制克隆

### 与索引数组的对比

| | 索引数组 | 关联数组 |
|---|---|---|
| 头部 | 24 字节 | 40 字节 |
| 元素大小 | 8 或 16 字节 | 64 字节（固定） |
| 访问 | 按索引 O(1) | 按哈希平均 O(1) |
| 迭代 | 顺序访问 | 按插入顺序遍历已占用槽位的链表 |
| 键 | 隐式（0, 1, 2, ...） | 显式字符串 |

## 对象布局

对象在堆上分配，布局在编译期固定。每个对象以一个 8 字节的类标识符开头，之后整个继承链上的每个属性各占 16 字节：

```
_heap_buf + offset:
┌──────────┬──────────────────┬──────────────────┬─────┐
│ class_id │   prop[0] (16B)  │   prop[1] (16B)  │ ... │
│ (8 bytes)│                  │                  │     │
└──────────┴──────────────────┴──────────────────┴─────┘
 offset+0    offset+8           offset+24          ...
```

| 字段 | 大小 | 描述 |
|---|---|---|
| `class_id` | 8 字节 | 标识该对象所属的类 |
| `prop[n]` | 16 字节 | 属性值（无论类型如何均占 16 字节，以保证偏移量统一） |

对象总大小：`8 + (num_properties × 16)`

属性访问为 O(1)——编译器在编译期解析每个属性继承后的最终偏移量，并直接生成该偏移处的 load/store 指令，无需运行时查找或哈希表。

与数组不同，对象不可调整大小。属性数量由类声明固定。属性按父类优先的顺序存储，其次是子类自身声明的属性。

## 生成器帧布局

`Generator` 对象是堆分配的对象类型块，具有固定的自定义头部，之后跟随生成器专用的参数/局部变量槽。第一个字仍为 class id，因此普通的 `instanceof Generator` 和 `Iterator` 检查可以正常工作，但其余载荷由生成的 resume 函数和 `__rt_gen_*` 运行时辅助函数解释，而非由属性元数据解释。

```
Offset  Size  Field
  0      8    class_id
  8      8    resume_fn_ptr
 16      4    state_idx
 20      4    flags (bit 0 = rewound, bit 1 = terminated)
 24      8    auto_key_counter
 32      8    last_key boxed Mixed pointer
 40      8    last_value boxed Mixed pointer
 48      8    return_value boxed Mixed pointer
 56      8    sent_value boxed Mixed pointer
 64      8    delegated_iter pointer used by `yield from`
 72      8    layout_id
 80      ...  parameter and local slots, 8 bytes each
```

Mixed 字段在存在时拥有装箱单元格的所有权。当生成器帧被释放时，对象深度释放逻辑检测到 `_generator_class_id` 后，会通过与其他地方相同的引用计数运行时路径释放 `last_key`、`last_value`、`return_value`、`sent_value` 以及所有活跃的委托迭代器。

## 数据节

字符串字面量和浮点常量直接内嵌于二进制文件中：

```asm
.data
_str_0: .ascii "Hello, world!\n"
_str_1: .ascii "Error: "
.align 3
_float_0: .quad 0x400921FB54442D18    ; 3.14159...
_float_1: .quad 0x4000000000000000    ; 2.0
```

- 字符串以原始字节存储（无空终止符——长度在编译期已知）
- 浮点数以 64 位 IEEE 754 位模式存储
- 相同的字面量会被去重（源码中两个 `"hello"` = 二进制中一个 `_str_0`）

这些数据是**只读的**——程序永远不会修改它们。当字符串操作需要处理字面量时，从数据节读取，并将结果写入[字符串缓冲区](#the-string-buffer)。

运行时数据层划分为固定共享数据、用户程序数据以及位于 `src/codegen/runtime/data/` 下的动态 `instanceof` 查找格式化数据。它们共同生成以下静态数据表：

- `_fmt_g` — 浮点数转字符串的 printf 格式字符串（`%.14G`）
- `_b64_encode_tbl` — 64 字节的 Base64 编码查找表
- `_b64_decode_tbl` — 256 字节的 Base64 解码查找表
- `_spl_autoload_exts_default`、`_spl_autoload_exts_ptr`、`_spl_autoload_exts_len` — 可变的 SPL 自动加载扩展名状态
- `_heap_err_msg`、`_arr_cap_err_msg`、`_ptr_null_err_msg` — 致命运行时错误字符串
- `_buffer_bounds_msg`、`_buffer_uaf_msg`、`_match_unhandled_msg`、`_static_prop_private_access_msg`、`_instanceof_target_type_msg`、`_iterable_unsupported_kind_msg` — 用于 buffer、`match`、延迟绑定私有静态属性访问、动态 `instanceof` 目标验证及可迭代分发的致命运行时错误字符串
- `_fiber_msg_*` — 构造 `FiberError` 时使用的 Fiber 状态错误消息字符串
- `_rt_diag_suppression`、`_diag_fopen_failed_msg`、`_diag_file_get_contents_failed_msg`、`_diag_define_already_defined_msg` — 运行时警告抑制深度以及 `@` 运算符使用的警告字符串
- `_resource_id_prefix` — 资源显示辅助函数使用的前缀
- `_php_uname_mode_len_msg`、`_php_uname_mode_value_msg` — `php_uname()` 无效模式参数的致命诊断信息
- `_filetype_*`、`_stat_key_*`、`_dirname_*`、`_pathinfo_key_*`、`_tmpfile_template` — I/O 辅助函数使用的文件元数据、路径、stat 数组及临时文件查找字符串
- `_locale_utf8_name`、`_locale_env_name` — 需要回退到宿主 locale 的运行时辅助函数使用的 locale 选择器
- `_json_true`、`_json_false`、`_json_null` — `json_encode` 用于布尔值和 null 的 JSON 关键字字符串（分别为 4、5、4 字节）
- `_json_int_max_str`、`_json_int_min_str` — `JSON_BIGINT_AS_STRING` 使用的十进制阈值字符串
- `_json_err_msg_0` ... `_json_err_msg_10`、`_json_err_msg_table`、`_json_err_msg_count`、`_json_err_loc_prefix`、`_json_err_loc_colon` — `json_last_error_msg()` 的消息查找数据及解码位置后缀片段
- `_day_names` — 84 字节表（7 条目 × 12 字节），包含星期名称、长度及填充，供 `date()` 进行星期格式化
- `_month_names` — 144 字节表（12 条目 × 12 字节），包含月份名称、长度及填充，供 `date()` 进行月份格式化
- `_strtotime_keyword_tab`、`_strtotime_unit_tab` — `strtotime()` 使用的关键字、星期、修饰符及单位查找表
- `_instanceof_target_count`、`_instanceof_target_entries`、`_instanceof_name_*` — 用于动态 `instanceof` 字符串目标的类/接口名称元数据（大小写不敏感），包含前导反斜杠别名
- `_generator_class_id` — 每个程序的 class id，用于在对象深度释放时识别 Generator 帧
- `_json_exception_class_id`、`_stdclass_class_id` — 每个程序的 class id，分别用于 JSON 抛出路径和 stdClass 动态属性辅助函数
- `_class_gc_desc_count`、`_class_gc_desc_ptrs`、`_class_gc_desc_<id>` — 每个类的属性遍历描述符，用于对象深度释放和循环引用收集
- `_class_json_desc_ptrs`、`_class_json_desc_<id>`、`_class_json_pname_<id>_<slot>` — 每个类的 JSON 描述符，用于对象编码和 JsonSerializable 分发
- `_class_attribute_count`、`_class_attribute_ptrs`、`_class_attributes_<id>` — 从 `ClassInfo` 生成的每个类的 PHP attribute 元数据；当前辅助函数和 Reflection API 在代码生成期间将支持的静态查找具体化，而非执行动态运行时类/成员查找
- `_class_vtable_ptrs`、`_class_vtable_<id>` — 每个类的虚表，用于继承实例方法分发
- `_class_static_vtable_ptrs`、`_class_static_vtable_<id>` — 每个类的静态方法表，用于延迟静态绑定
- `_class_destruct_ptrs` — 以 class_id 为索引的 `__destruct` 方法指针（或 `0`），在对象深度释放时查阅
- `_classes_by_name`、`_classes_by_name_count` — 大小写不敏感的类名查找表，用于 `new $variable()` 实例化
- 由 `enum_case_symbol(...)` 生成的枚举 case `.comm` 符号——每个已声明的枚举 case 对应一个 8 字节的单例存储槽

### 全局变量

两个 8 字节的 BSS 槽存储程序的命令行参数：

```asm
.comm _global_argc, 8       ; saved argc from OS
.comm _global_argv, 8       ; saved argv pointer from OS
```

这两个槽在 `_main` 中写入一次（来自操作系统提供的 `x0` 和 `x1`），由 `__rt_build_argv` 例程读取以构建 `$argv`。

### 用户全局变量（`global $var`）

当函数使用 `global $var` 时，编译器为该变量分配 BSS 存储：

```asm
.comm _gvar_x, 16, 3        ; 16 bytes for global $x (enough for string ptr+len or int/float)
.comm _gvar_y, 16, 3        ; 16 bytes for global $y
```

每个全局变量获得 16 字节的 BSS 存储（足以容纳任意 PHP 值）。`_main` 作用域在赋值给任何函数声明为 `global` 的变量时写入这些槽，函数通过这些槽进行读写，而非使用本地栈槽。

### 枚举 case 单例存储

用户定义的枚举同样贡献 BSS 存储。在 `emit_runtime_data_user()` 执行期间，编译器为每个已声明的 case 生成一个 8 字节的 `.comm` 符号，使用 `enum_case_symbol(...)` 生成的经过名称修饰的符号名。

这些槽使枚举 case 在运行时表现为稳定的单例值：代码生成可以直接加载规范 case 的地址，而 `Enum::from()` 等辅助路径可以比较或返回这些规范 case 对象，无需构造临时堆值。

### 静态变量（`static $var`）

静态变量在同一函数的多次调用之间保持其值。每个静态变量获得两个 BSS 分配：

```asm
.comm _static_counter_count, 16, 3    ; 16 bytes for the persisted value
.comm _static_counter_count_init, 8, 3 ; 8-byte init flag (0 = uninitialized)
```

命名模式为 `_static_FUNCNAME_VARNAME`。初始化标志确保初始值表达式仅在第一次调用时求值。在函数尾声处，标记为静态的变量会被保存回其 BSS 存储。

### 静态属性（`ClassName::$prop`）

静态属性是类级别的存储，而非对象字段。在 `emit_runtime_data_user()` 执行期间，每个有效的声明类属性获得一个 16 字节的 BSS 槽：

```asm
.comm _static_prop_Counter_count, 16, 3 ; 16 bytes for Counter::$count
```

命名模式来自 `static_property_symbol(...)`。继承的静态属性指向声明类的槽，因此当属性仅在 `Base` 上声明时，`Base::$count` 和 `Child::$count` 共享同一存储。当子类重新声明静态属性时，该子类获得自己的槽，`static::$count` 在运行时通过被调用类的 id 分发到该槽。`_main` 在用户语句运行之前对静态属性默认值求值，后续的读写直接加载或存储到解析后的槽。

## 内存限制与权衡

| 资源 | 大小 | 耗尽时的行为 |
|---|---|---|
| 栈 | 操作系统默认值（约 8MB） | 栈溢出（崩溃） |
| 字符串缓冲区 | 64KB | 每条语句重置——实际上无限制 |
| 堆 | 8MB（可配置） | 致命错误："heap memory exhausted" |
| 堆元数据 | `_heap_off`、`_heap_free_list`、`_heap_small_bins`、`_heap_debug_enabled`、`_gc_*` 标志/计数器，共 104 字节 | 固定大小的内部记录，对用户不可见 |
| 异常状态 | `_exc_handler_top`、`_exc_call_frame_top`、`_exc_value`，共 24 字节 | 固定大小的 setjmp/longjmp 处理器及抛出值记录 |
| Fiber 调度器状态 | `_fiber_current`、`_fiber_main_saved_sp`、`_fiber_main_saved_exc`、`_fiber_main_saved_call_frame`，共 32 字节 | 固定大小的当前 Fiber 及主帧恢复记录 |
| 运行时诊断 | `_rt_diag_suppression`，共 8 字节 | 固定大小的警告抑制深度，供 `@` 运算符和异常展开使用 |
| JSON 状态 | `_json_last_error`、`_json_active_flags`、`_json_active_depth`、`_json_indent_depth`、`_json_depth_limit`、`_json_validate_idx`、`_json_validate_ptr`、`_json_validate_len`、`_json_decode_assoc`、`_json_error_source_ptr`、`_json_error_location_active`、`_json_error_line`、`_json_error_column`，共 104 字节 | 固定大小的 JSON 调用及解码错误位置记录 |
| CLI 全局变量 | `_global_argc`、`_global_argv`，共 16 字节 | 固定大小的内部记录 |
| 用户全局变量 | 每个 `global $var` 槽位 16 字节 | 随引用的全局变量数量增长 |
| 静态变量 | 每个 `static $var` 24 字节（`16 + 8` 初始化标志） | 随声明的静态局部变量数量增长 |
| 静态属性 | 每个有效声明类的静态属性 16 字节 | 随声明及重声明的静态属性数量增长 |
| 数组容量 | 创建时固定，直到扩容/重哈希逻辑触发 | 若达到硬限制则致命错误："array capacity exceeded" |
| C 字符串缓冲区 | `_cstr_buf`、`_cstr_buf2` 各 4KB，`_empty_str` 1 字节 | 超长路径/字符串会截断至缓冲区大小；`_empty_str` 是安全的零长度字符串指针 |
| 文件描述符状态 | `_eof_flags`、`_stream_read_filters`、`_stream_write_filters` 各 256 字节；`_popen_files`、`_dir_handles`、`_glob_handles`、`_zstream_handles`、`_bzstream_handles`、`_iconv_handles`、`_tls_sessions`、`_stream_chunk_size` 各 2048 字节 | 支持最多 256 个描述符的流、进程、目录、压缩、iconv、TLS 及块大小的逐 fd 记录 |
| 流过滤器暂存区 | `_stream_filter_buf`、`_stream_grow_scratch` 各 64KB | 流过滤器的暂存空间，包括 base64、quoted-printable 编码器等扩增长度的过滤器 |
| 流上下文与回调 | `_stream_context_options`、`_stream_notification_callback`、`_stream_connect_host`、`_stream_open_opened_path_scratch`、`_url_stat_matched` | 当前流上下文选项哈希、通知回调、TLS 对端主机名、包装器已打开路径暂存及包装器 url_stat 匹配标志 |
| TLS 与加密函数槽位 | `_elephc_tls_*_fn`、`_zlib_*_fn`、`_bz2_*_fn`、`_phar_zlib_*_fn`、`_phar_bz2_*_fn`、`_iconv_*_fn`、`_elephc_crypto_*_fn`，每槽 8 字节 | 延迟绑定的函数指针，仅在调用点发布符号时才链接可选的 TLS/压缩/iconv/加密支持 |
| HTTP/HTTPS/FTP 缓冲区 | `_http_resp_buf`、`_https_resp_buf`、`_user_wrapper_drain_buf`、`_phar_write_out` 各 1MB；`_http_req_scratch` 8KB；`_http_redirect_path_buf`、`_fgc_url_retr` 各 2KB；`_fgc_url_addr`、`_fsockopen_addr` 各 512 字节；`_ftp_resp_buf` 4KB；`_ftp_data_addr`、`_ftp_cmd_scratch` 各 64 字节 | 协议专用的响应、请求、重定向、FTP、包装器及 PHAR 写入暂存缓冲区 |
| HTTP 活跃上下文 | `_http_active_ignore_errors`、`_http_active_max_redirects`、`_http_active_timeout_seconds`、`_http_active_proxy_ptr`、`_http_active_proxy_len`、`_http_active_host_ptr`、`_http_active_host_len`、`_http_redirect_path_len` | HTTP 请求构建与重定向/打开辅助函数之间共享的固定大小状态 |
| Socket 地址暂存区 | `_recvfrom_addr_ptr`、`_recvfrom_addr_len`、`_accept_peer_ptr`、`_accept_peer_len` 各 8 字节 | 存储通过引用传递的 socket 参数所返回的对端/地址字符串 |
| 协议/服务查找缓冲区 | `_protoent_buf` 32KB，`_servent_buf` 1MB | 协议和服务数据库查找的暂存缓冲区 |
| 主体查找缓冲区 | `_principal_lookup_buf` 4KB，`_etc_passwd_path`、`_etc_group_path`、`_principal_lookup_read_mode` | 暂存行缓冲区及固定字面量，用于 `chown()`/`chgrp()` 字符串名称解析时扫描 `/etc/passwd` / `/etc/group`（不使用 NSS） |
| 用户包装器与过滤器注册表 | `_user_wrappers`、`_user_wrapper_handles` 各 2048 字节；`_user_filter_registry`、`_user_filter_instances` 各 4096 字节 | 已注册的流包装器、活跃包装器句柄、用户过滤器定义及已挂载的过滤器实例 |
| PHAR 写入状态 | `_phar_write_len`、`_phar_write_tpl_len`、`_phar_write_path_ptr`、`_phar_write_path_len`、`_phar_write_entry_ptr`、`_phar_write_entry_len`、`_phar_write_url_ptr`、`_phar_write_url_len` 各 8 字节 | 与 1MB `_phar_write_out` 归档缓冲区配套的状态 |
| 数据段 | 无固定限制 | 随唯一字面量数量增长 |

## 内存管理策略

elephc 采用**带引用计数的空闲列表分配器加上定向循环收集器**——既非纯粹的碰撞分配，也不是全堆追踪式运行时。内存在以下情况下被回收：

1. **引用计数** — 每次堆分配都携带一个 32 位引用计数（初始值为 1）。共享引用时，`__rt_incref` 将其递增。释放引用时，`__rt_decref_array`、`__rt_decref_hash` 或 `__rt_decref_object` 将其递减，计数归零后释放该块
2. **数组/哈希的写时复制拆分** — 普通赋值仍然共享容器存储，但首次写操作会在修改前克隆共享容器
3. **代码生成阶段的所有权追踪** — 局部变量、全局变量、静态变量、`foreach` 变量、`list(...)` 目标及调用实参在编译期被分类为"拥有"或"借用"，以便新的所有者在存储借用的堆值前先保留它们
4. **变量重赋值** — 当 `$x = "new value"` 覆盖字符串或数组时，旧的堆块被释放或引用计数递减，并归还给分配器以供复用
5. **`unset($x)`** — 显式释放该变量的堆分配
6. **FFI 字符串调用清理** — 为 `extern function foo(string $s)` 调用创建的临时 C 字符串在原生调用返回后立即释放
7. **字符串缓冲区重置** — 拼接缓冲区在每条语句结束时重置；需要存活的字符串通过 `__rt_str_persist` 复制到堆上
8. **栈内存** — 函数返回时自动回收
9. **Generator 帧释放** — Generator 帧参与对象引用计数，并为其帧槽位和委托迭代器提供自定义的深度释放分支
10. **资源作用域清理** — Mixed 装箱资源（标签 9）在高位载荷字中携带资源类型子类型，当装箱被释放时 `__rt_mixed_free_deep` 会运行对应的析构函数：类型 1 = 原生流 fd（`close()`），类型 2 = HashContext 句柄（通过 `__rt_hash_ctx_free` 调用 `elephc_crypto_free`），类型 3 = `popen` 管道（`__rt_pclose`，关闭 `FILE*` 并回收子进程），类型 4 = `opendir` 流（`__rt_closedir`）。类型 0 资源（通用资源）被跳过；每个 fd 类型还会跳过句柄值 `>= 0x40000000`——这些是合成包装器句柄，以及显式调用 `fclose()`/`pclose()`/`closedir()` 后写入装箱的 `-1` 哨兵值，用于确保描述符不会被二次释放（即使其 fd 号已被复用）。别名安全性来自 Mixed 装箱的引用计数——`$b = $a` 会对装箱递增引用计数，因此只有最后一次释放才会触发析构函数
11. **进程退出** — 所有内存由操作系统回收

### 不会被释放的内容

- **不相邻的空闲块**仍然不会被压缩——尽管相邻空闲块在释放时会被合并、超大空闲块在分配时会被分割，但随时间推移碎片化仍可能发生
- **指针目标**仅因存在原始指针而不会被追踪所有权；指针值本身只是一个地址
- **`_concat_buf` 中的中间暂存字符串**不会被单独释放——缓冲区仅在每条语句结束时整体重置
- **通用函数尾声**不会对所有堆局部变量进行全量引用计数递减。当前仅对被判定为 `Owned` 的槽位进行选择性清理；当所有分支路径都直接将同一堆支持类型赋给同一局部变量时，完整的 `if`/`elseif`/`else` 分支结构可以恢复该清理逻辑。更动态的借用/控制流路径仍被有意排除在外
- **容器复制内置函数**不再对常见嵌套载荷路径盲目复制借用的堆句柄：带引用计数的运行时变体现在会在新数组/哈希表获得所有权前先保留值（涉及含展开语法的 `array` 字面量、`array_merge`、`array_chunk`、`array_slice`、`array_reverse`、`array_pad`、`array_unique`、`array_splice`、`array_diff`、`array_intersect`、`array_filter`、`array_fill`、`array_combine`、`array_fill_keys`）
- **回归测试覆盖范围**现在明确测试局部别名、借用的嵌套容器返回、`Owned`/`Borrowed` 控制流合并及作用域退出路径，以便未来的所有权工作拥有精确的检测点，而非仅依赖大型端到端测试套件
- **原始/堆外所有权循环**仍在收集器的范围之外。`ptr` 值、extern 管理的缓冲区及原始辅助分配（`kind=0`）不会仅因某处存在地址就被遍历
- **类型 0 资源**（通用/未知资源类型，包括合成用户包装器句柄 `>= 0x40000000`）不会被 Mixed 深度释放路径自动释放——其生命周期由包装器层或用户显式调用 `close()` 来管理。类型 1–4（原生流 fd、HashContext、`popen` 管道、`opendir` 流）则在作用域退出时自动释放
- **`hash_final()` 后复用 HashContext** 在内存安全上没有问题，但行为与 PHP 不等价：`elephc_crypto_final` 对*克隆体*执行 finalize 操作，原始句柄仍然存活并由其 Mixed 装箱拥有，因此装箱的类型 2 析构函数恰好释放一次。对同一句柄再次调用 `hash_final()` 或调用 `hash_update()`/`hash_copy()` 不会触发双重释放或释放后使用（PHP 中此时会抛出"Supplied resource is not a valid Hash Context resource"），而只是继续对仍然存活的上下文进行哈希运算（详见 `src/codegen/runtime/strings/hash_context.rs`）

### 定向循环收集

运行时现已包含针对堆支持的 `array`、关联数组/哈希及 `object` 图的定向收集器：

- 分配器头部携带统一的堆类型标签（`raw`、`string`、`array`、`hash`、`object`、`boxed mixed`）
- 索引数组将运行时 `value_type` 打包到同一类型字段中，以便收集器判断其元素是否可能包含嵌套堆指针
- 对象记录运行时属性标签/元数据，并以 `_class_gc_desc_*` 表作为属性遍历的编译期后备方案；Generator 帧是 object 类型的块，具有以 `_generator_class_id` 为键的自定义深度释放分支
- Mixed 释放路径使用 `__rt_decref_any`，使深度释放和 GC 遍历可通过统一的分发器释放嵌套的字符串/数组/哈希/对象

`__rt_gc_collect_cycles` 有意比完整追踪式 GC 更为局限：它忽略字符串和原始辅助缓冲区，清除临时元数据，仅统计堆内部的入边，标记外部可达的容器/对象块，然后通过深度释放辅助函数释放未标记的其余部分。这使收集器专注于纯引用计数无法解决的结构性泄漏类别，而无需将整个运行时改造成移动式或停止世界式的堆。

### 性能特性

对于形如 `for ($i = 0; $i < 1000; $i++) { $s .= "x"; }` 的循环：

- 每次迭代都会释放旧的 `$s` 并分配一个新的
- 旧块进入空闲列表，新块来自 bump 分配（容量递增）
- 最终字符串的堆使用量为 O(N)，而非 O(N²)
- 在 8MB 堆的情况下，可轻松支撑数千次迭代
