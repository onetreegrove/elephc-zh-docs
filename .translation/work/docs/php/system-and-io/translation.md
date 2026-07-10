---
title: "系统与 I/O"
description: "系统函数、日期/时间、JSON、文件系统实用工具、进程执行以及调试实用工具。"
sidebar:
  order: 12
---

## 系统函数

| 函数 | 签名 | 描述 |
|---|---|---|
| `exit()` | `exit($code = 0): void` | 终止程序 |
| `die()` | `die($code = 0): void` | `exit()` 的别名 |
| `time()` | `time(): int` | Unix 时间戳 |
| `microtime()` | `microtime($as_float = false): string\|float` | 微秒级精度的当前时间。默认或当 `$as_float` 为 `false` 时，返回 `"0.NNNNNNNN SSSSSSSSSS"` 格式的字符串（前 8 位数字为微秒分数，后接一个空格，然后是 Unix 秒数）；当 `$as_float` 为 `true` 时，返回以 `float` 表示的秒数。非字面量标志将产生 `string\|float`（装箱的 `Mixed`），并在运行时进行解析。 |
| `hrtime()` | `hrtime($as_number = false): array\|int` | 高精度单调时间（`CLOCK_MONOTONIC`）。返回 `[seconds, nanoseconds]`，或者当 `$as_number` 为 true 时返回以 int 表示的总纳秒数 —— 用于基准测试计算已用时间。 |
| `sleep()` | `sleep($seconds): int` | 延迟执行若干秒 |
| `usleep()` | `usleep($microseconds): void` | 延迟执行若干微秒 |
| `getenv()` | `getenv($name): string` | 获取环境变量 |
| `putenv()` | `putenv($assignment): bool` | 设置环境变量（"KEY=VALUE"） |
| `define()` | `define($name, $value): bool` | 使用字符串字面量名称定义编译时全局常量 |
| `defined()` | `defined($name): bool` | 检查是否定义了字符串字面量常量名称 |
| `php_uname()` | `php_uname($mode = "a"): string` | 从目标平台运行时获取系统信息 |
| `phpversion()` | `phpversion(): string` | 从 `Cargo.toml` 获取 elephc 包版本 |
| `exec()` | `exec($command): string` | 执行命令并返回输出 |
| `shell_exec()` | `shell_exec($command): string` | 通过 shell 执行命令并返回输出 |
| `system()` | `system($command): string` | 执行命令并将输出发送到标准输出（stdout） |
| `passthru()` | `passthru($command): void` | 执行命令并传递原始输出 |

`define()` 在运行时首次定义常量时返回 `true`。重复定义的尝试将保留第一个值，返回 `false`，并触发一个可抑制的运行时警告。`defined()` 目前在 AOT 模式下需要一个字符串字面量。

`php_uname()` 支持 PHP 标准的单字符模式：

| 模式 | 结果 |
|---|---|
| `"a"` | 完整系统信息行：系统名称、节点名称、发行版本、版本、机器类型 |
| `"s"` | 系统名称，匹配 `PHP_OS`（在 macOS 目标平台上为 `"Darwin"`，在 Linux 目标平台上为 `"Linux"`） |
| `"n"` | 网络节点名称 |
| `"r"` | 发行版本 |
| `"v"` | 版本 |
| `"m"` | 机器硬件名称 |

## 日期和时间

| 函数 | 签名 | 描述 |
|---|---|---|
| `date()` | `date($format [, $timestamp]): string` | 使用下面的格式化字符，格式化一个时间戳（或当前时间）为默认时区的时间。 |
| `gmdate()` | `gmdate($format [, $timestamp]): string` | 与 `date()` 相同，但格式化为 UTC 时间，因此其结果与配置的时区无关。 |
| `idate()` | `idate($format [, $timestamp]): int` | 类似于针对单个整型值格式化字符的 `date()`，返回 `int` 而不是字符串（例如 `idate("Y")`、`idate("U")`）。等价于 `(int) date($format, $timestamp)`。 |
| `date_default_timezone_set()` | `date_default_timezone_set($timezoneId): bool` | 设置 `date()`（以及 `DateTime::format()`）使用的默认时区。接受任何 IANA 标识符（例如 `"Europe/Paris"`、`"UTC"`）；UTC 偏移量和夏令时过渡将从系统时区数据库中解析。返回 `true`。 |
| `date_default_timezone_get()` | `date_default_timezone_get(): string` | 返回当前默认的时区标识符（未设置时默认为 `"UTC"`）。 |
| `mktime()` | `mktime($h, $m, $s, $mon, $day, $yr): int` | 从各部分创建时间戳，并按默认时区解析。 |
| `gmmktime()` | `gmmktime($h, $m, $s, $mon, $day, $yr): int` | 与 `mktime()` 类似，但将各部分解析为 UTC 时间（与默认时区无关）。 |
| `checkdate()` | `checkdate($month, $day, $year): bool` | 验证格里高利日期 —— 支持闰年；月份 1–12，日期在月份范围内，年份 1–32767。 |
| `getdate()` | `getdate($timestamp = time()): array` | 将时间戳分解为一个关联数组，包含：`seconds`、`minutes`、`hours`、`mday`、`wday`、`mon`、`year`、`yday`、`weekday`、`month`，以及表示时间戳的 `0`。 |
| `localtime()` | `localtime($timestamp = time(), $associative = false): array` | 将时间戳分解为原始的 `struct tm` 字段 —— 默认使用以 `0`–`8` 命名的数值索引，或者当 `$associative` 为 true 时使用 `tm_sec`…`tm_isdst` 作为键（`tm_mon` 从 0 开始，`tm_year` 是自 1900 年以来的年数）。 |
| `gettimeofday()` | `gettimeofday($as_float = false): array\|float` | 当前时间表示为 `['sec' => int, 'usec' => int, 'minuteswest' => int, 'dsttime' => int]`（minuteswest/dsttime 来自默认时区），或者当 `$as_float` 为 true 时返回以 float 表示的秒数。`usec` 派生自 `microtime()`。 |
| `strftime()` / `gmstrftime()` | `strftime($format [, $timestamp]): string` | 使用 C 语言 `strftime` 的 `%` 格式化字符来格式化时间戳（在 PHP 8.1 中已弃用）。格式化字符与 PHP 完全一致，包括周数 `%U`（以周日开始）、`%W`（以周一开始）和 `%V`（ISO）、空格填充的 `%e`/`%k`/`%l`、`%c`（及其空格填充的日期），以及两位数的 ISO 年份 `%g`。`%x`/`%X` use the default C-locale forms (`%m/%d/%y`, `%H:%M:%S`)。一个已知差异是：这里的 `%P` 产生小写的 `am`/`pm`，而 PHP 的 `strftime` 会输出字面量 `P`（它从未实现 GNU 的小写扩展）。`gmstrftime()` 以 UTC 进行格式化。 |
| `strptime()` | `strptime($timestamp, $format): array\|false` | `strftime()` 的逆操作：根据 C 语言 `strptime` 的 `%` 格式化字符（`%Y %y %m %d %e %H %M %S %j %B %b %h %A %a %p %P`、周格式化字符 `%u %w %U %W %V` 以及时区格式化字符 `%z`/`%Z`（解析但不用于构建时间实例），再加上 `%n`/`%t` 和 `%%`）解析字符串，生成 `struct tm` 数组（`tm_sec`/`tm_min`/`tm_hour`/`tm_mday`/从 0 开始的 `tm_mon`/自 1900 年以来的 `tm_year`/`tm_wday`/`tm_yday`/`unparsed`），不匹配时返回 `false`。在 PHP 8.1 中已弃用。 |
| `strtotime()` | `strtotime($datetime [, $baseTimestamp]): int\|false` | 将日期/时间字符串解析为 Unix 时间戳。支持 ISO 日期、仅时间、相对偏移、命名星期以及裸关键字。如果提供了 `$baseTimestamp`，则相对/关键字/仅时间形式将相对于它而不是当前时间进行解析。超出范围 of its range (月份 > 12，日期 > 31，小时 > 24，分钟 > 59，秒数 > 60) 将返回 `false`，这与 PHP 一致；而范围内的日历溢出（如 `"2026-02-30"`）仍会被规范化。失败时返回 `false`（使用 `=== false`；`-1` 是 Epoch 纪元前一秒的有效时间戳）。 |

