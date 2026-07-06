### Static method call (`ClassName::method(args)`)

Static methods are called like regular functions, but with the label `_static_ClassName_methodName`. No object pointer is passed:

```asm
bl _static_Point_origin              ; call static method
; result in x0 (object pointer)
```

`self::method()` is handled as a direct call against the current lexical class. If it resolves to an instance method, codegen loads the implicit `$this` receiver and branches directly to the resolved `_method_Class_method` label. `parent::method()` works the same way against the immediate parent class. For static targets, codegen now also threads a hidden "called class id" argument through static method bodies: named `ClassName::method()` calls pin that id to the named class, while `self::` and `parent::` forward the current called class. `static::method()` then uses that forwarded class id to load the target from a per-class static-method table at runtime.

## The ABI module

**Files:** `src/codegen/abi/mod.rs`, `src/codegen/abi/`

Centralizes register conventions so they're consistent everywhere:

### Large offset addressing

ARM64's `stur`/`ldur` instructions only support 9-bit signed immediates (offsets up to 255). Functions with many local variables can exceed this limit. The ABI module handles this transparently via `store_at_offset()` and `load_at_offset()`:

- **Offsets <= 255**: single `stur`/`ldur` instruction (fast path)
- **Offsets 256-4095**: two-instruction sequence — `sub x9, x29, #offset` to compute the address in a scratch register, then `str`/`ldr` through that register

This means all codegen that accesses stack variables goes through the ABI helpers rather than emitting `stur`/`ldur` directly, so large stack frames work automatically. The same boundary now also owns indirect `[*ptr]` loads/stores used by by-reference params and mutation-heavy expression paths, so x86_64-specific memory syntax does not leak back into `expr.rs`.

`emit_frame_slot_address()` complements those helpers when codegen needs the address of a local slot itself rather than the value stored there. By-reference calls, `ptr($var)`, and exception-frame bookkeeping now all reuse that helper instead of open-coding frame-slot address math.

### Frame and return-value helpers

The `abi/` module now centralizes the frame-management primitives used by both `_main` and ordinary functions:

- `emit_frame_prologue()` / `emit_frame_restore()` — shared stack-frame setup and teardown
- `emit_cleanup_callback_prologue()` / `emit_cleanup_callback_epilogue()` — tiny helper frames used by exception cleanup callbacks
- `emit_preserve_return_value()` / `emit_restore_return_value()` — spill/reload of scalar, float, and string returns across epilogue side effects or `finally` dispatch

That moves prologue/epilogue mechanics out of the higher-level walkers and makes the ABI layer responsible for more than just local-slot addressing.

### Incoming argument lowering

Incoming parameter decoding now goes through `IncomingArgCursor` plus `emit_store_incoming_param()`.

The cursor tracks:

- current integer argument register index
- current floating-point argument register index
- when argument passing has overflowed to the caller stack
- the caller-stack byte offset for subsequent spilled parameters

Those helpers now understand both the AArch64 calling convention and the Linux `x86_64` SysV AMD64 target. Function codegen delegates incoming-parameter lowering to the ABI layer instead of open-coding register names or caller-stack offsets inline.

### Outgoing call argument lowering

Outgoing calls now use ABI-owned helpers as well:

- `build_outgoing_arg_assignments_for_target()` decides whether each argument lands in an integer register, a floating-point register, or overflows onto the caller-visible stack area for the selected target
- `materialize_outgoing_args()` rewrites the temporary pushed-argument stack into the final ABI layout expected at the call site

That logic is shared by ordinary function calls, indirect/callable dispatch, object/method calls, constructor/static dispatch, and helpers such as `call_user_func_array()`. The assignment/materialization rules now cover both AArch64 and Linux `x86_64` SysV layout, so the call ABI policy lives in one place instead of being duplicated across several dispatch paths.

The same module now also owns a thin layer of call-site and temporary-stack primitives used by higher-level walkers:

- `emit_call_label()` / `emit_call_reg()` emit direct and indirect calls for the current target
- `emit_push_reg()`, `emit_pop_reg()`, `emit_push_float_reg()`, `emit_pop_float_reg()`, `emit_push_reg_pair()`, `emit_pop_reg_pair()`, and `emit_push_result_value()` manage the temporary argument stack without hardcoding ARM64 push/pop forms in each call path
- `emit_reserve_temporary_stack()`, `emit_temporary_stack_address()`, and `emit_load_temporary_stack_slot()` now also back the FFI extern-call path, where borrowed C-string temporaries are tracked and released after the foreign call returns
- `emit_release_temporary_stack()` and `emit_store_zero_to_local_slot()` centralize target-specific stack cleanup and zero-initialization details
- `emit_store_process_args_to_globals()`, `emit_enable_heap_debug_flag()`, `emit_copy_frame_pointer()`, and `emit_exit()` cover the `_main` bootstrap/teardown path without hardcoding process-entry registers or exit sequences in the higher-level driver

That keeps target-specific ABI work focused inside `abi/` instead of scattering `call`, `blr`, `add sp`, `rsp`, or zero-register assumptions across function, closure, callable, and method dispatch code.

The same `abi/` layer now also owns symbol-slot plumbing for compiler-managed globals such as `_gvar_*`, `_static_*`, `_exc_*`, `_global_*`, and the high-frequency runtime symbols used by string builders, heap bookkeeping, and GC state such as `_concat_off`, `_heap_*`, and `_gc_*`: computing symbol addresses, moving result registers into symbol storage, loading symbol storage back into result registers, and copying local frame slots into symbol-backed storage during epilogues. Extern globals now use the same boundary too, so GOT/GOTPCREL address materialization lives in `abi/` instead of being open-coded separately in expression and statement lowering.

