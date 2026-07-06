### Core allocation

| Routine | What it does | Input | Output |
|---|---|---|---|
| `__rt_heap_alloc` | Free-list + bump allocator with a 16-byte `[size:4][refcount:4][kind:8]` header | `x0` = size | `x0` = pointer |
| `__rt_heap_free` | Return block to free list (bump reset if last block) | `x0` = pointer | — |
| `__rt_heap_free_safe` | Free only if pointer is in heap range | `x0` = pointer | — |
| `__rt_heap_debug_fail` | Print a heap-debug fatal error and terminate immediately | `x1` = msg ptr, `x2` = msg len | — |
| `__rt_heap_debug_check_live` | Reject `incref` / `decref` operations on already-freed heap blocks | `x0` = pointer | — |
| `__rt_heap_debug_validate_free_list` | Validate the ordered free list and small-bin chains before allocator mutations | — | — |
| `__rt_heap_debug_report` | Print heap-debug exit summary with leak/high-water stats | — | — |
| `__rt_heap_kind` | Return the uniform heap-kind tag for a heap-backed pointer | `x0` = pointer | `x0` = kind |
| `__rt_array_new` | Create indexed array with header | `x0` = capacity, `x1` = elem_size | `x0` = array ptr |
| `__rt_array_clone_shallow` | Clone indexed array storage for copy-on-write splitting, retaining nested heap children as needed | `x0` = array | `x0` = new array |
| `__rt_array_to_mixed` | Convert an indexed array's live slots to boxed Mixed cells and stamp the array metadata as mixed | `x0` = array | `x0` = same array |
| `__rt_array_ensure_unique` | Split a shared indexed array before mutation | `x0` = array | `x0` = unique array |
| `__rt_array_grow` | Ensure uniqueness, double array capacity, copy elements, free old unique storage | `x0` = array | `x0` = new array |
| `__rt_array_free_deep` | Free array storage and release nested heap-backed elements | `x0` = array | — |
| `__rt_array_union` | Build PHP indexed-array union: left numeric keys win, only missing right suffix keys are appended | `x0` = left array, `x1` = right array | `x0` = result array |
| `__rt_array_hash_union` | Build PHP indexed+associative union by converting left indexes to integer hash keys before appending missing right entries | `x0` = left array, `x1` = right hash | `x0` = result hash |
| `__rt_array_push_int` | Append int to array (grows if needed) | `x0` = array, `x1` = value | `x0` = array |
| `__rt_array_push_refcounted` | `incref` borrowed heap payload, then append it as an 8-byte array element | `x0` = array, `x1` = heap ptr | `x0` = array |
| `__rt_array_push_str` | Persist string + append to array (grows if needed) | `x0` = array, `x1`/`x2` = str | `x0` = array |
| `__rt_sort_int` / `__rt_rsort_int` | In-place sort ascending or descending | `x0` = array | — |
| `__rt_str_persist` | Copy string from concat_buf to heap (skips .data/heap) | `x1`/`x2` = str | `x1`/`x2` = heap str |

Common copy-producing array/hash routines now also have dedicated `_refcounted` siblings for nested heap-backed payloads. These variants retain borrowed values before pushing or inserting them into freshly allocated arrays/hash tables, covering array literals with spreads plus `array_merge`, `array_chunk`, `array_slice`, `array_reverse`, `array_pad`, `array_unique`, `array_splice`, `array_diff`, `array_intersect`, `array_filter`, `array_fill`, `array_combine`, and `array_fill_keys`.

