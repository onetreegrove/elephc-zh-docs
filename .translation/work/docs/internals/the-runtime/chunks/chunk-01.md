**Source:** `src/codegen/runtime/` — `mod.rs`, `emitters.rs`, `data/`, `strings/`, `arrays/`, `buffers/`, `callables/`, `exceptions.rs`, `exceptions/`, `io/`, `objects/`, `spl/`, `system/`, `pointers/`, `fibers/`, `generators/`

The runtime is a collection of **hand-written assembly routines** that handle operations too complex for inline code generation. When the [code generator](the-codegen.md) needs to convert an integer to a string or concatenate two strings, it emits a `bl __rt_itoa` or `bl __rt_concat` — a call to a runtime routine.

These routines end up in every compiled binary. In the CLI flow they are usually pre-assembled into the cached runtime object rather than textually appended to each user `.s` file, but they are still part of the final executable rather than an external shared dependency.

## Why a runtime?

Some operations can't be done with a few inline instructions:

- **Integer to string** (`itoa`): Requires a loop that divides by 10, extracts digits, and writes them right-to-left
- **String concatenation**: Needs to copy bytes from two source strings into a buffer
- **Array operations**: Require heap allocation, bounds checking, and element copying

These are 20-50+ instructions each. Inlining them at every call site would bloat the binary. Instead, they're emitted once and called with `bl`.

## Naming convention

All runtime routines start with `__rt_`:

```
__rt_itoa          integer → string
__rt_resource_to_string resource → "Resource id #N"
__rt_ftoa          float → string
__rt_concat        string + string → string
__rt_str_eq        string == string → bool
__rt_array_new     allocate a new array
__rt_throw_current throw the active exception
__rt_build_argv    build $argv from C strings
```

## Diagnostic routines

**Source:** `src/codegen/runtime/diagnostics.rs`

These helpers implement PHP's `@` error-suppression operator and the runtime warning channel. The suppression depth lives in `_rt_diag_suppression`; while it is non-zero, suppressible warnings are silently dropped instead of written to stderr. They are emitted before any PHP-visible helper so the rest of the runtime can report warnings through a single path.

| Routine | What it does | Input | Output |
|---|---|---|---|
| `__rt_diag_push_suppression` | Enter one nested `@` suppression scope (increment `_rt_diag_suppression`) | — | — |
| `__rt_diag_pop_suppression` | Leave one `@` suppression scope, clamped against underflow | — | — |
| `__rt_diag_warning` | Write a runtime warning string to stderr unless suppression is active | `x1`/`x2` = message string | — |

## String routines

**Source:** `src/codegen/runtime/strings/`

### `__rt_itoa` — Integer to string

**File:** `strings/itoa.rs`

Converts a signed 64-bit integer in `x0` to a decimal string.

**Input:** `x0` = integer value
**Output:** `x1` = pointer to string, `x2` = length

**Algorithm:**

1. Check for negative → set flag, negate
2. Check for zero → output "0" directly
3. Loop: divide by 10 (`udiv` + `msub`), convert remainder to ASCII digit (`+ 48`), store right-to-left
4. Prepend '-' if negative
5. Update concat buffer offset

