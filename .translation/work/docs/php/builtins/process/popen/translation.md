---
title: "popen()"
description: "降级处理 `popen(command, mode)`，并将进程管道装箱为 `resource|false`。"
sidebar:
  order: 305
---

## popen()

```php
function popen(string $command, string $mode): mixed
```

降级处理 `popen(command, mode)`，并将进程管道装箱为 `resource|false`。

**参数**：
- `$command` (`string`)
- `$mode` (`string`)

**返回值**：`mixed`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







## 内部实现

关于 `popen` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/process/popen.md)。
