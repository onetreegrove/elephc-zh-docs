## 内存限制与权衡

| 资源 | 大小 | 耗尽时的行为 |
|---|---|---|
| 栈 | 操作系统默认值（约 8MB） | 栈溢出（崩溃） |
| 字符串缓冲区 | 64KB | 每条语句重置——实际上无限制 |
| 堆 | 8MB（可配置） | 致命错误："heap memory exhausted" |
| 堆元数据 | `_heap_off`、`_heap_free_list`、`_heap_small_bins`、`_heap_debug_enabled`、`_gc_*` 标志/计数器，共 104 字节 | 固定大小的内部记录，对用户不可见 |
| 异常状态 | `_exc_handler_top`、`_exc_call_frame_top`、`_exc_value`，共 24 字节 | 固定大小的 setjmp/longjmp 处理器及抛出值记录 |
| Fiber 调度器状态 | `_fiber_current`、`_fiber_main_saved_sp`、`_fiber_main_saved_exc`、`_fiber_main_saved_call_frame`，共 32 字节 | 固定大小的当前 Fiber 及主帧恢复记录 |
| 运行时诊断 | `_rt_diag_suppression`，共 8 字节 | 固定大小的警告抑制深度，供 `@` 运算符和异常展开使用 |
| JSON 状态 | `_json_last_error`、`_json_active_flags`、`_json_active_depth`、`_json_indent_depth`、`_json_depth_limit`、`_json_validate_idx`、`_json_validate_ptr`、`_json_validate_len`、`_json_decode_assoc`、`_json_error_source_ptr`、`_json_error_location_active`、`_json_error_line`、`_json_error_column`，共 104 字节 | 固定大小的 JSON 调用及解码错误位置记录 |
| CLI 全局变量 | `_global_argc`、`_global_argv`，共 16 字节 | 固定大小的内部记录 |
| 用户全局变量 | 每个 `global $var` 槽位 16 字节 | 随引用的全局变量数量增长 |
| 静态变量 | 每个 `static $var` 24 字节（`16 + 8` 初始化标志） | 随声明的静态局部变量数量增长 |
| 静态属性 | 每个有效声明类的静态属性 16 字节 | 随声明及重声明的静态属性数量增长 |
| 数组容量 | 创建时固定，直到扩容/重哈希逻辑触发 | 若达到硬限制则致命错误："array capacity exceeded" |
| C 字符串缓冲区 | `_cstr_buf`、`_cstr_buf2` 各 4KB，`_empty_str` 1 字节 | 超长路径/字符串会截断至缓冲区大小；`_empty_str` 是安全的零长度字符串指针 |
| 文件描述符状态 | `_eof_flags`、`_stream_read_filters`、`_stream_write_filters` 各 256 字节；`_popen_files`、`_dir_handles`、`_glob_handles`、`_zstream_handles`、`_bzstream_handles`、`_iconv_handles`、`_tls_sessions`、`_stream_chunk_size` 各 2048 字节 | 支持最多 256 个描述符的流、进程、目录、压缩、iconv、TLS 及块大小的逐 fd 记录 |
| 流过滤器暂存区 | `_stream_filter_buf`、`_stream_grow_scratch` 各 64KB | 流过滤器的暂存空间，包括 base64、quoted-printable 编码器等扩增长度的过滤器 |
| 流上下文与回调 | `_stream_context_options`、`_stream_notification_callback`、`_stream_connect_host`、`_stream_open_opened_path_scratch`、`_url_stat_matched` | 当前流上下文选项哈希、通知回调、TLS 对端主机名、包装器已打开路径暂存及包装器 url_stat 匹配标志 |
| TLS 与加密函数槽位 | `_elephc_tls_*_fn`、`_zlib_*_fn`、`_bz2_*_fn`、`_phar_zlib_*_fn`、`_phar_bz2_*_fn`、`_iconv_*_fn`、`_elephc_crypto_*_fn`，每槽 8 字节 | 延迟绑定的函数指针，仅在调用点发布符号时才链接可选的 TLS/压缩/iconv/加密支持 |
| HTTP/HTTPS/FTP 缓冲区 | `_http_resp_buf`、`_https_resp_buf`、`_user_wrapper_drain_buf`、`_phar_write_out` 各 1MB；`_http_req_scratch` 8KB；`_http_redirect_path_buf`、`_fgc_url_retr` 各 2KB；`_fgc_url_addr`、`_fsockopen_addr` 各 512 字节；`_ftp_resp_buf` 4KB；`_ftp_data_addr`、`_ftp_cmd_scratch` 各 64 字节 | 协议专用的响应、请求、重定向、FTP、包装器及 PHAR 写入暂存缓冲区 |
| HTTP 活跃上下文 | `_http_active_ignore_errors`、`_http_active_max_redirects`、`_http_active_timeout_seconds`、`_http_active_proxy_ptr`、`_http_active_proxy_len`、`_http_active_host_ptr`、`_http_active_host_len`、`_http_redirect_path_len` | HTTP 请求构建与重定向/打开辅助函数之间共享的固定大小状态 |
| Socket 地址暂存区 | `_recvfrom_addr_ptr`、`_recvfrom_addr_len`、`_accept_peer_ptr`、`_accept_peer_len` 各 8 字节 | 存储通过引用传递的 socket 参数所返回的对端/地址字符串 |
| 协议/服务查找缓冲区 | `_protoent_buf` 32KB，`_servent_buf` 1MB | 协议和服务数据库查找的暂存缓冲区 |
| 主体查找缓冲区 | `_principal_lookup_buf` 4KB，`_etc_passwd_path`、`_etc_group_path`、`_principal_lookup_read_mode` | 暂存行缓冲区及固定字面量，用于 `chown()`/`chgrp()` 字符串名称解析时扫描 `/etc/passwd` / `/etc/group`（不使用 NSS） |
| 用户包装器与过滤器注册表 | `_user_wrappers`、`_user_wrapper_handles` 各 2048 字节；`_user_filter_registry`、`_user_filter_instances` 各 4096 字节 | 已注册的流包装器、活跃包装器句柄、用户过滤器定义及已挂载的过滤器实例 |
| PHAR 写入状态 | `_phar_write_len`、`_phar_write_tpl_len`、`_phar_write_path_ptr`、`_phar_write_path_len`、`_phar_write_entry_ptr`、`_phar_write_entry_len`、`_phar_write_url_ptr`、`_phar_write_url_len` 各 8 字节 | 与 1MB `_phar_write_out` 归档缓冲区配套的状态 |
| 数据段 | 无固定限制 | 随唯一字面量数量增长 |

