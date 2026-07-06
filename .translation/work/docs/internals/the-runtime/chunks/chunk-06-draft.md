## I/O 例程

**来源：** `src/codegen/runtime/io/`（108 个文件）

这些例程通过 target-aware libc/syscall helper 处理文件和文件系统操作。PHP string（pointer + length）在传给 C 或 OS API 前必须转换成 null-terminated C string；`__rt_cstr` 处理主缓冲区，也会为需要第二个同时存在的 C string 的例程发出 `__rt_cstr2`。

第一张表覆盖 file/filesystem 核心；后续小节覆盖同一目录发出的 stream/networking surface：stream context 和 metadata、stream filter 和 user-defined stream wrapper、TCP/Unix/IPv6 socket、TLS/SSL helper、FTP/HTTP transfer helper、hostname/service resolution、phar archive，以及 `var_dump`。

| 例程 | 作用 |
|---|---|
| `__rt_cstr` | 把 PHP string（ptr+len）转换成 null-terminated C string |
| `__rt_fopen` | 通过 target-aware `open()` handling 打开文件；打开失败或 mode 无效时发出可抑制 warning 后返回 `-1` |
| `__rt_fgets` | 从 file descriptor 读取一行 |
| `__rt_fgetc` | 从 file descriptor 读取单个字节（tail-call `__rt_fread`，长度为 1） |
| `__rt_feof` | 检查 file descriptor 的 end-of-file flag |
| `__rt_fread` | 从 file descriptor 读取 N 字节 |
| `__rt_readfile` | 打开路径，把内容 stream 到 stdout，并返回复制的字节数；读取失败返回 `-1`，打开失败返回 false sentinel |
| `__rt_fpassthru` | 把现有 descriptor 的剩余字节 stream 到 stdout，并返回复制的字节数或读取失败的 `-1` |
| `__rt_flock` | 调用 libc `flock()`，转换 PHP 的 `LOCK_UN` 常量，并为可选输出参数暴露 would-block 状态 |
| `__rt_tmpfile` | 通过 `mkstemp()` 加立即 unlink 创建匿名临时 file descriptor |
| `__rt_file_get_contents` | 把整个文件读入 string；失败时发出可抑制 warning 后返回 null pointer |
| `__rt_file_put_contents` | 把 string 写入文件（创建/截断） |
| `__rt_file` | 把文件读取成行数组 |
| `__rt_file_exists` / `__rt_is_file` / `__rt_is_dir` | 基于 `stat()` 的存在性和路径类型检查 |
| `__rt_is_readable` / `__rt_is_writable` | 基于 `access()` 的访问检查 |
| `__rt_filesize` / `__rt_filemtime` | 来自 stat metadata 的文件大小和修改时间戳 |
| `__rt_fileatime` / `__rt_filectime` / `__rt_fileperms` / `__rt_fileowner` / `__rt_filegroup` / `__rt_fileinode` | 扩展 stat scalar metadata。返回 payload 加 success flag，让 codegen 可以 box PHP `false`，而不会混淆合法的零值。 |
| `__rt_filetype` / `__rt_is_executable` / `__rt_is_link` | 文件类型和权限 predicate；`filetype()` 使用 `lstat()`，因此 symlink 会报告 `"link"`，缺失路径会 box 为 `false`。 |
| `__rt_stat_array` / `__rt_lstat_array` / `__rt_fstat_array` | 构建兼容 PHP 的 stat array，包含数字 key 和字符串 key；失败时返回 null pointer，供 codegen box 成 `false` |
| `__rt_unlink` / `__rt_mkdir` / `__rt_rmdir` / `__rt_chdir` | 通过 libc/syscall 执行 filesystem path operation |
| `__rt_rename` / `__rt_copy` | 使用双 C-string scratch buffer 的双路径 filesystem helper |
| `__rt_symlink` / `__rt_link` | 通过 libc 创建 symbolic link 或 hard link |
| `__rt_readlink` | 把 symbolic-link target 读入 heap-backed string；失败时输出 null，供 PHP `false` 使用 |
| `__rt_linkinfo` | 返回 link path 的 `lstat()` device metadata，或 PHP 的 `-1` failure sentinel |
| `__rt_getcwd` | 获取当前工作目录 |
| `__rt_scandir` | 把目录内容列成数组 |
| `__rt_glob` | 对文件名做 pattern-match |
| `__rt_tempnam` | 创建临时文件名 |
| `__rt_fgetcsv` | 从文件解析 CSV 行 |
| `__rt_fputcsv` | 向文件写入 CSV 行 |
| `__rt_basename` / `__rt_dirname` / `__rt_dirname_levels` | 计算 `basename()` / `dirname()` 的路径组件，包括重复父级遍历 |
| `__rt_fnmatch` | 用 PHP/libc 兼容的 flag bit 为所选 target 匹配 shell-style path glob |
| `__rt_realpath` | 规范化现有路径；失败时返回 null pointer，让 codegen box 为 PHP `false` |
| `__rt_pathinfo_str` / `__rt_pathinfo_array` | 为 component flag 返回一个 `pathinfo()` component，或构建 associative-array `PATHINFO_ALL` 形态 |
| `__rt_chmod` / `__rt_chown` / `__rt_lchown` / name-resolving variants | 文件所有权和 mode 修改 helper，包括感知 symlink 的所有权更新 |
| `__rt_lookup_passwd_uid` / `__rt_lookup_group_gid` | 通过扫描 `/etc/passwd` 和 `/etc/group` 解析本地 user/group name，不调用 NSS，因此 static Linux binary 运行时不需要 glibc NSS module |
| `__rt_umask` / `__rt_ftruncate` | 进程 umask 和文件截断 helper |
| `__rt_fsync` / `__rt_fflush` / `__rt_fdatasync` | File descriptor flush helper；`fflush()` 映射到 `fsync()`，因为 elephc 没有 userspace stdio buffer |
| `__rt_touch` | 创建缺失文件并更新访问/修改时间戳 |

