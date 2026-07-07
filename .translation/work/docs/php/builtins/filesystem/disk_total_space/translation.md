---
title: "disk_total_space()"
description: "通过共享磁盘空间运行时辅助函数降级实现 `disk_total_space(path)`。"
sidebar:
  order: 105
---

## disk_total_space()

```php
function disk_total_space(string $directory): float
```

通过共享磁盘空间运行时辅助函数降级实现 `disk_total_space(path)`。

**参数**：
- `$directory` (`string`)

**返回值**：`float`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `disk_total_space` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/disk_total_space.md)。
