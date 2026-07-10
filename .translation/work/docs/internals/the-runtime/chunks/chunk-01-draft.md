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