当未调用 `date_default_timezone_set()` 时，默认时区为 **UTC**（与 PHP 一致），因此 `date()`、`strtotime()`、`mktime()` 和 `DateTime` 会产生与主机无关的输出，而不是遵循构建机器的本地时区。

过程式日期/时间别名（`date_create`, `date_create_immutable`, `date_create_from_format`, `date_create_immutable_from_format`, `date_diff`, `date_format`, `date_add`, `date_sub`, `date_modify`, `date_timestamp_get`, `date_timestamp_set`, `date_timezone_get`, `date_timezone_set`, `date_offset_get`, `date_date_set`, `date_isodate_set`, `date_time_set`, `date_interval_format`, `date_interval_create_from_date_string`, `date_parse`, `date_parse_from_format`, `date_get_last_errors`, `date_sun_info`, `date_sunrise`, `date_sunset`, `strptime`, `idate`, `gettimeofday`, `strftime`, `gmstrftime`, `timezone_open`, `timezone_identifiers_list`, `timezone_name_get`, `timezone_offset_get`, `timezone_name_from_abbr`, `timezone_location_get`, `timezone_transitions_get`, `timezone_abbreviations_list`, `timezone_version_get`）可以被 `function_exists()` 识别，尽管名称解析器会将它们重写为 OOP 调用或内置表达式；在最后一个命名空间片段上的比较是不区分大小写的。

`date()` 和 `gmdate()` 支持以下格式化字符（任何其他字符都将逐字复制）：

| 格式化字符 | 输出 |
|---|---|
| `Y` / `y` | 4 位数年份 / 2 位数年份 |
| `m` / `n` | 月份 01–12 / 1–12 |
| `d` / `j` | 月份中的第几天 01–31 / 1–31 |
| `D` / `l` | 缩写星期名（`Mon`） / 完整星期名（`Monday`） |
| `N` / `w` | ISO 星期数 1–7 (Mon=1) / 数值星期数 0–6 (Sun=0) |
| `F` / `M` | 完整月份名（`January`） / 缩写月份名（`Jan`） |
| `H` / `G` | 小时 00–23 / 0–23 |
| `h` / `g` | 小时 01–12 / 1–12 |
| `i` / `s` | 分钟 00–59 / 秒数 00–59 |
| `A` / `a` | `AM`/`PM` / `am`/`pm` |
| `S` | 月份中第几天的英语序数字尾（`st`, `nd`, `rd`, `th`） |
| `z` | 年份中的第几天，0–365 |
| `W` / `o` | ISO-8601 周数 (01–53) / ISO-8601 周数年份 |
| `t` | 月份中的天数，28–31 |
| `L` | 闰年标志，`1` 或 `0` |
| `U` | Unix 时间戳 |
| `O` / `P` | UTC 偏移量 `±hhmm` (`+0200`) / `±hh:mm` (`+02:00`) |
| `p` | 类似于 `P`，但在偏移量为零时输出字面量 `Z` |
| `Z` | 以秒为单位的 UTC 偏移量，`-43200`–`50400` (`7200`, `-18000`) |
| `B` | Swatch 因特网时间（Swatch Internet Time），UTC+1 日的 `000`–`999` 刻度（beats） |
| `T` / `e` | 时区缩写（`CEST`） / 标识符（`Europe/Paris`）；`gmdate()` 报告 `UTC` |
| `I` | 夏令时标志，如果该时刻夏令时生效则为 `1`，否则为 `0` |
| `c` / `r` | ISO 8601 日期时间（`2024-07-01T14:00:00+02:00`） / RFC 2822 日期时间（`Mon, 01 Jul 2024 14:00:00 +0200`） |
| `u` / `v` | 微秒 / 毫秒；始终为 `000000` / `000`（整秒时间戳） |
| `X` / `x` | 扩展的 ISO-8601 年份 —— `X` 始终带有符号（`+2024`）；`x` 仅在 `[0, 9999]` 范围之外带有符号（`1970`, `+10000`, `-0005`） |

反斜杠会转义下一个字符，使其逐字输出，而不是被当作格式化字符（例如 `date('Y-m-d\TH:i:s')` → `2023-11-14T22:13:20`）。请使用单引号格式字符串，以免 PHP 的双引号转义字符（`\t`, `\n`, …）产生干扰。（与 PHP 输出 NUL 字节不同，末尾单个反斜杠什么都不会输出。）

`strtotime()` 接受以下格式（对关键字/单位名称/星期名称的输入不区分大小写，且会去除首尾的 ASCII 空白字符）：

