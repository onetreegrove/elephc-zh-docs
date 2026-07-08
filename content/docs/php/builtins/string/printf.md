---
title: "printf()"
description: "将 `printf(format, values...)` 降级为 `sprintf()` 后再输出到 stdout。"
sidebar:
  order: 370
---

## printf()

```php
function printf(string $format, ...$values): int
```

将 `printf(format, values...)` 降级为 `sprintf()` 后再输出到 stdout。

**参数**：
- `$format` (`string`)
- `...$values` — 可变参数：将多余参数收集到 `$values` 中。

**返回值**：`int`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `printf` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/printf.md)。
