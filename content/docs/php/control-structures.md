---
title: "控制结构"
description: "if/else、while、for、foreach、switch、match、try/catch 等。"
sidebar:
  order: 3
---

## if / elseif / else

```php
<?php
if ($x > 0) {
    echo "positive";
} elseif ($x < 0) {
    echo "negative";
} else {
    echo "zero";
}
```

## while

```php
<?php
$i = 0;
while ($i < 10) {
    echo $i;
    $i++;
}
```

## do...while

```php
<?php
$i = 0;
do {
    $i++;
} while ($i < 10);
```

## for

```php
<?php
for ($i = 0; $i < 10; $i++) {
    echo $i;
}
```

## foreach

```php
<?php
$arr = [1, 2, 3];
foreach ($arr as $value) {
    echo $value . "\n";
}

// With key binding (indexed arrays)
foreach ($arr as $i => $value) {
    echo "$i: $value\n";
}

// With key binding (associative arrays)
$map = ["name" => "Alice", "age" => "30"];
foreach ($map as $key => $value) {
    echo "$key = $value\n";
}

// By-reference value binding mutates the source array element.
$nums = [1, 2, 3];
foreach ($nums as &$value) {
    $value *= 2;
}
```

当同时需要键和可变元素引用时，使用 `foreach ($arr as $key => &$value)`。键本身不能通过引用绑定。引用值绑定目前仅支持数组源；对 `Iterator`、`IteratorAggregate` 或 `iterable` 类型的值进行 `foreach ($iterator as &$value)` 遍历会在编译时被拒绝。在消费 `Traversable` 对象时，请使用数组源或通过值进行迭代。

未类型化（untyped）、`mixed` 和联合类型（union-typed）的源将在运行时进行分派。如果运行时值是索引数组或关联数组，则按值和按引用值绑定都支持。如果运行时值是 `Iterator` 或 `IteratorAggregate`，则按值进行迭代；在 `Traversable` 对象上进行按引用值绑定会被拒绝。非可迭代的运行时值将产生致命诊断信息。

`foreach` 也接受任何实现了内置 `Iterator` 接口（`current`、`key`、`next`、`valid`、`rewind`）或 `IteratorAggregate` 接口（`getIterator(): Traversable`）的对象：

```php
<?php
class Range implements Iterator {
    private int $current;
    private int $end;
    public function __construct(int $start, int $end) {
        $this->current = $start;
        $this->end = $end;
    }
    public function rewind(): void {}
    public function valid(): bool { return $this->current < $this->end; }
    public function current(): mixed { return $this->current; }
    public function key(): mixed { return $this->current; }
    public function next(): void { $this->current = $this->current + 1; }
}

foreach (new Range(0, 5) as $i) {
    echo $i;
}
```

循环会调用一次 `rewind()`，然后在每次迭代中：调用 `valid()` 测试循环是否继续，调用 `current()` 和 `key()` 绑定循环变量，并在循环体执行后调用 `next()`。对于具体的迭代器类，方法分派使用类的 vtables；对于 `Iterator`/`IteratorAggregate` 类型的值，则使用接口元数据。`iterable` 伪类型接受数组以及这些 `Traversable` 对象。

## break / continue

```php
<?php
for ($i = 0; $i < 100; $i++) {
    if ($i == 5) { break; }
    if ($i % 2 == 0) { continue; }
    echo $i . " ";
}
// Output: 1 3
```

支持使用正整数字面量深度进行多级退出：

```php
<?php
for ($row = 0; $row < 3; $row++) {
    for ($col = 0; $col < 3; $col++) {
        if ($row == 1 && $col == 1) {
            break 2;       // leaves both loops
        }
    }
}
```

级数包含外层循环和 `switch` 语句，与 PHP 一致。`break;` 和 `continue;` 分别等价于 `break 1;` 和 `continue 1;`。在 `finally` 块内部，`break` 和 `continue` 只能针对在同一个 `finally` 块内部创建的循环或 `switch`；跳转出 `finally` 块会被拒绝，这与 PHP 的行为一致。

## switch / case / default

具有穿透（fall-through）语义的标准 PHP `switch`。使用 `break` 可以防止穿透。

```php
<?php
$x = 2;
switch ($x) {
    case 1:
        echo "one";
        break;
    case 2:
        echo "two";
        break;
    default:
        echo "other";
        break;
}
```

穿透示例：

```php
<?php
$x = 1;
switch ($x) {
    case 1:
    case 2:
        echo "one or two";
        break;
    default:
        echo "other";
}
```

## match expression

PHP 8 风格的 `match` 表达式。无穿透，会返回值，并使用严格比较（`===`）。

```php
<?php
$x = 2;
$result = match($x) {
    1 => "one",
    2 => "two",
    3 => "three",
    default => "other",
};
echo $result; // two
```

如果没有任何分支匹配且没有 `default`，elephc 将因致命运行时错误而中止。

## try / catch / finally / throw

```php
<?php
class DivisionByZeroException extends Exception {}

function divide($left, $right) {
    if ($right == 0) {
        throw new DivisionByZeroException();
    }
    return intdiv($left, $right);
}

try {
    echo divide(10, 2) . PHP_EOL;
    echo divide(10, 0) . PHP_EOL;
} catch (DivisionByZeroException $e) {
    echo "caught" . PHP_EOL;
} finally {
    echo "cleanup" . PHP_EOL;
}
```

支持的子集：

- 内置的 `Error` 和 `Exception` 类以及 `Throwable` 接口无需声明即可直接使用
- `Error` 和 `Exception` 提供了 `$message`、`$code`、`__construct($message = "", $code = 0)`，以及标准的 `Throwable` 方法：`getMessage()`、`getCode()`、`getFile()`、`getLine()`、`getTrace()`、`getTraceAsString()`、`getPrevious()` 和 `__toString()`
- 内置了 SPL 异常体系：`LogicException`、`BadFunctionCallException`、`BadMethodCallException`、`DomainException`、`InvalidArgumentException`、`LengthException`、`OutOfRangeException`、`RuntimeException`、`OutOfBoundsException`、`OverflowException`、`RangeException`、`UnderflowException`、`UnexpectedValueException`。每一个都是继承自 `Exception` 的标记子类（marker subclass），并继承了其构造函数、`$message` 以及标准的 `Throwable` 方法。你可以捕获特定类型（如 `InvalidArgumentException`）、中间父类（如 `LogicException`）或根类型（`Exception`/`Throwable`）
- `throw <expr>;`，其中 `<expr>` 的对象类型必须实现 `Throwable` 接口
- 也可以在诸如 `??` 和三元运算符等表达式中使用 `throw <expr>`
- `catch (ClassName $e)` 和用于多重捕获（multi-catch）的 `catch (TypeA | TypeB $e)`
- `catch (Exception)`、`catch (Error)` 或其他可抛出类型，而无需绑定异常变量
- 捕获的类型必须继承自或实现 `Throwable`
- 用户类不能直接实现 `Throwable`；应继承 `Exception` 或 `Error`，或者实现一个继承自这些子类的 `Throwable` 的用户接口
- 支持多个 `catch` 子句
- `try { ... } finally { ... }`
- `return`、`break` 和 `continue` 会在离开前执行外层包裹的 `finally` 块
- 写在 `finally` 块内部的 `break` 和 `continue` 不能针对外层循环或 `switch`
