---
title: "函数"
description: "函数声明、闭包、箭头函数、可变参数等。"
sidebar:
  order: 4
---

## 声明和调用

```php
<?php
function add($a, $b) {
    return $a + $b;
}
echo add(3, 4); // 7
```

与 PHP 类似，函数查找是不区分大小写的。声明保留其原始名称，但诸如 `ADD(3, 4)`、`Add(3, 4)` 和 `add(3, 4)` 的调用都会解析到同一个函数。内置函数名称也遵循相同的规则。

## 参数和返回类型提示

```php
<?php
function repeat(string $label, int $count): string {
    return $label . $count;
}
```

- 支持的类型：`int`、`float`、`bool`、`string`、`array`、`mixed`、`iterable`、`callable`、`ptr`、`buffer<T>`、类/接口/枚举名称、联合类型以及可空形式
- `void` 仅作为返回类型时有效
- `never` 仅作为返回类型时有效，且必须不能正常返回
- 类型化参数可以使用默认值
- 函数、方法、构造函数、闭包和箭头函数的参数提示都会被检查
- 函数、方法、闭包和箭头函数的返回类型提示都会被检查
- 可变参数可以带有类型提示（如 `function f(int ...$xs)`），包括在方法、闭包和箭头函数上；收集到可变参数中的每个参数都会根据声明的元素类型进行检查，就像普通的类型化参数一样。未类型化的可变参数接受异构参数。
- 声明为非 `void` 的返回类型必须在每个可达路径上返回一个值；`throw`、`exit()`/`die()` 以及无限循环被视为不返回的路径
- 仅带有 `return;` 的语句仅对 `void` 返回有效；对于可空返回类型，请使用 `return null;`
- 对于已知签名的调用支持命名参数：用户自定义函数、方法、闭包、内置函数和 extern 函数
- 其具体目标仅通过运行时描述符可知的可调用变量和 `callable` 参数，也可以使用命名参数、展开后的命名调用，以及索引展开前的定位前缀；描述符元数据在调用时应用参数名称、默认值、可变参数 and 引用传递标志
- 参数表达式按 PHP 源码顺序进行求值，然后代码生成将结果值规范化为 ABI 参数顺序
- 命名参数可以跟在展开参数后面，例如 `foo(...$args, suffix: "!")`；定位参数既不能跟在命名参数后面，也不能跟在展开参数后面
- 关联数组解包将字符串键映射到命名参数（如 `foo(...["name" => "Ada"])`）并保持数字键为定位参数。可变的关联数组展开可以通过字符串键满足任何参数，包括显式命名参数之后的参数。在参数规划之前，重复的静态字符串键采用 PHP 的“最后一次写入生效（last-wins）”行为。
- 展开到可变函数的定位参数会先填充普通参数；只有多余的展开元素才会被收集到可变参数中。如果展开长度太短无法填满必填参数，调用将失败，而不是读取超出数组有效负载的内容。
- 用户自定义的可变函数会使用字符串键将未知的命名参数收集到可变参数中
- 内置的可变函数会拒绝未知的命名参数，这与 PHP 的内部函数行为一致

## 递归

```php
<?php
function factorial($n) {
    if ($n <= 1) { return 1; }
    return $n * factorial($n - 1);
}
echo factorial(10); // 3628800
```

## 默认参数值

```php
<?php
function greet($name = "world") {
    echo "Hello " . $name . "\n";
}
greet();        // Hello world
greet("PHP");   // Hello PHP
```

带有默认值的参数必须放在必填参数之后。

## 局部作用域

函数内部的变量与调用者是相互独立的。

## 匿名函数（闭包）

```php
<?php
$double = function(int $x): int {
    return $x * 2;
};
echo $double(5); // 10
```

闭包可以使用 `use` 进行捕获：

```php
<?php
$factor = 3;
$multiply = function(int $x) use ($factor): int {
    return $x * $factor;
};
echo $multiply(5); // 15
```

当闭包必须共享并修改外部变量时（包括递归匿名函数），在捕获列表中使用 `&`：

```php
<?php
$factorial = null;
$factorial = function($n) use (&$factorial) {
    return $n <= 1 ? 1 : $n * $factorial($n - 1);
};
echo $factorial(5); // 120
```

