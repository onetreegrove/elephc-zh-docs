---
title: "define()"
description: "在运行时定义一个命名常量。"
sidebar:
  order: 272
---

## define()

```php
function define(string $constant_name, mixed $value, bool $case_insensitive): bool
```

在运行时定义一个命名常量。

**参数**：
- `$constant_name` (`string`)
- `$value` (`mixed`)
- `$case_insensitive` (`bool`)

**返回值**：`bool`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

有关 `define` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/misc/define.md)。
