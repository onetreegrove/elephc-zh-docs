## Memory limits and trade-offs

| Resource | Size | What happens when full |
|---|---|---|
| Stack | OS default (~8MB) | Stack overflow (crash) |
| String buffer | 64KB | Resets each statement — effectively unlimited |
| Heap | 8MB (configurable) | Fatal error: "heap memory exhausted" |
| Heap metadata | `_heap_off`, `_heap_free_list`, `_heap_small_bins`, `_heap_debug_enabled`, `_gc_*` flags/counters = 104 bytes total | Fixed-size bookkeeping, not user-visible |
| Exception state | `_exc_handler_top`, `_exc_call_frame_top`, `_exc_value` = 24 bytes total | Fixed-size setjmp/longjmp handler and thrown-value bookkeeping |
| Fiber scheduler state | `_fiber_current`, `_fiber_main_saved_sp`, `_fiber_main_saved_exc`, `_fiber_main_saved_call_frame` = 32 bytes total | Fixed-size current-fiber and main-frame resume bookkeeping |
| Runtime diagnostics | `_rt_diag_suppression` = 8 bytes total | Fixed-size warning-suppression depth used by `@` and exception unwinding |
| JSON state | `_json_last_error`, `_json_active_flags`, `_json_active_depth`, `_json_indent_depth`, `_json_depth_limit`, `_json_validate_idx`, `_json_validate_ptr`, `_json_validate_len`, `_json_decode_assoc`, `_json_error_source_ptr`, `_json_error_location_active`, `_json_error_line`, `_json_error_column` = 104 bytes total | Fixed-size bookkeeping for JSON calls and decode error locations |
| CLI globals | `_global_argc`, `_global_argv` = 16 bytes total | Fixed-size bookkeeping |
| User globals | 16 bytes per `global $var` slot | Grows with number of referenced globals |
| Static vars | 24 bytes per `static $var` (`16 + 8 init flag`) | Grows with number of declared static locals |
| Static properties | 16 bytes per effective declaring class static property | Grows with number of declared and redeclared static properties |
| Array capacity | Fixed at creation until grow/re-hash logic runs | Fatal error: "array capacity exceeded" if a hard limit is hit |
| C-string buffers | `_cstr_buf`, `_cstr_buf2` = 4KB each, `_empty_str` = 1 byte | Long converted paths/strings are truncated to buffer size; `_empty_str` is a safe zero-length string pointer |
| File descriptor state | `_eof_flags`, `_stream_read_filters`, `_stream_write_filters` = 256 bytes each; `_popen_files`, `_dir_handles`, `_glob_handles`, `_zstream_handles`, `_bzstream_handles`, `_iconv_handles`, `_tls_sessions`, `_stream_chunk_size` = 2048 bytes each | Per-fd stream, process, directory, compression, iconv, TLS, and chunk-size bookkeeping for up to 256 descriptors |
| Stream filter scratch | `_stream_filter_buf`, `_stream_grow_scratch` = 64KB each | Scratch space for stream filters, including length-growing filters such as base64 and quoted-printable encoders |
| Stream context and callbacks | `_stream_context_options`, `_stream_notification_callback`, `_stream_connect_host`, `_stream_open_opened_path_scratch`, `_url_stat_matched` | Current stream-context options hash, notification callback, TLS peer host, wrapper opened-path scratch, and wrapper url_stat match flag |
| TLS and crypto function slots | `_elephc_tls_*_fn`, `_zlib_*_fn`, `_bz2_*_fn`, `_phar_zlib_*_fn`, `_phar_bz2_*_fn`, `_iconv_*_fn`, `_elephc_crypto_*_fn` = 8 bytes per slot | Late-bound function pointers so programs only link optional TLS/compression/iconv/crypto support when a call site publishes the symbol |
| HTTP/HTTPS/FTP buffers | `_http_resp_buf`, `_https_resp_buf`, `_user_wrapper_drain_buf`, `_phar_write_out` = 1MB each; `_http_req_scratch` = 8KB; `_http_redirect_path_buf`, `_fgc_url_retr` = 2KB each; `_fgc_url_addr`, `_fsockopen_addr` = 512 bytes each; `_ftp_resp_buf` = 4KB; `_ftp_data_addr`, `_ftp_cmd_scratch` = 64 bytes each | Protocol-specific response, request, redirect, FTP, wrapper, and PHAR writer scratch buffers |
| HTTP active context | `_http_active_ignore_errors`, `_http_active_max_redirects`, `_http_active_timeout_seconds`, `_http_active_proxy_ptr`, `_http_active_proxy_len`, `_http_active_host_ptr`, `_http_active_host_len`, `_http_redirect_path_len` | Fixed-size state shared between HTTP request construction and redirect/open helpers |
| Socket address scratch | `_recvfrom_addr_ptr`, `_recvfrom_addr_len`, `_accept_peer_ptr`, `_accept_peer_len` = 8 bytes each | Stores peer/address strings returned through by-reference socket parameters |
| Protocol/service lookup buffers | `_protoent_buf` = 32KB, `_servent_buf` = 1MB | Scratch buffers for protocol and service database lookups |
| Principal lookup buffers | `_principal_lookup_buf` = 4KB, `_etc_passwd_path`, `_etc_group_path`, `_principal_lookup_read_mode` | Scratch line buffer and fixed literals for `/etc/passwd` / `/etc/group` scans used by `chown()` / `chgrp()` string-name resolution without NSS |
| User wrapper and filter registries | `_user_wrappers`, `_user_wrapper_handles` = 2048 bytes each; `_user_filter_registry`, `_user_filter_instances` = 4096 bytes each | Registered stream wrappers, active wrapper handles, user filter definitions, and attached filter instances |
| PHAR writer state | `_phar_write_len`, `_phar_write_tpl_len`, `_phar_write_path_ptr`, `_phar_write_path_len`, `_phar_write_entry_ptr`, `_phar_write_entry_len`, `_phar_write_url_ptr`, `_phar_write_url_len` = 8 bytes each | State paired with the 1MB `_phar_write_out` archive buffer |
| Data section | No fixed limit | Grows with number of unique literals |