### Stream 和 socket 例程

| 例程 | 作用 |
|---|---|
| `__rt_stream_socket_client` / `__rt_stream_socket_client_v6` | 打开 TCP client connection（IPv4/IPv6），带 timeout handling |
| `__rt_stream_socket_server` / `__rt_stream_socket_server_v6` | 绑定并监听 TCP server socket（IPv4/IPv6） |
| `__rt_unix_socket_client` / `__rt_unix_socket_server` | Unix-domain socket client/server endpoint |
| `__rt_stream_socket_accept` | 接受 pending connection，支持可选 timeout |
| `__rt_stream_socket_pair` | 创建 connected socket pair |
| `__rt_stream_socket_recvfrom` / `__rt_stream_socket_sendto` | Datagram receive/send，并格式化 peer-address |
| `__rt_stream_socket_get_name` | 获取 socket 的 local 或 remote endpoint name |
| `__rt_stream_socket_shutdown` | 对 connected socket 执行 half/full shutdown |
| `__rt_socket_backlog` / `__rt_apply_socket_bindto` / `__rt_apply_socket_client_opts` / `__rt_apply_socket_server_opts` | 为 context-driven behavior 提供 socket-option plumbing |
| `__rt_stream_select` | 通过 `poll()`/`select()` 对 descriptor array 执行 `stream_select()` |
| `__rt_stream_set_blocking` / `__rt_stream_set_timeout` | 设置每个 descriptor 的 blocking mode 和 read timeout |
| `__rt_stream_get_contents` / `__rt_stream_get_contents_bounded` / `__rt_stream_get_line` | 批量和按行分隔的 stream read |
| `__rt_stream_copy_to_stream` | 在两个 descriptor 之间复制字节 |
| `__rt_stream_get_meta_data` | 构建 `stream_get_meta_data()` associative array |
| `__rt_stream_context_set_option_4` | 存储 open/transfer helper 消费的 context option |
| `__rt_stream_isatty` | 为 descriptor 检测 TTY |
| `__rt_data_stream` | `data://` stream payload decoding |
| `__rt_get_ssl_peer_name` | TLS stream 的 peer-certificate name lookup |

### Networking 和 transfer 例程

| 例程 | 作用 |
|---|---|
| `__rt_http_open` / `__rt_https_open` | 打开 `http://` / `https://` stream（TLS 通过 elephc-tls bridge） |
| `__rt_http_build_request` | 从 context option 组装 HTTP request（method、header、body、`request_fulluri`） |
| `__rt_http_fire_notification` | 在 transfer 期间调用 stream-notification callback |
| `__rt_ftp_open` / `__rt_ftp_send_recv` / `__rt_ftp_parse_pasv` | `ftp://` stream support（control dialog、passive-mode parsing） |
| `__rt_resolve_host` / `__rt_resolve_host_v6` | 把 hostname 解析为 IPv4/IPv6 address |
| `__rt_gethostbyname` / `__rt_gethostbyaddr` / `__rt_gethostname` | Host lookup builtin |
| `__rt_getprotobyname` / `__rt_getprotobynumber` / `__rt_protoent_load` | 基于 `/etc/protocols` 的 protocol-database lookup |
| `__rt_getservbyname` / `__rt_getservbyport` | 基于 `/etc/services` 的 service-database lookup |

### 用户 stream wrapper 和 filter

