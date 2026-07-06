## I/O routines

**Source:** `src/codegen/runtime/io/` (108 files)

These routines handle file and filesystem operations through target-aware libc/syscall helpers. PHP strings (pointer + length) must be converted to null-terminated C strings before passing to C or OS APIs — `__rt_cstr` handles the primary buffer and also emits `__rt_cstr2` for routines that need a second simultaneous C string.

The first table covers the file/filesystem core; the subsections after it cover the stream/networking surface emitted from the same directory: stream contexts and metadata, stream filters and user-defined stream wrappers, TCP/Unix/IPv6 sockets, TLS/SSL helpers, FTP/HTTP transfer helpers, hostname/service resolution, phar archives, and `var_dump`.

| Routine | What it does |
|---|---|
| `__rt_cstr` | Convert PHP string (ptr+len) to null-terminated C string |
| `__rt_fopen` | Open file via target-aware `open()` handling, or return `-1` after emitting a suppressible warning for open failures and invalid modes |
| `__rt_fgets` | Read line from file descriptor |
| `__rt_fgetc` | Read a single byte from a file descriptor (tail-calls `__rt_fread` with length 1) |
| `__rt_feof` | Check end-of-file flag for a file descriptor |
| `__rt_fread` | Read N bytes from file descriptor |
| `__rt_readfile` | Open a path, stream contents to stdout, and return copied byte count, `-1` on read failure, or a false sentinel on open failure |
| `__rt_fpassthru` | Stream the remaining bytes from an existing descriptor to stdout and return copied byte count or `-1` on read failure |
| `__rt_flock` | Call libc `flock()`, translating PHP's `LOCK_UN` constant and exposing would-block state for the optional output parameter |
| `__rt_tmpfile` | Create an anonymous temporary file descriptor through `mkstemp()` plus immediate unlink |
| `__rt_file_get_contents` | Read entire file into string, or return a null pointer after emitting a suppressible warning on failure |
| `__rt_file_put_contents` | Write string to file (create/truncate) |
| `__rt_file` | Read file into array of lines |
| `__rt_file_exists` / `__rt_is_file` / `__rt_is_dir` | Existence and path-type checks backed by `stat()` |
| `__rt_is_readable` / `__rt_is_writable` | Access checks backed by `access()` |
| `__rt_filesize` / `__rt_filemtime` | File size and modification timestamp from stat metadata |
| `__rt_fileatime` / `__rt_filectime` / `__rt_fileperms` / `__rt_fileowner` / `__rt_filegroup` / `__rt_fileinode` | Extended stat scalar metadata. Return a payload plus success flag so codegen can box PHP `false` without confusing legitimate zero values. |
| `__rt_filetype` / `__rt_is_executable` / `__rt_is_link` | File type and permission predicates; `filetype()` uses `lstat()` so symlinks report `"link"` and missing paths box as `false`. |
| `__rt_stat_array` / `__rt_lstat_array` / `__rt_fstat_array` | Build PHP-compatible stat arrays with numeric and string keys, returning a null pointer for codegen to box as `false` on failure |
| `__rt_unlink` / `__rt_mkdir` / `__rt_rmdir` / `__rt_chdir` | Filesystem path operations via libc/syscalls |
| `__rt_rename` / `__rt_copy` | Two-path filesystem helpers using dual C-string scratch buffers |
| `__rt_symlink` / `__rt_link` | Create symbolic or hard links through libc |
| `__rt_readlink` | Read a symbolic-link target into a heap-backed string, with null output for PHP `false` on failure |
| `__rt_linkinfo` | Return `lstat()` device metadata for a link path, or PHP's `-1` failure sentinel |
| `__rt_getcwd` | Get current working directory |
| `__rt_scandir` | List directory contents into array |
| `__rt_glob` | Pattern-match filenames |
| `__rt_tempnam` | Create temporary filename |
| `__rt_fgetcsv` | Parse CSV line from file |
| `__rt_fputcsv` | Write CSV line to file |
| `__rt_basename` / `__rt_dirname` / `__rt_dirname_levels` | Compute path components for `basename()` / `dirname()` including repeated parent traversal |
| `__rt_fnmatch` | Match shell-style path globs with PHP/libc-compatible flag bits for the selected target |
| `__rt_realpath` | Canonicalize an existing path, returning a null pointer on failure so codegen can box PHP `false` |
| `__rt_pathinfo_str` / `__rt_pathinfo_array` | Return one `pathinfo()` component for component flags, or build the associative-array `PATHINFO_ALL` shape |
| `__rt_chmod` / `__rt_chown` / `__rt_lchown` / name-resolving variants | File ownership and mode modification helpers, including symlink-aware ownership updates |
| `__rt_lookup_passwd_uid` / `__rt_lookup_group_gid` | Resolve local user/group names by scanning `/etc/passwd` and `/etc/group` without calling NSS, so static Linux binaries do not require glibc NSS modules at runtime |
| `__rt_umask` / `__rt_ftruncate` | Process umask and file truncation helpers |
| `__rt_fsync` / `__rt_fflush` / `__rt_fdatasync` | File descriptor flush helpers; `fflush()` maps to `fsync()` because elephc has no userspace stdio buffer |
| `__rt_touch` | Create missing files and update access/modification timestamps |

