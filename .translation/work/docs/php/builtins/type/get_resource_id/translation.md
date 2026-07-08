---
title: "get_resource_id()"
description: "通过解箱原生句柄并将其转为从一开始的编号来降级处理 `get_resource_id(resource)`。"
sidebar:
  order: 411
---

## get_resource_id()

```php
function get_resource_id(resource $resource): int
```

通过解箱原生句柄并将其转为从一开始的编号来降级处理 `get_resource_id(resource)`。

**参数**：
- `$resource` (`resource`)

**返回值**：`int`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `get_resource_id` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/type/get_resource_id.md)。