## 内存管理策略

elephc 采用**带引用计数的空闲列表分配器加上定向循环收集器**——既非纯粹的碰撞分配，也不是全堆追踪式运行时。内存在以下情况下被回收：

1. **引用计数** — 每次堆分配都携带一个 32 位引用计数（初始值为 1）。共享引用时，`__rt_incref` 将其递增。释放引用时，`__rt_decref_array`、`__rt_decref_hash` 或 `__rt_decref_object` 将其递减，计数归零后释放该块
2. **数组/哈希的写时复制拆分** — 普通赋值仍然共享容器存储，但首次写操作会在修改前克隆共享容器
3. **代码生成阶段的所有权追踪** — 局部变量、全局变量、静态变量、`foreach` 变量、`list(...)` 目标及调用实参在编译期被分类为"拥有"或"借用"，以便新的所有者在存储借用的堆值前先保留它们
4. **变量重赋值** — 当 `$x = "new value"` 覆盖字符串或数组时，旧的堆块被释放或引用计数递减，并归还给分配器以供复用
5. **`unset($x)`** — 显式释放该变量的堆分配
6. **FFI 字符串调用清理** — 为 `extern function foo(string $s)` 调用创建的临时 C 字符串在原生调用返回后立即释放
7. **字符串缓冲区重置** — 拼接缓冲区在每条语句结束时重置；需要存活的字符串通过 `__rt_str_persist` 复制到堆上
8. **栈内存** — 函数返回时自动回收
9. **Generator 帧释放** — Generator 帧参与对象引用计数，并为其帧槽位和委托迭代器提供自定义的深度释放分支
10. **资源作用域清理** — Mixed 装箱资源（标签 9）在高位载荷字中携带资源类型子类型，当装箱被释放时 `__rt_mixed_free_deep` 会运行对应的析构函数：类型 1 = 原生流 fd（`close()`），类型 2 = HashContext 句柄（通过 `__rt_hash_ctx_free` 调用 `elephc_crypto_free`），类型 3 = `popen` 管道（`__rt_pclose`，关闭 `FILE*` 并回收子进程），类型 4 = `opendir` 流（`__rt_closedir`）。类型 0 资源（通用资源）被跳过；每个 fd 类型还会跳过句柄值 `>= 0x40000000`——这些是合成包装器句柄，以及显式调用 `fclose()`/`pclose()`/`closedir()` 后写入装箱的 `-1` 哨兵值，用于确保描述符不会被二次释放（即使其 fd 号已被复用）。别名安全性来自 Mixed 装箱的引用计数——`$b = $a` 会对装箱递增引用计数，因此只有最后一次释放才会触发析构函数
11. **进程退出** — 所有内存由操作系统回收

