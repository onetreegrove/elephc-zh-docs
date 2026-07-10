---
title: "getprotobynumber()"
description: "将 `getprotobynumber(number)` 降级处理，并将缺失条目封装为 PHP `false`。"
sidebar:
  order: 179
---

## getprotobynumber()

```php
function getprotobynumber(int $protocol): mixed
```

将 `getprotobynumber(number)` 降级处理，并将缺失条目封装为 PHP `false`。

**参数**：
- `$protocol` (`int`)

**返回值**：`mixed`

_暂无示例 —— 请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_




## 内部实现

关于 `getprotobynumber` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/getprotobynumber.md)。
