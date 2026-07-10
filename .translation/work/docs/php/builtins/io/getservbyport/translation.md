---
title: "getservbyport()"
description: "将 `getservbyport(port, protocol)` 降级处理，并将缺失条目装箱为 PHP `false`。"
sidebar:
  order: 181
---

## getservbyport()

```php
function getservbyport(int $port, string $protocol): mixed
```

将 `getservbyport(port, protocol)` 降级处理，并将缺失条目装箱为 PHP `false`。

**参数**：
- `$port` (`int`)
- `$protocol` (`string`)

**返回值**：`mixed`

_暂无示例——请查阅 `examples/` 和 `showcases/` 目录以获取使用模式。_




## 内部实现

关于 `getservbyport` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/getservbyport.md)。

