---
title: "JSON 内置函数"
description: "JSON 类的内置函数。"
sidebar:
  order: 105
---

## JSON 内置函数

| 函数 | 签名 | 返回值 |
|---|---|---|
| [`json_decode()`](./json/json_decode.md) | `(string $json, bool $associative, int $depth, int $flags): mixed` | `mixed` |
| [`json_encode()`](./json/json_encode.md) | `(mixed $value, int $flags, int $depth): string` | `string` |
| [`json_last_error()`](./json/json_last_error.md) | `(): int` | `int` |
| [`json_last_error_msg()`](./json/json_last_error_msg.md) | `(): string` | `string` |
| [`json_validate()`](./json/json_validate.md) | `(string $json, int $depth, int $flags): bool` | `bool` |
