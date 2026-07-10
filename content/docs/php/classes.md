---
title: "类"
description: "类、接口、抽象类、Trait、枚举、属性和继承。"
sidebar:
  order: 9
---

## 类声明
```php
<?php
class Point {
    public $x;
    public $y;

    public function __construct($x, $y) {
        $this->x = $x;
        $this->y = $y;
    }

    public function magnitude() {
        return sqrt($this->x * $this->x + $this->y * $this->y);
    }

    public static function origin() {
        return new Point(0, 0);
    }
}
```

类、接口、Trait 和方法的查找与 PHP 一样是不区分大小写的：
`new point()`、`POINT::origin()` 和 `$p->MAGNITUDE()` 会解析为 `Point` 及其声明的方法。对象属性仍然区分大小写，因此 `$p->x` 和 `$p->X` 是不同的属性名。

## 接口
```php
<?php
interface Named {
    public function name();
}

class Product implements Named {
    public function name() { return "widget"; }
    public function label() { return strtoupper($this->name()); }
}
```
- 仅限签名方法和 PHP 8.4 属性钩子契约；接口中不允许出现方法和钩子体
- 通过循环检测，传递性地平坦化接口继承

接口属性必须是钩子契约。具体类可以通过公共可读属性满足 `{ get; }` 契约，通过公共可写属性满足 `{ set; }` 契约，或者通过不变的公共属性同时满足这两者。仅 get 契约允许协变具体类型；仅 set 契约允许逆变具体类型。

```php
<?php
interface HasName {
    public string $name { get; set; }
}

class Product implements HasName {
    public string $name = "widget";
}
```

### 内置接口

编译器会注入以下接口，用户端无需任何 `implements` 声明即可使用：

| 接口 | 方法 |
|---|---|
| `Traversable` | (marker) |
| `Iterator` extends `Traversable` | `current(): mixed`, `key(): mixed`, `next(): void`, `valid(): bool`, `rewind(): void` |
| `IteratorAggregate` extends `Traversable` | `getIterator(): Traversable` |
| `OuterIterator` extends `Iterator` | `getInnerIterator(): ?Iterator` |
| `RecursiveIterator` extends `Iterator` | `getChildren(): ?RecursiveIterator`, `hasChildren(): bool` |
| `SeekableIterator` extends `Iterator` | `seek(int $offset): void` |
| `Countable` | `count(): int` |
| `ArrayAccess` | `offsetExists(mixed $offset): bool`, `offsetGet(mixed $offset): mixed`, `offsetSet(mixed $offset, mixed $value): void`, `offsetUnset(mixed $offset): void` |
| `SplObserver` | `update(SplSubject $subject): void` |
| `SplSubject` | `attach(SplObserver $observer): void`, `detach(SplObserver $observer): void`, `notify(): void` |
| `Stringable` | `__toString(): string` |
| `JsonSerializable` | `jsonSerialize(): mixed` |
| `Throwable` | `getMessage(): string`, `getCode(): int`, `getFile(): string`, `getLine(): int`, `getTrace(): array`, `getTraceAsString(): string`, `getPrevious(): ?Throwable`, `__toString(): string` |

当 `$obj` 是实现了 `Countable` 接口的类的实例时，`count($obj)` 会自动分发给 `Countable::count()`。

与 PHP 一致，用户类不能直接实现 `Throwable`。应继承 `Exception` 或 `Error`；用户接口可以继承 `Throwable`，而继承 `Exception` 或 `Error` 的类可以实现这些用户接口。

实现 `ArrayAccess` 的类可以使用 PHP 下标语法：`$obj[$key]` 会分发给 `offsetGet()`，`$obj[$key] = $value` 会分发给 `offsetSet()`，`isset($obj[$key])` 会分发给 `offsetExists()`，`unset($obj[$key])` 会分发给 `offsetUnset()`。

`Serializable` 特意未提供：它自 PHP 8.1 起已被弃用。请改用 `__serialize` / `__unserialize` 魔术方法（当这些功能实现时）。

### 内置 SPL 容器和存储迭代器

SPL 容器和存储迭代器类是内置的：`SplDoublyLinkedList`、`SplStack`、`SplQueue`、`SplFixedArray`、`EmptyIterator`、`InternalIterator`、`ArrayIterator`、`ArrayObject`、`IteratorIterator`、`LimitIterator`、`NoRewindIterator`、`InfiniteIterator`、`FilterIterator`、`CallbackFilterIterator`、`CachingIterator`、`AppendIterator`、`MultipleIterator`、`RecursiveArrayIterator`、`RecursiveFilterIterator`、`RecursiveCallbackFilterIterator`、`RecursiveIteratorIterator` 和 `ParentIterator`。它们在 PHP 期望的地方参与 `class_exists()`、`get_declared_classes()`、`instanceof`、继承的类常量、接口检查、`foreach` 以及 `ArrayAccess`。PHP 在 `spl_classes()` 中不包含 `InternalIterator`，因此 elephc 在该辅助函数中也将其排除在外。

| 类 | 父类 | 接口 |
|---|---|---|
| `SplDoublyLinkedList` | — | `Iterator`, `Countable`, `ArrayAccess` |
| `SplStack` | `SplDoublyLinkedList` | 继承自父类 |
| `SplQueue` | `SplDoublyLinkedList` | 继承自父类 |
| `SplFixedArray` | — | `IteratorAggregate`, `ArrayAccess`, `Countable`, `JsonSerializable` |
| `EmptyIterator` | — | `Iterator` |
| `InternalIterator` | — | `Iterator` |
| `ArrayIterator` | — | `Iterator`, `ArrayAccess`, `SeekableIterator`, `Countable` |
| `ArrayObject` | — | `IteratorAggregate`, `ArrayAccess`, `Countable` |
| `IteratorIterator` | — | `OuterIterator` |
| `LimitIterator` | `IteratorIterator` | 继承自父类 |
| `NoRewindIterator` | `IteratorIterator` | 继承自父类 |
| `InfiniteIterator` | `IteratorIterator` | 继承自父类 |
| `FilterIterator` | `IteratorIterator` | 继承自父类 |
| `CallbackFilterIterator` | `FilterIterator` | 继承自父类 |
| `CachingIterator` | `IteratorIterator` | `ArrayAccess`, `Countable`, `Stringable` |
| `AppendIterator` | `IteratorIterator` | 继承自父类 |
| `MultipleIterator` | — | `Iterator` |
| `RecursiveArrayIterator` | `ArrayIterator` | `RecursiveIterator` |
| `RecursiveFilterIterator` | `FilterIterator` | `RecursiveIterator` |
| `RecursiveCallbackFilterIterator` | `CallbackFilterIterator` | `RecursiveIterator` |
| `RecursiveIteratorIterator` | — | `OuterIterator` |
| `ParentIterator` | `RecursiveFilterIterator` | 继承自父类 |

