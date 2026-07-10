---
title: "html_entity_decode()"
description: "降级处理一个单参数 string 内置函数，它会直接委托给运行时辅助函数。"
sidebar:
  order: 356
---

## html_entity_decode()

```php
function html_entity_decode(string $string, int $flags, string $encoding): string
```

降级处理一个单参数 string 内置函数，它会直接委托给运行时辅助函数。

**参数**：
- `$string` (`string`)
- `$flags` (`int`)
- `$encoding` (`string`)

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `html_entity_decode` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/html_entity_decode.md)。
