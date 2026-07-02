---
title: "构建 Fiber Web 服务器"
description: "如何使用非阻塞 socket、poll() 以及每个连接对应一个 Fiber 协程来构建原生 HTTP 服务器。"
sidebar:
  order: 1
---

本指南介绍了 HTTP 服务器示例背后的架构，以及如何自己构建一个类似的服务器。完整的实现位于 [`showcases/http-server/`](../../showcases/http-server/)；本页面主要关注使该设计生效的各个组成部分。

该服务器使用：

- `extern function` 声明，用于直接调用 libc 的 socket 函数
- `ptr` 内存辅助函数，用于构建 `sockaddr_in` 和 `pollfd` 结构体
- 非阻塞的监听 socket
- 单个 `poll()` 事件循环
- 每个活动连接对应一个 `Fiber`

其结果是协作式并发：进程保持单线程运行，但每个连接可以在需要更多字节时暂停，并在 socket 再次可读时恢复。

## 文件布局

使用小型模块。该示例将服务器拆分为以下文件：

| 文件 | 职责 |
|---|---|
| `main.php` | 引入模块并调用 `run_http_server(8080)`。 |
| `native.php` | 声明 libc 函数并封装 socket 操作。 |
| `http.php` | 解析 HTTP 请求并渲染 HTTP 响应。 |
| `routes.php` | 将解析后的请求分发给应用程序处理器。 |
| `server.php` | 运行 `poll()` 循环和 Fiber 调度器。 |

这种拆分保持了 FFI、解析、路由和调度的分离。它还使每个函数保持较小的体积，这更易于编译器处理，也更易于调试。

## 声明原生 socket API

网络通信通过带有 `extern function` 声明的 libc 进行：

```php
<?php
extern function socket(int $domain, int $type, int $protocol): int;
extern function setsockopt(int $fd, int $level, int $optname, ptr $optval, int $optlen): int;
extern function bind(int $fd, ptr $addr, int $addrlen): int;
extern function listen(int $fd, int $backlog): int;
extern function accept(int $fd, ptr $addr, ptr $addrlen): int;
extern function poll(ptr $fds, int $nfds, int $timeout): int;
extern function fcntl(int $fd, int $cmd, int $arg): int;
extern function read(int $fd, ptr $buf, int $count): int;
extern function write(int $fd, string $buf, int $count): int;
extern function close(int $fd): int;
extern function htons(int $hostshort): int;
extern function malloc(int $size): ptr;
extern function free(ptr $p): void;
extern function memset(ptr $dest, int $byte, int $count): ptr;
```

在调用之前，将 extern 参数具体化为普通的局部变量。这为代码生成提供了用于封送（marshal）的简单 C ABI 值：

```php
<?php
$sys = sys_constants();
$af = $sys["AF_INET"];
$stream = $sys["SOCK_STREAM"];

$fd = socket($af, $stream, 0);
```

某些常量在 macOS 和 Linux 之间存在差异。请将它们置于一个辅助函数中，并根据 `PHP_OS` 进行分支判断：

```php
<?php
function sys_constants(): array {
    $c = [
        "AF_INET"     => 2,
        "SOCK_STREAM" => 1,
        "F_GETFL"     => 3,
        "F_SETFL"     => 4,
    ];

    if (PHP_OS === "Darwin") {
        $c["SOL_SOCKET"] = 65535;
        $c["SO_REUSEADDR"] = 4;
        $c["O_NONBLOCK"] = 4;
    } else {
        $c["SOL_SOCKET"] = 1;
        $c["SO_REUSEADDR"] = 2;
        $c["O_NONBLOCK"] = 2048;
    }

    return $c;
}
```

## 创建非阻塞监听器

监听器是一个普通的 TCP socket，通过 `socket()`、`setsockopt()`、`bind()` 和 `listen()` 进行绑定。底层部分是通过指针写入构建 16 字节的 `struct sockaddr_in`：

