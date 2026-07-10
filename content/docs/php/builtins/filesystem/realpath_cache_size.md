---
title: "realpath_cache_size()"
description: "由于 elephc 没有 realpath 缓存，将 `realpath_cache_size()` 降级为零。"
sidebar:
  order: 139
---

## realpath_cache_size()

```php
function realpath_cache_size(): int
```

由于 elephc 没有 realpath 缓存，将 `realpath_cache_size()` 降级为零。

**参数**：无。

**返回值**：`int`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `realpath_cache_size` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/realpath_cache_size.md)。