- **ISO 日期 / 日期时间** —— `YYYY-MM-DD`, `YYYY-MM-DD HH:MM`, `YYYY-MM-DD HH:MM:SS`, `YYYY-MM-DDTHH:MM` 或 `YYYY-MM-DDTHH:MM:SS`。小写 `t` 也可以作为日期/时间分隔符。
- **`@<timestamp>`** —— UNIX 时间戳（例如 `"@1700000000"`）；接受可选的符号和截断的小数部分。按原样返回（UTC），与当前时间无关。
- **美式 `M/D/Y`** —— `MM/DD/YYYY` 或单数 `M/D/Y`，带有可选的 `HH:MM[:SS]` 时间后缀（例如 `"12/25/2024"`, `"6/15/2024 8:05"`）。2 位数年份会划分到 2000–2069（`0`–`69`）或 1970–1999（`70`–`99`）。月份必须 `<= 12` 且日期 `<= 31`。
- **文本日期** —— `D Month Y`（`"25 December 2024"`）或 `Month D[,] Y`（`"December 25, 2024"`, `"July 4 2024"`），带有完整或 3 字母的月份名称（不区分大小写）和可选的 `HH:MM[:SS]` 时间后缀。日期不进行范围检查，因此 `"31 feb 2024"` 会像 PHP 一样规范化为 3 月 2 日。2 位数年份遵循与斜线日期相同的划分窗口。
- **裸关键字** —— `now`, `today`, `tomorrow`, `yesterday`, `midnight`, `noon`。（`midnight` 是 `today` 的别名。）
- **仅时间** —— `H:MM`, `HH:MM`, `H:MM:SS`, `HH:MM:SS` —— 与当天日期结合。
- **相对偏移量** —— `[+-]?N unit [N unit ...]`, `a/an unit` 以及 `N unit ago` / `a/an unit ago`（对整个表达式取反）。单位包括：`sec(s)`、`second(s)`、`min(s)`、`minute(s)`、`hour(s)`、`day(s)`、`week(s)`、`month(s)`、`year(s)`。支持像 `"+1 day 2 hours"`、`"an hour"` 和 `"a day ago"` 这样的复合形式。天/周的偏移量通过 libc 的 `mktime` 规范化来遵守夏令时。
- **相对单位** —— `this <unit>`（无变化）、`next <unit>`（+1）和 `last <unit>`（-1），对应单位 `second`、`minute`、`hour`、`day`、`week`、`month`、`year`（例如 `"next month"`, `"last year"`, `"this hour"`, `"next week"`），通过日历算术保留一天中的具体时间。`week` 单位锚定在周一，与 PHP 一致。
- **命名星期** —— `Monday`..`Sunday` 以及 3 字母缩写 `Mon`..`Sun`。修饰符：`next <weekday>`（下一次未来的星期；如果今天匹配，则为今天 + 7）、`last <weekday>`（最近一次过去的星期；如果今天匹配，则为今天 - 7）、`this <weekday>`（如果今天匹配，差值可能为零）。结果为目标日期的午夜。
- **`first/last day of <modifier> month`** —— `this`、`next`、`last`/`previous`/`prev` 选择月份；`first day of` 设置为 1 号，`last day of` 设置为最后一天。保留一天中的具体时间（例如 `"last day of next month"`）。
- **`<ordinal> <weekday> of <modifier> month`** —— 命名星期的第 `first`..`fifth` 或 `last` 次出现（例如 `"first monday of next month"`, `"last friday of this month"`, `"third tuesday of next month"`）。溢出的第 `fifth` 次出现会滚动到下个月；时间重置为午夜。

ISO 8601 日期时间可以携带尾部的显式时区：**数值 UTC 偏移量** `+HH:MM`、`-HH:MM`、`+HHMM`（可选地以空格分隔）、`Z` 或单词 `UTC`/`GMT`（例如 `"2024-06-15T12:00:00+02:00"`、`"2024-06-15 12:00:00 +0200"`、`"...Z"`、`"... UTC"`）。随后，挂钟时间将在该偏移量处进行解析（`Z`/`UTC`/`GMT` = UTC 偏移量 0），从而覆盖配置的默认时区。也接受尾部的 **IANA 时区名称**（例如 `"2024-06-15 12:00:00 America/New_York"`）：日期/时间将在该时区中解析，并从系统时区数据库解析完整的夏令时处理（因此该示例为东部夏令时 `12:00` = UTC `16:00`），随后恢复先前的默认时区。时区名称是最后一个空格分隔的标记，通过包含字母与时间进行区分，因此裸露的 `"YYYY-MM-DD HH:MM:SS"` 不受影响。不接受没有 `of <month>` 的裸序数星期（如 `"first monday"`）（请使用 `next monday` 或 `of <month>` 形式）。畸形输入返回 `false`（使用 `=== false` 来检测失败）。[日期和时间](datetime.md)中描述了 1900 年之前的年份处理。

## JSON

| 函数 | 签名 | 描述 |
|---|---|---|
| `json_encode()` | `json_encode($value, $flags = 0, $depth = 512): string\|false` | 编码为 JSON。支持 int、float、string、bool、null、数组、混合负载（mixed payloads）以及对象（公共属性 + `JsonSerializable::jsonSerialize()` 调度）。多字节 UTF-8 字符默认会被转义为 `\uXXXX`（对于码点 ≥ U+10000 的字符会转义为代理对）。`$flags` 遵守 `JSON_UNESCAPED_SLASHES`、`JSON_UNESCAPED_UNICODE`、`JSON_PRETTY_PRINT`、`JSON_FORCE_OBJECT`、`JSON_NUMERIC_CHECK`、`JSON_PRESERVE_ZERO_FRACTION`、`JSON_HEX_TAG`、`JSON_HEX_AMP`、`JSON_HEX_APOS`、`JSON_HEX_QUOT`、`JSON_PARTIAL_OUTPUT_ON_ERROR` 和 `JSON_THROW_ON_ERROR`（Inf/NaN 将触发 `JSON_ERROR_INF_OR_NAN`，而 `$depth` 溢出将触发 `JSON_ERROR_DEPTH`；抛出标志会将两者提升为 `JsonException`，而部分输出标志将保留替换后的 JSON 字符串）。`$depth` 默认为 512，并对每个容器编码器（关联数组、索引数组、对象）强制执行。其余的 `JSON_INVALID_UTF8_*` 标志将被接受并用于畸形的 UTF-8 字符串。 |
| `json_decode()` | `json_decode($json, $associative = null, $depth = 512, $flags = 0): mixed` | 完整的结构化解码器。返回一个装箱的 `Mixed` 单元，其运行时标签匹配解码后的 JSON 值（null/bool/int/float/string/array/object）。对于 JSON 对象，`$associative` 选择其形状：PHP 默认值（`null`/`false`）返回一个 `stdClass` 实例，其属性可以通过 `$obj->name` 访问；`true` 返回一个可以使用 `$obj["name"]` 进行索引的关联数组。直接支持对解码后的 `Mixed` 进行属性访问 —— 代码生成会解箱该单元，检查 `stdClass` 的 `class_id`，并路由到动态属性哈希表中。强制执行 `$depth`（溢出时产生 `JSON_ERROR_DEPTH`）。解码失败时会为 `json_last_error_msg()` 和 `JSON_THROW_ON_ERROR` 记录 PHP 8.6 风格、以 1 为基准的行/列数据。`$flags` 遵守 `JSON_THROW_ON_ERROR`（在语法/深度失败时抛出 `JsonException`）和 `JSON_BIGINT_AS_STRING`（超出 PHP_INT 范围的整型标记将作为保留数字的字符串返回，而不是通过 `__rt_atoi` 截断/溢出）。 |
| `json_last_error()` | `json_last_error(): int` | 返回运行时的最后一个 JSON 错误代码（`JSON_ERROR_*`）。 |
| `json_last_error_msg()` | `json_last_error_msg(): string` | 返回与 PHP 兼容的 `json_last_error()` 错误消息（例如 `"No error"`、`"Syntax error"`）。在 `json_decode()` 失败后，语法/控制字符/深度/UTF-8/UTF-16 错误消息将包含 `" near location line:column"` 后缀，而数值错误代码保持不变。 |
| `json_validate()` | `json_validate($json, $depth = 512, $flags = 0): bool` | RFC 8259 验证器。返回 `$json` 在语法上是否有效，失败时设置 `json_last_error()`，且对 `$flags` 仅接受 `0` 或 `JSON_INVALID_UTF8_IGNORE`（匹配 PHP 8.3）。 |

