---
title: "readfile()"
description: "降级实现 `readfile(path)`，并将运行时返回的字节数或 false 结果装箱。"
sidebar:
  order: 135
---

## readfile()

```php
function readfile(string $filename, bool $use_include_path, mixed $context): mixed
```

降级实现 `readfile(path)`，并将运行时返回的字节数或 false 结果装箱。

**参数**：
- `$filename` (`string`)
- `$use_include_path` (`bool`)
- `$context` (`mixed`)

**返回值**：`mixed`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `readfile` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/readfile.md)。
