---
title: "类型"
description: "elephc 支持的数据类型：int、float、string、bool、array、null、mixed、iterable、resource、callable、object、enum，以及扩展类型。"
sidebar:
  order: 1
---

## 数据类型

| 类型 | 支持情况 | 说明 |
| ---------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `int`            | 是              | 64 位有符号整数。字面量：十进制 `42` / `1_000_000`、十六进制 `0xFF` / `0xFF_FF`、传统八进制 `0755` / `0_755`、显式八进制 `0o755` / `0O755`（PHP 8.1+）、二进制 `0b1010` / `0B1010`（PHP 5.4+）。允许在任何进制的数字之间使用数字分隔符 `_`（PHP 7.4+）。 |
| `string`         | 是              | 指针 + 长度对，支持双引号和单引号                                                                        |
| `null`           | 是              | 哨兵值，在运算中隐式转换为 `0`/`""`                                                                      |
| `bool`           | 是              | 作为独立类型的 `true`/`false`。`echo false` 不输出任何内容，`echo true` 输出 `1`。在算术运算中隐式转换为 0/1。    |
| `float`          | 是              | 64 位双精度浮点数。字面量：`3.14`、`.5`、`1.5e3`、`1.0e-5`、`1_000.5`、`1e1_0`。常量：`INF`、`NAN`。       |
| `array`          | 是              | 索引数组（`[1, 2, 3]`）和关联数组（`["key" => "value"]`）。异构的索引和关联数组数据会拓宽为装箱的 `mixed`。数组使用写时复制（copy-on-write）语义。 |
| `mixed`          | 是              | 在类型提示（type hints）和类型化局部变量中支持。运行时值会被装箱并带有一个按值标记的标签，包括异构数组数据和联合类型存储。 |
| `iterable`       | 是              | 用于 `array \| Traversable` 的 PHP 伪类型。支持索引数组、关联数组、`Iterator` 和 `IteratorAggregate`；运行时操作（`foreach`、`echo`、`gettype()`、`var_dump()`、`===`、类型转换、`is_iterable()`）根据需要基于堆分类（heap-kind）、值类型或接口元数据进行分发。 |
| `resource`       | 仅限推导    | 文件句柄和标准流与整数分开建模。`fopen()` 返回 `resource\|false`，并且 `STDIN`、`STDOUT` 和 `STDERR` 是流资源。PHP 不允许将 `resource` 作为类型声明，因此 elephc 不接受 `resource` 注解。 |
| `callable`       | 是              | 闭包、箭头函数、第一类可调用对象（first-class callables）和 FFI 回调参数。                                         |
| `object`         | 是              | 类实例。堆分配、固定布局。`new ClassName(...)`                                                    |
| `enum`           | 是              | 纯枚举（pure enums）和回退枚举（backed enums）。成员（Cases）是单例。回退枚举支持 `->value`、`::from()`、`::tryFrom()`、`::cases()`。   |
| `int\|string`     | 是              | 联合类型 —— 变量接受列出的任何类型。在运行时降级为 Mixed。                                    |
| `?int`           | 是              | 可空简写 —— `int\|null` 的语法糖。显式的 `T\|null` 形式（例如 `A\|null`）也被接受。                |
| `string\|null`    | 是              | 与 `null` 字面量类型的联合。折叠为可空简写 `?string`，因此 `string\|null` 和 `?string` 是完全相同的。 |
| `int\|false`      | 是              | 与 `false` 字面量类型的联合（类似于 PHP 的 `strpos` 风格返回）。`false`/`true` 会拓宽为 `bool`；运行时值是真正的布尔值。 |
| `void`           | 仅限返回      | 可用作函数、方法、闭包、箭头函数或 extern 返回类型。在内部，`null` 被表示为 `Void`。        |
| `never`          | 仅限返回      | 标记一个**永不返回**的函数、方法、闭包或接口方法 —— 它必须始终 `throw`、调用 `exit()`/`die()` 或进行无限循环。在类型检查时会拒绝返回语句。 |
| `ptr` / `ptr<T>` | elephc 扩展 | 原始 64 位指针，可选择携带一个在编译时检查的被指向类型标签。参见 [指针](../beyond-php/pointers.md)。 |
| `buffer<T>`      | elephc 扩展 | 用于 POD 标量、指针或紧凑记录（packed records）的固定大小连续存储空间。参见 [Buffers](../beyond-php/buffers.md)。   |
| `packed class`   | elephc 扩展 | 具有编译时字段偏移量的扁平 POD 记录类型。参见 [packed class / 紧凑类](../beyond-php/packed-classes.md)。           |

