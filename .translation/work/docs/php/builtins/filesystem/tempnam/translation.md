---
title: "tempnam()"
description: "通过目标感知的运行时辅助函数降级实现 `tempnam(directory, prefix)`。"
sidebar:
  order: 146
---

## tempnam()

```php
function tempnam(string $directory, string $prefix): string
```

通过目标感知的运行时辅助函数降级实现 `tempnam(directory, prefix)`。

**参数**：
- `$directory` (`string`)
- `$prefix` (`string`)

**返回值**：`string`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `tempnam` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/tempnam.md)。
