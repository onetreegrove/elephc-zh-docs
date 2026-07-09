---
title: "流"
description: "流资源、包装器、上下文、过滤器、套接字、TLS 和进程管道。"
sidebar:
  order: 13
---

## 资源模型

流是 PHP 的 `resource` 值。文件句柄、标准流、目录流、套接字流、进程管道、流上下文和流过滤器都使用资源运行时（runtime）标记，而不是普通的整数。

`fopen()` 返回 `resource|false`：成功打开会产生流资源，而打开失败则会发出可抑制的运行时警告并返回 `false`。将该 `false` 值传递给流内置函数（builtin）会导致致命的运行时 TypeError，因此代码在处理句柄前应先防范打开失败的情况。

`STDIN`、`STDOUT` 和 `STDERR` 都是流资源。`gettype(STDIN)` 返回 `"resource"`，`is_resource(STDIN)` 返回 `true`，且 `get_resource_type(STDIN)` 返回 `"stream"`。

## 基础流 I/O

| 函数 | 签名 | 描述 |
|---|---|---|
| `fopen()` | `fopen($filename, $mode, $use_include_path = false, $context = null): resource\|false` | 打开一个文件、包装器（wrapper） URL、类似套接字的包装器，或临时/内存流。支持模式 `r`、`w`、`a`、`r+`、`w+` 和 `a+`。可选参数按源码中的顺序求值；v1 的消费者仍然从单个全局流上下文插槽中读取选项。 |
| `fclose()` | `fclose(resource $handle): bool` | 关闭流。关闭 `phar://` 写入流会完成归档文件的构建，关闭经过过滤的流会运行待处理的过滤器清理操作，例如用户过滤器中的 `onClose()`。 |
| `fread()` | `fread(resource $handle, $length): string` | 读取最多 `$length` 字节。已挂载的读取过滤器和用户包装器的 `stream_read()` 方法将生效。 |
| `fwrite()` | `fwrite(resource $handle, $data): int` | 写入字节并返回写入的字节数。已挂载的写入过滤器和用户包装器的 `stream_write()` 方法将生效。 |
| `fprintf()` | `fprintf(resource $handle, string $format, ...$values): int` | 像 `sprintf()` 一样格式化并写入到流。 |
| `vfprintf()` | `vfprintf(resource $handle, string $format, array $values): int` | 类似于 `fprintf()`，但格式化的值以数组形式提供。 |
| `fscanf()` | `fscanf(resource $handle, string $format): array` | 读取一行并使用 `sscanf()` 引擎对其进行解析。v1 支持接收两个参数并返回数组的形式，以及 `%d`、`%f`、`%s` 和 `%%` 的转换格式。 |
| `fgets()` | `fgets(resource $handle, int $length = null): string\|false` | 读取一行，直到遇到换行符、EOF 或达到 `$length`；在文件末尾（EOF）时返回 `false`。 |
| `fgetc()` | `fgetc(resource $handle): string\|false` | 读取一个字节，或者在 EOF/失败时返回 `false`。 |
| `feof()` | `feof(resource $handle): bool` | 报告流是否已到达 EOF。 |
| `fseek()` | `fseek(resource $handle, $offset [, $whence]): int` | 定位流的指针位置。用户包装器会路由到 `stream_seek()`。 |
| `ftell()` | `ftell(resource $handle): int` | 返回当前流的指针位置。用户包装器会路由到 `stream_tell()`。 |
| `rewind()` | `rewind(resource $handle): bool` | 将指针定位到流的开头。 |
| `fgetcsv()` | `fgetcsv(resource $handle [, $sep]): array` | 读取并解析一行 CSV。用户包装器通过 `stream_read()` 进行读取。 |
| `fputcsv()` | `fputcsv(resource $handle, $fields [, $sep]): int` | 格式化并写入一行 CSV。用户包装器通过 `stream_write()` 进行写入。 |
| `readline()` | `readline([$prompt]): string` | 从标准输入读取一行。 |
| `readfile()` | `readfile($filename): int\|false` | 打开一个路径或包装器 URL，将其流式传输到标准输出（stdout），并返回复制的字节数；当打开失败时返回 `false`。 |
| `fpassthru()` | `fpassthru(resource $handle): int` | 将打开句柄的剩余字节流式传输到标准输出，读取失败时返回 `-1`。 |
| `stream_get_contents()` | `stream_get_contents(resource $handle, ?int $length = null, int $offset = -1): string\|false` | 从流中读取剩余字节。如果 `$offset >= 0`，则首先定位到该位置（可定位流/通过 `stream_seek()` 的用户包装器），若定位失败则返回 `false`；有限的 `$length` 最多读取该数量的字节（`null`/负数 `$length` 将读取到 EOF）。有界（bounded）形式会循环调用 `fread`，直到填满 `$length`、到达 EOF 或收到空读取。 |
| `stream_copy_to_stream()` | `stream_copy_to_stream(resource $from, resource $to, ?int $length = null, int $offset = -1): int\|false` | 将字节从一个流复制到另一个流，并返回复制的字节数。如果 `$offset >= 0`，则首先定位源流指针（可定位流/通过 `stream_seek()` 的用户包装器），若定位失败则返回 `false`；有限的 `$length` 最多复制该数量的字节（`null`/负数 `$length` 将复制到 EOF）。有界形式驱动分块读/写循环，并限制超出请求计数的包装器块（chunk）。 |
| `stream_get_line()` | `stream_get_line(resource $handle, int $length [, string $ending]): string` | 读取最多 `$length` 字节，如果提供了 `$ending`，则在遇到它时停止并消耗它。 |
| `flock()` | `flock(resource $handle, int $op, &$would_block = null): bool` | 建议性锁。支持 `LOCK_SH`、`LOCK_EX`、`LOCK_UN` 和 `LOCK_NB`；用户包装器路由到 `stream_lock(int $operation)`。 |
| `tmpfile()` | `tmpfile(): resource\|false` | 创建一个匿名临时流，该流由一个 `/tmp/elephc-XXXXXX` 文件支持，且该文件会被立即删除（unlink）。 |
| `fstat()` | `fstat(resource $handle): array\|false` | 返回与 `stat()` 相同结构的 stat 信息，但针对的是已打开的流。用户包装器路由到 `stream_stat()`。 |
| `ftruncate()` | `ftruncate(resource $handle, $size): bool` | 截断或扩展流。用户包装器路由到 `stream_truncate(int $new_size)`。 |
| `fflush()` | `fflush(resource $handle): bool` | 刷新缓冲区输出。elephc 流是无缓冲的，因此这会映射到 `fsync()`。 |
| `fsync()` | `fsync(resource $handle): bool` | 将数据和元数据刷新到持久存储中。 |
| `fdatasync()` | `fdatasync(resource $handle): bool` | 仅刷新数据。在 macOS 上，这会退回到 `fsync()`。 |

