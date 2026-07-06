## Mixed-type helper

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_mixed_cast_int` | Unbox mixed cell 并 cast 为 integer | `x0` = mixed cell pointer | `x0` = integer |
| `__rt_mixed_cast_bool` | Unbox mixed cell 并 cast 为 boolean | `x0` = mixed cell pointer | `x0` = 0 or 1 |
| `__rt_mixed_cast_float` | Unbox mixed cell 并 cast 为 float | `x0` = mixed cell pointer | `d0` = float |
| `__rt_mixed_cast_string` | Unbox mixed cell 并 cast 为 string | `x0` = mixed cell pointer | `x1`/`x2` = string |
| `__rt_mixed_instanceof` | Unbox mixed cell，并根据 class/interface metadata 测试 object payload | `x0` = mixed cell pointer, `x1` = target id, `x2` = 0 class / 1 interface | `x0` = 0 or 1 |
| `__rt_instanceof_lookup` | 根据发出的 class/interface name metadata 解析 dynamic class-string target | `x1`/`x2` = string | `x0` = found, `x1` = target id, `x2` = 0 class / 1 interface |
| `__rt_mixed_is_empty` | 按 PHP 语义检查 mixed cell 是否为空 | `x0` = mixed cell pointer | `x0` = 0 or 1 |
| `__rt_mixed_strict_eq` | 按 tag 和 value 比较两个 mixed cell | `x0`, `x1` = mixed pointers | `x0` = 0 or 1 |
| `__rt_mixed_unbox` | 从 mixed cell 中提取 raw payload | `x0` = mixed cell pointer | `x0`/`x1`/`x2` depending on type |
| `__rt_mixed_count` | 统计 boxed indexed array 和 hash；对不可 count 的 payload 返回零 | `x0` = mixed cell pointer | `x0` = count |
| `__rt_iterable_write_stdout` | 把 iterable array 和 hash 打印成 PHP 的 `"Array"` 显示字符串 | `x0` = iterable heap pointer | — |
| `__rt_iterable_unsupported_kind` | 当运行时 iterable dispatch 遇到不支持的 heap kind 时中止 | — | does not return |
| `__rt_hash_may_have_cyclic_values` | 扫描 hash entry，检查是否有任何 entry 包含 refcounted child | `x0` = hash pointer | `x0` = 0 (scalar-only) or 1 (has cycles) |
| `__rt_match_unhandled` | 以 `Fatal error: unhandled match case` 中止 | — | does not return |

## Object 和 stdClass 例程

**来源：** `src/codegen/runtime/objects/`（6 个文件）

这些 helper 支持 `stdClass`、`json_decode()` 的 object result、boxed Mixed property/index access、object destructor dispatch，以及 dynamic `new $name()` instantiation。`stdClass` instance 使用紧凑的 `[class_id][hash_ptr]` payload，dynamic property 存储在包含 boxed `Mixed` value 的 hash 中。

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_new_by_name` | 通过 `_classes_by_name` table 按文本名称实例化 class（大小写不敏感 `__rt_strcasecmp` lookup），分配并清零 object payload | class name string | object pointer, or 0 (null) on miss |
| `__rt_call_object_destructor` | 在按 class_id 索引的 `_class_destruct_ptrs` table 中查找对象的 `__destruct`，并在 storage 释放前以借用 `$this` 调用；带 re-entry guard | object pointer | — |
| `__rt_stdclass_new` | 分配一个空 stdClass object，使用 hash-backed dynamic property storage | stdClass class id from runtime data | object pointer |
| `__rt_stdclass_from_hash` | 把 decoded JSON object hash 包装进 stdClass instance | hash pointer | object pointer |
| `__rt_stdclass_get` | 读取 dynamic property 并返回 boxed Mixed value；缺失时返回 Mixed(null) | object pointer + property string | boxed `mixed` payload |
| `__rt_stdclass_set` | 把 boxed Mixed value 存入 dynamic property hash | object pointer + property string + boxed value | — |
| `__rt_mixed_property_get` | Unbox Mixed object payload 并分发 stdClass property read | boxed `mixed` + property string | boxed `mixed` payload |
| `__rt_mixed_property_set` | Unbox Mixed object payload 并分发 stdClass property write | boxed `mixed` + property string + boxed value | — |
| `__rt_mixed_array_get` | 为 `$mixed[$key]` access unbox Mixed array/hash/stdClass payload | boxed `mixed` + normalized key tuple | boxed `mixed` payload |
| `__rt_mixed_array_set` | Unbox Mixed indexed-array/hash payload，并为 `$mixed[$key] = ...` 写入 boxed Mixed value；成功时消费 boxed value | boxed `mixed` + normalized key tuple + boxed value | — |
| `__rt_json_encode_stdclass` | 把支撑 stdClass 的 dynamic-property hash 编码成 JSON object | stdClass hash pointer | `x1`/`x2` = JSON string |

