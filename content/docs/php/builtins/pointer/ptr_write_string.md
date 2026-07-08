---
title: "ptr_write_string()"
description: "通过将 PHP 字符串字节复制到原始内存中，来实现对 `ptr_write_string(pointer, string)` 的降级。"
sidebar:
  order: 299
---

## ptr_write_string()

```php
function ptr_write_string(pointer $pointer, string $string): int
```

通过将 PHP 字符串字节复制到原始内存中，来实现对 `ptr_write_string(pointer, string)` 的降级。

**参数**：
- `$pointer` (`pointer`)
- `$string` (`string`)

**返回值**：`int`

_暂无示例 —— 请查看 `examples/` 和 `showcases/` 获取使用模式。_







## 内部实现

关于 `ptr_write_string` 在编译器中是如何实现的，请参见[内部实现页面](../../../internals/builtins/pointer/ptr_write_string.md)。
