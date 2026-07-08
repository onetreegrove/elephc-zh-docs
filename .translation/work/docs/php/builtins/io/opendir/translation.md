---
title: "opendir()"
description: "将 `opendir(path)` 降级处理，并将目录流装箱为 `resource|false`。"
sidebar:
  order: 183
---

## opendir()

```php
function opendir(string $directory): mixed
```

将 `opendir(path)` 降级处理，并将目录流装箱为 `resource|false`。

**参数**：
- `$directory` (`string`)

**返回值**：`mixed`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录中的用法。_




## 内部实现

关于 `opendir` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/opendir.md)。

