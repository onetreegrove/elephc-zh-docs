---
title: "filesize()"
description: "通过目标感知的运行时 stat 辅助函数降级实现 `filesize(path)`。"
sidebar:
  order: 114
---

## filesize()

```php
function filesize(string $filename): int
```

通过目标感知的运行时 stat 辅助函数降级实现 `filesize(path)`。

**参数**：
- `$filename` (`string`)

**返回值**：`int`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `filesize` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/filesize.md)。
