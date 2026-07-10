---
title: "preg_match()"
description: "通过共享 regex 运行时辅助函数降级处理 `preg_match(pattern, subject)`。"
sidebar:
  order: 311
---

## preg_match()

```php
function preg_match(string $pattern, string $subject, array $matches): int
```

通过共享 regex 运行时辅助函数降级处理 `preg_match(pattern, subject)`。

**参数**：
- `$pattern` (`string`)
- `$subject` (`string`)
- `$matches` (`array`)，通过引用传递，可选

**返回值**：`int`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `preg_match` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/regex/preg_match.md)。
