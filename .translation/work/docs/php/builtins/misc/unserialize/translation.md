---
title: "unserialize()"
description: "将 `unserialize($data, $options?)` 降级为共享的 unserialize 运行时辅助函数。"
sidebar:
  order: 282
---

## unserialize()

```php
function unserialize(mixed $data, mixed $options): mixed
```

将 `unserialize($data, $options?)` 降级为共享的 unserialize 运行时辅助函数。

**参数**：
- `$data` (`mixed`)
- `$options` (`mixed`)，可选

**返回值**：`mixed`

_暂无示例 — 请检查 `examples/` 和 `showcases/` 以了解使用模式。_






## 内部实现

关于 `unserialize` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/misc/unserialize.md)。