`stream_set_chunk_size($stream, $size)` 返回流的上一个块大小（chunk size）。首次调用会报告默认值 `8192`；后续的调用会报告由前一次调用设置的值。v1 会跟踪每个文件描述符（fd）的值，但尚未更改读取粒度。

`stream_set_read_buffer()` 和 `stream_set_write_buffer()` 返回 `0`。elephc 流是无缓冲的，因此接受的缓冲区（buffer）大小不会改变行为。

## 内置包装器

| 包装器 | 描述 |
|---|---|
| `file` | 普通文件系统流。 |
| `php://stdin`, `php://stdout`, `php://stderr` | 标准描述符 0、1 和 2。`php://input` 别名为 stdin，`php://output` 别名为 stdout。 |
| `php://memory`, `php://temp` | 由匿名临时缓冲区支持的可定位内存流。允许接收并忽略 `php://temp/maxmemory:N`。 |
| `php://filter` | 打开底层资源并在打开时挂载一个内置过滤器，例如 `php://filter/read=string.toupper/resource=php://temp`。 |
| `data://` | RFC 2397 内联有效载荷（payload）流。支持 Base64 和百分比解码的有效载荷。URI 必须是字符串字面量。 |
| `phar://` | 读取或写入 PHAR 条目。字面量读取发生在编译时，并将条目嵌入到二进制文件中；非字面量读取发生在运行时。可读取原生 PHAR、基于 tar 的 PHAR 以及基于 zip 的 PHAR 容器；原生 PHAR 的 gzip/bzip2 条目以及 ZIP deflate 条目都将被透明解码。 |
| `ftp://` | 匿名二进制被动 FTP 读取流。`fopen()` 需要字面量 URL；`file_get_contents()` 也接受运行时字符串 URL。v1 中忽略 URL 中的凭据。 |
| `ftps://` | 使用 `AUTH TLS` 的显式 FTPS（FTP over TLS），在控制和数据通道上均使用 TLS。`fopen()` 需要字面量 URL；`file_get_contents()` 也接受运行时字符串 URL。 |
| `http://` | HTTP/1.0 `GET` 读取流. `fopen()` 需要字面量 URL；`file_get_contents()` 也接受运行时字符串 URL。v1 不会重定向，并且最多缓冲 1 MiB。 |
| `https://` | 与 `http://` 相同，但通过 `elephc-tls` 静态库建立在 TLS 之上。使用它的程序会自动链接 `-lelephc_tls`；不使用 TLS 的程序则不需要支付额外的链接成本。 |
| `compress.zlib://` | 只读包装器，打开底层文件并应用 `zlib.inflate`。 |
| `compress.bzip2://` | 只读包装器，打开底层文件并通过 libbz2 进行解压。 |
| `glob://` | 目录风格的包装器，用于通过 `opendir()` / `readdir()` 遍历与 glob 模式匹配的路径。 |