## SPL 和 iterable 例程

**来源：** `src/codegen/runtime/spl/`（包含 `mod.rs` 在内共 3 个文件）

这些 helper 支撑 PHP surface 需要自定义运行时 storage 的 SPL container class。`SplDoublyLinkedList`（及其 `SplStack` / `SplQueue` 子类）存储 class id、一个 owned indexed array（元素为 boxed `Mixed` cell）、iterator index 和 iterator-mode bit。`SplFixedArray` 存储 class id 和一个固定大小的 storage array，元素为 owned boxed `Mixed` cell（unset/null slot 为 null）。Mutation method 接管 call lowering 准备好的 boxed `Mixed` 参数所有权；resize/overwrite 路径会先释放被替换的 cell。

### SplDoublyLinkedList / SplStack / SplQueue

| 例程 | 作用 |
|---|---|
| `__rt_spl_dll_new` | 分配一个空 doubly-linked-list object，带初始 mixed-cell storage |
| `__rt_spl_dll_push` / `__rt_spl_dll_pop` | 追加到末尾 / 从末尾移除 |
| `__rt_spl_dll_unshift` / `__rt_spl_dll_shift` | 前置 / 从开头移除 |
| `__rt_spl_dll_top` / `__rt_spl_dll_bottom` | 查看最后 / 第一个元素 |
| `__rt_spl_dll_insert` | 按 iterator mode 在指定 index 插入 |
| `__rt_spl_dll_count` / `__rt_spl_dll_is_empty` | 元素数量 / 空检查 |
| `__rt_spl_dll_set_iterator_mode` / `__rt_spl_dll_get_iterator_mode` | 写入 / 读取 LIFO/FIFO 和 DELETE iterator-mode bit |
| `__rt_spl_dll_rewind` / `__rt_spl_dll_valid` / `__rt_spl_dll_current` / `__rt_spl_dll_key` / `__rt_spl_dll_next` / `__rt_spl_dll_prev` | 遵守 active iterator mode 的 iterator surface |
| `__rt_spl_dll_offset_exists` / `__rt_spl_dll_offset_get` / `__rt_spl_dll_offset_set` / `__rt_spl_dll_offset_unset` | `ArrayAccess` operation |
| `__rt_spl_dll_serialize` / `__rt_spl_dll_serialize_array` / `__rt_spl_dll_unserialize` | 序列化 helper |

### SplFixedArray

| 例程 | 作用 |
|---|---|
| `__rt_spl_fixed_new` | 分配一个 fixed-size array object，带 zero-initialized mixed-cell storage block |
| `__rt_spl_fixed_count` | 返回固定大小 |
| `__rt_spl_fixed_set_size` | 调整 storage 大小，释放被丢弃的 cell，并把新 slot 清零 |
| `__rt_spl_fixed_offset_exists` / `__rt_spl_fixed_offset_get` / `__rt_spl_fixed_offset_set` / `__rt_spl_fixed_offset_unset` | 带边界检查的 `ArrayAccess` operation |
| `__rt_spl_fixed_to_array` / `__rt_spl_fixed_from_array` / `__rt_spl_fixed_copy_from_array` | 转换为 / 从 PHP array 构建 |
| `__rt_spl_fixed_unserialize` | 序列化 helper |

## Generator 例程

**来源：** `src/codegen/runtime/generators/`（2 个文件）

