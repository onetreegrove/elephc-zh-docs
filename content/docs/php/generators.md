---
title: "生成器"
description: "使用 yield 的生成器函数、内置的 Iterator 和 Generator 类型、对 Iterator 对象进行 foreach 遍历，以及用于协程风格流程的 Generator::send。"
sidebar:
  order: 16
---

*生成器*（generator）是一个其主体使用了 `yield` 关键字的函数。调用生成器函数不会执行其主体，而是返回一个 `Generator` 对象——这是一个实现了内置 `Iterator` 接口的真实 PHP 对象。每次对 `Generator::next()` 的调用（以及 `foreach` 内部的隐式调用）都会运行该主体，直到遇到下一个 `yield`，将产生的值返回，并挂起直到下一次调用。

## 快速示例

```php
<?php
function counter(int $from) {
    $i = $from;
    while ($i < $from + 3) {
        yield $i;
        $i++;
    }
}

foreach (counter(10) as $v) {
    echo $v;
    echo " ";
}
// Prints: 10 11 12
```

## 带有显式和自动键的 yield

当使用不带显式键的 `yield` 时，PHP 会分配一个从 0 开始自增的整数键：

```php
<?php
function gen() { yield "a"; yield "b"; yield "c"; }
foreach (gen() as $k => $v) {
    echo "$k=$v ";
}
// Prints: 0=a 1=b 2=c
```

显式键通过 `=>` 传递。键可以是整型（int）或字符串字面量，并且不会增加自动计数器的值：

```php
<?php
function gen() {
    yield "header";       // auto-key 0
    yield "k" => 42;      // explicit key — counter unchanged
    yield "footer";       // auto-key 1
}
```

## yield from

`yield from <array_literal>` 在编译时展开为每个元素对应一个 yield。这对于在动态 yield 之间夹入固定序列非常有用：

```php
<?php
function delegate() {
    yield 0;
    yield from [10, 20, 30];
    yield 99;
}
foreach (delegate() as $v) { echo $v . " "; }
// Prints: 0 10 20 30 99
```

`yield from <generator_function(args)>` 在运行时将迭代委托给另一个生成器。外层生成器转发内层生成器的每个值（和键），一旦内层生成器耗尽，外层生成器就会继续执行其自身的主体：

```php
<?php
function inner() { yield 1; yield 2; yield 3; }
function outer() {
    yield 0;
    yield from inner();
    yield 99;
}
foreach (outer() as $v) { echo $v . " "; }
// Prints: 0 1 2 3 99
```

`yield from <generator>` 由运行时助手 `__rt_gen_delegate` 驱动，该助手运行在外层生成器的协程栈上：它推进内层生成器，通过外层挂起边界重新 yield 每个内层的键/值，将发送（send）的值转发到内层生成器中，并返回内层生成器的 `getReturn()`。`yield from <array>` 会被脱糖（desugar）为迭代器循环。无效的非生成器、非可迭代的委托在类型检查阶段会被拒绝。

与 PHP 类似，`yield from` 也会评估为被委托生成器的最终 `return` 值，因此外层生成器可以在委托完成后捕获并 yield 或返回它：

```php
<?php
function inner() {
    yield 1;
    return 42;
}

function outer() {
    $ret = yield from inner();
    yield $ret;
}

foreach (outer() as $v) { echo $v . " "; }
// Prints: 1 42
```

被委托的返回值也可以直接作为外层生成器的最终返回值：

```php
<?php
function outer() {
    return yield from inner();
}
```

## 生成器闭包

包含 `yield` 的匿名函数也会返回 `Generator` 对象。捕获的标量局部变量会被复制到生成器帧（generator frame）中，就像普通闭包捕获一样：

```php
<?php
$start = 7;
$gen = function() use ($start) {
    yield $start;
    yield $start + 1;
};

foreach ($gen() as $v) { echo $v . " "; }
// Prints: 7 8
```

## 返回值与 Generator::getReturn()

生成器主体可以以 `return <expr>;` 结束，以存放一个最终值（与 yield 的值不同），调用者可以在迭代完成后通过 `Generator::getReturn()` 获取该值：

```php
<?php
function gen() {
    yield 1;
    yield 2;
    return 42;
}

$g = gen();
foreach ($g as $v) { echo $v . " "; }
echo "ret=" . $g->getReturn();
// Prints: 1 2 ret=42
```

