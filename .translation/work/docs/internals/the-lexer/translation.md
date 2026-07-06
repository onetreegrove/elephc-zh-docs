---
title: "词法分析器"
description: "原始文本如何转换为 token。"
sidebar:
  order: 3
---

**源码位置：** `src/lexer/` — `mod.rs`、`scan.rs`、`cursor.rs`、`token.rs`、`literals.rs`

词法分析器（也称 tokenizer 或 scanner）是编译的第一个阶段。它接收原始源代码文本，将其分解为 **token**——语言中最小的有意义单元。

## 什么是 token？

token 是经过分类的文本片段。词法分析器不关心结构（那是[解析器](the-parser.md)的工作）——它只识别每段文本*是什么*：

```php
<?php $x = 42 + $y;
```

```
OpenTag         "<?php"
Variable("x")   "$x"
Assign           "="
IntLiteral(42)   "42"
Plus             "+"
Variable("y")   "$y"
Semicolon        ";"
Eof
```

部分 token 携带数据（变量名、数值），其余则只是标记符号（分号、加号）。

## 游标（Cursor）

**文件：** `src/lexer/cursor.rs`

游标是最底层的组件。它逐字符遍历源代码文本，追踪当前位置：

```rust
pub struct Cursor<'a> {
    bytes: &'a [u8],    // the source text as bytes
    pos: usize,         // current byte offset
    line: usize,        // current line number (1-indexed)
    col: usize,         // current column (1-indexed)
}
```

它提供三个核心操作：

| 方法 | 说明 |
|---|---|
| `peek()` | 查看当前字符，不移动位置 |
| `advance()` | 移动到下一个字符，返回刚经过的字符 |
| `remaining()` | 以字符串切片形式获取剩余源代码 |

游标会自动追踪行号和列号——遇到 `\n` 时，`line` 加一，`col` 重置为 1。这些信息存储在 `Span` 中并附加到每个 token，从而使错误信息能够指出"第 5 行第 12 列出现错误"。

## 扫描器（Scanner）

**文件：** `src/lexer/scan.rs`

扫描器是主循环。它使用游标读取字符，并决定每段字符序列代表哪种 token：

```rust
pub fn scan_tokens(source: &str) -> Result<Vec<(Token, Span)>, CompileError> {
    // 1. Skip whitespace
    // 2. Must start with <?php
    // 3. Loop: skip whitespace, look at next char, produce a token
    // 4. When EOF reached, push Eof token and return
}
```

编译器其他部分使用的词法分析公共入口点是 `src/lexer/mod.rs` 中的 `tokenize()`，它包装了 `scan_tokens()` 并返回最终的 `Vec<(Token, Span)>`。

### 扫描算法

对于每个 token，扫描器查看当前字符并进行判断：

1. **`"`** → 双引号字符串的起始位置。可能包含插值（`$var`）。委托给 `literals::scan_double_string_interpolated()` 处理。

2. **`'`** → 单引号字符串的起始位置。不支持插值，仅支持 `\\` 和 `\'` 转义。

3. **数字** → 数字字面量的起始位置。`0x` / `0X` 表示十六进制整数字面量；`0o` / `0O` 表示显式八进制（PHP 8.1+，数字范围 `0`–`7`）；`0b` / `0B` 表示二进制（PHP 5.4+，数字范围 `0`–`1`）。否则读取十进制数字，`.` 后跟数字则提升为浮点数，并支持 `e` / `E` 科学计数法。以 `0` 开头且未成为浮点数的整数字面量为 PHP 遗留八进制字面量，因此 `0777` 和 `0_777` 均生成十进制 `511`，而 `078` 则被拒绝。数字之间的单个 `_` 作为视觉分隔符（PHP 7.4+），在解析前会被去除——分隔符不得出现在开头、结尾或连续两个。字面量之后，任何紧跟的字母数字字符或 `_` 都将被拒绝（可捕获 `0o78`、`078`、`0xfg`、`0b12`、`1_`、`1__0` 等情况）。

4. **`$`** → 变量的起始位置。读取变量名（字母、数字、下划线）。

5. **字母或 `_`** → 标识符或关键字的起始位置。读取完整单词，然后检查它是关键字（`if`、`while`、`echo`、`function` 等）还是普通标识符（函数名）。