整型数值字面量只有在适合 PHP 有符号 64 位范围时才会保持 `int` 类型。更大的十进制、十六进制、八进制或二进制字面量会被提升（promoted）为 `float`，这与 64 位构建上的 PHP 行为一致。

### 联合类型中的字面量伪类型

PHP 允许将 `null`、`false` 和 `true` 作为类型成员。elephc 在参数、返回值和属性位置接受它们，并且像其他内置类型名称一样不区分大小写地进行匹配。

```php
<?php
function find(string $haystack, string $needle): int|false {
    return strpos($haystack, $needle); // a real int, or the literal false
}

function label(?string $name): string|null {
    return $name === '' ? null : $name;
}

class Setting {
    public string|null $value = null;
}
```

规则：

- `T|null` 完全等同于可空简写 `?T` —— 两者编译为相同的类型，因此 `string|null` 和 `?string` 可以互换。
- `false` 和 `true` 会拓宽为 `bool`。elephc 不跟踪字面量布尔（literal-bool）的精确度，因此在接受 `int|bool` 的地方都接受 `int|false`；在运行时，存储的值仍然是真正的布尔值。
- 多成员联合类型可以混合 these 与其他成员（`int|string|null`）；其中的 `null` 成员使整个联合类型可空。
- 可空简写仍然不能与管道联合（pipe union）组合：应写作 `T|null`，而不是 `?T|U`。

### 交叉类型

交叉类型 `A&B`（PHP 8.1）声明了一个满足每个列出的类/接口的值。elephc 在参数和返回值位置接受该语法：

```php
<?php
function render(Renderable&Cacheable $widget): string {
    return $widget->render();
}
```

只有当 `&` 后面紧跟另一个类型时，它才会被识别为交叉类型；变量前的 `&`（例如 `int &$x`）仍然是引用传递（by-reference）标记。可空简写不能与交叉类型组合：`?A&B` 会被拒绝，这与 PHP 一致。

当前的限制：该值的类型被确定为其列出的**第一个**成员，因此成员访问会针对该成员进行解析（如上文中的 `$widget->render()`，解析自 `Renderable`）。仅在后面的成员上声明的方法尚未解析，并且参数兼容性也是根据第一个成员进行检查的。目前已计划支持完整的结构化交叉类型解析。

内部的 `PhpType` 模型还包括 `TaggedScalar`，它不是 PHP 语法，不能写在源码中。代码生成（codegen）仅将其用于 `int|null` 值的默认标记 null 表示，存储内联的 `{payload, tag}` 对，而不是堆装箱的（heap-boxed）`mixed` 单元（cell）。

### Never

`never` 标记一个**绝不能正常返回**的函数、方法、闭包或接口方法。该函数体预期要么 `throw`，要么调用 `exit()`/`die()`，或者进行无限循环。

```php
<?php
function panic(string $msg): never {
    throw new RuntimeException($msg);
}

class Failer {
    public function fail(): never {
        throw new \Exception("boom");
    }

    public static function bail(int $code): never {
        exit($code);
    }
}

interface Aborts {
    public function abort(): never;
}
```

规则：

- 有效作为函数、闭包、实例方法、静态方法和接口方法的返回类型
- 像 PHP 的内置类型名称一样不区分大小写地进行匹配（`never`、`Never` 和 `NEVER` 是等价的）
- 必须用作独立的返回类型；`?never`、`never|null` 和 `int|never` 会被拒绝
- 不能有效作为参数、属性或类型化局部变量
- 声明 `: never` 然后编写 `return $value;`（甚至仅仅是 `return;`）在类型检查时会被拒绝
- `: never` 是类型系统中的**底层类型（bottom type）**：它是所有其他类型的子类型，因此子类方法可以用 `: never` 覆盖返回 `void`/`int` 等类型的父类方法
- 反之则会被拒绝：声明为 `: never` 的父类或接口方法要求子类/实现声明兼容的返回类型
- 如果执行流穿过了 `: never` 函数或方法体（fall through），elephc 会触发运行时致命错误（runtime fatal error），而不是返回给调用者

