---
title: "array_diff_assoc()"
description: "通过共享的关联 diff/intersect 辅助函数降级 `array_diff_assoc()`（mode 0 = diff）。"
sidebar:
  order: 7
---

## array_diff_assoc()

```php
function array_diff_assoc(array $array, ...$arrays): mixed
```

通过共享的关联 diff/intersect 辅助函数降级 `array_diff_assoc()`（mode 0 = diff）。

**参数**：
- `$array` (`array`)
- `...$arrays` — 可变参数：将多余的参数收集到 `$arrays` 中。

**返回值**：`mixed`

_暂无示例——请查看 `examples/` 和 `showcases/` 目录以获取使用示例。_




## 内部实现

关于 `array_diff_assoc` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_diff_assoc.md)。