不带值的裸 `return;` 会终止生成器而不写入返回值；此时 `getReturn()` 将呈现该槽位（slot）的初始值 null 或 0。

## Generator::throw

`$g->throw($exc)` 会恢复生成器，并**在挂起的 `yield` 处**引发 `$exc`，这与 PHP 完全一致。如果生成器主体周围有 `try`/`catch`，则该处理器会运行并继续执行；`throw()` 的值是下一个 yield 的值。如果异常在主体内部未被捕获，它将传播给调用者，就像是生成器抛出的一样。

```php
<?php
function gen() {
    try {
        yield 1;
    } catch (Exception $e) {
        echo "caught inside: " . $e->getMessage() . " ";
    }
    yield 2;
}

$g = gen();
echo $g->current() . " ";              // 1
echo $g->throw(new Exception("boom")); // caught inside: boom 2
// Prints: 1 caught inside: boom 2
```

当主体没有异常处理器时，异常会逃逸到调用者最近的活动处理器：

```php
<?php
function gen() {
    yield 1;
    yield 2;
}

try {
    $g = gen();
    $g->rewind();
    echo $g->current() . " ";   // 1
    $g->throw(new Exception("boom"));
    echo "unreachable";
} catch (Exception $e) {
    echo "caught: " . $e->getMessage();
}
// Prints: 1 caught: boom
```

## 生成器主体内部的局部变量与控制流

elephc 中的生成器主体可以包含普通的局部变量、算术运算以及常用的控制流结构。在生成器内部声明的局部变量可以在各个 yield 点之间存活，因为该主体的真实栈帧在协程栈上被就地挂起和恢复。

```php
<?php
function fib(int $count) {
    $a = 0;
    $b = 1;
    $i = 0;
    while ($i < $count) {
        yield $a;
        $c = $a + $b;
        $a = $b;
        $b = $c;
        $i++;
    }
}

foreach (fib(10) as $v) { echo $v . " "; }
// Prints: 0 1 1 2 3 5 8 13 21 34
```

因为主体被编译为普通函数，所以该语言支持的每个控制流结构和运算符在生成器主体内都是可用的——包括 `if`/`else`/`elseif`、`while`、`do-while`、`for`、`foreach`、`switch`、`break`、`continue`、`try`/`catch`/`finally` 以及任意嵌套——并且其语义与生成器外部完全相同。

## 从生成器主体调用用户函数

生成器主体可以调用返回类型为 `int` 的用户函数，最多支持 8 个 `int` 参数：

```php
<?php
function helper(int $x): int { return $x * 2; }

function gen() {
    $i = 1;
    while ($i < 5) {
        yield helper($i) + 10;
        $i++;
    }
}

foreach (gen() as $v) { echo $v . " "; }
// Prints: 12 14 16 18
```

## 用于协程风格流程的 Generator::send

`yield` 也是一个表达式：将其结果赋值给变量允许调用者通过 `Generator::send` 将值泵入（pump）生成器。发送的值将成为进行中的 yield 表达式的结果。

```php
<?php
function echoer() {
    $a = yield 1;     // first yield: $a starts as null until send()
    $b = yield $a;    // yields whatever was sent in
    yield $b;
}

$g = echoer();
$g->rewind();              // runs to first yield → current() = 1
echo $g->current();        // 1
$g->send(100);             // resumes with $a = 100, runs to next yield
echo $g->current();        // 100
$g->send(200);             // resumes with $b = 200
echo $g->current();        // 200
```

如果生成器是通过 `next()` 而不是 `send()` 恢复的，则对于整型（int）的左侧局部变量，进行中的 yield 表达式的评估结果为 `0`。对于 Mixed 类型的左侧局部变量（例如 `$x = yield $prompt;`，其中 `$x` 之前被赋值为字符串或数组），`next()` 会保留该槽位的先前值，而 `send($v)` 会将装箱的 Mixed 指针传输到该槽位中：

```php
<?php
function chat() {
    $x = "init";              // $x is Mixed-typed
    $x = yield "first";        // $x ← whatever was sent (Mixed)
    yield $x;
    $x = yield "second";
    yield $x;
}

$g = chat();
$g->rewind();
echo $g->current() . " ";     // "first"
$g->send("alpha");
echo $g->current() . " ";     // "alpha" — string round-tripped
$g->send("beta");
echo $g->current() . " ";     // "second"
$g->send("gamma");
echo $g->current();           // "gamma"
```

