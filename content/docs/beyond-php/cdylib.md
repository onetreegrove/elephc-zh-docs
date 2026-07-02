---
title: "共享库 (cdylib)"
description: "使用 --emit cdylib 和 #[Export] 将 PHP 函数编译为可供 C 语言调用的共享库。"
sidebar:
  order: 6
---

`--emit cdylib` 将 PHP 文件编译为可加载的共享库，而不是独立的可执行文件。标记有 `#[Export]` 属性的函数将以其未修饰的 PHP 名称成为 C-ABI 符号，因此任何支持 C FFI（C、Rust、Python `ctypes`、Go `cgo`...）的语言都可以 `dlopen` 该库并调用编译后的 PHP。

在所有 elephc 目标平台上均受支持：macOS aarch64 (`.dylib`)、Linux aarch64 和 Linux x86_64 (`.so`)。

## 构建 cdylib

```bash
elephc --emit cdylib auth.php
# Linux:  auth.php -> libauth.so
# macOS:  auth.php -> libauth.dylib
```

输出遵循 `dlopen(3)` 和 `-l` 链接标志所期望的常规 `lib<stem>.so` / `lib<stem>.dylib` 命名方式。别名 `--emit dylib` 和 `--emit shared` 也可被接受。

cdylib 没有 `main` 入口点，且在加载时不会运行任何顶层语句 —— 宿主完全通过导出的函数来驱动一切。

## 导出函数

```php
<?php

#[Export]
function validate_token(string $token): int {
    if (strlen($token) >= 8) {
        return 0;
    }
    return 1;
}

#[Export]
function add_i64(int $a, int $b): int {
    return $a + $b;
}

// Not exported: internal helpers stay invisible to the host.
function internal_helper(): int {
    return 42;
}
```

只有顶层函数可以被导出 —— 类方法、闭包和箭头函数均不符合条件。完全限定拼写 `#[\Elephc\Export]` 也被接受。

在 `--emit executable` 模式下，`#[Export]` 属性会被忽略并触发警告。

## v1 类型映射

| PHP 类型 | C 参数 | C 返回值 |
|---|---|---|
| `int` | `int64_t` | `int64_t` |
| `float` | `double` | `double` |
| `bool` | `int64_t` (0 或 1) | `int64_t` |
| `string` | `const char *ptr, size_t len` (两个参数) | v1 不支持 |
| `void` | — | `void` |

不在此范围内的函数签名（数组、对象、`callable`、`nullable`、可变参数或引用参数）将在编译时被拒绝并输出诊断信息。字符串返回值将在以后的迭代中提供，并结合通过 `elephc_free` 管理的宿主侧所有权。

## 生命周期入口点

每个 cdylib 还导出四个可由 C 调用的生命周期符号：

```c
int32_t     elephc_init(void);        // call once after dlopen; 0 = success
void        elephc_shutdown(void);    // call before dlclose
const char *elephc_last_error(void);  // NULL when no error is recorded
void        elephc_free(void *ptr);   // release elephc-owned pointers (v1: no-op)
```

在 v1 版本中，这些都是低开销的存根（stubs） —— 运行时状态是零初始化的 BSS，因此 `elephc_init` 无需额外操作即可报告成功 —— 但宿主仍然应该调用它们，以便在后续版本引入真正的初始化和清理（setup 和 teardown）时，代码能够保持兼容。

## 极简 C 宿主

```c
#include <dlfcn.h>
#include <stdint.h>
#include <stdio.h>

int main(void) {
    void *lib = dlopen("./libauth.so", RTLD_NOW | RTLD_LOCAL);
    int32_t (*init)(void) = dlsym(lib, "elephc_init");
    int64_t (*add)(int64_t, int64_t) = dlsym(lib, "add_i64");
    int32_t (*validate)(const char *, size_t) = dlsym(lib, "validate_token");

    init();
    printf("%lld\n", (long long)add(40, 2));            // 42
    printf("%d\n", validate("supersecret", 11));        // 0
    return 0;
}
```

```bash
cc -o host host.c -ldl   # -ldl needed on Linux only
./host
```

有关完整的可运行示例，请参见 `examples/cdylib/`。

## 符号可见性

在 ELF 目标平台上，生成的 `.so` 的动态符号表仅包含公共 ABI：`#[Export]` 跳板函数和四个生命周期入口点。每一个内部符号 —— 运行时辅助函数、缓冲区、数据段常量、未导出的 PHP 函数 —— 均以隐藏（hidden）可见性输出。这确保了内部状态是不可抢占的，因此加载到同一进程中的两个 elephc cdylib 永远不会互相混淆或冲突各自的运行时，并且能保持 `dlsym` 查找的快速且不受干扰。

在内部，cdylib 代码生成运行在 PIC（位置无关代码）模式下：全局数据引用通过 GOT（x86_64 平台为 `@GOTPCREL`，AArch64 平台为 `:got:`/`:got_lo12:`），以便动态加载器可以将该库重定位到地址空间中的任意位置。

## v1 局限性

- 不支持字符串、数组、对象、`callable` 或 `nullable` 返回值。
- 不支持将异常传播到宿主 —— PHP 致命错误将导致进程终止。
- 仅支持单线程宿主：运行时没有对其堆内存进行加锁保护。
- 每个 cdylib 仅支持单个 PHP 源文件（`include`/`require` 的工作方式与可执行文件相同）。
