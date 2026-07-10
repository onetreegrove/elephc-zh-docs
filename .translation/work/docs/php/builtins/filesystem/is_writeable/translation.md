---
title: "is_writeable()"
description: "降级实现 `is_writeable(path)`，它是 PHP 中 `is_writable(path)` 的别名。"
sidebar:
  order: 126
---

## is_writeable()

```php
function is_writeable(string $filename): bool
```

降级实现 `is_writeable(path)`，它是 PHP 中 `is_writable(path)` 的别名。

**参数**：
- `$filename` (`string`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `is_writeable` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/is_writeable.md)。
