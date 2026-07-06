---
title: "数组"
description: "索引数组、关联数组、写时复制，以及内置数组函数。"
sidebar:
  order: 7
---

## 索引数组
```php
<?php
$arr = [10, 20, 30];
echo $arr[0];          // 10
echo count($arr);      // 3
$arr[1] = 99;          // modify
$arr[] = 40;           // push
```

## 字符串数组
```php
<?php
$names = ["Alice", "Bob", "Charlie"];
foreach ($names as $name) {
    echo "Hello, " . $name . "\n";
}
```

## 异构索引数组
索引数组可以包含不同类型的值。当元素类型不一致时，elephc 在内部将其存储为装箱的 `mixed` 值。

```php
<?php
$items = [1, "two", true];
$items[] = 3.5;

echo $items[0]; // 1
echo $items[1]; // two
```

## 关联数组
```php
<?php
$map = ["name" => "Alice", "city" => "Paris"];
echo $map["name"];       // Alice
$map["age"] = "30";      // add new key
```

关联数组使用哈希表运行时。若后续值的类型与第一个值不一致，类型检查器会将其扩展为内部 `mixed` 运行时结构。

键遵循 PHP 的数组键规范化规则：整数键保持为整数，布尔值和浮点数规范化为整数键，数字字符串如 `"1"` 规范化为整数键 `1`，带前导零的字符串如 `"01"` 则保持为字符串键。此规则适用于字面量、读写操作、`foreach`、`array_keys()`、`array_search()`、`array_key_exists()`、`array_flip()`、JSON 对象键以及数组合并运算。

```php
<?php
$map = [1 => "one", "2" => "two", "02" => "leading"];

echo $map["1"];  // one
echo $map[2];    // two
echo $map["02"]; // leading
```

## 用 unset 删除元素

`unset($map[$key])` 从关联数组中删除单个条目。被删除键的键与值存储会被释放，`count()` 的结果减一，`isset()`、`foreach` 以及重新插入操作均可感知该条目已被删除。迭代顺序遵循 PHP 规范：剩余条目保持原有顺序，重新添加已删除的键时，该键会追加到末尾。

```php
<?php
$map = ["a" => 1, "b" => 2, "c" => 3];
unset($map["b"]);

echo count($map);          // 2
echo isset($map["b"]) ? "y" : "n"; // n
$map["b"] = 9;             // re-added at the end
foreach ($map as $k => $v) { echo "$k=$v "; } // a=1 c=3 b=9
```

`unset()` 同样适用于索引数组。PHP 删除该键时**不会重新编号**剩余元素，因此数组会变得稀疏（留下空洞）。剩余键保持原有值，后续的 `$arr[] = ...` 追加操作将从 `max_key + 1` 继续。

```php
<?php
$arr = [1, 2, 3];
unset($arr[1]);
foreach ($arr as $k => $v) { echo "$k=$v "; } // 0=1 2=3 (no key 1)
$arr[] = 9;                                    // appended at key 3
echo isset($arr[1]) ? "y" : "n";               // n
```

`unset()` 遵循写时复制语义：从一个数组中删除键，不会影响由其赋值而来的另一个数组。对不存在的键执行 unset 是空操作。

```php
<?php
$a = ["x" => 1, "y" => 2];
$b = $a;
unset($b["x"]);
echo count($a); // 2 — original is untouched
echo count($b); // 1
```

> 目前尚不支持对**按引用传递**（`function f(array &$a)`）的数组参数删除元素，此操作会报编译错误。

## 数组合并运算

数组之间的 `+` 运算遵循 PHP 的合并语义：左操作数的键优先，右操作数中仅有左操作数缺失的键才会被复制过来。

```php
<?php
$left = ["a" => "left", "b" => "keep"];
$right = ["a" => "right", "c" => "new"];
$result = $left + $right;

echo $result["a"]; // left
echo $result["c"]; // new
```

对于索引数组，数字键会被保留。在 elephc 的紧凑索引数组表示中，这意味着左侧保留索引 `0..count($left)-1`，仅将右侧数字索引更大的后缀部分追加进来。

```php
<?php
$result = [10, 20] + [99, 88, 77];
echo $result[0]; // 10
echo $result[1]; // 20
echo $result[2]; // 77
```