被捕获的闭包也可以作为回调值使用：

```php
<?php
$factor = 3;
$values = array_map(function(int $x) use ($factor): int {
    return $x * $factor;
}, [1, 2, 3]);
echo $values[2]; // 9
```

类型为 `mixed` 的闭包参数（或未指定类型，即默认为 `mixed`）接受任何值，而其主体为 `return $param;` 的闭包则推断为 `mixed` 返回类型。这使得 `array_map()` 和其他回调内置函数可以在元素具有不同类型的异构数组上运行：

```php
<?php
$mixed = [1, "two", 3.5, true];
$same = array_map(function(mixed $x) { return $x; }, $mixed);
echo $same[1];                 // two — the string element is preserved, not coerced
$types = array_map(fn($x) => gettype($x), $mixed);
echo $types[0] . " " . $types[2]; // integer double
```

## 在闭包中绑定 `$this`

在实例方法内部定义的非静态闭包或箭头函数会自动绑定 `$this`——不需要 `use ($this)`（并且与 PHP 中一样，不允许使用 `use ($this)`）。闭包能够看到活跃的对象，因此通过 `$this` 进行的读取、写入和方法调用都有效且持久保留在实例上：

```php
<?php
class Counter {
    private int $count = 0;

    public function incrementer(): callable {
        return function (): int {
            $this->count += 1;       // mutates the live object
            return $this->count;
        };
    }

    public function labelled(string $suffix): callable {
        return fn (): string => $this->count . $suffix;  // arrow binds $this too
    }
}

$c = new Counter();
$next = $c->incrementer();
echo $next(), $next();           // 12
echo ($c->labelled("!"))();      // 2!
```

`$this` 也会流入嵌套闭包中：在外部闭包内定义的内部闭包会从外围作用域传递性地捕获 `$this`。

### 使用 `Closure::bind` / `bindTo` 重新绑定 `$this`

闭包绑定的 `$this` 可以替换为另一个对象，从而生成一个新的闭包。支持实例方法 `$closure->bindTo($newThis)` 和静态方法 `Closure::bind($closure, $newThis)`；原始闭包保持不变：

```php
<?php
class Box {
    public int $value;
    public function __construct(int $value) { $this->value = $value; }
    public function reader(): callable {
        return function (): int { return $this->value; };
    }
}

$a = new Box(7);
$b = new Box(99);
$read = $a->reader();
echo $read();              // 7

$rebound = $read->bindTo($b);
echo $rebound();           // 99  (rebound to $b)

$static = Closure::bind($read, $b);
echo $static();            // 99  (static spelling)

echo $read();              // 7   (original is unchanged)
```

接受可选的第三个参数 `$scope` 以保持源码兼容性，但该参数会被忽略（成员可见性在编译时解析）。

`$closure->call($newThis, ...$args)` 在单一步骤中绑定 `$this` 并调用闭包，返回其结果：

```php
<?php
$add = $a->reader();              // reusing Box from above (returns $this->value)
echo $add->call($b);              // 99 — bound to $b for this one call
```

在任何类外部定义的闭包也可能引用 `$this` 并在以后进行绑定——这是典型的“作用域窃取”访问器：

```php
<?php
class Account {
    private int $balance = 250;
}

$peek = function() { return $this->balance; };
$read = Closure::bind($peek, new Account(), Account::class);
echo $read();   // 250 — bound access reaches the private property
```

重新绑定支持仅捕获 `$this` 而没有其他捕获的闭包（典型的访问器闭包，无论是在方法内部创建还是独立创建）。绑定一个还具有 `use(...)` 捕获的闭包会终止并抛出致命错误，而不是产生一个错误绑定的闭包。

## 静态闭包

带有 `static` 前缀的闭包不会从其外围作用域捕获 `$this`。这与 PHP 的 `static function () {}` 和 `static fn () => ...` 一致——当闭包打算不进行绑定时非常有用（通常与 `Closure::bind(..., null, ...)` 搭配使用）：

```php
<?php
$add = static function ($a, $b) {
    return $a + $b;
};
echo $add(3, 4);                     // 7

$double = static fn ($x) => $x * 2;
echo $double(5);                     // 10
```

在静态闭包内部，引用 `$this` 会导致编译时错误：

