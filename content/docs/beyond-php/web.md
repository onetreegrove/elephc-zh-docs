---
title: "Web 服务器 (--web)"
description: "使用 --web 将 PHP 程序编译为独立的 prefork HTTP 服务器二进制文件。"
sidebar:
  order: 7
---

`--web` 是 elephc 编译器的扩展：它将标准的 PHP 文件编译为独立的 prefork HTTP 服务器二进制文件，而不是普通的 CLI 可执行文件。你所编译的 PHP 源码是标准 PHP——同一个文件也可以在 PHP 解释器或 php-fpm 下运行——但这种“编译并服务”的机制是 elephc 特有的。

## 编译 Web 服务器

```bash
elephc --web app.php
# app.php -> app  (a self-contained HTTP server binary)
```

生成的二进制文件没有 PHP 运行时依赖。使用 `--listen` 运行它：

```bash
./app --listen 127.0.0.1:8080
./app --listen 127.0.0.1:8080 --workers 4
```

## 运行时参数

生成的二进制文件在运行时接受以下参数：

| 参数 | 是否必填 | 默认值 | 描述 |
|---|---|---|---|
| `--listen host:port` | 是 | — | 要绑定的地址和端口。如果缺失 `--listen`，则会向 stderr 输出错误并以非零状态码退出。 |
| `--workers N` | 否 | CPU 核心数 | 要 prefork 的工作进程数量。最小为 1。 |
| `--max-body-size N` | 否 | `8388608` (8 MiB) | 最大请求体字节数；`0` 表示无限制。请求体超过该限制的请求将收到 `413 Payload Too Large`，且 PHP 处理器永远不会运行。 |
| `--max-requests N` | 否 | `0`（从不） | 在处理 N 个请求后回收每个工作进程（主进程会重新孵化它），以限制长期运行的服务器中的内存增长。 |
| `--access-log` | 否 | 关闭 | 将每个请求的一行日志输出到 stderr（格式为 `<ip> "<method> <path>" <status> <ms>`）。 |
| `--help`, `--version` | 否 | — | 打印使用方法 / 版本信息并以 0 状态码退出。 |

## 请求模型

