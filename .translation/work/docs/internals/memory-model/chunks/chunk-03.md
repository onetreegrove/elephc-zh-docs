### Hashing and collision resolution

String keys are normalized before lookup or insertion: PHP integer-form numeric strings become integer keys, while leading-zero strings such as `"01"` remain string keys. String keys are hashed with **FNV-1a** (fast, good distribution for short strings); integer keys use a scalar integer mix. Collisions are resolved by **linear probing** — if slot `hash % capacity` is occupied, try `(hash + 1) % capacity`, and so on.

Entry address: `base + 40 + (slot_index × 64)`

### Iteration order

Lookup still probes physical buckets, but iteration walks the `head -> next -> ... -> tail` chain. The header `val_type` is only a summary now; correctness-critical paths read each entry's `value_tag`. This preserves PHP insertion order across:

- `foreach` on associative arrays
- `array_keys()` and `array_values()`
- `array_search()` / `in_array()` when duplicate values exist
- `json_encode()` on associative arrays
- Rehashing during growth and copy-on-write cloning

### Comparison with indexed arrays

| | Indexed array | Associative array |
|---|---|---|
| Header | 24 bytes | 40 bytes |
| Element size | 8 or 16 bytes | 64 bytes (fixed) |
| Access | O(1) by index | O(1) average by hash |
| Iteration | Sequential | Insertion-order linked walk over occupied slots |
| Keys | Implicit (0, 1, 2, ...) | Explicit strings |

## Object layout

Objects are heap-allocated with a fixed layout determined at compile time. Each object starts with an 8-byte class identifier, followed by 16 bytes per property across the full inheritance chain:

```
_heap_buf + offset:
┌──────────┬──────────────────┬──────────────────┬─────┐
│ class_id │   prop[0] (16B)  │   prop[1] (16B)  │ ... │
│ (8 bytes)│                  │                  │     │
└──────────┴──────────────────┴──────────────────┴─────┘
 offset+0    offset+8           offset+24          ...
```

| Field | Size | Description |
|---|---|---|
| `class_id` | 8 bytes | Identifies which class this object belongs to |
| `prop[n]` | 16 bytes | Property value (16 bytes regardless of type, for uniform offsets) |

Total object size: `8 + (num_properties × 16)`

Property access is O(1) — the compiler resolves each property's final inherited offset at compile time and emits a direct load/store at that offset. No runtime lookup or hash table is needed.

Unlike arrays, objects are not resizable. The number of properties is fixed by the class declaration. Properties are stored in parent-first order, then by the child class's own declarations.

## Generator frame layout

`Generator` objects are heap-allocated object-kind blocks with a fixed custom header, followed by generator-specific parameter/local slots. The first word is still a class id, so ordinary `instanceof Generator` and `Iterator` checks work, but the rest of the payload is interpreted by the generated resume function and `__rt_gen_*` runtime helpers rather than by property metadata.

```
Offset  Size  Field
  0      8    class_id
  8      8    resume_fn_ptr
 16      4    state_idx
 20      4    flags (bit 0 = rewound, bit 1 = terminated)
 24      8    auto_key_counter
 32      8    last_key boxed Mixed pointer
 40      8    last_value boxed Mixed pointer
 48      8    return_value boxed Mixed pointer
 56      8    sent_value boxed Mixed pointer
 64      8    delegated_iter pointer used by `yield from`
 72      8    layout_id
 80      ...  parameter and local slots, 8 bytes each
```

The Mixed fields own boxed cells while present. When a generator frame is released, object deep-free detects `_generator_class_id` and releases `last_key`, `last_value`, `return_value`, `sent_value`, and any active delegated iterator through the same refcounted runtime paths used elsewhere.

## The data section

String literals and float constants are embedded directly in the binary:

```asm
.data
_str_0: .ascii "Hello, world!\n"
_str_1: .ascii "Error: "
.align 3
_float_0: .quad 0x400921FB54442D18    ; 3.14159...
_float_1: .quad 0x4000000000000000    ; 2.0
```

- Strings are stored as raw bytes (no null terminator — length is known at compile time)
- Floats are stored as 64-bit IEEE 754 bit patterns
- Identical literals are deduplicated (two `"hello"` in source = one `_str_0` in binary)

