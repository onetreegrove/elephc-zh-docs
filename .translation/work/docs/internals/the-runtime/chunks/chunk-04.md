### Reference counting

| Routine | What it does | Input | Output |
|---|---|---|---|
| `__rt_incref` | Increment reference count (safe with null/non-heap pointers) | `x0` = user pointer | — |
| `__rt_decref_any` | Release any heap-backed value by inspecting the uniform heap-kind tag | `x0` = pointer | — |
| `__rt_decref_array` | Decrement refcount, deep-free indexed array if zero | `x0` = array pointer | — |
| `__rt_decref_hash` | Decrement refcount, free hash table if zero | `x0` = hash pointer | — |
| `__rt_decref_mixed` | Decrement refcount, deep-free mixed cell if zero | `x0` = mixed pointer | — |
| `__rt_decref_object` | Decrement refcount, free object if zero | `x0` = object pointer | — |
| `__rt_gc_note_child_ref` | Add one transient incoming edge to a heap child during cycle counting | `x0` = child pointer | — |
| `__rt_gc_mark_reachable` | Recursively mark array/hash/object blocks reachable from external roots | `x0` = pointer | — |
| `__rt_gc_collect_cycles` | Run the targeted cycle collector over heap-backed arrays/hashes/objects | — | — |
| `__rt_mixed_free_deep` | Free a mixed cell and release any nested heap-backed payload; for tag-9 resources, dispatch the kind-specific destructor (kind 1 `close`, kind 2 `__rt_hash_ctx_free`, kind 3 `__rt_pclose`, kind 4 `__rt_closedir`) | `x0` = mixed pointer | — |
| `__rt_object_free_deep` | Free an object and release heap-backed properties using runtime/class metadata | `x0` = object pointer | — |

Refcounts are stored as a 32-bit value in the uniform 16-byte heap header, at `[user_ptr - 12]`. Each heap allocation starts with refcount 1. When a reference is shared (e.g., assigned to another variable or passed to a function), `__rt_incref` bumps it. When the reference goes away, `__rt_decref_any` can dispatch through the uniform heap-kind tag to the concrete string/array/hash/object/mixed release path. Arrays, hashes, objects, and boxed mixed cells still use ordinary reference counting first, but when a decref sees a container/object graph that can contain nested heap-backed values, the runtime can invoke `__rt_gc_collect_cycles` to clear transient metadata, count heap-only incoming edges, mark externally reachable blocks, and deep-free the remaining unreachable array/hash/object/mixed island.

## System routines

**Source:** `src/codegen/runtime/system/` (40 top-level files plus `date/`, `strtotime/`, `json_validate/`, `json_decode_mixed/`, and `json_encode_str/` subdirectories)

### `__rt_build_argv` — Build $argv array

**File:** `system/build_argv.rs`

At program start, the OS passes `argc` (argument count) in `x0` and `argv` (pointer to C string pointers) in `x1`. This routine:

1. Creates a new string array
2. For each C string pointer in argv: measures the string length (scan for null byte), pushes ptr+len into the array
3. Returns the array pointer

### Core system routines

| Routine | What it does | Input | Output |
|---|---|---|---|
| `__rt_time` | Get current Unix timestamp via `gettimeofday` syscall | — | `x0` = seconds since epoch |
| `__rt_microtime` | Get current time as float seconds via `gettimeofday` syscall | — | `d0` = seconds.microseconds |
| `__rt_getenv` | Get environment variable value via libc `getenv()` | `x1`/`x2` = name string | `x1`/`x2` = value string |
| `__rt_php_uname` | Read target runtime system information via libc `uname()`; supports PHP modes `a`, `s`, `n`, `r`, `v`, and `m` | `x1`/`x2` = mode string | `x1`/`x2` = selected uname string |
| `__rt_shell_exec` | Execute shell command and capture output via libc `popen()`/`pclose()` | `x1`/`x2` = command string | `x1`/`x2` = output string |

## Exception routines

**Source:** `src/codegen/runtime/exceptions.rs` plus `src/codegen/runtime/exceptions/` (6 files)

elephc lowers exceptions with a small runtime layer around `_setjmp` / `_longjmp`. Codegen publishes the current exception object into `_exc_value`, pushes a handler record into `_exc_handler_top`, and then uses these helpers to unwind, match catch clauses, and resume control flow through `catch` / `finally`.

