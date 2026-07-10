---
title: "sha1()"
description: "通过共享的 crypto-backed 运行时辅助函数降级处理 `sha1(data, binary?)`。"
sidebar:
  order: 374
---

## sha1()

```php
function sha1(string $string, bool $binary): string
```

通过共享的 crypto-backed 运行时辅助函数降级处理 `sha1(data, binary?)`。

**参数**：
- `$string` (`string`)
- `$binary` (`bool`)，可选

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `sha1` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/string/sha1.md)。