有关支持的方法集、迭代器模式、示例以及当前兼容性差异，请参阅 [SPL](spl.md)。

## 使用 instanceof 进行类型检查
```php
<?php
interface Renderable {
    public function render();
}

class Widget {
    public function render() { return "widget"; }
}

class Button extends Widget implements Renderable {}

$item = new Button();
echo ($item instanceof Button) ? "yes" : "no";      // yes
echo ($item instanceof Widget) ? "yes" : "no";      // yes
echo ($item instanceof Renderable) ? "yes" : "no";  // yes

$target = "Button";
echo ($item instanceof $target) ? "yes" : "no";     // yes
```

运行时检查使用生成的类元数据，因此子类可以匹配父类和实现的接口。左侧可以是直接对象或装箱的 `mixed` / 可空 / 联合类型值；在对动态目标进行验证后，非对象值将返回 `false`。支持的目标包括命名的类/接口、`self`、`parent`、后期绑定的 `static`、动态类/接口字符串以及动态对象表达式。

## 抽象类
```php
<?php
abstract class BaseGreeter {
    abstract public function label();
    public function greet() { return "hi " . $this->label(); }
}
```
- 无法实例化
- 抽象方法必须没有方法体
- 非抽象类不能包含抽象方法

### 抽象属性

抽象类可以将 PHP 8.4 的钩子属性契约声明为 `abstract`。该声明没有默认值或钩子体，并且每个具体子类必须使用兼容的公共/受保护属性重新声明该属性。静态、final、private 和 `readonly` 的钩子抽象属性会被拒绝。

```php
<?php
abstract class Shape {
    abstract public int $sides { get; set; }
}

class Square extends Shape {
    public int $sides = 4;
}
```