通过 `stream_wrapper_register()` 注册的 userspace `streamWrapper` class，会通过一组 `__rt_user_wrapper_*` 例程 vtable 分发（`fopen`/`fread`/`fwrite`/`fclose`/`feof`/`fseek`/`ftell`/`fflush`/`fstat`/`ftruncate`/`flock`/`set_option`/`stream_cast`、`dir_*` family、`path_op` 和 `rename`），每个例程都会把 synthetic descriptor 桥接回 wrapper instance 上的 PHP method call。Stream filter 使用 `__rt_stream_filter_register`、`__rt_apply_stream_filter` / `__rt_apply_user_stream_filter`、`__rt_stream_filter_attach_user`、`__rt_resolve_user_filter_id`、`__rt_user_filter_brigade_invoke` 和 `__rt_user_filter_release_fd`，在 stream 读写上运行 builtin（`zlib.*`、`bzip2.*`、`convert.iconv.*`、`string.*`）和用户定义 filter chain。

### Phar archive 例程

| 例程 | 作用 |
|---|---|
| `__rt_fopen_maybe_phar` / `__rt_file_get_contents_maybe_phar` | 把 dynamic `phar://` read path 路由到 archive entry read，并把 write-mode `fopen()` path 路由到 PHAR write stream；其他情况落回普通 file I/O |
| `__rt_phar_read_entry` | 从 PHAR URL 定位并读取一个 entry。发布 `elephc-phar` bridge 时，它会处理 native PHAR、tar 和 ZIP container；assembly fallback 通过发布的 zlib/libbz2 slot 处理 native PHAR 和 gzip/bzip2 payload |
| `__rt_phar_write_open` / `__rt_phar_write_open_url` / `__rt_phar_write_append` / `__rt_phar_write_finalize` / `__rt_file_put_contents_maybe_phar` | 在 bridge-owned descriptor slot 中 buffer `phar://` write entry，然后通过 `elephc-phar` bridge finalize 每个 entry，使 native PHAR、tar 和 ZIP archive 保留已有 entry；运行时构建的 `file_put_contents()` 和 `fopen()` write URL 会调用一个拆分完整 `phar://` URL 的 bridge variant；assembly fallback 仍会发出单 entry、SHA1-signed 的 native archive |

### var_dump 输出例程

`var_dump()` lowering 会调用一组 `__rt_var_dump_array_*` 例程（`int`、`float`、`str`、`bool`、`mixed`）遍历 array payload，并调用一组 `__rt_var_dump_emit_*` helper，以 PHP 兼容缩进打印单个 typed line（`int(...)`、`float(...)`、`bool(...)`、string header、indexed key）。

## 指针例程

**来源：** `src/codegen/runtime/pointers/`（包含 `mod.rs` 在内共 7 个文件）

这些 helper 支持编译器专用的 pointer builtin。

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_ptoa` | 把 pointer value 格式化成带 `0x` 前缀的十六进制字符串 | `x0` = pointer/address | `x1`/`x2` = formatted string |
| `__rt_ptr_check_nonnull` | 如果 pointer 为 null，则以 `Fatal error: null pointer dereference` 中止 | `x0` = pointer/address | `x0` unchanged on success |
| `__rt_str_to_cstr` | 把 elephc string 复制到临时 null-terminated heap storage，供 native call 使用 | `x1`/`x2` = string | `x0` = C string pointer |
| `__rt_cstr_to_str` | 把借用的 null-terminated C string 复制回 owned elephc string | `x0` = C string pointer | `x1`/`x2` = elephc string |
| `__rt_ptr_read_string` | 从 raw pointer 复制固定长度 byte range，生成 owned elephc string | `x0` = pointer, `x1` = length | `x1`/`x2` = elephc string |
| `__rt_ptr_write_string` | 把 elephc string 的字节复制到 raw pointer 指向的内存 | `x0` = pointer, `x1`/`x2` = string | — |

## Buffer 例程

**来源：** `src/codegen/runtime/buffers/`（包含 `mod.rs` 在内共 5 个文件）

这些 helper 支持编译器专用的 `buffer<T>` hot-path data type。

| 例程 | 作用 | 输入 | 输出 |
|---|---|---|---|
| `__rt_buffer_new` | 分配连续 buffer，header 为 `[length:8][stride:8]`，后跟 zero-initialized payload | `x0` = element count, `x1` = element stride | `x0` = buffer pointer |
| `__rt_buffer_len` | 从 buffer header 读取 logical element count | `x0` = buffer pointer | `x0` = length |
| `__rt_buffer_bounds_fail` | 以 `Fatal error: buffer index out of bounds` 中止 | — | does not return |
| `__rt_buffer_use_after_free` | 以 `Fatal error: use of buffer after buffer_free()` 中止 | — | does not return |
