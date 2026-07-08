---
title: "exec()"
description: "通过共享运行时辅助函数捕获 shell stdout 来降级处理 `exec(command)`。"
sidebar:
  order: 301
---

## exec()

```php
function exec(string $command, array $output, int $result_code): string
```

通过共享运行时辅助函数捕获 shell stdout 来降级处理 `exec(command)`。

**参数**：
- `$command` (`string`)
- `$output` (`array`)，通过引用传递
- `$result_code` (`int`)，通过引用传递

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `exec` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/process/exec.md)。
