---
title: "ctype_space()"
description: "通过检查每个字节是否属于 PHP 的 ASCII 空白字符集合来降级处理 `ctype_space(string)`。"
sidebar:
  order: 409
---

## ctype_space()

```php
function ctype_space(string $text): bool
```

通过检查每个字节是否属于 PHP 的 ASCII 空白字符集合来降级处理 `ctype_space(string)`。

**参数**：
- `$text` (`string`)

**返回值**：`bool`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `ctype_space` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/type/ctype_space.md)。
