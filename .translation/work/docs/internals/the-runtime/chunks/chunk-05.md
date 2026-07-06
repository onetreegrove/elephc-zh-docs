### JSON routines

**Files:** `system/json_data.rs`, `system/json_depth.rs`, `system/json_throw_error.rs`, `system/json_last_error_msg.rs`, `system/json_validate/`, `system/json_decode.rs`, `system/json_decode_mixed/`, `system/json_encode_bool.rs`, `system/json_encode_null.rs`, `system/json_encode_float.rs`, `system/json_encode_str/`, `system/json_encode_array_int.rs`, `system/json_encode_array_str.rs`, `system/json_encode_array_dynamic.rs`, `system/json_encode_assoc.rs`, `system/json_encode_mixed.rs`, `system/json_encode_object.rs`, `system/json_pretty.rs`, plus `objects/stdclass.rs` for stdClass-specific JSON object encoding.

The `json_encode` implementation uses **type-aware dispatch** — the codegen calls a different runtime routine depending on the compile-time type of the value being encoded:

| Routine | What it does | Input | Output |
|---|---|---|---|
| `__rt_json_encode_bool` | Encode bool as `"true"` or `"false"` using static data labels | `x0` = 0 or 1 | `x1`/`x2` = JSON string |
| `__rt_json_encode_null` | Encode null as `"null"` using a static data label | — | `x1`/`x2` = JSON string |
| `__rt_json_encode_str` | Encode a string with JSON escaping (quotes, backslashes, control chars) | `x1`/`x2` = input string | `x1`/`x2` = JSON string |
| `__rt_json_encode_array_int` | Encode an integer array as a JSON array (e.g., `[1,2,3]`) | `x0` = array ptr | `x1`/`x2` = JSON string |
| `__rt_json_encode_array_str` | Encode a string array as a JSON array with quoted elements | `x0` = array ptr | `x1`/`x2` = JSON string |
| `__rt_json_encode_array_dynamic` | Encode an indexed array by inspecting its packed runtime `value_type` tag at runtime (int, string, float, bool, nested array/hash, mixed, or null fallback), caching active JSON flags in a callee-saved register during the walk | `x0` = array ptr | `x1`/`x2` = JSON string |
| `__rt_json_encode_assoc` | Encode an associative array as a JSON object, while tracking PHP list-shape keys during the same hash walk and compacting to JSON array form when applicable | `x0` = hash ptr | `x1`/`x2` = JSON string |
| `__rt_json_encode_float` | Encode finite floats and record `JSON_ERROR_INF_OR_NAN` for `INF`/`NAN`, honoring throw and partial-output flags | `d0` = float | `x1`/`x2` = JSON string |
| `__rt_json_encode_mixed` | Encode a boxed mixed payload by unboxing its runtime tag and dispatching to the concrete JSON encoder | `x0` = mixed ptr | `x1`/`x2` = JSON string |
| `__rt_json_encode_object` | Encode class objects by consulting per-class JSON descriptors; dispatches `JsonSerializable::jsonSerialize()` when present, otherwise walks public properties | `x0` = object ptr | `x1`/`x2` = JSON string |
| `__rt_json_encode_stdclass` | Encode the dynamic-property hash backing `stdClass`, preserving `{}` for empty instances | `x0` = stdClass hash ptr | `x1`/`x2` = JSON string |
| `__rt_json_decode` | String-only compatibility helper used by string decode paths; trims outer whitespace and unescapes quoted JSON strings including surrogate-aware `\uXXXX` sequences | `x1`/`x2` = JSON string | `x1`/`x2` = decoded string |
| `__rt_json_decode_mixed` | Checked structural recursive decoder that returns boxed `Mixed` cells for null, bool, int, float, string, indexed arrays, associative arrays, and stdClass objects depending on `_json_decode_assoc`; records syntax/depth/UTF-8/UTF-16 errors plus source offsets and returns 0 on malformed input | `x1`/`x2` = JSON string | `x0` = Mixed* or 0 |
| `__rt_json_decode_mixed_array_real` | Recursive array parser used by `json_decode_mixed` once the outer `[` token is known | parser cursor + JSON bounds | boxed Mixed array |
| `__rt_json_decode_mixed_object_real` | Recursive object parser used by `json_decode_mixed` once the outer `{` token is known; returns assoc hash or stdClass payload based on decode mode | parser cursor + JSON bounds | boxed Mixed object/hash |
| `__rt_json_skip_ws` | Shared RFC 8259 whitespace skipper used by `json_decode_mixed` and its recursive array/object parsers; advances a caller-owned cursor to the next token or caller-supplied limit | JSON slice pointer, exclusive limit, cursor | updated cursor |
| `__rt_json_validate` | Standalone RFC 8259 validator used by `json_validate()`; scalar validator helpers are also reused by `json_decode_mixed` for strings and numbers | `x1`/`x2` = JSON string | `x0` = 1 valid / 0 invalid |
| `__rt_json_depth_enter` / `__rt_json_depth_exit` | Maintain `_json_active_depth` and compare against `_json_depth_limit` for recursive encode/decode/validate walks | global JSON state | status / updated state |
| `__rt_json_set_error_location` | Convert a decoder target pointer into one-based line/column data relative to `_json_error_source_ptr` | target pointer | updates `_json_error_location_active`, `_json_error_line`, `_json_error_column` |
| `__rt_json_error_message` | Build the current JSON error message, appending the PHP 8.6 `" near location line:column"` suffix when decode location state is active | global JSON state | `x1`/`x2` = message |
| `__rt_json_throw_error` | Record a JSON error code and construct/throw `JsonException` when `JSON_THROW_ON_ERROR` is active, using the shared formatted JSON error message | `x0` = JSON_ERROR_* code | may not return |
| `__rt_json_last_error_msg` | Return the message string corresponding to `_json_last_error` through the `_json_err_msg_table` data table, including decode location suffixes when active | global JSON state | `x1`/`x2` = message |
| `__rt_json_pretty_push` / `__rt_json_pretty_pop` / `__rt_json_pretty_line` / `__rt_json_pretty_colon_space` | Maintain `_json_indent_depth` and append PHP-style pretty-print whitespace while each container encoder emits bytes. These helpers are no-ops unless `JSON_PRETTY_PRINT` is active, avoiding a second buffer walk. | current JSON state, `x11` write pointer for line/space helpers | updated formatting state / `x11` write pointer |

