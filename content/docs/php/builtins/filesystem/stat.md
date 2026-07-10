---
title: "stat()"
description: "降级实现 `stat(path)`，并将运行时 stat 数组或 PHP false 结果装箱。"
sidebar:
  order: 143
---

## stat()

```php
function stat(string $filename): mixed
```

降级实现 `stat(path)`，并将运行时 stat 数组或 PHP false 结果装箱。

**参数**：
- `$filename` (`string`)

**返回值**：`mixed`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `stat` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/stat.md)。
