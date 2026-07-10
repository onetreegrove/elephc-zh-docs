---
title: "stream_resolve_include_path()"
description: "将 `stream_resolve_include_path(filename)` 降级为基于 realpath 的 `string|false`。"
sidebar:
  order: 207
---

## stream_resolve_include_path()

```php
function stream_resolve_include_path(string $filename): mixed
```

将 `stream_resolve_include_path(filename)` 降级为基于 realpath 的 `string|false`。

**参数**：
- `$filename` (`string`)

**返回值**：`mixed`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 中的用法。_

## 内部实现

关于 `stream_resolve_include_path` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/stream_resolve_include_path.md)。