## 对任意 Iterator 和 IteratorAggregate 对象进行 foreach 遍历

`foreach` 接受任何实现了内置 `Iterator` 接口（`current`、`key`、`next`、`valid`、`rewind`）或 `IteratorAggregate` 接口（`getIterator(): Traversable`）的对象。生成器就是这样一种生成者；用户类可以实现这两种协议中的任何一种：

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

foreach (new Range(0, 5) as $i) { echo $i; }
// Prints: 01234
```

循环会调用一次 `rewind()`，然后每次迭代时：调用 `valid()` 测试是否继续，调用 `current()` 和 `key()` 绑定循环变量，并在主体执行完后调用 `next()`。方法分派通过常规的虚函数表（vtable）进行。

当在 `IteratorAggregate` 上使用 `foreach` 时，代码生成（codegen）会在循环前调用一次 `getIterator()`，并使用返回对象的类进行每次迭代的分派：

```php
<?php
class AggregateRange implements IteratorAggregate {
    public function getIterator(): Range { return new Range(0, 3); }
}

foreach (new AggregateRange() as $v) { echo $v; }
// Prints: 012
```

## 生成器主体内部的控制流

生成器主体运行在它自己的协程栈上，并由与普通函数相同的后端进行编译，因此它支持完整的语言特性：任意控制流（`if`/`while`/`for`/`foreach`/`switch`）、包围 `yield` 的 `try`/`catch`/`finally`、方法调用、`return` 值以及任何类型的局部变量——所有这些都会在各个 yield 点之间被保留，因为该主体的真实栈帧是在原地挂起和恢复的。

```php
<?php
function items() {
    foreach (["a" => 1, "b" => 2] as $k => $v) {
        try {
            yield $k => $v;
        } catch (Exception $e) {
            echo "handled: " . $e->getMessage() . " ";
        }
    }
}
```

## 运行时工作原理

`Generator` 是一个重用了 Fiber 运行时的有栈协程（stackful coroutine）：该对象重用了 Fiber 的内存布局（其自身的 mmap 栈，加上异常处理器以及 `transfer`/`pending` 字段）以及一小块生成器特有的字段（`last_key`、`last_value`、`return_value`、`auto_key`）。每个生成器函数 `f` 都会生成三个特定于目标平台的符号：

- `_fn_<f>` —— 位于公共符号的**构造函数**。它分配 Generator 协程对象（`__rt_fiber_construct`），将调用参数和闭包捕获装箱（box）到对象的 `start_args` 插槽中，并返回该对象。函数主体此时尚未运行——它在第一次访问时延迟启动。`start_args` 存储空间最多容纳 **7** 个装箱的值，因此生成器最多可以声明 7 个参数（包括闭包捕获）；声明更多参数的生成器将在编译时被拒绝。
- `_fn_<f>__genbody` —— **主体**，由普通后端编译为返回 Mixed 类型的函数。它的 `return` 值就是 `getReturn()` 呈现的值。
- `_fn_<f>__gencb` —— **协程入口包装器**。Fiber 入口蹦床函数（trampoline）在协程栈上运行它；它将 `start_args` 拆箱（unbox）回主体的参数寄存器中，运行主体，并将主体的返回值停放在 `return_value` 插槽中。

每个 `yield` 都会降级为 `__rt_gen_suspend(key, value)`，它将装箱的键/值记录到生成器的 `last_key`/`last_value` 插槽中，然后挂起协程。因为挂起边界在协程自身的栈**内部**重新引发已调度的异常，所以 `Generator::throw()` 会落在主体内部的 `try`/`catch` 中。`yield from <generator>` 由 `__rt_gen_delegate` 驱动，它将发送的值转发到内层生成器并返回其 `getReturn()`；`yield from <array>` 会被脱糖为重新 yield 每个条目的迭代器循环。

合成的 `Generator` 类没有 PHP 主体——其方法分派在代码生成（codegen）中被拦截，并直接路由到 `__rt_gen_*` 运行时助手（`current`、`key`、`valid`、`next`、`send`、`rewind`、`throw`、`getReturn`），这些助手通过共享的 Fiber 原语驱动协程。
