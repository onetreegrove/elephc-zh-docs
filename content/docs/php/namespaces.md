---
title: "命名空间"
description: "命名空间声明、use 导入、名称解析、include/require。"
sidebar:
  order: 11
---

## 声明命名空间
```php
<?php
namespace App\Core;
function version() { return "1.0"; }
```

块形式：
```php
<?php
namespace App\Core {
    class Clock {
        public static function now() { return "tick"; }
    }
}
```

## 使用 use 导入
```php
<?php
use App\Support\Response;
use function App\Support\render as render_page;
use const App\Support\STATUS_OK;
```

支持的形式：`use Foo\Bar;`、`use Foo\Bar as Baz;`、`use function`、`use const`、分组导入 `use Vendor\Pkg\{Thing, Other as Alias};` 以及混合分组导入。

## 名称解析规则
- 非限定类名（unqualified class names）会遵循 `use` 别名，否则相对于当前命名空间进行解析
- 函数/常量：优先使用 `use function`/`use const` 别名，其次是当前命名空间，最后回退到全局解析
- 完全限定（fully-qualified）的 `\Lib\Tool` 总是引用全局规范名称
- 引入的文件保留它们自己的命名空间和导入；include 无法继承调用者的命名空间作用域

## 大小写敏感性

elephc 遵循 PHP 的符号大小写规则：

- PHP 关键字不区分大小写（`IF`、`Echo` 和 `function` 是等价的）
- 内置函数和用户定义函数的调用不区分大小写，包括 `call_user_func()`、`array_map()` 及相关回调内置函数所使用的字符串字面量回调名称
- 类、接口、trait 和方法的查找不区分大小写
- 变量、对象属性、字符串数组键以及用户定义的常量保持大小写敏感
- 内置常量名（例如 `PHP_OS`、`INF` 和 `STDOUT`）保持大小写敏感

## 命名空间与回调
字符串字面量回调名称遵循与函数调用相同的解析规则。

`function_exists()` 属于自省（introspection）而非调用：它的字符串参数将被检查为字面量全局函数名或完全限定的函数名。它不会将当前命名空间或 `use function` 导入应用于非限定字符串。

## Include / Require
```php
<?php
include 'helpers.php';
require 'config.php';
include_once 'utils.php';
require_once 'lib.php';
```

路径在编译时进行解析并内联。路径是相对于发起引入的文件（including file）的。

| 形式 | 文件缺失 | 已引入 |
|---|---|---|
| `include` | 跳过 | 重新引入 |
| `require` | 编译错误 | 重新引入 |
| `include_once` | 跳过 | 跳过 |
| `require_once` | 编译错误 | 跳过 |

同时支持 `include 'f';` 和 `include('f');` 语法。

`include`/`require` 也可以用在表达式位置，作为 `return` 的值或普通赋值。该表达式的求值结果为被引入文件自身的顶级 `return` 值，这与 PHP 完全一致——也是配置文件和 Composer 风格的引导程序所依赖的模式：

```php
<?php
// config.php: `<?php return ['host' => 'localhost', 'port' => 5432];`
$config = require 'config.php';   // $config is the returned array
echo $config['port'];             // 5432

return require __DIR__ . '/bootstrap.php';
```

如果被引入的文件没有顶级 `return`，则表达式的求值结果为 `1`，即 PHP 在成功引入时产生的整数值。被引入文件中的声明（函数、类）会像往常一样被提升到全局作用域。

被引入的文件在**调用作用域**中运行，这与 PHP 完全一致：它可以读取和写入调用者的变量，并且在被引入文件中首次赋值的变量在引入后会变得可见。

```php
<?php
$base = 10;
$v = require 'double.php';   // double.php: `<?php return $base * 2;`
echo $v;                     // 20 — the included file read the caller's $base
```

表达式位置的 include 仅支持作为 `return` 的直接值或简单的 `=` 赋值；不支持将其进一步嵌套在更大的表达式中。被引入文件的顶级代码在其自身的作用域中运行，因此它定义的顶级变量不会共享回发起引入的作用域。

`include_once` 和 `require_once` 对每个解析后的文件使用运行时保护（runtime guard）。该保护在顶级代码、函数、闭包、方法、循环和分支之间共享，因此只有当执行到达引入点时，文件才会被标记为已引入。被跳过的分支不会导致后续的 `include_once` 跳过该文件，并且重复调用或循环迭代也不会重新运行 `*_once` 文件。

