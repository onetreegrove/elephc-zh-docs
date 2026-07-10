---
title: "日历"
description: "ext/calendar 函数：格里高利历（公历）、儒略历、法国共和历和犹太历之间的儒略日转换，以及复活节和日历元数据。"
sidebar:
  order: 19
---

elephc 实现了 PHP 的 `ext/calendar` 扩展。每个函数均采用纯整数的儒略日数字（Julian Day Number）算法（忠实移植自 PHP 的 `sdncal` 算法），因此其结果在字节层面上与 PHP 完全一致。

## 儒略日转换

**儒略日数字**（Julian Day Number，简称 JD）是一个连续的日期计数，用作不同历法之间转换的公共枢纽。每种历法都提供了一个 `*tojd` 函数和对应的逆函数 `jdto*`，该逆函数会返回一个 `"m/d/y"` 格式的字符串（对于超出范围的输入则返回 `"0/0/0"`）。

| 历法 | 转换为 JD | 从 JD 转换 |
|---|---|---|
| 格里高利历（公历） | `gregoriantojd($month, $day, $year)` | `jdtogregorian($jd)` |
| 儒略历 | `juliantojd($month, $day, $year)` | `jdtojulian($jd)` |
| 法国共和历 | `frenchtojd($month, $day, $year)` | `jdtofrench($jd)` |
| 犹太历 | `jewishtojd($month, $day, $year)` | `jdtojewish($jd)` |

```php
$jd = gregoriantojd(1, 1, 2000);   // 2451545
echo jdtogregorian($jd);           // "1/1/2000"
echo jdtojewish($jd);              // "4/23/5760"
```

`jdtojewish()` 接受 PHP 的 `$hebrew` 和 `$flags` 参数以保持函数签名兼容，但它始终返回数字形式的 `"m/d/y"` —— 不会生成希伯来文字符的输出。

## 通用分发

`cal_to_jd()`、`cal_from_jd()`、`cal_days_in_month()` 和 `cal_info()` 接受一个历法选择器参数：`CAL_GREGORIAN` (0)、`CAL_JULIAN` (1)、`CAL_JEWISH` (2)、`CAL_FRENCH` (3)。

```php
cal_to_jd(CAL_GREGORIAN, 1, 1, 2000);        // 2451545
cal_days_in_month(CAL_GREGORIAN, 2, 2024);   // 29
cal_days_in_month(CAL_JEWISH, 1, 5784);      // 30 (Tishri)

$info = cal_from_jd(2451545, CAL_GREGORIAN);
// ["date" => "1/1/2000", "month" => 1, "day" => 1, "year" => 2000,
//  "dow" => 6, "abbrevdayname" => "Sat", "dayname" => "Saturday",
//  "abbrevmonth" => "Jan", "monthname" => "January"]

cal_info(CAL_JEWISH)["calname"];             // "Jewish"
count(cal_info());                            // 4 (all calendars when no argument)
```

## 星期和月份名称

```php
jddayofweek($jd, CAL_DOW_DAYNO);   // 0-6 (Sunday = 0)
jddayofweek($jd, CAL_DOW_LONG);    // "Saturday"
jddayofweek($jd, CAL_DOW_SHORT);   // "Sat"

jdmonthname($jd, CAL_MONTH_GREGORIAN_LONG);   // "January"
jdmonthname($jd, CAL_MONTH_JULIAN_SHORT);     // "Jan"
jdmonthname($jd, CAL_MONTH_JEWISH);           // "Tishri"
jdmonthname($jd, CAL_MONTH_FRENCH);           // "Vendemiaire"
```

## 复活节

```php
easter_days(2024);                              // 10  (days after March 21)
easter_days(1750, CAL_EASTER_ALWAYS_JULIAN);    // 25
easter_date(2024);                              // Unix timestamp of Easter midnight
```

`easter_days()` 和 `easter_date()` 默认将年份设置为当前年份。`$mode` 选择器为以下之一：`CAL_EASTER_DEFAULT` (0)、`CAL_EASTER_ROMAN` (1)、`CAL_EASTER_ALWAYS_GREGORIAN` (2)、`CAL_EASTER_ALWAYS_JULIAN` (3)。`easter_date()` 返回使用 `mktime()` 构建的时间戳，因此它遵循默认时区（默认为 UTC，除非另行更改）。

## Unix 时间

```php
unixtojd(0);            // 2440588  (Julian Day of the Unix epoch)
unixtojd();             // Julian Day of the current date
jdtounix(2440588);      // 0
```

不带参数的 `unixtojd()` 会使用当前时间；传入显式的 `0` 则表示纪元。
