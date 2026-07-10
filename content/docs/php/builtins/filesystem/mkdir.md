---
title: "mkdir()"
description: "通过目标感知的运行时辅助函数降级实现 `mkdir(path)`。"
sidebar:
  order: 132
---

## mkdir()

```php
function mkdir(string $directory, int $permissions, bool $recursive, bool $context): bool
```

通过目标感知的运行时辅助函数降级实现 `mkdir(path)`。

**参数**：
- `$directory` (`string`)
- `$permissions` (`int`)
- `$recursive` (`bool`)
- `$context` (`bool`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `mkdir` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/mkdir.md)。
