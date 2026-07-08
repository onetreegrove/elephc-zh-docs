---
title: "hash_equals()"
description: "通过时间安全的运行时比较辅助函数降级处理 `hash_equals(known, user)`。"
sidebar:
  order: 350
---

## hash_equals()

```php
function hash_equals(string $known_string, string $user_string): bool
```

通过时间安全的运行时比较辅助函数降级处理 `hash_equals(known, user)`。

**参数**：
- `$known_string` (`string`)
- `$user_string` (`string`)

**返回值**：`bool`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `hash_equals` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/hash_equals.md)。
