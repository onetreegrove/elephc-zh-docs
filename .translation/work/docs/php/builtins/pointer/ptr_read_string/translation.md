---
title: "ptr_read_string()"
description: "通过将原始字节复制到有所有权的 PHP 字符串中，来实现对 `ptr_read_string(pointer, length)` 的降级。"
sidebar:
  order: 293
---

## ptr_read_string()

```php
function ptr_read_string(pointer $pointer, int $length): string
```

通过将原始字节复制到有所有权的 PHP 字符串中，来实现对 `ptr_read_string(pointer, length)` 的降级。

**参数**：
- `$pointer` (`pointer`)
- `$length` (`int`)

**返回值**：`string`

_暂无示例 —— 请查看 `examples/` 和 `showcases/` 获取使用模式。_







## 内部实现

关于 `ptr_read_string` 在编译器中是如何实现的，请参见[内部实现页面](../../../internals/builtins/pointer/ptr_read_string.md)。
