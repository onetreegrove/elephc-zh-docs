---
title: "filetype()"
description: "降级实现 `filetype(path)`，并将运行时返回的字符串或 false 结果装箱。"
sidebar:
  order: 115
---

## filetype()

```php
function filetype(string $filename): mixed
```

降级实现 `filetype(path)`，并将运行时返回的字符串或 false 结果装箱。

**参数**：
- `$filename` (`string`)

**返回值**：`mixed`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `filetype` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/filetype.md)。
