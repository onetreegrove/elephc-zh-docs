---
title: "日期内置函数"
description: "Date 分类下的内置函数。"
sidebar:
  order: 107
---

## 日期内置函数

| 函数 | 签名 | 返回值 |
|---|---|---|
| [`checkdate()`](./date/checkdate.md) | `(int $month, int $day, int $year): bool` | `bool` |
| [`date()`](./date/date.md) | `(string $format, int $timestamp): string` | `string` |
| [`date_default_timezone_get()`](./date/date_default_timezone_get.md) | `(): string` | `string` |
| [`date_default_timezone_set()`](./date/date_default_timezone_set.md) | `(string $timezoneId): bool` | `bool` |
| [`getdate()`](./date/getdate.md) | `(int $timestamp): array` | `array` |
| [`gmdate()`](./date/gmdate.md) | `(string $format, int $timestamp): string` | `string` |
| [`gmmktime()`](./date/gmmktime.md) | `(int $hour, int $minute, int $second, int $month, int $day, int $year): int` | `int` |
| [`hrtime()`](./date/hrtime.md) | `(bool $as_number): mixed` | `mixed` |
| [`localtime()`](./date/localtime.md) | `(int $timestamp, bool $associative): array` | `array` |
| [`microtime()`](./date/microtime.md) | `(bool $as_float): int` | `int` |
| [`mktime()`](./date/mktime.md) | `(int $hour, int $minute, int $second, int $month, int $day, int $year): int` | `int` |
| [`strtotime()`](./date/strtotime.md) | `(string $datetime, int $baseTimestamp): mixed` | `mixed` |
| [`time()`](./date/time.md) | `(): int` | `int` |