## Memory management strategy

elephc uses a **free-list allocator with reference counting plus a targeted cycle collector** — not pure bump-allocation, and not a whole-heap tracing runtime either. Memory is reclaimed in specific situations:

1. **Reference counting** — every heap allocation carries a 32-bit refcount (initialized to 1). When a reference is shared, `__rt_incref` increments it. When a reference is dropped, `__rt_decref_array`, `__rt_decref_hash`, or `__rt_decref_object` decrements it and frees the block when it reaches zero
2. **Copy-on-write splitting for arrays/hashes** — plain assignment still shares container storage, but the first mutating write clones a shared container before modifying it
3. **Codegen ownership tracking** — locals, globals, statics, `foreach` variables, `list(...)` targets, and call arguments are classified as owned or borrowed at compile time so new owners retain borrowed heap values before storing them
4. **Variable reassignment** — when `$x = "new value"` overwrites a string or array, the old heap block is freed or decreffed and returned to the allocator for reuse
5. **`unset($x)`** — explicitly frees the variable's heap allocation
6. **FFI string-call cleanup** — temporary C strings created for `extern function foo(string $s)` calls are released immediately after the native call returns
7. **String buffer reset** — the concat buffer resets at each statement, with strings that need to survive copied to heap via `__rt_str_persist`
8. **Stack memory** — automatically reclaimed when functions return
9. **Generator frame release** — Generator frames participate in object refcounting, with a custom deep-free branch for their frame slots and delegated iterator
10. **Resource scope-cleanup** — Mixed-boxed resources (tag 9) carry a resource-kind subtype in the high payload word, and `__rt_mixed_free_deep` runs the matching destructor when the box is released: kind 1 = native stream fd (`close()`), kind 2 = HashContext handle (`elephc_crypto_free` through `__rt_hash_ctx_free`), kind 3 = `popen` pipe (`__rt_pclose`, which closes the `FILE*` and reaps the child), kind 4 = `opendir` stream (`__rt_closedir`). Kind 0 resources (generic resources) are skipped, and every fd-backed kind also skips handles `>= 0x40000000` — synthetic wrapper handles and the `-1` sentinel that an explicit `fclose`/`pclose`/`closedir` stamps into the box so the descriptor is never released twice (even if its fd number was reused). Alias safety comes from the Mixed box refcount — `$b = $a` increfs the box, so only the last release triggers the destructor
11. **Process exit** — all memory reclaimed by the OS

