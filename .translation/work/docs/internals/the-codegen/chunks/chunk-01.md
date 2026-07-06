**Source:** default backend `src/ir_lower/`, `src/ir/`, and `src/codegen_ir/`; shared target/runtime infrastructure under `src/codegen/abi/`, `src/codegen/runtime/`, `src/codegen/platform/`, `src/codegen/emit.rs`, and `src/codegen/data_section.rs`; frozen legacy AST backend under `src/codegen/expr.rs`, `src/codegen/expr/`, `src/codegen/stmt.rs`, `src/codegen/stmt/`, `src/codegen/functions/`, and `src/codegen/builtins/`; intrinsic method registry: `src/intrinsics.rs`

The code generator (codegen) is the heart of the compiler. The default path lowers the checked and optimized AST into EIR first, then emits native assembly text for the selected target from that EIR. The temporary `--ast-backend` fallback still walks the checked AST directly and emits assembly while the legacy emitter remains in-tree.

elephc currently supports more than one backend. AArch64 is still the clearest reference path in the codebase and in this document, while Linux `x86_64` is also a supported backend that goes through the same high-level lowering pipeline.

Most snippets below use AArch64 because the instruction forms are compact and the surrounding docs already explain them in detail. When a section talks about target-specific ABI or runtime behavior, it calls out Linux `x86_64` explicitly.

For an introduction to AArch64, see [Introduction to ARM64 Assembly](arm64-assembly.md).

## Overview

In the default path, `src/ir_lower/` walks the checked optimized AST, produces validated EIR, and `src/codegen_ir/` emits assembly for each EIR function, instruction, and terminator. The CLI's main output is the **user program assembly**; the shared runtime helpers are usually assembled separately and reused from the runtime object cache. The user-facing `.s` file still has this structure:

```asm
.global _main
.align 2

; --- user-defined functions ---
_fn_factorial:
    ...
    ret

; --- class methods ---
_method_Point_move:
    ...
    ret

; --- main program ---
_main:
    ; prologue (stack frame setup)
    ; global argc/argv initialization
    ; program statements
    ; epilogue (exit syscall)

; --- deferred closures emitted after _main ---
_closure_1:
    ...
    ret

; --- data section ---
.data
_str_0: .ascii "hello"
_float_0: .quad 0x400921FB54442D18

; --- source markers used by --source-map ---
; @src line=12 col=5
```

Trait composition does not add a separate runtime dispatch layer. Traits are flattened into each concrete class during type checking, then inheritance metadata is layered on top. Codegen still emits `_method_Class_method` / `_static_Class_method` labels, but instance calls now use vtable slots keyed by `class_id` so child overrides work through inherited methods.

The exact directives and symbol decoration vary by target. The example above is intentionally AArch64-flavored, but the same structural phases apply on Linux `x86_64`.

When you call the legacy library-style `codegen::generate(...)` entry point, elephc still exposes both pieces explicitly as `(user_asm, runtime_asm)`. The normal CLI path lowers to EIR, calls `codegen_ir::generate_user_asm_from_ir_with_options(...)`, and links against the runtime-object cache so repeated compiles do not have to reassemble the same shared runtime text every time.

## The Emitter

**File:** `src/codegen/emit.rs`

The `Emitter` is a simple string buffer with helper methods:

| Method | Output |
|---|---|
| `instruction("mov x0, #42")` | `    mov x0, #42\n` (indented) |
| `label("_main")` | `_main:\n` |
| `comment("load variable")` | `    ; load variable\n` |
| `raw(".global _main")` | `.global _main\n` (no indent) |
| `blank()` | `\n` |

All assembly is built as text, then written to the `.s` file.

Statement emission also injects source markers of the form `@src line=<N> col=<M>`. They are ignored by the assembler as comments, but the CLI can later scan them to build a simple source-map sidecar file when `--source-map` is enabled.

## Runtime split, cache, and source maps

The compiler's codegen/runtime handoff now has three distinct artifacts:

1. **User assembly** — emitted by the selected backend into the per-build `.s` file
2. **Runtime object** — assembled from the shared runtime once and cached under `~/.cache/elephc/` (or `XDG_CACHE_HOME`) using the compiler version, target, heap size, and generated runtime assembly hash in the filename
3. **Optional source map** — a JSON sidecar generated from `@src` markers embedded in the user assembly comments

This means normal CLI builds no longer concatenate the runtime text into every output assembly file before assembling. Instead, they:

- prepare or reuse the cached runtime object
- assemble only the user `.s` file into `file.o`
- link `file.o` against the cached runtime object

The source-map file is intentionally simple. Today it stores a list of `(asm_line, php_line, php_col)` entries so tools and humans can correlate generated assembly back to the original PHP statements without needing full DWARF debug info.

The AST optimizer intentionally still runs before backend selection. By the time the default EIR backend runs, constant expressions and some dead control-flow have already been removed, and EIR adds the function-wide value and control-flow shape that the linear-scan register allocator (`src/ir_passes/`, see [The IR](the-ir.md)) and future IR optimizations rely on. The legacy AST backend sees the same optimized AST when `--ast-backend` is selected.

## Emit modes: executable vs cdylib

Codegen runs in one of two emit modes selected by the `--emit` flag. `executable` (the default) produces the standalone-binary shape described throughout this page: a `main` entry point, top-level statements, and a process-exit epilogue. `cdylib` produces a shared library instead: no `main` body is emitted, and after the user functions a set of C-ABI trampolines is appended for every `#[Export]`-marked function plus the four `elephc_*` lifecycle entry points (see [Shared Libraries](../beyond-php/cdylib.md)).

Cdylib emission also switches the emitter into position-independent mode (`pic_data_refs`): global data references emitted through the `abi::symbols` helpers resolve through the GOT (`@GOTPCREL` on x86_64, `:got:`/`:got_lo12:` on AArch64) instead of direct PC-relative addressing, and the runtime object is generated and cached separately in a PIC variant. On ELF targets a final pass (`src/codegen/visibility.rs`) appends `.hidden` directives for every internal global so the `.so` exports only its public ABI and internal runtime state cannot be preempted across loaded modules.

## The Context

**File:** `src/codegen/context.rs`

The `Context` tracks state during code generation:

```rust
pub struct Context {
    pub variables: HashMap<String, VarInfo>,  // variable → type + stack offset
    pub stack_offset: usize,                  // next available stack slot
    pub loop_stack: Vec<LoopLabels>,          // for break/continue
    pub return_label: Option<String>,         // for early returns
    pub functions: HashMap<String, FunctionSig>,
    pub function_variant_groups: HashSet<String>, // include-loaded function dispatchers
    pub deferred_closures: Vec<DeferredClosure>, // closures emitted after current function
    pub deferred_fiber_wrappers: Vec<DeferredFiberWrapper>,
    pub deferred_callback_wrappers: Vec<DeferredCallbackWrapper>,
    pub constants: HashMap<String, (ExprKind, PhpType)>, // compile-time constants
    pub global_vars: HashSet<String>,         // globals active in current scope
    pub static_vars: HashSet<String>,         // statics active in current scope
    pub ref_params: HashSet<String>,          // pass-by-reference params
    pub local_ref_cell_flags: HashMap<String, LocalRefCellFlag>, // compiler-created ref cells
    pub in_main: bool,                        // whether we're compiling top-level code
    pub all_global_var_names: HashSet<String>,
    pub all_static_vars: HashMap<(String, String), PhpType>,
    pub closure_sigs: HashMap<String, FunctionSig>,
    pub callable_param_sigs: HashMap<(String, String), FunctionSig>,
    pub closure_captures: HashMap<String, Vec<(String, PhpType, bool)>>,
    pub runtime_callable_builtin_wrappers: HashMap<String, String>,
    pub runtime_callable_extern_wrappers: HashMap<String, String>,
    pub runtime_callable_static_method_wrappers: HashMap<String, String>,
    pub first_class_callable_targets: HashMap<String, CallableTarget>,
    pub variable_fcc_label: HashMap<String, String>,
    pub classes: HashMap<String, ClassInfo>,
    pub interfaces: HashMap<String, InterfaceInfo>,
    pub traits: HashSet<String>,
    pub enums: HashMap<String, EnumInfo>,
    pub packed_classes: HashMap<String, PackedClassInfo>,
    pub current_class: Option<String>,
    pub extern_functions: HashMap<String, ExternFunctionSig>,
    pub extern_classes: HashMap<String, ExternClassInfo>,
    pub extern_globals: HashMap<String, PhpType>,
    pub return_type: PhpType,
    pub activation_prev_offset: Option<usize>,
    pub activation_cleanup_offset: Option<usize>,
    pub activation_frame_base_offset: Option<usize>,
    pub pending_action_offset: Option<usize>,
    pub pending_target_offset: Option<usize>,
    pub nested_concat_offset_offset: Option<usize>,
    pub pending_return_value_offset: Option<usize>,
    pub try_slot_offsets: Vec<usize>,
    pub next_try_slot_idx: usize,
    pub finally_stack: Vec<FinallyContext>,
}
```