The digits are written **right-to-left** because division gives us the least significant digit first. The result is written into the [concat buffer](memory-model.md#the-string-buffer-scratch-pad).

### `__rt_resource_to_string` — Resource to string

**File:** `strings/resource_to_string.rs`

Formats the native resource payload used by stream handles as PHP's display string (`Resource id #N`). The helper keeps resources distinct from integers when boxing into `mixed`, while still letting the I/O runtime pass the underlying file descriptor to stream syscalls.

**Input:** `x0` = native resource payload
**Output:** `x1` = pointer to string, `x2` = length

`__rt_resource_write_stdout` uses the same display form for `echo` / `print` without exposing the raw file descriptor as an integer.

### `__rt_ftoa` — Float to string

**File:** `strings/ftoa.rs`

Converts a double-precision float in `d0` to a decimal string. Handles special cases: `INF`, `-INF`, `NAN`. For normal numbers, it separates the integer and fractional parts, converts each to digits, and joins them with a decimal point.

**Input:** `d0` = float value
**Output:** `x1` = pointer to string, `x2` = length

### `__rt_concat` — String concatenation

**File:** `strings/concat.rs`

Concatenates two strings by copying both into the [concat buffer](memory-model.md#the-string-buffer-scratch-pad).

**Input:** `x1`/`x2` = left string (ptr/len), `x3`/`x4` = right string (ptr/len)
**Output:** `x1` = pointer to result, `x2` = total length

**Algorithm:**

1. Get current position in concat buffer
2. Copy left string bytes (byte-by-byte loop)
3. Copy right string bytes
4. Update buffer offset
5. Return pointer to start of result + total length

### `__rt_atoi` — String to integer

**File:** `strings/atoi.rs`

Parses a decimal string into a 64-bit integer. Handles optional leading `-` sign.

**Input:** `x1` = string pointer, `x2` = length
**Output:** `x0` = integer value

### `__rt_str_eq` — String equality

**File:** `strings/str_eq.rs`

Compares two strings byte-by-byte.

**Input:** `x1`/`x2` = first string, `x3`/`x4` = second string
**Output:** `x0` = 1 if equal, 0 if not

**Algorithm:**

1. Compare lengths — if different, return 0 immediately
2. Loop: compare byte by byte
3. If all bytes match, return 1

### Other string routines

Each routine follows the same pattern — inputs in registers, output in standard result registers:

| Routine | What it does | Input | Output |
|---|---|---|---|
| `__rt_strcopy` | Copy string into concat buffer | `x1`/`x2` | `x1`/`x2` |
| `__rt_str_to_number` | Parse a PHP numeric string for loose comparison and numeric-string casts | `x1`/`x2` | numeric payload + success flag |
| `__rt_str_to_int` | Parse a PHP numeric-string prefix (via `__rt_str_to_number`) and truncate toward zero like PHP `(int)` casts | `x1`/`x2` | `x0` (integer) |
| `__rt_str_loose_eq` | Compare two strings using PHP loose-comparison numeric-string rules before falling back to bytes | two strings | `x0` (0 or 1) |
| `__rt_strtolower` | Lowercase conversion | `x1`/`x2` | `x1`/`x2` |
| `__rt_strtoupper` | Uppercase conversion | `x1`/`x2` | `x1`/`x2` |
| `__rt_trim` | Strip whitespace (no args) or chars in mask | `x1`/`x2` | `x1`/`x2` |
| `__rt_ltrim` / `__rt_rtrim` | Strip left/right whitespace or mask | `x1`/`x2` | `x1`/`x2` |
| `__rt_trim_mask` | Strip chars in custom mask from both ends | `x1`/`x2` + mask | `x1`/`x2` |
| `__rt_ltrim_mask` / `__rt_rtrim_mask` | Strip custom mask from left/right | `x1`/`x2` + mask | `x1`/`x2` |
| `__rt_strrev` | Reverse string (byte-wise) | `x1`/`x2` | `x1`/`x2` |
| `__rt_grapheme_strrev` | Reverse a UTF-8 string by grapheme cluster for PHP 8.6 `grapheme_strrev()`; returns false on malformed UTF-8 | `x1`/`x2` | `x1`/`x2` |
| `__rt_strpos` | Find substring | `x1`/`x2` + `x3`/`x4` | `x0` (index or -1) |
| `__rt_strrpos` | Find last occurrence | `x1`/`x2` + `x3`/`x4` | `x0` |
| `__rt_str_repeat` | Repeat N times with heap fallback for large results | `x1`/`x2` + count | `x1`/`x2` |
| `__rt_str_replace` | Replace all occurrences | search + replace + subject | `x1`/`x2` |
| `__rt_explode` | Split by delimiter | delimiter + string | `x0` (array ptr) |
| `__rt_implode` | Join string array with glue | glue + array | `x1`/`x2` |
| `__rt_implode_int` | Join integer array with glue | glue + array | `x1`/`x2` |
| `__rt_strcmp` | Binary comparison | two strings | `x0` (-1, 0, 1) |
| `__rt_strcasecmp` | Case-insensitive compare | two strings | `x0` |
| `__rt_str_starts_with` | Check prefix match | `x1`/`x2` + `x3`/`x4` | `x0` (0 or 1) |
| `__rt_str_ends_with` | Check suffix match | `x1`/`x2` + `x3`/`x4` | `x0` (0 or 1) |
| `__rt_chr` | ASCII code → char | `x0` | `x1`/`x2` |
| `__rt_addslashes` | Escape quotes/backslashes | `x1`/`x2` | `x1`/`x2` |
| `__rt_nl2br` | Insert `<br />` before newlines | `x1`/`x2` | `x1`/`x2` |
| `__rt_bin2hex` | Binary → hex string | `x1`/`x2` | `x1`/`x2` |
| `__rt_hex2bin` | Hex → binary | `x1`/`x2` | `x1`/`x2` |
| `__rt_md5` | MD5 hash | `x1`/`x2` | `x1`/`x2` |
| `__rt_sha1` | SHA1 hash | `x1`/`x2` | `x1`/`x2` |
| `__rt_sprintf` | Format string | format + args on stack | `x1`/`x2` |
| `__rt_base64_encode` | Base64 encode | `x1`/`x2` | `x1`/`x2` |
| `__rt_base64_decode` | Base64 decode | `x1`/`x2` | `x1`/`x2` |
| `__rt_urlencode` | URL encode | `x1`/`x2` | `x1`/`x2` |
| `__rt_urldecode` | URL decode | `x1`/`x2` | `x1`/`x2` |
| `__rt_htmlspecialchars` | HTML escape | `x1`/`x2` | `x1`/`x2` |
| `__rt_html_entity_decode` | Decode HTML entities | `x1`/`x2` | `x1`/`x2` |
| `__rt_rawurlencode` | URL encode (RFC 3986) | `x1`/`x2` | `x1`/`x2` |
| `__rt_stripslashes` | Remove escape backslashes | `x1`/`x2` | `x1`/`x2` |
| `__rt_ucwords` | Uppercase first letter of each word | `x1`/`x2` | `x1`/`x2` |
| `__rt_str_ireplace` | Case-insensitive replace | search + replace + subject | `x1`/`x2` |
| `__rt_substr_replace` | Replace substring at offset | str + replacement + start + len | `x1`/`x2` |
| `__rt_str_pad` | Pad string to length | str + len + pad_str + type | `x1`/`x2` |
| `__rt_str_split` | Split into chunks | str + chunk_len | `x0` (array ptr) |
| `__rt_wordwrap` | Wrap text at word boundaries | str + width + break + cut | `x1`/`x2` |
| `__rt_number_format` | Format number with separators | float + decimals + sep | `x1`/`x2` |
| `__rt_hash` | Hash with algorithm | algo + data | `x1`/`x2` |
| `__rt_hash_init` / `__rt_hash_update` / `__rt_hash_final` | Incremental hash-context API backing `hash_init()` and friends | context + data | context / `x1`/`x2` |
| `__rt_hash_copy` | Clone an incremental hash context | context | context |
| `__rt_hash_ctx_free` | Free a HashContext via `elephc_crypto_free`; the sole destructor, called by `__rt_mixed_free_deep` when a Mixed(tag=9, kind=2) cell is released at scope exit (`hash_final` no longer frees) | context | — |
| `__rt_hash_hmac` | Keyed HMAC over a message | algo + key + data | `x1`/`x2` |
| `__rt_hash_equals` | Constant-time string comparison | two strings | `x0` (0 or 1) |
| `__rt_hash_algos_list` | Build the `hash_algos()` array of supported algorithm names | — | `x0` (array ptr) |
| `__rt_digest_to_string` | Format a raw digest as lowercase hex | digest | `x1`/`x2` |
| `__rt_crc32` | CRC32 checksum | `x1`/`x2` | `x0` |
| `__rt_inet_ntop` / `__rt_inet_pton` | IPv4/IPv6 address ↔ packed-binary conversion | address | `x1`/`x2` |
| `__rt_long2ip` / `__rt_ip2long` | Dotted-quad string ↔ integer conversion | `x0` or `x1`/`x2` | `x1`/`x2` or `x0` |
| `__rt_vsprintf` | `vsprintf()` formatting with an argument array | format + array | `x1`/`x2` |
| `__rt_sscanf` | Parse string with format | str + format | `x0` (array ptr) |