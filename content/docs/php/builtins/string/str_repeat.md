---
title: "str_repeat()"
description: "通过共享运行时辅助函数降级处理 `str_repeat(string, times)`。"
sidebar:
  order: 381
---

## str_repeat()

```php
function str_repeat(string $string, int $times): string
```

通过共享运行时辅助函数降级处理 `str_repeat(string, times)`。

**参数**：
- `$string` (`string`)
- `$times` (`int`)

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `str_repeat` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/str_repeat.md)。
