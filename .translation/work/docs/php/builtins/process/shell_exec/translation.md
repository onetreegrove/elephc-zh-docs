---
title: "shell_exec()"
description: "通过共享运行时辅助函数捕获 shell stdout 来降级处理 `shell_exec(command)`。"
sidebar:
  order: 307
---

## shell_exec()

```php
function shell_exec(string $command): string
```

通过共享运行时辅助函数捕获 shell stdout 来降级处理 `shell_exec(command)`。

**参数**：
- `$command` (`string`)

**返回值**：`string`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `shell_exec` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/process/shell_exec.md)。
