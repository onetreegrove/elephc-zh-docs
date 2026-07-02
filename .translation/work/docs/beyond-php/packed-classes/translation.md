---
title: "Packed Classes"
description: "具有编译时字段偏移量的扁平 POD 记录类型，用于热路径存储。"
sidebar:
  order: 3
---

一个 `packed class` 是一个具有编译时字段偏移量的扁平记录。专为需要可预测布局且无哈希开销的热路径数据而设计。

## 声明
```php
<?php
packed class Enemy {
    int $x;
    int $y;
    int $hp;
    int $state;
}
```

## 限制
- 字段必须是 `int`、`float`、`bool`、`ptr` 或另一个 `packed class`
- 无联合类型或可空类型
- 无字符串、数组、对象或 mixed 值
- 无方法、构造函数、继承、trait 或接口
- 仅限 `public` 可见性（可选且多余）
- 无默认值
- 布局是顺序的：字段 0 处于偏移量 0，字段 1 处于偏移量 8，依此类推。

## 与 buffer 配合使用
```php
<?php
packed class Vertex {
    float $x;
    float $y;
    float $u;
    float $v;
    int $color;
}

buffer<Vertex> $verts = buffer_new<Vertex>(1024);
$verts[0]->x = 10.0;
echo $verts[0]->x;  // 10
```

## 最佳实践
- 对于结构化的热路径数据，使用 packed class 代替关联数组
- 对于每次只迭代一个字段的大型数据集，优先选择 SoA（并行 buffer）
- 当总是同时访问所有字段时，使用 AoS（packed class 的 buffer）
