---
title: "ptr_offset()"
description: "通过向原始地址添加字节偏移量来下放 `ptr_offset(pointer, offset)`。"
sidebar:
  order: 289
---

## ptr_offset()

```php
function ptr_offset(pointer $pointer, int $offset): mixed
```

通过向原始地址添加字节偏移量来下放 `ptr_offset(pointer, offset)`。

**参数**：
- `$pointer` (`pointer`)
- `$offset` (`int`)

**返回值**：`mixed`

_暂无示例 — 请查看 `examples/` 和 `showcases/` 获取使用模式。_







## 内部实现

关于编译器中如何实现 `ptr_offset`，请参见[内部实现页面](../../../internals/builtins/pointer/ptr_offset.md)。