These are **read-only** — the program never modifies them. When a string operation needs to work with a literal, it reads from the data section and writes the result to the [string buffer](#the-string-buffer).

The runtime data layer is split into fixed shared data, user-program data, and dynamic `instanceof` lookup formatting under `src/codegen/runtime/data/`. Together they emit these static data tables:

- `_fmt_g` — printf format string for float-to-string conversion (`%.14G`)
- `_b64_encode_tbl` — 64-byte Base64 encoding lookup table
- `_b64_decode_tbl` — 256-byte Base64 decoding lookup table
- `_spl_autoload_exts_default`, `_spl_autoload_exts_ptr`, `_spl_autoload_exts_len` — mutable SPL autoload extension state
- `_heap_err_msg`, `_arr_cap_err_msg`, `_ptr_null_err_msg` — fatal runtime error strings
- `_buffer_bounds_msg`, `_buffer_uaf_msg`, `_match_unhandled_msg`, `_static_prop_private_access_msg`, `_instanceof_target_type_msg`, `_iterable_unsupported_kind_msg` — fatal runtime error strings for buffers, `match`, late-bound private static-property access, dynamic `instanceof` target validation, and iterable dispatch
- `_fiber_msg_*` — Fiber state-error message strings used when constructing `FiberError`
- `_rt_diag_suppression`, `_diag_fopen_failed_msg`, `_diag_file_get_contents_failed_msg`, `_diag_define_already_defined_msg` — runtime warning suppression depth and warning strings used by `@`
- `_resource_id_prefix` — prefix used by resource display helpers
- `_php_uname_mode_len_msg`, `_php_uname_mode_value_msg` — fatal `php_uname()` diagnostics for invalid mode arguments
- `_filetype_*`, `_stat_key_*`, `_dirname_*`, `_pathinfo_key_*`, `_tmpfile_template` — file metadata, path, stat-array, and temporary-file lookup strings used by I/O helpers
- `_locale_utf8_name`, `_locale_env_name` — locale selectors used by runtime helpers that need host locale fallback
- `_json_true`, `_json_false`, `_json_null` — JSON keyword strings (4, 5, and 4 bytes) used by `json_encode` for boolean and null values
- `_json_int_max_str`, `_json_int_min_str` — decimal threshold strings used by `JSON_BIGINT_AS_STRING`
- `_json_err_msg_0` ... `_json_err_msg_10`, `_json_err_msg_table`, `_json_err_msg_count`, `_json_err_loc_prefix`, `_json_err_loc_colon` — `json_last_error_msg()` message lookup data and decode-location suffix fragments
- `_day_names` — 84-byte table (7 entries x 12 bytes each) with day names, lengths, and padding. Used by `date()` for day-of-week formatting
- `_month_names` — 144-byte table (12 entries x 12 bytes each) with month names, lengths, and padding. Used by `date()` for month formatting
- `_strtotime_keyword_tab`, `_strtotime_unit_tab` — keyword, weekday, modifier, and unit lookup tables used by `strtotime()`
- `_instanceof_target_count`, `_instanceof_target_entries`, `_instanceof_name_*` — case-insensitive class/interface name metadata for dynamic `instanceof` string targets, including leading-backslash aliases
- `_generator_class_id` — per-program class id used to recognize Generator frames during object deep-free
- `_json_exception_class_id`, `_stdclass_class_id` — per-program class ids used by JSON throw paths and stdClass dynamic-property helpers
- `_class_gc_desc_count`, `_class_gc_desc_ptrs`, `_class_gc_desc_<id>` — per-class property traversal descriptors used by object deep-free and cycle collection
- `_class_json_desc_ptrs`, `_class_json_desc_<id>`, `_class_json_pname_<id>_<slot>` — per-class JSON descriptors used by object encoding and JsonSerializable dispatch
- `_class_attribute_count`, `_class_attribute_ptrs`, `_class_attributes_<id>` — per-class PHP attribute metadata emitted from `ClassInfo`; current helper and Reflection APIs materialize supported static lookups during codegen instead of performing dynamic runtime class/member lookup
- `_class_vtable_ptrs`, `_class_vtable_<id>` — per-class virtual tables used for inherited instance-method dispatch
- `_class_static_vtable_ptrs`, `_class_static_vtable_<id>` — per-class static-method tables used for late static binding
- `_class_destruct_ptrs` — class_id-indexed `__destruct` method pointers (or `0`) consulted during object deep-free
- `_classes_by_name`, `_classes_by_name_count` — case-insensitive class-name lookup table used by `new $variable()` instantiation
- enum-case `.comm` symbols produced via `enum_case_symbol(...)` — one 8-byte singleton storage slot per declared enum case

### Global variables

Two 8-byte BSS slots store the program's command-line arguments:

```asm
.comm _global_argc, 8       ; saved argc from OS
.comm _global_argv, 8       ; saved argv pointer from OS
```

These are written once in `_main` (from the OS-provided `x0` and `x1`) and read by the `__rt_build_argv` routine to construct `$argv`.

### User global variables (`global $var`)

When a function uses `global $var`, the compiler allocates BSS storage for that variable:

```asm
.comm _gvar_x, 16, 3        ; 16 bytes for global $x (enough for string ptr+len or int/float)
.comm _gvar_y, 16, 3        ; 16 bytes for global $y
```

Each global variable gets 16 bytes of BSS storage (enough to hold any PHP value). The `_main` scope writes to these slots when assigning to variables that any function declares as `global`, and functions read/write through these slots instead of using local stack slots.

### Enum case singleton storage

User-defined enums also contribute BSS storage. During `emit_runtime_data_user()`, the compiler emits one 8-byte `.comm` symbol per declared case, using the mangled name from `enum_case_symbol(...)`.

These slots let enum cases behave like stable singleton values at runtime: codegen can load the canonical case address directly, and helper paths such as `Enum::from()` can compare or return those canonical case objects without constructing ad-hoc heap values.

### Static variables (`static $var`)

Static variables persist their value across calls to the same function. Each static variable gets two BSS allocations:

```asm
.comm _static_counter_count, 16, 3    ; 16 bytes for the persisted value
.comm _static_counter_count_init, 8, 3 ; 8-byte init flag (0 = uninitialized)
```

The naming pattern is `_static_FUNCNAME_VARNAME`. The init flag ensures the initial value expression is evaluated only on the first call. At function epilogue, variables marked as static are saved back to their BSS storage.

### Static properties (`ClassName::$prop`)

Static properties are class-scoped storage rather than object fields. During `emit_runtime_data_user()`, each effective declaring class property gets one 16-byte BSS slot:

```asm
.comm _static_prop_Counter_count, 16, 3 ; 16 bytes for Counter::$count
```

The naming pattern comes from `static_property_symbol(...)`. Inherited static properties point back to the declaring class slot, so `Base::$count` and `Child::$count` share storage when the property is declared only on `Base`. When a subclass redeclares the static property, that subclass receives its own slot and `static::$count` dispatches to it through the called-class id at runtime. `_main` evaluates static-property defaults before user statements run, and later reads/writes load from or store to the resolved slot directly.