合并运算也可跨索引数组与关联数组进行。索引位置在共享的 PHP 键空间中表现为整数键，因此关联键 `"0"` 会阻止右侧索引 `0` 被复制，而 `"01"` 则作为独立的字符串键保留。

```php
<?php
$left = ["0" => "left zero", "01" => "leading"];
$right = ["right zero", "right one"];
$result = $left + $right;

echo $result[0];    // left zero
echo $result[1];    // right one
echo $result["01"]; // leading
```

## 写时复制语义
数组在被修改之前共享存储，与 PHP 的按值传递行为一致：
```php
<?php
$a = [1, 2];
$b = $a;      // shares storage
$b[0] = 9;    // first write detaches $b
echo $a[0];   // 1
echo $b[0];   // 9
```

同样的机制也适用于函数参数和具有变更副作用的内置函数（`array_push()`、`sort()`、`shuffle()` 等）。

## 多维数组
```php
<?php
$matrix = [[1, 2], [3, 4]];
echo $matrix[0][1];    // 2
```

## 数组解构

数组解构将数组元素赋值给可写目标。短语法和 `list(...)` 均受支持。

```php
<?php
[$first, , $third] = [10, 20, 30];
echo $first; // 10
echo $third; // 30

list($left, $right) = [1, 2];
```

解构模式可以嵌套、带键，并且可以写入与普通赋值相同的目标形式。

```php
<?php
[[$a, $b], [$c, $d]] = [[1, 2], [3, 4]];

["name" => $name, "role" => $role] = ["role" => "admin", "name" => "Ada"];

$items = [0];
[$items[0], $items[]] = [5, 6];
```

PHP 不允许在同一个解构模式中混用带键和不带键的条目，elephc 会将此情况报告为编译期错误。

## 内置数组函数

