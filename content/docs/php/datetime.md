---
title: "日期和时间"
description: "用于处理日期和时间间隔的内置 DateTime、DateTimeImmutable、DateTimeZone 和 DateInterval 类。"
sidebar:
  order: 18
---

elephc 提供了 PHP 标准库中的面向对象日期/时间类：`DateTime`、`DateTimeImmutable`、`DateTimeInterface`、`DateTimeZone` 和 `DateInterval`。它们是被编译的，而非解释执行，并且构建在与 [系统与 I/O](system-and-io.md) 中记录的相同的 `date()`、`mktime()` 和 `strtotime()` 内置函数之上。

## DateTimeZone

保存时区标识符。

| Method | Description |
|---|---|
| `__construct(string $name)` | 存储时区标识符（例如 `"UTC"`、`"Europe/Paris"`）。 |
| `getName(): string` | 返回存储的标识符。 |
| `getOffset(DateTimeInterface $datetime): int` | 给定瞬间该时区的 UTC 偏移量（秒）—— UTC 以东为正，以西为负 —— 从系统时区数据库中解析，并感知夏令时（daylight-saving aware）。 |
| `static listIdentifiers(int $timezoneGroup = DateTimeZone::ALL, ?string $countryCode = null): array` | 以索引数组形式返回 IANA 时区标识符。如果不带参数，则返回 `ALL` 中的所有时区。`$timezoneGroup` 通过区域组掩码进行过滤（例如 `DateTimeZone::EUROPE`，或多个值按位或）；`ALL_WITH_BC` 还包括向后兼容的时区。如果设置了 `DateTimeZone::PER_COUNTRY`，结果将过滤为 `$countryCode`（大写 ISO 3166-1 代码，区分大小写匹配）；缺失国家/地区代码将抛出 `ValueError`，与 PHP 中一致。 |

`DateTimeZone` 定义了用作 `listIdentifiers()` 选择器的区域/组常量，其按位掩码值与 PHP 相同：`AFRICA` (1)、`AMERICA` (2)、`ANTARCTICA` (4)、`ARCTIC` (8)、`ASIA` (16)、`ATLANTIC` (32)、`AUSTRALIA` (64)、`EUROPE` (128)、`INDIAN` (256)、`PACIFIC` (512)、`UTC` (1024)、`ALL` (2047)、`ALL_WITH_BC` (4095) 和 `PER_COUNTRY` (4096)。

```php
$europe  = DateTimeZone::listIdentifiers(DateTimeZone::EUROPE);            // 58 zones
$euAsia  = DateTimeZone::listIdentifiers(DateTimeZone::EUROPE | DateTimeZone::ASIA);
$withBc  = DateTimeZone::listIdentifiers(DateTimeZone::ALL_WITH_BC);       // incl. US/Eastern, GMT…
$france  = DateTimeZone::listIdentifiers(DateTimeZone::PER_COUNTRY, "FR"); // ["Europe/Paris"]
$all     = timezone_identifiers_list();                                    // alias, same filtering
```
| `getLocation(): array\|false` | 该时区的 `country_code`、`latitude`、`longitude` 和 `comments`，对于没有位置的时区（例如传统的 `CET`/`GMT` 缩写时区）返回 `false`。 |
| `getTransitions(int $timestampBegin = PHP_INT_MIN, int $timestampEnd = PHP_INT_MAX): array\|false` | 该时区的夏令时转换（每行包含 `ts`、`time`、`offset`、`isdst`、`abbr`）。如果不带参数，则返回完整列表；如果带有时间窗口，则返回在 `$timestampBegin` 激活的状态，随后是时间窗口内的转换。对于没有转换的时区返回 `false`。 |
| `static listAbbreviations(): array` | 完整的 缩写 → `[dst, offset, timezone_id]` 表，以小写缩写作为键。 |

```php
$tz = new DateTimeZone("Europe/Paris");
echo $tz->getName();                                // Europe/Paris
echo $tz->getOffset(new DateTime("@1719835200"));   // 7200  (CEST, +02:00, summer)

$loc = $tz->getLocation();
echo $loc["country_code"];                          // FR

$t = $tz->getTransitions();
echo count($t), " ", $t[0]["abbr"];                 // 185 LMT  (row 0 is at PHP_INT_MIN)

$abbr = DateTimeZone::listAbbreviations();
echo $abbr["cest"][0]["timezone_id"];               // Europe/Berlin
```

