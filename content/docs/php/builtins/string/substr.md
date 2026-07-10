---
title: "substr()"
description: "使用目标本地指针算术降级处理 `substr(string, offset, length?)`。"
sidebar:
  order: 395
---

## substr()

```php
function substr(string $string, int $offset, int $length): string
```

使用目标本地指针算术降级处理 `substr(string, offset, length?)`。

**参数**：
- `$string` (`string`)
- `$offset` (`int`)
- `$length` (`int`)，可选

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `substr` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/substr.md)。
