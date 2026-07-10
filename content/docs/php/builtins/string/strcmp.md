---
title: "strcmp()"
description: "降级处理一个双参数 string 内置函数，它会直接委托给运行时辅助函数。"
sidebar:
  order: 386
---

## strcmp()

```php
function strcmp(string $string1, string $string2): int
```

降级处理一个双参数 string 内置函数，它会直接委托给运行时辅助函数。

**参数**：
- `$string1` (`string`)
- `$string2` (`string`)

**返回值**：`int`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `strcmp` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/strcmp.md)。
