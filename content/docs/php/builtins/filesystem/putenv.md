---
title: "putenv()"
description: "通过将环境字符串复制到持久堆存储中降级实现 `putenv(assignment)`。"
sidebar:
  order: 134
---

## putenv()

```php
function putenv(string $assignment): bool
```

通过将环境字符串复制到持久堆存储中降级实现 `putenv(assignment)`。

**参数**：
- `$assignment` (`string`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `putenv` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/putenv.md)。
