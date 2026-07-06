---
title: "运行时"
description: "用于字符串、数组、生成器、Fiber、系统调用、异常和 I/O 的手写汇编例程。"
sidebar:
  order: 8
---

**来源：** `src/codegen/runtime/` — `mod.rs`, `emitters.rs`, `data/`, `strings/`, `arrays/`, `buffers/`, `callables/`, `exceptions.rs`, `exceptions/`, `io/`, `objects/`, `spl/`, `system/`, `pointers/`, `fibers/`, `generators/`

运行时是一组**手写汇编例程**，用于处理那些过于复杂、不适合内联代码生成的操作。当[代码生成器](the-codegen.md)需要把整数转换成字符串，或拼接两个字符串时，它会发出 `bl __rt_itoa` 或 `bl __rt_concat`，也就是调用一个运行时例程。

这些例程最终会进入每个编译后的二进制文件。在 CLI 流程中，它们通常会预先汇编进缓存的运行时对象，而不是以文本形式追加到每个用户 `.s` 文件后面；但它们仍然是最终可执行文件的一部分，而不是外部共享依赖。

## 为什么需要运行时？

有些操作无法用几条内联指令完成：

- **整数转字符串**（`itoa`）：需要循环除以 10、取出数字，并从右向左写入
- **字符串拼接**：需要把两个源字符串的字节复制到一个缓冲区
- **数组操作**：需要堆分配、边界检查和元素复制

这些操作每个都要 20 到 50 多条指令。如果在每个调用点都内联，会让二进制文件膨胀。因此它们只发出一次，然后通过 `bl` 调用。

## 命名约定

所有运行时例程都以 `__rt_` 开头：

```
__rt_itoa          integer → string
__rt_resource_to_string resource → "Resource id #N"
__rt_ftoa          float → string
__rt_concat        string + string → string
__rt_str_eq        string == string → bool
__rt_array_new     allocate a new array
__rt_throw_current throw the active exception
__rt_build_argv    build $argv from C strings
```

## 诊断例程

**来源：** `src/codegen/runtime/diagnostics.rs`

这些辅助例程实现 PHP 的 `@` 错误抑制运算符以及运行时 warning 通道。抑制深度保存在 `_rt_diag_suppression` 中；只要它非零，可抑制的 warning 就会被静默丢弃，而不是写入 stderr。它们会先于任何 PHP 可见的辅助例程发出，因此运行时的其他部分可以通过同一条路径报告 warning。

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_diag_push_suppression` | 进入一层嵌套的 `@` 抑制作用域（递增 `_rt_diag_suppression`） | — | — |
| `__rt_diag_pop_suppression` | 离开一层 `@` 抑制作用域，并防止下溢 | — | — |
| `__rt_diag_warning` | 在未启用抑制时，把运行时 warning 字符串写入 stderr | `x1`/`x2` = message string | — |

## 字符串例程

**来源：** `src/codegen/runtime/strings/`

### `__rt_itoa` — 整数转字符串

**文件：** `strings/itoa.rs`

把 `x0` 中的有符号 64 位整数转换成十进制字符串。

**输入：** `x0` = integer value
**输出：** `x1` = pointer to string, `x2` = length

**算法：**

1. 检查是否为负数 → 设置标志并取反
2. 检查是否为零 → 直接输出 "0"
3. 循环：除以 10（`udiv` + `msub`），把余数转换成 ASCII 数字（`+ 48`），从右向左存储
4. 如果是负数，则前置 '-'
5. 更新 concat buffer 偏移

数字会**从右向左**写入，因为除法会先得到最低有效位。结果会写入[拼接缓冲区](memory-model.md#the-string-buffer-scratch-pad)。

### `__rt_resource_to_string` — Resource 转字符串

**文件：** `strings/resource_to_string.rs`

把 stream handle 使用的原生 resource payload 格式化成 PHP 的显示字符串（`Resource id #N`）。这个辅助例程让 resource 在装箱成 `mixed` 时仍然区别于整数，同时也允许 I/O 运行时把底层文件描述符传给 stream syscall。

**输入：** `x0` = native resource payload
**输出：** `x1` = pointer to string, `x2` = length

`__rt_resource_write_stdout` 为 `echo` / `print` 使用同样的显示形式，但不会把原始文件描述符暴露成整数。

### `__rt_ftoa` — 浮点数转字符串

**文件：** `strings/ftoa.rs`

把 `d0` 中的双精度浮点数转换成十进制字符串。它会处理特殊情况：`INF`、`-INF`、`NAN`。对于普通数值，它会分离整数部分和小数部分，分别转换成数字，再用小数点连接。

**输入：** `d0` = float value
**输出：** `x1` = pointer to string, `x2` = length

### `__rt_concat` — 字符串拼接

**文件：** `strings/concat.rs`

