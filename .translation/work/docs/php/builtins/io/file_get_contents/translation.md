---
title: "file_get_contents()"
description: "降级实现 `file_get_contents(path)`，并将运行时返回的字符串或 false 结果装箱。"
sidebar:
  order: 160
---

## file_get_contents()

```php
function file_get_contents(string $filename, bool $use_include_path, mixed $context, int $offset, int $length): mixed
```

降级实现 `file_get_contents(path)`，并将运行时返回的字符串或 false 结果装箱。

**参数**：
- `$filename` (`string`)
- `$use_include_path` (`bool`)
- `$context` (`mixed`)
- `$offset` (`int`)
- `$length` (`int`)

**返回值**：`mixed`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `file_get_contents` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/file_get_contents.md)。
