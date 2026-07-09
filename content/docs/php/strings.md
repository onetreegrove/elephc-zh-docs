---
title: "字符串"
description: "字符串类型、转义序列、变量解析、heredoc/nowdoc 以及内置字符串函数。"
sidebar:
  order: 5
---

## 双引号字符串

支持转义序列：

```php
<?php
echo "Hello\n";      // newline
echo "Tab\there";    // tab
echo "Return\r";     // carriage return
echo "Vert\v";       // vertical tab
echo "Esc\e";        // escape byte
echo "Form\f";       // form feed
echo "Quote: \"";    // escaped quote
echo "Backslash: \\"; // backslash
echo "\x41";         // hex byte: A
echo "\101";         // octal byte: A
echo "\u{1F600}";    // Unicode codepoint: 😀
```

## 单引号字符串

除 `\\` 和 `\'` 外，不支持其他转义序列：

```php
<?php
echo 'Hello\n';      // prints: Hello\n (literal)
echo 'It\'s here';   // prints: It's here
```

## 字符串变量解析

双引号字符串和 heredoc 支持变量解析。简单和复杂两种语法均已被支持：

```php
<?php
$name = "World";
echo "Hello, $name\n";          // simple: $variable

$user = ["name" => "Ada", "age" => 36];
echo "Name: $user[name]\n";     // simple: one $var[offset] (bareword key, no quotes)

class Point { public int $x = 1; }
$p = new Point();
echo "x = $p->x\n";             // simple: one $var->prop

echo "Sum: {$user['age']}\n";   // complex: {$expr} allows full expressions
```

变量和标识符名称可以包含非 ASCII 字母，这与 PHP 一致：

```php
<?php
$café = "espresso";
echo "Order: $café\n";
```

## Heredoc 字符串

支持转义处理的多行字符串（类似于双引号字符串）：

```php
<?php
echo <<<EOT
Hello World
This is line 2
EOT;
```

当结束标记位于行首且后跟任何非标识符字符时，该 heredoc 即告结束。因此，heredoc 可以作为表达式使用 —— 例如作为函数参数或用于字符串拼接：

```php
<?php
echo strtoupper(<<<EOT
hello
EOT) . "!";
```

支持 PHP 7.3+ 的灵活（缩进）heredoc：结束标记可以缩进，且该缩进量会从主体的每一行中去除。

```php
<?php
function describe(): string {
    return <<<EOT
        line one
        line two
        EOT;   // -> "line one\nline two"
}
```

## Nowdoc 字符串

不支持转义处理的多行字符串（类似于单引号字符串）：

```php
<?php
echo <<<'EOT'
Hello World
No escapes: \n \t stay literal
EOT;
```

## 字符串索引

```php
<?php
$s = "hello";
echo $s[1];    // e
echo $s[-1];   // o
echo "[" . $s[99] . "]";  // []
```

只读。负数索引从末尾开始计算。越界访问会返回空字符串。

## 内置字符串函数