来自静态解析引入目标的函数、类、接口、trait、枚举、packed-class 和 extern 声明会在名称解析和类型检查之前被发现。这使得通过加载器函数（loader functions）、分支或嵌套的引入文件包含的声明能够参与正常的符号解析，而来自引入文件的可执行顶级语句仍在其引入点运行。

对于横跨互斥的 `if` / `elseif` / `else` 分支的相同已解析常规引入目标，声明发现是路径感知（path-aware）的，因此同一个文件不会仅仅因为它出现在多个互斥的分支中就被视为重复声明。顺序的常规引入以及可通过循环重复执行的常规引入仍然会报告重复声明错误，这与 PHP 的重复声明行为一致。

通过引入发现的函数会被编译为公共分发器（public dispatchers）背后的隐藏实现。只有在运行时引入点激活了这些实现之一后，分发器才变得可调用，并且 `function_exists()` 会读取相同的标记。当同一个直接的 `if` / `elseif` / `else` 链中的互斥分支引入声明了相同函数名的不同文件时，仅当函数签名完全匹配时 elephc 才会接受该模式，然后分发给实际运行的分支所加载的实现。

目前，嵌套/组合的分支组合以及 `switch` case 尚未被视为重复函数声明的互斥情况。

类样式的声明（Class-like declarations）仍然严格：除非通过命名空间进行隔离，否则重复的类、接口、trait、枚举、packed-class 或 extern 名称仍然会报告重复声明错误。

### 路径表达式

路径可以是任何**编译时常量的字符串表达式**：

```php
<?php
require __DIR__ . '/lib/util.php';      // magic constant + concat
const BASE = __DIR__ . '/lib';
require BASE . '/util.php';             // const reference
define('PLUGIN', 'plugins/auth');
require_once PLUGIN . '/init.php';      // define() reference
require __DIR__ . '/' . 'sub' . '/' . 'x.php';  // nested concat
```

被接受的形式（可在编译时折叠）：

- 字符串字面量（`'lib/x.php'`）
- 可折叠子表达式的拼接（`.`）
- 字符串值的魔术常量（`__DIR__`、`__FILE__`、`__FUNCTION__` 等）
- 对通过 `const` / `define()` 定义的字符串常量的引用——该常量必须在 include 语句**之前**定义（顺序符合 PHP 运行时语义）
- 命名空间感知的常量引用，包括 `use const` 别名

运行时动态的路径表达式在引入解析（include resolution）期间会被拒绝。AOT 编译器在编译时只有源文件可用，因此它无法让生成的二进制文件在运行时去发现并内联新的 PHP 文件。

被拒绝的情况（编译错误）：

- 变量（`$path`）
- 函数调用（`getenv('PATH')`）
- 非常量表达式（三元运算符、动态属性访问等）

用于路径表达式的 `const` 声明遵循与 PHP 相同的命名空间规则：非限定名称首先检查 `use const`，然后是当前命名空间，最后是全局命名空间。除非字符串名称包含命名空间分隔符，否则 `define()` 会创建一个全局常量。

在函数、方法、循环和分支内部的 `const` 或 `define()` 调用在引入展开（include expansion）期间会被限制在该已解析的主体作用域内。它们不会泄露到周围的顶级引入路径解析器（include path resolver）中。

**其他限制：** 引入的文件必须以 `<?php` 开头。当前的 AOT 解析器不支持运行时动态的引入路径。

## Composer PSR-4 自动加载（静态）

编译器会读取包含入口 `.php` 文件的目录以及每个 `vendor/<vendor>/<package>/composer.json` 中的 `composer.json`。这些文件中的 PSR-4 映射会在编译时被遍历，程序引用的任何类都会通过生成的索引进行解析——这在本质上相当于 `composer dump-autoload --classmap-authoritative`，但它是在编译期间执行的。

```json
// composer.json
{
    "autoload": {
        "psr-4": {
            "App\\": "src/",
            "App\\Tests\\": "tests/"
        }
    }
}
```

```
src/Service/Greeter.php   // namespace App\Service; class Greeter
src/Models/User.php       // namespace App\Models; class User
main.php                  // new App\Service\Greeter() works without explicit require
```

自动加载阶段在名称解析之后运行，并不断迭代，直到每个被引用的类要么在程序中声明，要么通过索引被定位。索引未触及的文件不会被解析——最终只有来自入口点的传递类图（transitive class graph）才会包含在二进制文件中。