### 常量

暴露了完整的 PHP `JSON_*` 系列常量，并可以通过按位或（OR）运算符组合来构建标志参数。

| 编码标志 | 值 | 解码标志 | 值 |
|---|---|---|---|
| `JSON_HEX_TAG` | 1 | `JSON_OBJECT_AS_ARRAY` | 1 |
| `JSON_HEX_AMP` | 2 | `JSON_BIGINT_AS_STRING` | 2 |
| `JSON_HEX_APOS` | 4 | | |
| `JSON_HEX_QUOT` | 8 | | |
| `JSON_FORCE_OBJECT` | 16 | | |
| `JSON_NUMERIC_CHECK` | 32 | | |
| `JSON_UNESCAPED_SLASHES` | 64 | | |
| `JSON_PRETTY_PRINT` | 128 | | |
| `JSON_UNESCAPED_UNICODE` | 256 | | |
| `JSON_PARTIAL_OUTPUT_ON_ERROR` | 512 | | |
| `JSON_PRESERVE_ZERO_FRACTION` | 1024 | | |
| `JSON_INVALID_UTF8_IGNORE` | 1048576 | | |
| `JSON_INVALID_UTF8_SUBSTITUTE` | 2097152 | | |
| `JSON_THROW_ON_ERROR` | 4194304 | | |

| 错误代码 | 值 | 错误代码 | 值 |
|---|---|---|---|
| `JSON_ERROR_NONE` | 0 | `JSON_ERROR_RECURSION` | 6 |
| `JSON_ERROR_DEPTH` | 1 | `JSON_ERROR_INF_OR_NAN` | 7 |
| `JSON_ERROR_STATE_MISMATCH` | 2 | `JSON_ERROR_UNSUPPORTED_TYPE` | 8 |
| `JSON_ERROR_CTRL_CHAR` | 3 | `JSON_ERROR_INVALID_PROPERTY_NAME` | 9 |
| `JSON_ERROR_SYNTAX` | 4 | `JSON_ERROR_UTF16` | 10 |
| `JSON_ERROR_UTF8` | 5 | | |

### 类和接口

| 符号 | 种类 | 描述 |
|---|---|---|
| `JsonSerializable` | 接口 | 实现该接口的类可以重写 `jsonSerialize(): mixed`；`json_encode()` 将调度到此方法，而不是遍历公共属性。 |
| `Error` | 类 | 基础 PHP 错误可抛出类，具有 `message: string`、`code: int`、`__construct(string $message = "", int $code = 0)` 以及标准的 `Throwable` 方法。`FiberError` 继承此类。 |
| `Exception` | 类 | 基础 PHP 异常，具有 `message: string`、`code: int`、`__construct(string $message = "", int $code = 0)` 以及标准的 `Throwable` 方法。 |
| `RuntimeException` | 类 | `extends Exception`。标准 PHP “运行时错误”基类。 |
| `JsonException` | 类 | `extends RuntimeException`。携带导致异常的 `JSON_ERROR_*` 代码；`getCode()` 会返回它（例如 4 = SYNTAX，1 = DEPTH，10 = UTF16，7 = INF_OR_NAN）。 |
| `stdClass` | 类 | 动态属性容器。对于任何属性名称，`$obj = new stdClass(); $obj->name = "x";` 均可正常工作；其存储是实例上的一个后备哈希表。`json_decode($json)` 默认返回 `stdClass`（PHP 语义）；传入 `assoc: true` 以获取关联数组。 |

对象的编码规则：

- **实现 `JsonSerializable`** 的类将调度到 `$this->jsonSerialize()`，并对返回的值进行递归编码。
- **未**实现 `JsonSerializable` 的类将被编码为 JSON 对象，其键为**公共**属性（跳过私有和受保护属性），按照声明顺序进行编码，包括继承的公共属性。

### 当前限制