### 不会被释放的内容

- **不相邻的空闲块**仍然不会被压缩——尽管相邻空闲块在释放时会被合并、超大空闲块在分配时会被分割，但随时间推移碎片化仍可能发生
- **指针目标**仅因存在原始指针而不会被追踪所有权；指针值本身只是一个地址
- **`_concat_buf` 中的中间暂存字符串**不会被单独释放——缓冲区仅在每条语句结束时整体重置
- **通用函数尾声**不会对所有堆局部变量进行全量引用计数递减。当前仅对被判定为 `Owned` 的槽位进行选择性清理；当所有分支路径都直接将同一堆支持类型赋给同一局部变量时，完整的 `if`/`elseif`/`else` 分支结构可以恢复该清理逻辑。更动态的借用/控制流路径仍被有意排除在外
- **容器复制内置函数**不再对常见嵌套载荷路径盲目复制借用的堆句柄：带引用计数的运行时变体现在会在新数组/哈希表获得所有权前先保留值（涉及含展开语法的 `array` 字面量、`array_merge`、`array_chunk`、`array_slice`、`array_reverse`、`array_pad`、`array_unique`、`array_splice`、`array_diff`、`array_intersect`、`array_filter`、`array_fill`、`array_combine`、`array_fill_keys`）
- **回归测试覆盖范围**现在明确测试局部别名、借用的嵌套容器返回、`Owned`/`Borrowed` 控制流合并及作用域退出路径，以便未来的所有权工作拥有精确的检测点，而非仅依赖大型端到端测试套件
- **原始/堆外所有权循环**仍在收集器的范围之外。`ptr` 值、extern 管理的缓冲区及原始辅助分配（`kind=0`）不会仅因某处存在地址就被遍历
- **类型 0 资源**（通用/未知资源类型，包括合成用户包装器句柄 `>= 0x40000000`）不会被 Mixed 深度释放路径自动释放——其生命周期由包装器层或用户显式调用 `close()` 来管理。类型 1–4（原生流 fd、HashContext、`popen` 管道、`opendir` 流）则在作用域退出时自动释放
- **`hash_final()` 后复用 HashContext** 在内存安全上没有问题，但行为与 PHP 不等价：`elephc_crypto_final` 对*克隆体*执行 finalize 操作，原始句柄仍然存活并由其 Mixed 装箱拥有，因此装箱的类型 2 析构函数恰好释放一次。对同一句柄再次调用 `hash_final()` 或调用 `hash_update()`/`hash_copy()` 不会触发双重释放或释放后使用（PHP 中此时会抛出"Supplied resource is not a valid Hash Context resource"），而只是继续对仍然存活的上下文进行哈希运算（详见 `src/codegen/runtime/strings/hash_context.rs`）

### 定向循环收集

运行时现已包含针对堆支持的 `array`、关联数组/哈希及 `object` 图的定向收集器：

- 分配器头部携带统一的堆类型标签（`raw`、`string`、`array`、`hash`、`object`、`boxed mixed`）
- 索引数组将运行时 `value_type` 打包到同一类型字段中，以便收集器判断其元素是否可能包含嵌套堆指针
- 对象记录运行时属性标签/元数据，并以 `_class_gc_desc_*` 表作为属性遍历的编译期后备方案；Generator 帧是 object 类型的块，具有以 `_generator_class_id` 为键的自定义深度释放分支
- Mixed 释放路径使用 `__rt_decref_any`，使深度释放和 GC 遍历可通过统一的分发器释放嵌套的字符串/数组/哈希/对象

`__rt_gc_collect_cycles` 有意比完整追踪式 GC 更为局限：它忽略字符串和原始辅助缓冲区，清除临时元数据，仅统计堆内部的入边，标记外部可达的容器/对象块，然后通过深度释放辅助函数释放未标记的其余部分。这使收集器专注于纯引用计数无法解决的结构性泄漏类别，而无需将整个运行时改造成移动式或停止世界式的堆。
