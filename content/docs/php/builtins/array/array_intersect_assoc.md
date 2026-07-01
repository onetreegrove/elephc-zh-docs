---
title: "array_intersect_assoc()"
description: "通过共享的关联差集/交集辅助函数（mode 1 = intersect）降级处理 `array_intersect_assoc()`。"
sidebar:
  order: 15
---

## array_intersect_assoc()

```php
function array_intersect_assoc(array $array, ...$arrays): mixed
```

通过共享的关联差集/交集辅助函数（mode 1 = intersect）降级处理 `array_intersect_assoc()`。

**参数**：
- `$array` (`array`)
- `...$arrays` — 可变参数：将多余的参数收集到 `$arrays` 中。

**返回值**：`mixed`

_暂无示例——请查阅 `examples/` 和 `showcases/` 中的使用模式。_




## 内部实现

关于 `array_intersect_assoc` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_intersect_assoc.md)。
