---
title: "file()"
description: "通过目标感知的运行时行数组辅助函数降级实现 `file(path)`。"
sidebar:
  order: 159
---

## file()

```php
function file(string $filename, int $flags, mixed $context): array
```

通过目标感知的运行时行数组辅助函数降级实现 `file(path)`。

**参数**：
- `$filename` (`string`)
- `$flags` (`int`)
- `$context` (`mixed`)

**返回值**：`array`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `file` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/file.md)。
