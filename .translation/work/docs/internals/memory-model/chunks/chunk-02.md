### Implications

- **Bounded usage.** Because the buffer resets each statement, only one statement's worth of string operations needs to fit in 64KB — plus the slice arguments held by any enclosing calls on the current stack (see [Cross-call slice arguments](#cross-call-slice-arguments)). For ordinary code this is comfortably within 64KB.
- **No mutation.** You can't modify a string in place — you always create a new one.
- **Scratch only.** The buffer is strictly temporary. Anything that needs to survive goes to the heap.

## The heap

```asm
.comm _heap_buf, 8388608    ; 8MB buffer (configurable via --heap-size)
.comm _heap_off, 8          ; current bump allocation offset
.comm _heap_free_list, 8    ; head of the general free block linked list
.comm _heap_small_bins, 32  ; 4 x 8-byte heads for <=8/16/32/64-byte cached blocks
.comm _heap_debug_enabled, 8 ; heap-debug toggle
.comm _gc_collecting, 8     ; cycle collector re-entry guard
.comm _gc_release_suppressed, 8 ; suppress nested collection during deep free
.comm _gc_allocs, 8         ; allocation counter
.comm _gc_frees, 8          ; free counter
.comm _gc_live, 8           ; current live heap footprint in bytes
.comm _gc_peak, 8           ; heap high-water mark
```

The heap (`_heap_buf`) is an 8MB region (by default) for dynamically-sized data — arrays, hash tables, objects, and persisted strings. It uses a **free-list + bump hybrid allocator** with segregated small-block bins for the hottest tiny allocations.

### How heap allocation works

Every allocation has a **16-byte header**: two 32-bit fields for block size and reference count, followed by an 8-byte uniform heap-kind tag:

```
┌───────────┬────────────┬────────────┬──────────────────┐
│ size (4B) │ refcnt (4B)│ kind (8B)  │  user data ...   │
└───────────┴────────────┴────────────┴──────────────────┘
       header (16 bytes total)          ← pointer returned to caller
```

The size is stored at header offset `+0`, the reference count at `+4`, and the heap kind tag at `+8`. New allocations start with refcount `1`; typed constructors then stamp the kind as `1=string`, `2=indexed array`, `3=assoc/hash`, `4=object`, `5=boxed mixed`, while raw helper buffers remain `0`. Generator frames are stamped as kind `4` object blocks because `Generator` is a built-in class with a custom payload layout. For array/hash containers, the low 16 bits of the kind word are persistent metadata: the low byte is still the heap kind, indexed arrays still pack their runtime `value_type` in the next byte, and bit 15 is reserved as the persistent copy-on-write container flag. Higher bits remain transient collector metadata.

The runtime routine `__rt_heap_alloc`:

1. **Probe the segregated small bins** — requests up to 64 bytes first check `_heap_small_bins` (`<=8`, `<=16`, `<=32`, `<=64`) and reuse a cached block from the smallest fitting class available.
2. **Walk the general free list** — if no cached small block fits, check the address-ordered free list (first-fit). If a block with `size >= requested` is found, either unlink it whole or split it so the remainder stays on the free list, then reset the allocated block's refcount to 1 and return it.
3. **Bump allocate** — if neither free path fits, allocate from the end of the heap: write size and refcount=1 to the header, advance `_heap_off`, return user pointer.
4. **Bounds check** — if the bump would exceed `_heap_max`, print a fatal error and exit.

Minimum allocation is 8 bytes (to fit the next pointer when the block is later freed).

### How heap freeing works

The runtime routine `__rt_heap_free`:

1. Read the block size (32-bit) from the 16-byte header at `user_pointer - 16`
2. If the block is exactly at the bump tail, shrink `_heap_off` immediately
3. Otherwise, payloads up to 64 bytes are cached into one of four segregated small-bin heads (`<=8`, `<=16`, `<=32`, `<=64`) so later tiny allocations can reuse them without scanning the larger free list
4. Larger non-tail blocks are inserted into the general free list in address order, merged with adjacent free neighbors, and repeatedly trim any now-free tail chain back into `_heap_off`
5. Free blocks reuse the same 16-byte header, clear the kind back to `0`, and then store the next pointer immediately after it: `[size:4][refcnt:4][kind:8][next_ptr:8][...unused...]`

