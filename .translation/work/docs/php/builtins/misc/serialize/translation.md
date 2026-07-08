---
title: "serialize()"
description: "将 `serialize($value)` 编译降级为共享的 serialize 运行时辅助函数。"
sidebar:
  order: 281
---

## serialize()

```php
function serialize(mixed $value): string
```

将 `serialize($value)` 编译降级为共享的 serialize 运行时辅助函数。

**参数**：
- `$value` (`mixed`)

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

有关 `serialize` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/misc/serialize.md)。
