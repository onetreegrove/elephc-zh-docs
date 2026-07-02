---
title: "指针"
description: "使用 ptr()、ptr_get()、ptr_set()、原始字节/字符串辅助函数、指针算术和类型转换进行底层内存访问。"
sidebar:
  order: 1
---

指针提供底层内存访问。指针是存储在单个寄存器中的 64 位内存地址。

## 创建指针

```php
<?php
$x = 42;
$p = ptr($x);        // take the address of a stack variable
$null = ptr_null();   // create a null pointer (0x0)
```

## 读取和写入

```php
<?php
$x = 10;
$p = ptr($x);
echo ptr_get($p);     // 10
ptr_set($p, 99);
echo $x;              // 99
```

## 指针算术

```php
<?php
$p = ptr($x);
$q = ptr_offset($p, 8);   // advance by 8 bytes
```

`ptr_offset` 添加的是**字节**偏移量。

## 类型化指针与类型转换

```php
<?php
$typed = ptr_cast<MyClass>($p);   // change type tag, same address
```

`ptr_cast<T>()` 仅在编译期有效。

## 查询大小

```php
<?php
echo ptr_sizeof("int");      // 8
echo ptr_sizeof("string");   // 16
echo ptr_sizeof("Point");    // computed from class
```

## 子字访问

```php
<?php
ptr_write8($p, 0x41);        // write 1 byte
echo ptr_read8($p);           // read 1 byte
ptr_write16($p, 0x1234);     // write 2 bytes, little-endian
echo ptr_read16($p);          // read 2 bytes, zero-extended
ptr_write32($p, 12345);      // write 4 bytes
echo ptr_read32($p);          // read 4 bytes
```

## 空指针安全

指针解引用辅助函数在解引用空指针时会中止运行。请使用 `ptr_is_null($p)` 进行检查。

## 原始字符串拷贝

```php
<?php
extern function malloc(int $size): ptr;
extern function free(ptr $p): void;

$buf = malloc(64);

$written = ptr_write_string($buf, "HTTP/1.1 200 OK\r\n");
$line = ptr_read_string($buf, $written);

echo $line;
free($buf);
```

`ptr_read_string($p, $len)` 将刚好 `$len` 个字节拷贝到一个新的 PHP 字符串中。它不会在 `\0` 处停止，因此二进制数据会被保留。`$len < 0` 会导致致命错误。

`ptr_write_string($p, $str)` 将 `$str` 的原始字节拷贝到 `$p`，且不带末尾的空终止符，并返回写入的字节数。

## 输出与比较

```php
<?php
echo $p;                      // prints hex: 0x16f502348
echo ptr_null();              // prints: 0x0
echo $p === $q ? "same" : "different";
echo gettype($p);             // "pointer"
```

## 函数参考

| 函数 | 签名 | 描述 |
|---|---|---|
| `ptr($var)` | `ptr($var): pointer` | 获取变量的地址 |
| `ptr_null()` | `ptr_null(): pointer` | 创建一个空指针 |
| `ptr_is_null($p)` | `ptr_is_null($p): bool` | 检查指针是否为空 |
| `ptr_get($p)` | `ptr_get($p): int` | 读取该地址处的 8 个字节 |
| `ptr_set($p, $val)` | `ptr_set($p, $val): void` | 在指定地址写入 8 个字节 |
| `ptr_offset($p, $n)` | `ptr_offset($p, $n): pointer` | 添加字节偏移量 |
| `ptr_cast<T>($p)` | `ptr_cast<T>($p): pointer` | 更改类型标记 |
| `ptr_sizeof("type")` | `ptr_sizeof($t): int` | 获取类型的字节大小 |
| `ptr_read8($p)` | `ptr_read8($p): int` | 读取 1 个字节 |
| `ptr_write8($p, $v)` | `ptr_write8($p, $v): void` | 写入 1 个字节 |
| `ptr_read16($p)` | `ptr_read16($p): int` | 读取 2 个小端字节，并进行零扩展 |
| `ptr_write16($p, $v)` | `ptr_write16($p, $v): void` | 将低 16 位写入为 2 个小端字节 |
| `ptr_read32($p)` | `ptr_read32($p): int` | 读取 4 个字节 |
| `ptr_write32($p, $v)` | `ptr_write32($p, $v): void` | 写入 4 个字节 |
| `ptr_read_string($p, $len)` | `ptr_read_string($p, $len): string` | 将刚好 `$len` 个字节拷贝到一个新的 PHP 字符串中 |
| `ptr_write_string($p, $str)` | `ptr_write_string($p, $str): int` | 将字符串字节拷贝到原始内存中，并返回写入的字节数 |

注意：

- `ptr()` 仅接受变量。`ptr(1 + 2)` 会导致编译时错误。
- `ptr_set()` 写入单个 8 字节字（整型、布尔型、null 或指针）。
- `ptr_cast<T>()` 接受内置类型、类、packed class（紧凑类）以及 extern 类。
- 使用 `===` 和 `!==` 进行比较。`==`/`!=` 会被拒绝。
