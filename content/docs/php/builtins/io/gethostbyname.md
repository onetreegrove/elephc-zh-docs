---
title: "gethostbyname()"
description: "通过共享运行时解析器降级处理 `gethostbyname(hostname)`。"
sidebar:
  order: 176
---

## gethostbyname()

```php
function gethostbyname(string $hostname): string
```

通过共享运行时解析器降级处理 `gethostbyname(hostname)`。

**参数**：
- `$hostname` (`string`)

**返回值**：`string`

_暂无示例——请查阅 `examples/` 和 `showcases/` 目录以了解使用模式。_




## 内部实现

有关 `gethostbyname` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/gethostbyname.md)。