- `json_decode()` 是一个经过完整检查的结构化解码器：每种 JSON 值类型都通过一个真实的递归下降解析器来回转换（round-trip）为装箱的 `Mixed` 单元，并且畸形的输入会在解码遍历过程中记录 JSON 错误，而不是先运行一个单独的完整缓冲区验证步骤。解码失败还会记录源偏移量，并为 `json_last_error_msg()` 和 `JsonException` 消息格式化 PHP 8.6 风格的定位后缀（`near location line:column`），而不会改变 `json_last_error()` 的错误代码。具体映射关系为：`null` → `Mixed(null)`，`true`/`false` → `Mixed(bool)`，整数 → `Mixed(int)`，浮点数 → `Mixed(float)`，字符串 → 具有完整转义解码（`\"`、`\\`、`\/`、`\b`、`\f`、`\n`、`\r`、`\t` 以及包括代理对在内的 `\uXXXX`）的 `Mixed(str)`，数组 → 每个元素都被递归解码的 `Mixed(array<Mixed>)`，对象 → `stdClass` 实例（PHP 默认行为，`assoc=false`/`null`）或 `Mixed(assoc)`（`assoc=true`）。关联性标志通过 `_json_decode_assoc` 进行传递，因此嵌套对象共享调用者的选择。容器解析使用感知深度和字符串的边界扫描器，因此字符串值内部的逗号和括号永远不会混淆元素/键值对的检测。属性访问（`$obj->name`）、`[]` 索引（`$arr["k"]`, `$arr[0]`）以及 `count()` 均可直接作用于 `Mixed` 类型的 `json_decode` 结果上：代码生成路由到 `__rt_mixed_property_get` / `__rt_mixed_array_get` / `__rt_mixed_count`，它们对单元进行解箱，根据运行时标签进行调度（索引数组 / 关联数组 / stdClass），并将有类型的数据负载重新装箱回 `Mixed` 单元中。缺失的键、越界的索引和未知的属性都会返回 `Mixed(null)` 而不报错，这镜像了 PHP 静默触发“未定义索引（undefined index）”或“尝试访问非对象的属性（property on non-object）”的警告。在进行算术运算之前，请使用 `intval()` / `floatval()` 或显式的 `(int)` / `(float)` / `(string)` 强制类型转换将 `Mixed` 负载提升回有类型的值，因为 elephc 的类型系统要求 `+` 的操作数为数值类型，而仅靠 `Mixed` 自身无法满足该契约。
- `json_encode()` 遵守 `JSON_UNESCAPED_SLASHES`（默认将 `/` 转义为 `\/`）、`JSON_UNESCAPED_UNICODE`（默认将多字节 UTF-8 转义为 `\uXXXX`，码点 ≥ U+10000 的字符转义为代理对）、`JSON_PRETTY_PRINT`（4 空格缩进，元素之间换行，`:` 后一个空格）、`JSON_FORCE_OBJECT`（索引数组编码为 `{"0":val,"1":val,...}`）、`JSON_NUMERIC_CHECK`（看起来像数字的字符串按照 RFC 8259 语法编码为原始 JSON 数字）、`JSON_PRESERVE_ZERO_FRACTION`（整值浮点数保持 `1.0` 而不会折叠为 `1`）、完整的 `JSON_HEX_TAG/AMP/APOS/QUOT` 系列（将 `<`/`>`、`&`、`'`、`"` 替换为其 `\uXXXX` 形式）、Inf/NaN 检测（设置 `JSON_ERROR_INF_OR_NAN`；在 `JSON_THROW_ON_ERROR` 下抛出 `JsonException`，否则除非设置了 `JSON_PARTIAL_OUTPUT_ON_ERROR`，否则返回 `false`），以及**畸形 UTF-8 检测**：每个多字节的字节都会被验证（引导字节范围、后续字节、截断序列）。在没有清理标志的情况下，这会设置 `JSON_ERROR_UTF8` 并返回 `false`；`JSON_INVALID_UTF8_IGNORE` 会静默丢弃畸形字节而不抛出错误代码；`JSON_INVALID_UTF8_SUBSTITUTE` 将畸形字节替换为 ``（或者当同时设置了 `JSON_UNESCAPED_UNICODE` 时，替换为 U+FFFD 的 UTF-8 字节）。`JSON_PARTIAL_OUTPUT_ON_ERROR` 会保留可替换错误的局部输出。
- `json_encode()` 对非有限浮点数（Inf/NaN 触发 `JSON_ERROR_INF_OR_NAN`）和畸形 UTF-8 输入（`JSON_ERROR_UTF8`）会遵守 `JSON_THROW_ON_ERROR`，而 `json_decode()` 也会对（`JSON_ERROR_SYNTAX`、`JSON_ERROR_DEPTH`、`JSON_ERROR_UTF16`）遵守此标志。在已知失败的字节偏移量时，解码异常会使用与 `json_last_error_msg()` 相同的包含位置信息的错误消息字符串。PHP 不允许在 `json_validate()` 中使用此标志；当标志表达式是静态的时，elephc 会在编译时拒绝它。抛出助手将错误代码记录在 `_json_last_error` 中，以便在未启用该标志时，`json_last_error()` / `json_last_error_msg()` 仍能正常工作。
- 每当在高代理范围（`0xD800..0xDBFF`）内的 `\uXXXX` 转义字符没有紧跟低代理 `\uYYYY`（`0xDC00..0xDFFF`），或者低代理字符在没有前导高代理字符的情况下出现时，`json_decode()` 和 `json_validate()` 就会设置 `JSON_ERROR_UTF16`。检测器会逐字节地检查代理对的握手情况，因此任何畸形的第二个转义字符（截断的 `\u`、非十六进制数字或超出范围的码点）都会路由到 UTF16 而不是 SYNTAX，从而匹配 PHP 的精确行为。
- 所有三个 JSON 入口函数都遵守 `$depth` 参数，但符合 PHP 忠实的划分原则：`json_encode()` 允许最多 `$depth` 层的嵌套（`active <= limit`），而 `json_decode()` and `json_validate()` 在当前嵌套深度达到 `$depth` 时将拒绝（`active >= limit`）。例如，`json_decode("[1]", false, 1)` 会设置 `JSON_ERROR_DEPTH`，即使输入只嵌套了一层，这也与 PHP 一致。对于 `json_encode()` 和 `json_decode()`，`JSON_THROW_ON_ERROR` 会将错误提升为 `JsonException`。
- `json_decode()` 遵守 `JSON_BIGINT_AS_STRING`。设置时，大小超出 `PHP_INT_MAX` (`9223372036854775807`) 的整数语法 JSON 标记（没有 `.`、没有 `e`/`E`）将作为保留原始数字的 `Mixed(string)` 返回；在范围内的整数以及任何包含 `.`/`e`/`E` 的标记不受影响。检测是对阈值字符串 `9223372036854775807`（正数）/ `-9223372036854775808`（负数）进行长度以及词法（lex）上的对比。这是安全的，因为融合的数字验证器会拒绝 RFC 8259 前导零 —— 长度相同且无前导零的十进制字符串的词法比较与数值比较结果相同。该标志通过全局的 `_json_active_flags` 槽穿透嵌套的数组和对象，因此解码数组内部的大整数（bigint）也会作为字符串返回。
- `json_validate()` 是一个递归下降的 RFC 8259 验证器：它匹配字面量 `null`/`true`/`false`，验证完整的数字语法（`-?(0|[1-9][0-9]*)(.[0-9]+)?([eE][+-]?[0-9]+)?`），检查每一个字符串转义字符（`\"`、`\\`、`\/`、`\b`、`\f`、`\n`、`\r`、`\t` 以及带有四个十六进制数字的 `\uHHHH`），验证数组/对象中的括号配对，要求键值之间有冒号，并拒绝值之后的尾部内容。递归深度受 `$depth` 参数（默认 512）限制；在溢出时会记录 `JSON_ERROR_DEPTH`。任何其他畸形标记都会记录 `JSON_ERROR_SYNTAX`。
- `catch (Throwable $e)` 支持调度到标准的 `Throwable` 方法接口：`getMessage()`、`getCode()`、`getFile()`、`getLine()`、`getTrace()`、`getTraceAsString()`、`getPrevious()` 和 `__toString()`。
- 如果关联数组的键在插入顺序上形成了一个连续 of `0..count-1` 的序列，它们将被编码为 JSON 数组（`[...]`）—— 这匹配了 PHP 的运行时检测。`__rt_json_encode_assoc` 在主哈希表遍历期间追踪该形状，发出临时对象形式，并在每个键都匹配时原地（in-place）将完成的缓冲区压缩为数组形式。`JSON_FORCE_OBJECT` 禁用了这种压缩，因此该标志仍然具有更高的优先级。空关联数组也会编码为 `[]`（符合 PHP 中 `json_encode([])` 的语义）。
- 浮点数以 PHP 的 `serialize_precision = -1` 精度进行编码 —— 即可无损来回转换回相同 `double` 的最短十进制表示（因此 `json_encode(1.0/3.0)` 是 `0.3333333333333333`，而不是 14 位数字的 `echo`/`(string)` 形式，并且 `json_encode(0.1 + 0.2)` 是 `0.30000000000000004`）。JSON 数字布局与 `var_export` 不同：除非设置了 `JSON_PRESERVE_ZERO_FRACTION`，否则整值浮点数会丢弃小数部分（`json_encode(100.0)` 为 `100`，而不是 `100.0`），并且指数级大小使用小写 `e`、具有 `d.d` 尾数和无前导零的指数（`1.0e+17`, `1.0e-6`）。十进制/指数边界与 PHP 一致（`zend_gcvt`）：当 `decpt < -3` 或 `decpt > 17` 时为指数形式。专门的 `__rt_json_ftoa` 运行时助手通过在 `strtod` 重新解析下探测 `snprintf("%.*e", p, x)` 来寻找最短精度，这与在别处使用的默认 `precision` 无关。
- JSON 助手在每个受支持的目标平台上通过共享的运行时接口发出。结构化解码到 `Mixed`、`stdClass` 动态属性助手、感知 `JsonSerializable` 的对象编码、验证、美化输出、深度追踪以及 JSON 错误消息查找，都是该目标感知运行时路径的一部分。

