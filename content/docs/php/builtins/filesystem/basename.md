---
title: "basename()"
description: "通过目标感知的运行时辅助函数降级实现 `basename(path, suffix?)`。"
sidebar:
  order: 96
---

## basename()

```php
function basename(string $path, string $suffix): string
```

通过目标感知的运行时辅助函数降级实现 `basename(path, suffix?)`。

**参数**：
- `$path` (`string`)
- `$suffix` (`string`)，可选

**返回值**：`string`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `basename` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/basename.md)。