| Refcounted sibling | What it does |
|---|---|
| `__rt_array_reverse_refcounted` | Reverse an indexed array while retaining nested heap-backed elements |
| `__rt_array_merge_refcounted` | Merge indexed arrays that carry nested heap-backed payloads |
| `__rt_array_slice_refcounted` / `__rt_array_splice_refcounted` | Slice or splice while retaining nested heap-backed payloads |
| `__rt_array_unique_refcounted` | Remove duplicates while preserving retained heap-backed elements |
| `__rt_array_fill_refcounted` / `__rt_array_fill_keys_refcounted` | Build filled arrays/hashes from borrowed heap-backed values |
| `__rt_array_pad_refcounted` | Pad an array with retained heap-backed values |
| `__rt_array_diff_refcounted` / `__rt_array_intersect_refcounted` | Set-style comparisons that keep nested heap-backed values alive |
| `__rt_array_combine_refcounted` | Combine key/value arrays into a hash while retaining heap-backed values |
| `__rt_array_chunk_refcounted` | Split an array into retained heap-backed chunks |
| `__rt_array_filter_refcounted` | Filter an array of heap-backed elements without dropping borrowed payloads; an optional third argument carries a captured-closure environment |
| `__rt_array_merge_into_refcounted` | Append one indexed array into another in-place while retaining nested heap-backed elements |

### Hash table (for associative arrays)

| Routine | What it does | Input | Output |
|---|---|---|---|
| `__rt_hash_fnv1a` | FNV-1a hash of string | `x1`/`x2` = string | `x0` = hash |
| `__rt_hash_normalize_key` | Normalize PHP string array keys, converting integer-form numeric strings to integer keys | `x1`/`x2` = string key | `x1`/`x2` = normalized key |
| `__rt_hash_key_hash` | Hash a normalized int/string array key | `x1`/`x2` = normalized key | `x0` = hash |
| `__rt_hash_key_eq` | Compare normalized int/string array keys | `x1`/`x2`, `x3`/`x4` = keys | `x0` = equal flag |
| `__rt_hash_new` | Create hash table | `x0` = capacity, `x1` = coarse value-type summary | `x0` = hash ptr |
| `__rt_hash_clone_shallow` | Clone hash storage for copy-on-write splitting, re-persisting keys and retaining nested heap values as needed | `x0` = hash | `x0` = new hash |
| `__rt_hash_ensure_unique` | Split a shared hash table before mutation | `x0` = hash | `x0` = unique hash |
| `__rt_hash_grow` | Double hash table capacity, rehash all entries | `x0` = hash | `x0` = new hash |
| `__rt_hash_set` | Insert/update (grows at 75% load) | `x0`=hash, `x1`/`x2`=normalized key, `x3`/`x4`=value, `x5`=value_tag | `x0` = hash |
| `__rt_hash_append` | Append with PHP's next automatic integer key (largest existing int key + 1, or 0), then delegate to `__rt_hash_set` | `x0`=hash, `x3`/`x4`=value, `x5`=value_tag | `x0` = hash |
| `__rt_hash_insert_owned` | Reinsert an already-owned key/value pair during hash growth | `x0`=hash, `x1`/`x2`=normalized key, `x3`/`x4`=value, `x5`=value_tag | `x0` = hash |
| `__rt_hash_get` | Look up value by key | `x0`=hash, `x1`/`x2`=normalized key | `x0`=found, `x1`=val_lo, `x2`=val_hi, `x3`=value_tag |
| `__rt_hash_iter_next` | Iterate to next entry in insertion order | `x0`=hash, `x1`=cursor | `x0`=next cursor, `x1`/`x2`=key, `x3`/`x4`=value, `x5`=value_tag |
| `__rt_hash_union` | Build PHP associative-array union: left duplicate keys win, missing right entries append in insertion order | `x0`=left hash, `x1`=right hash | `x0`=result hash |
| `__rt_hash_array_union` | Build PHP associative+indexed union by cloning the left hash and appending right indexes absent from the shared key space | `x0`=left hash, `x1`=right array | `x0`=result hash |
| `__rt_hash_count` | Count occupied entries | `x0`=hash | `x0`=count |
| `__rt_hash_free_deep` | Free a hash table plus owned keys and nested heap-backed values | `x0`=hash | — |
| `__rt_hash_to_mixed` | Copy-on-write a hash, then widen each entry payload into a boxed Mixed cell so by-reference `foreach` can alias a stable pointer slot | `x0`=hash | `x0` = same hash |
| `__rt_mixed_from_value` | Box a tagged payload into a heap-allocated mixed cell | `x0`=value_tag, `x1`=value_lo, `x2`=value_hi | `x0` = mixed cell |
| `__rt_mixed_write_stdout` | Print a boxed mixed value by inspecting its inner tag | `x0` = mixed cell | — |