### 其他自动加载部分

编译器会读取四个 `autoload`（以及 `autoload-dev`）子部分：

| 部分 | 行为 |
|---|---|
| `psr-4` | 标准 PSR-4 映射。多个命名空间前缀按照最长匹配优先（longest-first）解析，这与 composer 的规则一致。支持空前缀 `""`（根命名空间） |
| `psr-0` | 遗留的 PSR-0 映射。同时支持带命名空间的前缀（`Vendor\\Pkg\\`）和带下划线的类前缀（`Twig_`） |
| `classmap` | 要扫描的文件或目录列表。每个 `.php` 文件都会被解析，其类/接口/trait/枚举声明会被添加到 FQN→文件的索引中。对非 PSR 代码非常有用 |
| `files` | 无论程序引用哪些类，都必须在编译时始终内联的文件列表。在自动加载阶段开始时被拼接到程序中 |
| `exclude-from-classmap` | 从 `classmap` 扫描中排除匹配文件的 Glob 模式。支持 `*`（在路径段内）、`**`（跨路径段）、`?`（单个字符）。末尾的 `/` 是目录简写，会被重写为 `<pattern>**` |

`autoload-dev` 总是与 `autoload` 合并在一起。在 AOT 模型中没有生产/测试环境的划分——两者都会贡献到同一个编译好的二进制文件中。

### class_exists / interface_exists / trait_exists / enum_exists

当使用字符串字面量类名和默认的 `$autoload = true` 进行调用时，编译器会将该字面量视为加载该类的显式需求：

```php
if (class_exists("App\\Probe", true)) {     // App\Probe is autoloaded at compile time
    $p = new App\Probe();
}
```

如果 `$autoload` 为 `false`，则不会强制在编译时加载；该调用将返回该类是否已在其他地方编译进来。在当前的 AOT 模型中，类/接口/trait/枚举名称以及可选的 `$autoload` 标志必须是字面量。`function_exists` 故意不在此列表中：PHP 不会自动加载函数，而 Composer 的 `autoload.files` 才是强制包含函数的正确工具。

### 自省辅助函数

| 函数 | 行为 |
|---|---|
| `get_declared_classes()` | 返回每个已编译类名的索引数组。首先以确定性顺序输出内部/内置名称；用户声明遵循源文件中的顺序 |
| `get_declared_interfaces()` | 与上述接口的行为相同 |
| `get_declared_traits()` | 按源文件顺序返回用户声明的 trait 名称 |
| `spl_classes()` | 返回编译器目前提供的 SPL/核心类和接口名称的索引数组（目前有 61 个条目：SPL/核心接口、可抛出类型、SPL 异常类、运行时支持 of 容器以及存储/装饰器/文件系统迭代器）。随着后续阶段提供更多 SPL 类型，该列表会不断增长 |
| `spl_object_id($obj)` | 对象的堆指针转换为 int——每个对象唯一，且在进程内稳定 |
| `spl_object_hash($obj)` | 格式化为十进制字符串的对象堆指针。PHP 返回 32 字符的十六进制字符串；我们返回十进制字符串。两者都是每个对象唯一且在进程内稳定的——仅文本格式不同 |
| `get_class($obj)` | 解析为参数的静态类型名称。在没有参数调用的方法内部，返回当前类上下文 |
| `get_parent_class($obj)` | 从 `ctx.classes[name].parent` 返回父类名称，当类没有父类时返回空字符串 |
| `class_implements($object_or_class, bool $autoload = true)` | 返回类/对象的关联 `interface => interface` 数组，包括继承的父接口。当参数指定一个接口时，返回该接口的父接口 |
| `class_parents($object_or_class, bool $autoload = true)` | 返回关联 `parent => parent` 数组，从直接父类开始，然后是祖先类 |
| `class_uses($object_or_class, bool $autoload = true)` | 返回类或 trait 声明直接使用的 trait 的关联 `trait => trait` 数组。父类的 trait 以及被这些 trait 导入的 trait 不包括在内，这与 PHP 一致 |
| `is_a($obj, "Foo")` | 当第二个参数是字符串字面量时进行编译时折叠：如果对象的静态类型等于 `Foo`、派生自 `Foo` 或将其作为接口实现，则返回 `true` |
| `is_subclass_of($obj, "Foo")` | 与 `is_a` 相同，但不包括静态类型就是 `Foo` 的情况 |
| `class_alias($original, $alias)` | 在编译时，顶级字面量调用会合成 `class $alias extends $original {}`。该别名被实现为*子类*而非真正的名称别名：`new $alias()`、`$obj instanceof $alias` 和 `$alias::CONST` 可以工作；而 `(new $original()) instanceof $alias` 会返回 `false`（在 PHP 运行时语义下它会为 `true`）。运行时动态调用形式会被拒绝，因为 elephc 无法在编译后改变类表（class table） |

