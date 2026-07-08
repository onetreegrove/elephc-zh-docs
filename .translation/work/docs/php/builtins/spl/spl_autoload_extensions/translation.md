---
title: "spl_autoload_extensions()"
description: "针对旧式可变扩展名全局状态降级处理 `spl_autoload_extensions()`。"
sidebar:
  order: 321
---

## spl_autoload_extensions()

```php
function spl_autoload_extensions(string $file_extensions): string
```

针对旧式可变扩展名全局状态降级处理 `spl_autoload_extensions()`。

**参数**：
- `$file_extensions` (`string`)，可选

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `spl_autoload_extensions` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/spl/spl_autoload_extensions.md)。