Each variable has a `VarInfo`:

```rust
pub struct VarInfo {
    pub ty: PhpType,                  // current runtime storage type
    pub static_ty: PhpType,           // declared/static type retained for checks and calls
    pub stack_offset: usize,          // offset from frame pointer (x29)
    pub ownership: HeapOwnership,     // NonHeap / Owned / Borrowed / MaybeOwned
    pub epilogue_cleanup_safe: bool,  // false for locals populated through still-ambiguous control-flow/alias paths
}
```

`HeapOwnership` is a codegen-only ownership lattice used for heap-backed values flowing through stack slots:

- `NonHeap` — integers, floats, bools, null, resources, raw pointers
- `Owned` — this slot definitely owns the current heap-backed value
- `Borrowed` — this slot currently aliases heap storage owned elsewhere
- `MaybeOwned` — control flow merged heap-backed paths with different ownership states

The lattice is now threaded through the main local-variable paths. Function epilogues re-enable cleanup only for slots classified as `Owned` and still marked `epilogue_cleanup_safe`; locals coming from still-ambiguous control-flow or aliasing paths are intentionally skipped. Special aliases such as `$this`, by-reference params, globals, and statics are explicitly kept out of epilogue cleanup because the current frame does not own their storage. Builtins that duplicate containers now also dispatch to dedicated `_refcounted` runtime helpers when their element/value types are heap-backed, so nested array/hash/object/string payloads are retained before the new container becomes an owner.

The exception-related fields let codegen thread `try` / `catch` / `finally` through non-local control flow. Function and `_main` frames publish activation records into the runtime cleanup stack, pre-allocate handler slots for `setjmp` buffers, and use `finally_stack` plus the `pending_*` slots to defer `return`, `break`, and `continue` until the innermost `finally` body has run.

### Label generation

`ctx.next_label("while")` produces `_while_1`, `_while_2`, etc. A global atomic counter ensures labels never collide across functions or compilation units.

## The Data Section

**File:** `src/codegen/data_section.rs`

String literals and float constants are stored in the `.data` section:

```rust
pub struct DataSection {
    entries: Vec<(String, Vec<u8>)>,          // string label → bytes
    float_entries: Vec<(String, u64)>,        // float label → bit pattern
    counter: usize,                           // next unique label suffix
    dedup: HashMap<Vec<u8>, String>,          // avoid duplicate strings
    float_dedup: HashMap<u64, String>,        // avoid duplicate floats
}
```

When the codegen encounters `"hello"`, it calls `data.add_string(b"hello")` which returns a label (`_str_0`) and length (`5`). Identical strings are deduplicated — two `"hello"` literals share the same label.

Floats are stored as their raw 64-bit IEEE 754 bit patterns (`.quad` directive).