```php
<?php
class C {
    public int $count = 5;
    public function bad() {
        // Error: Cannot use $this inside a static closure
        return static function () { return $this->count; };
    }
}
```

## 箭头函数

```php
<?php
$double = fn(int $x): int => $x * 2;
echo $double(5); // 10

$nums = [1, 2, 3, 4];
$squared = array_map(fn(int $n): int => $n * $n, $nums);
```

## 一等可调用语法

```php
<?php
$triple = triple(...);
$double = MathBox::double(...);
```

支持：用户自定义函数名、extern 函数名、`ClassName::method(...)`、`self::method(...)`、`parent::method(...)` 以及注册的内置包装器。内置包装器覆盖范围包括常见的字符串转换和搜索（`strlen(...)`、`trim(...)`、`substr(...)`、`str_contains(...)`）、类型转换和类型检查（`intval(...)`、`floatval(...)`、`gettype(...)`、`is_int(...)`）、数学辅助函数（`abs(...)`、`sqrt(...)`、`round(...)`）、JSON 辅助函数，以及包括 `count(...)`、`array_sum(...)`、`array_product(...)` 在内的数组辅助函数，以及引用传递的修改器如 `sort(...)`。还支持：类方法内部的 `static::method(...)`，为直接的可调用对象调用保留后期静态绑定，以及使用局部接收者变量或非局部接收者表达式（例如 `(new Greeter("Hi "))->greet(...)`）的 `$obj->method(...)` / `$this->method(...)`。

```php
<?php
class Greeter {
    public function hello($name) {
        return "Hello " . $name;
    }
}

$greeter = new Greeter();
$hello = $greeter->hello(...);
echo $hello("Ada"); // Hello Ada
```

捕获的一等可调用目标（`static::method(...)` 和 `$obj->method(...)`）可以通过局部可调用变量直接调用，或者作为即时可调用表达式（如 `($obj->method(...))("Ada")`）进行调用。在运行时选择捕获的可调用描述符的分支形式的即时调用以及等价的 `call_user_func()` / `call_user_func_array()` 调用——例如 `($ok ? $a->method(...) : $b->method(...))($value)`、`($ok ? $a->method(...) : $b->method(...))(...$args, suffix: "!")`、`call_user_func($ok ? $a->method(...) : $b->method(...), $value)` 或 `call_user_func_array($ok ? $a->method(...) : $b->method(...), [$value])`——会通过描述符调用器（descriptor invokers）路由，以处理定位参数、命名参数、展开前缀、默认值和可变参数。方法一等可调用变量也通过存储的描述符环境进行调用，因此即使 `$fn = $obj->method(...); $obj = $other; $fn()`，它仍然使用在创建 `$fn` 时捕获的接收者，同时描述符元数据会应用参数名、默认值、可变参数和引用传递标志。在运行时较早选择其描述符的可调用变量或数组元素，也会通过描述符元数据进行调用，包括仅能从存储的描述符中获知的引用传递参数决策。没有局部签名元数据的 `callable` 参数在索引展开之前也遵循相同的命名参数和定位前缀的描述符路径，包括运行时引用传递参数的源变量修改。直接捕获的可调用值也可以传递给转发捕获的可调用环境的回调路径，包括 `array_map()`、`array_filter()`、`array_reduce()`、`array_walk()`、`usort()`、`uksort()`、`uasort()`、`preg_replace_callback()`、`call_user_func()` 和 `call_user_func_array()`。当捕获的可调用对象存储在局部变量中或通过 `callable` 参数接收时，这些回调运行时会保留描述符本身，而不是从当前的源局部变量中重建捕获。对于 `array_map()`、`array_filter()`、`array_reduce()`、`array_walk()`、`usort()`、`uksort()`、`uasort()`、`preg_replace_callback()`、`iterator_apply()`、`CallbackFilterIterator` 和 `RecursiveCallbackFilterIterator`，支持捕获的可调用描述符的分支形式运行时选择。可调用描述符携带着签名默认值、引用传递标志、可变参数元数据、接收者/捕获环境，以及针对函数、内置函数、extern、闭包、一等可调用、静态方法、实例方法、可调用数组和可调用对象形式的调用形态。对于引用传递的回调参数，即使可见的回调签名仅通过运行时描述符可知，`call_user_func()` 也会保留源变量修改。`call_user_func_array()` 从字面量参数数组（如 `call_user_func_array($cb, [$value])`）中传递原始变量槽；动态参数数组通过临时引用单元接受，因此回调写入不会修改源数组或源变量。PHP 不允许使用空安全一等可调用语法（`$obj?->method(...)`），elephc 也会报告相同的错误。