通过把两个字符串都复制进[拼接缓冲区](memory-model.md#the-string-buffer-scratch-pad)来完成拼接。

**输入：** `x1`/`x2` = left string (ptr/len), `x3`/`x4` = right string (ptr/len)
**输出：** `x1` = pointer to result, `x2` = total length

**算法：**

1. 取得 concat buffer 的当前位置
2. 复制左侧字符串字节（逐字节循环）
3. 复制右侧字符串字节
4. 更新 buffer 偏移
5. 返回结果起始指针和总长度

### `__rt_atoi` — 字符串转整数

**文件：** `strings/atoi.rs`

把十进制字符串解析成 64 位整数。支持可选的前导 `-` 符号。

**输入：** `x1` = string pointer, `x2` = length
**输出：** `x0` = integer value

### `__rt_str_eq` — 字符串相等

**文件：** `strings/str_eq.rs`

逐字节比较两个字符串。

**输入：** `x1`/`x2` = first string, `x3`/`x4` = second string
**输出：** `x0` = 1 if equal, 0 if not

**算法：**

1. 比较长度；如果不同，立即返回 0
2. 循环逐字节比较
3. 如果所有字节都匹配，返回 1

### 其他字符串例程

每个例程都遵循同一模式：输入放在寄存器中，输出放在标准结果寄存器中：

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_strcopy` | 把字符串复制进 concat buffer | `x1`/`x2` | `x1`/`x2` |
| `__rt_str_to_number` | 为宽松比较和 numeric-string cast 解析 PHP numeric string | `x1`/`x2` | numeric payload + success flag |
| `__rt_str_to_int` | 解析 PHP numeric-string 前缀（通过 `__rt_str_to_number`），并像 PHP `(int)` cast 一样向零截断 | `x1`/`x2` | `x0` (integer) |
| `__rt_str_loose_eq` | 在回退到字节比较前，按 PHP 宽松比较的 numeric-string 规则比较两个字符串 | two strings | `x0` (0 or 1) |
| `__rt_strtolower` | 转换为小写 | `x1`/`x2` | `x1`/`x2` |
| `__rt_strtoupper` | 转换为大写 | `x1`/`x2` | `x1`/`x2` |
| `__rt_trim` | 去除空白字符（无参数）或 mask 中的字符 | `x1`/`x2` | `x1`/`x2` |
| `__rt_ltrim` / `__rt_rtrim` | 去除左侧/右侧空白字符或 mask | `x1`/`x2` | `x1`/`x2` |
| `__rt_trim_mask` | 从两端去除自定义 mask 中的字符 | `x1`/`x2` + mask | `x1`/`x2` |
| `__rt_ltrim_mask` / `__rt_rtrim_mask` | 从左侧/右侧去除自定义 mask 中的字符 | `x1`/`x2` + mask | `x1`/`x2` |
| `__rt_strrev` | 反转字符串（按字节） | `x1`/`x2` | `x1`/`x2` |
| `__rt_grapheme_strrev` | 按 grapheme cluster 反转 UTF-8 字符串，供 PHP 8.6 `grapheme_strrev()` 使用；遇到畸形 UTF-8 时返回 false | `x1`/`x2` | `x1`/`x2` |
| `__rt_strpos` | 查找子字符串 | `x1`/`x2` + `x3`/`x4` | `x0` (index or -1) |
| `__rt_strrpos` | 查找最后一次出现位置 | `x1`/`x2` + `x3`/`x4` | `x0` |
| `__rt_str_repeat` | 重复 N 次，大结果回退到堆 | `x1`/`x2` + count | `x1`/`x2` |
| `__rt_str_replace` | 替换所有出现项 | search + replace + subject | `x1`/`x2` |
| `__rt_explode` | 按分隔符拆分 | delimiter + string | `x0` (array ptr) |
| `__rt_implode` | 用 glue 连接字符串数组 | glue + array | `x1`/`x2` |
| `__rt_implode_int` | 用 glue 连接整数数组 | glue + array | `x1`/`x2` |
| `__rt_strcmp` | 二进制比较 | two strings | `x0` (-1, 0, 1) |
| `__rt_strcasecmp` | 不区分大小写比较 | two strings | `x0` |
| `__rt_str_starts_with` | 检查前缀匹配 | `x1`/`x2` + `x3`/`x4` | `x0` (0 or 1) |
| `__rt_str_ends_with` | 检查后缀匹配 | `x1`/`x2` + `x3`/`x4` | `x0` (0 or 1) |
| `__rt_chr` | ASCII code → char | `x0` | `x1`/`x2` |
| `__rt_addslashes` | 转义引号和反斜杠 | `x1`/`x2` | `x1`/`x2` |
| `__rt_nl2br` | 在换行前插入 `<br />` | `x1`/`x2` | `x1`/`x2` |
| `__rt_bin2hex` | 二进制 → 十六进制字符串 | `x1`/`x2` | `x1`/`x2` |
| `__rt_hex2bin` | 十六进制 → 二进制 | `x1`/`x2` | `x1`/`x2` |
| `__rt_md5` | MD5 hash | `x1`/`x2` | `x1`/`x2` |
| `__rt_sha1` | SHA1 hash | `x1`/`x2` | `x1`/`x2` |
| `__rt_sprintf` | 格式化字符串 | format + args on stack | `x1`/`x2` |
| `__rt_base64_encode` | Base64 encode | `x1`/`x2` | `x1`/`x2` |
| `__rt_base64_decode` | Base64 decode | `x1`/`x2` | `x1`/`x2` |
| `__rt_urlencode` | URL encode | `x1`/`x2` | `x1`/`x2` |
| `__rt_urldecode` | URL decode | `x1`/`x2` | `x1`/`x2` |
| `__rt_htmlspecialchars` | HTML escape | `x1`/`x2` | `x1`/`x2` |
| `__rt_html_entity_decode` | Decode HTML entities | `x1`/`x2` | `x1`/`x2` |
| `__rt_rawurlencode` | URL encode (RFC 3986) | `x1`/`x2` | `x1`/`x2` |
| `__rt_stripslashes` | 移除转义反斜杠 | `x1`/`x2` | `x1`/`x2` |
| `__rt_ucwords` | 把每个单词首字母转成大写 | `x1`/`x2` | `x1`/`x2` |
| `__rt_str_ireplace` | 不区分大小写替换 | search + replace + subject | `x1`/`x2` |
| `__rt_substr_replace` | 在 offset 处替换子串 | str + replacement + start + len | `x1`/`x2` |
| `__rt_str_pad` | 把字符串填充到指定长度 | str + len + pad_str + type | `x1`/`x2` |
| `__rt_str_split` | 拆分成块 | str + chunk_len | `x0` (array ptr) |
| `__rt_wordwrap` | 按词边界换行文本 | str + width + break + cut | `x1`/`x2` |
| `__rt_number_format` | 用分隔符格式化数字 | float + decimals + sep | `x1`/`x2` |
| `__rt_hash` | 使用指定算法计算 hash | algo + data | `x1`/`x2` |
| `__rt_hash_init` / `__rt_hash_update` / `__rt_hash_final` | 支撑 `hash_init()` 等函数的增量 hash-context API | context + data | context / `x1`/`x2` |
| `__rt_hash_copy` | 克隆增量 hash context | context | context |
| `__rt_hash_ctx_free` | 通过 `elephc_crypto_free` 释放 HashContext；这是唯一析构器，在作用域退出释放 Mixed(tag=9, kind=2) cell 时由 `__rt_mixed_free_deep` 调用（`hash_final` 不再释放） | context | — |
| `__rt_hash_hmac` | 对消息计算 keyed HMAC | algo + key + data | `x1`/`x2` |
| `__rt_hash_equals` | 常量时间字符串比较 | two strings | `x0` (0 or 1) |
| `__rt_hash_algos_list` | 构建 `hash_algos()` 支持算法名称数组 | — | `x0` (array ptr) |
| `__rt_digest_to_string` | 把 raw digest 格式化成小写十六进制 | digest | `x1`/`x2` |
| `__rt_crc32` | CRC32 校验和 | `x1`/`x2` | `x0` |
| `__rt_inet_ntop` / `__rt_inet_pton` | IPv4/IPv6 address ↔ packed-binary conversion | address | `x1`/`x2` |
| `__rt_long2ip` / `__rt_ip2long` | dotted-quad string ↔ integer conversion | `x0` or `x1`/`x2` | `x1`/`x2` or `x0` |
| `__rt_vsprintf` | 使用参数数组进行 `vsprintf()` 格式化 | format + array | `x1`/`x2` |
| `__rt_sscanf` | 按格式解析字符串 | str + format | `x0` (array ptr) |

## Callable 例程

**来源：** `src/codegen/runtime/callables/`（包含 `mod.rs` 在内共 3 个文件）

当参数不是编译期字面量，也不是静态已知的 callable 值时，这些例程会实现 `is_callable()` 的运行时回退路径。它们会查询生成的元数据，覆盖 builtin、用户函数、public 方法、public static 方法以及 `__invoke` 对象。

动态调用 builtin 使用生成的 callable descriptor，而不是这些布尔辅助例程。descriptor 是一条八字记录：callable kind、原生入口指针、PHP 可见名称指针、名称长度、签名记录指针、环境记录指针、调用记录指针，以及可选的 uniform invoker 指针。间接调用通过从 descriptor 加载原生入口，保持一字 callable ABI；descriptor-invoker 路径则调用生成的 `(descriptor, boxed argument container) -> mixed` 适配器。

签名侧记录会保存可见参数数、必需参数数和常规参数数；variadic 索引；返回类型和返回寄存器数量；声明返回标志；参数名称和类型；默认值；by-reference 标志；以及声明参数标志。环境记录保存 capture 和隐藏 wrapper 参数绑定。调用记录保存 callable 形态（`string`、callable array、closure、first-class callable、object `__invoke`、static method、instance method、builtin、extern 或 user function），以及适用时的 receiver、method 和辅助名称。

`call_user_func()`、`call_user_func_array()`、直接 string-variable 调用、直接 callable-array 变量和字面量调用、直接 invokable-object 调用、method first-class callable 变量调用，以及 `iterator_apply()`，都会把运行时字符串名称或 descriptor 选中的 callable 入口与生成的 case 比较。运行时字符串 callback 名称现在会物化匹配到的 descriptor，并调用它的 uniform invoker slot，覆盖 user function、extern wrapper、builtin 和 public static method；因此签名默认值、命名参数、by-reference 标志、variadic 和返回值装箱都隐藏在 descriptor 后面，而不是散落在每个字符串分发调用点中。`iterator_apply()` 也可以保留一个分支选中的 captured descriptor 或运行时选中的 callable-array descriptor，并在每次循环迭代时直接调用该 descriptor 的 invoker。`array_map()`、`array_filter()`、`array_reduce()`、`array_walk()`、`usort()`、`uksort()`、`uasort()` 和 `preg_replace_callback()` 会把 descriptor 值的 callable 变量和 `callable` 参数保留在 descriptor callback 环境中，因此 by-value closure capture、method receiver 和 late-static binding 状态会从 descriptor storage 读取，而不是从当前源码局部变量读取。这些 callback runtime 还会先把运行时 callable-array 变量（如 `[$object, $method]` 或 `[$class, $method]`）与 public method descriptor case 匹配，再调用共享的 descriptor callback wrapper。`usort()`、`uksort()` 和 `uasort()` 为分支选中的 captured descriptor 使用 descriptor comparator environment。`CallbackFilterIterator` 和 `RecursiveCallbackFilterIterator` 会把分支选中的 captured descriptor，以及运行时选中的 callable-array 变量或字面量 descriptor，存入持久 callback environment，然后在 `accept()` 中调用同一个 descriptor invoker。`call_user_func()` 和直接 callable-variable 调用会为 descriptor-backed 调用构建 boxed indexed argument container；命名直接调用会构建 associative hash。两种形态中的变量参数都可以编码成内部 reference-cell marker，包括 named hash entry 中的 boxed marker，因此生成的 invoker 在读取 descriptor signature 后，可以把原始 storage 传给 by-reference 参数，或为 by-value 参数解引用。`call_user_func_array()` 会克隆给定 indexed array 或 hash，把克隆拓宽为 boxed `Mixed`，并向 descriptor invoker 传入一个 boxed container。invoker 在运行时检查 boxed container tag，分发到 indexed-array 或 associative-hash 参数物化逻辑，为声明的 array 参数 unbox boxed array/hash payload，并按 callable signature 而不是 caller array shape 建立键。带有 `use (...)`、receiver 或 late-static-binding context 的 closure 和 first-class-callable descriptor，会分配运行时 descriptor copy，其固定 header 后跟 capture value slot；descriptor invoker 会把这些 slot 重新加载为隐藏参数，包括 by-reference capture。即使原始 receiver 变量仍有静态元数据，method first-class callable 变量也会使用这条 descriptor 路径，因此重新赋值源局部变量不会改变已存储的 receiver。早先由运行时表达式选出 descriptor 的 callable 变量和数组元素，在局部调用点不再有静态签名或 capture 元数据时，会使用 descriptor invoker。编译期 static-method callable array 现在会为直接变量和字面量调用、`call_user_func()` 调用以及 `call_user_func_array()` 调用物化 static-method descriptor，包括会把剩余字符串键转发到用户定义 variadic method tail 的 associative argument container。直接 instance-method callable-array 变量调用会从已存储 callable array 的 slot zero 读取 receiver；直接 instance-method callable-array 字面量调用会先求值 receiver，再求值可见调用参数；两者都会把 receiver 作为 descriptor argument zero 前置，然后让 descriptor signature 规范化可见的 named/default/variadic/by-reference 参数。直接 invokable-object 调用会把 object 作为 descriptor argument zero 前置，并使用 object-invoke descriptor shape 处理同样的 named/default/variadic/by-reference 逻辑，包括 `(new Runner())(...)` 这样的非局部 receiver 表达式。编译期 instance-method callable array 和 invokable object，会在直接 `call_user_func()` 调用以及 `call_user_func_array()` 调用中使用 instance/object descriptor shape；后者的 argument container 可以是 literal indexed、literal associative、dynamic indexed、dynamic associative 或 runtime-opaque mixed/union。receiver 会作为合成 descriptor argument 前置到可见 callback 参数之前。receiver-bound runtime-opaque container 会按 boxed payload tag 分支，克隆并拓宽 payload 为 Mixed entry，然后为 descriptor invoker 构建 receiver-prefixed indexed array 或 associative hash。

Extern callback trampoline 从面向 C 的入口点使用同一个 descriptor invoker。每个 extern callable 调用点都有生成的 descriptor slot 和 trampoline symbol；trampoline 会重新加载当前 descriptor，把传入的 scalar/pointer C callback 参数装箱成临时 indexed `Mixed` array，调用 descriptor，把 boxed 结果 cast 成 `int`、`float`、`bool`、`ptr` 或 `void`，然后按目标 C ABI 返回。

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_is_callable_string` | 把字符串解析为 builtin、active user function 或 `Class::method` static-method callable | `x1`/`x2` = string | `x0` = bool |
| `__rt_is_callable_method_name` | 检查对象是否暴露给定名称的 public method | object pointer + method string | `x0` = bool |
| `__rt_is_callable_static_method_name` | 检查 class string 是否暴露给定名称的 public static method | class string + method string | `x0` = bool |
| `__rt_is_callable_object` | 通过 public `__invoke` 元数据检查对象是否 callable | object pointer | `x0` = bool |
| `__rt_is_callable_array` | 校验 `[$obj, "method"]` 或 `[ClassName::class, "method"]` 这样的 indexed callable array | array pointer | `x0` = bool |
| `__rt_is_callable_assoc` | 校验通过 boxed 或 dynamic data path 产生的 associative callable-array payload | hash pointer | `x0` = bool |
| `__rt_is_callable_mixed` | Unbox 一个 Mixed 值，并分发到 string、array、hash 或 object callable 检查 | mixed pointer | `x0` = bool |
| `__rt_is_callable_heap` | 通过检查 heap-kind tag，从 raw heap pointer 分发 callable 检查 | heap pointer | `x0` = bool |
| `__rt_callable_descriptor_release` | 释放 heap-backed callable descriptor copy，以及追加在 static header 后面的 by-value capture slot；static `.data` descriptor 会被忽略 | `x0` = descriptor pointer | — |

## 数组例程

**来源：** `src/codegen/runtime/arrays/`（131 个文件）

### 核心分配

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_heap_alloc` | 带 16 字节 `[size:4][refcount:4][kind:8]` header 的 free-list + bump allocator | `x0` = size | `x0` = pointer |
| `__rt_heap_free` | 把 block 归还到 free list（如果是最后一个 block，则重置 bump） | `x0` = pointer | — |
| `__rt_heap_free_safe` | 仅当指针位于堆范围内时释放 | `x0` = pointer | — |
| `__rt_heap_debug_fail` | 打印 heap-debug fatal error 并立即终止 | `x1` = msg ptr, `x2` = msg len | — |
| `__rt_heap_debug_check_live` | 拒绝对已经释放的 heap block 执行 `incref` / `decref` | `x0` = pointer | — |
| `__rt_heap_debug_validate_free_list` | 在 allocator mutation 前校验有序 free list 和 small-bin chain | — | — |
| `__rt_heap_debug_report` | 打印 heap-debug 退出摘要，包含 leak/high-water 统计 | — | — |
| `__rt_heap_kind` | 返回 heap-backed 指针的统一 heap-kind tag | `x0` = pointer | `x0` = kind |
| `__rt_array_new` | 创建带 header 的 indexed array | `x0` = capacity, `x1` = elem_size | `x0` = array ptr |
| `__rt_array_clone_shallow` | 为 copy-on-write split 克隆 indexed array storage，按需保留嵌套 heap child | `x0` = array | `x0` = new array |
| `__rt_array_to_mixed` | 把 indexed array 的 live slot 转换成 boxed Mixed cell，并把数组元数据标记为 mixed | `x0` = array | `x0` = same array |
| `__rt_array_ensure_unique` | 在 mutation 前拆分共享 indexed array | `x0` = array | `x0` = unique array |
| `__rt_array_grow` | 确保唯一性、把 array capacity 翻倍、复制元素并释放旧的 unique storage | `x0` = array | `x0` = new array |
| `__rt_array_free_deep` | 释放 array storage，并释放嵌套 heap-backed 元素 | `x0` = array | — |
| `__rt_array_union` | 构建 PHP indexed-array union：左侧数字 key 胜出，只追加右侧缺失的 suffix key | `x0` = left array, `x1` = right array | `x0` = result array |
| `__rt_array_hash_union` | 构建 PHP indexed+associative union：先把左侧 index 转换为 integer hash key，再追加右侧缺失 entry | `x0` = left array, `x1` = right hash | `x0` = result hash |
| `__rt_array_push_int` | 向 array 追加 int（按需增长） | `x0` = array, `x1` = value | `x0` = array |
| `__rt_array_push_refcounted` | 对借用的 heap payload 执行 `incref`，再作为 8 字节 array element 追加 | `x0` = array, `x1` = heap ptr | `x0` = array |
| `__rt_array_push_str` | 持久化字符串并追加到 array（按需增长） | `x0` = array, `x1`/`x2` = str | `x0` = array |
| `__rt_sort_int` / `__rt_rsort_int` | 原地升序或降序排序 | `x0` = array | — |
| `__rt_str_persist` | 把字符串从 concat_buf 复制到堆（跳过 .data/heap） | `x1`/`x2` = str | `x1`/`x2` = heap str |

常见的会产生副本的 array/hash 例程，现在也为嵌套 heap-backed payload 提供专用的 `_refcounted` 兄弟版本。这些变体会先保留借用值，再把它们 push 或 insert 到新分配的 array/hash table 中，覆盖带 spread 的数组字面量，以及 `array_merge`、`array_chunk`、`array_slice`、`array_reverse`、`array_pad`、`array_unique`、`array_splice`、`array_diff`、`array_intersect`、`array_filter`、`array_fill`、`array_combine` 和 `array_fill_keys`。

| Refcounted 兄弟例程 | 作用 |
|---|---|
| `__rt_array_reverse_refcounted` | 反转 indexed array，同时保留嵌套 heap-backed 元素 |
| `__rt_array_merge_refcounted` | 合并携带嵌套 heap-backed payload 的 indexed array |
| `__rt_array_slice_refcounted` / `__rt_array_splice_refcounted` | 在 slice 或 splice 时保留嵌套 heap-backed payload |
| `__rt_array_unique_refcounted` | 去重，同时保留被 retain 的 heap-backed 元素 |
| `__rt_array_fill_refcounted` / `__rt_array_fill_keys_refcounted` | 从借用的 heap-backed 值构建填充 array/hash |
| `__rt_array_pad_refcounted` | 用 retain 后的 heap-backed 值填充 array |
| `__rt_array_diff_refcounted` / `__rt_array_intersect_refcounted` | 集合式比较，并保持嵌套 heap-backed 值存活 |
| `__rt_array_combine_refcounted` | 把 key/value array 组合成 hash，同时保留 heap-backed 值 |
| `__rt_array_chunk_refcounted` | 把 array 拆分成 retain 后的 heap-backed chunk |
| `__rt_array_filter_refcounted` | 过滤 heap-backed 元素数组，同时不丢弃借用 payload；可选第三个参数携带 captured-closure environment |
| `__rt_array_merge_into_refcounted` | 把一个 indexed array 原地追加到另一个中，同时保留嵌套 heap-backed 元素 |

### Hash table（用于关联数组）

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_hash_fnv1a` | 字符串的 FNV-1a hash | `x1`/`x2` = string | `x0` = hash |
| `__rt_hash_normalize_key` | 规范化 PHP string array key，把整数形式的 numeric string 转换成 integer key | `x1`/`x2` = string key | `x1`/`x2` = normalized key |
| `__rt_hash_key_hash` | 对规范化后的 int/string array key 求 hash | `x1`/`x2` = normalized key | `x0` = hash |
| `__rt_hash_key_eq` | 比较规范化后的 int/string array key | `x1`/`x2`, `x3`/`x4` = keys | `x0` = equal flag |
| `__rt_hash_new` | 创建 hash table | `x0` = capacity, `x1` = coarse value-type summary | `x0` = hash ptr |
| `__rt_hash_clone_shallow` | 为 copy-on-write split 克隆 hash storage，按需重新持久化 key 并保留嵌套 heap value | `x0` = hash | `x0` = new hash |
| `__rt_hash_ensure_unique` | 在 mutation 前拆分共享 hash table | `x0` = hash | `x0` = unique hash |
| `__rt_hash_grow` | 把 hash table capacity 翻倍，并重新散列所有 entry | `x0` = hash | `x0` = new hash |
| `__rt_hash_set` | 插入/更新（负载 75% 时增长） | `x0`=hash, `x1`/`x2`=normalized key, `x3`/`x4`=value, `x5`=value_tag | `x0` = hash |
| `__rt_hash_append` | 使用 PHP 的下一个自动整数 key（最大已有 int key + 1，或 0）追加，然后委托给 `__rt_hash_set` | `x0`=hash, `x3`/`x4`=value, `x5`=value_tag | `x0` = hash |
| `__rt_hash_insert_owned` | 在 hash growth 期间重新插入已经拥有所有权的 key/value pair | `x0`=hash, `x1`/`x2`=normalized key, `x3`/`x4`=value, `x5`=value_tag | `x0` = hash |
| `__rt_hash_get` | 按 key 查找 value | `x0`=hash, `x1`/`x2`=normalized key | `x0`=found, `x1`=val_lo, `x2`=val_hi, `x3`=value_tag |
| `__rt_hash_iter_next` | 按插入顺序迭代到下一个 entry | `x0`=hash, `x1`=cursor | `x0`=next cursor, `x1`/`x2`=key, `x3`/`x4`=value, `x5`=value_tag |
| `__rt_hash_union` | 构建 PHP associative-array union：左侧重复 key 胜出，缺失的右侧 entry 按插入顺序追加 | `x0`=left hash, `x1`=right hash | `x0`=result hash |
| `__rt_hash_array_union` | 通过克隆左侧 hash 并追加共享 key space 中不存在的右侧 index，构建 PHP associative+indexed union | `x0`=left hash, `x1`=right array | `x0`=result hash |
| `__rt_hash_count` | 统计 occupied entry 数量 | `x0`=hash | `x0`=count |
| `__rt_hash_free_deep` | 释放 hash table、其拥有的 key 以及嵌套 heap-backed value | `x0`=hash | — |
| `__rt_hash_to_mixed` | 对 hash 执行 copy-on-write，然后把每个 entry payload 拓宽成 boxed Mixed cell，让 by-reference `foreach` 可以 alias 稳定的 pointer slot | `x0`=hash | `x0` = same hash |
| `__rt_mixed_from_value` | 把 tagged payload 装箱成 heap-allocated mixed cell | `x0`=value_tag, `x1`=value_lo, `x2`=value_hi | `x0` = mixed cell |
| `__rt_mixed_write_stdout` | 检查 boxed mixed value 的 inner tag 并打印 | `x0` = mixed cell | — |

`__rt_hash_iter_next` 使用一个小型 cursor 协议，而不是 raw slot index：`0` 从 hash header 的 `head` 开始，正数 cursor 编码为 `slot_index + 1`，`-2` 表示产出最后一个 entry 之后的 post-tail 状态，`-1` 表示迭代已经耗尽。

关于 hash table 的内存布局，参见 [Memory Model](memory-model.md)。

### 数组操作

| 例程 | 作用 |
|---|---|
| `__rt_array_key_exists` | 检查 integer key 是否在边界内 |
| `__rt_warn_undefined_array_key_int` | 对缺失的 integer key 发出 PHP 的 `Undefined array key` warning（仅 warning；调用方仍提供 null fallback） |
| `__rt_array_search` | 在 indexed array 中线性搜索 value |
| `__rt_array_reverse` | 反转元素顺序 |
| `__rt_array_sum` / `__rt_array_product` | 对所有元素求和/求积 |
| `__rt_array_shift` / `__rt_array_unshift` | 从开头移除/添加 |
| `__rt_array_merge` | 把两个 indexed array 拼接成新数组 |
| `__rt_array_merge_into` | 把源 array 的所有元素原地追加到目标 array |
| `__rt_array_slice` / `__rt_array_splice` | 从 indexed array 中提取 slice 并移除 splice window |
| `__rt_array_unique` | 移除重复值 |
| `__rt_array_diff` / `__rt_array_intersect` | 按 value 做集合差集/交集 |
| `__rt_array_diff_key` / `__rt_array_intersect_key` | 按 key 做集合操作 |
| `__rt_array_flip` | 把 indexed integer value 翻转成 associative-array key |
| `__rt_array_flip_string` | 把 indexed string value 翻转成 associative-array key，并规范化 numeric-string key |
| `__rt_array_combine` | 合并 key array + value array → AssocArray |
| `__rt_array_fill` / `__rt_array_fill_keys` | 创建填充数组 |
| `__rt_array_chunk` / `__rt_array_pad` | 分块/填充数组 |
| `__rt_array_column` | 从 assoc array 数组中提取列（int value） |
| `__rt_array_column_ref` | 提取被 retain 的 heap-backed value 列（arrays / hashes / objects） |
| `__rt_array_column_str` | 从 assoc array 数组中提取列（string value） |
| `__rt_array_column_mixed` | 为异构输入 payload 把列值提取为 boxed Mixed cell |
| `__rt_range` | 生成 integer range array |
| `__rt_shuffle` / `__rt_array_rand` | 打乱顺序 / 随机选择 |
| `__rt_random_u32` / `__rt_random_uniform` | `rand()`、`random_int()`、`shuffle()` 和 `array_rand()` 使用的 target-aware random primitive |
| `__rt_asort` / `__rt_arsort` | 按 value 排序并保留 key，升序或降序 |
| `__rt_ksort` / `__rt_krsort` | 按 key 升序或降序排序 |
| `__rt_natsort` / `__rt_natcasesort` | 自然顺序排序，区分或不区分大小写 |
| `__rt_array_map` | 对每个 scalar element 应用 callback，返回新数组；可选第三个参数携带 generated callback wrapper 的 captured-closure environment |
| `__rt_array_map_str` | 对每个 scalar 或 string element 应用 callback，并返回 string array；可选第三个参数携带 captured-closure environment |
| `__rt_array_map_str_owned` | 应用返回 owned string 的 descriptor-wrapper callback，并把这些 string 直接转移到结果数组 |
| `__rt_array_map_mixed` | 应用 descriptor-backed callback，返回 owned boxed Mixed cell，并直接存入新分配的结果数组 |
| `__rt_array_filter` | 过滤 callback 返回 truthy 的 scalar element；可选第三个参数携带 captured-closure environment |
| `__rt_array_reduce` | 通过 callback 把 array 归约成单个值；可选第四个参数携带 captured-callback environment |
| `__rt_array_walk` | 对每个元素调用 callback（产生副作用）；可选第三个参数携带 captured-callback environment |
| `__rt_usort` | 使用用户比较 callback 排序 array；可选第三个参数携带 captured-callback environment |

### 引用计数

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_incref` | 递增引用计数（对 null/非堆指针安全） | `x0` = user pointer | — |
| `__rt_decref_any` | 通过检查统一 heap-kind tag 释放任意 heap-backed value | `x0` = pointer | — |
| `__rt_decref_array` | 递减 refcount；如果为零，则 deep-free indexed array | `x0` = array pointer | — |
| `__rt_decref_hash` | 递减 refcount；如果为零，则释放 hash table | `x0` = hash pointer | — |
| `__rt_decref_mixed` | 递减 refcount；如果为零，则 deep-free mixed cell | `x0` = mixed pointer | — |
| `__rt_decref_object` | 递减 refcount；如果为零，则释放 object | `x0` = object pointer | — |
| `__rt_gc_note_child_ref` | 在 cycle counting 期间，给 heap child 增加一条 transient incoming edge | `x0` = child pointer | — |
| `__rt_gc_mark_reachable` | 递归标记从 external root 可达的 array/hash/object block | `x0` = pointer | — |
| `__rt_gc_collect_cycles` | 对 heap-backed array/hash/object 运行定向 cycle collector | — | — |
| `__rt_mixed_free_deep` | 释放 mixed cell，并释放所有嵌套 heap-backed payload；对于 tag-9 resource，分发到 kind-specific destructor（kind 1 `close`、kind 2 `__rt_hash_ctx_free`、kind 3 `__rt_pclose`、kind 4 `__rt_closedir`） | `x0` = mixed pointer | — |
| `__rt_object_free_deep` | 使用运行时/class 元数据释放 object，并释放 heap-backed property | `x0` = object pointer | — |

Refcount 以 32 位值存储在统一的 16 字节 heap header 中，位置是 `[user_ptr - 12]`。每次堆分配的初始 refcount 都是 1。当引用被共享时（例如赋给另一个变量或传给函数），`__rt_incref` 会递增它。当引用消失时，`__rt_decref_any` 可以通过统一 heap-kind tag 分发到具体的 string/array/hash/object/mixed 释放路径。Array、hash、object 和 boxed mixed cell 仍然先使用普通引用计数；但当一次 decref 看到某个 container/object graph 可能包含嵌套 heap-backed value 时，运行时可以调用 `__rt_gc_collect_cycles` 清理 transient metadata、统计 heap-only incoming edge、标记外部可达 block，并 deep-free 剩余不可达的 array/hash/object/mixed island。

## 系统例程

**来源：** `src/codegen/runtime/system/`（40 个顶层文件，以及 `date/`、`strtotime/`、`json_validate/`、`json_decode_mixed/` 和 `json_encode_str/` 子目录）

### `__rt_build_argv` — 构建 $argv 数组

**文件：** `system/build_argv.rs`

程序启动时，OS 会在 `x0` 中传入 `argc`（参数数量），并在 `x1` 中传入 `argv`（指向 C string pointer 的指针）。这个例程会：

1. 创建一个新的字符串数组
2. 对 argv 中的每个 C string pointer：测量字符串长度（扫描 null byte），并把 ptr+len push 进数组
3. 返回数组指针

### 核心系统例程

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_time` | 通过 `gettimeofday` syscall 获取当前 Unix timestamp | — | `x0` = seconds since epoch |
| `__rt_microtime` | 通过 `gettimeofday` syscall 获取浮点秒格式的当前时间 | — | `d0` = seconds.microseconds |
| `__rt_getenv` | 通过 libc `getenv()` 获取环境变量值 | `x1`/`x2` = name string | `x1`/`x2` = value string |
| `__rt_php_uname` | 通过 libc `uname()` 读取目标运行时系统信息；支持 PHP mode `a`、`s`、`n`、`r`、`v` 和 `m` | `x1`/`x2` = mode string | `x1`/`x2` = selected uname string |
| `__rt_shell_exec` | 通过 libc `popen()`/`pclose()` 执行 shell command 并捕获输出 | `x1`/`x2` = command string | `x1`/`x2` = output string |

## 异常例程

**来源：** `src/codegen/runtime/exceptions.rs` 以及 `src/codegen/runtime/exceptions/`（6 个文件）

elephc 通过围绕 `_setjmp` / `_longjmp` 的小型运行时层来 lower 异常。Codegen 会把当前异常对象发布到 `_exc_value`，把 handler record push 到 `_exc_handler_top`，然后使用这些辅助例程执行 unwind、匹配 catch clause，并通过 `catch` / `finally` 恢复控制流。

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_exception_cleanup_frames` | 遍历 activation-record stack，运行每个 frame 的 cleanup callback，并停在 catch 后仍应保留的 frame | `x0` = surviving activation record | — |
| `__rt_exception_matches` | 按 class id 或 interface id 检查 active exception 是否匹配 catch target | `x0` = exception object, `x1` = target id, `x2` = 0 for class / 1 for interface | `x0` = 1 if it matches, 0 otherwise |
| `__rt_instanceof_lookup` | 通过发出的大小写不敏感 class/interface 元数据解析 dynamic class-string `instanceof` target | `x1`/`x2` = target string | `x0` = found flag, `x1` = target id, `x2` = 0 class / 1 interface |
| `__rt_instanceof_invalid_target` | 当 dynamic `instanceof` target 既不是 string 也不是 object 时中止 | — | does not return |
| `__rt_class_implements_interface` | 为 dynamic class-string 检查测试 class metadata 是否实现某个 interface id，不需要 object instance | `x0` = class id, `x1` = interface id | `x0` = 1 if implemented, 0 otherwise |
| `__rt_throw_current` | Unwind 到最近的 active handler；若没有 handler，则打印 fatal uncaught-exception message 并退出 | reads `_exc_value`, `_exc_handler_top`, `_exc_call_frame_top` | does not return normally |
| `__rt_rethrow_current` | 使用当前 active exception 重新进入普通 throw 路径 | none (uses global exception state) | does not return normally |

fatal uncaught-exception 路径会把 `Fatal error: uncaught exception` 写入 stderr，并以状态码 1 退出。运行时还会在最终 `longjmp` 前重置 concat-buffer cursor，因此抛出 frame 中已经部分构建的字符串状态不会泄漏到恢复后的 catch/finally 代码中。

### 日期/时间例程

**文件：** `system/date/`、`system/date_data.rs`、`system/mktime.rs`、`system/microtime.rs`、`system/hrtime.rs`、`system/getdate.rs`、`system/localtime.rs`、`system/checkdate.rs`、`system/date_default_timezone.rs`、`system/strtotime/`

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_date` / `__rt_gmdate` | 使用 PHP date format character（Y、m、d、H、i、s、l、F、T、e、O、P、…）格式化 Unix timestamp。`__rt_date` 用 libc `localtime()` 分解，`__rt_gmdate` 用 `gmtime()`（UTC）分解；两者共享 formatter 和静态 `_day_names`/`_month_names` table。`T` token 在 gmdate 路径上报告 `"GMT"` | `x1`/`x2` = format string, `x0` = timestamp | `x1`/`x2` = formatted string |
| `__rt_mktime` / `__rt_gmmktime` | 从日期组件（hour、minute、second、month、day、year）创建 Unix timestamp。填充 `tm` struct，并调用 libc `mktime()`（local）或 `timegm()`（UTC） | `x0`-`x5` = h, m, s, mon, day, year | `x0` = Unix timestamp |
| `__rt_strtotime` | 通过策略 emitter 解析 trim 后的 date/time string：ISO date/datetime（`iso_date`）、`M/D/Y` slash date（`slash_date`）、`15 January 2020` 这样的 textual date（`textual_date`）、`@<timestamp>` epoch form（`epoch`）、`first`/`last day of …` 和 `first`/`last <weekday> of …` 短语（`first_last_day`）、time-only form、裸关键词（`now`、`today`、`tomorrow`、`yesterday`、`midnight`、`noon`）、relative offset（`+1 day`、`3 months ago`、`a/an <unit>` article form），以及带 `next` / `last` / `this` 的 named weekday。成功路径会填充 `tm` struct 并调用 libc `mktime()`；畸形输入返回 `i64::MIN` failure sentinel | `x1`/`x2` = date string | `x0` = Unix timestamp or sentinel |
| `__rt_getdate` / `__rt_localtime` | 通过 libc `localtime()` 把 timestamp 分解成 PHP 的 `getdate()` / `localtime()` associative array，首次使用时通过 `__rt_tz_init_utc` 把默认时区设为 UTC | `x0` = timestamp | `x0` = assoc array pointer |
| `__rt_checkdate` | 校验 Gregorian month/day/year，感知闰年 | `x0`-`x2` = month, day, year | `x0` = 0/1 |
| `__rt_microtime` / `__rt_hrtime` | 当前 wall-clock（`gettimeofday`）/ monotonic（`clock_gettime`）时间，返回 float/string 或 `[sec, nsec]` array | flag | result |
| `__rt_date_default_timezone_get` / `__rt_date_default_timezone_set` / `__rt_tz_init_utc` | 读取/设置进程默认时区（`putenv("TZ=…")` + `tzset`）；`__rt_tz_init_utc` 会像 PHP 一样惰性默认为 UTC | — / `x1`/`x2` = id | — |

`DateTimeZone` introspection（`getLocation()`、`getTransitions()`、`listAbbreviations()`）由捆绑的 **`elephc-tz`** workspace crate 支撑。它会把 PHP timelib 的 IANA timezone table 烘焙进提交的数据文件，并通过 `elephc_tz_location` / `elephc_tz_transitions` / `elephc_tz_abbreviations` ABI symbol 暴露。和 `elephc-tls`、`elephc-phar` bridge 一样，它只会链接进实际使用它的程序。`date()`/`gmdate()` 自身使用的 offset/DST 解析则委托给 libc（`localtime`/`gmtime`/`tzset`）。

### JSON 例程

**文件：** `system/json_data.rs`、`system/json_depth.rs`、`system/json_throw_error.rs`、`system/json_last_error_msg.rs`、`system/json_validate/`、`system/json_decode.rs`、`system/json_decode_mixed/`、`system/json_encode_bool.rs`、`system/json_encode_null.rs`、`system/json_encode_float.rs`、`system/json_encode_str/`、`system/json_encode_array_int.rs`、`system/json_encode_array_str.rs`、`system/json_encode_array_dynamic.rs`、`system/json_encode_assoc.rs`、`system/json_encode_mixed.rs`、`system/json_encode_object.rs`、`system/json_pretty.rs`，以及用于 stdClass 专用 JSON object encoding 的 `objects/stdclass.rs`。

`json_encode` 实现使用**类型感知分发**：codegen 会根据待编码值的编译期类型调用不同的运行时例程：

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_json_encode_bool` | 使用静态 data label 把 bool 编码为 `"true"` 或 `"false"` | `x0` = 0 or 1 | `x1`/`x2` = JSON string |
| `__rt_json_encode_null` | 使用静态 data label 把 null 编码为 `"null"` | — | `x1`/`x2` = JSON string |
| `__rt_json_encode_str` | 使用 JSON escaping（引号、反斜杠、控制字符）编码字符串 | `x1`/`x2` = input string | `x1`/`x2` = JSON string |
| `__rt_json_encode_array_int` | 把整数数组编码为 JSON array（例如 `[1,2,3]`） | `x0` = array ptr | `x1`/`x2` = JSON string |
| `__rt_json_encode_array_str` | 把字符串数组编码为带引号元素的 JSON array | `x0` = array ptr | `x1`/`x2` = JSON string |
| `__rt_json_encode_array_dynamic` | 在运行时检查 indexed array 的 packed runtime `value_type` tag（int、string、float、bool、nested array/hash、mixed 或 null fallback）来编码，并在遍历期间把 active JSON flag 缓存在 callee-saved register 中 | `x0` = array ptr | `x1`/`x2` = JSON string |
| `__rt_json_encode_assoc` | 把 associative array 编码为 JSON object，同时在同一轮 hash walk 中跟踪 PHP list-shape key，并在适用时压缩成 JSON array 形式 | `x0` = hash ptr | `x1`/`x2` = JSON string |
| `__rt_json_encode_float` | 编码有限 float，并为 `INF`/`NAN` 记录 `JSON_ERROR_INF_OR_NAN`，遵守 throw 和 partial-output flag | `d0` = float | `x1`/`x2` = JSON string |
| `__rt_json_encode_mixed` | 通过 unbox runtime tag 并分发到具体 JSON encoder 来编码 boxed mixed payload | `x0` = mixed ptr | `x1`/`x2` = JSON string |
| `__rt_json_encode_object` | 通过 per-class JSON descriptor 编码 class object；存在 `JsonSerializable::jsonSerialize()` 时分发调用，否则遍历 public property | `x0` = object ptr | `x1`/`x2` = JSON string |
| `__rt_json_encode_stdclass` | 编码支撑 `stdClass` 的 dynamic-property hash，空实例保持 `{}` | `x0` = stdClass hash ptr | `x1`/`x2` = JSON string |
| `__rt_json_decode` | string-only compatibility helper，供 string decode 路径使用；trim 外层空白并 unescape 带引号 JSON string，包括感知 surrogate 的 `\uXXXX` sequence | `x1`/`x2` = JSON string | `x1`/`x2` = decoded string |
| `__rt_json_decode_mixed` | 带检查的 structural recursive decoder，会根据 `_json_decode_assoc` 为 null、bool、int、float、string、indexed array、associative array 和 stdClass object 返回 boxed `Mixed` cell；记录 syntax/depth/UTF-8/UTF-16 error 及 source offset，畸形输入返回 0 | `x1`/`x2` = JSON string | `x0` = Mixed* or 0 |
| `__rt_json_decode_mixed_array_real` | `json_decode_mixed` 确认外层 `[` token 后使用的递归 array parser | parser cursor + JSON bounds | boxed Mixed array |
| `__rt_json_decode_mixed_object_real` | `json_decode_mixed` 确认外层 `{` token 后使用的递归 object parser；根据 decode mode 返回 assoc hash 或 stdClass payload | parser cursor + JSON bounds | boxed Mixed object/hash |
| `__rt_json_skip_ws` | `json_decode_mixed` 及其递归 array/object parser 共享的 RFC 8259 whitespace skipper；把调用方拥有的 cursor 推进到下一个 token 或调用方指定的 limit | JSON slice pointer, exclusive limit, cursor | updated cursor |
| `__rt_json_validate` | `json_validate()` 使用的独立 RFC 8259 validator；scalar validator helper 也会被 `json_decode_mixed` 复用于 string 和 number | `x1`/`x2` = JSON string | `x0` = 1 valid / 0 invalid |
| `__rt_json_depth_enter` / `__rt_json_depth_exit` | 维护 `_json_active_depth`，并在递归 encode/decode/validate walk 中与 `_json_depth_limit` 比较 | global JSON state | status / updated state |
| `__rt_json_set_error_location` | 把 decoder target pointer 转换成相对于 `_json_error_source_ptr` 的一基 line/column 数据 | target pointer | updates `_json_error_location_active`, `_json_error_line`, `_json_error_column` |
| `__rt_json_error_message` | 构建当前 JSON error message；当 decode location state active 时追加 PHP 8.6 的 `" near location line:column"` suffix | global JSON state | `x1`/`x2` = message |
| `__rt_json_throw_error` | 记录 JSON error code，并在 `JSON_THROW_ON_ERROR` active 时用共享格式化 JSON error message 构造并抛出 `JsonException` | `x0` = JSON_ERROR_* code | may not return |
| `__rt_json_last_error_msg` | 通过 `_json_err_msg_table` data table 返回 `_json_last_error` 对应的 message string；active 时包含 decode location suffix | global JSON state | `x1`/`x2` = message |
| `__rt_json_pretty_push` / `__rt_json_pretty_pop` / `__rt_json_pretty_line` / `__rt_json_pretty_colon_space` | 在每个 container encoder 发出字节时维护 `_json_indent_depth` 并追加 PHP 风格 pretty-print whitespace。这些 helper 只有在 `JSON_PRETTY_PRINT` active 时才生效，避免第二次 buffer walk。 | current JSON state, `x11` write pointer for line/space helpers | updated formatting state / `x11` write pointer |

### Regex 例程

**文件：** `system/preg_strip.rs`、`system/pcre_to_posix.rs`、`system/preg_match.rs`、`system/preg_match_all.rs`、`system/preg_replace.rs`、`system/preg_replace_callback.rs`、`system/preg_split.rs`

所有 regex 例程都通过 PCRE2 POSIX-compatible wrapper 使用 PCRE2（`pcre2_regcomp()`、`pcre2_regexec()` 和 `pcre2_regfree()`）。`__rt_preg_strip` 会剥离 PHP 风格 delimiter，并把支持的 modifier（`i`、`m`、`s`、`u`、`U`）映射到 PCRE2 wrapper flag。`__rt_pcre_to_posix` 为兼容现有 emitter 保留历史 symbol name，但现在只物化剥离后的 PCRE pattern，形式为 null-terminated C string。启用 regex 的程序在最终链接期间会请求 `pcre2-posix` 和 `pcre2-8`。

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_preg_match` | 测试 regex 是否匹配 subject string。编译 pattern，执行一次，然后释放 | pattern + subject strings | `x0` = 1 (match) or 0 (no match) |
| `__rt_preg_match_capture` | 测试一次，并从编译后 `regex_t.re_nsub` capture count 物化 PHP 可选 `$matches` array；省略尾部未匹配 capture，同时把中间未匹配 capture 保留为空字符串 | pattern + subject strings | match flag plus matches array pointer |
| `__rt_preg_match_all` | 通过不断用推进后的 offset 执行 regex，统计所有非重叠匹配 | pattern + subject strings | `x0` = match count |
| `__rt_preg_replace` | 用 replacement string 替换所有 regex 匹配项。在 concat buffer 中增量构建结果，并从 PCRE2 capture vector 展开 `$0`..`$99` / `\0`..`\99` | pattern + replacement + subject | `x1`/`x2` = result string |
| `__rt_preg_replace_callback` | 通过 `regex_t.re_nsub` 分配 capture storage，构建 indexed `$matches` string array，调用 callback，并追加 callback 的字符串结果；同时跨 callback prologue 保留 concat-buffer state | pattern + callback + subject | `x1`/`x2` = result string |
| `__rt_preg_split` | 在 regex match boundary 处分割 subject string，使用大小为 `regex_t.re_nsub` 的 capture storage。应用 limit、no-empty、delimiter-capture 和 offset-capture flag；dynamic flag 返回 boxed Mixed slot 以保留布局 | pattern + subject strings, limit, flags | `x0` = array pointer |

## I/O 例程

**来源：** `src/codegen/runtime/io/`（108 个文件）

这些例程通过 target-aware libc/syscall helper 处理文件和文件系统操作。PHP string（pointer + length）在传给 C 或 OS API 前必须转换成 null-terminated C string；`__rt_cstr` 处理主缓冲区，也会为需要第二个同时存在的 C string 的例程发出 `__rt_cstr2`。

第一张表覆盖 file/filesystem 核心；后续小节覆盖同一目录发出的 stream/networking surface：stream context 和 metadata、stream filter 和 user-defined stream wrapper、TCP/Unix/IPv6 socket、TLS/SSL helper、FTP/HTTP transfer helper、hostname/service resolution、phar archive，以及 `var_dump`。

| 例程 | 作用 |
|---|---|
| `__rt_cstr` | 把 PHP string（ptr+len）转换成 null-terminated C string |
| `__rt_fopen` | 通过 target-aware `open()` handling 打开文件；打开失败或 mode 无效时发出可抑制 warning 后返回 `-1` |
| `__rt_fgets` | 从 file descriptor 读取一行 |
| `__rt_fgetc` | 从 file descriptor 读取单个字节（tail-call `__rt_fread`，长度为 1） |
| `__rt_feof` | 检查 file descriptor 的 end-of-file flag |
| `__rt_fread` | 从 file descriptor 读取 N 字节 |
| `__rt_readfile` | 打开路径，把内容 stream 到 stdout，并返回复制的字节数；读取失败返回 `-1`，打开失败返回 false sentinel |
| `__rt_fpassthru` | 把现有 descriptor 的剩余字节 stream 到 stdout，并返回复制的字节数或读取失败的 `-1` |
| `__rt_flock` | 调用 libc `flock()`，转换 PHP 的 `LOCK_UN` 常量，并为可选输出参数暴露 would-block 状态 |
| `__rt_tmpfile` | 通过 `mkstemp()` 加立即 unlink 创建匿名临时 file descriptor |
| `__rt_file_get_contents` | 把整个文件读入 string；失败时发出可抑制 warning 后返回 null pointer |
| `__rt_file_put_contents` | 把 string 写入文件（创建/截断） |
| `__rt_file` | 把文件读取成行数组 |
| `__rt_file_exists` / `__rt_is_file` / `__rt_is_dir` | 基于 `stat()` 的存在性和路径类型检查 |
| `__rt_is_readable` / `__rt_is_writable` | 基于 `access()` 的访问检查 |
| `__rt_filesize` / `__rt_filemtime` | 来自 stat metadata 的文件大小和修改时间戳 |
| `__rt_fileatime` / `__rt_filectime` / `__rt_fileperms` / `__rt_fileowner` / `__rt_filegroup` / `__rt_fileinode` | 扩展 stat scalar metadata。返回 payload 加 success flag，让 codegen 可以 box PHP `false`，而不会混淆合法的零值。 |
| `__rt_filetype` / `__rt_is_executable` / `__rt_is_link` | 文件类型和权限 predicate；`filetype()` 使用 `lstat()`，因此 symlink 会报告 `"link"`，缺失路径会 box 为 `false`。 |
| `__rt_stat_array` / `__rt_lstat_array` / `__rt_fstat_array` | 构建兼容 PHP 的 stat array，包含数字 key 和字符串 key；失败时返回 null pointer，供 codegen box 成 `false` |
| `__rt_unlink` / `__rt_mkdir` / `__rt_rmdir` / `__rt_chdir` | 通过 libc/syscall 执行 filesystem path operation |
| `__rt_rename` / `__rt_copy` | 使用双 C-string scratch buffer 的双路径 filesystem helper |
| `__rt_symlink` / `__rt_link` | 通过 libc 创建 symbolic link 或 hard link |
| `__rt_readlink` | 把 symbolic-link target 读入 heap-backed string；失败时输出 null，供 PHP `false` 使用 |
| `__rt_linkinfo` | 返回 link path 的 `lstat()` device metadata，或 PHP 的 `-1` failure sentinel |
| `__rt_getcwd` | 获取当前工作目录 |
| `__rt_scandir` | 把目录内容列成数组 |
| `__rt_glob` | 对文件名做 pattern-match |
| `__rt_tempnam` | 创建临时文件名 |
| `__rt_fgetcsv` | 从文件解析 CSV 行 |
| `__rt_fputcsv` | 向文件写入 CSV 行 |
| `__rt_basename` / `__rt_dirname` / `__rt_dirname_levels` | 计算 `basename()` / `dirname()` 的路径组件，包括重复父级遍历 |
| `__rt_fnmatch` | 用 PHP/libc 兼容的 flag bit 为所选 target 匹配 shell-style path glob |
| `__rt_realpath` | 规范化现有路径；失败时返回 null pointer，让 codegen box 为 PHP `false` |
| `__rt_pathinfo_str` / `__rt_pathinfo_array` | 为 component flag 返回一个 `pathinfo()` component，或构建 associative-array `PATHINFO_ALL` 形态 |
| `__rt_chmod` / `__rt_chown` / `__rt_lchown` / name-resolving variants | 文件所有权和 mode 修改 helper，包括感知 symlink 的所有权更新 |
| `__rt_lookup_passwd_uid` / `__rt_lookup_group_gid` | 通过扫描 `/etc/passwd` 和 `/etc/group` 解析本地 user/group name，不调用 NSS，因此 static Linux binary 运行时不需要 glibc NSS module |
| `__rt_umask` / `__rt_ftruncate` | 进程 umask 和文件截断 helper |
| `__rt_fsync` / `__rt_fflush` / `__rt_fdatasync` | File descriptor flush helper；`fflush()` 映射到 `fsync()`，因为 elephc 没有 userspace stdio buffer |
| `__rt_touch` | 创建缺失文件并更新访问/修改时间戳 |

### Stream 和 socket 例程

| 例程 | 作用 |
|---|---|
| `__rt_stream_socket_client` / `__rt_stream_socket_client_v6` | 打开 TCP client connection（IPv4/IPv6），带 timeout handling |
| `__rt_stream_socket_server` / `__rt_stream_socket_server_v6` | 绑定并监听 TCP server socket（IPv4/IPv6） |
| `__rt_unix_socket_client` / `__rt_unix_socket_server` | Unix-domain socket client/server endpoint |
| `__rt_stream_socket_accept` | 接受 pending connection，支持可选 timeout |
| `__rt_stream_socket_pair` | 创建 connected socket pair |
| `__rt_stream_socket_recvfrom` / `__rt_stream_socket_sendto` | Datagram receive/send，并格式化 peer-address |
| `__rt_stream_socket_get_name` | 获取 socket 的 local 或 remote endpoint name |
| `__rt_stream_socket_shutdown` | 对 connected socket 执行 half/full shutdown |
| `__rt_socket_backlog` / `__rt_apply_socket_bindto` / `__rt_apply_socket_client_opts` / `__rt_apply_socket_server_opts` | 为 context-driven behavior 提供 socket-option plumbing |
| `__rt_stream_select` | 通过 `poll()`/`select()` 对 descriptor array 执行 `stream_select()` |
| `__rt_stream_set_blocking` / `__rt_stream_set_timeout` | 设置每个 descriptor 的 blocking mode 和 read timeout |
| `__rt_stream_get_contents` / `__rt_stream_get_contents_bounded` / `__rt_stream_get_line` | 批量和按行分隔的 stream read |
| `__rt_stream_copy_to_stream` | 在两个 descriptor 之间复制字节 |
| `__rt_stream_get_meta_data` | 构建 `stream_get_meta_data()` associative array |
| `__rt_stream_context_set_option_4` | 存储 open/transfer helper 消费的 context option |
| `__rt_stream_isatty` | 为 descriptor 检测 TTY |
| `__rt_data_stream` | `data://` stream payload decoding |
| `__rt_get_ssl_peer_name` | TLS stream 的 peer-certificate name lookup |

### Networking 和 transfer 例程

| 例程 | 作用 |
|---|---|
| `__rt_http_open` / `__rt_https_open` | 打开 `http://` / `https://` stream（TLS 通过 elephc-tls bridge） |
| `__rt_http_build_request` | 从 context option 组装 HTTP request（method、header、body、`request_fulluri`） |
| `__rt_http_fire_notification` | 在 transfer 期间调用 stream-notification callback |
| `__rt_ftp_open` / `__rt_ftp_send_recv` / `__rt_ftp_parse_pasv` | `ftp://` stream support（control dialog、passive-mode parsing） |
| `__rt_resolve_host` / `__rt_resolve_host_v6` | 把 hostname 解析为 IPv4/IPv6 address |
| `__rt_gethostbyname` / `__rt_gethostbyaddr` / `__rt_gethostname` | Host lookup builtin |
| `__rt_getprotobyname` / `__rt_getprotobynumber` / `__rt_protoent_load` | 基于 `/etc/protocols` 的 protocol-database lookup |
| `__rt_getservbyname` / `__rt_getservbyport` | 基于 `/etc/services` 的 service-database lookup |

### 用户 stream wrapper 和 filter

通过 `stream_wrapper_register()` 注册的 userspace `streamWrapper` class，会通过一组 `__rt_user_wrapper_*` 例程 vtable 分发（`fopen`/`fread`/`fwrite`/`fclose`/`feof`/`fseek`/`ftell`/`fflush`/`fstat`/`ftruncate`/`flock`/`set_option`/`stream_cast`、`dir_*` family、`path_op` 和 `rename`），每个例程都会把 synthetic descriptor 桥接回 wrapper instance 上的 PHP method call。Stream filter 使用 `__rt_stream_filter_register`、`__rt_apply_stream_filter` / `__rt_apply_user_stream_filter`、`__rt_stream_filter_attach_user`、`__rt_resolve_user_filter_id`、`__rt_user_filter_brigade_invoke` 和 `__rt_user_filter_release_fd`，在 stream 读写上运行 builtin（`zlib.*`、`bzip2.*`、`convert.iconv.*`、`string.*`）和用户定义 filter chain。

### Phar archive 例程

| 例程 | 作用 |
|---|---|
| `__rt_fopen_maybe_phar` / `__rt_file_get_contents_maybe_phar` | 把 dynamic `phar://` read path 路由到 archive entry read，并把 write-mode `fopen()` path 路由到 PHAR write stream；其他情况落回普通 file I/O |
| `__rt_phar_read_entry` | 从 PHAR URL 定位并读取一个 entry。发布 `elephc-phar` bridge 时，它会处理 native PHAR、tar 和 ZIP container；assembly fallback 通过发布的 zlib/libbz2 slot 处理 native PHAR 和 gzip/bzip2 payload |
| `__rt_phar_write_open` / `__rt_phar_write_open_url` / `__rt_phar_write_append` / `__rt_phar_write_finalize` / `__rt_file_put_contents_maybe_phar` | 在 bridge-owned descriptor slot 中 buffer `phar://` write entry，然后通过 `elephc-phar` bridge finalize 每个 entry，使 native PHAR、tar 和 ZIP archive 保留已有 entry；运行时构建的 `file_put_contents()` 和 `fopen()` write URL 会调用一个拆分完整 `phar://` URL 的 bridge variant；assembly fallback 仍会发出单 entry、SHA1-signed 的 native archive |

### var_dump 输出例程

`var_dump()` lowering 会调用一组 `__rt_var_dump_array_*` 例程（`int`、`float`、`str`、`bool`、`mixed`）遍历 array payload，并调用一组 `__rt_var_dump_emit_*` helper，以 PHP 兼容缩进打印单个 typed line（`int(...)`、`float(...)`、`bool(...)`、string header、indexed key）。

## 指针例程

**来源：** `src/codegen/runtime/pointers/`（包含 `mod.rs` 在内共 7 个文件）

这些 helper 支持编译器专用的 pointer builtin。

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_ptoa` | 把 pointer value 格式化成带 `0x` 前缀的十六进制字符串 | `x0` = pointer/address | `x1`/`x2` = formatted string |
| `__rt_ptr_check_nonnull` | 如果 pointer 为 null，则以 `Fatal error: null pointer dereference` 中止 | `x0` = pointer/address | `x0` unchanged on success |
| `__rt_str_to_cstr` | 把 elephc string 复制到临时 null-terminated heap storage，供 native call 使用 | `x1`/`x2` = string | `x0` = C string pointer |
| `__rt_cstr_to_str` | 把借用的 null-terminated C string 复制回 owned elephc string | `x0` = C string pointer | `x1`/`x2` = elephc string |
| `__rt_ptr_read_string` | 从 raw pointer 复制固定长度 byte range，生成 owned elephc string | `x0` = pointer, `x1` = length | `x1`/`x2` = elephc string |
| `__rt_ptr_write_string` | 把 elephc string 的字节复制到 raw pointer 指向的内存 | `x0` = pointer, `x1`/`x2` = string | — |

## Buffer 例程

**来源：** `src/codegen/runtime/buffers/`（包含 `mod.rs` 在内共 5 个文件）

这些 helper 支持编译器专用的 `buffer<T>` hot-path data type。

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_buffer_new` | 分配连续 buffer，header 为 `[length:8][stride:8]`，后跟 zero-initialized payload | `x0` = element count, `x1` = element stride | `x0` = buffer pointer |
| `__rt_buffer_len` | 从 buffer header 读取 logical element count | `x0` = buffer pointer | `x0` = length |
| `__rt_buffer_bounds_fail` | 以 `Fatal error: buffer index out of bounds` 中止 | — | does not return |
| `__rt_buffer_use_after_free` | 以 `Fatal error: use of buffer after buffer_free()` 中止 | — | does not return |

## Mixed-type helper

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_mixed_cast_int` | Unbox mixed cell 并 cast 为 integer | `x0` = mixed cell pointer | `x0` = integer |
| `__rt_mixed_cast_bool` | Unbox mixed cell 并 cast 为 boolean | `x0` = mixed cell pointer | `x0` = 0 or 1 |
| `__rt_mixed_cast_float` | Unbox mixed cell 并 cast 为 float | `x0` = mixed cell pointer | `d0` = float |
| `__rt_mixed_cast_string` | Unbox mixed cell 并 cast 为 string | `x0` = mixed cell pointer | `x1`/`x2` = string |
| `__rt_mixed_instanceof` | Unbox mixed cell，并根据 class/interface metadata 测试 object payload | `x0` = mixed cell pointer, `x1` = target id, `x2` = 0 class / 1 interface | `x0` = 0 or 1 |
| `__rt_instanceof_lookup` | 根据发出的 class/interface name metadata 解析 dynamic class-string target | `x1`/`x2` = string | `x0` = found, `x1` = target id, `x2` = 0 class / 1 interface |
| `__rt_mixed_is_empty` | 按 PHP 语义检查 mixed cell 是否为空 | `x0` = mixed cell pointer | `x0` = 0 or 1 |
| `__rt_mixed_strict_eq` | 按 tag 和 value 比较两个 mixed cell | `x0`, `x1` = mixed pointers | `x0` = 0 or 1 |
| `__rt_mixed_unbox` | 从 mixed cell 中提取 raw payload | `x0` = mixed cell pointer | `x0`/`x1`/`x2` depending on type |
| `__rt_mixed_count` | 统计 boxed indexed array 和 hash；对不可 count 的 payload 返回零 | `x0` = mixed cell pointer | `x0` = count |
| `__rt_iterable_write_stdout` | 把 iterable array 和 hash 打印成 PHP 的 `"Array"` 显示字符串 | `x0` = iterable heap pointer | — |
| `__rt_iterable_unsupported_kind` | 当运行时 iterable dispatch 遇到不支持的 heap kind 时中止 | — | does not return |
| `__rt_hash_may_have_cyclic_values` | 扫描 hash entry，检查是否有任何 entry 包含 refcounted child | `x0` = hash pointer | `x0` = 0 (scalar-only) or 1 (has cycles) |
| `__rt_match_unhandled` | 以 `Fatal error: unhandled match case` 中止 | — | does not return |

## Object 和 stdClass 例程

**来源：** `src/codegen/runtime/objects/`（6 个文件）

这些 helper 支持 `stdClass`、`json_decode()` 的 object result、boxed Mixed property/index access、object destructor dispatch，以及 dynamic `new $name()` instantiation。`stdClass` instance 使用紧凑的 `[class_id][hash_ptr]` payload，dynamic property 存储在包含 boxed `Mixed` value 的 hash 中。

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_new_by_name` | 通过 `_classes_by_name` table 按文本名称实例化 class（大小写不敏感 `__rt_strcasecmp` lookup），分配并清零 object payload | class name string | object pointer, or 0 (null) on miss |
| `__rt_call_object_destructor` | 在按 class_id 索引的 `_class_destruct_ptrs` table 中查找对象的 `__destruct`，并在 storage 释放前以借用 `$this` 调用；带 re-entry guard | object pointer | — |
| `__rt_stdclass_new` | 分配一个空 stdClass object，使用 hash-backed dynamic property storage | stdClass class id from runtime data | object pointer |
| `__rt_stdclass_from_hash` | 把 decoded JSON object hash 包装进 stdClass instance | hash pointer | object pointer |
| `__rt_stdclass_get` | 读取 dynamic property 并返回 boxed Mixed value；缺失时返回 Mixed(null) | object pointer + property string | boxed `mixed` payload |
| `__rt_stdclass_set` | 把 boxed Mixed value 存入 dynamic property hash | object pointer + property string + boxed value | — |
| `__rt_mixed_property_get` | Unbox Mixed object payload 并分发 stdClass property read | boxed `mixed` + property string | boxed `mixed` payload |
| `__rt_mixed_property_set` | Unbox Mixed object payload 并分发 stdClass property write | boxed `mixed` + property string + boxed value | — |
| `__rt_mixed_array_get` | 为 `$mixed[$key]` access unbox Mixed array/hash/stdClass payload | boxed `mixed` + normalized key tuple | boxed `mixed` payload |
| `__rt_mixed_array_set` | Unbox Mixed indexed-array/hash payload，并为 `$mixed[$key] = ...` 写入 boxed Mixed value；成功时消费 boxed value | boxed `mixed` + normalized key tuple + boxed value | — |
| `__rt_json_encode_stdclass` | 把支撑 stdClass 的 dynamic-property hash 编码成 JSON object | stdClass hash pointer | `x1`/`x2` = JSON string |

## SPL 和 iterable 例程

**来源：** `src/codegen/runtime/spl/`（包含 `mod.rs` 在内共 3 个文件）

这些 helper 支撑 PHP surface 需要自定义运行时 storage 的 SPL container class。`SplDoublyLinkedList`（及其 `SplStack` / `SplQueue` 子类）存储 class id、一个 owned indexed array（元素为 boxed `Mixed` cell）、iterator index 和 iterator-mode bit。`SplFixedArray` 存储 class id 和一个固定大小的 storage array，元素为 owned boxed `Mixed` cell（unset/null slot 为 null）。Mutation method 接管 call lowering 准备好的 boxed `Mixed` 参数所有权；resize/overwrite 路径会先释放被替换的 cell。

### SplDoublyLinkedList / SplStack / SplQueue

| 例程 | 作用 |
|---|---|
| `__rt_spl_dll_new` | 分配一个空 doubly-linked-list object，带初始 mixed-cell storage |
| `__rt_spl_dll_push` / `__rt_spl_dll_pop` | 追加到末尾 / 从末尾移除 |
| `__rt_spl_dll_unshift` / `__rt_spl_dll_shift` | 前置 / 从开头移除 |
| `__rt_spl_dll_top` / `__rt_spl_dll_bottom` | 查看最后 / 第一个元素 |
| `__rt_spl_dll_insert` | 按 iterator mode 在指定 index 插入 |
| `__rt_spl_dll_count` / `__rt_spl_dll_is_empty` | 元素数量 / 空检查 |
| `__rt_spl_dll_set_iterator_mode` / `__rt_spl_dll_get_iterator_mode` | 写入 / 读取 LIFO/FIFO 和 DELETE iterator-mode bit |
| `__rt_spl_dll_rewind` / `__rt_spl_dll_valid` / `__rt_spl_dll_current` / `__rt_spl_dll_key` / `__rt_spl_dll_next` / `__rt_spl_dll_prev` | 遵守 active iterator mode 的 iterator surface |
| `__rt_spl_dll_offset_exists` / `__rt_spl_dll_offset_get` / `__rt_spl_dll_offset_set` / `__rt_spl_dll_offset_unset` | `ArrayAccess` operation |
| `__rt_spl_dll_serialize` / `__rt_spl_dll_serialize_array` / `__rt_spl_dll_unserialize` | 序列化 helper |

### SplFixedArray

| 例程 | 作用 |
|---|---|
| `__rt_spl_fixed_new` | 分配一个 fixed-size array object，带 zero-initialized mixed-cell storage block |
| `__rt_spl_fixed_count` | 返回固定大小 |
| `__rt_spl_fixed_set_size` | 调整 storage 大小，释放被丢弃的 cell，并把新 slot 清零 |
| `__rt_spl_fixed_offset_exists` / `__rt_spl_fixed_offset_get` / `__rt_spl_fixed_offset_set` / `__rt_spl_fixed_offset_unset` | 带边界检查的 `ArrayAccess` operation |
| `__rt_spl_fixed_to_array` / `__rt_spl_fixed_from_array` / `__rt_spl_fixed_copy_from_array` | 转换为 / 从 PHP array 构建 |
| `__rt_spl_fixed_unserialize` | 序列化 helper |

## Generator 例程

**来源：** `src/codegen/runtime/generators/`（2 个文件）

这些 helper 支撑内置 `Generator` class。Generator function 会发出 heap-allocated frame 和一个生成的 resume function；运行时 helper 会为 public Iterator surface 和 coroutine operation 读写该 frame。

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_gen_current` | 从最近一次 yield 返回 boxed Mixed value 的 owned ref | `GeneratorFrame*` | boxed `mixed` payload |
| `__rt_gen_key` | 从最近一次 yield 返回 boxed Mixed key 的 owned ref | `GeneratorFrame*` | boxed `mixed` key |
| `__rt_gen_valid` | 报告 generator 是否尚未终止 | `GeneratorFrame*` | bool |
| `__rt_gen_next` | 除非已经终止，否则把 state machine 恢复到当前 yield 之后 | `GeneratorFrame*` | — |
| `__rt_gen_next_done` | `next()` 跳过或完成 resume 后使用的共享 global return label | `GeneratorFrame*` | — |
| `__rt_gen_send` | 存储 sent boxed Mixed value，然后恢复 state machine | `GeneratorFrame*`, boxed `mixed` value | boxed `mixed` payload |
| `__rt_gen_send_done` | `send()` 跳过或完成 resume 后使用的共享 global return label | `GeneratorFrame*` | boxed `mixed` payload |
| `__rt_gen_send_epilogue` | 对 resumed `send()` 产生的 yield 执行 box 并返回的共享 epilogue | `GeneratorFrame*` | boxed `mixed` payload |
| `__rt_gen_rewind` | 只运行一次 generator 到第一个 yield | `GeneratorFrame*` | — |
| `__rt_gen_rewind_done` | `rewind()` 已经运行过或刚刚完成时使用的共享 global return label | `GeneratorFrame*` | — |
| `__rt_gen_throw` | 标记 generator 为 terminated，并通过普通 exception runtime 抛出 | `GeneratorFrame*`, throwable object | does not return |
| `__rt_gen_get_return` | 返回 terminal return value 的 owned ref | `GeneratorFrame*` | boxed `mixed` payload |

Generator frame 会标记为 object heap block，因为 `Generator` 是实现了 `Iterator` 的内置 class。`__rt_object_free_deep` 会检测内置 Generator class id，并释放 frame 的自定义 Mixed slot 以及任何 active `yield from` delegate，而不是把 payload 当作普通 class property 处理。

## Fiber 例程

**来源：** `src/codegen/runtime/fibers/`（4 个文件加 `api/` 子目录）

这些 helper 实现 PHP 8.1 风格的协作式协程。它们会由共享运行时在每个支持的 target 上发出。

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_fiber_alloc_stack` | 分配 per-fiber native stack，并带受保护的 guard page | requested usable stack size | stack base, initial top, mapped size |
| `__rt_fiber_free_stack` | 把 mapped fiber stack 归还给 OS | stack base, mapped size | — |
| `__rt_fiber_switch` | 保存当前 callee-saved context，并恢复目标 fiber/main context | target `Fiber*` or null for main | resumes when this context is switched back to |
| `__rt_fiber_entry` | 首次进入 fiber stack 时运行的 trampoline；调用生成的 wrapper，记录 return/escape state，并切回 | active `_fiber_current` | does not return normally inside the fiber |
| `__rt_fiber_construct` | 分配并初始化 runtime-managed Fiber object 及其初始 stack frame | callable descriptor pointer, `Fiber` class id, generated wrapper pointer | `Fiber*` |
| `__rt_fiber_throw_state_error` | 分配 `FiberError`，并通过普通 exception runtime 抛出 | message pointer and length | does not return |
| `__rt_fiber_start` | 启动尚未开始的 fiber，并返回第一次 yielded value；若立即终止则返回 null | `Fiber*` | boxed `mixed` payload |
| `__rt_fiber_resume` | 用 boxed payload 恢复 suspended fiber | `Fiber*`, boxed `mixed` value | boxed `mixed` payload |
| `__rt_fiber_suspend` | 挂起当前 fiber，并向调用者 yield 一个 boxed payload | boxed `mixed` value | boxed `mixed` value supplied by the next resume |
| `__rt_fiber_throw` | 通过向 suspended fiber 的 pending suspend point 抛出异常来恢复它 | `Fiber*`, throwable object | boxed `mixed` payload or rethrown exception |
| `__rt_fiber_get_current` | 返回当前正在运行的 fiber；运行在 main stack 上时返回 null | — | boxed `mixed` payload |
| `__rt_fiber_get_return` | 读取 terminated fiber 的 terminal return payload | `Fiber*` | boxed `mixed` payload |
| `__rt_fiber_state_eq` | `isStarted()`、`isSuspended()`、`isRunning()` 和 `isTerminated()` 使用的共享 predicate helper | `Fiber*`, state id | bool |

## 例程如何发出

**文件：** `src/codegen/runtime/emitters.rs`

`emit_runtime()` 函数会以固定顺序调用 target-aware routine emitter。每个 runtime module 拥有共享 helper surface，并在 AArch64 和 Linux `x86_64` 需要不同指令序列或 ABI setup 时在内部进行分发。

```rust
pub fn emit_runtime(emitter: &mut Emitter) {
    // diagnostics: runtime warning emission and @ suppression state
    // strings: itoa, resource display/stdout, ftoa, concat, atoi, equality, formatting, trim/mask,
    // search/replace, explode/implode, hashing, encoding, sscanf, ...
    // callables: dynamic is_callable() fallback plus callable-descriptor release
    // system: argv, time, getenv, shell, date/mktime/strtotime, JSON, regex
    // exceptions: cleanup walk, catch matching, class-implements, throw/rethrow helpers
    // generators: Generator current/key/valid/next/send/rewind/throw/getReturn helpers
    // arrays: heap alloc/free, array/hash helpers, sort, callbacks, refcount
    // spl: SplDoublyLinkedList/SplStack/SplQueue and SplFixedArray storage helpers
    // objects: stdClass dynamic properties and boxed Mixed property/index dispatch
    // buffers: contiguous buffer allocation, bounds checking, UAF traps
    // io: c-string buffers, file I/O, stat/fs helpers, scandir/glob/tempnam, CSV
    // pointers: ptoa, null check, str_to_cstr, cstr_to_str
    // fibers: guarded stack allocation, context switch, entry trampoline, Fiber API
}
```

这里发出的典型 runtime-only helper 包括 `__rt_diag_push_suppression`、`__rt_diag_pop_suppression`、`__rt_diag_warning`、`__rt_exception_cleanup_frames`、`__rt_exception_matches`、`__rt_instanceof_lookup`、`__rt_instanceof_invalid_target`、`__rt_throw_current`、`__rt_heap_debug_fail`、`__rt_heap_kind`、`__rt_hash_insert_owned`、`__rt_hash_free_deep`、`__rt_array_column_ref`、`__rt_mixed_instanceof`、`__rt_iterable_write_stdout`、`__rt_iterable_unsupported_kind`、`__rt_class_implements_interface`、`__rt_callable_descriptor_release`、`__rt_spl_dll_new`、`__rt_spl_fixed_new`、`__rt_gen_current`、`__rt_gen_send`、`__rt_preg_strip`、`__rt_pcre_to_posix`、`__rt_str_to_cstr`、`__rt_cstr_to_str`、`__rt_fiber_switch` 和 `__rt_fiber_entry`，此外还有更偏用户可见的 helper。

编译后的**可执行文件**会在链接时 dead-strip 不可达的 runtime helper。在 Linux 上，每个 `__rt_*` helper 都会发到自己的 `.text.<name>` section，并通过 `--gc-sections` 收集；在 macOS 上，runtime object 带有 `.subsections_via_symbols` footer，因此每个 helper 都是可单独收集的 atom，可由 `-dead_strip` 丢弃（内部 cross-helper label 保持 assembler-local 的 `L` local；少数会被另一个 atom 通过 `b`/`bl` 到达的 helper 标记为 `.alt_entry`，让它们保持 live symbol）。结合 elephc 在 codegen 前已经执行的 AST 侧 control-flow pruning 和 dead-code elimination，最终只会链接程序实际可达的 helper。Shared library（`--emit cdylib`）会保留完整运行时，确保每个导出入口仍然可调用。

运行时也可以为 `--emit cdylib` build 以**位置无关模式**发出：emitter 的 `pic_data_refs` flag 会让 `abi::symbols` helper 把每个全局 data reference 通过 GOT 路由（x86_64 上是 `@GOTPCREL`，AArch64 上是 `:got:`/`:got_lo12:`），而不是使用直接 PC-relative addressing；在 ELF target 上，每个内部 global 还会获得 `.hidden` visibility directive。PIC 和 non-PIC 变体会生成不同的汇编文本，因此它们会作为不同的 runtime object 缓存。参见 [The Codegen](the-codegen.md) 和 [Shared Libraries](../beyond-php/cdylib.md)。

## 运行时数据

运行时数据层位于 `src/codegen/runtime/data/`。`fixed.rs` 发出共享 buffer、error string 和 lookup table；`user.rs` 发出每个程序自己的 global、static、enum-case slot 和 metadata table；`instanceof.rs` 格式化 dynamic `instanceof` lookup name。它们共同使用 `.comm` 声明 global buffer 和 static data table：

```asm
.comm _concat_buf, 65536     ; 64KB string buffer
.comm _concat_off, 8         ; current offset into string buffer
.comm _global_argc, 8        ; saved argc from OS
.comm _global_argv, 8        ; saved argv pointer from OS
.comm _exc_handler_top, 8    ; top of the active exception-handler stack
.comm _exc_call_frame_top, 8 ; top of the activation-record cleanup stack
.comm _exc_value, 8          ; currently propagating exception object
.comm _fiber_current, 8      ; currently running Fiber object, or null on main
.comm _fiber_main_saved_sp, 8 ; saved main-stack pointer while running a fiber
.comm _fiber_main_saved_exc, 8 ; saved main exception-handler chain while running a fiber
.comm _fiber_main_saved_call_frame, 8 ; saved main cleanup-frame chain while running a fiber
.comm _rt_diag_suppression, 8 ; nested runtime warning-suppression depth for @
.comm _heap_buf, 8388608     ; 8MB heap by default (--heap-size overrides)
.comm _heap_off, 8           ; current heap offset
.comm _heap_free_list, 8     ; head of the general address-ordered free list
.comm _heap_small_bins, 32   ; 4 x 8-byte heads for <=8/16/32/64-byte cached blocks
.comm _heap_debug_enabled, 8 ; BSS-backed debug flag, set to 1 in _main when compiled with --heap-debug
.comm _gc_collecting, 8      ; cycle collector re-entry guard
.comm _gc_release_suppressed, 8 ; suppress nested collection during deep frees
.comm _json_last_error, 8    ; last JSON_ERROR_* code
.comm _json_active_flags, 8  ; active JSON flags for encode/decode/validate
.comm _json_active_depth, 8  ; current recursive JSON container depth
.comm _json_indent_depth, 8  ; current JSON_PRETTY_PRINT formatting depth
.comm _json_depth_limit, 8   ; configured JSON depth limit
.comm _json_validate_idx, 8  ; validator cursor index
.comm _json_validate_ptr, 8  ; validator input pointer
.comm _json_validate_len, 8  ; validator input length
.comm _json_decode_assoc, 8  ; json_decode object-shape selector
.comm _json_error_source_ptr, 8 ; json_decode input pointer for error locations
.comm _json_error_location_active, 8 ; whether line/column should be appended
.comm _json_error_line, 8    ; one-based line for the last json_decode error
.comm _json_error_column, 8  ; one-based column for the last json_decode error
_heap_max:
    .quad 8388608            ; configured heap size limit
.comm _gc_allocs, 8          ; allocation counter
.comm _gc_frees, 8           ; free counter
.comm _gc_live, 8            ; current live heap footprint in bytes
.comm _gc_peak, 8            ; high-water mark counter
.comm _cstr_buf, 4096        ; 4KB C-string conversion buffer
.comm _cstr_buf2, 4096       ; 4KB second C-string buffer
.comm _eof_flags, 256        ; EOF flag per file descriptor
.comm _principal_lookup_buf, 4096 ; passwd/group lookup line buffer
_etc_passwd_path:
    .asciz "/etc/passwd"     ; passwd database path for name lookups
_etc_group_path:
    .asciz "/etc/group"      ; group database path for name lookups
_principal_lookup_read_mode:
    .asciz "r"               ; fopen() mode for principal lookup files
; Per-program: global variable storage (one per `global $var` used)
.comm _gvar_x, 16            ; 16 bytes per global variable
; Per-program: static variable storage (one pair per `static $var`)
.comm _static_func_var, 16   ; 16 bytes for persisted value
.comm _static_func_var_init, 8 ; 8-byte initialization flag
; Per-program: static property storage (one slot per effective declaring class property)
.comm _static_prop_Class_prop, 16 ; 16 bytes for the static property value
```

此外，运行时还会发出 static data table：

- `_fmt_g` — 通过 `%.14G` 执行 float-to-string conversion 的 printf format string
- `_b64_encode_tbl` — 64 字节 Base64 encoding lookup table
- `_b64_decode_tbl` — 256 字节 Base64 decoding lookup table
- `_spl_autoload_exts_default`, `_spl_autoload_exts_ptr`, `_spl_autoload_exts_len` — 可变 SPL autoload extension state
- `_heap_err_msg`, `_arr_cap_err_msg`, `_ptr_null_err_msg` — fatal runtime error string
- `_buffer_bounds_msg`, `_buffer_uaf_msg`, `_match_unhandled_msg`, `_static_prop_private_access_msg`, `_instanceof_target_type_msg`, `_iterable_unsupported_kind_msg` — buffer、`match`、late-bound private static-property access、dynamic `instanceof` target validation 和 iterable dispatch 使用的 fatal runtime error string
- `_heap_dbg_bad_refcount_msg`, `_heap_dbg_double_free_msg`, `_heap_dbg_free_list_msg` — `--heap-debug` 启用的 fatal heap-debug error string
- `_heap_dbg_*` summary label — `__rt_heap_debug_report` 用于 alloc/free/live/leak 输出的固定字符串
- `_resource_id_prefix` — resource display helper 使用的前缀
- `_uncaught_exc_msg` — 没有 handler 时 `__rt_throw_current` 写出的 fatal exception string
- `_diag_fopen_failed_msg`, `_diag_file_get_contents_failed_msg`, `_diag_define_already_defined_msg` — 通过 `__rt_diag_warning` 路由的可抑制 runtime warning 文本
- `_fiber_msg_already_started`, `_fiber_msg_not_suspended`, `_fiber_msg_throw_not_suspended`, `_fiber_msg_not_terminated`, `_fiber_msg_suspend_outside`, `_fiber_msg_unsupported_callable`, `_fiber_msg_stack_alloc_failed` — `FiberError` runtime path 使用的消息
- `_fiber_class_id`, `_fiber_error_class_id` — Fiber object cleanup 和 `FiberError` construction 使用的 per-program class id
- `_generator_class_id` — 在 object deep-free 期间识别 Generator frame 使用的 per-program class id
- `_php_uname_mode_len_msg`, `_php_uname_mode_value_msg` — 无效 mode string 的 fatal `php_uname()` argument diagnostic
- `_filetype_*`, `_stat_key_*`, `_dirname_*`, `_pathinfo_key_*`, `_tmpfile_template` — I/O helper 使用的 file metadata、path、stat-array 和 temporary-file lookup string
- `_locale_utf8_name`, `_locale_env_name` — 需要 host locale fallback 的 runtime helper 使用的 locale selector
- `_json_true`, `_json_false`, `_json_null` — `__rt_json_encode_bool` 和 `__rt_json_encode_null` 使用的 JSON keyword string
- `_json_int_max_str`, `_json_int_min_str` — `JSON_BIGINT_AS_STRING` overflow detection 使用的十进制 threshold string，不通过 integer parsing 产生 wrapping
- `_json_err_msg_0` ... `_json_err_msg_10`, `_json_err_msg_table`, `_json_err_msg_count`, `_json_err_loc_prefix`, `_json_err_loc_colon` — `json_last_error_msg()` lookup data，以及支持的 `JSON_ERROR_*` code range 的 location-suffix fragment
- `_day_names` — 7 个 entry（84 字节），每个 12 字节：day name 填充到 10 个字符 + 1 个 length byte + 1 个 padding byte。供 `__rt_date` 的 `l`（全名）和 `D`（缩写）format character 使用
- `_month_names` — 12 个 entry（144 字节），布局与 day name 相同。供 `__rt_date` 的 `F`（全名）和 `M`（缩写）format character 使用
- `_strtotime_keyword_tab`, `_strtotime_unit_tab` — `__rt_strtotime` 使用的 keyword、weekday、modifier 和 unit lookup table
- `_instanceof_target_count`, `_instanceof_target_entries`, `_instanceof_name_*` — dynamic `instanceof` string target 使用的大小写不敏感 class/interface name metadata，包括 leading-backslash alias
- `_class_gc_desc_count`, `_class_gc_desc_ptrs`, `_class_gc_desc_<id>` — object deep-free 和 cycle collection 使用的 per-class property traversal metadata
- `_class_json_desc_ptrs`, `_class_json_desc_<id>`, `_class_json_pname_<id>_<slot>`, `_json_exception_class_id`, `_stdclass_class_id` — JSON object encoding descriptor、JsonException construction metadata 和 stdClass runtime class id
- `_class_attribute_count`, `_class_attribute_ptrs`, `_class_attributes_<id>` — 发出的 class-level PHP attribute metadata。当前面向 PHP 的 helper 和 Reflection owner constructor 会在 codegen 期间从同一份 `ClassInfo` metadata 物化结果，而不是做 dynamic runtime class/member lookup。
- `_class_vtable_ptrs`, `_class_vtable_<id>` — inheritance dispatch 通过 `class_id` 使用的 per-class virtual-method table
- `_class_static_vtable_ptrs`, `_class_static_vtable_<id>` — late static binding 使用的 per-class static-method table
- `_class_destruct_ptrs` — class_id-indexed `__destruct` method pointer（或 `0`），在 object deep-free 期间由 `__rt_call_object_destructor` 查询
- `_classes_by_name`, `_classes_by_name_count` — `new $variable()` 使用的大小写不敏感 `name -> (class_id, object size)` lookup table，供 `__rt_new_by_name` 使用
- `static_property_symbol(...)` 派生的 `.comm` slot — effective declaring static property 的 16 字节 storage slot；继承的 static property 会共享，直到子类重新声明该 property
- `enum_case_symbol(...)` 派生的 `.comm` slot — 从用户程序 metadata 发出的 enum case singleton backing storage

启用 `--heap-debug` 时，运行时还会激活 `__rt_heap_debug_check_live`、`__rt_heap_debug_validate_free_list` 和 `__rt_heap_debug_report`。这些 helper 会把 allocator corruption 转成针对重复释放、zero-refcount `incref`/`decref` 路径，以及畸形 free-list 或 small-bin state 的立即 fatal error；它们会用 `0xA5` poison 已释放 payload byte，并在进程结束时打印摘要，包括 alloc/free count、live block count、live byte、leak summary 和 peak live-byte watermark。

现在每次堆分配还会在 16 字节 allocator header 中携带统一的 8 字节 kind tag。当前运行时使用 `0=raw/untyped`、`1=string`、`2=indexed array`、`3=assoc/hash`、`4=object` 和 `5=boxed mixed`，让运行时 dispatch 可以独立于每个 payload 的内部布局。Generator frame 使用 heap kind `4`，因为 `Generator` 是带自定义 payload layout 的内置 object。低 16 位保存持久 container metadata：低字节 = heap kind，位 `8..14` = indexed-array runtime `value_type`，位 `15` = copy-on-write container flag。Collector 在 `__rt_gc_collect_cycles` 期间会复用更高位保存 transient reachable/incoming-edge metadata。运行时数据现在还包括 `_gc_collecting`、`_gc_release_suppressed`、`_class_gc_desc_count`、`_class_gc_desc_ptrs`、`_class_vtable_ptrs`、`_class_static_vtable_ptrs` 和 static-property storage slot，使 deep-free / cycle-collection 路径可以协调嵌套释放、发现 class property traversal metadata，并支持继承 instance dispatch、static-property 读写和 late static binding。

关于这些 buffer 如何工作，参见 [Memory Model](memory-model.md)。
