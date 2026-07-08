---
title: "Streams 内置函数"
description: "Streams 类别中的内置函数。"
sidebar:
  order: 111
---

## Streams 内置函数

| 函数 | 签名 | 返回值 |
|---|---|---|
| [`fsockopen()`](./streams/fsockopen.md) | `(string $hostname, int $port, int $error_code, string $error_message, float $timeout): mixed` | `mixed` |
| [`pfsockopen()`](./streams/pfsockopen.md) | `(string $hostname, int $port, int $error_code, string $error_message, float $timeout): mixed` | `mixed` |
| [`stream_bucket_append()`](./streams/stream_bucket_append.md) | `(mixed $brigade, mixed $bucket): void` | `void` |
| [`stream_bucket_prepend()`](./streams/stream_bucket_prepend.md) | `(mixed $brigade, mixed $bucket): void` | `void` |
| [`stream_filter_append()`](./streams/stream_filter_append.md) | `(resource $stream, string $filter_name, int $mode, mixed $params): mixed` | `mixed` |
| [`stream_filter_prepend()`](./streams/stream_filter_prepend.md) | `(resource $stream, string $filter_name, int $mode, mixed $params): mixed` | `mixed` |