```php
<?php
function tcp_listen(int $port): int {
    $sys = sys_constants();
    $af = $sys["AF_INET"];
    $stream = $sys["SOCK_STREAM"];

    $fd = socket($af, $stream, 0);
    if ($fd < 0) {
        return -1;
    }

    $addr = malloc(16);
    memset($addr, 0, 16);

    if (PHP_OS === "Darwin") {
        ptr_write8($addr, 16);
        $family_cell = ptr_offset($addr, 1);
        ptr_write8($family_cell, $af);
    } else {
        ptr_write16($addr, $af);
    }

    $net_port = htons($port);
    $port_cell = ptr_offset($addr, 2);
    ptr_write16($port_cell, $net_port);

    $ip_cell = ptr_offset($addr, 4);
    ptr_write32($ip_cell, 0);

    $bound = bind($fd, $addr, 16);
    free($addr);
    if ($bound != 0) {
        close($fd);
        return -1;
    }

    if (listen($fd, 128) != 0) {
        close($fd);
        return -1;
    }

    $get_cmd = $sys["F_GETFL"];
    $set_cmd = $sys["F_SETFL"];
    $nonblock = $sys["O_NONBLOCK"];
    $flags = fcntl($fd, $get_cmd, 0);
    fcntl($fd, $set_cmd, $flags | $nonblock);

    return $fd;
}
```

监听器必须是非阻塞的，这样已撤回的连接就不会阻塞 `accept()`。客户端读取仅在 `poll()` 报告 socket 可读之后执行；如果添加了任何不经过 `poll()` 就能等待的操作，单个连接就可能会导致整个进程停滞。

## 存储连接状态

每个连接都需要一个文件描述符、一个输入缓冲区（buffer）、生命周期标志以及它对应的 Fiber：

```php
<?php
class Connection {
    public int $fd = 0;
    public $fiber = null;
    public string $inbuf = "";
    public bool $active = false;
    public bool $started = false;
    public bool $closed = false;

    public function reset(int $fd): void {
        $this->fd = $fd;
        $this->fiber = null;
        $this->inbuf = "";
        $this->active = true;
        $this->started = false;
        $this->closed = false;
    }
}
```

该示例使用了一个固定的 `Connection` 对象池。空闲的槽位会被重用，因此在稳定状态的流量下，不会为每个请求都分配一个新的 PHP 对象。

## 将每个连接放入 Fiber 中

Fiber 拥有一个客户端的请求流：读取字节、等待完整的头部、解析、路由、响应和关闭。当请求未完成时，它会调用 `Fiber::suspend()` 并将控制权交还给事件循环：

```php
<?php
function make_conn_fiber(Connection $conn) {
    return new Fiber(function() use ($conn): void {
        $fd = $conn->fd;

        while (strpos($conn->inbuf, "\r\n\r\n") === false) {
            $chunk = socket_recv($fd);
            if ($chunk === "") {
                close($fd);
                $conn->closed = true;
                return;
            }

            $conn->inbuf = $conn->inbuf . $chunk;

            if (strpos($conn->inbuf, "\r\n\r\n") === false) {
                Fiber::suspend(0);
            }
        }

        $req = parse_request($conn->inbuf);
        $res = handle_request($req);
        socket_send($fd, $res->render());

        close($fd);
        $conn->closed = true;
    });
}
```

事件循环在连接首次可读时启动 Fiber，然后在其后就绪通知到来时恢复它：

```php
<?php
function service_connection(Connection $conn): void {
    if (!$conn->started) {
        $conn->started = true;
        $conn->fiber = make_conn_fiber($conn);
        $conn->fiber->start();
    } elseif (!$conn->fiber->isTerminated()) {
        $conn->fiber->resume(0);
    }
}
```

没有任何任务是并行运行的。服务器之所以是异步的，是因为每个 Fiber 都会在明确的 I/O 等待点进行让出（yield）。

## 使用 poll() 驱动一切

事件循环为监听器存储一个 `struct pollfd`，并为每个活动连接存储一个。在受支持的目标平台上，`pollfd` 大小为 8 字节：

| 偏移量 | 字段 |
|---|---|
| `0` | 32 位整数形式的 `fd` |
| `4` | 16 位整数形式的 `events` |
| `6` | 16 位整数形式的 `revents` |

小型辅助函数可使指针写入更具可读性：

```php
<?php
function poke32(ptr $p, int $off, int $value): void {
    $cell = ptr_offset($p, $off);
    ptr_write32($cell, $value);
}

function poke16(ptr $p, int $off, int $value): void {
    $cell = ptr_offset($p, $off);
    ptr_write16($cell, $value);
}

function peek16(ptr $p, int $off): int {
    $cell = ptr_offset($p, $off);
    return ptr_read16($cell);
}
```

循环包含四个阶段：

