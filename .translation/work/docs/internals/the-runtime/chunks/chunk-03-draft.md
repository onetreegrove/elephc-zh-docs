### 核心分配

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_heap_alloc` | 带 16 字节 `[size:4][refcount:4][kind:8]` header 的 free-list + bump allocator | `x0` = size | `x0` = pointer |
| `__rt_heap_free` | 把 block 归还到 free list（如果是最后一个 block，则重置 bump） | `x0` = pointer | — |
| `__rt_heap_free_safe` | 仅当指针位于堆范围内时释放 | `x0` = pointer | — |
| `__rt_heap_debug_fail` | 打印 heap-debug fatal error 并立即终止 | `x1` = msg ptr, `x2` = msg len | — |
| `__rt_heap_debug_check_live` | 拒绝对已经释放的 heap block 执行 `incref` / `decref` | `x0` = pointer | — |
| `__rt_heap_debug_validate_free_list` | 在 allocator mutation 前校验有序 free list 和 small-bin chain | — | — |
| `__rt_heap_debug_report` | 打印 heap-debug 退出摘要，包含 leak/high-water 统计 | — | — |
| `__rt_heap_kind` | 返回 heap-backed 指针的统一 heap-kind tag | `x0` = pointer | `x0` = kind |
| `__rt_array_new` | 创建带 header 的 indexed array | `x0` = capacity, `x1` = elem_size | `x0` = array ptr |
| `__rt_array_clone_shallow` | 为 copy-on-write split 克隆 indexed array storage，按需保留嵌套 heap child | `x0` = array | `x0` = new array |
| `__rt_array_to_mixed` | 把 indexed array 的 live slot 转换成 boxed Mixed cell，并把数组元数据标记为 mixed | `x0` = array | `x0` = same array |
| `__rt_array_ensure_unique` | 在 mutation 前拆分共享 indexed array | `x0` = array | `x0` = unique array |
| `__rt_array_grow` | 确保唯一性、把 array capacity 翻倍、复制元素并释放旧的 unique storage | `x0` = array | `x0` = new array |
| `__rt_array_free_deep` | 释放 array storage，并释放嵌套 heap-backed 元素 | `x0` = array | — |
| `__rt_array_union` | 构建 PHP indexed-array union：左侧数字 key 胜出，只追加右侧缺失的 suffix key | `x0` = left array, `x1` = right array | `x0` = result array |
| `__rt_array_hash_union` | 构建 PHP indexed+associative union：先把左侧 index 转换为 integer hash key，再追加右侧缺失 entry | `x0` = left array, `x1` = right hash | `x0` = result hash |
| `__rt_array_push_int` | 向 array 追加 int（按需增长） | `x0` = array, `x1` = value | `x0` = array |
| `__rt_array_push_refcounted` | 对借用的 heap payload 执行 `incref`，再作为 8 字节 array element 追加 | `x0` = array, `x1` = heap ptr | `x0` = array |
| `__rt_array_push_str` | 持久化字符串并追加到 array（按需增长） | `x0` = array, `x1`/`x2` = str | `x0` = array |
| `__rt_sort_int` / `__rt_rsort_int` | 原地升序或降序排序 | `x0` = array | — |
| `__rt_str_persist` | 把字符串从 concat_buf 复制到堆（跳过 .data/heap） | `x1`/`x2` = str | `x1`/`x2` = heap str |

常见的会产生副本的 array/hash 例程，现在也为嵌套 heap-backed payload 提供专用的 `_refcounted` 兄弟版本。这些变体会先保留借用值，再把它们 push 或 insert 到新分配的 array/hash table 中，覆盖带 spread 的数组字面量，以及 `array_merge`、`array_chunk`、`array_slice`、`array_reverse`、`array_pad`、`array_unique`、`array_splice`、`array_diff`、`array_intersect`、`array_filter`、`array_fill`、`array_combine` 和 `array_fill_keys`。

| Refcounted 兄弟例程 | 作用 |
|---|---|
| `__rt_array_reverse_refcounted` | 反转 indexed array，同时保留嵌套 heap-backed 元素 |
| `__rt_array_merge_refcounted` | 合并携带嵌套 heap-backed payload 的 indexed array |
| `__rt_array_slice_refcounted` / `__rt_array_splice_refcounted` | 在 slice 或 splice 时保留嵌套 heap-backed payload |
| `__rt_array_unique_refcounted` | 去重，同时保留被 retain 的 heap-backed 元素 |
| `__rt_array_fill_refcounted` / `__rt_array_fill_keys_refcounted` | 从借用的 heap-backed 值构建填充 array/hash |
| `__rt_array_pad_refcounted` | 用 retain 后的 heap-backed 值填充 array |
| `__rt_array_diff_refcounted` / `__rt_array_intersect_refcounted` | 集合式比较，并保持嵌套 heap-backed 值存活 |
| `__rt_array_combine_refcounted` | 把 key/value array 组合成 hash，同时保留 heap-backed 值 |
| `__rt_array_chunk_refcounted` | 把 array 拆分成 retain 后的 heap-backed chunk |
| `__rt_array_filter_refcounted` | 过滤 heap-backed 元素数组，同时不丢弃借用 payload；可选第三个参数携带 captured-closure environment |
| `__rt_array_merge_into_refcounted` | 把一个 indexed array 原地追加到另一个中，同时保留嵌套 heap-backed 元素 |

### Hash table（用于关联数组）

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_hash_fnv1a` | 字符串的 FNV-1a hash | `x1`/`x2` = string | `x0` = hash |
| `__rt_hash_normalize_key` | 规范化 PHP string array key，把整数形式的 numeric string 转换成 integer key | `x1`/`x2` = string key | `x1`/`x2` = normalized key |
| `__rt_hash_key_hash` | 对规范化后的 int/string array key 求 hash | `x1`/`x2` = normalized key | `x0` = hash |
| `__rt_hash_key_eq` | 比较规范化后的 int/string array key | `x1`/`x2`, `x3`/`x4` = keys | `x0` = equal flag |
| `__rt_hash_new` | 创建 hash table | `x0` = capacity, `x1` = coarse value-type summary | `x0` = hash ptr |
| `__rt_hash_clone_shallow` | 为 copy-on-write split 克隆 hash storage，按需重新持久化 key 并保留嵌套 heap value | `x0` = hash | `x0` = new hash |
| `__rt_hash_ensure_unique` | 在 mutation 前拆分共享 hash table | `x0` = hash | `x0` = unique hash |
| `__rt_hash_grow` | 把 hash table capacity 翻倍，并重新散列所有 entry | `x0` = hash | `x0` = new hash |
| `__rt_hash_set` | 插入/更新（负载 75% 时增长） | `x0`=hash, `x1`/`x2`=normalized key, `x3`/`x4`=value, `x5`=value_tag | `x0` = hash |
| `__rt_hash_append` | 使用 PHP 的下一个自动整数 key（最大已有 int key + 1，或 0）追加，然后委托给 `__rt_hash_set` | `x0`=hash, `x3`/`x4`=value, `x5`=value_tag | `x0` = hash |
| `__rt_hash_insert_owned` | 在 hash growth 期间重新插入已经拥有所有权的 key/value pair | `x0`=hash, `x1`/`x2`=normalized key, `x3`/`x4`=value, `x5`=value_tag | `x0` = hash |
| `__rt_hash_get` | 按 key 查找 value | `x0`=hash, `x1`/`x2`=normalized key | `x0`=found, `x1`=val_lo, `x2`=val_hi, `x3`=value_tag |
| `__rt_hash_iter_next` | 按插入顺序迭代到下一个 entry | `x0`=hash, `x1`=cursor | `x0`=next cursor, `x1`/`x2`=key, `x3`/`x4`=value, `x5`=value_tag |
| `__rt_hash_union` | 构建 PHP associative-array union：左侧重复 key 胜出，缺失的右侧 entry 按插入顺序追加 | `x0`=left hash, `x1`=right hash | `x0`=result hash |
| `__rt_hash_array_union` | 通过克隆左侧 hash 并追加共享 key space 中不存在的右侧 index，构建 PHP associative+indexed union | `x0`=left hash, `x1`=right array | `x0`=result hash |
| `__rt_hash_count` | 统计 occupied entry 数量 | `x0`=hash | `x0`=count |
| `__rt_hash_free_deep` | 释放 hash table、其拥有的 key 以及嵌套 heap-backed value | `x0`=hash | — |
| `__rt_hash_to_mixed` | 对 hash 执行 copy-on-write，然后把每个 entry payload 拓宽成 boxed Mixed cell，让 by-reference `foreach` 可以 alias 稳定的 pointer slot | `x0`=hash | `x0` = same hash |
| `__rt_mixed_from_value` | 把 tagged payload 装箱成 heap-allocated mixed cell | `x0`=value_tag, `x1`=value_lo, `x2`=value_hi | `x0` = mixed cell |
| `__rt_mixed_write_stdout` | 检查 boxed mixed value 的 inner tag 并打印 | `x0` = mixed cell | — |

