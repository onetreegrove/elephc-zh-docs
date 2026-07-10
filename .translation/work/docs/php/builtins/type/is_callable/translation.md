---
title: "is_callable()"
description: "通过静态查找或运行时 callable 形状辅助函数降级处理 `is_callable(value)`。"
sidebar:
  order: 417
---

## is_callable()

```php
function is_callable(mixed $value, bool $syntax_only = false, string $callable_name = null): bool
```

通过静态查找或运行时 callable 形状辅助函数降级处理 `is_callable(value)`。

**参数**：
- `$value` (`mixed`)
- `$syntax_only` (`bool`)，默认值为 `false`，可选
- `$callable_name` (`string`)，通过引用传递，默认值为 `null`，可选

**返回值**：`bool`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `is_callable` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/type/is_callable.md)。
