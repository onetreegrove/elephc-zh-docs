---
title: "fpassthru()"
description: "通过剩余字节流运行时辅助函数降级处理 `fpassthru(stream)`。"
sidebar:
  order: 164
---

## fpassthru()

```php
function fpassthru(resource $stream): int
```

通过剩余字节流运行时辅助函数降级处理 `fpassthru(stream)`。

**参数**：
- `$stream` (`resource`)

**返回值**：`int`

_暂无示例 — 请查阅 `examples/` 和 `showcases/` 目录获取使用模式。_




## 内部实现

关于 `fpassthru` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/fpassthru.md)。