| 函数 | 签名 | 描述 |
|---|---|---|
| `count()` | `count($arr_or_countable): int` | 元素数量；对于实现了 `Countable` 的对象，会调用其 `count()` 方法 |
| `array_push()` | `array_push($arr, $val): void` | 在末尾添加元素 |
| `array_pop()` | `array_pop($arr): mixed` | 移除并返回最后一个元素 |
| `in_array()` | `in_array($needle, $arr): int` | 查找值（返回 0/1） |
| `array_keys()` | `array_keys($arr): array` | 返回数组的所有键 |
| `array_values()` | `array_values($arr): array` | 返回值的副本 |
| `array_key_exists()` | `array_key_exists($key, $arr): bool` | 检查键是否存在 |
| `array_search()` | `array_search($needle, $arr): int\|string\|false` | 查找值；对索引数组返回整数索引，对关联数组返回第一个匹配的键，未找到则返回 `false` |
| `array_slice()` | `array_slice($arr, $offset [, $length]): array` | 提取切片 |
| `array_splice()` | `array_splice($arr, $offset [, $length]): array` | 就地移除切片并返回被移除的元素 |
| `array_chunk()` | `array_chunk($arr, $size): array` | 拆分为多个块 |
| `array_merge()` | `array_merge($arr1, $arr2): array` | 合并两个数组 |
| `array_merge_recursive()` | `array_merge_recursive($arr1, $arr2): array` | 递归合并两个数组：整数键追加（重新编号），字符串键冲突时，若两个值均为数组则递归合并，否则合并为列表。接受关联数组或**标量索引数组**（int/float/bool）；嵌套的索引数组值视为不透明处理。 |
| `array_replace()` | `array_replace($arr, $replacements): array` | 用 `$replacements` 中匹配的键覆盖 `$arr`（就地，保持位置），并追加新键；后值优先。接受关联数组或**标量索引数组**（int/float/bool）。 |
| `array_replace_recursive()` | `array_replace_recursive($arr, $replacements): array` | 类似 `array_replace()`，但当某键对应的两个值均为关联数组时，递归合并而非覆盖。接受关联数组或**标量索引数组**（int/float/bool）；嵌套的索引数组会被覆盖而非合并。 |
| `array_combine()` | `array_combine($keys, $values): array` | 由键数组和值数组创建新数组 |
| `array_fill()` | `array_fill($start, $num, $value): array` | 用指定值填充数组 |
| `array_fill_keys()` | `array_fill_keys($keys, $value): array` | 用指定键和值填充数组 |
| `array_pad()` | `array_pad($arr, $size, $value): array` | 将数组填充到指定长度 |
| `range()` | `range($start, $end): array` | 生成连续整数数组 |
| `array_diff()` | `array_diff($arr1, $arr2): array` | $arr1 中不在 $arr2 中的值 |
| `array_intersect()` | `array_intersect($arr1, $arr2): array` | 两个数组共有的值 |
| `array_diff_key()` | `array_diff_key($arr1, $arr2): array` | $arr1 中不在 $arr2 中的键 |
| `array_intersect_key()` | `array_intersect_key($arr1, $arr2): array` | 两个数组共有的键 |
| `array_diff_assoc()` | `array_diff_assoc($arr1, $arr2): array` | $arr1 中 `(键, 值)` 对不存在于 $arr2 的条目（值比较方式为 `(string)$a === (string)$b`）。接受关联数组或**标量索引数组**（int/float/bool）。 |
| `array_intersect_assoc()` | `array_intersect_assoc($arr1, $arr2): array` | $arr1 中 `(键, 值)` 对同样存在于 $arr2 的条目（值以字符串方式比较）。接受关联数组或**标量索引数组**（int/float/bool）。 |
| `array_udiff()` | `array_udiff($arr1, $arr2, $cmp): array` | $arr1 中不在 $arr2 中的值，相等性由双参数比较器判定（`$cmp($a, $b) === 0`）。支持字符串、函数或无捕获闭包作为比较器。 |
| `array_uintersect()` | `array_uintersect($arr1, $arr2, $cmp): array` | 两个数组共有的值，相等性由比较器判定（`$cmp($a, $b) === 0`）。 |
| `array_unique()` | `array_unique($arr): array` | 去除重复值 |
| `array_reverse()` | `array_reverse($arr): array` | 反转顺序 |
| `array_flip()` | `array_flip($arr): array` | 交换键和值，并对整数及数字字符串结果键进行规范化 |
| `array_shift()` | `array_shift($arr): mixed` | 移除并返回第一个元素 |
| `array_unshift()` | `array_unshift($arr, $value): int` | 在开头插入元素 |
| `array_sum()` | `array_sum($arr): int\|float` | 所有值的总和 |
| `array_product()` | `array_product($arr): int\|float` | 所有值的乘积 |
| `array_column()` | `array_column($arr, $column_key): array` | 从关联数组组成的数组中提取指定列 |
| `array_is_list()` | `array_is_list($arr): bool` | 若键恰好为顺序排列的 `0..count-1` 则返回 `true`（空数组视为列表） |
| `array_key_first()` | `array_key_first($arr): int\|string\|null` | 按插入顺序的第一个键，数组为空时返回 `null` |
| `array_key_last()` | `array_key_last($arr): int\|string\|null` | 按插入顺序的最后一个键，数组为空时返回 `null` |
| `sort()` | `sort($arr): void` | 升序排序（就地） |
| `rsort()` | `rsort($arr): void` | 降序排序 |
| `asort()` | `asort($arr): void` | 按值升序排序，保留键 |
| `arsort()` | `arsort($arr): void` | 按值降序排序，保留键 |
| `ksort()` | `ksort($arr): void` | 按键升序排序 |
| `krsort()` | `krsort($arr): void` | 按键降序排序 |
| `natsort()` | `natsort($arr): void` | 自然顺序排序 |
| `natcasesort()` | `natcasesort($arr): void` | 不区分大小写的自然顺序排序 |
| `shuffle()` | `shuffle($arr): void` | 随机打乱（就地） |
| `array_multisort()` | `array_multisort($arr1, $arr2): bool` | 对 `$arr1` 升序稳定排序，并同步重排 `$arr2`；两者均就地（按引用）排序。**两个标量元素的索引数组**；降序、排序标志及超过 2 个数组的支持为后续功能。 |
| `array_rand()` | `array_rand($arr): int` | 随机选取一个键 |
| `array_map()` | `array_map($callback, $arr): array` | 对每个元素应用回调 |
| `array_filter()` | `array_filter($arr, $callback, $mode = ARRAY_FILTER_USE_VALUE): array` | 保留回调返回值为真的元素；mode 参数决定回调接收值、键还是两者 |
| `array_reduce()` | `array_reduce($arr, $callback, $init): int` | 归约为单一值 |
| `array_walk()` | `array_walk($arr, $callback): void` | 对每个元素调用回调 |
| `array_walk_recursive()` | `array_walk_recursive($arr, $callback): void` | 对每个非数组叶节点值应用 `$callback`，递归进入嵌套的索引/关联数组。叶节点值必须共享同一标量类型（与 `array_walk` 一致：叶节点按值传递，无键参数）。 |
| `array_find()` | `array_find($arr, $callback): mixed` | （PHP 8.4）返回第一个令 `$callback($value)` 为真的元素，未找到则返回 `null`。 |
| `array_any()` | `array_any($arr, $callback): bool` | （PHP 8.4）若至少有一个元素令 `$callback($value)` 为真，则返回 `true`。 |
| `array_all()` | `array_all($arr, $callback): bool` | （PHP 8.4）若所有元素均令 `$callback($value)` 为真，则返回 `true`。 |
| `usort()` | `usort($arr, $callback): void` | 使用自定义比较函数排序 |
| `uksort()` | `uksort($arr, $callback): void` | 使用自定义比较函数按键排序 |
| `uasort()` | `uasort($arr, $callback): void` | 使用自定义比较函数排序，保留键 |
| `call_user_func()` | `call_user_func($callback, ...): mixed` | 调用一个回调值 |
| `call_user_func_array()` | `call_user_func_array($callback, $args): mixed` | 以数组中的参数调用回调 |
| `function_exists()` | `function_exists("name"): bool` | 检查字面量全局函数名或完全限定函数名是否已定义 |
| `isset()` | `isset($var, ...$vars): int` | 检查每个变量或偏移量是否已定义且不为 null |