`phar://` 写入流在内存中缓冲一个未压缩的条目。`fclose()` and `file_put_contents("phar://archive.phar/entry", $data)` 会在保留现有条目的同时，在 SHA1 签名的 PHAR 归档中插入或替换该条目。`file_put_contents()` 和写入模式的 `fopen()` 也支持运行时构建的 `phar://` URL。原生 PHAR、基于 tar 的 PHAR 以及基于 zip 的 PHAR 容器都是可写的；ZIP 写入会保留已存储（stored）/已压缩（deflated）的条目，且压缩控制可以在已存储和已压缩形式之间重写 ZIP 条目。使用流式数据描述符（streaming data descriptor）写入的 ZIP 条目会被透明读取，且支持对 ZIP64 归档（超过 65535 个条目，或大小/偏移量超过 4 GiB）进行读写。在 `Phar`/`PharData` 对象上调用 `setZipPassword(string $password)` 编译器（compiler）扩展后，可以读写传统的 PKWARE (ZipCrypto) 加密 ZIP 条目：一旦设置了密码，加密条目将在读取时解密，而 zip 条目将在写入时加密（stub 引导脚本也会被加密；但 `.phar/signature.bin` 条目保持明文）。ZipCrypto 的密码学强度较弱——保留它是为了与遗留归档文件兼容，而不是作为一种真正的保密机制。`Phar` 和 `PharData` 暴露了基础的 OOP 接口，包括构造函数、格式/压缩/签名常量、`addFromString()`、`delete()`、`compressFiles()`、`decompressFiles()`、混合元数据/字符串 stub 访问器、路径助手，以及在相同 `phar://` 路径上的 ArrayAccess 读/写/isset 操作。ArrayAccess 读取会返回 `PharFileInfo` 对象，其中包含用于读取有效载荷的 `getContent()` 以及用于处理单文件元数据的 `setMetadata()`/`getMetadata()`/`hasMetadata()`/`delMetadata()`。对 `Phar` / `PharData` 对象执行 `foreach` 循环将遍历在构建时从归档中扫描到的条目，以及通过该对象写入的条目，生成键值对 `entryName => PharFileInfo`。`unlink("phar://archive/entry")` 和 `unset($phar["entry"])` 会在保留同级条目的同时移除指定条目。原生 PHAR 压缩控制支持 `Phar::GZ`、`Phar::BZ2` 和 `Phar::NONE`；ZIP 压缩控制支持 `Phar::GZ` 和 `Phar::NONE`。