### 类型化局部变量声明

```php
<?php
int|string $value = 1;
?int $maybe = null;
```

规则：

- 类型化局部变量声明中支持联合类型，例如 `int|string`
- 支持可空简写 `?T` 作为 `T|null` 的语法糖
- 在运行时，这些值会降级（lowered）为编译器装箱的标记表示（boxed tagged representation）
- 不接受 `?T|U`；请显式写入 `T|U|null`
- 方法调用和属性访问可以在对象联合类型上工作 —— 包括单个对象类加上标量（`A|false`、`A|null`）以及两个或多个不同对象类的联合类型（`A|B`、`A|B|false`）。该方法/属性必须存在于**每个**对象成员上；代码生成根据运行时类 ID（class id）进行分发，非对象运行时值会像 PHP 一样报错

### 属性类型声明

```php
<?php
class User {
    public int $id;
    public string $name = "Ada";
    public ?string $email = null;
    public static int $count = 0;
}
```

规则：

- 实例属性和静态属性可以使用声明的属性类型
- 属性默认值和赋值必须与声明的类型兼容
- 通过未类型化参数进行的构造函数赋值，将在调用点（call sites）细化参数类型后进行检查
- 可空和联合属性存储使用与类型化局部变量相同的 `mixed` 运行时形状（runtime shape）进行装箱；标量字面量默认值（`int|string $v = 1`、`float|int $v = 1.5`、`bool|int $v = true`）会被装箱到该形状中
- 跨继承的静态属性重声明遵循 PHP 风格的规则：非私有继承属性保持不变的声明类型，不能降低可见性，也不能覆盖 `final` 属性
- 私有继承的静态属性可以重声明为独立的子类槽（slots）
- 未类型化的继承静态属性不能重声明为有类型的，有类型的继承静态属性也不能重声明为无类型的
- 对静态数组属性进行直接元素写入（例如 `ClassName::$items[] = $value` 或 `ClassName::$items[0] = $value`）要求该属性必须是 `array`
- `void` 和 `callable` 不是有效的属性类型

### Null 行为

```php
<?php
$x = null;
echo $x;              // prints nothing
echo is_null($x);     // prints 1
echo $x + 5;          // prints 5 (null → 0)
echo $x . "hello";    // prints "hello" (null → "")
$x = 42;              // reassignment from null works
```

### 类型转换

```php
$i = (int)3.7;       // 3
$f = (float)42;      // 42.0
$s = (string)42;     // "42"
$b = (bool)0;        // false
$a = (array)42;      // [42]
```

转换名称和别名不区分大小写，与 PHP 一致。例如，`(INT)`、`(Integer)` 和 `(integer)` 是等价的。

别名：`(integer)`、`(double)`、`(real)`、`(boolean)`。

### 类型函数

