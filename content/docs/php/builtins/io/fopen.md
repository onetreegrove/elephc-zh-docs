---
title: "fopen()"
description: "降级实现 `fopen(filename, mode)`，并将流资源或 PHP false 装箱。"
sidebar:
  order: 163
---

## fopen()

```php
function fopen(string $filename, string $mode, bool $use_include_path, mixed $context): mixed
```

降级实现 `fopen(filename, mode)`，并将流资源或 PHP false 装箱。

**参数**：
- `$filename` (`string`)
- `$mode` (`string`)
- `$use_include_path` (`bool`)，可选
- `$context` (`mixed`)，可选

**返回值**：`mixed`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `fopen` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/fopen.md)。
