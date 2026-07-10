## 例程如何发出

**文件：** `src/codegen/runtime/emitters.rs`

`emit_runtime()` 函数会以固定顺序调用 target-aware routine emitter。每个 runtime module 拥有共享 helper surface，并在 AArch64 和 Linux `x86_64` 需要不同指令序列或 ABI setup 时在内部进行分发。

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

这里发出的典型 runtime-only helper 包括 `__rt_diag_push_suppression`、`__rt_diag_pop_suppression`、`__rt_diag_warning`、`__rt_exception_cleanup_frames`、`__rt_exception_matches`、`__rt_instanceof_lookup`、`__rt_instanceof_invalid_target`、`__rt_throw_current`、`__rt_heap_debug_fail`、`__rt_heap_kind`、`__rt_hash_insert_owned`、`__rt_hash_free_deep`、`__rt_array_column_ref`、`__rt_mixed_instanceof`、`__rt_iterable_write_stdout`、`__rt_iterable_unsupported_kind`、`__rt_class_implements_interface`、`__rt_callable_descriptor_release`、`__rt_spl_dll_new`、`__rt_spl_fixed_new`、`__rt_gen_current`、`__rt_gen_send`、`__rt_preg_strip`、`__rt_pcre_to_posix`、`__rt_str_to_cstr`、`__rt_cstr_to_str`、`__rt_fiber_switch` 和 `__rt_fiber_entry`，此外还有更偏用户可见的 helper。

编译后的**可执行文件**会在链接时 dead-strip 不可达的 runtime helper。在 Linux 上，每个 `__rt_*` helper 都会发到自己的 `.text.<name>` section，并通过 `--gc-sections` 收集；在 macOS 上，runtime object 带有 `.subsections_via_symbols` footer，因此每个 helper 都是可单独收集的 atom，可由 `-dead_strip` 丢弃（内部 cross-helper label 保持 assembler-local 的 `L` local；少数会被另一个 atom 通过 `b`/`bl` 到达的 helper 标记为 `.alt_entry`，让它们保持 live symbol）。结合 elephc 在 codegen 前已经执行的 AST 侧 control-flow pruning 和 dead-code elimination，最终只会链接程序实际可达的 helper。Shared library（`--emit cdylib`）会保留完整运行时，确保每个导出入口仍然可调用。

运行时也可以为 `--emit cdylib` build 以**位置无关模式**发出：emitter 的 `pic_data_refs` flag 会让 `abi::symbols` helper 把每个全局 data reference 通过 GOT 路由（x86_64 上是 `@GOTPCREL`，AArch64 上是 `:got:`/`:got_lo12:`），而不是使用直接 PC-relative addressing；在 ELF target 上，每个内部 global 还会获得 `.hidden` visibility directive。PIC 和 non-PIC 变体会生成不同的汇编文本，因此它们会作为不同的 runtime object 缓存。参见 [The Codegen](the-codegen.md) 和 [Shared Libraries](../beyond-php/cdylib.md)。