1. 根据监听器和活动连接重建 `pollfd` 数组。
2. 调用 `poll($pollfds, $nfds, -1)` 等待活动。
3. 恢复每个 `revents` 字段非零的连接。
4. 如果监听器就绪，则接受（accept）新的客户端连接，然后回收已关闭的槽位。

大体轮廓如下：

```php
<?php
function run_http_server(int $port): void {
    $max = 64;
    $listen_fd = tcp_listen($port);
    $slots = [];

    $i = 0;
    while ($i < $max) {
        $slots[] = new Connection();
        $i = $i + 1;
    }

    $pollfds = malloc(($max + 1) * 8);

    while (true) {
        poke32($pollfds, 0, $listen_fd);
        poke16($pollfds, 4, 1);
        poke16($pollfds, 6, 0);

        $poll_map = [];
        $active = 0;

        $i = 0;
        while ($i < $max) {
            if ($slots[$i]->active) {
                $base = ($active + 1) * 8;
                poke32($pollfds, $base, $slots[$i]->fd);
                poke16($pollfds, $base + 4, 1);
                poke16($pollfds, $base + 6, 0);
                $poll_map[] = $i;
                $active = $active + 1;
            }
            $i = $i + 1;
        }

        $nfds = $active + 1;
        if (poll($pollfds, $nfds, -1) < 0) {
            break;
        }

        $p = 0;
        while ($p < $active) {
            $rev_off = ($p + 1) * 8 + 6;
            if (peek16($pollfds, $rev_off) != 0) {
                service_connection($slots[$poll_map[$p]]);
            }
            $p = $p + 1;
        }

        if (peek16($pollfds, 6) != 0 && $active < $max) {
            $cfd = socket_accept($listen_fd);
            if ($cfd >= 0) {
                // Find a free slot and call $slots[$free]->reset($cfd).
            }
        }

        // Mark closed slots inactive so they can be reused.
    }

    close($listen_fd);
}
```

实际的示例中填充了空闲槽位搜索、socket 接收/发送封装、解析器、路由器以及错误处理。

## 解析和路由请求

对于极简的 HTTP/1.1 服务器，可以等待直到 `\r\n\r\n` 出现在输入缓冲区中，然后将请求拆分为：

- 请求行：`METHOD /path?query HTTP/1.1`
- 请求头
- 可选的主体（body）

该示例使用 `Request` 类、`Response` 类和简单的分发器对此进行建模：

```php
<?php
function handle_request(Request $req): Response {
    if ($req->method !== "GET") {
        $res = new Response();
        $res->status = 405;
        $res->text("405 Method Not Allowed\n");
        return $res;
    }

    if ($req->path === "/") {
        return route_index();
    } elseif ($req->path === "/hello") {
        return route_hello($req);
    }

    return route_not_found($req);
}
```

相比于运行时的处理器闭包表，更推荐使用命名的处理器函数。该示例使用显式分发，因为这对于提前（AOT）代码生成是可预测的，并且仍然易于阅读。

## 构建与测试

编译完整的示例：

```bash
cargo run -- showcases/http-server/main.php
./showcases/http-server/main
```

然后从另一个终端测试路由：

```bash
curl http://127.0.0.1:8080/
curl 'http://127.0.0.1:8080/hello?name=elephc'
curl http://127.0.0.1:8080/json
curl http://127.0.0.1:8080/stats
```

该示例还包含一个辅助脚本：

```bash
./showcases/http-server/build.sh run
./showcases/http-server/build.sh test
```

## 设计说明

- Fiber 是协作式的。只有在代码调用 `Fiber::suspend()` 时，连接才会让出（yield）控制权。
- 将每个潜在的阻塞 socket 操作都放在 `poll()` 之后。在单个 Fiber 内部进行阻塞等待仍会阻塞整个进程。
- `poll()` 是调度器。它决定接下来应该恢复哪个连接的 Fiber。
- 优先实现 `Connection: close`。长连接（keep-alive）、请求体、TLS 以及分块传输编码（chunked transfer encoding）会增加真正的协议复杂度。
- 保持原生结构体隔离在小型指针辅助函数之后。大多数应用程序代码应该处理 PHP 对象和字符串。

有关此设计背后的语言细节，请参阅 [Fibers](../php/fibers.md)、[FFI & Extern](../beyond-php/extern.md) 和[指针](../beyond-php/pointers.md)。
