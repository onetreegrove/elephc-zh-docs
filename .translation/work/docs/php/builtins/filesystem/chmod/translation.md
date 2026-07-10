---
title: "chmod()"
description: "通过目标感知的运行时辅助函数降级实现 `chmod(path, mode)`。"
sidebar:
  order: 99
---

## chmod()

```php
function chmod(string $filename, int $permissions): bool
```

通过目标感知的运行时辅助函数降级实现 `chmod(path, mode)`。

**参数**：
- `$filename` (`string`)
- `$permissions` (`int`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `chmod` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/chmod.md)。
