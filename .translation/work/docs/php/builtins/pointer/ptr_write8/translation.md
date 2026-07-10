---
title: "ptr_write8()"
description: "通过已检查的指针写入一个字节，以降低 \`ptr_write8(pointer, value)\`。"
sidebar:
  order: 298
---

## ptr_write8()

```php
function ptr_write8(pointer $pointer, int $value): void
```

通过已检查的指针写入一个字节来降低 `ptr_write8(pointer, value)`。

**参数**:
- `$pointer` (`pointer`)
- `$value` (`int`)

**返回值**: `void`

_暂无示例 — 请查看 `examples/` 和 `showcases/` 了解使用模式。_







## 内部实现

关于 `ptr_write8` 在编译器中是如何实现的，请参见[内部实现页面](../../../internals/builtins/pointer/ptr_write8.md)。
