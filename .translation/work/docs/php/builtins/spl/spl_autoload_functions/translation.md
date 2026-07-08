---
title: "spl_autoload_functions()"
description: "将 `spl_autoload_functions()` 降级为包含 AOT 规则占位符的索引数组。"
sidebar:
  order: 322
---

## spl_autoload_functions()

```php
function spl_autoload_functions(): array
```

将 `spl_autoload_functions()` 降级为包含 AOT 规则占位符的索引数组。

**参数**：无。

**返回值**：`array`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `spl_autoload_functions` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/spl/spl_autoload_functions.md)。
