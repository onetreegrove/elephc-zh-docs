---
title: "spl_autoload()"
description: "通过保留参数副作用并在使用结果时返回 PHP null，降级处理无操作的 autoload 调用。"
sidebar:
  order: 319
---

## spl_autoload()

```php
function spl_autoload(string $class, string $file_extensions): void
```

通过保留参数副作用并在使用结果时返回 PHP null，降级处理无操作的 autoload 调用。

**参数**：
- `$class` (`string`)
- `$file_extensions` (`string`)，可选

**返回值**：`void`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `spl_autoload` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/spl/spl_autoload.md)。