`__rt_hash_iter_next` 使用一个小型 cursor 协议，而不是 raw slot index：`0` 从 hash header 的 `head` 开始，正数 cursor 编码为 `slot_index + 1`，`-2` 表示产出最后一个 entry 之后的 post-tail 状态，`-1` 表示迭代已经耗尽。

关于 hash table 的内存布局，参见 [Memory Model](memory-model.md)。

### 数组操作

| 例程 | 作用 |
|---|---|
| `__rt_array_key_exists` | 检查 integer key 是否在边界内 |
| `__rt_warn_undefined_array_key_int` | 对缺失的 integer key 发出 PHP 的 `Undefined array key` warning（仅 warning；调用方仍提供 null fallback） |
| `__rt_array_search` | 在 indexed array 中线性搜索 value |
| `__rt_array_reverse` | 反转元素顺序 |
| `__rt_array_sum` / `__rt_array_product` | 对所有元素求和/求积 |
| `__rt_array_shift` / `__rt_array_unshift` | 从开头移除/添加 |
| `__rt_array_merge` | 把两个 indexed array 拼接成新数组 |
| `__rt_array_merge_into` | 把源 array 的所有元素原地追加到目标 array |
| `__rt_array_slice` / `__rt_array_splice` | 从 indexed array 中提取 slice 并移除 splice window |
| `__rt_array_unique` | 移除重复值 |
| `__rt_array_diff` / `__rt_array_intersect` | 按 value 做集合差集/交集 |
| `__rt_array_diff_key` / `__rt_array_intersect_key` | 按 key 做集合操作 |
| `__rt_array_flip` | 把 indexed integer value 翻转成 associative-array key |
| `__rt_array_flip_string` | 把 indexed string value 翻转成 associative-array key，并规范化 numeric-string key |
| `__rt_array_combine` | 合并 key array + value array → AssocArray |
| `__rt_array_fill` / `__rt_array_fill_keys` | 创建填充数组 |
| `__rt_array_chunk` / `__rt_array_pad` | 分块/填充数组 |
| `__rt_array_column` | 从 assoc array 数组中提取列（int value） |
| `__rt_array_column_ref` | 提取被 retain 的 heap-backed value 列（arrays / hashes / objects） |
| `__rt_array_column_str` | 从 assoc array 数组中提取列（string value） |
| `__rt_array_column_mixed` | 为异构输入 payload 把列值提取为 boxed Mixed cell |
| `__rt_range` | 生成 integer range array |
| `__rt_shuffle` / `__rt_array_rand` | 打乱顺序 / 随机选择 |
| `__rt_random_u32` / `__rt_random_uniform` | `rand()`、`random_int()`、`shuffle()` 和 `array_rand()` 使用的 target-aware random primitive |
| `__rt_asort` / `__rt_arsort` | 按 value 排序并保留 key，升序或降序 |
| `__rt_ksort` / `__rt_krsort` | 按 key 升序或降序排序 |
| `__rt_natsort` / `__rt_natcasesort` | 自然顺序排序，区分或不区分大小写 |
| `__rt_array_map` | 对每个 scalar element 应用 callback，返回新数组；可选第三个参数携带 generated callback wrapper 的 captured-closure environment |
| `__rt_array_map_str` | 对每个 scalar 或 string element 应用 callback，并返回 string array；可选第三个参数携带 captured-closure environment |
| `__rt_array_map_str_owned` | 应用返回 owned string 的 descriptor-wrapper callback，并把这些 string 直接转移到结果数组 |
| `__rt_array_map_mixed` | 应用 descriptor-backed callback，返回 owned boxed Mixed cell，并直接存入新分配的结果数组 |
| `__rt_array_filter` | 过滤 callback 返回 truthy 的 scalar element；可选第三个参数携带 captured-closure environment |
| `__rt_array_reduce` | 通过 callback 把 array 归约成单个值；可选第四个参数携带 captured-callback environment |
| `__rt_array_walk` | 对每个元素调用 callback（产生副作用）；可选第三个参数携带 captured-callback environment |
| `__rt_usort` | 使用用户比较 callback 排序 array；可选第三个参数携带 captured-callback environment |