标识符会针对系统时区数据库进行解析，因此 `getOffset()` 是对夏令时（DST）正确的，并且 `DateTime::format()` 会遵循该时区（参见 [`setTimezone()`](#datetime--datetimeimmutable) 和 [限制](#limitations)）。

`getLocation()`、`getTransitions()` 和 `listAbbreviations()` 表格都是从 PHP 自身的 timelib 数据中预构建的（因此在字节级别上与 PHP 完全一致），并以一个小型桥接库的形式提供，该库**仅**在程序调用这三个方法（或其过程式别名 `timezone_location_get()` / `timezone_transitions_get()` / `timezone_abbreviations_list()`）时才会被链接。

## DateTime and DateTimeImmutable

两者都实现了 `DateTimeInterface`。`DateTime` 会在原地修改对象并返回 `$this`；而 `DateTimeImmutable` 则保持接收者对象不变，并从每个修改器方法中返回一个**新**实例 —— 因此可以安全地链式调用其方法。

| Method | Description |
|---|---|
| `__construct(string $datetime = "now", ?DateTimeZone $timezone = null)` | 根据 `"now"` 或日期/时间字符串（如 `"2024-01-15 10:30:45"`）进行构建。传入 `$timezone` 时，挂钟时间（wall-clock）字符串将在此指定时区中解释（除非字符串本身带有自己的时区），且该时区将成为显示时区。 |
| `getTimestamp(): int` | UNIX 时间戳。 |
| `setTimestamp(int $ts): static` | 根据 UNIX 时间戳设置时刻。 |
| `getMicrosecond(): int` | 亚秒（sub-second）部分（0–999999）。 |
| `setMicrosecond(int $us): static` | 设置亚秒部分；通过 `u`/`v` 格式化字符呈现。 |
| `setDate(int $y, int $m, int $d): static` | 替换日历日期，保留当天的时间。 |
| `setISODate(int $y, int $week, int $dayOfWeek = 1): static` | 根据 ISO 8601 周日期（第 1 天 = 周一）设置日期，保留当天的时间。 |
| `setTime(int $h, int $i, int $s = 0): static` | 替换当天的时间，保留日期。 |
| `getTimezone(): DateTimeZone` | 与之关联的 `DateTimeZone`。 |
| `setTimezone(DateTimeZone $tz): static` | 更改显示时区（绝对时刻保持不变）。 |
| `getOffset(): int` | 该对象自身时区在其时刻的 UTC 偏移量（秒），支持夏令时。 |
| `format(string $format): string` | 通过 `date()` 规范符进行格式化。 |
| `add(DateInterval $interval): static` | 增加一个日历时间间隔（interval）。 |
| `sub(DateInterval $interval): static` | 减去一个日历时间间隔。 |
| `modify(string $modifier): static` | 应用由 `strtotime()` 解析的相对修改器（例如 `"+1 day"`）。 |
| `diff(DateTimeInterface $target): DateInterval` | 两个时刻之间的差值。 |
| `static createFromFormat(string $format, string $datetime, ?DateTimeZone $timezone = null): static\|false` | 根据 `date()` 风格的格式解析字符串，返回新实例，若不匹配则返回 `false`。传入 `$timezone` 时，挂钟时间在此指定时区中解释，且该时区将成为显示时区。 |
| `static createFromTimestamp(int\|float $timestamp): static` | 构建一个设置为指定 UNIX 时间戳的新实例（丢弃小数部分 —— 秒级精度）。 |
| `static createFromInterface(DateTimeInterface $object): static` | 将任意日期对象的时刻和时区复制到此类中（可变 ↔ 不可变）。 |
| `static getLastErrors(): array` | 返回此类上最后一次 `createFromFormat()` 的 `['warning_count', 'warnings', 'error_count', 'errors']` —— 格式不匹配后 `error_count` 为 1，成功后为 0。 |
| `DateTime::createFromImmutable(DateTimeImmutable $object): DateTime` | 不可变日期的可变副本。 |
| `DateTimeImmutable::createFromMutable(DateTime $object): DateTimeImmutable` | 可变日期的不可变副本。 |

```php
$dt = new DateTime();
$dt->setDate(2024, 1, 15);
$dt->setTime(9, 30, 0);
echo $dt->format("Y-m-d H:i:s");      // 2024-01-15 09:30:00

$dt->add(new DateInterval("P1Y2M10D"));
echo $dt->format("Y-m-d");            // 2025-03-25

// DateTimeImmutable returns a fresh instance; the original is unchanged.
$base  = (new DateTimeImmutable())->setDate(2024, 1, 15)->setTime(0, 0, 0);
$later = $base->add(new DateInterval("PT2H30M"));
echo $base->format("H:i:s");          // 00:00:00
echo $later->format("H:i:s");         // 02:30:00
```

`add()` 和 `sub()` 是日历操作：它们分解日期，逐个组件应用时间间隔，然后使用 `mktime()` 重新组合，因此月/日溢出时的归一化行为与 PHP 完全一致（例如，`2020-01-31` 加上一个月将变为 `2020-03-02`）。如果时间间隔的 `invert` 标志为 `1`，则向相反方向应用。

`modify()` 针对对象的当前时间重新解析字符串修改器，等同于 `setTimestamp(strtotime($modifier, $this->getTimestamp()))`。它接受 [`strtotime()`](system-and-io.md) 支持的一切内容 —— 相对偏移量（`"+1 day"`、`"-2 weeks"`、`"+1 month"`）、仅重置时间（`"23:45"`）、裸关键字以及 `"first/last day of …"` / `"first/last <weekday> of …"` 短语：

```php
$dt = new DateTime();
$dt->setDate(2024, 1, 15);
$dt->setTime(10, 0, 0);
$dt->modify("+1 day");      // 2024-01-16 10:00:00
$dt->modify("-2 weeks");    // 2024-01-02 10:00:00
$dt->modify("23:45");       // 2024-01-02 23:45:00
$dt->modify("first day of next month");   // 2024-02-01 10:00:00
$dt->modify("last day of this month");    // 2024-01-31 10:00:00
$dt->modify("first monday of next month");// first Monday of February 2024
```

`createFromFormat()` 是 `format()` 的逆操作：它根据 `date()` 风格的格式解析字符串并返回一个新实例，如果输入字符串不匹配则返回 `false`。未指定的字段默认使用当前日期和时间；前导的 `!` 会将每个字段重置为 Unix 纪元，而 `|` 会重置截至该点尚未解析的字段。

```php
$dt = DateTime::createFromFormat("d/m/Y H:i", "15/03/2024 14:30");
echo $dt->format("Y-m-d H:i:s");        // 2024-03-15 14:30:00

// '!' zeroes the unspecified time fields:
$day = DateTime::createFromFormat("!Y-m-d", "2024-03-15");
echo $day->format("H:i:s");             // 00:00:00

$bad = DateTime::createFromFormat("Y-m-d", "not a date");
var_dump($bad === false);               // bool(true)
```

支持的格式字符包括 `Y y m n d j D l S F M z H G h g i s u v A a U O P Z T e X x`，以及元字符 `! | # ? * + \`。详细说明如下：

- `D` / `l` 解析星期名称（简写或全称，不区分大小写）并将结果向前移动 0–6 天以落入该星期几，这与 PHP/timelib 的相对星期行为相匹配。
- `F` / `M` 解析月份名称（全称、简写或 `sept`，不区分大小写）。
- `S` 消耗英文序数后缀（`st`、`nd`、`rd`、`th`）。
- `z` 是基于 0 的当年天数：它需要一个已解析的年份，会覆盖月/日，并通过 `mktime` 归一化溢出到后续年份。
- `v` 解析最多三位毫秒数字；`u` 解析最多六位微秒数字。
- `#` 匹配 `;:/.,-` 中的一个分隔符，`?` 跳过一个输入字节，`*` 跳过字节直到下一个数字或分隔符，`+` 容忍尾部多余的输入数据，`\` 转义下一个格式字符，`!` / `|` 重置字段。
- 任何其他字符必须字面匹配输入内容，并且（在没有尾随 `+` 的情况下）格式消耗完毕后遗留的输入数据将导致解析失败，这与 PHP 一致。

时区规范符 `O`（`±hhmm`）、`P`（`±hh:mm`）、`Z`（以秒为单位的 UTC 偏移量，带符号或无符号，正数无前导 `+`）、`T`（贪婪字母缩写如 `CEST`/`EDT`/`UTC`）和 `e`（IANA 时区名称）会从输入中消耗相应的子字符串，并针对构建的时刻的时区进行交叉验证（不匹配将返回 `false`，这与 PHP 一致）。接受可选的第三个 `DateTimeZone` 参数：解析后的挂钟时间在此指定时区中解释，并且该时区成为显示时区。

### 格式常量

标准的 `DateTimeInterface` 格式常量在接口以及这两个类上均可用，其值与 PHP 完全相同：

```php
echo DateTime::ATOM;                         // Y-m-d\TH:i:sP
$d = new DateTime("2024-07-01 14:30:00", new DateTimeZone("Europe/Paris"));
echo $d->format(DateTime::ATOM);             // 2024-07-01T14:30:00+02:00
echo $d->format(DateTimeInterface::RFC2822); // Mon, 01 Jul 2024 14:30:00 +0200
```

可用常量：`ATOM`、`COOKIE`、`ISO8601`、`ISO8601_EXPANDED`、`RFC822`、`RFC850`、`RFC1036`、`RFC1123`、`RFC7231`、`RFC2822`、`RFC3339`、`RFC3339_EXTENDED`、`RSS`、`W3C`。`ISO8601_EXPANDED` 使用扩展年份 `X`/`x` 格式规范符，`format()` 对其的渲染方式类似于 `date()`/`gmdate()`（参见 [系统与 I/O](system-and-io.md) 中的规范符表格）。

## DateInterval

表示时间跨度。构造函数解析 ISO 8601 持续时间（duration）字符串 `P[nY][nM][nW][nD][T[nH][nM][nS]]`；`W`（周）组件每个贡献 7 天。

| Property | Meaning |
|---|---|
| `y`, `m`, `d` | 日历年、月、日。 |
| `h`, `i`, `s` | 小时、分钟、秒。 |
| `f` | 秒的小数部分（浮点数）。由 `diff()` 设置，由 `add()`/`sub()` 应用，并由 `format()` 的 `%f`/`%F` 渲染。 |
| `invert` | 当时间间隔为负时为 `1`，否则为 `0`。 |
| `days` | 总完整天数（由 `diff()` 设置）。 |

```php
$iv = new DateInterval("P1Y2M3DT4H5M6S");
echo $iv->y, " ", $iv->m, " ", $iv->d;   // 1 2 3
echo $iv->h, " ", $iv->i, " ", $iv->s;   // 4 5 6

$weeks = new DateInterval("P2W");
echo $weeks->d;                          // 14
```

`DateInterval::format(string $format)` 使用 PHP 的 `%` 规范符渲染时间间隔：

| Specifier | Output |
|---|---|
| `%y` `%m` `%d` `%h` `%i` `%s` | 年 / 月 / 日 / 小时 / 分钟 / 秒，不填充 |
| `%Y` `%M` `%D` `%H` `%I` `%S` | 同上，用零填充至至少两位数 |
| `%a` | 总天数（来自 `diff()`），或者对于直接构建的时间间隔，输出为 `(unknown)` |
| `%f` / `%F` | 来自 `$f` 的完整微秒，不填充 / 用零填充至六位数 |
| `%R` / `%r` | 符号：`-`/`+` 和 `-`/留空 |
| `%%` | 字面量 `%` |

```php
$iv = new DateInterval("P1Y2M3DT4H5M6S");
echo $iv->format("%y years, %m months, %d days");  // 1 years, 2 months, 3 days
echo $iv->format("%H:%I:%S");                       // 04:05:06

$d = (new DateTime("2020-01-01"))->diff(new DateTime("2021-03-15"));
echo $d->format("%a days");                         // 439 days
```

未识别的规范符将原样复制输出。

`DateInterval::createFromDateString(string $datetime)` 根据相对日期字符串而非 ISO 持续时间构建时间间隔。计数是逐字存储的 —— 它们**不**进行归一化（因此 `"90 seconds"` 产生 `s = 90`）—— 周转换为天数（×7），`fortnight` 增加 14 天，负计数存储在组件中（`"-1 day"` 产生 `d = -1`，`invert = 0`）。关键字 `tomorrow` 和 `yesterday` 映射为 ±1 天：

```php
$a = DateInterval::createFromDateString("2 weeks 3 days");  // d = 17
$b = DateInterval::createFromDateString("1 year 2 months"); // y = 1, m = 2
$d = new DateTime("2024-01-31");
$d->add(DateInterval::createFromDateString("1 month"));     // 2024-03-02 (calendar overflow)
```

过程式别名 `date_interval_create_from_date_string($datetime)` 是等效的。未知单词会被忽略，而不会引发错误。

## diff() 的差异

`DateTimeInterface::diff()` 返回一个 `DateInterval`，它既包含**日历明细**（`y`/`m`/`d`），也包含已过去的**总**天数（`days`），加上 `h`/`i`/`s` 余数和 `invert` 方向标志：

```php
$a = new DateTime(); $a->setDate(2020, 1, 1); $a->setTime(0, 0, 0);
$b = new DateTime(); $b->setDate(2021, 3, 15); $b->setTime(0, 0, 0);
$d = $a->diff($b);
echo $d->y, "y ", $d->m, "m ", $d->d, "d";   // 1y 2m 14d
echo " (", $d->days, " days)";               // (439 days)
```

日历组件的计算方式是先增加整年，然后是月，接着是天，因此边界情况与 PHP 一致 —— 例如 `2020-01-31` 到 `2020-03-01` 是 `0y 0m 30d`（而不是部分月份）。

`days` 属性为 `int|false`：由 `diff()` 产生的时间间隔带有真实的总天数计数，而直接构造的时间间隔（`new DateInterval("P2W")`）的 `days === false`（因此它输出为空白，并且 `format("%a")` 渲染为 `(unknown)`），这与 PHP 中完全一致：

```php
$w = new DateInterval("P2W");
var_dump($w->days);              // bool(false)
echo $w->format("%a");           // (unknown)
echo $a->diff($b)->days;         // 439
```

## 比较 DateTime 值

可以使用 `==`、`!=`、`<`、`<=`、`>`、`>=` 以及太空船（spaceship）运算符 `<=>` 来比较 `DateTime` 和 `DateTimeImmutable` 的值。与 PHP 中一样，比较是基于绝对时刻（时间戳加上微秒部分）进行的 —— 因此它独立于存储的时区，并且可以跨这两个类工作：

```php
$a = new DateTime("2024-06-15 12:00:00", new DateTimeZone("UTC"));
$b = new DateTime("2024-06-15 08:00:00", new DateTimeZone("America/New_York"));
var_dump($a == $b);              // bool(true)  — same instant, different zones
var_dump($a < new DateTime("2024-06-15 12:00:01")); // bool(true)
echo (new DateTime("2024-01-01")) <=> (new DateTime("2024-06-01")); // -1
```

全等运算符 `===`/`!==` 没有改变：它们比较的是对象引用，因此即使两个不同的实例代表相同的时刻，它们也永远不会全等。

## DatePeriod

`DatePeriod` 实现了 `Iterator`，因此可以使用 `foreach` 进行遍历，以访问日期范围的每个步骤（step）。从开始日期、`DateInterval` 步长（step）和结束日期来构建它：

```php
$period = new DatePeriod(
    new DateTime("2024-01-01"),
    new DateInterval("P1M"),
    new DateTime("2024-04-01")
);
foreach ($period as $i => $dt) {
    echo $i, ": ", $dt->format("Y-m-d"), "\n";
}
// 0: 2024-01-01
// 1: 2024-02-01
// 2: 2024-03-01
```

默认情况下，结束日期是**排除（exclusive）**的。有两个选项标志用于调整边界：

| Constant | Effect |
|---|---|
| `DatePeriod::EXCLUDE_START_DATE` | 跳过开始日期（推迟一个时间间隔开始）。 |
| `DatePeriod::INCLUDE_END_DATE` | 当步长正好落在结束日期上时，将其包含在内。 |

```php
$p = new DatePeriod($start, $interval, $end, DatePeriod::EXCLUDE_START_DATE);
```

或者，传入一个**整数循环次数（recurrence count）**作为第三个参数，而不是结束日期。然后，该周期生成开始日期加上那么多个后续步长（因此是 `recurrences + 1` 个日期），或者在设置了 `EXCLUDE_START_DATE` 时，恰好生成 `recurrences` 个日期：

```php
$p = new DatePeriod(new DateTime("2024-01-01"), new DateInterval("P1D"), 3);
foreach ($p as $dt) {
    echo $dt->format("m-d"), " ";
}
// 01-01 01-02 01-03 01-04
echo $p->getRecurrences(); // 3
```

每次迭代都会产生一个新的 `DateTime`，因此收集这些值可以使每一步保持独立。步长采用与 `DateTime::add()` 相同的日历算术向前推演，因此月/日溢出时的归一化行为与 PHP 类似。`getStartDate()`、`getEndDate()` 和 `getDateInterval()` 会返回构建该周期时所使用的值。

| Method | Description |
|---|---|
| `__construct(DateTimeInterface $start, DateInterval $interval, DateTimeInterface\|int $end, int $options = 0)` | 在 `[start, end)` 上或针对整数循环次数构建周期。 |
| `getStartDate(): DateTime` | 开始日期。 |
| `getEndDate(): DateTime` | 结束日期。 |
| `getDateInterval(): DateInterval` | 步长时间间隔。 |
| `getRecurrences(): ?int` | 次数形式下的循环次数，结束日期形式下则为 `null`。 |
| `getIterator(): Iterator` | 周期内日期的迭代器，用于 `foreach ($p->getIterator() ...)` / `iterator_to_array($p->getIterator())`。（PHP 将 `DatePeriod` 暴露为 `IteratorAggregate`；而 elephc 的 `DatePeriod` 本身就是一个 `Iterator`，因此 `getIterator()` 返回倒回（rewound）的周期 —— 这是一个单一的实时迭代器，而不是一个独立的副本。） |
| `createFromISO8601String(string $isostr): static` | 从 RFC 5545 重复间隔规范（`R<n>/start[/interval[/end]]`）构建周期。转发给常规构造函数；在规范格式错误时抛出 `DateMalformedPeriodStringException`（PHP 8.3+）—— 对于 `R0/...` 会有循环次数相关的消息，而对于 `R/...`、`R-1/...` 或任何不匹配 `R<数字>/` 的内容则会有 `Unknown or bad format (...)`。已弃用的 `new DatePeriod(string)` 构造函数没有注册，请改用此静态工厂方法。 |

同时支持 `(start, interval, end)` 和 `(start, interval, recurrences)` 两种构造函数形式，另外对于 RFC 5545 字符串形式，支持通过 `createFromISO8601String()` 进行构建。

## 异常

提供了 PHP 8.3 日期/时间异常继承体系，并与标准的 `Error`/`Exception` 类型集成，因此抛出的子类可以在每个祖先级别被捕获：

```php
try {
    throw new DateMalformedStringException("bad input");
} catch (DateException $e) {        // also catchable as Exception
    echo $e->getMessage();
}
```

| Class | Extends |
|---|---|
| `DateError` | `Error` |
| `DateObjectError`, `DateRangeError` | `DateError` |
| `DateException` | `Exception` |
| `DateInvalidTimeZoneException`, `DateInvalidOperationException` | `DateException` |
| `DateMalformedStringException`, `DateMalformedIntervalStringException`, `DateMalformedPeriodStringException` | `DateException` |

## 过程式 API

过程式日期/时间函数被支持为面向对象 API 的别名：

| Procedural | Equivalent |
|---|---|
| `date_create($s)` / `date_create_immutable($s)` | `new DateTime($s)` / `new DateTimeImmutable($s)` |
| `date_create_from_format($f, $s [, $tz])` / `date_create_immutable_from_format($f, $s [, $tz])` | `DateTime::createFromFormat(…)` / `DateTimeImmutable::createFromFormat(…)` |
| `date_format($d, $f)`, `date_diff($a, $b)`, `date_modify($d, $m)` | `$d->format($f)`, `$a->diff($b)`, `$d->modify($m)` |
| `date_add($d, $i)`, `date_sub($d, $i)` | `$d->add($i)`, `$d->sub($i)` |
| `date_date_set($d, $y, $m, $day)`, `date_time_set($d, $h, $m, $s)` | `$d->setDate(…)`, `$d->setTime(…)` |
| `date_timestamp_get/set`, `date_timezone_get/set`, `date_offset_get` | 相匹配的 `getTimestamp`/`setTimestamp`/`getTimezone`/`setTimezone`/`getOffset` |
| `timezone_open($id)`, `timezone_name_get($tz)`, `timezone_offset_get($tz, $d)` | `new DateTimeZone($id)`, `$tz->getName()`, `$tz->getOffset($d)` |
| `timezone_identifiers_list()` | `DateTimeZone::listIdentifiers()` |
| `timezone_name_from_abbr($abbr)` | 常见缩写的 IANA 时区，若无则返回 `false` |
| `timezone_location_get($tz)`, `timezone_transitions_get($tz [, $begin, $end])`, `timezone_abbreviations_list()` | `$tz->getLocation()`, `$tz->getTransitions(…)`, `DateTimeZone::listAbbreviations()` |
| `timezone_version_get()` | `"2026.1"`（打包的自省数据所基于的 IANA 版本） |
| `date_interval_format($i, $f)` | `$i->format($f)` |

`timezone_name_from_abbr()` 识别常见的缩写（`UTC`、`GMT`、`EST`/`EDT`、`CET`/`CEST`、`JST`、`MSK`、`AEST` 等）并返回与 PHP 相同的 IANA 时区；接受可选的 `$utcOffset`/`$isDST` 参数，但不进行基于偏移量的消除歧义（disambiguation）操作。常见集合之外的缩写返回 `false`。

### 解析为组件

`date_parse_from_format(string $format, string $datetime)` 和 `date_parse(string $datetime)` 返回 PHP 风格的解析结果数组 —— 包含 `year`、`month`、`day`、`hour`、`minute`、`second` 和 `fraction` 组件（每个组件存在时为整数，如果输入未指定则为 `false`），以及 `warning_count`、`warnings`、`error_count`、`errors` 和 `is_localtime`：

```php
$r = date_parse_from_format("Y-m-d H:i:s", "2024-03-15 14:30:45");
echo $r["year"], "-", $r["month"], "-", $r["day"];   // 2024-3-15

$d = date_parse("2024-03-15");
var_dump($d["hour"]);                                 // bool(false) — not specified
```

`date_parse_from_format` 使用与 [`createFromFormat()`](#datetime-and-datetimeimmutable) 相同的格式字符。`date_parse` 没有实现 PHP 完整的自由格式语法 —— 它通过依次尝试来识别常见格式（`Y-m-d H:i:s`、`Y-m-d`、`H:i` 等）。

### 日出、日落和曙暮光

`date_sun_info(int $timestamp, float $latitude, float $longitude): array` 返回当天的九键太阳数据数组 —— `sunrise`（日出）、`sunset`（日落）、`transit`（中天）以及 `civil_`/`nautical_`/`astronomical_twilight_begin`/`_end`（民用/航海/天文曙暮光开始/结束）边界。每个升起/下落值都是一个 Unix 时间戳，或者当太阳整天都在该高度之上/之下时，返回 `true`/`false`：

```php
$i = date_sun_info(mktime(0, 0, 0, 6, 21, 2024), 48.8566, 2.3522);  // Paris, summer solstice
echo gmdate("H:i", $i["sunrise"]);                  // 03:47
var_dump($i["astronomical_twilight_begin"]);        // bool(true) — never fully dark
```

已弃用的 `date_sunrise()` / `date_sunset()` 也可用：

```php
date_sunrise($ts, SUNFUNCS_RET_STRING, $lat, $lon, $zenith, $utcOffset);  // "05:45"
date_sunrise($ts, SUNFUNCS_RET_TIMESTAMP, $lat, $lon);                    // Unix timestamp
date_sunset($ts, SUNFUNCS_RET_DOUBLE, $lat, $lon);                        // hour-of-day float
```

`$returnFormat` 为 `SUNFUNCS_RET_TIMESTAMP` (0)、`SUNFUNCS_RET_STRING` (1，默认值) 或 `SUNFUNCS_RET_DOUBLE` (2) 之一；省略的纬度/经度/天顶角将回退到 PHP 的默认值。当太阳当天未达到所请求的高度时，这两个函数都会返回 `false`。该实现是 PHP 的 timelib 天文算法的忠实移植，因此 `date_sun_info()` 以及 `RET_TIMESTAMP`/`RET_STRING` 格式与 PHP 与之完全一致；`RET_DOUBLE` 可能仅在最后一位浮点数上有所不同。

## 限制

- `format()` 在对象**自身的时区**中渲染存储的时刻：在构建时从 `date_default_timezone_get()` 捕获的时区，或者稍后使用 `setTimezone()` 分配的时区。偏移量和夏令时转换是从系统时区数据库中解析的（参见 [系统与 I/O](system-and-io.md)）。`setTimezone()` 仅更改显示时区，而不更改绝对时刻。（`gmdate()` 仍可用于显式的 UTC 格式化。）
- 构造函数接受 `"now"`、绝对日期/时间字符串以及 `@<timestamp>` 纪元形式 —— 任何 [`strtotime()`](system-and-io.md) 能够解析的内容。对于像 `"+1 day"` 这样的相对表达式，你也可以先构建对象然后调用 `modify()`。
- `modify()` 和接受 2 个参数的 `strtotime()` 支持相对偏移量、仅时间重置和关键字形式，外加 `"first/last day of"` 和 `"first/last <weekday> of"` 短语（例如 `"first monday of next month"`、`"last day of this month"`）。`DatePeriod` 支持 `(start, interval, end)` 和 `(start, interval, recurrences)` 形式，外加通过 `DatePeriod::createFromISO8601String()` 支持 RFC 5545 字符串形式（已弃用的 `new DatePeriod("R4/...")` 构造函数未注册）。
- **微秒（Microseconds）**：`getMicrosecond()`/`setMicrosecond()` 存储亚秒组件，并且 `format()` 的 `u`（六位数字）和 `v`（三位数字）规范符可以渲染它。`createFromFormat()` 解析 `u` 规范符（例如 `"Y-m-d H:i:s.u"`、`"U.u"`）。该组件在可变和不可变操作中均被保留，并参与算术运算：`diff()` 在 `DateInterval::$f` 中报告小数秒差异（支持一秒借位和微秒感知排序，因此 `00.750 → 01.250` 为 `s=0, f=0.5`），并且 `add()`/`sub()`应用时间间隔的 `$f` 并跨秒进位。构造函数从日期字符串中捕获尾部的小数秒（`new DateTime("2020-01-01 12:00:00.5")` → 微秒 `500000`，填充/截断为六位数字）；不是小数秒的 `.`（例如 `DD.MM.YYYY` 分隔符）保持原样。`modify()` 也接受 `microsecond[s]`/`usec[s]` 相对单位（例如 `modify("+500000 microseconds")`，可单独使用或与其他子句结合使用），并进位到整秒中。因此，亚秒组件可以通过构造函数、`createFromFormat()` 或 `setMicrosecond()` 进行设置，并参与 `add()`/`sub()`/`diff()`/`modify()` 运算；其他一切仍保持在 libc 的秒级分辨率。
- `createFromFormat()` 支持格式字符 `Y y m n d j D l S F M z H G h g i s u v A a U O P Z T e X x`、`\` 转义和 `!`/`|` 重置。时区规范符 `O`（`±hhmm`）、`P`（`±hh:mm`）、`Z`（以秒为单位的 UTC 偏移量，带符号或无符号，正数无前导 `+`）、`T`（贪婪字母缩写如 `CEST`/`EDT`/`UTC`）和 `e`（IANA 时区名称）会从输入中消耗相应的子字符串，并针对构建的时刻的时区进行交叉验证（不匹配将返回 `false`，这与 PHP 一致）。其可选的第三个 `DateTimeZone` 参数被接受：解析后的挂钟时间在此指定时区中解释，并且它成为显示时区。第三个参数可以内联传入（`new DateTimeZone(...)`）或通过变量传入。
- 1900 年之前的日期：`mktime()`、`gmmktime()`、`strtotime()` 以及 `DateTime`/`DateTimeImmutable` 构造函数支持 101–1899 年（libc 拒绝它们，因此 elephc 通过整 400 年格里高利循环将年份向前移入 libc 的范围，并对结果进行修正）。
- 两位数年份：`mktime()` 和 `gmmktime()` 将 PHP 的两位数年份简写应用于其 `year` 参数 —— 年份 0–69 映射到 2000–2069，年份 70–100 映射到 1970–2000，而年份 ≥ 101 则按字面意义获取（因此 `mktime(0, 0, 0, 1, 1, 99)` 是 1999 年，`mktime(0, 0, 0, 1, 1, 101)` 是 101 年）。相同的简写也应用于由 `strtotime()`/`DateTime` 解析的 `M/D/YY`（或 `MM/DD/YY`）日期字符串的年份字段 —— 因此 `strtotime("1/1/99")` 为 1999 年，`strtotime("1/1/50")` 为 2050 年。该简写**不**应用于以 ISO `YY-MM-DD` 形式编写的两位数年份 —— 那些年份会被作为格式错误而拒绝（PHP 接受它们并重新映射，因此 PHP 中的 `strtotime("99-01-01")` 是 1999-01-01；`__rt_strtotime_iso_entry` 中的 ISO 项要求 4 位数字年份）。

### 目前尚不支持

PHP 日期/时间 API 的少数细微角落尚未实现：

- **详细的解析警告**：`getLastErrors()`/`date_get_last_errors()` 报告上一次 `createFromFormat()` 是成功还是失败（`error_count` 为 0/1），但不保留 PHP 逐个字符的警告/错误位置 —— 仅保留成功/失败计数，这涵盖了常见的 `if (DateTime::getLastErrors()['error_count'])` 守卫条件。
- **序列化钩子**：日期类上未定义 `__serialize()`/`__unserialize()`/`__wakeup()`/`__set_state()` 魔术方法，因为 elephc 对任何类都没有对象的 `serialize()`/`unserialize()`/`var_export()` 来回转换（round-trip）实现。

完整的可运行程序位于 [`examples/datetime/main.php`](https://github.com/illegalstudio/elephc/tree/main/examples/datetime)。
