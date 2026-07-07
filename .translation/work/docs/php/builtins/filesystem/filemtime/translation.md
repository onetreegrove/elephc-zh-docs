---
title: "filemtime()"
description: "通过目标感知的运行时 stat 辅助函数降级实现 `filemtime(path)`。"
sidebar:
  order: 111
---

## filemtime()

```php
function filemtime(string $filename): int
```

通过目标感知的运行时 stat 辅助函数降级实现 `filemtime(path)`。

**参数**：
- `$filename` (`string`)

**返回值**：`int`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `filemtime` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/filemtime.md)。