### Regex routines

**Files:** `system/preg_strip.rs`, `system/pcre_to_posix.rs`, `system/preg_match.rs`, `system/preg_match_all.rs`, `system/preg_replace.rs`, `system/preg_replace_callback.rs`, `system/preg_split.rs`

All regex routines use PCRE2 through the PCRE2 POSIX-compatible wrapper (`pcre2_regcomp()`, `pcre2_regexec()`, and `pcre2_regfree()`). `__rt_preg_strip` strips PHP-style delimiters and maps supported modifiers (`i`, `m`, `s`, `u`, `U`) to PCRE2 wrapper flags. `__rt_pcre_to_posix` keeps its historic symbol name for compatibility with existing emitters, but now only materializes the stripped PCRE pattern as a null-terminated C string. Regex-enabled programs request `pcre2-posix` and `pcre2-8` during final linking.

| Routine | What it does | Input | Output |
|---|---|---|---|
| `__rt_preg_match` | Test if a regex matches the subject string. Compiles the pattern, executes once, frees | pattern + subject strings | `x0` = 1 (match) or 0 (no match) |
| `__rt_preg_match_capture` | Test once and materialize PHP's optional `$matches` array from the compiled `regex_t.re_nsub` capture count, omitting trailing unmatched captures while keeping interior unmatched captures as empty strings | pattern + subject strings | match flag plus matches array pointer |
| `__rt_preg_match_all` | Count all non-overlapping matches by repeatedly executing the regex with advancing offsets | pattern + subject strings | `x0` = match count |
| `__rt_preg_replace` | Replace all regex matches with a replacement string. Builds the result incrementally in the concat buffer and expands `$0`..`$99` / `\0`..`\99` from the PCRE2 capture vector | pattern + replacement + subject | `x1`/`x2` = result string |
| `__rt_preg_replace_callback` | Replace all regex matches by allocating capture storage from `regex_t.re_nsub`, building an indexed `$matches` string array, invoking the callback, and appending the callback string result while preserving concat-buffer state across callback prologues | pattern + callback + subject | `x1`/`x2` = result string |
| `__rt_preg_split` | Split the subject string at regex match boundaries using `regex_t.re_nsub`-sized capture storage. Applies limit, no-empty, delimiter-capture, and offset-capture flags; dynamic flags return boxed Mixed slots to preserve layout | pattern + subject strings, limit, flags | `x0` = array pointer |