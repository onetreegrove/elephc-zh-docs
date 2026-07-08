---
title: "urlencode()"
description: "降级处理一个单参数 string 内置函数，它会直接委托给运行时辅助函数。"
sidebar:
  order: 401
---

## urlencode()

```php
function urlencode(string $string): string
```

降级处理一个单参数 string 内置函数，它会直接委托给运行时辅助函数。

**参数**：
- `$string` (`string`)

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `urlencode` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/urlencode.md)。
