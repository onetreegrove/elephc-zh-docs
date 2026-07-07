---
title: "glob()"
description: "通过目标感知的运行时 glob 展开辅助函数降级实现 `glob(pattern)`。"
sidebar:
  order: 119
---

## glob()

```php
function glob(string $pattern, int $flags): array
```

通过目标感知的运行时 glob 展开辅助函数降级实现 `glob(pattern)`。

**参数**：
- `$pattern` (`string`)
- `$flags` (`int`)

**返回值**：`array`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `glob` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/glob.md)。