`call_user_func()` 和 `call_user_func_array()` 也接受 PHP 可调用数组（`[$object, "method"]`、`[ClassName::class, "method"]`） and 可调用对象。动态字符串回调分发会解析用户函数、声明的 extern 函数、受支持的内置包装器（例如 `STRLEN`）以及公共静态方法字符串（例如 `"Formatter::wrap"`）；匹配的描述符所生成的调用器会接收到一个装箱的参数容器，根据其持有的是索引数组还是关联哈希进行分支处理，应用解析出的描述符签名，并返回一个装箱的 `mixed`。字符串变量也可以作为 PHP 变量函数被直接调用，例如 `$callback = "STRLEN"; echo $callback("hello");`，它们会使用相同的描述符调用器路径来处理命名参数、默认值、可变参数和引用传递参数元数据。可调用数组变量和字面量也可以被直接调用，例如 `$callback = [$object, "wrap"]; echo $callback(value: "ok");` 或 `([$object, "wrap"])(value: "ok")`，并且直接的实例方法可调用数组在调用描述符之前会读取存储在可调用数组中的接收者。具有公共 `__invoke()` 的对象也可以通过描述符元数据直接调用，因此 `$runner(suffix: "?")` 和 `(new Runner())(suffix: "?")` 会通过相同的调用器路径应用默认值、命名参数、可变参数和引用传递标志。直接的可调用数组变量和字面量可以在运行时从字符串解析方法或静态接收者，因此 `$method = "wrap"; $callback = [$object, $method]; $callback(...)`、`([$object, $method])(...)`、`$callback = [$class, $method]; ($callback)(...)` 和 `([$class, $method])(...)` 会在调用点选择匹配的公共方法描述符。公共静态方法可调用数组为直接变量调用、字面量调用、`call_user_func()` 和 `call_user_func_array()` 使用相同的描述符调用器路径，包括关联参数容器和索引展开前的定位前缀。公共实例方法可调用数组和可调用对象为直接的 `call_user_func()` 调用使用描述符调用器，包括诸如 `call_user_func([$object, "method"], ...$args)` 的单次展开转发，以及定位前缀后跟索引展开的调用，例如 `call_user_func([$object, "method"], "head", ...$args)`。对于带有字面量索引、字面量关联、动态索引、动态关联或运行时不透明的 `mixed`/联合类型参数容器的 `call_user_func_array()` 调用，它们使用相同的描述符路径。与接收者绑定的运行时不透明容器在运行时被解包，根据索引数组与关联哈希标签进行分发，并在调用描述符适配器之前将接收者作为描述符槽 0 前置。对于 `call_user_func_array()`，描述符调用器在克隆的 Mixed 参数容器上操作，因此调用者的 `$args` 数组在调用后保持其原始布局。

## 全局变量

```php
<?php
$x = 10;
function test() {
    global $x;
    echo $x;    // 10
}
```

## 静态变量

```php
<?php
function counter() {
    static $n = 0;
    $n++;
    echo $n . "\n";
}
counter(); // 1
counter(); // 2
```

## 引用传递

```php
<?php
function increment(&$val) {
    $val++;
}
$x = 5;
increment($x);
echo $x; // 6

$a = 1;
$b =& $a;
$b = 2;
echo $a; // 2
```

## 对象属性的引用

局部变量可以作为对象属性的别名。通过别名写入会更新属性，而写入属性也会更新别名——这两个名称共享同一个存储单元：

```php
<?php
class Counter {
    public int $value = 0;
}

$counter = new Counter();
$ref = &$counter->value;
$ref = 10;
echo $counter->value; // 10
$counter->value = 42;
echo $ref;            // 42
```

这也适用于数组属性，因此别名可以原位修改：