| 函数 | 签名 | 说明 |
| --- | --- | --- |
| `is_null()` | `is_null($val): bool` | 如果为 null 则返回 true |
| `is_float()` | `is_float($val): bool` | 如果为 float 则返回 true |
| `is_int()` | `is_int($val): bool` | 如果为整型则返回 true |
| `is_string()` | `is_string($val): bool` | 如果为 string 则返回 true |
| `is_numeric()` | `is_numeric($val): bool` | 如果为 int 或 float 则返回 true |
| `is_bool()` | `is_bool($val): bool` | 如果为 bool 则返回 true |
| `is_array()` | `is_array($val): bool` | 如果为索引数组或关联数组则返回 true |
| `is_object()` | `is_object($val): bool` | 如果值为对象则返回 true |
| `is_scalar()` | `is_scalar($val): bool` | 如果是 int、float、string 或 bool 则返回 true（不包括 null、array、object 或 resource） |
| `is_iterable()` | `is_iterable($val): bool` | 如果为数组或兼容 Traversable 的可迭代对象则返回 true |
| `is_callable()` | `is_callable($val): bool` | 如果是闭包、第一类可调用对象、不区分大小写地命名已知内置函数的字符串、用户函数或公共静态方法（`"Class::method"`）、带有公共方法的 `[$obj, "method"]` 数组、`[ClassName::class, "method"]` 静态方法数组，以及具有公共 `__invoke()` 的对象，则返回 true。 |
| `is_resource()` | `is_resource($val): bool` | 如果值是打开的资源句柄则返回 true |
| `is_nan()` | `is_nan($val): bool` | 如果为 NAN 则返回 true |
| `is_finite()` | `is_finite($val): bool` | 如果不是 INF/NAN 则返回 true |
| `is_infinite()` | `is_infinite($val): bool` | 如果为 INF 或 -INF 则返回 true |
| `boolval()` | `boolval($val): bool` | 转换为 bool |
| `floatval()` | `floatval($val): float` | 转换为 float |
| `intval()` | `intval($val): int` | 转换为整型 |
| `gettype()` | `gettype($val): string` | 返回类型名称 |
| `empty()` | `empty($val): bool` | 如果值为假值（falsy）则返回 true |
| `unset()` | `unset($var, ...$vars): void` | 将一个或多个变量设为 null |
| `settype()` | `settype($var, $type): bool` | 就地更改变量类型 |

### 类型细化

在由变量上的类型断言（type predicate）保护的 `if`（或 `if`/`elseif`*/`else` 链）内部，该变量在匹配的分支中会被细化为所测试的类型，因此无需显式类型转换即可作为该类型使用。`is_int()`、`is_float()`、`is_string()` 和 `is_bool()`（及其别名）会将类型细化为匹配的标量，而 `$x instanceof SomeClass` 会将其细化为该类 —— 包括调用其方法。每个后续的 `elseif` 以及 `else` 分支都会看到所有先前保护条件（guards）的补集。当链条通过发散（divergence）达到完备（exhaustive）时 —— 即没有 `else` 分支且每个子句体总是发散（`return`、`throw`、`exit()`/`die()` 或调用 `: never` 函数） —— 整个结构*之后*的语句也会看到补集，因为到达它们意味着每个保护条件都为假。前导的 `!` 会翻转 then/else 分支。

```php
function describe($x): string {        // $x may be int or a Point across call sites
    if (is_int($x)) {
        return "int " . ($x + 1);      // $x is int here
    }
    return "point " . $x->label();     // $x is the object here
}
```

在分支内部对变量进行重新赋值时，不会跟踪细化。

类型细化适用于函数和方法参数。如果参数在不同的调用点传递了不兼容的类型（例如在某一处为 `int`，在另一处为类实例），该参数会被推断为联合类型，并且保护条件会在每个分支内部细化它。目前这**还不**支持闭包参数：使用不兼容参数类型调用的闭包会在编译时被拒绝，而不是推断为联合类型。

### 与 PHP 的已知不兼容性

