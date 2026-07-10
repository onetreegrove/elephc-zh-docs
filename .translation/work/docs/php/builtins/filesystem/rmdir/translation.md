---
title: "rmdir()"
description: "通过目标感知的运行时辅助函数降级实现 `rmdir(path)`。"
sidebar:
  order: 141
---

## rmdir()

```php
function rmdir(string $directory, mixed $context = null): bool
```

通过目标感知的运行时辅助函数降级实现 `rmdir(path)`。

**参数**：
- `$directory` (`string`)
- `$context` (`mixed`)，默认值为 `null`，可选

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `rmdir` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/rmdir.md)。
