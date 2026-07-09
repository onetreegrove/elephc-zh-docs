---
title: "魔术常量"
description: "PHP 魔术常量（__DIR__、__FILE__、__LINE__、__FUNCTION__、__CLASS__、__METHOD__、__NAMESPACE__、__TRAIT__）在编译时被解析为普通的字符串或整型字面量。"
sidebar:
  order: 14
---

PHP 定义了一组*魔术常量*，其值根据它们在源码中出现的位置而变化。elephc 支持所有这八个魔术常量，并在编译时将它们降解（lower）为普通的字符串或整型字面量。在所有常见情况下，它们的行为与 PHP 完全一致。

| 常量 | 类型 | 展开结果 |
|---|---|---|
| `__DIR__` | string | 包含该源文件目录的规范绝对路径 |
| `__FILE__` | string | 源文件的规范绝对路径 |
| `__LINE__` | int | 该常量在源文件中的行号 |
| `__FUNCTION__` | string | 外层函数的完全限定名称（FQN）、方法内部未限定的方法名、闭包内部的 PHP 样式闭包标记，如果在任何函数外部则为空字符串 |
| `__CLASS__` | string | 外层类的完全限定名称（FQN）、引入 trait 成员的类（对于 trait 成员），如果在任何类外部则为空字符串 |
| `__METHOD__` | string | 类方法内部的 `"Class::method"`、trait 方法内部的 `"Trait::method"`、自由函数中的 FQN 函数名、闭包内部的 PHP 样式闭包标记，如果在任何函数外部则为空字符串 |
| `__NAMESPACE__` | string | 当前命名空间，如果在任何命名空间外部则为空字符串 |
| `__TRAIT__` | string | 外层 trait 的完全限定名称（FQN），如果不在任何 trait 内部则为空字符串 |

所有这八个名称都是不区分大小写匹配的，这与 PHP 一致（例如，`__dir__` 和 `__DIR__` 代表同一个魔术常量）。

## 替换发生的时机

每个魔术常量都会在**类型检查和代码生成运行之前**被降解（lowered）为普通的字面量，以便与常量折叠（constant folding）和其他下游 Pass 正确交互。

- 在解析（parse）阶段，`__LINE__` 会被替换为 `IntLiteral(span.line)`。
- 在解析完每个源文件（包括任何 `include` 或 `require` 的文件）后，`__FILE__` 和 `__DIR__` 会根据该文件的规范路径进行替换。
- `__FUNCTION__`、`__CLASS__`、`__METHOD__`、`__NAMESPACE__` 和 `__TRAIT__` 会在每个源文件被内联之前针对该文件进行替换，因此被引入的文件能保留它们自己的命名空间和词法作用域。
- 从 trait 导入的 `__CLASS__` 在该 trait 被扁平化（flattened）到具体类中时会被重新绑定。`__METHOD__` 和 `__TRAIT__` 则保留 trait 声明时的身份，这与 PHP 的行为一致。

由于替换发生在优化器的常量折叠 Pass 之前，像 `__DIR__ . '/file.php'` 这样的表达式会在编译时折叠为单个字符串字面量：

```php
echo __DIR__ . '/lib/util.php';
// becomes (at compile time):
//   echo '/path/to/dir/lib/util.php';
```

## 示例

### 文件和目录

```php
<?php
echo __FILE__, "\n";  // "/abs/path/main.php"
echo __DIR__, "\n";   // "/abs/path"
echo __LINE__, "\n";  // "3"
```

### 函数和方法

```php
<?php
namespace App;

function greet() {
    echo __FUNCTION__;     // "App\greet"
    echo __METHOD__;       // "App\greet"
}

class Greeter {
    public function hello() {
        echo __CLASS__;    // "App\Greeter"
        echo __METHOD__;   // "App\Greeter::hello"
        echo __FUNCTION__; // "hello"
    }
}
```

### 命名空间和 trait

```php
<?php
namespace App\Util;

echo __NAMESPACE__;        // "App\Util"

trait Reportable {
    public function report() {
        echo __CLASS__;    // class that uses the trait, e.g. "App\Util\Task"
        echo __METHOD__;   // "App\Util\Reportable::report"
        echo __TRAIT__;    // "App\Util\Reportable"
    }
}
```

### 闭包

```php
<?php
$f = function() {
    echo __FUNCTION__;     // "{closure:/abs/path/main.php:2}"
};
$f();
```

在方法内部，闭包使用该方法作为它们的上下文：

```php
<?php
class Greeter {
    public function hello() {
        $f = function() {
            echo __METHOD__; // "{closure:Greeter::hello():4}"
        };
        $f();
    }
}
```

## 引入与 `__FILE__` / `__DIR__`

当一个文件被 `include` 或 `require` 时，该文件内部的魔术常量会根据**该文件自身**的文件路径、命名空间和词法作用域进行展开——而不是根据引入它的文件或函数。这与 PHP 的行为一致。

```php
// /app/main.php
<?php
require __DIR__ . '/lib/util.php';

// /app/lib/util.php
<?php
namespace App\Lib;

echo __FILE__;             // "/app/lib/util.php" (not /app/main.php)
echo __DIR__;              // "/app/lib"          (not /app)
echo __NAMESPACE__;         // "App\Lib"
```

`__DIR__`、`__FILE__` 以及其他字符串值的魔术常量也可以在 `include` / `require` 路径表达式中使用（以及拼接、字符串字面量和通过 `const` / `define()` 定义的字符串常量）。有关支持的路径表达式的完整列表，请参见[命名空间与文件引入](namespaces.md)。
