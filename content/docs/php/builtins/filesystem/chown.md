---
title: "chown()"
description: "针对整数 UID 和字符串用户名降级实现 `chown(path, owner)`。"
sidebar:
  order: 100
---

## chown()

```php
function chown(string $filename, int $user): bool
```

针对整数 UID 和字符串用户名降级实现 `chown(path, owner)`。

**参数**：
- `$filename` (`string`)
- `$user` (`int`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `chown` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/chown.md)。
