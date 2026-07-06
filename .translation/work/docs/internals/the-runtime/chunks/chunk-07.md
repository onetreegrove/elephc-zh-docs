## Mixed-type helpers

| Routine | What it does | Input | Output |
|---|---|---|---|
| `__rt_mixed_cast_int` | Unbox a mixed cell and cast to integer | `x0` = mixed cell pointer | `x0` = integer |
| `__rt_mixed_cast_bool` | Unbox a mixed cell and cast to boolean | `x0` = mixed cell pointer | `x0` = 0 or 1 |
| `__rt_mixed_cast_float` | Unbox a mixed cell and cast to float | `x0` = mixed cell pointer | `d0` = float |
| `__rt_mixed_cast_string` | Unbox a mixed cell and cast to string | `x0` = mixed cell pointer | `x1`/`x2` = string |
| `__rt_mixed_instanceof` | Unbox a mixed cell and test object payloads against class/interface metadata | `x0` = mixed cell pointer, `x1` = target id, `x2` = 0 class / 1 interface | `x0` = 0 or 1 |
| `__rt_instanceof_lookup` | Resolve a dynamic class-string target against emitted class/interface name metadata | `x1`/`x2` = string | `x0` = found, `x1` = target id, `x2` = 0 class / 1 interface |
| `__rt_mixed_is_empty` | Check emptiness of a mixed cell (PHP semantics) | `x0` = mixed cell pointer | `x0` = 0 or 1 |
| `__rt_mixed_strict_eq` | Compare two mixed cells by tag and value | `x0`, `x1` = mixed pointers | `x0` = 0 or 1 |
| `__rt_mixed_unbox` | Extract the raw payload from a mixed cell | `x0` = mixed cell pointer | `x0`/`x1`/`x2` depending on type |
| `__rt_mixed_count` | Count boxed indexed arrays and hashes, returning zero for non-countable payloads | `x0` = mixed cell pointer | `x0` = count |
| `__rt_iterable_write_stdout` | Print iterable arrays and hashes as PHP's `"Array"` display string | `x0` = iterable heap pointer | — |
| `__rt_iterable_unsupported_kind` | Abort when runtime iterable dispatch sees an unsupported heap kind | — | does not return |
| `__rt_hash_may_have_cyclic_values` | Scan hash entries to check if any contain refcounted children | `x0` = hash pointer | `x0` = 0 (scalar-only) or 1 (has cycles) |
| `__rt_match_unhandled` | Abort with `Fatal error: unhandled match case` | — | does not return |

## Object and stdClass routines

**Source:** `src/codegen/runtime/objects/` (6 files)

These helpers support `stdClass`, `json_decode()` object results, boxed Mixed property/index access, object destructor dispatch, and dynamic `new $name()` instantiation. `stdClass` instances use a compact `[class_id][hash_ptr]` payload, with dynamic properties stored in a hash of boxed `Mixed` values.

| Routine | What it does | Input | Output |
|---|---|---|---|
| `__rt_new_by_name` | Instantiate a class by its textual name through the `_classes_by_name` table (case-insensitive `__rt_strcasecmp` lookup), allocating and zeroing the object payload | class name string | object pointer, or 0 (null) on miss |
| `__rt_call_object_destructor` | Look up the object's `__destruct` in the class_id-indexed `_class_destruct_ptrs` table and invoke it with `$this` borrowed before storage is released; guarded against re-entry | object pointer | — |
| `__rt_stdclass_new` | Allocate an empty stdClass object with hash-backed dynamic property storage | stdClass class id from runtime data | object pointer |
| `__rt_stdclass_from_hash` | Wrap a decoded JSON object hash in a stdClass instance | hash pointer | object pointer |
| `__rt_stdclass_get` | Read a dynamic property and return a boxed Mixed value, or Mixed(null) when missing | object pointer + property string | boxed `mixed` payload |
| `__rt_stdclass_set` | Store a boxed Mixed value into a dynamic property hash | object pointer + property string + boxed value | — |
| `__rt_mixed_property_get` | Unbox a Mixed object payload and dispatch stdClass property reads | boxed `mixed` + property string | boxed `mixed` payload |
| `__rt_mixed_property_set` | Unbox a Mixed object payload and dispatch stdClass property writes | boxed `mixed` + property string + boxed value | — |
| `__rt_mixed_array_get` | Unbox Mixed array/hash/stdClass payloads for `$mixed[$key]` access | boxed `mixed` + normalized key tuple | boxed `mixed` payload |
| `__rt_mixed_array_set` | Unbox a Mixed indexed-array/hash payload and write a boxed Mixed value for `$mixed[$key] = ...`; consumes the boxed value on success | boxed `mixed` + normalized key tuple + boxed value | — |
| `__rt_json_encode_stdclass` | Encode the dynamic-property hash backing stdClass as a JSON object | stdClass hash pointer | `x1`/`x2` = JSON string |