### `emit_store(emitter, type, offset)`

Stores the current result to a stack variable. Uses `store_at_offset()` internally to handle large offsets:

| Type | What it stores |
|---|---|
| `Int` / `Bool` / `Resource` | `stur x0, [x29, #-offset]` (or 2-insn sequence for large offsets) |
| `Float` | `stur d0, [x29, #-offset]` |
| `Str` | `bl __rt_str_persist`, then `stur x1, [x29, #-offset]` + `stur x2, [x29, #-(offset-8)]` |
| `Array` / `AssocArray` / `Iterable` | `stur x0, [x29, #-offset]` |
| `Mixed` | `stur x0, [x29, #-offset]` |
| `Object` | `stur x0, [x29, #-offset]` |
| `Callable` / `Pointer` | `stur x0, [x29, #-offset]` |
| `Buffer` / `Packed` / `Union` | `stur x0, [x29, #-offset]` |

### `emit_load(emitter, type, offset)`

Loads a stack variable into result registers (inverse of store). Uses `load_at_offset()` internally.

### `emit_write_stdout(emitter, type)`

Emits code to print a value to stdout:

| Type | How it prints |
|---|---|
| `Str` | move the string pointer/length into `__rt_stdout_write`'s convention, then `bl __rt_stdout_write` |
| `Int` | `bl __rt_itoa` → then write |
| `Float` | `bl __rt_ftoa` → then write |
| `Bool` | `true` prints "1", `false` prints nothing |
| `Pointer` | `bl __rt_ptoa` → then write |
| `Mixed` | `bl __rt_mixed_write_stdout` → inspect boxed runtime tag, then write |
| `Void`/`Array`/`AssocArray`/`Callable`/`Object` | Prints nothing |

The terminal write itself goes through one shared runtime indirection, `__rt_stdout_write(ptr, len)` (byte pointer in `x0`/`rdi`, length in `x1`/`rsi`). It performs the platform `write(1, ptr, len)` syscall directly. In `--web` builds it first checks the `_elephc_web_capture` flag and, when capture is enabled, hands the bytes to `elephc_web_write` instead so per-request response bodies can be captured; non-web binaries never reference the web symbols. (The `Mixed` / `Resource` / `Iterable` writers still issue their own syscalls and bypass this indirection.)

For Linux `x86_64`, the same write path now follows the SysV ABI and a broad native runtime slice rather than AArch64-specific helper sequences. String results use the Linux syscall register layout, integer and float echo go through x86_64 `__rt_itoa` / `__rt_ftoa`, `_main` initializes `$argc` / `$argv` only when needed, and the bootstrap runtime now covers a wide set of array, string, math, filesystem, FFI, enum, exception, GC, and mixed-value helpers without leaking AArch64-only assumptions back into the higher-level walkers.

That same bootstrap system slice now also includes x86_64-native `time()` / `microtime(true)` through libc `gettimeofday()`, target-aware `php_uname()` through libc `uname()`, plus package-version lowering for `phpversion()` and constant-string lowering for `sys_get_temp_dir()` via the shared symbol-address ABI helpers instead of ARM64-only `adrp` / `add_lo12` sequences.

The x86_64 math surface is broader now too: the libc-backed float builtin family (`sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `sinh`, `cosh`, `tanh`, `exp`, `log`, `log2`, `log10`, `atan2`, `hypot`, `pow`) and the pure float helpers (`sqrt`, `pi`, `deg2rad`, `rad2deg`, `min`, `max`) all use SysV floating-point registers plus the shared temporary-stack ABI helpers instead of raw AArch64 `d0` / `scvtf` / `str d0` lowering. The same applies to the `**` operator in expression codegen, which now routes through the x86_64 `pow()` libc call path with the right floating argument order. The scalar random helpers (`rand()`, `mt_rand()`, `random_int()`) also live on that target-aware ABI path now, so their `[min, max]` range materialization no longer emits raw AArch64 stack spills on Linux x86_64. Comparator-driven indexed-array sorting is on that same path too: `usort()`, `uasort()`, and `uksort()` now resolve callback addresses through the shared symbol/stack ABI helpers and dispatch through an x86_64 `__rt_usort` bubble-sort runtime instead of hard-coded ARM64 `adrp` / `blr` sequences.

## Function codegen

**Files:** `src/codegen/functions/mod.rs`, `src/codegen/functions/`

### `emit_function()`

Compiles a user-defined function:

1. **Collect local variables** — scan the function body to find all variables and their types
2. **Calculate stack frame size** — 16-byte aligned, includes space for all locals
3. **Emit prologue** — call the shared ABI frame helper
4. **Store parameters** — lower incoming arguments through the ABI helpers into stack slots, marking by-value heap params as `Owned` and by-reference params as borrowed aliases of the caller's storage
5. **Emit body** — all statements
6. **Emit epilogue** — preserve return registers, save static locals back to BSS through the shared ABI storage helpers, clean up only `Owned` + `epilogue_cleanup_safe` heap locals, then call the shared ABI frame-restore helper and `ret`

### Pass by reference

```php
function increment(&$val) {
    $val++;
}
```

When a parameter is declared with `&`, the codegen passes the **stack address** of the argument instead of its value:

1. At the call site: the address of the argument's stack slot is computed (`sub x_n, x29, #offset`) and passed in the argument register.
2. In the function prologue: the address is stored in the parameter's stack slot (it holds a pointer, not a value).
3. On reads: the codegen dereferences the pointer (`ldr x0, [x0]`) to get the actual value.
4. On writes: the codegen stores through the pointer (`str x0, [addr]`), modifying the caller's variable directly.

The context tracks which parameters are pass-by-reference via `ctx.ref_params`.