对于这三种类型的归档，`setMetadata()`/`getMetadata()`/`hasMetadata()`/`delMetadata()` 以及 `setStub()`/`getStub()` **都会持久化到归档文件中**，因此全局元数据和 stub 可以在全新的 `Phar`/`PharData` 对象之间以及跨进程往返传递（并且可以与 PHP 解释器互换通用）。元数据以 PHP `serialize()` 序列化形式存储——对于原生 PHAR，存储在清单（manifest）元数据字段中；对于 tar，存储在 `.phar/.metadata.bin` 条目中；对于 zip，存储在 ZIP 归档注释中；stub 在原生 PHAR 中作为字节前缀存储，而在 tar/zip 中作为 `.phar/stub.php` 条目存储。`setStub()` 要求 stub 必须包含 `__HALT_COMPILER();`（与 PHP 一致）。保留的 `.phar/*` 控制条目在条目列表和遍历中是隐藏的。

单文件元数据通过 ArrayAccess 返回的 `PharFileInfo` 以相同的方式持久化：`$phar["entry"]->setMetadata(...)`、`getMetadata()`、`hasMetadata()` 和 `delMetadata()` 可以在全新对象和 PHP 解释器之间往返传递。它在原生 PHAR 中存储在每个条目的清单字段中，在 tar 中存储在旁路（side）条目 `.phar/.metadata/<entry>/.metadata.bin` 中，在 zip 中存储在每个条目的 ZIP 中央目录（central-directory）文件注释中。

基于 tar 的 `PharData` 支持整包压缩：`compress(Phar::GZ)` 和 `compress(Phar::BZ2)` 会写入同级的 `.tar.gz` / `.tar.bz2` 并返回一个全新的 `PharData` 对象，而 `decompress()` 则会写回无压缩的 `.tar`；已压缩的归档将被透明读取（并且可以与 PHP 解释器互换通用）。对于原生 PHAR / zip 的单条目压缩，仍通过 `compressFiles()` / `decompressFiles()` 处理。

在原生 PHAR、tar 和 zip 归档中，均支持通过 `setSignatureAlgorithm()` / `getSignature()` 使用签名。`setSignatureAlgorithm(Phar::MD5|Phar::SHA1|Phar::SHA256|Phar::SHA512)` 应用哈希签名，而 `setSignatureAlgorithm(Phar::OPENSSL, $privateKey)` 则使用 PEM 私钥（PKCS#1 或 PKCS#8）通过 RSA-SHA1 进行签名。原生 PHAR 将签名存储在其尾部（trailer）中；tar 和 zip 归档则将其存储在 `.phar/signature.bin` 控制条目中。生成的签名可通过 PHP 解释器进行验证（对于 OpenSSL，请将匹配的公钥放置在 `<archive>.pubkey` 中）。`getSignature()` 返回 `['hash' => <大写十六进制值>, 'hash_type' => 'MD5'|'SHA-1'|'SHA-256'|'SHA-512'|'OpenSSL']`。

