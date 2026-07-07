---
title: "touch()"
description: "通过目标感知的运行时辅助函数降级实现 `touch(path, mtime?, atime?)`。"
sidebar:
  order: 148
---

## touch()

```php
function touch(string $filename, int $mtime, int $atime): bool
```

通过目标感知的运行时辅助函数降级实现 `touch(path, mtime?, atime?)`。

**参数**：
- `$filename` (`string`)
- `$mtime` (`int`)，可选
- `$atime` (`int`)，可选

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `touch` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/touch.md)。
