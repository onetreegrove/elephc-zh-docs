---
title: "base64_decode()"
description: "降级处理一个单参数 string 内置函数，它会直接委托给运行时辅助函数。"
sidebar:
  order: 335
---

## base64_decode()

```php
function base64_decode(string $string, bool $strict): string
```

降级处理一个单参数 string 内置函数，它会直接委托给运行时辅助函数。

**参数**：
- `$string` (`string`)
- `$strict` (`bool`)

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `base64_decode` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/base64_decode.md)。