## 序列化

| 函数 | 签名 | 备注 |
|---|---|---|
| `serialize()` | `serialize($value): string` | 逐字节生成 PHP 的 `serialize()` 传输格式：`N;` (null)、`b:0;`/`b:1;` (bool)、`i:<int>;` (int)、`d:<float>;`（float，以 `serialize_precision = -1` 获得最短的无损来回转换，非有限值使用 `INF`/`-INF`/`NAN`）、`s:<bytelen>:"<raw>";`（string，带有精确字节长度且没有转义的原始字节）、`a:<count>:{<key><value>...}`（嵌套的索引和关联数组，整型键表示为 `i:K;`，字符串键表示为 `s:N:"...";`，按插入顺序排列），以及 `O:<len>:"<Class>":<count>:{...}`（对象）。|
| `unserialize()` | `unserialize($data, $options = []): mixed` | 将 `serialize()` 传输格式重新解析为装箱的 `Mixed` 值。标量、数组和对象能够无损来回转换。畸形或不受支持的输入返回 `false`，这与 PHP 的失败指示一致。接受 `$options` 参数以实现签名兼容性，目前该参数被忽略。 |

`serialize()`/`unserialize()` 能够精准地无损转换标量、数组和对象的子集，且生成的字节与 PHP 解释器是可以互换的。它们与 `json_encode`/`json_decode` 共享相同的运行时遍历器族（runtime walker family），并复用了最短浮点数格式化器，因此浮点数输出匹配 `json_encode` 的精度。

### 对象

对象序列化为 `O:<len>:"<Class>":<count>:{...}`，并带有 PHP 精确的属性键混淆方式：公共属性使用原始名称，受保护属性使用 `\0*\0name`，私有属性使用 `\0Class\0name`。属性以声明顺序（继承的属性优先）发出。

支持序列化魔术方法：

- **`__serialize(): array`** —— 当定义了该方法时，对象主体是所返回数组的 `key;value;` 对，而不是原始属性。
- **`__unserialize(array $data): void`** —— 当定义了该方法时，解析后的主体将传递给它以恢复对象（而不是按名称注入属性）。其 `$data` 参数被视为以字符串/整数为键 of the returned array's 的数组，因此 `$data['key']` 可以正常工作（否则，裸 `array` 类型提示会解析为整数索引数组）。
- **`__sleep(): array`** —— 仅对命名的属性进行序列化，顺序为 `__sleep()` 的顺序，并使用它们混淆后的键。
- **`__wakeup(): void`** —— 在注入属性后运行（当未定义 `__unserialize()` 时）。

在单个 `serialize()` 调用中重复的对象会被发出为 `r:<index>;` 反向引用（PHP 的全局值计数器：每个值消耗下一个索引，数组键不消耗），而 `unserialize()` 会将它们重构为单个共享实例，从而保留了 `===` 的恒等性。这是用于持久化 `Phar` 全局元数据的相同机制（参见 [Streams](streams.md)）。

**限制：** 对象自身属性内部的循环引用在 `unserialize()` 时会解析为 `null`（序列化本身可以正确处理循环），且不支持已弃用的 `Serializable` 接口（`C:` 传输格式）。

## 正则表达式

正则表达式函数和 SPL 正则迭代器已在 [Regex](regex.md) 中记录，包括编译使用它们的程序所需的 PCRE2 原生库依赖项要求。

## 流（Streams）

流资源、标准流、包装器（`php://`、`data://`、`phar://`、`http://`、`https://`、`ftp://`、`ftps://`、压缩包装器和 `glob://`）、流上下文、过滤器、套接字、TLS、进程管道以及用户包装器已在 [Streams](streams.md) 中记录。

## 文件系统

| 函数 | 签名 | 描述 |
|---|---|---|
| `file_get_contents()` | `file_get_contents($filename): string\|false` | 读取文件的全部内容，如果无法打开则返回 `false`。字面量 `phar://` URL 会在编译时解码；非字面量 `phar://` 则在运行时读取。原生 PHAR、基于 tar 的 PHAR 和基于 zip 的 PHAR 容器都是可读的；原生的 gzip/bzip2 条目和 ZIP deflate 条目会被透明地解码。字面量和运行时字符串 `http://`、`https://`、`ftp://` 和 `ftps://` URL 会打开匹配的包装器，读取整个主体并将其返回（打开失败时返回 `false`）。 |
| `file_put_contents()` | `file_put_contents($filename, $data): int` | 写入文件 |
| `file()` | `file($filename): array` | 读取文件并按行放入数组中 |
| `file_exists()` | `file_exists($filename): bool` | 检查文件或目录是否存在 |
| `is_file()` | `is_file($filename): bool` | 是否为常规文件 |
| `is_dir()` | `is_dir($filename): bool` | 是否为目录 |
| `is_readable()` | `is_readable($filename): bool` | 是否可读 |
| `is_writable()` | `is_writable($filename): bool` | 是否可写 |
| `filesize()` | `filesize($filename): int` | 文件大小（以字节为单位） |
| `filemtime()` | `filemtime($filename): int` | 修改时间 |
| `disk_free_space()` | `disk_free_space($directory): float` | 包含 `$directory` 的文件系统的可用空间字节数；失败时返回 `0.0` |
| `disk_total_space()` | `disk_total_space($directory): float` | 包含 `$directory` 的文件系统的总空间字节数；失败时返回 `0.0` |
| `copy()` | `copy($source, $dest): bool` | 复制文件 |
| `rename()` | `rename($old, $new): bool` | 重命名/移动 |
| `unlink()` | `unlink($filename): bool` | 删除文件 |
| `mkdir()` | `mkdir($pathname): bool` | 创建目录 |
| `rmdir()` | `rmdir($pathname): bool` | 删除目录 |
| `scandir()` | `scandir($directory): array` | 列出文件 |
| `opendir()` | `opendir($directory): resource\|false` | 打开一个目录流以供 `readdir()` 遍历；返回一个流资源，失败时返回 `false` |
| `readdir()` | `readdir($dir_handle): string\|false` | 从目录句柄中读取下一个条目的名称（包括 `.` 和 `..`）；读取完所有条目后返回 `false` |
| `closedir()` | `closedir($dir_handle): void` | 关闭由 `opendir()` 打开的目录句柄 |
| `rewinddir()` | `rewinddir($dir_handle): void` | 重置目录句柄回第一个条目 |
| `glob()` | `glob($pattern): array` | 寻找匹配的文件 |
| `getcwd()` | `getcwd(): string` | 当前工作目录 |
| `chdir()` | `chdir($directory): bool` | 改变目录 |
| `tempnam()` | `tempnam($dir, $prefix): string` | 创建临时文件名 |
| `sys_get_temp_dir()` | `sys_get_temp_dir(): string` | 系统临时目录 |

