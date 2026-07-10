elephc manages memory without calling `malloc`/`free` for PHP values directly. Storage lives on the **stack** (automatic, per-function), in fixed BSS regions, or in a compiler-managed **heap buffer** with a free-list allocator, reference counting, and a targeted cycle collector for array/hash/object graphs. The final binary still links the target platform's system C library for OS and libc services.

This page explains where every value lives in memory at runtime.

## Runtime memory regions

```
┌─────────────────────────────┐  High addresses
│         Stack                │  ← grows downward (sp decreases)
│  (function frames, locals)   │
├─────────────────────────────┤
│         (unused)             │
├─────────────────────────────┤
│       Heap buffer            │  _heap_buf: 8MB default (--heap-size)
│  (arrays, hash tables,       │  Free-list + bump allocator
│   objects, persisted strings) │
├─────────────────────────────┤
│     String buffer            │  _concat_buf: 64KB, scratch pad
│  (temporary string results)  │  Reset at each statement
├─────────────────────────────┤
│     I/O and stream buffers   │  _cstr_buf/_cstr_buf2, _eof_flags,
│  (C strings, streams, TLS,   │  _stream_*, _http_*, _ftp_*, wrapper/filter
│   wrappers, filters)         │  tables, protocol/service/principal lookup buffers
├─────────────────────────────┤
│   Runtime metadata (BSS)     │  _concat_off, _global_argc/_argv,
│  (heap state, counters,      │  _heap_off, _heap_free_list,
│   globals, static storage)   │  _heap_small_bins, _heap_debug_enabled,
│                              │  _gc_allocs/_frees/_live/_peak,
│                              │  _gc_collecting/_gc_release_suppressed,
│                              │  _exc_handler_top, _exc_call_frame_top,
│                              │  _exc_value, _rt_diag_suppression,
│                              │  _json_last_error, _json_active_*,
│                              │  _json_indent_depth, _json_validate_*,
│                              │  _json_decode_assoc, _json_error_*,
│                              │  _fiber_current, _fiber_main_saved_*,
│                              │  _generator_class_id,
│                              │  _include_once_*, _fn_variant_active_*,
│                              │  _elephc_crypto_*_fn, _elephc_tls_*_fn, ...
├─────────────────────────────┤
│       Data section           │  String literals, float constants
│  (.data — read-only)         │
├─────────────────────────────┤
│       Code section           │  Instructions
│  (.text — executable)        │
└─────────────────────────────┘  Low addresses
```

## The stack