The variant `__rt_heap_free_safe` validates that the pointer is within `_heap_buf` range before freeing — safe to call with garbage, null, or `.data` section pointers.

### Heap debug mode

Passing `--heap-debug` enables additional runtime verification without changing normal ownership behavior:

- `__rt_heap_free` rejects duplicate insertion of the same block into the free list (`double free`)
- `__rt_incref` / `__rt_decref_*` reject zero-refcount heap blocks before mutating them (`bad refcount`)
- `__rt_heap_alloc` / `__rt_heap_free` validate the ordered free list plus the segregated small-bin chains and trap on out-of-range, overlapping, cyclic, mis-sized, or merely-adjacent free blocks (`free-list corruption`)
- `__rt_heap_free` poisons freed payload bytes with `0xA5`, so stale raw reads stand out immediately in debug repros
- process exit prints a heap-debug summary with alloc/free counts, live blocks, live bytes, a leak summary line, and the peak live-byte watermark

When one of these checks trips, the program exits with a fatal heap-debug error instead of continuing with corrupted allocator state.

### When memory is freed

- **Variable reassignment**: when a heap-backed local/global/static slot is overwritten, codegen releases the previous owner through the appropriate runtime path (`__rt_heap_free_safe` for persisted strings, `__rt_decref_*` for refcounted arrays / hashes / objects)
- **`unset()`**: releases the current heap-backed value before nulling the slot
- **Targeted cycle collection**: when decref reaches a container/object graph that may only be keeping itself alive, `__rt_gc_collect_cycles` counts heap-only incoming edges, marks externally reachable blocks, and deep-frees the remaining unreachable array/hash/object island
- **Generator frame release**: Generator frames are object-kind heap blocks, but their custom Mixed slots and active `yield from` delegate are released by a Generator-specific branch in object deep-free
- **Object destructors (`__destruct`)**: at the top of `__rt_object_free_deep`, before any property payloads are released, `__rt_call_object_destructor` looks up the object's class in the class_id-indexed `_class_destruct_ptrs` table and, if the class (or an ancestor) declares `__destruct`, calls it with `$this` borrowed. A bit set in the refcount word marks destruction in progress so a balanced `$tmp = $this;` inside the body cannot re-enter the free path; object resurrection is intentionally not supported (the block is still freed). Classes without a destructor have a `0` table entry and pay only one load and branch
- **Process exit**: all memory is reclaimed by the OS

### Configurable heap size

The default heap is 8MB. For programs that need more (or less), use:

```bash
elephc --heap-size=16777216 heavy.php    # 16MB heap
elephc --gc-stats heavy.php              # print alloc/free counters to stderr
elephc --heap-debug heavy.php            # enable runtime heap verification
```

The minimum is 64KB.

## Array layout

Arrays are heap-allocated with a 24-byte header followed by contiguous elements:

```
_heap_buf + offset:
┌──────────┬──────────┬──────────┬──────┬──────┬──────┬─────┐
│ length   │ capacity │ elem_sz  │ [0]  │ [1]  │ [2]  │ ... │
│ (8 bytes)│ (8 bytes)│ (8 bytes)│      │      │      │     │
└──────────┴──────────┴──────────┴──────┴──────┴──────┴─────┘
 offset+0   offset+8   offset+16  offset+24  ...
```

| Field | Size | Description |
|---|---|---|
| `length` | 8 bytes | Current number of elements |
| `capacity` | 8 bytes | Number of allocated slots |
| `elem_size` | 8 bytes | Size per element: 8 (int) or 16 (string) |

### Integer arrays

Each element is 8 bytes (one `i64`):

