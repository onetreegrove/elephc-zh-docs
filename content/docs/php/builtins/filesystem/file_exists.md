---
title: "file_exists()"
description: "通过目标感知的运行时 stat 辅助函数降级实现 `file_exists(path)`。"
sidebar:
  order: 106
---

## file_exists()

```php
function file_exists(string $filename): bool
```

通过目标感知的运行时 stat 辅助函数降级实现 `file_exists(path)`。

**参数**：
- `$filename` (`string`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `file_exists` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/file_exists.md)。
