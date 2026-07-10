## How routines are emitted

**File:** `src/codegen/runtime/emitters.rs`

The `emit_runtime()` function calls the target-aware routine emitters in a fixed order. Each runtime module owns the shared helper surface and dispatches internally when AArch64 and Linux `x86_64` need different instruction sequences or ABI setup.

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

Notable runtime-only helpers emitted here include `__rt_diag_push_suppression`, `__rt_diag_pop_suppression`, `__rt_diag_warning`, `__rt_exception_cleanup_frames`, `__rt_exception_matches`, `__rt_instanceof_lookup`, `__rt_instanceof_invalid_target`, `__rt_throw_current`, `__rt_heap_debug_fail`, `__rt_heap_kind`, `__rt_hash_insert_owned`, `__rt_hash_free_deep`, `__rt_array_column_ref`, `__rt_mixed_instanceof`, `__rt_iterable_write_stdout`, `__rt_iterable_unsupported_kind`, `__rt_class_implements_interface`, `__rt_callable_descriptor_release`, `__rt_spl_dll_new`, `__rt_spl_fixed_new`, `__rt_gen_current`, `__rt_gen_send`, `__rt_preg_strip`, `__rt_pcre_to_posix`, `__rt_str_to_cstr`, `__rt_cstr_to_str`, `__rt_fiber_switch`, and `__rt_fiber_entry` in addition to the more user-visible helpers.

Compiled **executables** dead-strip unreachable runtime helpers at link time. On Linux each `__rt_*` helper is emitted in its own `.text.<name>` section and collected with `--gc-sections`; on macOS the runtime object carries a `.subsections_via_symbols` footer so each helper is a separately collectable atom dropped by `-dead_strip` (internal cross-helper labels stay assembler-local `L`-locals, with the few helpers reached by a `b`/`bl` from another atom marked `.alt_entry` so they remain live symbols). Combined with the AST-side control-flow pruning and dead-code elimination elephc already does before codegen, only the helpers a program actually reaches are linked. Shared libraries (`--emit cdylib`) keep the full runtime so every exported entry stays callable.

The runtime can also be emitted in **position-independent mode** for `--emit cdylib` builds: the emitter's `pic_data_refs` flag makes the `abi::symbols` helpers route every global data reference through the GOT (`@GOTPCREL` on x86_64, `:got:`/`:got_lo12:` on AArch64) instead of direct PC-relative addressing, and on ELF targets every internal global gets a `.hidden` visibility directive. The PIC and non-PIC variants produce different assembly text, so they cache as separate runtime objects. See [The Codegen](the-codegen.md) and [Shared Libraries](../beyond-php/cdylib.md).