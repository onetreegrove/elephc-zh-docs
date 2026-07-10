---
title: "file_put_contents()"
description: "通过目标感知的运行时写入器降级实现 `file_put_contents(path, data)`。"
sidebar:
  order: 161
---

## file_put_contents()

```php
function file_put_contents(string $filename, mixed $data, int $flags = 0, mixed $context = null): int
```

通过目标感知的运行时写入器降级实现 `file_put_contents(path, data)`。

**参数**：
- `$filename` (`string`)
- `$data` (`mixed`)
- `$flags` (`int`)，默认值为 `0`，可选
- `$context` (`mixed`)，默认值为 `null`，可选

**返回值**：`int`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `file_put_contents` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/file_put_contents.md)。
