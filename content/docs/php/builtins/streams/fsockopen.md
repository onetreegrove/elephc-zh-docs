---
title: "fsockopen()"
description: "fsockopen() — Elephc 支持的 streams 内置函数。"
sidebar:
  order: 328
---

## fsockopen()

```php
function fsockopen(string $hostname, int $port, int $error_code, string $error_message, float $timeout): mixed
```

`fsockopen()` 是 Elephc 支持的 streams 内置函数。除非下文另有说明，其行为与 PHP 手册一致。

**参数**：
- `$hostname` (`string`)
- `$port` (`int`)
- `$error_code` (`int`)，通过引用传递，可选
- `$error_message` (`string`)，通过引用传递，可选
- `$timeout` (`float`)，可选

**返回值**：`mixed`

_暂无示例 — 请参阅 `examples/` 和 `showcases/` 目录以了解使用模式。_







