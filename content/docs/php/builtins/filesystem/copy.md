---
title: "copy()"
description: "通过目标感知的运行时辅助函数降级实现 `copy(source, dest)`。"
sidebar:
  order: 102
---

## copy()

```php
function copy(string $from, string $to, mixed $context): bool
```

通过目标感知的运行时辅助函数降级实现 `copy(source, dest)`。

**参数**：
- `$from` (`string`)
- `$to` (`string`)
- `$context` (`mixed`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `copy` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/copy.md)。