元数据持久化覆盖了与 [`serialize()`/`unserialize()`](system-and-io.md#serialization) 相同的标量+数组子集；对象元数据不会被序列化。

`file_get_contents($url)` 在退回到 `phar://`/文件系统处理之前，会识别运行时的 `http://`、`https://`、`ftp://` 和 `ftps://` 字符串。由于无法静态知晓协议方案（scheme），非字面量的 `file_get_contents()` 会保守地链接 `elephc-tls`、`elephc-phar`、zlib 以及 libbz2。

`https://`、`ftps://` 和 `stream_socket_enable_crypto()` 使用 `elephc-tls`（rustls、`ring` 密码学提供程序以及 Mozilla webpki 根证书）。TLS 上下文可以通过 `ssl.cafile` 或 `ssl.capath` 覆盖信任源、设置 `ssl.peer_name`，或通过 `ssl.verify_peer = "0"`、`ssl.allow_self_signed` 或 `ssl.verify_peer_name = "0"` 来放宽验证要求。当 `ssl.local_cert` 和 `ssl.local_pk` 同时指向可读的 PEM 文件时，支持客户端证书；不支持加密的密钥和 `ssl.passphrase`。出于源码兼容性考虑，允许接收 `ssl.ciphers` 和 `ssl.security_level` 作为上下文选项，但它们都是无操作（no-ops）：rustls 不会处理 OpenSSL 密码套件列表（cipher-list）字符串，并且会在内部自行选择 TLS 1.2/1.3 策略。

## 流上下文

| 函数 | 签名 | 描述 |
|---|---|---|
| `stream_context_create()` | `stream_context_create(array $options = [], array $params = []): resource` | 创建一个流上下文资源，并将 `$options` 持久化到单个全局上下文插槽中。`$params` 中的字面量 `['notification' => <closure>]` 会被捕获，用于 HTTP 通知回调。 |
| `stream_context_get_default()` | `stream_context_get_default(array $options = []): resource` | 返回默认的上下文资源。会对可选参数的副作用进行求值；v1 并不应用该参数。 |
| `stream_context_set_default()` | `stream_context_set_default(array $options): resource` | 返回默认的上下文资源。v1 会对 `$options` 的副作用进行求值，但尚未遍历并持久化该数组；当代码需要存储选项时，请使用 `stream_context_set_option(stream_context_get_default(), ...)`。 |
| `stream_context_set_option()` | `stream_context_set_option(resource $context, ...): bool` | 接受 PHP 的两种形式：`(ctx, options_array)` 替换已持久化的选项哈希，而 `(ctx, wrapper, option, value)` 设置一个嵌套选项。在四参数形式中，v1 将值存储为字符串。 |
| `stream_context_set_params()` | `stream_context_set_params(resource $context, array $params): bool` | 将字面量 `notification` 闭包或头等可调用对象（first-class callable）捕获到全局通知插槽中，并返回 `true`。 |
| `stream_context_get_options()` | `stream_context_get_options(resource $context): array` | 返回已持久化的选项哈希，如果没有创建上下文，则返回空哈希。 |
| `stream_context_get_params()` | `stream_context_get_params(resource $context): array` | v1 桩（stub）：返回一个空关联数组。 |
| `stream_resolve_include_path()` | `stream_resolve_include_path(string $filename): string\|false` | elephc 没有运行时的 `include_path`，因此这相当于 `realpath($filename)`：成功时返回规范路径，否则返回 `false`。 |

活跃的流上下文消费者：

- `fopen("http://...")` 读取 `http.method`、`http.header` 和 `http.content`。
- `fopen("https://...")` 读取 `ssl` 信任和对端名称选项。
- `fopen("ftp://...")` 读取 `ftp.resume_pos`。
- 通过 `https://` 调用 `file_get_contents()` 会读取相同的 `ssl` 选项；通过 `ftp://` 或 `ftps://` 调用时会读取 `ftp.resume_pos`。
- `stream_socket_server()` 读取 `socket.backlog`。
- `stream_socket_enable_crypto()` 读取 TLS 对端和客户端证书选项。

v1 拥有一个活跃的上下文插槽。创建或设置上下文将覆盖后续消费者所使用的全局选项。

## 通知回调

HTTP 流可以触发上下文通知回调：

```php
$ctx = stream_context_create([], [
    'notification' => function (int $code, int $severity, ?string $message,
                                int $message_code, int $bytes_transferred,
                                int $bytes_max): void {
        if ($code === STREAM_NOTIFY_CONNECT)   { echo "connected\n"; }
        if ($code === STREAM_NOTIFY_COMPLETED) { echo "done\n"; }
        if ($code === STREAM_NOTIFY_FAILURE)   { echo "failed\n"; }
    },
]);

$body = fopen('http://example.com/', 'r');
```

`http://` 会触发 `STREAM_NOTIFY_CONNECT`、`STREAM_NOTIFY_COMPLETED` 和 `STREAM_NOTIFY_FAILURE`。v1 仅捕获字面量闭包或头等可调用对象条目。字符串函数名、`[object, method]` 数组、变量回调、HTTPS/FTP 通知、进度/文件大小/MIME/重定向/认证里程碑以及 `$message`、`$message_code` 和 `$bytes_max` 均暂缓实现。

## 过滤器和数据桶

| 函数 | 签名 | 描述 |
|---|---|---|
| `stream_get_filters()` | `stream_get_filters(): array` | 返回内置过滤器：`string.toupper`、`string.tolower`、`string.rot13`、`string.strip_tags`、`convert.base64-encode`、`convert.base64-decode`、`convert.quoted-printable-encode`、`convert.quoted-printable-decode`、`convert.iconv.*`、`dechunk`、`zlib.deflate`、`zlib.inflate`、`bzip2.compress` 和 `bzip2.decompress`。在 v1 中不枚举用户过滤器。 |
| `stream_filter_append()` | `stream_filter_append(resource $stream, string $filtername, int $read_write = STREAM_FILTER_ALL, mixed $params = null): resource\|false` | 挂载一个内置或用户注册的过滤器。`STREAM_FILTER_READ`、`STREAM_FILTER_WRITE` 和 `STREAM_FILTER_ALL` 用于选择过滤方向。 |
| `stream_filter_prepend()` | `stream_filter_prepend(resource $stream, string $filtername, int $read_write = STREAM_FILTER_ALL, mixed $params = null): resource` | 在 v1 的“每个方向单过滤器”模型中，其行为与 append 相同。 |
| `stream_filter_remove()` | `stream_filter_remove(resource $filter): bool` | 移除已挂载的过滤器并返回 `true`。 |
| `stream_filter_register()` | `stream_filter_register(string $filter_name, string $class): bool` | 注册用户过滤器类。最多可存储 128 个注册项；字面量类名在编译时进行验证。 |
| `stream_bucket_new()` | `stream_bucket_new(resource $stream, string $data): object` | 创建一个由 stdClass 支持的数据桶（bucket），具有公共的 `data` 和 `datalen` 属性。 |
| `stream_bucket_make_writeable()` | `stream_bucket_make_writeable(resource $brigade): object\|null` | 从联队（brigade）中弹出下一个数据桶。 |
| `stream_bucket_append()` | `stream_bucket_append(resource $brigade, object $bucket): void` | 将数据桶推入联队的末尾。 |
| `stream_bucket_prepend()` | `stream_bucket_prepend(resource $brigade, object $bucket): void` | 出于源码兼容性目的而允许接收；v1 目前会像 `stream_bucket_append()` 一样追加，因为桶联队（bucket-brigade）的头部插入（front insertion）尚未单独进行底层转换/降级（lowered）。 |

`zlib.deflate` 和 `gzcompress()` 使用系统自带的 `libz`。`bzip2.compress`、`bzip2.decompress` 和 `compress.bzip2://` 使用 `libbz2`。`convert.iconv.*` 使用 libc 的 `iconv`，且在 macOS 上会自动链接 `-liconv`。

压缩过滤器的参数可以是一个单纯的整数或字面量数组。`zlib.deflate` 会读取 `level`（范围 `-1..9`）。`bzip2.compress` 会读取 `blocks`（范围 `1..9`）和 `work`（范围 `0..250`）。非字面量参数将保留默认值。

用户过滤器既可以实现 `filter(string $data): string`，也可以实现 PHP 具有四个参数的 `filter($in, $out, &$consumed, $closing): int` 数据桶形式。类可以继承 PHP 的 `php_user_filter` 基类；在 `onCreate()` 运行之前，第四个传入 `stream_filter_append`/`prepend` 的参数 `$params` 即可通过 `$this->params` 访问。可选的 `onCreate(): bool` 和 `onClose(): void` 钩子均生效。v1 在每次分派（dispatch）时只填充一个输入数据桶；`PSFS_FEED_ME` 不会请求更多输入，且 `PSFS_ERR_FATAL` 不会作为流错误进行传播。

## 用户流包装器

| 函数 | 签名 | 描述 |
|---|---|---|
| `stream_get_wrappers()` | `stream_get_wrappers(): array` | 返回内置包装器：`file`、`php`、`data`、`ftp`、`http`、`https`、`ftps`、`compress.zlib`、`compress.bzip2`、`phar` 和 `glob`。在 v1 中不枚举用户包装器。 |
| `stream_wrapper_register()` | `stream_wrapper_register(string $protocol, string $class, int $flags = 0): bool` | 为 `$protocol://` URL 注册一个用户空间包装器类。最多可存储 16 个注册项。 |
| `stream_wrapper_unregister()` | `stream_wrapper_unregister(string $protocol): bool` | 移除用户注册的包装器；在 v1 中无法注销内置包装器。 |
| `stream_wrapper_restore()` | `stream_wrapper_restore(string $protocol): bool` | v1 中的无操作，因为内置包装器始终存在，故直接返回成功。 |

当 `fopen("$protocol://...")` 匹配到已注册的包装器时，elephc 会通过运行时类注册表创建一个实例。会应用声明的属性默认值，但在该路径上不会调用 `__construct` 构造函数。

支持的包装器方法包括 `stream_open`、`stream_read`、`stream_write`、`stream_close`、`stream_eof`、`stream_seek`、`stream_tell`、`stream_flush`、`stream_stat`、`stream_lock`、`stream_truncate`、`stream_metadata`、`stream_set_option`、`stream_cast`、`url_stat` 以及目录方法 `dir_opendir`、`dir_readdir`、`dir_rewinddir` 和 `dir_closedir`。

包装器方法应该声明与其 PHP 约定（contract）相匹配的返回类型。`stream_stat()` 和 `url_stat()` 是特例：在返回带有字符串键名的关联 stat 数组时，请将它们声明为无返回类型，或者声明为 `mixed`。

## 套接字和进程流

| 函数 | 签名 | 描述 |
|---|---|---|
| `stream_get_transports()` | `stream_get_transports(): array` | 返回识别到的套接字传输层协议（transports）：`tcp`、`udp`、`unix`、`udg`、`tls`、`ssl`、`sslv2`、`sslv3`、`tlsv1.0`、`tlsv1.1`、`tlsv1.2` 和 `tlsv1.3`。TLS 版本名称全部使用 rustls 默认的协商机制。 |
| `stream_socket_server()` | `stream_socket_server($address): resource\|false` | 绑定一个服务端套接字以支持 `[tcp://]host:port`、`udp://host:port`、`unix:///path` 或 `udg:///path`。TCP 和 Unix 流（Unix-stream）套接字会处于监听状态；UDP 和 Unix 数据报（Unix-datagram）套接字仅进行绑定。 |
| `stream_socket_client()` | `stream_socket_client($address): resource\|false` | 打开一个用于 `[tcp://]host:port`、`udp://host:port`、`unix:///path` 或 `udg:///path` 的客户端流。 |
| `stream_socket_accept()` | `stream_socket_accept($socket): resource\|false` | 从监听流中接受下一个待处理的连接。 |
| `stream_socket_enable_crypto()` | `stream_socket_enable_crypto(resource $stream, bool $enable, int $crypto_method = null, resource $session_stream = null): bool` | 将 TLS 附加到已连接的 TCP 文件描述符（fd）上。`$enable=false` 将解开会话连接（发送 `close_notify` 并清除每个 fd 的 TLS 句柄），使该 fd 恢复为普通的 TCP 套接字，然后返回 `true`；在没有附加会话时这属于无操作。 |
| `fsockopen()` | `fsockopen(string $hostname, int $port, int &$error_code = null, string &$error_message = null, float $timeout = null): resource\|false` | 打开到 `$hostname:$port` 的 TCP 连接，并写入可选的引用传参错误输出。会评估超时参数，但在 v1 中使用的是操作系统的默认连接超时。 |
| `pfsockopen()` | `pfsockopen(string $hostname, int $port, int &$error_code = null, string &$error_message = null, float $timeout = null): resource\|false` | `fsockopen()` 的别名；持久连接对于独立的原生二进制文件（native binary）没有意义。 |
| `stream_set_blocking()` | `stream_set_blocking($stream, bool $enable): bool` | 切换 `O_NONBLOCK`。非阻塞读取未命中时会返回空 `fread()` 结果，或者从 `fgetc()`/`fgets()` 返回 `false`，但不会设置 EOF。用户包装器会路由到 `stream_set_option(STREAM_OPTION_BLOCKING, ...)`。 |
| `stream_set_timeout()` | `stream_set_timeout($stream, int $seconds, int $microseconds = 0): bool` | 在套接字流上设置 `SO_RCVTIMEO`。用户包装器会路由到 `stream_set_option(STREAM_OPTION_READ_TIMEOUT, ...)`。 |
| `stream_select()` | `stream_select(array &$read, array &$write, array &$except, int $seconds, int $microseconds = 0): int` | 等待直到流数组就绪，并将每个数组重写为它的就绪子集。仅限于 Word-0：描述符必须在 `0..63` 范围内。当 `stream_cast(STREAM_CAST_FOR_SELECT)` 返回真实的流资源时，用户包装器就是可选择的。 |
| `stream_socket_shutdown()` | `stream_socket_shutdown($stream, int $mode): bool` | 关闭套接字的读取（`0`）、写入（`1`）或两者（`2`）。 |
| `stream_socket_sendto()` | `stream_socket_sendto($socket, string $data, int $flags = 0, string $address = ""): int\|false` | 发送字节到已连接的对端或显式的数据报地址。 |
| `stream_socket_recvfrom()` | `stream_socket_recvfrom($socket, int $length, int $flags = 0, string &$address = ""): string\|false` | 接收字节并选择性地写回发送者地址为 `host:port`。 |
| `stream_socket_get_name()` | `stream_socket_get_name($socket, bool $remote): string\|false` | 以 `host:port` 格式返回本地或远程的套接字名称。 |
| `stream_socket_pair()` | `stream_socket_pair(int $domain, int $type, int $protocol): array` | 创建一对已连接 of 套接字流，例如 `STREAM_PF_UNIX`、`STREAM_SOCK_STREAM`、`0`。 |
| `popen()` | `popen(string $command, string $mode): resource\|false` | 以读取（`\"r\"`）或写入（`\"w\"`）模式打开通往进程的管道。 |
| `pclose()` | `pclose($handle): int` | 关闭进程管道并返回其终止状态。 |

套接字地址使用 `[tcp://]host:port`、`udp://host:port`、`unix:///path` 或 `udg:///path`。主机名会通过系统解析器解析为 IPv4 地址。

## 目录流

目录句柄也是流资源。`opendir()`、`readdir()`、`rewinddir()` 和 `closedir()` 与文件系统函数一起记录在 [系统与 I/O (System & I/O)](system-and-io.md) 中。已注册的用户空间包装器可以实现 `dir_opendir`、`dir_readdir`、`dir_rewinddir` 和 `dir_closedir`；`glob://` 包装器通过相同的目录流 API 暴露 glob 匹配。

## 流元数据与自省

| 函数 | 签名 | 描述 |
|---|---|---|
| `get_resource_type()` | `get_resource_type(resource $handle): string` | 对于 elephc 生成的每个资源均返回 `"stream"`。 |
| `get_resource_id()` | `get_resource_id(resource $handle): int` | 返回 `Resource id #N` 中显示的数字 ID。 |
| `stream_isatty()` | `stream_isatty(resource $stream): bool` | 报告流是否连接到了交互式终端。 |
| `stream_is_local()` | `stream_is_local(resource\|string $stream): bool` | 对于本地流返回 `true`。 |
| `stream_supports_lock()` | `stream_supports_lock(resource $stream): bool` | 当流支持 `flock()` 时返回 `true`。 |
| `stream_get_meta_data()` | `stream_get_meta_data(resource $stream): array` | 返回元数据键：`timed_out`、`blocked`、`eof`、`unread_bytes`、`stream_type`、`wrapper_type`、`mode`、`seekable` 和 `uri`。 |

`stream_get_meta_data()` 会从活动描述符（live descriptor）中推导出 `eof`、`seekable`、`blocked` 和 `mode`。对于可定位流，`stream_type` 为 `"STDIO"`，而对于不可定位流则为 `"tcp_socket"`。由于 elephc 在 v1 中不跟踪每个资源的打开路径，因此 `wrapper_type` 报告为 `"plainfile"`，`uri` 报告为空字符串。