6. **运算符字符**（`+`、`-`、`*`、`/`、`=`、`<`、`>`、`!`、`.`、`%`、`&`、`|`、`^`、`~`、`?`、`@`）→ 向前查看以处理多字符运算符（`==`、`===`、`!=`、`!==`、`<=`、`>=`、`<=>`、`<<`、`>>`、`&&`、`||`、`**`、`++`、`--`、`?->`、`??`、`??=`、`|>`、`+=`、`-=`、`*=`、`**=`、`/=`、`.=`、`%=`、`&=`、`|=`、`^=`、`<<=`、`>>=`）。注意 `<` 可能引出 `<=`、`<=>`、`<<`、`<<=` 或 `<<<`（heredoc/nowdoc——参见[下文](#heredoc-和-nowdoc)）。

7. **结构字符**（`(`、`)`、`{`、`}`、`[`、`]`、`;`、`,`、`?`、`:`、`\`）→ 单字符 token。注意 `?` 后跟另一个 `?` 生成 `??`，`??` 后跟 `=` 生成 `??=`。`\` 单独 token 化，以便解析器构建限定和完全限定的命名空间名称。

### 空白字符与注释

在每个 token 之前，扫描器会跳过：

- **空白字符**：空格、制表符、换行符
- **行注释**：`//` 直到行尾
- **块注释**：`/*` 到 `*/`

这些内容被完全丢弃——不产生任何 token。

## Token 类型

**文件：** `src/lexer/token.rs`

elephc 识别的完整 token 集合：

`Token` 枚举的完整变体：

```text
OpenTag  Semicolon  LParen  RParen  LBrace  RBrace  StringLiteral  IntLiteral
FloatLiteral  Variable  Identifier  Echo  If  IfDef  Else  ElseIf
While  For  Break  Continue  Function  Return  True  False
Null  Do  Foreach  As  Try  Catch  Finally  Throw
Extends  Implements  Interface  Abstract  Final  Inf  Nan  PhpIntMax
PhpIntMin  PhpFloatMax  MPi  ME  MSqrt2  MPi2  MPi4  MLog2e
MLog10e  PhpFloatMin  PhpFloatEpsilon  Print  Switch  Case  Default  Match
Include  IncludeOnce  Require  RequireOnce  Stdin  Stdout  Stderr  Fn
Use  Namespace  Const  Global  Static  Self_  Trait  Parent
InsteadOf  InstanceOf  PhpEol  PhpOs  DirectorySeparator  DunderDir  DunderFile  DunderLine  DunderFunction
DunderClass  DunderMethod  DunderNamespace  DunderTrait  Class  Enum  New  Public
Protected  Private  ReadOnly  This  Extern  Packed  Yield  AttrOpen  Assign  DoubleArrow
Plus  Minus  Star  StarStar  Slash  Percent  Dot  Comma
Backslash  LBracket  RBracket  Question  Colon  PlusAssign  MinusAssign  StarAssign
StarStarAssign  SlashAssign  DotAssign  PercentAssign  AmpAssign  PipeAssign  CaretAssign  LessLessAssign
GreaterGreaterAssign  PlusPlus  MinusMinus  AndAnd  OrOr  And  Or  Xor
Bang  EqualEqual  EqualEqualEqual  NotEqual  NotEqualEqual  Less  Greater  LessEqual
GreaterEqual  Spaceship  Ampersand  Pipe  Caret  Tilde  At  LessLess  GreaterGreater
Arrow  QuestionArrow  DoubleColon  QuestionQuestion  QuestionQuestionAssign  PipeArrow  Ellipsis  Eof
```

### 字面量

| Token | 示例 | 携带数据 |
|---|---|---|
| `IntLiteral` | `42`、`0xFF`、`0755`、`0o755`、`0b1010`、`1_000_000` | `i64` 值（十进制、十六进制 `0x`/`0X`、以 `0` 开头的遗留八进制、显式八进制 `0o`/`0O`、二进制 `0b`/`0B`；数字间允许 `_`） |
| `FloatLiteral` | `3.14`、`.5`、`1e3`、`1_000.5`、`1e1_0` | `f64` 值（尾数或指数的数字间允许 `_`） |
| `StringLiteral` | `"hello"`、`'world'` | `String` 内容（转义已解析） |

### 变量与标识符

| Token | 示例 | 携带数据 |
|---|---|---|
| `Variable` | `$x`、`$name`、`$argc` | 不含 `$` 的名称 |
| `Identifier` | `strlen`、`my_func` | 名称本身 |

### 类相关关键字与特殊名称

| Token | 示例 | 携带数据 |
|---|---|---|
| `This` | `$this` | 类方法内部的自引用 |

### 关键字

```
echo  if  else  elseif  while  do  for  foreach  as
break  continue  function  return  include  require
include_once  require_once  true  false  null  print
switch  case  default  match  try  catch  finally  throw  yield  fn  use  namespace  ifdef  extern  const
global  static  self  class  abstract  final  interface  trait  extends  implements  new
public  protected  private  readonly  parent  insteadof  instanceof  enum  packed
```

每个关键字都是一个独立的 token 变体（例如 `Token::If`、`Token::While`、`Token::Switch`）。多词关键字拼写使用驼峰命名变体，如 `Token::IncludeOnce` 和 `Token::RequireOnce`；`readonly` 对应 `Token::ReadOnly`。

### 常量（关键字 token）

```
INF  NAN  PHP_INT_MAX  PHP_INT_MIN  PHP_FLOAT_MAX  PHP_FLOAT_MIN  PHP_FLOAT_EPSILON
M_PI  M_E  M_SQRT2  M_PI_2  M_PI_4  M_LOG2E  M_LOG10E
PHP_EOL  PHP_OS  DIRECTORY_SEPARATOR
STDIN  STDOUT  STDERR
```

这些由词法分析器识别为独立 token，而非标识符。其变体包括 `Token::Inf`、`Token::Nan`、`Token::PhpIntMax`、`Token::PhpFloatEpsilon` 和 `Token::DirectorySeparator` 等形式。

### 魔术常量

```
__DIR__  __FILE__  __LINE__  __FUNCTION__
__CLASS__  __METHOD__  __NAMESPACE__  __TRAIT__
```

PHP 魔术常量被 token 化为 `Token::DunderDir`、`Token::DunderFile`、`Token::DunderLine`、`Token::DunderFunction`、`Token::DunderClass`、`Token::DunderMethod`、`Token::DunderNamespace` 和 `Token::DunderTrait`。它们以不区分大小写的方式匹配，因此 `__dir__`、`__DIR__` 和 `__DiR__` 均产生相同的 token。

### 运算符

```
+  -  *  **  /  %  .
=  =>  +=  -=  *=  **=  /=  .=  %=  &=  |=  ^=  <<=  >>=  ??=
==  ===  !=  !==  <  >  <=  >=  <=>
&&  ||  and  or  xor  !
instanceof
&  |  ^  ~  @  <<  >>
??  ->  ::
|>
++  --
...
```

### 结构符号

```
(  )  {  }  [  ]  ;  ,  ?  :  \
```

### 特殊 token

| Token | 含义 |
|---|---|
| `OpenTag` | `<?php` — 每个文件开头必须有此标记 |
| `AttrOpen` | `#[` — 开始一个 PHP 8 属性组；单独的 `#` 为行注释 |
| `Eof` | 文件结束——通知解析器停止 |

## 字符串插值

双引号字符串可以包含变量：

```php
"Hello, $name!"
```

词法分析器不会为此产生单个字符串 token，而是发出一个序列供解析器组合：

```
StringLiteral("Hello, ")
Dot                        (implicit concatenation)
Variable("name")
Dot
StringLiteral("!")
```

这由 `literals::scan_double_string_interpolated()` 处理，它逐字符遍历字符串，每当遇到 `$` 后跟有效标识符时便进行分割。

## 转义序列

在双引号字符串中，词法分析器在扫描期间解析转义序列：

| 转义 | 含义 |
|---|---|
| `\n` | 换行（0x0A） |
| `\t` | 制表符（0x09） |
| `\r` | 回车（0x0D） |
| `\\` | 字面反斜杠 |
| `\"` | 字面双引号 |
| `\$` | 字面美元符号 |
| `\0` | 空字节（0x00） |
| `\e` | 转义符（0x1B） |

单引号字符串仅支持 `\\` 和 `\'`——其他所有内容均为字面量。

## Heredoc 和 Nowdoc

**文件：** `src/lexer/literals.rs` — `scan_heredoc()`

Heredoc 和 nowdoc 是 PHP 的多行字符串语法。词法分析器识别 `<<<` 后跟标签的形式：

```php
$s = <<<EOT
Hello, $name!
Multiple lines here.
EOT;
```

结束标签必须单独出现在一行（可以有缩进）。词法分析器处理三种形式：

- **Heredoc**（`<<<LABEL`）：处理转义序列（与双引号字符串类似），生成 `StringLiteral` token
- **带引号的 heredoc**（`<<<" LABEL"`）：行为与不带引号的 heredoc 相同
- **Nowdoc**（`<<<'LABEL'`）：不进行转义处理（与单引号字符串类似）

扫描器读取开始标签行与结束标签之间的所有内容，去除公共的前导缩进（与结束标签的缩进对齐），并返回单个 `StringLiteral` token。heredoc 字符串中的字符串插值处理方式与双引号字符串相同。

注意，`<<<` 与 `<<`（左移）的区分方式是检查第三个字符是否也是 `<`。

## 错误处理

如果扫描器遇到无法 token 化的内容——例如未终止的字符串或无效字符——它会返回一个携带精确位置（行号和列号）的 `CompileError`。错误信息由 `src/errors/report.rs` 格式化。

## 连接方式

词法分析器的输出——`Vec<(Token, Span)>`——是[解析器](the-parser.md)的输入。每个 token 都携带其在源代码中的位置，以便后续阶段能够将错误精确指向对应的行和列。

```
Source text → Lexer → [(Token, Span), (Token, Span), ...] → Parser
```