- `$argv[0]` 返回编译后的二进制文件路径，而不是 `.php` 文件路径。
- 整数 `+`、`-` 和 `*` 溢出仅对**常量折叠（constant-folded）**的算术运算（编译时常量操作数）会提升为 `float`，这与 PHP 一致。在**运行时**，`int op int` 具有静态类型 `int`，因此溢出的操作**不会**提升为 `float`：结果会被限制在 64 位整数边界内，并且 `is_float()` 保持为 `false`，而 PHP 会返回 `float`。在运行时提升将需要对每个算术结果进行装箱，而 elephc 的非装箱标量表示（unboxed scalar representation）避免了这一点。出于同样的原因，对 64 位边界附近的整型值字符串进行 `intval()`/`(int)` 转换（例如 `intval("9223372036854775807")`）是有损的。
- 将数组转换为字符串（通过 `.` 拼接、`echo` 或字符串插值）会产生字面量 `"Array"`，与 PHP 的值一致，但 elephc 不会触发 PHP 的 `E_WARNING` "Array to string conversion" 警告。
- 标量宽松比较（`==`、`!=`）对于常量折叠字面量和非折叠运行时标量操作数，遵循 PHP 风格的布尔真值、null 对空字符串、数字字符串、非数字字符串字节比较以及数字 `int` 对 `float` 的规则。一个已知的缺陷（gap）：当**未类型化（`mixed`）的操作数在运行时持有 `float`** —— 例如对未类型化的 `$x = 1.5` 进行 `switch ($x)`，或 `$x == 1` 时 —— 值在比较前会被截断为 `int`，因此 `1.5` 会被错误地判定为等于 `1`。静态类型的 `float` 操作数可以正确比较；只有持有未类型化浮点数的值受到影响。
- `??=` 会针对变量、对象属性、静态属性和非追加数组元素的类型化赋值存储进行检查。对于具体的局部变量类型，备用（fallback）值必须保持相同的类型或为字面量 `null`。
- 普通数组的数值类型转换（`(int)$array`、`(float)$array`）遵循 elephc 现有的数组转换语义（返回元素计数，而不是 PHP 的 `0`/`1`）。直接的 `iterable` 数值类型转换使用 PHP 的空/非空 `0`/`1` 语义。
- `__destruct` 在对象的引用计数达到零时运行（作用域退出、重新赋值、`unset`、程序结束），这与 PHP 的时机一致，但**不支持对象复活**：重新存储 `$this` 以使对象在析构函数之后存活并不能保持其处于活动状态 —— 一旦 `__destruct` 返回，对象仍会被释放。
- 在遗留的 `--null-repr=sentinel` 选择性停用项下，整数 `9223372036854775806`（`PHP_INT_MAX - 1`）会与 elephc 在非装箱标量槽中的内部 null 标记冲突，并被 `echo`、`var_dump()`、`is_null()`、`??` 和相关的 null 检查误读为 `null`。默认的标记 null 表示没有此冲突：整个 64 位整数范围都可以完美往返。
- 不支持可变变量（`$$name`、`${$expr}`）。elephc 将每个局部变量分配到编译时固定的栈槽，并且不保留每帧的变量名表，因此无法解析在运行时计算其名称的变量。请改用以动态名称为键的数组。
- `serialize()`/`unserialize()` 实现了与 PHP 逐字节兼容的标量、数组和对象（包括 `__serialize`/`__unserialize`/`__sleep`/`__wakeup` 魔术方法和 `r:`/`R:` 对象回溯引用）序列化。剩余的差距：对象自身属性内部的循环引用在反序列化 `unserialize()` 时会解析为 `null`（序列化可以处理循环），不支持已弃用的 `Serializable` 接口（`C:` 线上传输格式），写入保存在 `Mixed` 中的反序列化对象的属性无法持久化（这是另一个独立的 `Mixed` 属性写入限制），并且 `unserialize()` 在输入格式错误时不会触发 PHP 的 `E_WARNING` / `E_NOTICE` 警告 —— 它只是返回 `false`。

### 未实现的 filesystem 函数

这些标准的 PHP 文件系统（filesystem）函数被特意从 elephc 中移除，因为它们在编译后的原生二进制文件（native binary）中没有实际的语义：

- `move_uploaded_file()`、`is_uploaded_file()` —— 两者都依赖于 PHP-FPM/SAPI 请求生命周期（`$_FILES` 超全局变量和按请求的“已上传文件”注册表）。独立的编译后二进制文件没有这样的请求范围。
- `fgetss()` —— 在 PHP 7.3 中被弃用，并在 PHP 8.0 中被移除。新代码应在 `fgets()` 的结果上使用 `strip_tags()`。

### 编译器诊断

elephc 会报告带有源码范围（source spans）的错误。示例：

```text
error[3:5]: Undefined variable: $name
error[8:1]: Function 'foo' declared return type string but returns int
```

编译器还会发出非致命警告（未使用的变量、无法到达的代码）。

### 运行时诊断

运行时警告通过可被抑制的诊断通道流动。`@` 运算符仅隐藏其操作数的这些警告，而致命的运行时错误和编译时诊断仍然可见。目前可抑制的警告包括 `fopen()` / `file_get_contents()` 打开失败以及重复的 `define()` 调用。