具体重新声明会复用父类的槽位（在继承链中偏移量是稳定的），因此该属性对父类和子类方法都是可访问的。elephc 支持抽象类、接口和 Trait 中的钩子契约（`{ get; }`、`{ set; }` 和 `{ get; set; }`），以及具体属性上的可执行钩子体（参见[属性钩子](#property-hooks-get--set)）。

## Final 类、方法和属性
```php
<?php
final class InvoiceNumber {
    final public $value = 42;

    final public function label() {
        return "invoice:" . $this->value;
    }
}
```
- `final class` 不能被继承
- `final` 方法不能被子类重写
- `final` 属性不能被子类重新声明
- `final` 不会改变常规调用的对象布局或分发方式
- `abstract final` 类和方法会被拒绝
- 与 PHP 一致，`final private` 方法会触发警告，因为私有方法不会被重写；`__construct` 是例外
- 与 PHP 一致，`final private` 属性会被拒绝

## 属性
- `public`、`protected`、`private` 可见性
- 可选的默认值
- 可选的类型声明，例如 `public int $id` 或 `public ?string $email = null`
- `readonly` 属性（只能在 `__construct` 中赋值）
- `final` 属性，可以正常读取，但不能被子类重新声明
- 使用 `public static`、`protected static` 或 `private static` 的静态属性，包括类型化静态属性
- `readonly class` 会使所有实例属性变为只读；静态属性保持可变

```php
<?php
class User {
    public int $id;
    public string $name = "Ada";
    public ?string $email = null;

    public function __construct($id) {
        $this->id = $id;
    }
}
```

属性类型声明在编译时会对实例属性和静态属性都进行检查。默认值和后续赋值必须与声明的类型兼容，包括通过未类型化参数进行的构造函数赋值。没有显式默认值的类型化属性起始于 PHP 的未初始化状态；在首次赋值前读取实例或静态属性是致命的运行时错误，而将 `0`、`false`、`""` 或 `null` 等值赋给兼容的可空存储则会正常初始化该槽位。可空简写（`?T`）和联合类型存储在内部使用编译器的装箱 mixed（boxed mixed）表示形式。`void` 和 `callable` 属性类型会被拒绝。

无论是常规的 `new ClassName()` 形式还是动态的 `new $variable()` 实例化（因此也适用于运行时实例化的流包装器和流过滤器），都会应用属性默认值。当类名解析为已知类时，动态实例化与直接构造遵循相同的分配路径，因此构造函数参数会被求值，且 `__construct` 会正常运行。

一个 `array` 类型（或未类型化）的属性可以接受关联数组字面量默认值，例如 `['a' => 1]`。然后该属性会作为关联数组存储，因此字符串键的读取和写入（`$this->data['a']`、`$this->data[$key]`）会进行类型检查，并像任何其他关联数组一样运行。位置数组字面量默认值（`[1, 2, 3]`）则保持整型键的列表存储。

```php
<?php
class Bag {
    public array $data = ['a' => 1, 'b' => 2];
    public function get(string $key): int {
        return $this->data[$key] ?? 0;
    }
}
echo (new Bag())->get('a'); // 1
```

### 非对称可见性（`private(set)`）

PHP 8.4 非对称可见性允许属性的可读范围大于可写范围。可见性关键字后面的 `(set)` 修饰符可以独立于读取可见性来设置写入可见性：

```php
<?php
class Counter {
    public private(set) int $value = 0;     // read: public, write: private

    public function increment(): void {
        $this->value = $this->value + 1;     // allowed: write from inside the class
    }
}

$c = new Counter();
$c->increment();
echo $c->value;   // 2 — public read
// $c->value = 9; // rejected: write is private
```

规则：

- `set` 可见性适用于写入；普通（读取）可见性适用于读取。
- 单独的 `private(set)` / `protected(set)` 会使读取可见性保持其默认的 `public`。
- `protected(set)` 允许从声明类及其子类进行写入；`private(set)` 仅允许从声明类进行写入。
- 写入可见性不能弱于读取可见性（`private public(set)` 会被拒绝）。
- 属性必须是类型化的，并且该修饰符不能用于静态属性。
- 通过数组元素进行的间接写入（`$obj->items[] = x`、`$obj->items['k'] = x`）也是写入，因此它们遵循 `set` 可见性 —— 而不是更宽的读取可见性。

### 属性重新声明

子类可以重新声明从非私有父类继承的属性。重新声明在编译时进行检查，并且必须遵循 PHP 规则：

- 可见性不能降低（`public` → `protected` 会被拒绝；`protected` → `public` 是允许的）。
- 声明的类型必须是不变的。类型化的父类属性必须以相同的类型重新声明。类型化的父类属性不能变成未类型化，并且未类型化的父类属性不能在子类中获得类型。
- `readonly` 是单调的 —— 只读的父类属性在子类中必须保持 `readonly`。非只读的父类属性可以在子类中变成 `readonly`。
- 属性的引用限定符不能在继承关系中改变。
- `final` 父类属性不能被重新声明。
- 子类共享父类的槽位，因此从继承的方法中读取该属性会看到子类的值。

```php
<?php
class Base {
    public int $value = 0;
}

class Child extends Base {
    public int $value = 5;
}

echo (new Child())->value; // 5
```

在 PHP 中，私有父类属性仍被视为独立的槽位，但 elephc 拒绝通过它们进行同名重新声明；目前请在子类中声明不同的名称。

### 属性钩子（`get` / `set`）

属性可以定义在读取或写入时运行的**钩子**，以替代手写的 getter 和 setter 方法。钩子位于属性名后面的 `{ ... }` 块中。读取属性会运行其 `get` 钩子；给它赋值会运行其 `set` 钩子。

仅有 `get` 的属性是**虚拟的** —— 它自身没有存储值，且是只读的。短格式 `get => expr;` 返回 `expr`；块格式 `get { ... }` 运行语句并返回值：

```php
<?php
class Person {
    public string $first = "Ada";
    public string $last = "Lovelace";

    public string $full {
        get => $this->first . " " . $this->last;
    }
}

echo (new Person())->full; // Ada Lovelace
```

同时具有 `get` 和 `set` 的属性通常会从独立的后备字段中进行读写。赋给属性的值在 `set` 钩子内部作为 `$value` 可用（可以使用 `set(Type $other)` 对其重命名）：

```php
<?php
class Thermostat {
    private float $c = 0.0;

    public float $celsius {
        get => $this->c;
        set { $this->c = $value; }
    }

    public float $fahrenheit {
        get => $this->c * 9.0 / 5.0 + 32.0;
        set { $this->c = ($value - 32.0) * 5.0 / 9.0; }
    }
}

$t = new Thermostat();
$t->fahrenheit = 212.0;
echo $t->celsius; // 100
```

在属性自身的钩子内部，`$this->prop` 访问的是原始存储值，而不是重新运行钩子，因此钩子可以对其所属的属性进行读写（即后备属性/backed property）：

```php
<?php
class Name {
    public string $value {
        get => $this->value;
        set { $this->value = trim($value); }
    }
}

$n = new Name();
$n->value = "  Ada  ";
echo $n->value; // Ada
```

规则：

- 具有 `get` 钩子但没有 `set` 钩子的属性是只读的。写入它是一个编译时错误。
- 带有钩子的属性不能有默认值，且不能是 `static`、`final` 或 `readonly`。
- 每个钩子在每个属性中最多只能声明一次。
- 不支持简短的 `set => expr;` 形式；请使用代码块 `set { ... }`。
- 钩子与属性一起被子类继承。

抽象类、接口和 Trait 可以声明没有钩子体的钩子*契约*（`{ get; }`、`{ set; }`、`{ get; set; }`）；请参阅[抽象属性](#abstract-properties)和[接口](#interfaces)。

## 静态属性
静态属性使用类作用域的存储，并使用 `::` 进行访问。

```php
<?php
class Counter {
    public static int $count = 1;

    public static function bump() {
        self::$count = self::$count + 1;
        return self::$count;
    }
}

echo Counter::$count; // 1
Counter::$count = 5;
echo Counter::bump(); // 6
```

支持的接收器包括 `ClassName::$prop`、`self::$prop`、`parent::$prop` 和 `static::$prop`。静态属性可见性和声明的类型在编译时进行检查。没有默认值的类型化静态属性与类型化实例属性一样，使用相同的未初始化读取致命错误。继承的静态属性共享声明类的存储，直到子类重新声明该属性。重新声明遵循 PHP 规则：非私有继承属性保持不变的声明类型，不能降低可见性，且不能重写 `final` 属性。在子类中重新声明的私有静态属性是独立的槽位；`static::$prop` 仍然是后期绑定的，如果当前方法作用域无法访问匹配的私有槽位，则会报告致命的运行时错误。

与 PHP 一致，elephc 中的静态属性始终是可变的 —— 即使在 `readonly class` 上也是如此。PHP 的 `readonly` 修饰符仅约束实例属性；在 PHP 和 elephc 中，声明 `public readonly static` 都是编译错误。

静态数组属性支持直接写入元素：

```php
<?php
class Registry {
    public static array $items = [];
}

Registry::$items[] = 10;
Registry::$items[0] = 12;
echo Registry::$items[0]; // 12
```

## 构造函数
使用 `new` 时自动调用：
```php
$p = new Point(3, 4);
```

支持构造函数属性提升。构造函数参数前的可见性修饰符或 `readonly` 会声明一个属性，并在 `__construct` 开始时分配传入的参数。

```php
<?php
class User {
    public function __construct(
        public int $id,
        private string $name = "Ada",
        readonly ?int $rank = null
    ) {}

    public function name() {
        return $this->name;
    }
}

$user = new User(7);
echo $user->id;      // 7
echo $user->name();  // Ada
```

提升的属性支持 `public`、`protected`、`private`、`readonly`、可空和联合类型声明、构造函数参数默认值以及引用参数。与 PHP 一致，可变参数提升会被拒绝。

当构造函数参数是变量时，支持引用提升属性：

```php
<?php
class Counter {
    public function __construct(public int &$value) {}
}

$value = 1;
$counter = new Counter($value);

$value = 2;
echo $counter->value;  // 2

$counter->value = 3;
echo $value;           // 3
```

引用提升参数也可以有默认值。如果没有传入参数，elephc 会为默认值创建一个私有引用单元。如果传入了变量，提升的属性将别名该变量。只读的引用提升属性在编译时会被拒绝，因为构造过程必须将间接可变别名绑定到只读槽位上。

## 实例方法和 $this
用于重写的虚分发。
私有方法不是虚方法。

## 空安全访问
当接收器可能为 `null` 时使用 `?->`：

```php
<?php
echo $user?->profile?->name ?? "anonymous";
echo $user?->profile?->label() ?? "missing";
echo $user?->profile->address?->city ?? "unknown";
$segment = "profile";
echo $user?->{$segment}?->name ?? "anonymous";
```

当空安全接收器为 `null` 时，elephc 会跳过该后缀链的其余部分并返回 `null`。这与 PHP 对混合链（例如 `$user?->profile->address`）的处理一致：当 `$user` 为 `null` 时，普通的 `->address` 部分会被跳过，但如果 `$user` 非空而 `profile` 本身为 `null`，仍会正常发出警告或致命错误。被跳过分支上的方法参数、数组索引和可调用参数将不会被求值。

## parent::method()
直接调用父类实现。

## self::method()
绑定到词法类，而不是运行时的子类。

## static::method()
后期静态绑定 —— 在运行时根据被调用的类进行解析。

## 静态方法
使用 `::` 调用，没有 `$this`。

## 类名反射（`::class`）

`::class` 在编译时以字符串形式返回完全限定类名。

```php
<?php
namespace App;
class Logger {
    public static function tag() {
        return self::class;          // "App\Logger"
    }
}
echo Logger::class;                  // "App\Logger"
echo \App\Logger::class;             // "App\Logger"
```

支持的接收器：`Class::class`、`\Vendor\Class::class`、`self::class`、`parent::class`、`static::class`。

`static::class` 遵循 PHP 后期静态绑定，并解析为被调用的类。对于命名的接收器，elephc 保留了 PHP 写入/导入的 `::class` 字符串拼写，同时对于可执行操作（例如 `new`、`instanceof`、静态方法调用和静态属性访问）仍然使用不区分大小写的类查找。

## 后期静态绑定构造函数（`new self()`、`new static()`、`new parent()`）

在类方法内部支持 `new self()`、`new static()` 和 `new parent()` 工厂模式：

```php
<?php
class Box {
    public string $label = "default";
    public static function make(): Box {
        return new self();
    }
}
$b = Box::make();
echo $b->label;                      // "default"

class Base {
    public string $kind = "base";
}

class Child extends Base {
    public static function makeBase(): Base {
        return new parent();
    }
}
```

`new static()` 遵循 PHP 后期静态绑定，并构造被调用类的实例。

## 相对类类型（`self`、`static`、`parent`）

`self`、`static` 和 `parent` 可用作方法参数、方法返回类型和属性的类型声明。它们解析为封闭类（`self`、`static`）或其父类（`parent`）：

```php
<?php
class Money {
    public function __construct(public int $amount) {}

    // `self` return type: enables fluent chaining.
    public function add(self $other): self {
        return new Money($this->amount + $other->amount);
    }
}

class Node {
    public ?self $next = null;     // a same-class (nullable) property
    public function __construct(public int $value) {}
}

trait Fluent {
    // In a trait, `static` resolves to the class that uses the trait.
    public function copy(): static {
        return clone $this;
    }
}
```

规则：

- `self` 和 `static` 解析为声明该成员的类；`parent` 解析为该类的父类。
- 它们在参数、返回值和属性类型位置被接受，并且可以与可空简写（`?self`）或联合类型（`self|null`）结合使用。
- 在 Trait 内部使用时，`self`/`static` 解析为使用该 Trait 的类，而不是 Trait 本身。
- 在类外部使用 `self`、`static` 或 `parent` 作为类型会被拒绝。
- 对于类型检查，`static` 被视为声明类。直接在声明类上链式调用的 `static` 返回类型将按预期工作；当继承了返回 `static` 的方法并在子类上调用时，其结果类型为声明类，而不是子类。

## 动态实例化（`new $variable()`）

`new $variable()` 构造一个实例，其类在运行时从字符串变量中选择：

```php
<?php
class Foo {}
class Bar {}

$cls = "Foo";
$obj = new $cls();                       // Foo instance
echo gettype($obj);                      // "object"

$missing = "NoSuchClass";
$bad = new $missing();                   // PHP null
echo gettype($bad);                      // "NULL"
```

elephc 根据编译时类元数据不区分大小写地解析类名，这与 PHP 类查找相匹配。匹配成功会通过与 `new ClassName()` 相同的分配路径进行分发，包括构造函数调用、声明的属性默认值以及支持的内置/SPL 运行时存储初始化。未知的名称目前会产生 PHP `null`；缺失类的致命路径尚未收紧。

## 动态方法和静态调用

方法或静态方法可以通过变量中保存的名称进行调用：

```php
<?php
class Calculator {
    public function add(int $a, int $b): int { return $a + $b; }
    public static function version(): string { return "1.0"; }
}

$calc = new Calculator();
$method = "add";
echo $calc->$method(2, 3);        // 5 — dynamic instance method
echo $calc->{$method}(2, 3);      // 5 — brace form

$class = "Calculator";
echo $class::version();           // 1.0 — dynamic static call
$static = "version";
echo $class::$static();           // 1.0 — both class and method dynamic
```

`$obj->$name(...)` 和 `$class::$name(...)` 等同于 `call_user_func([$obj, $name], ...)` / `call_user_func([$class, $name], ...)`。字面量类上的动态方法名也可以工作（`ClassName::$name(...)`）。参数按位置转发。尚不支持空安全动态方法调用（`$obj?->$name()`），并且**动态调用中拒绝命名参数**，因为在编译时不知道目标方法 —— 从而也不知道其参数名称。

## 匿名类（`new class {}`）

匿名类在单个表达式中定义并实例化一个类。它可以接受构造函数参数、继承一个类并实现接口：

```php
<?php
interface Logger {
    public function log(string $message): string;
}

function make_logger(string $prefix): Logger {
    return new class($prefix) implements Logger {
        public function __construct(private string $prefix) {}

        public function log(string $message): string {
            return $this->prefix . ": " . $message;
        }
    };
}

echo make_logger("INFO")->log("started"); // INFO: started
```

规则：

- 构造函数参数放在任何 `extends`/`implements` 子句之前：`new class(args) extends P implements I { ... }`。
- 每个匿名类都编译为自己唯一命名的类，因此两个 `new class {}` 表达式会产生两个独立的类型。
- 与命名类一样，匿名类**不**捕捉外层作用域的变量；请通过构造函数传递数据。
- 支持 `new readonly class { ... }`。

## 重写规则
相同的参数个数、相同的引用传递位置、相同的默认布局、相同的可变参数形状。

## Trait
在编译时平坦化。支持：`use Trait;`、多个 Trait、`insteadof`、`as`、Trait 属性、静态 Trait 方法。

Trait 可以声明抽象钩子属性契约。使用该 Trait 的具体类必须直接满足该契约，或者通过抽象基类继承它（稍后由具体子类完成）。

## 属性访问
使用 `->` 访问属性和方法。

### 动态属性访问

属性名称可以在运行时通过 `$obj->{$expr}` 语法进行计算，其中 `$expr` 是任何求值为字符串的表达式。相同的形式也可用作赋值目标，并能与空安全操作符结合使用（`$obj?->{$expr}`）。

```php
<?php
class Point {
    public int $x = 1;
    public int $y = 2;
}

$p = new Point();
$field = "x";
echo $p->{$field};        // 1
$p->{$field} = 9;
echo $p->x;               // 9
```

## 枚举
```php
<?php
enum Color: int {
    case Red = 1;
    case Green = 2;
}
echo Color::Red->name;           // Red
echo Color::Red->value;          // 1
echo Color::from(2) === Color::Green; // 1
```

纯枚举和回退枚举。每个 Case 都暴露只读的 `->name` 属性（Case 标识符）；回退 Case 还暴露 `->value`。外加 `::from()`、`::tryFrom()`、`::cases()`。仅支持 `int` 和 `string` 作为回退类型。

### 枚举方法、常量和接口

枚举可以声明实例方法、静态方法、常量以及 `implements` 子句。实例方法分发给 Case 单例，因此 `$this` 就是对应的 Case：

```php
<?php
interface HasLabel {
    public function label(): string;
}

enum Suit: string implements HasLabel {
    case Hearts = "H";
    case Spades = "S";

    const COUNT = 2;

    public function label(): string {
        return match ($this) {
            Suit::Hearts => "Hearts",
            Suit::Spades => "Spades",
        };
    }

    public function code(): string {
        return $this->value;          // backing value
    }

    public static function default(): self {
        return Suit::Hearts;          // static factory
    }
}

echo Suit::Hearts->label();           // Hearts
echo Suit::default()->code();         // H
```

规则：

- 实例方法可以使用 `$this`（对应的 Case）、`match ($this)`、Case 属性 `$this->name`、回退值 `$this->value` 以及 `self::CONST`。
- 静态方法的分发与类的静态方法相同，且可以作为工厂。
- 枚举可以 `implements` 一个或多个接口，并可以通过它们来使用。
- 枚举方法中的 `self`/`static` 类型提示解析为该枚举。

枚举常量无论是在枚举内部（`self::CONST`）还是在外部（`EnumName::CONST`）都是可读的。枚举方法体像类方法体一样进行类型检查，因此枚举方法内的返回类型不匹配或未定义变量会被报告。

当前限制：不支持在枚举内部使用 Trait。

### 内置 `SortDirection`

PHP 8.6 的全局单位枚举无需用户声明即可使用：

```php
<?php
function sqlSortKeyword(SortDirection $direction): string {
    return match ($direction) {
        SortDirection::Ascending => "ASC",
        SortDirection::Descending => "DESC",
    };
}

echo sqlSortKeyword(SortDirection::Descending); // DESC
```

`SortDirection` 具有两个 Case：`Ascending` 和 `Descending`，没有回退值，并且适用于枚举 Case 恒等、`SortDirection::cases()`、`enum_exists()`、类型声明、`match`、导入以及完全限定的 `\SortDirection` 引用。

## 魔术方法
- `__construct(...)` — 在实例化时运行
- `__destruct()` — 在对象释放时运行（见下文）
- `__toString()` — 强制类型转换为字符串
- `__get($name)` — 读取未声明的属性
- `__set($name, $value)` — 写入未声明的属性
- `__isset($name)` — 对未声明的属性执行 `isset()`/`empty()`
- `__unset($name)` — 对未声明的属性执行 `unset()`
- `__invoke(...$args)` — 直接调用对象
- `__call($name, $args)` — 拦截缺失的实例方法
- `__callStatic($name, $args)` — 拦截缺失的静态方法

## 属性拦截（`__get`、`__set`、`__isset`、`__unset`）

当代码读取、写入、测试或删除类未声明的属性时，会调用相应的魔术方法。这允许类公开由任何内部表示支持的虚拟属性：

```php
<?php
class Config
{
    private bool $debugEnabled = true;

    public function __get(string $name): bool
    {
        return $name === "debug" && $this->debugEnabled;
    }

    public function __isset(string $name): bool
    {
        return $name === "debug" && $this->debugEnabled;
    }

    public function __unset(string $name): void
    {
        if ($name === "debug") {
            $this->debugEnabled = false;
        }
    }
}

$config = new Config();
echo isset($config->debug) ? "on" : "off";  // on  → __isset
unset($config->debug);                        //     → __unset
echo isset($config->debug) ? "on" : "off";  // off → __isset
```

`isset($obj->prop)` 返回 `__isset` 的布尔结果；`unset($obj->prop)` 会运行 `__unset` 并产生副作用。两者都仅针对类未声明的属性触发 —— 访问已声明的属性会直接使用它。

契约：`__isset` 和 `__unset` 必须是非静态且公共的，并且每个方法只接受一个参数（属性名）。`__isset` 返回 `bool`。

## 静态调用拦截（`__callStatic`）

`__callStatic` 是 `__call` 的静态对应：对类未定义的方法的静态调用会被转发给 `__callStatic`，它接收被调用的方法名和参数数组。子类会继承它。

```php
<?php
abstract class Query
{
    public static function __callStatic(string $method, array $args): string
    {
        return $method . "(" . implode(", ", $args) . ")";
    }
}

class User extends Query {}

echo User::where("active", "1");  // where(active, 1)  → __callStatic
echo User::orderBy("name");        // orderBy(name)      → __callStatic
```

契约：`__callStatic` 必须声明为 `public static`，且正好接受两个参数 —— 方法名（`string`）和参数列表（`array`）。

## 析构函数（`__destruct`）

类可以声明 `public function __destruct(): void` 以在对象释放时运行清理工作。elephc 使用引用计数，因此一旦最后一个引用消失，析构函数就会立即运行 —— 没有单独的垃圾回收延迟。它在以下情况下触发：

- 保存对象的局部变量超出作用域（包括在提前 `return` 和异常展开期间）；
- 变量被重新赋值或 `unset()`，从而释放先前的对象；
- 对象是保持包含它的数组或对象存活的最后一个元素；
- 程序结束，对于仍由顶级变量引用的对象。

析构函数在对象的属性被释放**之前**运行，因此它仍然可以读取 `$this` 及其属性。这使得 RAII 风格的清理变得很自然：在 `__construct` 中获取资源，在 `__destruct` 中释放它。

```php
<?php
class TempFile
{
    private string $path;
    public function __construct(string $path)
    {
        $this->path = $path;
        file_put_contents($this->path, "scratch");
    }
    public function __destruct()
    {
        unlink($this->path);   // runs automatically when the object is released
    }
}
```

规则和注意事项：

- `__destruct` 必须是非静态的，并且不接受任何参数。允许任何可见性（PHP 无论如何都会调用它），因此它可以是 `public`、`protected` 或 `private`。
- 没有自己 `__destruct` 的子类会继承父类的。
- 在析构函数内部获取 `$this` 的临时副本是安全的；对象不会被释放两次。
- 形成引用循环的对象（例如 `$a->next = $b; $b->next = $a;`）由针对性循环收集器（targeted cycle collector）回收，并且它们的析构函数仍然会运行。收集器是及时的 —— 一旦最后一个外部引用消失，它就会立即回收不可达的孤岛 —— 因此对于循环对象，析构函数的*触发时机*可能与 PHP 的延迟循环收集器不同，并且循环成员之间的顺序是未指定的。
- **不支持对象复活**：将 `$this` 存储在比析构函数生命周期更长的地方（以便对象生存下来）并不能保持其存活 —— 析构函数返回后，对象仍然会被释放。避免在 `__destruct` 结束之后保留 `$this`。

## 注解（Attributes）

PHP 8.0 注解（`#[Name]`）修饰声明。elephc 在 PHP 允许的每一个位置解析注解：类、接口、Trait、枚举、枚举 Case、顶级函数、方法、属性、函数/方法/闭包参数（包括提升的构造函数参数）、闭包和箭头函数。类、方法和属性的注解通过下面的辅助内置函数拥有有限的运行时反射；其他声明位置的注解目前仅进行语法验证并只保留在 AST 中。

```php
<?php
#[Author("Ada"), Version(1)]
class Greeter {
    #[Slot]
    public string $who;

    public function __construct(#[Required] string $who) {
        $this->who = $who;
    }

    #[Pure]
    public function greet(): void { echo "Hello"; }
}

class LoudGreeter extends Greeter {
    #[\Override]
    public function greet(): void { echo "HELLO"; }
}

$pure = #[Pure] fn (int $x) => $x + 1;

#[Memoized]
function double(int $x): int { return $x * 2; }
```

支持的语法：
- 单个注解：`#[Foo]`
- 带参数的注解：`#[Bar(1, "two")]`
- 每个分组多个注解：`#[A, B(1)]`
- 堆叠分组：`#[A] #[B]`
- 完全限定名称：`#[\Symfony\Contracts\Service\Attribute\Required]`

注解分组之外的 `#` 引入了一个 PHP 风格的行注释，与 `//` 相同。非声明语句（`echo`、`if`、赋值语句）之前的注解会被拒绝 —— 这是 PHP 的严格规则。

### 编译时强制执行的注解

- **`#[\Override]`** (PHP 8.3) — 类型检查器验证被标记的方法是否确实重写了父类中声明或实现的接口（传递性地）的方法。方法名拼写错误或缺失父类方法会变成编译时错误：`<class>::<method>() has #[\Override] attribute, but no matching parent method was found`。未限定的 `#[Override]` 和完全限定的 `#[\Override]` 形式都会被识别。
- **`#[\Deprecated]`** / **`#[\Deprecated("reason")]`** (PHP 8.4) — 对被标记的函数、方法或静态方法的调用会发出编译警告：`Call to deprecated function: name() — reason`。原因参数（如果是字符串字面量）会附加到消息中。
- **`#[\AllowDynamicProperties]`** (PHP 8.2) — 被标记类的实例在运行时接受未声明属性的赋值。每个实例都带有一个由构造函数分配的逐对象哈希表旁路表（side-table，~296 字节）；类型检查器将未声明的读取接受为 `mixed`。该哈希表随对象自动释放。

内置注解遵循 PHP 类名解析规则。在命名空间中，`#[Deprecated]` 表示 `#[CurrentNamespace\Deprecated]`；使用 `#[\Deprecated]` 或导入别名（例如 `use Deprecated as Old; #[Old]`）来定位全局内置注解。

```php
<?php
#[\AllowDynamicProperties]
class Bag {
    public int $declared = 1;
}

$b = new Bag();
$b->extra = 42;          // accepted, stored in side-table
$b->name = "elephc";     // heterogeneous values supported
echo $b->declared;        // 1
echo $b->extra;           // 42
echo $b->name;            // "elephc"
echo $b->missing;         // empty (Mixed null)
```

用户定义的注解（例如 `#[Author]`、`#[Pure]`、`#[Memoized]`）会解析并保留在 AST 中。它们没有编译时语义，但它们的**名称**和**字面量参数**（位置和命名参数）在运行时可通过轻量级内置辅助函数和支持的反射 API 访问：

```php
<?php
#[Author("Ada"), Version(1)]
class Greeter {}

#[\Override]
class Solo {}

#[Route("/api/users", "GET", true)]
class UserController {}

foreach (class_attribute_names('Greeter') as $name) {
    echo $name, "\n";
}
// Author
// Version

echo class_attribute_names('Solo')[0]; // "Override" (resolved name)

foreach (class_attribute_args('UserController', 'Route') as $arg) {
    echo $arg, "\n";
}
// /api/users
// GET
// 1     ← `true` echoes as 1 in PHP
```

`class_attribute_args()` 返回一个 `array<mixed>`，其元素保留其原始 PHP 类型 —— 字符串保持为字符串，整型保持为整型，布尔型保持为布尔型，`null` 保持为 `null`。参数在编译时被留用（interned），并在调用点根据需求装箱为 mixed 单元格。

对于更符合 PHP 习惯的 API，`class_get_attributes()` 和 `ReflectionClass::getAttributes()` 返回包装在 `ReflectionAttribute` 实例中的相同数据：

```php
<?php
#[Author("Ada", 1815), Version("1.0", true)]
class Greeter {}

foreach (class_get_attributes('Greeter') as $attr) {
    echo $attr->getName(), ": ";
    foreach ($attr->getArguments() as $arg) {
        echo "[", $arg, "]";
    }
    echo "\n";
}
// Author: [Ada][1815]
// Version: [1.0][1]
```

反射也适用于类成员：

```php
<?php
class Controller {
    #[Route("/home", "GET")]
    public function index() {}

    #[Column("id")]
    public int $id = 0;
}

$class = new ReflectionClass(Controller::class);
echo $class->getAttributes()[0]->getName();

$method = new ReflectionMethod('Controller', 'index');
echo $method->getAttributes()[0]->getArguments()[0]; // /home

$property = new ReflectionProperty('Controller', 'id');
echo $property->getAttributes()[0]->getName(); // Column
```

`ReflectionAttribute` 是一个最终合成的内置类，具有 `getName(): string`、`getArguments(): array` 和 `newInstance(): mixed` 方法。它在内部由 `class_get_attributes()` 和支持的反射查找填充，无法直接从用户代码中构造或填充；其元数据槽位是私有的。当注解类存在于程序中并且捕获的参数是支持的字面量时，`newInstance()` 会根据需要构造注解类：

```php
<?php
class Route {
    public function __construct(string $path) {
        echo $path;
    }
}

#[Route("/lazy")]
class Controller {}

$attr = (new ReflectionClass('Controller'))->getAttributes()[0];
$instance = $attr->newInstance(); // constructor runs here
echo ($instance instanceof Route) ? "yes" : "no";
```

| 函数 | 签名 | 描述 |
|---|---|---|
| `class_attribute_names()` | `class_attribute_names($class_name): array` | 返回修饰该类的已解析注解名称 |
| `class_attribute_args()` | `class_attribute_args($class_name, $attribute_name): array` | 返回第一个匹配的类注解所支持的字面量位置参数 |
| `class_get_attributes()` | `class_get_attributes($class_name): array` | 返回类注解的 `ReflectionAttribute` 对象 |

| 反射方法 | 支持的构造函数 | 描述 |
|---|---|---|
| `ReflectionClass::getName()` | `new ReflectionClass($class_name)` | 返回解析后的类名 |
| `ReflectionClass::getAttributes()` | `new ReflectionClass($class_name)` | 返回类注解的 `ReflectionAttribute` 对象 |
| `ReflectionMethod::getAttributes()` | `new ReflectionMethod($class_name, $method_name)` | 返回方法注解的 `ReflectionAttribute` 对象 |
| `ReflectionProperty::getAttributes()` | `new ReflectionProperty($class_name, $property_name)` | 返回属性注解的 `ReflectionAttribute` 对象 |
| `ReflectionAttribute::newInstance()` | 仅限内部 | 从捕获的字面量参数实例化注解类 |

函数及其参数也可以被反射。`ReflectionFunction` 读取命名函数的签名，而 `getParameters()` 按顺序返回每个声明的参数对应的 `ReflectionParameter`：

```php
<?php
class Mailer {}

function send(string $to, Mailer $mailer, int $retries = 3, ?string $subject = null): void {}

$fn = new ReflectionFunction('send');
echo $fn->getNumberOfParameters();         // 4
echo $fn->getNumberOfRequiredParameters(); // 2

foreach ($fn->getParameters() as $param) {
    echo $param->getName();                // to, mailer, retries, subject
    echo $param->getPosition();            // 0, 1, 2, 3
    echo $param->isOptional() ? "?" : "!"; // retries and subject are optional

    if ($param->hasType()) {
        $type = $param->getType();         // ReflectionNamedType
        echo $type->getName();             // string, Mailer, int, string
        echo $type->isBuiltin() ? "b" : "c";
        echo $type->allowsNull() ? "n" : "-"; // subject (?string) allows null
    }
}
```

没有类型提示的参数会报告 `hasType()` 为 `false`，且 `getType()` 返回 `null`。类似于 `?string` 的可空类型提示会报告 `getName()` 为 `string` 并且 `allowsNull()` 为 `true`。类类型参数报告裸类名，且 `isBuiltin()` 为 `false`。

| 反射方法 | 返回值 | 描述 |
|---|---|---|
| `ReflectionFunction::getName()` | `string` | 被反射函数的名称 |
| `ReflectionFunction::getShortName()` | `string` | 不带命名空间前缀的名称 |
| `ReflectionFunction::getNumberOfParameters()` | `int` | 声明的参数总数 |
| `ReflectionFunction::getNumberOfRequiredParameters()` | `int` | 没有默认值且在第一个可选参数之前的参数个数 |
| `ReflectionFunction::getParameters()` | `ReflectionParameter[]` | 按顺序每个声明的参数对应一个对象 |
| `ReflectionParameter::getName()` | `string` | 参数名称（不带 `$`） |
| `ReflectionParameter::getPosition()` | `int` | 从零开始的参数索引 |
| `ReflectionParameter::isOptional()` | `bool` | 对于具有默认值或可变参数的参数以及其后的任何参数，返回 True |
| `ReflectionParameter::isVariadic()` | `bool` | 对于 `...$rest` 参数返回 True |
| `ReflectionParameter::hasType()` | `bool` | 当参数声明了类型时返回 True |
| `ReflectionParameter::getType()` | `?ReflectionNamedType` | 声明的类型，未类型化时返回 `null` |
| `ReflectionNamedType::getName()` | `string` | 类型名称（`int`、`string`、类名等） |
| `ReflectionNamedType::isBuiltin()` | `bool` | 内置类型返回 True，类类型返回 False |
| `ReflectionNamedType::allowsNull()` | `bool` | 当声明的类型可空时返回 True |

当前限制：
- `class_attribute_names()`、`class_attribute_args()`、`class_get_attributes()` 以及 `new ReflectionClass/Method/Property(...)` 的所有参数必须是编译时类或成员字符串。`new ReflectionClass/Method/Property(...)` 的类名参数接受 `ClassName::class`，并且在字面量字符串检查之前会运行常规的命名参数或静态关联数组展开规范化。动态类、方法、属性或注解名称需要一个尚未实现的运行时“名称→ID”查找表。
- 现今通过反射具现化的注解参数包括：string、int、float、bool、null、数值字面量的否定（`-N`）、数组（位置和关联数组，嵌套的，带有异构元素类型）、**命名参数**以及**符号引用** —— 全局常量（`#[A(SOME_CONST)]`）、类或接口常量（`#[A(C::BAR)]`）或枚举 Case（`#[A(E::Case)]`）。`ReflectionClass`、`ReflectionMethod`、`ReflectionProperty::getAttributes()` → `getArguments()` 返回其字符串键下的命名参数和其整型键下的位置参数，这与 PHP 一致。常量引用解析为其值，枚举 Case 引用解析为 Case 对象（因此读取其 `->value` 或 `->name` 与 PHP 完全相同），并且 `newInstance()` 使用这些参数构造注解。
- elephc 无法解析的符号引用 —— 例如未注册的内置类常量，如 `Attribute::TARGET_CLASS` —— 被视为不受支持的元数据：该注解仍然会解析和编译，且 `class_attribute_names()` 仍然会列出它，但其参数无法通过 `getAttributes()`、`class_get_attributes()` 或 `class_attribute_args()` 进行反射。
- 扁平的 `class_attribute_args()` 辅助函数仅返回标量的位置数组；它拒绝其参数包含键名（命名参数或任意深度的关联数组）或包含符号引用的注解。对于这些情况，请使用 `ReflectionClass::getAttributes()->getArguments()`。
- 当同一个类上有多个同名注解时，`class_attribute_args()` 返回第一个匹配项的参数；`class_get_attributes()` 确实会按源顺序将每个出现位置公开为独立的 `ReflectionAttribute`。
- `ReflectionClass` 支持 `getName()` 和 `getAttributes()`。`ReflectionMethod` 和 `ReflectionProperty` 目前仅支持 `getAttributes()`；更广泛的 API，例如 `getProperties()`、`getMethods()` 以及通过 `ReflectionClass::newInstance()` 进行的对象构造尚不可用。
- `ReflectionFunction` 或 `ReflectionParameter` 仅反射命名函数（构造函数参数必须是编译时函数名字符串）。`ReflectionParameter::getType()` 解析单个命名类型（包括可空的 `?T`）；联合类型和相交类型参数、默认值反射（`getDefaultValue()`）以及逐参数的注解反射尚不可用。显式的 `mixed` 提示报告为未类型化。

### 类常量

```php
<?php
class Math {
    const PI = 314;
    public const E = 271;
    const TAU = self::PI * 2;
}
echo Math::PI;        // 314
echo self::PI;        // inside Math methods

interface Limits {
    const MAX = 100;
}
class Bound implements Limits {
    public function get(): int { return Limits::MAX; }
}
```

类常量（PHP 7.1+ 可见性，PHP 8.1+ `final`）存在于类、接口和 Trait 中。它们从父类和实现的接口中继承（具有传递性）。在代码生成阶段，elephc 会在每个访问位置内联常量可折叠的值 —— 没有运行时查找。类常量表达式可以通过 `ClassName::CONST`、`self::CONST` 或 `parent::CONST` 引用其他类常量；`self::class` 和 `parent::class` 也被接受。`self::` 和 `parent::` 早期绑定到声明类，这与 PHP 一致。在类常量表达式中，`static::CONST` 会被拒绝，因为 PHP 不允许在编译时常量中使用后期静态绑定。类常量上的注解会被接受并存储在 AST 中。

## 限制
- 与 PHP 一致，`readonly static` 属性会被拒绝。`readonly class` 中的静态属性仍然是可变的。
- 有后备的属性钩子可以读写它们自己的后备槽位，但不支持简短的 `set => expr;` 形式；请使用代码块 `set { ... }`。
- 尚不支持用同名子属性遮蔽私有父属性（PHP 为它们分配独立的槽位；elephc 对每个名称使用一个槽位）
- 类常量必须是字面量或可折叠的表达式；不支持循环常量引用。
- 类注解名称和受支持的字面量参数在运行时通过 `class_attribute_names()`、`class_attribute_args()`、`class_get_attributes()` 以及支持的 `ReflectionClass`/`ReflectionMethod`/`ReflectionProperty::getAttributes()` API 公开。函数和参数签名通过 `ReflectionFunction` 和 `ReflectionParameter`（包括 `getType()`）公开；目前尚不支持逐参数的注解反射。`#[\Override]`、`#[\Deprecated]` 和 `#[\AllowDynamicProperties]` 在编译时和运行时均被强制执行/诊断/遵循；`#[\SensitiveParameter]` 会被解析但尚未传播到参数中（有待对参数表示形式和堆栈跟踪基础设施进行重构）。