`__rt_hash_iter_next` uses a small cursor protocol rather than a raw slot index: `0` starts from the hash header's `head`, positive cursors encode `slot_index + 1`, `-2` marks the post-tail state after yielding the final entry, and `-1` means iteration is exhausted.

See [Memory Model](memory-model.md) for the hash table memory layout.

### Array manipulation

| Routine | What it does |
|---|---|
| `__rt_array_key_exists` | Check if integer key is in bounds |
| `__rt_warn_undefined_array_key_int` | Emit PHP's `Undefined array key` warning for a missing integer key (warning-only; caller still supplies the null fallback) |
| `__rt_array_search` | Linear search for value in indexed array |
| `__rt_array_reverse` | Reverse element order |
| `__rt_array_sum` / `__rt_array_product` | Sum/product of all elements |
| `__rt_array_shift` / `__rt_array_unshift` | Remove/add at beginning |
| `__rt_array_merge` | Concatenate two indexed arrays into a new array |
| `__rt_array_merge_into` | Append all elements from source array into dest array (in-place) |
| `__rt_array_slice` / `__rt_array_splice` | Extract slices and remove splice windows from indexed arrays |
| `__rt_array_unique` | Remove duplicate values |
| `__rt_array_diff` / `__rt_array_intersect` | Set difference/intersection by value |
| `__rt_array_diff_key` / `__rt_array_intersect_key` | Set operations by key |
| `__rt_array_flip` | Swap indexed integer values into associative-array keys |
| `__rt_array_flip_string` | Swap indexed string values into associative-array keys, normalizing numeric-string keys |
| `__rt_array_combine` | Combine key array + value array → AssocArray |
| `__rt_array_fill` / `__rt_array_fill_keys` | Create filled arrays |
| `__rt_array_chunk` / `__rt_array_pad` | Chunk/pad arrays |
| `__rt_array_column` | Extract column from array of assoc arrays (int values) |
| `__rt_array_column_ref` | Extract column of retained heap-backed values (arrays / hashes / objects) |
| `__rt_array_column_str` | Extract column from array of assoc arrays (string values) |
| `__rt_array_column_mixed` | Extract column values as boxed Mixed cells for heterogeneous input payloads |
| `__rt_range` | Generate integer range array |
| `__rt_shuffle` / `__rt_array_rand` | Randomize order / pick random |
| `__rt_random_u32` / `__rt_random_uniform` | Target-aware random primitives used by `rand()`, `random_int()`, `shuffle()`, and `array_rand()` |
| `__rt_asort` / `__rt_arsort` | Sort by value while preserving keys, ascending or descending |
| `__rt_ksort` / `__rt_krsort` | Sort by key, ascending or descending |
| `__rt_natsort` / `__rt_natcasesort` | Natural-order sort, case-sensitive or case-insensitive |
| `__rt_array_map` | Apply callback to each scalar element, return new array; an optional third argument carries a captured-closure environment for generated callback wrappers |
| `__rt_array_map_str` | Apply callback to each scalar or string element and return a string array; an optional third argument carries a captured-closure environment |
| `__rt_array_map_str_owned` | Apply a descriptor-wrapper callback that returns owned strings and transfer those strings directly into the result array |
| `__rt_array_map_mixed` | Apply a descriptor-backed callback that returns owned boxed Mixed cells and store them directly into a newly allocated result array |
| `__rt_array_filter` | Filter scalar elements where callback returns truthy; an optional third argument carries a captured-closure environment |
| `__rt_array_reduce` | Reduce array to single value via callback; an optional fourth argument carries a captured-callback environment |
| `__rt_array_walk` | Call callback on each element (side-effects); an optional third argument carries a captured-callback environment |
| `__rt_usort` | Sort array using user comparison callback; an optional third argument carries a captured-callback environment |