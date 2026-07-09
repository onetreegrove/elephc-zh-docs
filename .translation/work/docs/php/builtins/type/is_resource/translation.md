---
title: "is_resource()"
description: "针对静态 resource 和装箱的 Mixed resource cell 降级处理 `is_resource(value)`。"
sidebar:
  order: 424
---

## is_resource()

```php
function is_resource(mixed $value): bool
```

针对静态 resource 和装箱的 Mixed resource cell 降级处理 `is_resource(value)`。

**参数**：
- `$value` (`mixed`)

**返回值**：`bool`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `is_resource` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/type/is_resource.md)。
