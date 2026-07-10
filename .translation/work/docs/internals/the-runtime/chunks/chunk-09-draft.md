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
