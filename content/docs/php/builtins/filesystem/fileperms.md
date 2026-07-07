---
title: "fileperms()"
description: "降级实现 `fileperms(path)`，并将运行时返回的整数或 false 结果装箱。"
sidebar:
  order: 113
---

## fileperms()

```php
function fileperms(string $filename): mixed
```

降级实现 `fileperms(path)`，并将运行时返回的整数或 false 结果装箱。

**参数**：
- `$filename` (`string`)

**返回值**：`mixed`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `fileperms` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/fileperms.md)。
