---
title: "unset()"
description: "释放给定的变量。"
sidebar:
  order: 283
---

## unset()

```php
function unset(mixed $var, ...$vars): void
```

释放给定的变量。

**参数**:
- `$var` (`mixed`)
- `...$vars` — 可变参数：将多余的参数收集到 `$vars` 中。

**返回值**: `void`

_暂无示例 — 请查看 `examples/` 和 `showcases/` 了解使用模式。_

## 内部实现

关于 `unset` 在编译器中的实现方式，请参阅 [内部实现页面](../../../internals/builtins/misc/unset.md)。
