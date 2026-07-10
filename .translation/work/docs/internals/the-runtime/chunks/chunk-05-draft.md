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
