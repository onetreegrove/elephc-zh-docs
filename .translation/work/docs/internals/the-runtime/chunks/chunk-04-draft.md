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
