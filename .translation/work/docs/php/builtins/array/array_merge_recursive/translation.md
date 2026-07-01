---
title: "array_merge_recursive()"
description: "降级 `array_merge_recursive()`（递归合并，将标量冲突合并为列表）。"
sidebar:
  order: 24
---

## array_merge_recursive()

```php
function array_merge_recursive(...$arrays): mixed
```

降级 `array_merge_recursive()`（递归合并，将标量冲突合并为列表）。

**参数**：
- `...$arrays` — 可变参数：将多余的参数收集至 `$arrays`。

**返回值**：`mixed`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `array_merge_recursive` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/array/array_merge_recursive.md)。
