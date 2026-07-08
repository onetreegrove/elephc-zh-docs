---
title: "wordwrap()"
description: "通过共享运行时辅助函数降级处理 `wordwrap(string, width?, break?, cut?)`。"
sidebar:
  order: 404
---

## wordwrap()

```php
function wordwrap(string $string, int $width, string $break, bool $cut_long_words): string
```

通过共享运行时辅助函数降级处理 `wordwrap(string, width?, break?, cut?)`。

**参数**：
- `$string` (`string`)
- `$width` (`int`)，可选
- `$break` (`string`)，可选
- `$cut_long_words` (`bool`)，可选

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `wordwrap` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/wordwrap.md)。