### What is NOT freed

- **Non-adjacent free blocks** are still not compacted — fragmentation can still occur over time even though adjacent neighbors are coalesced on free and oversized free blocks are split on allocation
- **Pointer targets** are not ownership-tracked just because a raw pointer exists; the pointer value itself is only an address
- **Intermediate scratch strings** in `_concat_buf` are not individually freed — the buffer is simply reset per statement
- **General function epilogues** do not blanket-decref all heap locals. They now selectively clean up slots proven `Owned`, and exhaustive `if` / `elseif` / `else` branches can restore that cleanup when every fallthrough branch directly assigns the same heap-backed type to the same local. More dynamic borrowed/control-flow paths still remain excluded on purpose
- **Container-copying builtins** no longer blindly duplicate borrowed heap handles for common nested payload paths: refcounted runtime variants now retain values before new arrays/hash tables take ownership (`array` literals with spreads, `array_merge`, `array_chunk`, `array_slice`, `array_reverse`, `array_pad`, `array_unique`, `array_splice`, `array_diff`, `array_intersect`, `array_filter`, `array_fill`, `array_combine`, `array_fill_keys`)
- **Regression coverage now explicitly exercises** local aliases, borrowed nested-container returns, `Owned`/`Borrowed` control-flow merges, and scope-exit paths so future ownership work has focused tripwires instead of relying only on large end-to-end suites
- **Raw/off-heap ownership cycles** are still outside the collector. `ptr` values, extern-managed buffers, and raw helper allocations (`kind=0`) are not traversed just because an address exists somewhere
- **Kind-0 resources** (generic/unknown resource kind, including synthetic user-wrapper handles `>= 0x40000000`) are not auto-freed by the Mixed deep-free path — their lifecycle remains managed by the wrapper layer or the user's explicit `close()` call. Kinds 1–4 (native stream fd, HashContext, `popen` pipe, `opendir` stream) are auto-released at scope exit
- **HashContext reuse after `hash_final()`** is memory-safe but not PHP-equivalent: `elephc_crypto_final` finalizes a *clone* and leaves the original handle live and owned by its Mixed box, so the box's kind-2 destructor frees it exactly once. A second `hash_final()` or a `hash_update()`/`hash_copy()` on the same handle therefore does not double-free or use-after-free (where PHP throws "Supplied resource is not a valid Hash Context resource"), it simply keeps hashing the still-live context (documented in `src/codegen/runtime/strings/hash_context.rs`)

### Targeted cycle collection

The runtime now includes a targeted collector for heap-backed `array`, associative-array/hash, and `object` graphs:

- the allocator header carries a uniform heap-kind tag (`raw`, `string`, `array`, `hash`, `object`, `boxed mixed`)
- indexed arrays pack their runtime `value_type` into the same kind word so the collector knows whether their elements can contain nested heap pointers
- objects record runtime property tags/metadata, with `_class_gc_desc_*` tables as a compile-time fallback for property traversal; Generator frames are object-kind blocks with a custom deep-free branch keyed by `_generator_class_id`
- mixed release paths use `__rt_decref_any`, so deep-free and GC walks can release nested strings/arrays/hashes/objects through one uniform dispatcher

`__rt_gc_collect_cycles` is intentionally narrower than a full tracing GC: it ignores strings and raw helper buffers, clears transient metadata, counts heap-only incoming edges, marks externally reachable container/object blocks, then frees the unmarked remainder with deep-release helpers. That keeps the collector focused on the structural leak class that plain refcounting cannot solve without turning the whole runtime into a moving or stop-the-world heap.