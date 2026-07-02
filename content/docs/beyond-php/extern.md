---
title: "FFI & Extern"
description: "外部函数接口（FFI）：调用 C 库、extern 函数、全局变量、类以及回调函数。"
sidebar:
  order: 4
---

FFI 允许 elephc 程序直接调用 C 库函数，并支持自动类型转换（type marshalling）。

## 声明 extern 函数
```php
<?php
extern function abs(int $n): int;
extern function getpid(): int;

// With explicit library
extern "curl" function curl_easy_init(): ptr;

// Block syntax
extern "SDL2" {
    function SDL_Init(int $flags): int;
    function SDL_Quit(): void;
}
```

## 支持的 C 类型

| elephc 类型 | C 等价类型 | 传入位置 |
|---|---|---|
| `int` | `int64_t` / `long` | 整型参数寄存器 |
| `float` | `double` | 浮点参数寄存器 |
| `bool` | `int` (0/1) | 整型参数寄存器 |
| `string` | `char*` (自动以 null 结尾) | 整型参数寄存器 |
| `ptr` | `void*` | 整型参数寄存器 |
| `ptr<T>` | `T*` | 整型参数寄存器 |
| `void` | void（仅作返回值） | — |
| `callable` | 函数指针 | 整型参数寄存器 |

参数寄存器遵循所选目标平台的 C ABI：AArch64 使用 `x0`-`x7` 传递整型/指针，使用 `d0`-`d7` 传递双精度浮点数；而 Linux x86_64 使用 System V 寄存器（用 `rdi`、`rsi`、`rdx`、`rcx`、`r8`、`r9` 传递整型/指针，用 `xmm0`-`xmm7` 传递双精度浮点数）。

在 `extern function` 签名中，`callable` 是一种仅限 FFI 使用的特殊路径。调用处既可以提供字符串字面量形式的 elephc 函数名（与 PHP 函数名一样，解析时不区分大小写），也可以提供一个可调用描述符（callable descriptor）。描述符回调会被绑定到生成的 C-ABI 跳板（trampoline）符号中，包括带有闭包捕获、对象接收者、后期静态绑定上下文或分支选择描述符状态的值。该跳板接收 C 回调参数，从全局存储中重新加载保留的描述符，调用描述符的运行时调用器（runtime invoker），并将装箱（boxed）结果转换回与 C 兼容的回调返回类型。

FFI 回调描述符仅限于固定的标量/指针签名：`int`、`float`、`bool`、`ptr` 和 `void` 返回值，参数也仅限于 `int`、`float`、`bool` 和 `ptr`。`string`、数组、对象、可变参数（variadic）、默认值以及引用传递（by-reference）的回调参数都会被拒绝，因为目前尚未对跨越 C 回调边界的所有权和临时生命周期进行安全建模。对于没有 `userdata`/上下文参数的 C API，每个生成的跳板在对应的调用处拥有一个可变描述符槽（descriptor slot）；在同一个调用处注册新的描述符将替换之前的槽所有者。

## 字符串转换
- **调用 C**：elephc 会创建临时的以 null 结尾的副本，并在调用后释放
- **C 返回字符串**：elephc 会扫描 `\0`，并复制到自有的存储空间中

extern 调用支持已声明的参数名：

```php
<?php
extern function strcmp(string $left, string $right): int;

$left = ["a"];
echo strcmp(...$left, right: "b");
```

参数表达式按照 PHP 源码中的顺序进行求值，然后 elephc 将结果值加载到目标平台的 C ABI 寄存器中。当位置参数、命名参数或展开（spread）参数具有副作用时，这一顺序非常重要。

声明的 extern 函数也可以通过动态 PHP 字符串回调进行调用，例如 `call_user_func($cb, ...)` 和 `call_user_func_array($cb, $args)`。运行时描述符使用 extern 调用形式和生成的 PHP-ABI 包装器；包装器在对 PHP 参数进行规范化（normalization）后执行 C ABI 调用。

## 回调
```php
<?php
extern function signal(int $sig, callable $handler): ptr;

function on_signal($sig) {
    echo "caught signal " . $sig . "\n";
}

signal(15, "on_signal");
```

基于描述符的回调可以携带状态：

```php
<?php
extern function signal(int $sig, callable $handler): ptr;

$delta = 3;
$handler = function (int $sig) use ($delta): void {
    echo $sig + $delta;
};

signal(15, $handler);
```

回调函数必须且仅能使用与 C 兼容的类型。不支持字符串、数组、可变参数、默认值或引用传递。

当不需要闭包环境（environment）时，也接受基于描述符的回调：

```php
<?php
extern function signal(int $sig, callable $handler): ptr;

function on_signal(int $sig): void {
    echo $sig;
}

$handler = on_signal(...);
signal(15, $handler);
```

## extern 全局变量
```php
<?php
extern global ptr $environ;
```

使用 GOT 相对寻址。字符串全局变量会自动进行转换。

## extern 类（C 结构体）
```php
<?php
extern class Point {
    public int $x;
    public int $y;
}

$p = ptr_cast<Point>(malloc(16));
$p->x = 10;
echo $p->x;   // 10
```

扁平的顺序布局，无 class_id/vtable。8 字节对齐。

## CLI 链接器标志

| 标志 | 说明 |
|---|---|
| `--link LIB` / `-lLIB` | 链接额外的库 |
| `--link-path DIR` / `-LDIR` | 添加库搜索路径 |
| `--framework NAME` | 链接 macOS framework |

`extern "lib" {}` 块中的库会自动进行链接。
