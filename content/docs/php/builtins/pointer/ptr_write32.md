---
title: "ptr_write32()"
description: "降级 `ptr_write32(pointer, value)`：通过已检查的指针写入一个 32 位字。"
sidebar:
  order: 297
---

## ptr_write32()

```php
function ptr_write32(pointer $pointer, int $value): void
```

降级 `ptr_write32(pointer, value)`：通过已检查的指针写入一个 32 位字。

**参数**：
- `$pointer` (`pointer`)
- `$value` (`int`)

**返回值**：`void`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

有关 `ptr_write32` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/pointer/ptr_write32.md)。