## SPL and iterable routines

**Source:** `src/codegen/runtime/spl/` (3 files including `mod.rs`)

These helpers back SPL container classes whose PHP surface needs custom runtime storage. `SplDoublyLinkedList` (and its `SplStack` / `SplQueue` subclasses) store a class id, an owned indexed array of boxed `Mixed` cells, an iterator index, and iterator-mode bits. `SplFixedArray` stores a class id and a fixed-size storage array of owned boxed `Mixed` cells (or null for unset/null slots). Mutating methods take ownership of the boxed `Mixed` arguments prepared by call lowering, and resize/overwrite paths release any replaced cell first.

### SplDoublyLinkedList / SplStack / SplQueue

| Routine | What it does |
|---|---|
| `__rt_spl_dll_new` | Allocate an empty doubly-linked-list object with initial mixed-cell storage |
| `__rt_spl_dll_push` / `__rt_spl_dll_pop` | Append to / remove from the end |
| `__rt_spl_dll_unshift` / `__rt_spl_dll_shift` | Prepend to / remove from the front |
| `__rt_spl_dll_top` / `__rt_spl_dll_bottom` | Peek the last / first element |
| `__rt_spl_dll_insert` | Insert at an index honoring the iterator mode |
| `__rt_spl_dll_count` / `__rt_spl_dll_is_empty` | Element count / emptiness check |
| `__rt_spl_dll_set_iterator_mode` / `__rt_spl_dll_get_iterator_mode` | Write / read LIFO/FIFO and DELETE iterator-mode bits |
| `__rt_spl_dll_rewind` / `__rt_spl_dll_valid` / `__rt_spl_dll_current` / `__rt_spl_dll_key` / `__rt_spl_dll_next` / `__rt_spl_dll_prev` | Iterator surface honoring the active iterator mode |
| `__rt_spl_dll_offset_exists` / `__rt_spl_dll_offset_get` / `__rt_spl_dll_offset_set` / `__rt_spl_dll_offset_unset` | `ArrayAccess` operations |
| `__rt_spl_dll_serialize` / `__rt_spl_dll_serialize_array` / `__rt_spl_dll_unserialize` | Serialization helpers |

### SplFixedArray

| Routine | What it does |
|---|---|
| `__rt_spl_fixed_new` | Allocate a fixed-size array object with a zero-initialized mixed-cell storage block |
| `__rt_spl_fixed_count` | Return the fixed size |
| `__rt_spl_fixed_set_size` | Resize storage, releasing dropped cells and zero-filling new slots |
| `__rt_spl_fixed_offset_exists` / `__rt_spl_fixed_offset_get` / `__rt_spl_fixed_offset_set` / `__rt_spl_fixed_offset_unset` | `ArrayAccess` operations with bounds checking |
| `__rt_spl_fixed_to_array` / `__rt_spl_fixed_from_array` / `__rt_spl_fixed_copy_from_array` | Convert to / build from a PHP array |
| `__rt_spl_fixed_unserialize` | Serialization helper |

## Generator routines

**Source:** `src/codegen/runtime/generators/` (2 files)

These helpers back the built-in `Generator` class. Generator functions emit a heap-allocated frame and a generated resume function; the runtime helpers read/write that frame for the public Iterator surface and coroutine operations.