### Stream and socket routines

| Routine | What it does |
|---|---|
| `__rt_stream_socket_client` / `__rt_stream_socket_client_v6` | Open TCP client connections (IPv4/IPv6) with timeout handling |
| `__rt_stream_socket_server` / `__rt_stream_socket_server_v6` | Bind and listen on TCP server sockets (IPv4/IPv6) |
| `__rt_unix_socket_client` / `__rt_unix_socket_server` | Unix-domain socket client/server endpoints |
| `__rt_stream_socket_accept` | Accept a pending connection with optional timeout |
| `__rt_stream_socket_pair` | Create a connected socket pair |
| `__rt_stream_socket_recvfrom` / `__rt_stream_socket_sendto` | Datagram receive/send with peer-address formatting |
| `__rt_stream_socket_get_name` | Local or remote endpoint name for a socket |
| `__rt_stream_socket_shutdown` | Half/full shutdown of a connected socket |
| `__rt_socket_backlog` / `__rt_apply_socket_bindto` / `__rt_apply_socket_client_opts` / `__rt_apply_socket_server_opts` | Socket-option plumbing for context-driven behavior |
| `__rt_stream_select` | `stream_select()` over descriptor arrays via `poll()`/`select()` |
| `__rt_stream_set_blocking` / `__rt_stream_set_timeout` | Per-descriptor blocking mode and read timeout |
| `__rt_stream_get_contents` / `__rt_stream_get_contents_bounded` / `__rt_stream_get_line` | Bulk and line-delimited stream reads |
| `__rt_stream_copy_to_stream` | Copy bytes between two descriptors |
| `__rt_stream_get_meta_data` | Build the `stream_get_meta_data()` associative array |
| `__rt_stream_context_set_option_4` | Store context options consumed by the open/transfer helpers |
| `__rt_stream_isatty` | TTY detection for descriptors |
| `__rt_data_stream` | `data://` stream payload decoding |
| `__rt_get_ssl_peer_name` | Peer-certificate name lookup for TLS streams |

### Networking and transfer routines

| Routine | What it does |
|---|---|
| `__rt_http_open` / `__rt_https_open` | Open `http://` / `https://` streams (TLS via the elephc-tls bridge) |
| `__rt_http_build_request` | Assemble the HTTP request from context options (method, headers, body, `request_fulluri`) |
| `__rt_http_fire_notification` | Invoke the stream-notification callback during transfers |
| `__rt_ftp_open` / `__rt_ftp_send_recv` / `__rt_ftp_parse_pasv` | `ftp://` stream support (control dialog, passive-mode parsing) |
| `__rt_resolve_host` / `__rt_resolve_host_v6` | Hostname resolution to IPv4/IPv6 addresses |
| `__rt_gethostbyname` / `__rt_gethostbyaddr` / `__rt_gethostname` | Host lookup builtins |
| `__rt_getprotobyname` / `__rt_getprotobynumber` / `__rt_protoent_load` | Protocol-database lookups backed by `/etc/protocols` |
| `__rt_getservbyname` / `__rt_getservbyport` | Service-database lookups backed by `/etc/services` |

### User stream wrappers and filters

