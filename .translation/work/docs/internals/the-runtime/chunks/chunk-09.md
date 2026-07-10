## Runtime data

The runtime data layer lives in `src/codegen/runtime/data/`. `fixed.rs` emits shared buffers, error strings, and lookup tables; `user.rs` emits per-program globals, statics, enum-case slots, and metadata tables; `instanceof.rs` formats dynamic `instanceof` lookup names. Together they declare global buffers using `.comm` and static data tables:

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

Additionally, the runtime emits static data tables:

- `_fmt_g` — printf format string for float-to-string conversion via `%.14G`
- `_b64_encode_tbl` — 64-byte Base64 encoding lookup table
- `_b64_decode_tbl` — 256-byte Base64 decoding lookup table
- `_spl_autoload_exts_default`, `_spl_autoload_exts_ptr`, `_spl_autoload_exts_len` — mutable SPL autoload extension state
- `_heap_err_msg`, `_arr_cap_err_msg`, `_ptr_null_err_msg` — fatal runtime error strings
- `_buffer_bounds_msg`, `_buffer_uaf_msg`, `_match_unhandled_msg`, `_static_prop_private_access_msg`, `_instanceof_target_type_msg`, `_iterable_unsupported_kind_msg` — fatal runtime error strings for buffers, `match`, late-bound private static-property access, dynamic `instanceof` target validation, and iterable dispatch
- `_heap_dbg_bad_refcount_msg`, `_heap_dbg_double_free_msg`, `_heap_dbg_free_list_msg` — fatal heap-debug error strings enabled by `--heap-debug`
- `_heap_dbg_*` summary labels — fixed strings used by `__rt_heap_debug_report` for alloc/free/live/leak output
- `_resource_id_prefix` — prefix used by resource display helpers
- `_uncaught_exc_msg` — fatal exception string written by `__rt_throw_current` when no handler exists
- `_diag_fopen_failed_msg`, `_diag_file_get_contents_failed_msg`, `_diag_define_already_defined_msg` — suppressible runtime warning text routed through `__rt_diag_warning`
- `_fiber_msg_already_started`, `_fiber_msg_not_suspended`, `_fiber_msg_throw_not_suspended`, `_fiber_msg_not_terminated`, `_fiber_msg_suspend_outside`, `_fiber_msg_unsupported_callable`, `_fiber_msg_stack_alloc_failed` — messages used by `FiberError` runtime paths
- `_fiber_class_id`, `_fiber_error_class_id` — per-program class ids used by Fiber object cleanup and `FiberError` construction
- `_generator_class_id` — per-program class id used to recognize Generator frames during object deep-free
- `_php_uname_mode_len_msg`, `_php_uname_mode_value_msg` — fatal `php_uname()` argument diagnostics for invalid mode strings
- `_filetype_*`, `_stat_key_*`, `_dirname_*`, `_pathinfo_key_*`, `_tmpfile_template` — file metadata, path, stat-array, and temporary-file lookup strings used by I/O helpers
- `_locale_utf8_name`, `_locale_env_name` — locale selectors used by runtime helpers that need host locale fallback
- `_json_true`, `_json_false`, `_json_null` — JSON keyword strings used by `__rt_json_encode_bool` and `__rt_json_encode_null`
- `_json_int_max_str`, `_json_int_min_str` — decimal threshold strings used by `JSON_BIGINT_AS_STRING` overflow detection without wrapping through integer parsing
- `_json_err_msg_0` ... `_json_err_msg_10`, `_json_err_msg_table`, `_json_err_msg_count`, `_json_err_loc_prefix`, `_json_err_loc_colon` — `json_last_error_msg()` lookup data and location-suffix fragments for the supported `JSON_ERROR_*` code range
- `_day_names` — 7 entries (84 bytes), each 12 bytes: day name padded to 10 chars + 1 length byte + 1 padding byte. Used by `__rt_date` for `l` (full name) and `D` (abbreviated) format characters
- `_month_names` — 12 entries (144 bytes), same layout as day names. Used by `__rt_date` for `F` (full name) and `M` (abbreviated) format characters
- `_strtotime_keyword_tab`, `_strtotime_unit_tab` — keyword, weekday, modifier, and unit lookup tables used by `__rt_strtotime`
- `_instanceof_target_count`, `_instanceof_target_entries`, `_instanceof_name_*` — case-insensitive class/interface name metadata used by dynamic `instanceof` string targets, including leading-backslash aliases
- `_class_gc_desc_count`, `_class_gc_desc_ptrs`, `_class_gc_desc_<id>` — per-class property traversal metadata used by object deep-free and cycle collection
- `_class_json_desc_ptrs`, `_class_json_desc_<id>`, `_class_json_pname_<id>_<slot>`, `_json_exception_class_id`, `_stdclass_class_id` — JSON object encoding descriptors, JsonException construction metadata, and stdClass runtime class id
- `_class_attribute_count`, `_class_attribute_ptrs`, `_class_attributes_<id>` — emitted class-level PHP attribute metadata. The current PHP-facing helpers and Reflection owner constructors materialize their results from the same `ClassInfo` metadata during codegen, rather than doing dynamic runtime class/member lookup.
- `_class_vtable_ptrs`, `_class_vtable_<id>` — per-class virtual-method tables used by inheritance dispatch through `class_id`
- `_class_static_vtable_ptrs`, `_class_static_vtable_<id>` — per-class static-method tables used by late static binding
- `_class_destruct_ptrs` — class_id-indexed `__destruct` method pointers (or `0`) consulted by `__rt_call_object_destructor` during object deep-free
- `_classes_by_name`, `_classes_by_name_count` — case-insensitive `name -> (class_id, object size)` lookup table used by `__rt_new_by_name` for `new $variable()`
- `static_property_symbol(...)`-derived `.comm` slots — 16-byte storage slots for effective declaring static properties, shared by inherited static properties until a subclass redeclares the property
- `enum_case_symbol(...)`-derived `.comm` slots — singleton backing storage for enum cases emitted from user program metadata

When `--heap-debug` is enabled, the runtime also activates `__rt_heap_debug_check_live`, `__rt_heap_debug_validate_free_list`, and `__rt_heap_debug_report`. These helpers turn allocator corruption into immediate fatal errors for duplicate frees, zero-refcount `incref`/`decref` paths, and malformed free-list or small-bin state, poison freed payload bytes with `0xA5`, and print an end-of-process summary with alloc/free counts, live block count, live bytes, leak summary, and the peak live-byte watermark.

Every heap allocation now also carries a uniform 8-byte kind tag in its 16-byte allocator header. The current runtime uses `0=raw/untyped`, `1=string`, `2=indexed array`, `3=assoc/hash`, `4=object`, and `5=boxed mixed`, which lets runtime dispatch stay independent from each payload's internal layout. Generator frames use heap kind `4` because `Generator` is a built-in object with a custom payload layout. The low 16 bits keep the persistent container metadata: low byte = heap kind, bits `8..14` = indexed-array runtime `value_type`, and bit `15` = copy-on-write container flag. The collector reuses higher bits for transient reachable/incoming-edge metadata during `__rt_gc_collect_cycles`. Runtime data also now includes `_gc_collecting`, `_gc_release_suppressed`, `_class_gc_desc_count`, `_class_gc_desc_ptrs`, `_class_vtable_ptrs`, `_class_static_vtable_ptrs`, and static-property storage slots so deep-free / cycle-collection paths can coordinate nested releases, discover class property traversal metadata, and support inherited instance dispatch, static-property reads/writes, and late static binding.

See [Memory Model](memory-model.md) for details on how these buffers work.