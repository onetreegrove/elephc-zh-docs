---
title: "class_alias()"
description: "编译 AOT 别名提取后保留的防御性 `class_alias()` 回退方案。"
sidebar:
  order: 64
---

## class_alias()

```php
function class_alias(string $class, string $alias, bool $autoload): bool
```

编译 AOT 别名提取后保留的防御性 `class_alias()` 回退方案。

**参数**：
- `$class` (`string`)
- `$alias` (`string`)
- `$autoload` (`bool`)，可选

**返回值**：`bool`

_暂无示例 — 请查看 `examples/` 和 `showcases/` 获取使用模式。_






## 内部实现

关于 `class_alias` 在编译器中的具体实现，请参见[内部实现页面](../../../internals/builtins/class/class_alias.md)。
