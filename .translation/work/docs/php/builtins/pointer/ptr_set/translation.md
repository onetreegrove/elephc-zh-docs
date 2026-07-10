---
title: "ptr_set()"
description: "通过已检查的指针写入一个机器字来降级 `ptr_set(pointer, value)`。"
sidebar:
  order: 294
---

## ptr_set()

```php
function ptr_set(pointer $pointer, mixed $value): void
```

通过已检查的指针写入一个机器字来降级 `ptr_set(pointer, value)`。

**参数**：
- `$pointer` (`pointer`)
- `$value` (`mixed`)

**返回**：`void`

_暂无示例 —— 请查看 `examples/` 和 `showcases/` 了解使用模式。_






## 内部实现

欲了解 ptr_set 在编译器中的具体实现，请参见[内部实现页面](../../../internals/builtins/pointer/ptr_set.md)。