## 符号链接

| 函数 | 签名 | 描述 |
|---|---|---|
| `symlink()` | `symlink($target, $link): bool` | 在 `$link` 处创建一个指向 `$target` 的符号链接。 |
| `link()` | `link($target, $link): bool` | 为现有路径 `$target` 创建一个硬链接 `$link`。 |
| `readlink()` | `readlink($path): string\|false` | 读取符号链接指向的目标。失败时返回 `false`。 |
| `linkinfo()` | `linkinfo($path): int` | 返回链接的设备 ID（`st_dev`），失败时返回 `-1`。 |

## 文件元数据

| 函数 | 签名 | 描述 |
|---|---|---|
| `fileatime()` | `fileatime($filename): int\|false` | 上次访问时间（Unix 时间戳），失败时返回 `false` |
| `filectime()` | `filectime($filename): int\|false` | Inode 修改时间（Unix 时间戳），失败时返回 `false` |
| `fileperms()` | `fileperms($filename): int\|false` | 完整的 `st_mode`（文件类型位 + 权限），失败时返回 `false` |
| `fileowner()` | `fileowner($filename): int\|false` | 所有者的 UID，失败时返回 `false` |
| `filegroup()` | `filegroup($filename): int\|false` | 组的 GID，失败时返回 `false` |
| `fileinode()` | `fileinode($filename): int\|false` | Inode 编号，失败时返回 `false` |
| `filetype()` | `filetype($filename): string\|false` | 对于获取状态的路径，返回 `"file"`、`"dir"`、`"link"`、`"char"`、`"block"`、`"fifo"`、`"socket"`、`"unknown"` 中的一个，在 `lstat()` 失败时返回 `false`。使用 `lstat()` 语义。 |
| `is_executable()` | `is_executable($filename): bool` | `access(path, X_OK)` |
| `is_link()` | `is_link($filename): bool` | 对于符号链接返回 True（使用 `lstat()`） |
| `is_writeable()` | `is_writeable($filename): bool` | `is_writable()` 的别名 |
| `stat()` | `stat($filename): array\|false` | 包含数值键（0..=12）和字符串键（`dev`、`ino`、`mode`、`nlink`、`uid`、`gid`、`rdev`、`size`、`atime`、`mtime`、`ctime`、`blksize`、`blocks`）的关联数组，失败时返回 `false`。 |
| `lstat()` | `lstat($filename): array\|false` | 结构与 `stat()` 相同，但不追踪符号链接，失败时返回 `false` |
| `fstat()` | `fstat(resource $handle): array\|false` | 结构与 `stat()` 相同，但操作的是一个打开的流资源，失败时返回 `false` |
| `clearstatcache()` | `clearstatcache($clear_realpath_cache = false, $filename = ""): void` | 空操作（elephc 不缓存 `stat()` 的结果）。参数仍会被评估。 |

> `stat()` / `lstat()` / `fstat()` 的 13 个字段会按照 PHP 文档中记录的顺序插入。当路径或流可能无效时，在读取字段之前，请先检查返回值是否为 `false`。

## 路径操作

| 函数 | 签名 | 描述 |
|---|---|---|
| `basename()` | `basename($path [, $suffix]): string` | 返回路径中的尾部名称部分。若 `$suffix` 是结果的严格后缀，则会被裁剪掉。 |
| `dirname()` | `dirname($path [, $levels = 1]): string` | 返回父目录。当 `$levels` 大于 1 时，重复向上查找父目录。 |
| `pathinfo()` | `pathinfo($path [, $flag]): array\|string` | 若无标志或带有 `PATHINFO_ALL`：返回包含键 `dirname`、`basename`、`extension`（当基本文件名包含点时）以及 `filename` 的关联数组。若带有组件标志（`DIRNAME`、`BASENAME`、`EXTENSION`、`FILENAME`）：返回对应的字符串。支持运行时计算的标志。 |
| `realpath()` | `realpath($path): string\|false` | 规范化的绝对路径，如果路径不存在则返回 `false`。 |
| `realpath_cache_get()` | `realpath_cache_get(): array` | 返回空数组；elephc 不维护 realpath 缓存。 |
| `realpath_cache_size()` | `realpath_cache_size(): int` | 返回 `0`；elephc 不维护 realpath 缓存。 |
| `fnmatch()` | `fnmatch($pattern, $filename [, $flags = 0]): bool` | Shell 通配符匹配。支持 `*`、`?`、`[abc]`、`[a-z]`、`[!abc]`/`[^abc]`、`\\<char>` 以及 PHP 标志。 |

> `pathinfo()` 接受 `PATHINFO_DIRNAME` (1)、`PATHINFO_BASENAME` (2)、`PATHINFO_EXTENSION` (4)、`PATHINFO_FILENAME` (8) 和 `PATHINFO_ALL` (15) 常量、整型字面量、变量，以及类似 `PATHINFO_DIRNAME | PATHINFO_EXTENSION` 的位掩码。组件位掩码遵循 PHP 优先级顺序：dirname、basename、extension，然后是 filename。组件标志形式会将请求的组件作为字符串返回（如果缺失，则返回空字符串，例如 `pathinfo("foo", PATHINFO_EXTENSION)` 返回 `""`）。无标志和确切的 `PATHINFO_ALL` 形式会返回一个关联数组；仅在基本文件名没有点时，才会省略 `extension` 键，这与 PHP 的行为一致。

