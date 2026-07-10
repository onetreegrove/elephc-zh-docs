---
title: "gethostbyaddr()"
description: "将 `gethostbyaddr(address)` 降级处理，并将格式错误的地址封装为 PHP `false`。"
sidebar:
  order: 175
---

## gethostbyaddr()

```php
function gethostbyaddr(string $ip): mixed
```

将 `gethostbyaddr(address)` 降级处理，并将格式错误的地址封装为 PHP `false`。

**参数**：
- `$ip` (`string`)

**返回值**：`mixed`

_暂无示例——请查阅 `examples/` 和 `showcases/` 目录以了解使用模式。_



## 内部实现

关于 `gethostbyaddr` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/gethostbyaddr.md)。
