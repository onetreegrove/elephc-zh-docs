---
title: "unlink()"
description: "通过目标感知的运行时辅助函数降级实现 `unlink(path)`。"
sidebar:
  order: 150
---

## unlink()

```php
function unlink(string $filename): bool
```

通过目标感知的运行时辅助函数降级实现 `unlink(path)`。

**参数**：
- `$filename` (`string`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `unlink` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/unlink.md)。