请求模型遵循 PHP-FPM / `php -S`：每个传入的 HTTP 请求都会从完全全新的状态重新运行程序的顶级代码。脚本通过 `echo` 或 `print` 写入的任何内容都将成为 HTTP 响应体。默认响应为 `200 OK` 且未设置 `Content-Type`；程序通过 `http_response_code()` 和 `header()` 来控制状态码和响应头（参见[响应控制](#响应控制)）。

```php
<?php
echo "Hello from elephc-web!";
```

使用 `--web` 编译后，上述二进制文件将为每个请求返回 `Hello from elephc-web!`。

请参阅 `examples/web-hello/` 以获取最小的可运行示例。

## 请求输入

HTTP 请求通过标准的 PHP 超全局变量（superglobals）公开，这些变量在每次请求时都会重新构建，并且可以在任何函数作用域内读取（不需要使用 `global`）：

- **`$_SERVER`** — `REQUEST_METHOD`、`REQUEST_URI`、`QUERY_STRING`，作为 `HTTP_*` 键（例如 `HTTP_USER_AGENT`）的请求头，存在时的 `CONTENT_TYPE` / `CONTENT_LENGTH`，以及 `REMOTE_ADDR`、`REMOTE_PORT`、`SERVER_ADDR`、`SERVER_PORT`、`SERVER_NAME`、`SERVER_PROTOCOL`、`REQUEST_TIME`、`REQUEST_SCHEME`、`GATEWAY_INTERFACE` 和 `SERVER_SOFTWARE`。
- **`$_GET`** — 解析为以字符串为键的数组的查询字符串，已进行百分号解码（percent-decoded）。
- **`$_POST`** — 以同样方式解析的 `application/x-www-form-urlencoded` 请求体；`multipart/form-data` 格式的请求体也会用其文本字段填充 `$_POST`。其他内容类型会使 `$_POST` 保持为空——通过 `php://input` 读取原始请求体。
- **`$_FILES`** — `multipart/form-data` 文件上传，每个文件的格式为 `['name' => …, 'type' => …, 'tmp_name' => …, 'error' => 0, 'size' => …]`。上传的文件会写入 `tmp_name` 处的临时文件；使用 `file_get_contents()`（或 `move_uploaded_file()`）读取它。
- **`$_COOKIE`** — 解析为以字符串为键的数组的 `Cookie` 请求头（值已进行百分号解码）。
- **`$_REQUEST`** — `$_GET` 与 `$_POST` 合并（在键冲突时 POST 优先），匹配 PHP 默认的 `request_order = "GP"`。
- **`$_ENV`** — 进程环境变量。
- **`php://input`** — `file_get_contents('php://input')` 返回原始请求体（例如 JSON 负载）。空请求体返回 `false`。

```php
<?php
echo "Hello, " . ($_GET['name'] ?? 'world') . "!\n";
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "Raw body: " . file_get_contents('php://input') . "\n";
}
```

请参阅 `examples/web-request/` 获取涵盖 `$_SERVER`、`$_GET`、`$_POST` 和 `php://input` 的可运行示例。

## 响应控制

响应状态码和响应头通过标准的 PHP 内置函数进行控制，其行为与在 PHP-FPM 下一致：

- **`http_response_code(int $code = 0): int`** — 传入状态码时，设置响应状态码并返回先前的状态码；不传参数（或传 `0`）时，返回当前状态码而不进行更改。默认状态码为 `200`。
- **`header(string $header, bool $replace = true, int $response_code = 0): void`** — 添加响应头。参数是完整的 `"Name: Value"` 行，与 PHP 中的完全一致：
  - 默认情况下（`$replace = true`），带有相同字段名的后续 `header()` 调用会替换先前的响应头；传入 `$replace = false` 可以发送重复的响应头。
  - `"HTTP/1.1 404 ..."` 或 `"Status: 404 ..."` 这样的行会设置状态码，而不是添加响应头。
  - `"Location: ..."` 响应头也会将状态码设置为 `302`，除非状态码已经是 `201`/`3xx`，或者第三个参数 `$response_code` 覆盖了它。
  - 第三个参数 `$response_code` 为非零时，将强制设置状态码。
- **`setcookie(...)` / `setrawcookie(...)`** — 发送 `Set-Cookie` 响应头（采用经典的定位签名 `name, value, expires, path, domain, secure, httponly`）。`setcookie()` 会对值进行百分号编码；`setrawcookie()` 则不会。多次调用会产生多个 `Set-Cookie` 响应头。

与 PHP-FPM 不同的是，在产生输出**之后**调用 `header()`（或 `setcookie()`）是允许的——elephc-web 会对响应体进行缓冲，并在处理器返回后构建响应，因此不会出现 "headers already sent"（响应头已发送）错误。

```php
<?php
header('Content-Type: application/json');
if (!isset($_GET['id'])) {
    http_response_code(400);
    echo '{"error":"missing id"}';
} else {
    echo '{"id":' . (int) $_GET['id'] . '}';
}
```

`Content-Type` **不会**自动设置——由程序自行选择（PHP-FPM 默认设置为 `text/html`；除非你调用 `header()`，否则 elephc-web 不会设置任何内容）。

请参阅 `examples/web-response/` 获取可运行示例。

## 更完整的示例

`examples/web-framework/` 在 `--web` 之上构建了一个极简的 Laravel 风格框架——包括带命名空间的 `Request`/`Response`/`Router` 类、`Handler` 接口背后的单操作控制器、洋葱模型中间件（`Middleware` 接口，例如 API 密钥卫士）、`:param` 路由匹配以及 JSON 响应——以展示这些组件在真实的应用程序中是如何协同工作的。

## 单次请求的全新状态

在请求之间，运行时会重置所有进程持久状态，因此请求 N+1 会看到与请求 N 相同的干净环境：

- **全局变量** — 重置为未初始化状态。
- **函数的 `static` 变量** — 释放并初始化为零；它们的初始化器在首次调用时重新运行。
- **类的静态属性** — 释放；它们的初始化器在处理器主体开始时重新运行。

这与 PHP-FPM 的单次请求隔离模型相匹配。没有数据会从一个请求泄露到下一个请求。

## 并发模型

该服务器采用带有 `SO_REUSEPORT` 的 prefork 模型：主进程在任何请求到达之前孵化出 N 个工作进程，内核在工作进程之间进行连接的负载均衡。

每个工作进程都是一个独立的进程，拥有自己的运行时副本。在单个工作进程内，请求是**逐个**被处理的——PHP 主体运行完毕后才会接受下一个请求。并发度等于工作进程数；一个慢请求在其执行期间会独占一个工作进程。

## 鲁棒性

- **平滑关闭（Graceful shutdown）** — 主进程在收到 `SIGINT` (Ctrl-C) 和 `SIGTERM` 时会干净利落地关闭：它将终止信号转发给工作进程，回收它们，并以 `0` 状态码退出。在关闭到达时，正在处理的请求可能会被丢弃。
- **工作进程重孵（Worker respawn）** — 意外死亡的工作进程（崩溃，或 PHP 调用 `exit()`）会被替换，从而使进程池保持在 `--workers` N。
- **请求体限制** — 参见 `--max-body-size`；超大请求体将在处理器运行之前以 `413` 拒绝。
- **慢连接限制** — HTTP/1.1 keep-alive 已启用，但如果连接在 30 秒内没有发送下一个请求的请求头，则会被关闭。由于一个工作进程一次只能服务一个连接，因此保持活动状态的连接会一直占用工作进程，直到其关闭或超时——请相应地调整 `--workers` 的大小。

## 局限性

服务循环、单次请求的全新状态、请求输入（`$_SERVER` / `$_GET` / `$_POST` / `$_COOKIE` / `$_REQUEST` / `$_ENV` / `$_FILES` / `php://input`）和响应控制（`http_response_code()` / `header()` / `setcookie()`）均已可用。以下内容尚不可用：

- **未填充 `$argc` / `$argv`** — 二进制文件自身的 argv 被服务器消费，并不会转发给脚本主体（PHP-FPM 也不设置它们）。
- **无工作进程内并发** — `handler()` 同步运行，因此一个慢请求会一直占用其工作进程直到完成（空闲的 keep-alive 连接不再阻塞 accept 循环，但正在处理的处理器会阻塞）。请使用 `--workers`。
- **正在处理的请求可能会在关闭时丢失** — `SIGINT`/`SIGTERM` 会立即终止工作进程；目前还没有平滑的连接清空（graceful connection drain）机制。
- **无响应流式传输（No response streaming）** — 整个响应体在发送前会被缓冲。
- **`--listen` 仅支持 TCP** — 尚不支持 Unix 域套接字（Unix domain socket）监听。
- **无会话（No sessions）** — 未提供 `$_SESSION` / `session_start()`。但提供了 Cookie（`$_COOKIE`，`setcookie()`），因此你可以自己构建会话处理。
- **本版本中不支持：**会话、静态文件服务、进程内 TLS、HTTP/2–3——请在服务器前放置反向代理来处理这些需求（如下文所述）。

## 位于反向代理之后

elephc-web 仅支持明文的 HTTP/1.1。对于 TLS、HTTP/2/3、静态资源服务或虚拟主机，请将其运行在反向代理（nginx、Caddy、HAProxy）之后，由反向代理终止 TLS 并转发到 `--listen`。典型的配置是将服务器绑定到 `127.0.0.1:8080` 并让代理指向它。

## 互斥项

`--web` 不能与 `--check`、`--emit cdylib`、`--emit-asm` 或 `--emit-ir` 结合使用。