```php
<?php
class Bag { public array $items = []; }
$bag = new Bag();
$items = &$bag->items;
$items[] = "apple";
echo implode(", ", $bag->items); // apple
```

别名适用于任何声明的属性类型，包括 `string` 和 `float`。将数组别名重新赋值为不同类型的字面量时，属性仍保持可读，因为新元素会被转换以匹配属性的元素类型：

```php
<?php
class Bag { public array $items = []; }
$bag = new Bag();
$items = &$bag->items;
$items = [1, 2, 3];                  // typed literal, boxed to match the property
echo implode(", ", $bag->items);     // 1, 2, 3
```

## 引用返回

声明时在名称前带有 `&` 的函数或方法会返回对所返回左值的引用，而不是副本。调用者使用 `$x = &f()` 捕获它；然后写入 `$x` 会直接写入原始存储：

```php
<?php
class Registry {
    public array $entries = [];
    public function &all() {
        return $this->entries;
    }
}

$registry = new Registry();
$entries = &$registry->all();
$entries[] = "first";
echo implode(", ", $registry->entries); // first

function &slot(Counter $c) {
    return $c->value;
}
```

闭包和箭头函数也可以通过引用返回，包括当使用 `Closure::bind` 绑定到对象时。绑定的闭包可以立即调用，或者存储在变量中以后调用：

```php
<?php
class Container { public array $services = []; }
$container = new Container();

// Immediate invocation.
$services = &Closure::bind(fn &() => $this->services, $container, $container)();
$services[] = "logger";          // reaches $container->services
$services = [];                  // clears $container->services through the reference

// Stored and called later.
$accessor = Closure::bind(fn &() => $this->services, $container, $container);
$ref = &$accessor();
$ref[] = "router";               // also reaches $container->services
```

支持针对任何标量或容器类型（数组、对象、整数、字符串和浮点数）的对象属性目标的引用返回。返回对普通局部变量的引用是没有意义的（局部变量的生命周期不会超过调用本身），因此不支持。

## 可变参数函数

```php
<?php
function sum(...$nums) {
    $total = 0;
    foreach ($nums as $n) {
        $total += $n;
    }
    return $total;
}
echo sum(1, 2, 3); // 6
```

可变参数可以出现在函数、方法、闭包和箭头函数上，并且可以带有类型提示：

```php
<?php
function join_with(string $sep, string ...$parts): string {
    return implode($sep, $parts);
}
echo join_with("-", "a", "b", "c"); // a-b-c
```

可变参数上的类型提示会约束其元素：`function sum(int ...$nums)` 会将整数收集到 `$nums` 中，并且传递给可变参数的每个参数都会根据声明的元素类型进行检查，因此传递错误类型的参数会被拒绝。未类型化的可变参数（`...$nums`）接受异构参数。

## 展开运算符

```php
<?php
$args = [10, 20, 30];
echo sum(...$args); // 60

$a = [1, 2];
$b = [3, 4];
$c = [...$a, ...$b]; // [1, 2, 3, 4]
```

调用解包遵循 PHP 的参数映射。展开的值在构建任何可变参数 tail 之前，先填充普通的定位参数；关联数组展开将字符串键视为命名参数：

```php
<?php
function show($a, $b = 99, ...$rest) {
    echo $a . ":" . $b . ":" . count($rest);
}

show(...[10]);                    // 10:99:0
show(...[10, 20, 30]);            // 10:20:1
show(...[10, "b" => 20]);         // 10:20:0

$args = ["b" => 20, "a" => 10];
show(...$args);                   // 10:20:0

$args = ["b" => 20];
show(...$args, a: 10);            // 10:20:0
```

## echo

`echo` 是 PHP 语言结构语句。它使用 PHP 标量输出规则将每个操作数写入标准输出，并接受 PHP 兼容的逗号分隔操作数：

```php
<?php
echo "Hello", ", ", "World!\n";
```

## print

`print` 是 PHP 语言结构表达式。它使用与 `echo` 相同的标量输出规则将其操作数写入标准输出，然后返回 `1`。

```php
<?php
$ok = print "ready\n";
echo $ok;             // 1

echo print "nested";  // prints "nested1"
```

与 PHP 一样，`print` 也可以作为语句独立存在：

```php
<?php
print "hello\n";
```
