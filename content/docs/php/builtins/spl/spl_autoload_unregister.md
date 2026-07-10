---
title: "spl_autoload_unregister()"
description: "通过保留参数副作用并返回 true，降级处理 autoload 注册桩。"
sidebar:
  order: 324
---

## spl_autoload_unregister()

```php
function spl_autoload_unregister(callable $callback): bool
```

通过保留参数副作用并返回 true，降级处理 autoload 注册桩。

**参数**：
- `$callback` (`callable`)

**返回值**：`bool`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `spl_autoload_unregister` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/spl/spl_autoload_unregister.md)。
