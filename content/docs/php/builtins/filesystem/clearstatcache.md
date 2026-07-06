---
title: "clearstatcache()"
description: "在 EIR 操作数求值后，将 `clearstatcache(...)` 降级为空有序 no-op。"
sidebar:
  order: 101
---

## clearstatcache()

```php
function clearstatcache(bool $clear_realpath_cache, string $filename): void
```

在 EIR 操作数求值后，将 `clearstatcache(...)` 降级为空有序 no-op。

**参数**：
- `$clear_realpath_cache` (`bool`)，可选
- `$filename` (`string`)，可选

**返回值**：`void`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `clearstatcache` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/clearstatcache.md)。
