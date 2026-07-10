---
title: "rename()"
description: "通过目标感知的运行时辅助函数降级实现 `rename(from, to)`。"
sidebar:
  order: 140
---

## rename()

```php
function rename(string $from, string $to, mixed $context): bool
```

通过目标感知的运行时辅助函数降级实现 `rename(from, to)`。

**参数**：
- `$from` (`string`)
- `$to` (`string`)
- `$context` (`mixed`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `rename` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/rename.md)。
