---
title: "boolval()"
description: "使用与 `IsTruthy` 相同的具体标量 PHP truthiness 规则降级处理 `boolval()`。"
sidebar:
  order: 405
---

## boolval()

```php
function boolval(mixed $value): bool
```

使用与 `IsTruthy` 相同的具体标量 PHP truthiness 规则降级处理 `boolval()`。

**参数**：
- `$value` (`mixed`)

**返回值**：`bool`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `boolval` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/type/boolval.md)。
