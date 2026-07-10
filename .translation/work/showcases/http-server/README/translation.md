# elephc http-server — PHP 编写的原生异步 HTTP 服务器

一个完全由 PHP 编写，并由 [elephc](https://github.com/illegalstudio/elephc) 编译为独立原生二进制文件（native binary）的可用 HTTP/1.1 服务器。

无需解释器。无需虚拟机。无需 PHP-FPM，无需 Nginx。仅需一个原生可执行文件，即可直接与操作系统内核进行 TCP 通信。

## 主要功能

- 通过 libc 系统调用（`socket`/`bind`/`listen`）打开 TCP 监听套接字
- 运行水平触发的 `poll()` 事件循环 —— 单线程，多连接
- 在各自的 **Fiber / 协程** 中处理每个连接：在等待数据时挂起，并在 `poll()` 报告套接字可读时恢复
- 解析 HTTP/1.1 请求：请求方法、路径、查询字符串、请求头和请求体
- 将请求路由到处理函数，并构建标准的 HTTP 响应
- 复用固定的连接对象池 —— 无需针对每次请求分配对象

## 使用的 elephc 特性

- 使用 `extern function` FFI 直接调用 libc：`socket`、`bind`、`listen`、`accept`、`poll`、`read`、`write`、`close`、`fcntl`、`htons`、`malloc`
- `ptr` 低级内存操作：通过 `malloc`、`ptr_offset`、`ptr_read16`/`ptr_write16`、`ptr_read32`/`ptr_write32`、`ptr_read_string` 来编排 `struct pollfd` 数组和套接字缓冲区（buffer）
- `Fiber` 协作式协程 —— 每个连接一个，通过事件循环驱动其 `suspend()` / `resume()`
- 类、闭包、`match`、关联数组，以及内置的 JSON 和字符串函数
- 运行时（runtime）检测 `PHP_OS` 以处理 macOS/Linux 套接字常量的差异

## 构建与运行

最简单的方法是使用该目录下的 `build.sh` 辅助脚本：

```bash
./showcases/http-server/build.sh run      # build, then start the server
./showcases/http-server/build.sh test     # build, run, check every route, stop
./showcases/http-server/build.sh          # build only, prints how to run it
```

或者手动操作：

```bash
cargo run -- showcases/http-server/main.php
./showcases/http-server/main
```

服务器监听在 `http://127.0.0.1:8080`。按 `Ctrl+C` 停止。

## 尝试一下

```bash
curl http://127.0.0.1:8080/
curl 'http://127.0.0.1:8080/hello?name=elephc'
curl http://127.0.0.1:8080/json
curl http://127.0.0.1:8080/stats
```

| 路由 | 响应 |
|---|---|
| `GET /` | HTML 首页 |
| `GET /hello?name=X` | `Hello, X!`（纯文本） |
| `GET /json` | 一个简单的 JSON 文档 |
| `GET /stats` | 服务器信息 + 请求计数 |
| 其他任何路由 | `404 Not Found` |
| 非 `GET` 请求 | `405 Method Not Allowed` |

## 文件说明

| 文件 | 职责 |
|---|---|
| `main.php` | 连接各个模块并启动服务器 |
| `native.php` | libc socket FFI 声明和 socket 辅助函数 |
| `http.php` | `Request` / `Response` 类和 HTTP 解析器 |
| `routes.php` | 应用程序：路由处理器和分发器（dispatcher） |
| `server.php` | `poll()` 事件循环和“每个连接一个 Fiber”的调度器 |

## 架构设计

```
        TCP client (curl, browser)
                  │
                  ▼
        listening socket (non-blocking)
                  │
                  ▼
   ┌──────────────────────────────────┐
   │  poll() event loop  (run_http_server)
   │  • polls the listener + every     │
   │    active connection              │
   │  • accepts new connections        │
   │  • resumes the Fiber of each      │
   │    socket that is ready           │
   └───────────────┬──────────────────┘
                   │
       ┌───────────┴───────────┐
       ▼                       ▼
  Fiber: connection #1    Fiber: connection #2
  read → parse → route    read → parse → route
  → respond → close       → respond → close
```

每个连接的 Fiber 都会持续读取，直到获取完整的请求。如果请求分多个数据包到达，该 Fiber 将挂起（suspend），事件循环将转而处理其他连接，并在更多数据可用时恢复（resume）该 Fiber。

## 基准测试

对服务器运行 ApacheBench (`ab`) 得到的延迟分布：

```bash
ab -n 100  http://127.0.0.1:8080/
```

![ApacheBench latency percentiles](ab100.png)

所有请求均在大约 1 毫秒内完成 —— 这得益于单个提前编译的原生二进制文件，无需解释器预热，也无需 JIT。

## 说明

本示例旨在展示编译型 PHP 的系统级编程，并非是一个经过加固的生产级服务器。它仅实现了 HTTP/1.1 的一个实用子集（`Connection: close`、无 keep-alive、无分块传输编码），并且是单线程的 —— 其并发能力来自于 `poll()` 多路复用以及协作式 Fiber，全部运行在单核上。