`class_implements`、`class_parents` 和 `class_uses` 接受具有已知静态类类型的对象表达式，或类样式的字符串字面量名称。在当前的 AOT 模型中，可选的 `$autoload` 标志必须是字面量 bool 或 int。未编译进二进制文件的字符串名称会返回 `false`，这与 PHP 对未解析名称的返回结果一致。

### 基于闭包的自动加载（spl_autoload_register）

编译器接受 `spl_autoload_register` 的三种调用形式：

```php
// 1. Closure literal
spl_autoload_register(function ($name) {
    require_once __DIR__ . '/lib/' . $name . '.php';
});

// 2. Closure stored in a top-level variable
$loader = function ($name) {
    require_once __DIR__ . '/lib/' . $name . '.php';
};
spl_autoload_register($loader);

// 3. First-class callable referenced by function-name string
function myAutoloader($name) {
    require_once __DIR__ . '/lib/' . $name . '.php';
}
spl_autoload_register('myAutoloader');
```

在这三种情况下，主体都会针对每个候选类名进行符号化求值（evaluated symbolically）——一个典型的 PSR-0 或自定义自动加载器无需修改即可正常工作：

```php
<?php
spl_autoload_register(function ($name) {
    require_once __DIR__ . '/lib/' . str_replace('\\', '_', $name) . '.php';
});

$u = new App_User("Ada");        // loads lib/App_User.php at compile time
```

当 `autoload::run` 遇到未知类时，它会首先尝试 composer.json 的 PSR-4 索引，然后运行每个已注册的闭包，并将 `$name` 绑定到候选的 FQN。第一个产生已存在文件路径的闭包获胜。程序的其余部分永远不会看到该闭包主体——注册点在编译时被消耗并被剥离。

解析器理解 PHP 的一个特定子集，足以用于典型的自动加载器：

- 字符串字面量、`.` 拼接、魔术常量（`__DIR__`、`__FILE__`——已在解析器运行前被替换）
- 变量读写（`$path = ...; require_once $path;`）
- 条件可折叠为字面量 bool 值的 `if`/`elseif`/`else`
- 带有字面量参数的 `str_replace`、`str_starts_with`、`str_ends_with`、`strtolower`、`strtoupper`
- 带有 `%s` 占位符（以及 `%%` 字面量转义）的 `sprintf`
- `dirname`（带有可选级别）、`basename`、`realpath`（当路径无法解析时返回 `false`，与 PHP 一致）以及对应 `DIRNAME` / `BASENAME` / `EXTENSION` / `FILENAME` 的 `pathinfo($path, PATHINFO_*)`
- 编译时针对实际文件系统的 `file_exists`、`is_file`、`is_readable`、`is_dir`
- `require`、`require_once`、`include`、`include_once`（产生自动加载路径的调用）
- `return`（停止且不引入）

`spl_autoload_register` 的调用点也可以存在于顶层的 `if`、`if/else` 或 `if/elseif/else` 中，只要其条件能折叠为字面量 bool 值即可（例如 `if (true)`、`if (1)`，或者当 `PHP_OS` 是可折叠常量时的 `if (PHP_OS === 'Linux')`……）。所选的分支会在收集运行之前在编译时被内联。编译器无法决定其值的条件会使 `if` 保持原样，且其内部的注册调用会被忽略。

其他任何内容——循环、异常、`new`、方法调用、三元运算符、match、通过 `use(...)` 的捕获——都会静默拒绝该候选类的这条规则；链条会向下传递到下一条规则（或 PSR-4）。

当闭包 AST 与条目匹配时，`spl_autoload_unregister($closure)` 会移除之前注册的规则。带有字面量类名参数的 `spl_autoload_call("App\\Foo")` 会强制自动加载阶段解析 `App\Foo`，即使程序的其余部分没有引用它。