`array_filter()` 接受 `ARRAY_FILTER_USE_VALUE`（`0`）、`ARRAY_FILTER_USE_BOTH`（`1`）和 `ARRAY_FILTER_USE_KEY`（`2`）。无效的 mode 值会抛出 `ValueError`。

> 回调参数可以是字符串字面量、用户函数的运行时字符串名称、第一类可调用值、匿名函数、箭头函数，或持有捕获闭包的变量。`array_map()`、`array_filter()`、`array_reduce()`、`array_walk()`、`usort()`、`uksort()` 和 `uasort()` 通过描述符调度解析运行时字符串回调变量。`array_map()` 在所选回调的返回形状仅在运行时才能确定时，会将结果元素存储为 mixed。`array_map()` 同样可以处理异构（装箱 `mixed`）输入数组：每个元素以 `mixed` 值传入回调，因此参数类型为 `mixed`（或无类型）的回调可以接收并返回每个元素的原始运行时类型。
> `call_user_func_array()` 也支持为具有已知签名的回调传入动态索引数组或关联数组作为参数，包括用户空间可变参数回调。当某个可调用值在调用点没有单一静态签名时，elephc 会对该代码生成上下文中可用的用户函数及闭包/FCC 包装器进行 AOT 运行时调度，然后应用匹配目标的描述符元数据：参数名称、默认值、按引用标志、可变参数位置、返回形状、捕获变量、隐藏接收者参数以及可调用形状。运行时字符串回调名称通过不区分大小写的名称匹配，调度到用户函数、受支持的内置函数和公共静态方法字符串，实例化匹配的描述符并调用其生成的描述符调用器。描述符调用器接收参数容器的临时装箱 Mixed 克隆，并检查其运行时标签，以通过相同的签名级包装器处理索引数组和关联哈希，因此调用结束后源 `$args` 仍可以其原始静态布局继续使用。字符串键绑定到具名参数；未消耗的字符串键和数字键会被复制到可变参数回调的 `...$rest` 中。传给按引用回调参数的动态数组使用临时引用单元，因此回调内的写入不会改变源参数数组。

`usort()` 和 `uasort()` 既支持对**对象**数组排序，也支持标量数组。比较器以对象句柄的形式接收每个元素，因此无注解比较器的参数类型会从数组元素自动推断——`usort($items, fn($a, $b) => $a->weight <=> $b->weight)` 无需为 `($a, $b)` 添加类型提示即可正常工作，而对 `DateTime`/`DateTimeImmutable` 的 `usort($dates, fn($a, $b) => $a <=> $b)` 则按时刻比较。也同样接受显式类型提示（`function (Item $a, Item $b)`）。目前尚不支持用自定义比较器对**字符串**数组排序，该操作会报告明确的"不支持特性"错误。

**设计上不支持：** `compact()`、`extract()` 需要运行时变量名表，已列入路线图的"不会实现"列表。