| 函数 | 函数签名 | 描述 |
|---|---|---|
| `strlen()` | `strlen($str): int` | 返回字符串长度 |
| `substr()` | `substr($str, $start [, $len]): string` | 提取子字符串 |
| `strpos()` | `strpos($hay, $needle): int\|false` | 查找首次出现的位置。如果未找到，则返回 `false` |
| `strrpos()` | `strrpos($hay, $needle): int\|false` | 查找最后一次出现的位置。如果未找到，则返回 `false` |
| `strstr()` | `strstr($hay, $needle): string` | 查找首次出现的位置并返回剩余部分 |
| `str_replace()` | `str_replace($search, $replace, $subject): string` | 替换所有出现的位置 |
| `str_ireplace()` | `str_ireplace($search, $replace, $subject): string` | 大小写不敏感的替换 |
| `substr_replace()` | `substr_replace($str, $repl, $start [, $len]): string` | 替换子字符串 |
| `strtolower()` | `strtolower($str): string` | 转换为小写 |
| `strtoupper()` | `strtoupper($str): string` | 转换为大写 |
| `ucfirst()` | `ucfirst($str): string` | 将首字母转换为大写 |
| `lcfirst()` | `lcfirst($str): string` | 将首字母转换为小写 |
| `ucwords()` | `ucwords($str): string` | 将每个单词的首字母转换为大写 |
| `trim()` | `trim($str [, $chars]): string` | 去除两端的默认字符掩码（`" \n\r\t\v\f\0"`）或指定字符 |
| `ltrim()` | `ltrim($str [, $chars]): string` | 去除左侧的默认字符掩码（`" \n\r\t\v\f\0"`）或指定字符 |
| `rtrim()` | `rtrim($str [, $chars]): string` | 去除右侧的默认字符掩码（`" \n\r\t\v\f\0"`）或指定字符 |
| `chop()` | `chop($str [, $chars]): string` | `rtrim()` 的别名 |
| `str_repeat()` | `str_repeat($str, $times): string` | 重复字符串 |
| `str_pad()` | `str_pad($str, $len [, $pad, $type]): string` | 填充字符串到指定长度 |
| `str_split()` | `str_split($str [, $len]): array` | 将字符串分割为指定长度的块 |
| `strrev()` | `strrev($str): string` | 反转字符串 |
| `grapheme_strrev()` | `grapheme_strrev($str): string\|false` | 按字形集群（grapheme clusters）反转 UTF-8 字符串，保留嵌入的 NUL 字节，并保持组合标记、emoji 修饰符和 ZWJ 序列与其基础集群在一起。如果 UTF-8 格式错误，则返回 `false`。 |
| `strcmp()` | `strcmp($a, $b): int` | 二进制安全字符串比较 |
| `strcasecmp()` | `strcasecmp($a, $b): int` | 大小写不敏感的比较 |
| `str_contains()` | `str_contains($hay, $needle): bool` | 检查字符串是否包含子字符串 |
| `str_starts_with()` | `str_starts_with($hay, $prefix): bool` | 检查前缀 |
| `str_ends_with()` | `str_ends_with($hay, $suffix): bool` | 检查后缀 |
| `ord()` | `ord($char): int` | 第一个字符的 ASCII 值 |
| `chr()` | `chr($code): string` | 从 ASCII 码获取字符 |
| `explode()` | `explode($delim, $str): array` | 将字符串分割为数组 |
| `implode()` | `implode($glue, $arr): string` | 将数组连接为字符串 |
| `number_format()` | `number_format($n [, $dec [, $dec_point, $thou_sep]]): string` | 格式化数字 |
| `sprintf()` | `sprintf($fmt, ...): string` | 格式化字符串 (%s, %d, %f, %x, %e, %g, %o, %c, %%) |
| `printf()` | `printf($fmt, ...): int` | 格式化并输出 |
| `vsprintf()` | `vsprintf($fmt, array $values): string` | 类似于 `sprintf()`，但参数是以数组形式提供。每个元素都成为一个格式化参数 —— int/float/bool/string，包括混合数组的元素。 |
| `vprintf()` | `vprintf($fmt, array $values): int` | 类似于 `printf()`，但参数是以数组形式提供；打印结果并返回字节数。 |
| `sscanf()` | `sscanf($str, $fmt): array` | 根据指定格式（%d, %f, %s, %%）解析字符串。匹配的字段将作为子字符串返回（例如 `%f` 产生 `"3.14"`），这与现有的 `%d` 行为一致。 |
| `addslashes()` | `addslashes($str): string` | 转义引号和反斜杠 |
| `stripslashes()` | `stripslashes($str): string` | 移除转义反斜杠 |
| `nl2br()` | `nl2br($str): string` | 在换行符前插入 `<br />` |
| `wordwrap()` | `wordwrap($str [, $width [, $break [, $cut]]]): string` | 在单词边界处折行文本；设置 `$cut` 以强制折断超长单词 |
| `bin2hex()` | `bin2hex($str): string` | 将二进制转换为十六进制 |
| `hex2bin()` | `hex2bin($str): string` | 将十六进制转换为二进制 |
| `long2ip()` | `long2ip($ip): string` | 将 32 位整数格式化为点分十进制的 IPv4 地址 |
| `ip2long()` | `ip2long($ip): int\|false` | 将点分十进制的 IPv4 字符串解析为整数，若无效则返回 `false` |
| `inet_pton()` | `inet_pton($ip): string\|false` | 将点分十进制的 IPv4 地址打包为 4 字节的二进制字符串，若无效则返回 `false` |
| `inet_ntop()` | `inet_ntop($binary): string\|false` | 将 4 字节的 IPv4 二进制字符串渲染为点分十进制地址，若长度不为 4 则返回 `false` |
| `md5()` | `md5($str, $binary = false): string` | MD5 哈希 —— 默认返回 32 字符的十六进制小写字符串，当 `$binary` 为 `true` 时返回原始的 16 字节摘要 |
| `sha1()` | `sha1($str, $binary = false): string` | SHA1 哈希 —— 默认返回 40 字符的十六进制小写字符串，当 `$binary` 为 `true` 时返回原始的 20 字节摘要 |
| `crc32()` | `crc32($str): int` | CRC-32 校验和（标准 zlib/PHP 多项式），以非负 32 位整数形式返回 |
| `hash()` | `hash($algo, $data, $binary = false): string` | 使用指定算法（md5、sha1、sha2 家族、sha3 家族、ripemd、crc32/crc32b 等）对 `$data` 进行哈希。默认返回十六进制小写字符串，当 `$binary` 为 `true` 时返回原始的字节摘要。未知算法将抛出 `\ValueError`。 |
| `hash_hmac()` | `hash_hmac($algo, $data, $key, $binary = false): string` | 使用指定的加密算法，在 `$key` 密钥下对 `$data` 进行密钥哈希消息鉴别码（HMAC）。默认返回十六进制小写字符串，当 `$binary` 为 `true` 时返回原始的字节摘要。未知的算法或非加密校验和（crc32/adler/fnv/joaat）将抛出 `\ValueError`。 |
| `hash_file()` | `hash_file($algo, $filename, $binary = false): string\|false` | 使用指定算法哈希文件内容；返回字节摘要（默认为十六进制，当 `$binary` 为真时为原始字节），若无法读取文件则返回 `false`。 |
| `hash_equals()` | `hash_equals($known, $user): bool` | 时序安全的字符串比较 —— 对等长字符串进行常数时间比较，在长度不匹配时立即返回 `false`。 |
| `hash_algos()` | `hash_algos(): array` | 返回支持的哈希算法名称列表。 |
| `hash_init()` | `hash_init($algo): HashContext` | 开启一个增量哈希上下文。未知算法将抛出 `\ValueError`。（不支持 `HASH_HMAC` 标志形式 —— 请使用 `hash_hmac()`。） |
| `hash_update()` | `hash_update($context, $data): bool` | 向增量哈希上下文中填充数据。 |
| `hash_final()` | `hash_final($context, $binary = false): string` | 结束哈希上下文并返回摘要（默认为十六进制，当 `$binary` 为真时为原始字节）。 |
| `hash_copy()` | `hash_copy($context): HashContext` | 克隆增量哈希上下文，以便原上下文和副本可以分叉使用。 |
| `htmlspecialchars()` | `htmlspecialchars($str): string` | 转义 HTML 特殊字符 |
| `htmlentities()` | `htmlentities($str): string` | htmlspecialchars 的别名 |
| `html_entity_decode()` | `html_entity_decode($str): string` | 解码 HTML 实体 |
| `urlencode()` | `urlencode($str): string` | URL 编码（空格转为 +） |
| `urldecode()` | `urldecode($str): string` | URL 解码 |
| `rawurlencode()` | `rawurlencode($str): string` | URL 编码（空格转为 %20） |
| `rawurldecode()` | `rawurldecode($str): string` | URL 解码（RFC 3986） |
| `base64_encode()` | `base64_encode($str): string` | Base64 编码 |
| `base64_decode()` | `base64_decode($str): string` | Base64 解码 |
| `gzcompress()` | `gzcompress(string $data, int $level = -1): string` | 使用 zlib（系统 `libz`）压缩字符串；`$level` 默认为 `-1`，或者范围在 `0`–`9` 之间 |
| `gzuncompress()` | `gzuncompress(string $data): string\|false` | 解压缩由 `gzcompress()` 产生的字符串；若发生 zlib 错误则返回 `false` |
| `gzdeflate()` | `gzdeflate(string $data, int $level = -1): string` | 将字符串压缩为原始 DEFLATE 格式 —— 无 zlib 头部和尾部；`$level` 默认为 `-1`，或者范围在 `0`–`9` 之间 |
| `gzinflate()` | `gzinflate(string $data): string\|false` | 解压缩来自 `gzdeflate()` 或 `zlib.deflate` 流过滤器的原始 DEFLATE 字符串；若发生 zlib 错误则返回 `false` |
| `ctype_alpha()` | `ctype_alpha($str): bool` | 所有字符均为字母（A-Z/a-z） |
| `ctype_digit()` | `ctype_digit($str): bool` | 所有字符均为数字（0-9） |
| `ctype_alnum()` | `ctype_alnum($str): bool` | 所有字符均为字母或数字 |
| `ctype_space()` | `ctype_space($str): bool` | 所有字符均为空白字符 |

正则表达式函数在 [Regex](regex.md) 中单独记录，包括使用 `preg_*` 的程序所需的 PCRE2 构建要求。