| 函数 | 行为 |
|---|---|
| `spl_autoload_register($cb, $throw = true, $prepend = false)` | 闭包字面量 → 注册为编译时规则（当 `$prepend = true` 时，该规则会前置到链条首部）。带有捕获或多个参数的闭包会被静默拒绝。无论哪种情况都返回 `true` |
| `spl_autoload_unregister($cb)` | 当闭包 AST 匹配时，移除之前注册的规则。返回 `true` |
| `spl_autoload_functions()` | 返回一个索引数组，每个已注册规则对应一个整型占位符。`count()` 和 `foreach` 反映规则的数量。这些值是规则索引（0..N-1），而不是实际的可调用对象 |
| `spl_autoload_extensions($ext = null)` | 读取或读写一个运行时可变的字符串。在没有参数或参数为字面量 `null` 时，返回当前值（默认为 `".inc,.php"`）。在使用字符串字面量参数时，写入新值并返回之前的值 |
| `spl_autoload_call($name)` | 类名字面量 → 强制该类进行编译时自动加载。变量参数 → 无操作（no-op） |
| `spl_autoload($name, $ext = null)` | 与 `spl_autoload_call` 相同 |

**限制：**

- `vendor/` 仅被扫描一级（`vendor/<vendor>/<package>/composer.json`）；不支持嵌套或非标准的 vendor 布局。
- 条件类声明（例如 `if (PHP_VERSION_ID >= 70000) { class X { ... } }`）不支持自动加载感知：该文件会被无条件引入，且内部的条件逻辑仍然像常规引入一样适用。
- 当编译器消耗了闭包赋值（`$cb = function ...`）或自动加载器函数声明（`function myAutoloader ...`）时，该源语句会**从程序中被剥离**。如果该闭包变量或函数在其他地方被引用，您将在编译时收到明确的“未定义变量 / 函数”错误。如果您需要在自动加载之外重用相同的主体，请使用单独的变量 / 函数。
- 位于函数体、方法、循环内部，或除可折叠 `if`/`else` 之外的非顶级位置的 `spl_autoload_register` 调用将被忽略。只有顶级（或通过可折叠 if 实现的顶级）调用点会贡献规则。
- 无论在程序的何处调用，`spl_autoload_functions()` 都返回相同的值：在 AOT 模型中，规则链在编译时就已经最终确定，因此没有时间上的“注册前/注册后”的区别。
- `spl_autoload_extensions()` 的 setter 调用必须使用字符串字面量。动态字符串 setter 将被拒绝，直到运行时存储了具有引用计数所有权（refcount ownership）的值。
- 在 AOT 编译器中，真实的运行时自动加载（在二进制文件启动后加载新代码）是不可能的。

## 常量
```php
<?php
const MAX_RETRIES = 3;
define("PI", 3.14159);
```
`const` 声明是具有命名空间感知的，并且在编译时进行解析。除非 `define()` 的字符串名称包含显式的命名空间分隔符，否则它们是全局的。当用于引入路径解析时，值必须是字面量或编译时可折叠的字符串拼接。

## 预定义常量

| 常量 | 类型 | 值 |
|---|---|---|
| `PHP_EOL` | string | `"\n"` |
| `PHP_OS` | string | 在 macOS 目标平台上为 `"Darwin"`，在 Linux 目标平台上为 `"Linux"` |
| `DIRECTORY_SEPARATOR` | string | `"/"` |
| `STDIN` | resource | 标准输入流 |
| `STDOUT` | resource | 标准输出流 |
| `STDERR` | resource | 标准错误流 |
| `PATHINFO_DIRNAME` | int | 1 |
| `PATHINFO_BASENAME` | int | 2 |
| `PATHINFO_EXTENSION` | int | 4 |
| `PATHINFO_FILENAME` | int | 8 |
| `PATHINFO_ALL` | int | 15 |
| `FNM_NOESCAPE` | int | 特定目标平台的 libc/PHP 值 |
| `FNM_PATHNAME` | int | 特定目标平台的 libc/PHP 值 |
| `FNM_PERIOD` | int | 4 |
| `FNM_CASEFOLD` | int | 16 |

## 超全局变量

| 变量 | 类型 | 描述 |
|---|---|---|
| `$argc` | `int` | CLI 参数数量 |
| `$argv` | `array(string)` | CLI 参数值 |

## 注释
```php
<?php
// Single-line comment
/* Multi-line comment */
```