```
Header (24 bytes) │ elem[0] (8B) │ elem[1] (8B) │ elem[2] (8B) │ ...
```

Access: `base + 24 + (index × 8)`

### String arrays

Each element is 16 bytes (pointer + length):

```
Header (24 bytes) │ ptr[0] (8B) │ len[0] (8B) │ ptr[1] (8B) │ len[1] (8B) │ ...
```

Access: `base + 24 + (index × 16)` for pointer, `base + 24 + (index × 16) + 8` for length

### Array growth

When `array_push` finds that `length >= capacity`, the array grows automatically:

1. `__rt_array_grow` first runs `__rt_array_ensure_unique`, so shared arrays split before reallocation
2. Allocates a new array with **2× capacity** (minimum 8)
3. Copies the 24-byte header and all elements to the new array
4. Frees the previous unique storage and returns the new array pointer

The caller updates its stored pointer to the new array. This means arrays are truly dynamic — you can push unlimited elements (limited only by heap size). Direct indexed writes into empty arrays now also grow the backing storage and extend `length` to cover the highest written index.

### Copy-on-write containers

Indexed arrays and associative arrays now follow **shared-until-modified** semantics:

1. Plain assignment or by-value argument passing shares the existing heap container and bumps its refcount
2. The first mutating write runs `__rt_array_ensure_unique` or `__rt_hash_ensure_unique`
3. If the refcount is already 1, the write proceeds in place
4. If the refcount is greater than 1, the runtime clones the container structure, retains nested heap-backed children (or re-persists immutable strings/keys), decrements the mutator's old owner slot, rewrites the mutating owner to the clone, and only then performs the write

This is what lets PHP-style code such as `$b = $a; $b[0] = 9;` leave `$a` unchanged without requiring deep copies on every assignment. Nested arrays and hashes remain shallow-shared until their own first mutation.

## Hash table layout (associative arrays)

Associative arrays use a separate heap-allocated structure: an open-addressing hash table for lookup plus an insertion-order linked list threaded through the entries.

### Header (40 bytes)

```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│  count   │ capacity │ val_type │   head   │   tail   │
│ (8 bytes)│ (8 bytes)│ (8 bytes)│ (8 bytes)│ (8 bytes)│
└──────────┴──────────┴──────────┴──────────┴──────────┘
 offset+0   offset+8   offset+16  offset+24  offset+32
```

| Field | Size | Description |
|---|---|---|
| `count` | 8 bytes | Number of occupied entries |
| `capacity` | 8 bytes | Total number of slots |
| `val_type` | 8 bytes | Coarse value-type summary (0=int, 1=str, 2=float, 3=bool, 4=array, 5=assoc, 6=object, 7=mixed) |
| `head` | 8 bytes | Slot index of the first inserted entry, or `-1` when empty |
| `tail` | 8 bytes | Slot index of the most recently inserted entry, or `-1` when empty |

### Entries (64 bytes each)

Starting at offset +40, each slot is 64 bytes:

```
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ occupied │ key_ptr  │ key_len  │ value_lo │ value_hi │ value_tag│   prev   │   next   │
│ (8 bytes)│ (8 bytes)│ (8 bytes)│ (8 bytes)│ (8 bytes)│ (8 bytes)│ (8 bytes)│ (8 bytes)│
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

| Field | Description |
|---|---|
| `occupied` | 0 = empty, 1 = occupied, 2 = tombstone (deleted) |
| `key_ptr` | String key pointer, or the integer key payload when `key_len == -1` |
| `key_len` | String key length, or `-1` sentinel for integer keys |
| `value_lo` | Value (integer) or value pointer (string) |
| `value_hi` | String length (for string values), unused for single-word payloads |
| `value_tag` | Authoritative per-entry runtime tag used by lookup, iteration, JSON, search, and GC |
| `prev` | Previous inserted slot index, or `-1` for the head entry |
| `next` | Next inserted slot index, or `-1` for the tail entry |