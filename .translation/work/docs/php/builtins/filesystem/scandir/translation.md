---
title: "scandir()"
description: "通过目标感知的运行时目录列表辅助函数降级实现 `scandir(path)`。"
sidebar:
  order: 142
---

## scandir()

```php
function scandir(string $directory, int $sorting_order, mixed $context): array
```

通过目标感知的运行时目录列表辅助函数降级实现 `scandir(path)`。

**参数**：
- `$directory` (`string`)
- `$sorting_order` (`int`)
- `$context` (`mixed`)

**返回值**：`array`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `scandir` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/scandir.md)。
