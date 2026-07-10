---
title: "str_replace()"
description: "使用三个字符串操作数降级处理 `str_replace()`/`str_ireplace()`。"
sidebar:
  order: 382
---

## str_replace()

```php
function str_replace(string $search, string $replace, string $subject, int $count): mixed
```

使用三个字符串操作数降级处理 `str_replace()`/`str_ireplace()`。

**参数**：
- `$search` (`string`)
- `$replace` (`string`)
- `$subject` (`string`)
- `$count` (`int`)，通过引用传递，可选

**返回值**：`mixed`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `str_replace` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/str_replace.md)。
