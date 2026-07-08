---
title: "str_pad()"
description: "通过共享运行时辅助函数降级处理 `str_pad(string, length, pad_string?, pad_type?)`。"
sidebar:
  order: 380
---

## str_pad()

```php
function str_pad(string $string, int $length, string $pad_string, int $pad_type): string
```

通过共享运行时辅助函数降级处理 `str_pad(string, length, pad_string?, pad_type?)`。

**参数**：
- `$string` (`string`)
- `$length` (`int`)
- `$pad_string` (`string`)，可选
- `$pad_type` (`int`)，可选

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `str_pad` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/str_pad.md)。
