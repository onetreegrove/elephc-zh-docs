---
title: "pathinfo()"
description: "通过字符串、数组或装箱动态辅助函数降级实现 `pathinfo(path, flags?)`。"
sidebar:
  order: 133
---

## pathinfo()

```php
function pathinfo(string $path, int $flags): mixed
```

通过字符串、数组或装箱动态辅助函数降级实现 `pathinfo(path, flags?)`。

**参数**：
- `$path` (`string`)
- `$flags` (`int`)，可选

**返回值**：`mixed`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `pathinfo` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/pathinfo.md)。
