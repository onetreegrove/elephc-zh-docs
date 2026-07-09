---
title: "数学"
description: "数学函数：abs、floor、ceil、round、clamp、三角函数、对数等。"
sidebar:
  order: 8
---

## 内置数学函数

| 函数 | 签名 | 描述 |
|---|---|---|
| `abs()` | `abs($val): int\|float` | 绝对值（保留类型） |
| `floor()` | `floor($val): float` | 向下取整 |
| `ceil()` | `ceil($val): float` | 向上取整 |
| `round()` | `round($val [, $precision]): float` | 四舍五入 |
| `sqrt()` | `sqrt($val): float` | 平方根 |
| `pow()` | `pow($base, $exp): float` | 幂运算 |
| `min()` | `min($a, $b, ...): int\|float` | 最小值（可变参数） |
| `max()` | `max($a, $b, ...): int\|float` | 最大值（可变参数） |
| `clamp()` | `clamp(?mixed $value, ?mixed $min, ?mixed $max): ?mixed` | 将值限制在指定的闭区间内 |
| `intdiv()` | `intdiv($a, $b): int` | 整除 |
| `fmod()` | `fmod($a, $b): float` | 浮点数取模 |
| `fdiv()` | `fdiv($a, $b): float` | 浮点数除法（除以 0 返回 INF） |
| `rand()` | `rand([$min, $max]): int` | 随机整数 |
| `mt_rand()` | `mt_rand([$min, $max]): int` | rand() 的别名 |
| `random_int()` | `random_int($min, $max): int` | 密码学安全随机数 |
| `sin()` | `sin($angle): float` | 正弦（弧度） |
| `cos()` | `cos($angle): float` | 余弦（弧度） |
| `tan()` | `tan($angle): float` | 正切（弧度） |
| `asin()` | `asin($val): float` | 反正弦 |
| `acos()` | `acos($val): float` | 反余弦 |
| `atan()` | `atan($val): float` | 反正切 |
| `atan2()` | `atan2($y, $x): float` | 双参数反正切 |
| `sinh()` | `sinh($val): float` | 双曲正弦 |
| `cosh()` | `cosh($val): float` | 双曲余弦 |
| `tanh()` | `tanh($val): float` | 双曲正切 |
| `log()` | `log($num [, $base]): float` | 对数 |
| `log2()` | `log2($num): float` | 以 2 为底的对数 |
| `log10()` | `log10($num): float` | 以 10 为底的对数 |
| `exp()` | `exp($val): float` | e^x |
| `hypot()` | `hypot($x, $y): float` | 直角三角形斜边长度 |
| `deg2rad()` | `deg2rad($degrees): float` | 角度转换为弧度 |
| `rad2deg()` | `rad2deg($radians): float` | 弧度转换为角度 |
| `pi()` | `pi(): float` | 返回 M_PI |

`clamp()` 在选择结果之前会先验证边界。如果 `$min > $max` 或任意一个边界为 `NAN`，它将抛出 `ValueError`。在选择结果时，它会先检查上限，然后检查下限。

```php
echo clamp(15, 0, 10);      // 10
echo clamp(3.5, 0.0, 10.0); // 3.5
echo clamp("P", "A", "Z");  // "P"
```

## 数学常量

| 常量 | 类型 | 值 |
|---|---|---|
| `M_PI` | float | 3.14159265358979... |
| `M_E` | float | 2.71828182845904... |
| `M_SQRT2` | float | 1.41421356237309... |
| `M_PI_2` | float | 1.57079632679489... |
| `M_PI_4` | float | 0.78539816339744... |
| `M_LOG2E` | float | 1.44269504088896... |
| `M_LOG10E` | float | 0.43429448190325... |
| `INF` | float | 正无穷 |
| `NAN` | float | 非数值 |
| `PHP_INT_MAX` | int | 9223372036854775807 |
| `PHP_INT_MIN` | int | -9223372036854775808 |
| `PHP_FLOAT_MAX` | float | ~1.8e308 |
| `PHP_FLOAT_MIN` | float | ~2.2e-308 |
| `PHP_FLOAT_EPSILON` | float | ~2.2e-16 |