The stack is the primary storage for local variables. See [Introduction to ARM64 Assembly](arm64-assembly.md#the-stack-function-local-storage) for the basics.

### Stack frame layout

Each function has a stack frame. The [code generator](the-codegen.md) calculates the size during compilation by counting all local variables:

```
                         x29 (frame pointer)
                          │
                          ▼
┌────────────┬────────────┬────────────┬────────────┐
│  saved x29 │  saved x30 │   $x (8B)  │   $y (8B)  │ ...
└────────────┴────────────┴────────────┴────────────┘
  [x29, #0]    [x29, #8]   [x29, #-8]   [x29, #-16]
```

- `x29` and `x30` are saved at the top of the frame (positive offsets from `x29`)
- Local variables live at **negative offsets** from `x29`
- Strings take **two slots** (16 bytes): pointer at `[x29, #-offset]`, length at `[x29, #-(offset-8)]`
- The total frame size is always 16-byte aligned (ARM64 ABI requirement)

On the EIR backend the frame also reserves one save slot per callee-saved register that the linear-scan register allocator uses, and short-lived scalar SSA temporaries may live in registers instead of a stack slot. PHP local variables themselves are still slot-backed as shown above. See [The IR](the-ir.md) for the register allocation pass.

### Variable allocation

Variables are allocated stack slots when the [code generator](the-codegen.md) scans the function body (`collect_local_vars`). The allocation is determined at compile time — there's no dynamic stack growth.

For heap-backed values, stack slots also carry compile-time ownership metadata in codegen: `Owned`, `Borrowed`, `MaybeOwned`, or `NonHeap`. This metadata is not stored in the generated binary; it only guides when codegen must retain a borrowed heap value before storing it into a new owner, and which local aliases must not be blindly decreffed yet.

| Type | Stack space | Stored as |
|---|---|---|
| `Int` | 8 bytes | Signed 64-bit value |
| `Float` | 8 bytes | IEEE 754 double |
| `Bool` | 8 bytes | 0 or 1 (stored as 64-bit for alignment) |
| `Str` | 16 bytes | 8-byte pointer + 8-byte length |
| `Array` | 8 bytes | Pointer to heap-allocated header |
| `AssocArray` | 8 bytes | Pointer to heap-allocated hash table |
| `Iterable` | 8 bytes | Type-erased heap pointer for arrays or Traversable objects |
| `Mixed` | 8 bytes | Pointer to heap-allocated boxed mixed cell |
| `Void` (null) | 8 bytes | Sentinel value `0x7FFFFFFFFFFFFFFE` |
| `Object` | 8 bytes | Pointer to heap-allocated object |
| `Callable` | 8 bytes | Function pointer |
| `Pointer` | 8 bytes | Raw 64-bit address |
| `Resource` | 8 bytes | Native resource payload, such as a stream descriptor |
| `Buffer` | 8 bytes | Pointer to buffer header |
| `Packed` | 8 bytes | Metadata-only nominal type, accessed via pointer |
| `Union` | 8 bytes | Boxed runtime-tagged payload (same storage as Mixed) |
| `TaggedScalar` | 16 bytes | 8-byte payload + 8-byte runtime tag (tagged null representation) |

### Null representations

elephc has two representations for PHP `null` in scalar slots, selected per compilation by
`--null-repr=sentinel|tagged` (or `ELEPHC_NULL_REPR`). The tagged representation is the
default; the sentinel is the legacy opt-out.

#### The in-band sentinel (legacy opt-out)

`null` is represented as the integer `0x7FFFFFFFFFFFFFFE` (`PHP_INT_MAX - 1`). Because every
64-bit pattern is a valid PHP int, this sentinel collides with the real integer
`9223372036854775806`, which is misread as `null` by null checks. Before arithmetic
operations, the codegen checks for this sentinel and replaces it with 0:

```asm
; coerce null to zero
movz x9, #0xFFFE
movk x9, #0xFFFF, lsl #16
movk x9, #0xFFFF, lsl #32
movk x9, #0x7FFF, lsl #48
cmp x0, x9
csel x0, xzr, x0, eq      ; if x0 == sentinel, replace with 0
```

See [ARM64 Instruction Reference](arm64-instructions.md#move-and-immediate) for how `movz`/`movk` work.

#### The tagged scalar representation (default)

Under the tagged representation, null-capable scalar slots use an inline two-word
`{payload, tag}` pair (`TaggedScalar`) instead of the in-band sentinel: the payload travels
in the integer result register (`x0`/`rax`) and the runtime tag in the adjacent register
(`x1`/`rdx`), mirroring the string pointer/length convention. The tag reuses the runtime
value tag scheme (0 = int, 8 = null), so a tagged scalar is word-compatible with a boxed
Mixed cell's tag/payload words. On the stack the payload sits at `offset` and the tag at
`offset - 8`.

Null-capable producers — miss-capable int array reads, `array_pop`/`array_shift` on int
arrays — yield a tagged scalar; consumers (`echo`, `var_dump`, `is_null`, `??`, `??=`,
`isset`, `empty`, `gettype`, casts, arithmetic narrowing, `===` through the Mixed boxing
path) dispatch on the tag word. A plain non-nullable `Int` is statically never null, so its
sentinel checks disappear entirely and the full 64-bit range round-trips:

```asm
; null check on a tagged scalar
cmp x1, #8                ; runtime tag 8 = PHP null
b.eq value_is_null
```

A tagged null carries the legacy sentinel as its payload word, so boxing it into a Mixed
cell produces exactly the legacy `{tag 8, sentinel}` words and un-audited consumers degrade
to the legacy behavior. `?int` parameters, returns, and properties keep their boxed Mixed
representation under both modes.

### Pointer values

Pointers are stored as raw 64-bit addresses. An opaque pointer and a typed `ptr<T>` value have the same runtime representation; the type tag only exists in the checker. Null pointers use address `0x0`, and dereference helpers explicitly trap on null via `__rt_ptr_check_nonnull`.

### Fiber stacks and scheduler state

`Fiber` objects own native stacks rather than borrowing the caller's stack. The runtime allocates each fiber stack through `mmap` (256 KiB usable by default, plus the guard page), protects the bottom 16 KiB with `mprotect(PROT_NONE)` as a guard page, and stores both the mapping base and total mapped size in the Fiber object so `__rt_fiber_free_stack` can later return it with `munmap`.

The currently running fiber is tracked in `_fiber_current`. When execution switches away from the main stack, `_fiber_main_saved_sp`, `_fiber_main_saved_exc`, and `_fiber_main_saved_call_frame` preserve the main stack pointer, exception-handler chain, and activation-record cleanup chain. A suspended Fiber stores the same state inside its object payload (`saved_sp`, `own_exc_head`, and `own_call_frame`), so `__rt_fiber_switch` can swap between main and fiber contexts without mixing exception or cleanup chains.

## The string buffer (scratch pad)

```asm
.comm _concat_buf, 65536    ; 64KB scratch buffer
.comm _concat_off, 8        ; current write offset (reset per statement, to the frame base)
```

The string buffer (`_concat_buf`) is a 64KB scratch region used by all string operations — `itoa`, `ftoa`, `concat`, `strtolower`, `str_replace`, etc. Each operation writes its result at the current offset and advances the offset.

**The buffer is reset at the start of every statement — to the frame's inherited base, not necessarily 0.** Strings in the buffer are temporary: they live only for the duration of one statement's evaluation, *plus* (for an argument passed into a call) the lifetime of the callee. See [Cross-call slice arguments](#cross-call-slice-arguments) below.

### How it works

Within a single statement like `echo strtolower("HELLO") . " " . $name;`:

```
_concat_buf:
┌──────────┬──────────┬──────────────┬──────────────────┐
│  "hello" │  " "     │  "hello Joe" │  (free space)    │
└──────────┴──────────┴──────────────┴──────────────────┘
 offset=0    offset=5   offset=6      _concat_off = 17
```

Each sub-expression writes its result further into the buffer. After the statement completes (echo writes to stdout), the next statement resets `_concat_off` back to the current frame's base offset (0 in `main`).

### Cross-call slice arguments

A string operation returns a *borrowed slice* into `_concat_buf` (a pointer + length), not a heap copy. When such a slice is passed **as an argument** to a function, method, or closure, the callee runs its own statements — and resetting `_concat_off` all the way to 0 would overwrite the caller's slice bytes before the callee could read them.

To prevent that, each frame records, on entry, the `_concat_off` value it inherited from the caller (the high-water mark below which the caller's live slices sit). That value is the frame's **base**: per-statement resets restore `_concat_off` to the base rather than 0, so the callee's own concatenations append *above* the caller's slices instead of clobbering them. `main` (and other root contexts) have a base of 0, so their behaviour is unchanged. The cursor is also saved/restored around each nested call so the caller can keep concatenating after the call returns.

A consequence is that `_concat_buf` usage grows with the depth of nested calls that are *holding live slice arguments* (each frame reserves its caller's region). In practice this depth is shallow; deeply recursive string builders that would accumulate are a separate, pre-existing compile-time limitation, so the 64KB budget is not a concern for ordinary code.

### Copy-on-store

When a string result is stored to a variable (e.g., `$x = "a" . "b";`), the codegen calls `__rt_str_persist` which copies the string from the concat buffer to the **heap**. This ensures:

- **Variables always point to heap memory**, never into the scratch buffer
- **The buffer can safely reset** without invalidating stored values
- **Hash table keys** are also persisted to heap (via `str_persist`)