Userspace `streamWrapper` classes registered with `stream_wrapper_register()` dispatch through a vtable of `__rt_user_wrapper_*` routines (`fopen`/`fread`/`fwrite`/`fclose`/`feof`/`fseek`/`ftell`/`fflush`/`fstat`/`ftruncate`/`flock`/`set_option`/`stream_cast`, the `dir_*` family, `path_op`, and `rename`), each bridging the synthetic descriptor back to PHP method calls on the wrapper instance. Stream filters use `__rt_stream_filter_register`, `__rt_apply_stream_filter` / `__rt_apply_user_stream_filter`, `__rt_stream_filter_attach_user`, `__rt_resolve_user_filter_id`, `__rt_user_filter_brigade_invoke`, and `__rt_user_filter_release_fd` to run built-in (`zlib.*`, `bzip2.*`, `convert.iconv.*`, `string.*`) and user-defined filter chains over stream reads and writes.

### Phar archive routines

| Routine | What it does |
|---|---|
| `__rt_fopen_maybe_phar` / `__rt_file_get_contents_maybe_phar` | Route dynamic `phar://` read paths to archive entry reads and write-mode `fopen()` paths to PHAR write streams, falling through to plain file I/O otherwise |
| `__rt_phar_read_entry` | Locate and read one entry from a PHAR URL. When the `elephc-phar` bridge is published it handles native PHAR, tar, and ZIP containers; the assembly fallback handles native PHAR plus gzip/bzip2 payloads through published zlib/libbz2 slots |
| `__rt_phar_write_open` / `__rt_phar_write_open_url` / `__rt_phar_write_append` / `__rt_phar_write_finalize` / `__rt_file_put_contents_maybe_phar` | Buffer `phar://` write entries in bridge-owned descriptor slots, then finalize each through the `elephc-phar` bridge so native PHAR, tar, and ZIP archives preserve existing entries; runtime-built `file_put_contents()` and `fopen()` write URLs call a bridge variant that splits the full `phar://` URL; the assembly fallback still emits a single-entry SHA1-signed native archive |

### var_dump output routines

`var_dump()` lowering calls a family of `__rt_var_dump_array_*` routines (`int`, `float`, `str`, `bool`, `mixed`) that walk array payloads and a set of `__rt_var_dump_emit_*` helpers that print one typed line (`int(...)`, `float(...)`, `bool(...)`, string headers, indexed keys) with the PHP-compatible indentation.

## Pointer routines

**Source:** `src/codegen/runtime/pointers/` (7 files including `mod.rs`)

These helpers support the compiler-specific pointer builtins.

| Routine | What it does | Input | Output |
|---|---|---|---|
| `__rt_ptoa` | Format a pointer value as a hexadecimal string with `0x` prefix | `x0` = pointer/address | `x1`/`x2` = formatted string |
| `__rt_ptr_check_nonnull` | Abort with `Fatal error: null pointer dereference` if the pointer is null | `x0` = pointer/address | `x0` unchanged on success |
| `__rt_str_to_cstr` | Copy an elephc string to temporary null-terminated heap storage for a native call | `x1`/`x2` = string | `x0` = C string pointer |
| `__rt_cstr_to_str` | Copy a borrowed null-terminated C string back into an owned elephc string | `x0` = C string pointer | `x1`/`x2` = elephc string |
| `__rt_ptr_read_string` | Copy a fixed-length byte range from a raw pointer into an owned elephc string | `x0` = pointer, `x1` = length | `x1`/`x2` = elephc string |
| `__rt_ptr_write_string` | Copy an elephc string's bytes into the memory addressed by a raw pointer | `x0` = pointer, `x1`/`x2` = string | — |

## Buffer routines

**Source:** `src/codegen/runtime/buffers/` (5 files including `mod.rs`)

These helpers support the compiler-specific `buffer<T>` hot-path data type.

| Routine | What it does | Input | Output |
|---|---|---|---|
| `__rt_buffer_new` | Allocate a contiguous buffer with header `[length:8][stride:8]` followed by zero-initialized payload | `x0` = element count, `x1` = element stride | `x0` = buffer pointer |
| `__rt_buffer_len` | Read the logical element count from a buffer header | `x0` = buffer pointer | `x0` = length |
| `__rt_buffer_bounds_fail` | Abort with `Fatal error: buffer index out of bounds` | — | does not return |
| `__rt_buffer_use_after_free` | Abort with `Fatal error: use of buffer after buffer_free()` | — | does not return |