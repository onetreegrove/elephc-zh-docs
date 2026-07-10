---
title: "readlink()"
description: "降级实现 `readlink(path)`，并将运行时拥有的字符串或 false 结果装箱。"
sidebar:
  order: 136
---

## readlink()

```php
function readlink(string $path): mixed
```

降级实现 `readlink(path)`，并将运行时拥有的字符串或 false 结果装箱。

**参数**：
- `$path` (`string`)

**返回值**：`mixed`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `readlink` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/readlink.md)。
