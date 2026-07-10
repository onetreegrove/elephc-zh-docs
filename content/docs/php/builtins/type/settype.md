---
title: "settype()"
description: "通过修改解析到的局部 slot 并返回 true 来降级处理 `settype($local, "type")`。"
sidebar:
  order: 427
---

## settype()

```php
function settype(mixed $var, string $type): bool
```

通过修改解析到的局部 slot 并返回 true 来降级处理 `settype($local, "type")`。

**参数**：
- `$var` (`mixed`)，通过引用传递
- `$type` (`string`)

**返回值**：`bool`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `settype` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/type/settype.md)。
