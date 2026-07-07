---
title: "lchown()"
description: "针对整数 UID 和字符串用户名降级实现 `lchown(path, owner)`，且不跟随符号链接。"
sidebar:
  order: 128
---

## lchown()

```php
function lchown(string $filename, int $user): bool
```

针对整数 UID 和字符串用户名降级实现 `lchown(path, owner)`，且不跟随符号链接。

**参数**：
- `$filename` (`string`)
- `$user` (`int`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `lchown` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/lchown.md)。