| Routine | What it does | Input | Output |
|---|---|---|---|
| `__rt_gen_current` | Return an owned ref to the boxed Mixed value from the most recent yield | `GeneratorFrame*` | boxed `mixed` payload |
| `__rt_gen_key` | Return an owned ref to the boxed Mixed key from the most recent yield | `GeneratorFrame*` | boxed `mixed` key |
| `__rt_gen_valid` | Report whether the generator is not terminated | `GeneratorFrame*` | bool |
| `__rt_gen_next` | Resume the state machine past the current yield unless terminated | `GeneratorFrame*` | — |
| `__rt_gen_next_done` | Shared global return label used after `next()` skips or completes a resume | `GeneratorFrame*` | — |
| `__rt_gen_send` | Store a boxed Mixed sent value, then resume the state machine | `GeneratorFrame*`, boxed `mixed` value | boxed `mixed` payload |
| `__rt_gen_send_done` | Shared global return label used after `send()` skips or completes a resume | `GeneratorFrame*` | boxed `mixed` payload |
| `__rt_gen_send_epilogue` | Shared epilogue that boxes and returns the yield produced by a resumed `send()` | `GeneratorFrame*` | boxed `mixed` payload |
| `__rt_gen_rewind` | Run the generator to its first yield once | `GeneratorFrame*` | — |
| `__rt_gen_rewind_done` | Shared global return label used when `rewind()` has already run or just finished | `GeneratorFrame*` | — |
| `__rt_gen_throw` | Mark the generator terminated and throw through the normal exception runtime | `GeneratorFrame*`, throwable object | does not return |
| `__rt_gen_get_return` | Return an owned ref to the boxed terminal return value | `GeneratorFrame*` | boxed `mixed` payload |

Generator frames are stamped as object heap blocks because `Generator` is a built-in class implementing `Iterator`. `__rt_object_free_deep` detects the built-in Generator class id and releases the frame's custom Mixed slots plus any active `yield from` delegate instead of treating the payload as ordinary class properties.

## Fiber routines

**Source:** `src/codegen/runtime/fibers/` (4 files plus the `api/` subdirectory)

These helpers implement PHP 8.1-style cooperative coroutines. They are emitted by the shared runtime on every supported target.

| Routine | What it does | Input | Output |
|---|---|---|---|
| `__rt_fiber_alloc_stack` | Allocate a per-fiber native stack with a protected guard page | requested usable stack size | stack base, initial top, mapped size |
| `__rt_fiber_free_stack` | Return a mapped fiber stack to the OS | stack base, mapped size | — |
| `__rt_fiber_switch` | Save the current callee-saved context and restore the target fiber/main context | target `Fiber*` or null for main | resumes when this context is switched back to |
| `__rt_fiber_entry` | Trampoline run on first entry to a fiber stack; calls the generated wrapper, records return/escape state, and switches back | active `_fiber_current` | does not return normally inside the fiber |
| `__rt_fiber_construct` | Allocate and initialize the runtime-managed Fiber object and its initial stack frame | callable descriptor pointer, `Fiber` class id, generated wrapper pointer | `Fiber*` |
| `__rt_fiber_throw_state_error` | Allocate a `FiberError` and throw it through the normal exception runtime | message pointer and length | does not return |
| `__rt_fiber_start` | Start a not-yet-started fiber and return its first yielded value or null on immediate termination | `Fiber*` | boxed `mixed` payload |
| `__rt_fiber_resume` | Resume a suspended fiber with a boxed payload | `Fiber*`, boxed `mixed` value | boxed `mixed` payload |
| `__rt_fiber_suspend` | Suspend the current fiber and yield a boxed payload to its caller | boxed `mixed` value | boxed `mixed` value supplied by the next resume |
| `__rt_fiber_throw` | Resume a suspended fiber by throwing into its pending suspend point | `Fiber*`, throwable object | boxed `mixed` payload or rethrown exception |
| `__rt_fiber_get_current` | Return the currently running fiber, or null when running on the main stack | — | boxed `mixed` payload |
| `__rt_fiber_get_return` | Read the terminal return payload from a terminated fiber | `Fiber*` | boxed `mixed` payload |
| `__rt_fiber_state_eq` | Shared predicate helper for `isStarted()`, `isSuspended()`, `isRunning()`, and `isTerminated()` | `Fiber*`, state id | bool |