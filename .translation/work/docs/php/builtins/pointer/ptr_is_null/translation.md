---
title: "ptr_is_null()"
description: "降级 `ptr_is_null(pointer)`：通过将原始指针地址与零进行比较。"
sidebar:
  order: 287
---

## ptr_is_null()

```php
function ptr_is_null(pointer $pointer): bool
```

降级 `ptr_is_null(pointer)`：通过将原始指针地址与零进行比较。

**参数**：
- `$pointer` (`pointer`)

**返回值**：`bool`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

有关 `ptr_is_null` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/pointer/ptr_is_null.md)。


