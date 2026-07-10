---
title: "ctype_alnum()"
description: "通过检查每个字节是否落在 ASCII 字母或数字范围内来降级处理 `ctype_alnum(string)`。"
sidebar:
  order: 406
---

## ctype_alnum()

```php
function ctype_alnum(string $text): bool
```

通过检查每个字节是否落在 ASCII 字母或数字范围内来降级处理 `ctype_alnum(string)`。

**参数**：
- `$text` (`string`)

**返回值**：`bool`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `ctype_alnum` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/type/ctype_alnum.md)。