> `fnmatch()` 支持 PHP 的 `FNM_NOESCAPE`、`FNM_PATHNAME`、`FNM_PERIOD` 和 `FNM_CASEFOLD` 标志，包括运行时计算的位掩码，例如 `FNM_PATHNAME | FNM_CASEFOLD`。其数值是特定于目标平台的，并遵循所选平台的 PHP/libc 常量。

## 文件修改

| 函数 | 签名 | 描述 |
|---|---|---|
| `touch()` | `touch($filename [, $mtime [, $atime]]): bool` | 设置访问/修改时间。如果文件缺失，则以 `0666 & umask` 权限创建该文件。在没有 `$mtime` 或 `$mtime = null` 时，使用当前时间；在没有 `$atime` 或 `$atime = null` 时，默认为 `$mtime`。在注册的 `scheme://` 路径上，它会向包装器的 `stream_metadata($path, STREAM_META_TOUCH, [$mtime, $atime])` 调度一个包含 2 个元素的整型数组。 |
| `chmod()` | `chmod($filename, $mode): bool` | 改变文件模式。在注册的 `scheme://` 路径上，它会向包装器的 `stream_metadata($path, STREAM_META_ACCESS, $mode)` 调度并返回其 `bool` 结果（当包装器未实现 `stream_metadata` 时返回 false）。 |
| `chown()` | `chown($filename, $user): bool` | 通过 UID 或用户名改变所有者。组保持不变。在注册的 `scheme://` 路径上，它会调度到包装器的 `stream_metadata($path, STREAM_META_OWNER, $uid)`（整型 `$user`）或 `stream_metadata($path, STREAM_META_OWNER_NAME, $name)`（字符串 `$user`）。 |
| `chgrp()` | `chgrp($filename, $group): bool` | 通过 GID 或组名改变组。所有者保持不变。在注册的 `scheme://` 路径上，它会调度到包装器的 `stream_metadata($path, STREAM_META_GROUP, $gid)`（整型 `$group`）或 `stream_metadata($path, STREAM_META_GROUP_NAME, $name)`（字符串 `$group`）。 |
| `lchown()` | `lchown($filename, $user): bool` | 通过 UID 或用户名改变符号链接的所有者，而不追踪该链接。组保持不变。 |
| `lchgrp()` | `lchgrp($filename, $group): bool` | 通过 GID 或组名改变符号链接的组，而不追踪该链接。所有者保持不变。 |
| `umask()` | `umask([$mask]): int` | 设置进程的 umask 并返回旧的值。在没有参数时，返回当前 umask 且不改变它（通过设置 `umask(0)` 并立即恢复原值来实现）。 |

> 除 `umask()` 外，文件修改函数在成功时返回 `true`，失败时返回 `false`。

> `touch()` 接受整型 Unix 时间戳或 `null` 作为 `$mtime` / `$atime`。数值（包括 `-1`）被视为显式时间戳；`null` 和省略的参数会选择 PHP 的默认/当前时间行为。

## 网络实用工具

| 函数 | 签名 | 描述 |
|---|---|---|
| `gethostname()` | `gethostname(): string` | 返回运行该程序的机器的主机名 |
| `gethostbyname()` | `gethostbyname(string $hostname): string` | 通过系统解析器将主机名解析为其 IPv4 点分十进制地址；当无法解析时，返回未改变的主机名 |
| `gethostbyaddr()` | `gethostbyaddr(string $ip): string\|false` | 将一个 IPv4 点分十进制地址反向解析为主机名；当记录不存在时返回未改变的地址，畸形时返回 `false` |
| `getprotobyname()` | `getprotobyname(string $protocol): int\|false` | 在系统协议数据库中按名称或别名查找 IP 协议号；没有匹配条目时返回 `false` |
| `getprotobynumber()` | `getprotobynumber(int $protocol): string\|false` | 在系统协议数据库中按协议号查找 IP 协议名称；没有匹配条目时返回 `false` |
| `getservbyname()` | `getservbyname(string $service, string $protocol): int\|false` | 在系统服务数据库中按服务名称或别名及协议查找网络服务端口；没有匹配条目时返回 `false` |
| `getservbyport()` | `getservbyport(int $port, string $protocol): string\|false` | 在系统服务数据库中按端口号及协议查找网络服务名称；没有匹配条目时返回 `false` |

## 调试

| 函数 | 签名 | 描述 |
|---|---|---|
| `var_dump()` | `var_dump($value): void` | 输出类型和值。`int`、`string`、`bool` 或 `float` 的同构索引数组以及关联数组（哈希）会打印完整的逐元素主体（如 `[N]=>\n  int(V)\n`, `["key"]=>\n  string(…)\n` 等）。在具有 `Mixed` 元素的数组或哈希内部嵌套的数组/对象将打印 `NULL`（对于这些布局的递归嵌套支持仍待开发）。 |
| `print_r()` | `print_r($value): void` | 人类易读的输出。索引数组、关联数组和任意嵌套数组会打印 PHP 递归的 `Array\n(\n    [key] => value\n)\n` 布局（键不带引号，每级缩进 4 个空格，对于 bool 类型的 `true`/`false` 输出 `1`/空值，对于 `null` 输出空值）。目前尚不支持 2 个参数的返回形式（`print_r($v, true)`）。 |
| `var_export()` | `var_export($value, $return = false): ?string` | 可解析的表示形式。以 PHP 的 `array (\n  key => value,\n)` 布局渲染标量（带有 `\\`/`\'` 转义的 `'…'` 单引号字符串、`true`/`false`、`NULL`、整数和浮点数 —— 其中整值浮点数会附带 `.0`）以及任意嵌套的数组（每级缩进 2 个空格，裸整数键以及带引号的字符串键，嵌套数组独占一行）。当 `$return = true` 时，将返回渲染内容而不是将其打印输出。对象目前尚不进行渲染（PHP 通常发出 `\Class::__set_state(...)`）。浮点数使用 PHP 的 `serialize_precision = -1` 语义 —— 即能够无损来回转换回相同 `double` 的最短十进制表示（因此 `1/3` 会渲染为 `0.3333333333333333`，而不是 14 位数字的 `(string)` 形式），并使用与 PHP 相同的科学记数法布局（`1.0E+17`, `1.0E-6`），整值浮点数附带 `.0`（`1.0`, `100.0`），并且保留 `-0.0`、`INF`、`-INF`、`NAN`。这独立于 `echo`/`(string)` 使用的默认 `precision`。 |

```php
<?php
$arr = [1, 2, 3];
var_dump($arr);
// array(3) {
//   [0]=> int(1)
//   [1]=> int(2)
//   [2]=> int(3)
// }

var_export(['a' => 1, 'b' => [2, 3]]);
// array (
//   'a' => 1,
//   'b' =>
//   array (
//     0 => 2,
//     1 => 3,
//   ),
// )
```
