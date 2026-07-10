---
title: "linkinfo()"
description: "通过目标感知的运行时 lstat 辅助函数降级实现 `linkinfo(path)`。"
sidebar:
  order: 130
---

## linkinfo()

```php
function linkinfo(string $path): int
```

通过目标感知的运行时 lstat 辅助函数降级实现 `linkinfo(path)`。

**参数**：
- `$path` (`string`)

**返回值**：`int`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `linkinfo` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/linkinfo.md)。
