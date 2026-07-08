---
title: "ord()"
description: "通过返回字符串的第一个字节来降级处理 `ord()`；若输入为空则返回零。"
sidebar:
  order: 369
---

## ord()

```php
function ord(string $character): int
```

通过返回字符串的第一个字节来降级处理 `ord()`；若输入为空则返回零。

**参数**：
- `$character` (`string`)

**返回值**：`int`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `ord` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/ord.md)。
