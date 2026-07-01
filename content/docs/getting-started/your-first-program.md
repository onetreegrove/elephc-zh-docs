---
title: "第一个程序"
description: "使用 elephc 编写、编译并运行你的第一个 PHP 程序。"
sidebar:
  order: 2
---

## Hello, World

创建一个名为 `hello.php` 的文件：

```php
<?php
echo "Hello, World!\n";
```

编译它：

```bash
elephc hello.php
```

这会在同一目录下生成一个名为 `hello` 的原生二进制文件（native binary）。运行它：

```bash
./hello
```

```
Hello, World!
```

就是这样 —— 一个独立的原生二进制文件，无需 PHP 解释器。

## 稍微复杂一点的示例

创建 `greet.php`：

```php
<?php
if ($argc < 2) {
    echo "Usage: ./greet <name>\n";
    exit(1);
}

$name = $argv[1];
echo "Hello, " . strtoupper($name) . "!\n";
```

编译并运行：

```bash
elephc greet.php
./greet elephc
```

```
Hello, ELEPHC!
```

该程序通过 `$argc` 和 `$argv` 读取命令行参数，与标准 PHP 用法完全一致。

## FizzBuzz

一个经典示例，用于展示变量、循环和条件判断：

```php
<?php
for ($i = 1; $i <= 100; $i++) {
    if ($i % 15 == 0) {
        echo "FizzBuzz\n";
    } elseif ($i % 3 == 0) {
        echo "Fizz\n";
    } elseif ($i % 5 == 0) {
        echo "Buzz\n";
    } else {
        echo $i . "\n";
    }
}
```

```bash
elephc fizzbuzz.php
./fizzbuzz
```

## 底层发生了什么

当你运行 `elephc hello.php` 时，编译器会依次执行以下步骤：

1. **词法分析（Lex）**：将源码拆分为 token
2. **语法分析（Parse）**：将 token 构建为 AST（抽象语法树）
3. **降级（Lower）**：处理文件级魔术常量，并根据 `--define` 应用 `ifdef` 分支
4. **构建（Build）**：从 Composer 元数据及受支持的 `spl_autoload_register()` 规则中生成编译期自动加载注册表
5. **解析（Resolve）**：解析 `include` / `require` 文件，预扫描可静态解析的 include 声明，折叠编译期 include 路径，并降级 `*_once` 运行时守卫
6. **解析（Resolve）**：解析命名空间、导入及全限定名
7. **执行（Run）**：对引用的类型符号进行静态自动加载插入
8. **折叠（Fold）**：对已静态已知的常量表达式进行常量折叠
9. **类型检查（Type-check）**：对程序进行类型检查并收集非致命警告
10. **优化（Optimize）**：通过传播、剪枝、规范化及死代码消除对已检查的 AST 控制流进行优化
11. **降级（Lower）**：将已检查的 AST 降级为经过验证的 EIR
12. **生成（Generate）**：从 EIR 生成目标平台汇编代码
13. **准备（Prepare）**：准备或复用已缓存的运行时对象
14. **汇编并链接（Assemble and link）**：将 `.s` / `.o` 文件链接为原生可执行文件

中间产生的 `.s` 和 `.o` 文件会被自动清理，最终只留下一个单独的可执行文件。

## 实用的检查标志

如果你想更深入地检查编译过程，以下标志是一个好的起点：

```bash
# Print per-phase compiler timings to stderr
elephc --timings hello.php

# Emit assembly only, plus a sidecar source-map file
elephc --emit-asm --source-map hello.php
```

`--timings` 会报告各阶段耗时，包括：词法分析、语法分析、早期优化、类型检查、常量传播、后检查剪枝、控制流规范化、死代码消除、运行时缓存准备、代码生成、汇编及链接。

`--source-map` 会在 `hello.s` 旁边生成一个 `hello.map` JSON 文件。该映射文件记录了输出的汇编代码行与 PHP 源码行列号之间的对应关系。

如果你想将 elephc 与 PHP 解释器及等效的 C 代码进行对比，请参阅[基准测试套件](https://github.com/illegalstudio/elephc/blob/main/benchmarks/README.md)。

## 下一步

- 浏览 [PHP 语法参考](../php/types.md)，了解所支持的语法特性
- 查看[示例程序](https://github.com/illegalstudio/elephc/tree/main/examples)，获取更多实例
- 如果你需要 FFI、游戏循环或原始内存访问，请参阅 [Beyond PHP](../beyond-php/pointers.md)
