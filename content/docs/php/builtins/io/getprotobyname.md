---
title: "getprotobyname()"
description: "将 `getprotobyname(protocol)` 降级处理，并将缺失条目装箱为 PHP `false`。"
sidebar:
  order: 178
---

## getprotobyname()

```php
function getprotobyname(string $protocol): mixed
```

将 `getprotobyname(protocol)` 降级处理，并将缺失条目装箱为 PHP `false`。

**参数**：
- `$protocol` (`string`)

**返回值**：`mixed`

_暂无示例——请查阅 `examples/` 和 `showcases/` 目录以获取使用模式。_




## 内部实现

有关 `getprotobyname` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/getprotobyname.md)。