| Routine | What it does | Input | Output |
|---|---|---|---|
| `__rt_exception_cleanup_frames` | Walk the activation-record stack, run per-frame cleanup callbacks, and stop at the frame that should survive the catch | `x0` = surviving activation record | — |
| `__rt_exception_matches` | Check whether the active exception matches a catch target by class id or interface id | `x0` = exception object, `x1` = target id, `x2` = 0 for class / 1 for interface | `x0` = 1 if it matches, 0 otherwise |
| `__rt_instanceof_lookup` | Resolve a dynamic class-string `instanceof` target through emitted case-insensitive class/interface metadata | `x1`/`x2` = target string | `x0` = found flag, `x1` = target id, `x2` = 0 class / 1 interface |
| `__rt_instanceof_invalid_target` | Abort when a dynamic `instanceof` target is neither a string nor an object | — | does not return |
| `__rt_class_implements_interface` | Test class metadata against an interface id for dynamic class-string checks without an object instance | `x0` = class id, `x1` = interface id | `x0` = 1 if implemented, 0 otherwise |
| `__rt_throw_current` | Unwind to the nearest active handler or print the fatal uncaught-exception message and exit | reads `_exc_value`, `_exc_handler_top`, `_exc_call_frame_top` | does not return normally |
| `__rt_rethrow_current` | Re-enter the ordinary throw path with the currently active exception | none (uses global exception state) | does not return normally |

The fatal uncaught-exception path writes `Fatal error: uncaught exception` to stderr and exits with status 1. The runtime also resets the concat-buffer cursor before the final `longjmp`, so partially built string state from the throwing frame does not leak into the resumed catch/finally code.

### Date/time routines

**Files:** `system/date/`, `system/date_data.rs`, `system/mktime.rs`, `system/microtime.rs`, `system/hrtime.rs`, `system/getdate.rs`, `system/localtime.rs`, `system/checkdate.rs`, `system/date_default_timezone.rs`, `system/strtotime/`

| Routine | What it does | Input | Output |
|---|---|---|---|
| `__rt_date` / `__rt_gmdate` | Format a Unix timestamp using PHP date format characters (Y, m, d, H, i, s, l, F, T, e, O, P, …). `__rt_date` decomposes with libc `localtime()`, `__rt_gmdate` with `gmtime()` (UTC); both share the formatter and the static `_day_names`/`_month_names` tables. The `T` token reports `"GMT"` on the gmdate path | `x1`/`x2` = format string, `x0` = timestamp | `x1`/`x2` = formatted string |
| `__rt_mktime` / `__rt_gmmktime` | Create a Unix timestamp from date components (hour, minute, second, month, day, year). Populates a `tm` struct and calls libc `mktime()` (local) or `timegm()` (UTC) | `x0`-`x5` = h, m, s, mon, day, year | `x0` = Unix timestamp |
| `__rt_strtotime` | Parse trimmed date/time strings through strategy emitters: ISO dates/datetimes (`iso_date`), `M/D/Y` slash dates (`slash_date`), textual dates like `15 January 2020` (`textual_date`), `@<timestamp>` epoch forms (`epoch`), `first`/`last day of …` and `first`/`last <weekday> of …` phrases (`first_last_day`), time-only forms, bare keywords (`now`, `today`, `tomorrow`, `yesterday`, `midnight`, `noon`), relative offsets (`+1 day`, `3 months ago`, `a/an <unit>` article forms), and named weekdays with `next` / `last` / `this`. Successful paths populate a `tm` struct and call libc `mktime()`; malformed input returns the `i64::MIN` failure sentinel | `x1`/`x2` = date string | `x0` = Unix timestamp or sentinel |
| `__rt_getdate` / `__rt_localtime` | Decompose a timestamp into PHP's `getdate()` / `localtime()` associative array via libc `localtime()`, defaulting the timezone to UTC through `__rt_tz_init_utc` on first use | `x0` = timestamp | `x0` = assoc array pointer |
| `__rt_checkdate` | Validate a Gregorian month/day/year, leap-year aware | `x0`-`x2` = month, day, year | `x0` = 0/1 |
| `__rt_microtime` / `__rt_hrtime` | Current wall-clock (`gettimeofday`) / monotonic (`clock_gettime`) time, as a float/string or `[sec, nsec]` array | flag | result |
| `__rt_date_default_timezone_get` / `__rt_date_default_timezone_set` / `__rt_tz_init_utc` | Read / set the process default timezone (`putenv("TZ=…")` + `tzset`); `__rt_tz_init_utc` lazily defaults it to UTC like PHP | — / `x1`/`x2` = id | — |

`DateTimeZone` introspection (`getLocation()`, `getTransitions()`, `listAbbreviations()`) is backed by the bundled **`elephc-tz`** workspace crate, which bakes PHP timelib's IANA timezone tables into committed data files and exposes them through the `elephc_tz_location` / `elephc_tz_transitions` / `elephc_tz_abbreviations` ABI symbols. Like the `elephc-tls` and `elephc-phar` bridges it is linked only into programs that use it. The offset/DST resolution used by `date()`/`gmdate()` themselves is delegated to libc (`localtime`/`gmtime`/`tzset`).