这些 helper 支撑内置 `Generator` class。Generator function 会发出 heap-allocated frame 和一个生成的 resume function；运行时 helper 会为 public Iterator surface 和 coroutine operation 读写该 frame。

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_gen_current` | 从最近一次 yield 返回 boxed Mixed value 的 owned ref | `GeneratorFrame*` | boxed `mixed` payload |
| `__rt_gen_key` | 从最近一次 yield 返回 boxed Mixed key 的 owned ref | `GeneratorFrame*` | boxed `mixed` key |
| `__rt_gen_valid` | 报告 generator 是否尚未终止 | `GeneratorFrame*` | bool |
| `__rt_gen_next` | 除非已经终止，否则把 state machine 恢复到当前 yield 之后 | `GeneratorFrame*` | — |
| `__rt_gen_next_done` | `next()` 跳过或完成 resume 后使用的共享 global return label | `GeneratorFrame*` | — |
| `__rt_gen_send` | 存储 sent boxed Mixed value，然后恢复 state machine | `GeneratorFrame*`, boxed `mixed` value | boxed `mixed` payload |
| `__rt_gen_send_done` | `send()` 跳过或完成 resume 后使用的共享 global return label | `GeneratorFrame*` | boxed `mixed` payload |
| `__rt_gen_send_epilogue` | 对 resumed `send()` 产生的 yield 执行 box 并返回的共享 epilogue | `GeneratorFrame*` | boxed `mixed` payload |
| `__rt_gen_rewind` | 只运行一次 generator 到第一个 yield | `GeneratorFrame*` | — |
| `__rt_gen_rewind_done` | `rewind()` 已经运行过或刚刚完成时使用的共享 global return label | `GeneratorFrame*` | — |
| `__rt_gen_throw` | 标记 generator 为 terminated，并通过普通 exception runtime 抛出 | `GeneratorFrame*`, throwable object | does not return |
| `__rt_gen_get_return` | 返回 terminal return value 的 owned ref | `GeneratorFrame*` | boxed `mixed` payload |

Generator frame 会标记为 object heap block，因为 `Generator` 是实现了 `Iterator` 的内置 class。`__rt_object_free_deep` 会检测内置 Generator class id，并释放 frame 的自定义 Mixed slot 以及任何 active `yield from` delegate，而不是把 payload 当作普通 class property 处理。

## Fiber 例程

**来源：** `src/codegen/runtime/fibers/`（4 个文件加 `api/` 子目录）

这些 helper 实现 PHP 8.1 风格的协作式协程。它们会由共享运行时在每个支持的 target 上发出。

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_fiber_alloc_stack` | 分配 per-fiber native stack，并带受保护的 guard page | requested usable stack size | stack base, initial top, mapped size |
| `__rt_fiber_free_stack` | 把 mapped fiber stack 归还给 OS | stack base, mapped size | — |
| `__rt_fiber_switch` | 保存当前 callee-saved context，并恢复目标 fiber/main context | target `Fiber*` or null for main | resumes when this context is switched back to |
| `__rt_fiber_entry` | 首次进入 fiber stack 时运行的 trampoline；调用生成的 wrapper，记录 return/escape state，并切回 | active `_fiber_current` | does not return normally inside the fiber |
| `__rt_fiber_construct` | 分配并初始化 runtime-managed Fiber object 及其初始 stack frame | callable descriptor pointer, `Fiber` class id, generated wrapper pointer | `Fiber*` |
| `__rt_fiber_throw_state_error` | 分配 `FiberError`，并通过普通 exception runtime 抛出 | message pointer and length | does not return |
| `__rt_fiber_start` | 启动尚未开始的 fiber，并返回第一次 yielded value；若立即终止则返回 null | `Fiber*` | boxed `mixed` payload |
| `__rt_fiber_resume` | 用 boxed payload 恢复 suspended fiber | `Fiber*`, boxed `mixed` value | boxed `mixed` payload |
| `__rt_fiber_suspend` | 挂起当前 fiber，并向调用者 yield 一个 boxed payload | boxed `mixed` value | boxed `mixed` value supplied by the next resume |
| `__rt_fiber_throw` | 通过向 suspended fiber 的 pending suspend point 抛出异常来恢复它 | `Fiber*`, throwable object | boxed `mixed` payload or rethrown exception |
| `__rt_fiber_get_current` | 返回当前正在运行的 fiber；运行在 main stack 上时返回 null | — | boxed `mixed` payload |
| `__rt_fiber_get_return` | 读取 terminated fiber 的 terminal return payload | `Fiber*` | boxed `mixed` payload |
| `__rt_fiber_state_eq` | `isStarted()`、`isSuspended()`、`isRunning()` 和 `isTerminated()` 使用的共享 predicate helper | `Fiber*`, state id | bool |
