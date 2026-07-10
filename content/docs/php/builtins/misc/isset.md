---
title: "isset()"
description: "检测变量是否已设置且不为 null。"
sidebar:
  order: 277
---

## isset()

```php
function isset(mixed $var, ...$vars): bool
```

检测变量是否已设置且不为 null。

**参数**：
- `$var` (`mixed`)
- `...$vars` — 可变参数：将多余的参数收集到 `$vars` 中。

**返回值**：`bool`

_暂无示例 — 请查看 `examples/` 和 `showcases/` 以了解使用模式。_







## 内部实现

关于 `isset` 在编译器中的实现方式，请参阅 [内部实现页面](../../../internals/builtins/misc/isset.md)。
