---
title: "function_exists()"
description: "针对编译时字符串名称降级 `function_exists(\"name\")`。"
sidebar:
  order: 73
---

## function_exists()

```php
function function_exists(string $function): bool
```

针对编译时字符串名称降级 `function_exists("name")`。

**参数**：
- `$function` (`string`)

**返回值**：`bool`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

有关 `function_exists` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/class/function_exists.md)。
