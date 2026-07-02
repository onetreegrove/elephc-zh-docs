---
title: "缓冲区"
description: "使用 buffer<T> 的固定大小连续数组，适用于热点路径数据和游戏循环。"
sidebar:
  order: 2
---

`buffer<T>` 是由 POD 值或 packed record（紧凑记录）组成的固定大小连续数组。专为游戏循环、渲染器以及哈希表开销不可接受的性能关键型代码而设计。

## 为什么不使用 PHP 数组？

PHP 数组是哈希表。每次访问都需要经过哈希计算、线性探测和项对比。而 `buffer<T>` 会被编译为单条 `ldr` 指令：`base + 16 + index * stride`。

## 创建缓冲区

```php
<?php
buffer<int> $ids = buffer_new<int>(1000);
buffer<float> $speeds = buffer_new<float>(1000);
buffer<Enemy> $enemies = buffer_new<Enemy>(256);
```

仅接受 POD 标量、指针或 packed-record（紧凑记录）元素类型。不支持联合类型（如 `buffer<int|string>`）或可空类型（如 `buffer<?int>`）。

## Buffer 内置函数

| 函数 | 签名 | 描述 |
|---|---|---|
| `buffer_new<T>()` | `buffer_new<T>($length): buffer<T>` | 分配一个包含 `$length` 个类型为 `T` 的元素的固定大小缓冲区 |
| `buffer_len()` | `buffer_len($buffer): int` | 返回存储在缓冲区头部（header）的逻辑元素数量 |
| `buffer_free()` | `buffer_free($buffer): void` | 释放局部缓冲区变量并将其置为 null |

## 读取和写入

```php
<?php
$buf[3] = 42;          // direct store
echo $buf[3];           // direct load

$enemies[0]->x = 100;  // packed class field access
echo $enemies[0]->x;   // 100
```

## 缓冲区长度

```php
<?php
echo buffer_len($data);   // 512
```

## 释放缓冲区

```php
<?php
buffer_free($buf);   // release heap memory, nullify variable
```

释放后使用（use-after-free）会导致：`Fatal error: use of buffer after buffer_free()`

限制：
- 仅接受普通局部变量
- 释放后使用别名是未定义行为
- 重复释放是未定义行为

## 边界检查

始终启用。越界会导致程序中止：`Fatal error: buffer index out of bounds`

## 内存布局

```
Offset 0:   [length: 8 bytes]
Offset 8:   [stride: 8 bytes]
Offset 16:  [element 0]
Offset 16 + stride: [element 1]
...
```

## SoA 与 AoS 模式

**数组结构体 (SoA)** —— 对单字段进行迭代时具有更好的缓存局部性：

```php
<?php
buffer<float> $x = buffer_new<float>(1000);
buffer<float> $y = buffer_new<float>(1000);
for ($i = 0; $i < 1000; $i++) {
    $x[$i] = $x[$i] + $speed * $dt;
}
```

**结构体数组 (AoS)** —— 在需要同时访问所有字段时表现更好：

```php
<?php
packed class Particle { float $x; float $y; float $vx; float $vy; }
buffer<Particle> $particles = buffer_new<Particle>(10000);
for ($i = 0; $i < buffer_len($particles); $i++) {
    $particles[$i]->x = $particles[$i]->x + $particles[$i]->vx;
}
```

## 局限性

- 固定大小 —— 无法进行 push、pop 或动态调整大小
- 无自动清理 —— 必须显式使用 `buffer_free()`
- 不支持与 PHP 数组进行相互转换
- 无写时复制（copy-on-write）语义
- 不支持 `foreach` 迭代
- 不支持混合元素类型
- 载荷（payload）会被 `buffer_new` 初始化为零值
