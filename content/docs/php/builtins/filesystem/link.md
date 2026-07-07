---
title: "link()"
description: "通过目标感知的 libc 包装器降级实现 `link(oldpath, newpath)`。"
sidebar:
  order: 129
---

## link()

```php
function link(string $target, string $link): bool
```

通过目标感知的 libc 包装器降级实现 `link(oldpath, newpath)`。

**参数**：
- `$target` (`string`)
- `$link` (`string`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `link` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/link.md)。
