---
title: "PDO (数据库)"
description: "使用 SQLite、PostgreSQL 和 MySQL/MariaDB 驱动程序的 PDO 数据库访问：连接、预处理语句、获取模式和事务。"
sidebar:
  order: 17
---

elephc 支持 PHP PDO 数据库层的一个实用子集，提供了 **SQLite**、**PostgreSQL** 和 **MySQL / MariaDB** 驱动程序。`PDO`、`PDOStatement` 和 `PDOException` 在日常使用中的行为与它们的 PHP 对应项一致：连接、执行、预处理/绑定、获取以及运行事务。DSN 前缀用于选择驱动程序，因此相同的代码可以运行在任何这些数据库上。

每个驱动程序都是静态链接的（SQLite 是内置的；PostgreSQL 和 MySQL 使用纯 Rust 客户端），因此编译后的 PDO 二进制文件**没有系统级数据库客户端依赖**——只要能运行 elephc 二进制文件的地方，它就能运行。SQLite 在进程内运行；PostgreSQL 和 MySQL 则通过网络连接到运行中的服务器。

## 连接

```php
<?php
// SQLite — file-backed (created if missing) or in-memory.
$db = new PDO("sqlite:/path/to/app.db");
$mem = new PDO("sqlite::memory:");

// PostgreSQL — credentials in the DSN or as constructor arguments.
$pg = new PDO("pgsql:host=localhost;port=5432;dbname=app;user=me;password=secret");
$pg = new PDO("pgsql:host=localhost;dbname=app", "me", "secret");

// MySQL / MariaDB — credentials in the DSN or as constructor arguments.
$my = new PDO("mysql:host=127.0.0.1;port=3306;dbname=app;user=me;password=secret");
$my = new PDO("mysql:host=127.0.0.1;dbname=app", "me", "secret");
```

DSN 必须以 `sqlite:`、`pgsql:` 或 `mysql:` 开头。对于 SQLite，接受 `$username` 和 `$password` 参数以实现签名兼容性，但它们会被忽略；构造函数选项仍会初始化 PDO 属性。对于 PostgreSQL 和 MySQL，`$username` / `$password` 会合并到连接中（其他键如 `host`、`port`、`dbname` 以及——对于 MySQL——`unix_socket` 则来自 `key=value;…` 格式的 DSN）。连接失败会抛出 `PDOException`。

构造函数选项可以包含 `PDO::ATTR_PERSISTENT => true`。持久化 PDO 实例使用由完全具体化的 DSN 作为键的进程本地连接池，因此稍后使用相同 DSN 和持久化选项构造的 PDO 会复用同一个已编译程序内的现有连接。非持久化连接则是独立打开的。

## 执行语句

```php
<?php
// exec() runs a statement with no result set and returns the affected row count.
$db->exec("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, score REAL)");
$n = $db->exec("INSERT INTO users (name, score) VALUES ('Ada', 9.5)");

echo $db->lastInsertId();   // "1"
```

## 预处理语句与绑定

`execute()` 接受一个参数数组。位置占位符（`?`）按位置绑定；命名占位符（`:name`）按键绑定（带或不带前导冒号）。绑定的值会自动进行类型转换（int、float、string、null、bool）。

```php
<?php
// Positional
$stmt = $db->prepare("SELECT name FROM users WHERE id = ?");
$stmt->execute([1]);

// Named
$ins = $db->prepare("INSERT INTO users (name, score) VALUES (:name, :score)");
$ins->execute([":name" => "Bob", ":score" => 7.25]);
$ins->execute(["name" => "Cyd", "score" => 3.0]);  // colon optional
```

`query()` 预处理并立即执行一条语句，返回准备好获取结果的 `PDOStatement`。

参数也可以通过 `bindValue()`（和 `bindParam()`）进行单独绑定，然后通过不带参数的 `execute()` 来应用：

```php
<?php
$stmt = $db->prepare("INSERT INTO users (name, score) VALUES (:name, :score)");
$stmt->bindValue(":name", "Dee");
$stmt->bindValue(":score", 5, PDO::PARAM_INT);
$stmt->execute();
```

`bindParam()` 绑定变量的*当前*值（它不会将按引用读取延迟到 `execute()` 执行时），因此请在 `execute()` 之前立即进行绑定。

相比插值，更推荐使用预处理语句。当必须嵌入字符串时，`PDO::quote()` 会将其用单引号包裹并对嵌入的引号进行转义：

```php
<?php
$db->quote("O'Brien");  // 'O''Brien'
```

## 获取结果

```php
<?php
$stmt = $db->query("SELECT id, name FROM users");

$stmt->fetch(PDO::FETCH_ASSOC);  // ["id" => 1, "name" => "Ada"]
$stmt->fetch(PDO::FETCH_NUM);    // [0 => 1, 1 => "Ada"]
$stmt->fetch(PDO::FETCH_BOTH);   // both numeric and string keys
$stmt->fetch(PDO::FETCH_OBJ);    // stdClass { id: 1, name: "Ada" }

class UserRow {
    public mixed $id;
    public mixed $name;
}

$row = $db->query("SELECT id, name FROM users")->fetch(PDO::FETCH_CLASS, UserRow::class);

$target = new UserRow();
$same = $db->query("SELECT id, name FROM users")->fetch(PDO::FETCH_INTO, $target);

$all = $db->query("SELECT id FROM users")->fetchAll(PDO::FETCH_NUM);
$one = $db->query("SELECT name FROM users")->fetchColumn();  // first column of next row

// FETCH_COLUMN yields one column per row as a scalar:
$ids = $db->query("SELECT id FROM users")->fetchAll(PDO::FETCH_COLUMN);  // [1, 2, …]
```

当结果集耗尽时，`fetch()` 返回 `false`。`FETCH_OBJ` 创建一个真实的 `stdClass` 并直接分配动态属性，包括数字列名（例如 `"0"`）。`FETCH_CLASS` 创建请求的类并将列值分配给匹配的声明属性或动态属性；`FETCH_INTO` 填充并返回作为第二个参数传递的对象实例。

列值以其原生标量形式返回：整型 → int，实数/浮点型 → float，文本 → string，二进制/BLOB/`bytea` → 保留了嵌入式 NUL 字节的 string，以及 `NULL` → null。`FETCH_BOTH` 是默认模式。

## 遍历语句

`PDOStatement` 是可遍历的（Traversable），因此 `foreach` 可以使用顺序整数键向前遍历结果集，并以语句当前的获取模式产生每一行：

```php
<?php
$stmt = $db->query("SELECT id, name FROM users");
$stmt->setFetchMode(PDO::FETCH_ASSOC);

foreach ($stmt as $i => $row) {
    echo $i, ": ", $row["name"], "\n";
}
```

游标是只进的（forward-only）：每一行在产生时即被消耗，因此一个语句只能遍历一次。

## PostgreSQL 说明

PostgreSQL 驱动程序的行为类似于 SQLite，但有一些特定于数据库的要点：

- **占位符。** PDO 的 `?` 和 `:name` 占位符在预处理阶段会被转换为 PostgreSQL 原生的 `$1, $2, …`，因此您可以为任一驱动程序编写相同的便携式 SQL。
- **`lastInsertId()`。** PostgreSQL 没有 rowid；`lastInsertId()` 返回会话的最后一个序列值（`lastval()`），或者 `lastInsertId($sequence)` 返回 `currval($sequence)`。请使用 `SERIAL`/`IDENTITY` 列或 `RETURNING`。
- **类型。** `integer`/`bigint` → int，`real`/`double precision` → float，`boolean` → `0`/`1`，文本类型 → string，`NULL` → null。复杂类型以其文本表示形式返回：`numeric`/`decimal`（保留小数位数）、`date` / `time` / `timestamp` / `timestamptz`、`uuid` 以及 `json`/`jsonb`。相同的值可以绑定为参数（文本会被强制转换为列类型）。`bytea` 作为 PHP 字符串返回，其中保留了嵌入的 NUL 字节。`json` / `jsonb` 会被紧凑地重新序列化，因此空白字符可能与服务器的文本输出不同，但其值是等价的。其他类型（数组、网络类型）最好通过显式的 `::text` 类型转换来读取。

## MySQL / MariaDB 说明

MySQL 驱动程序的行为与其他驱动程序类似，但有一些特定于数据库的要点：

- **占位符。** MySQL 原生使用位置占位符 `?`；PDO 的 `:name` 占位符在预处理阶段会被重写为 `?`（在语句中重复使用的名称会将相同的值绑定到每个位置），因此您可以为任一驱动程序编写相同的便携式 SQL。与 PHP 中一样，单个语句要么使用 `?`，要么使用 `:name`，不能两者混用。
- **`lastInsertId()`。** 返回最后一个 `AUTO_INCREMENT` 值；忽略序列名称参数（这属于 PostgreSQL/Oracle 的概念）。
- **事务。** 将 DML 包装在事务性（InnoDB）表上。MySQL 会在 DDL（`CREATE`/`DROP TABLE` 等）周围隐式提交，因此 `beginTransaction()` 无法回滚这些操作。
- **类型。** `INT`/`BIGINT`/`BOOLEAN`（即 `TINYINT(1)`，因此为 `0`/`1`） → int，`FLOAT`/`DOUBLE` → float，文本类型 → string，`NULL` → null。复杂类型以其文本表示形式返回：`DECIMAL`（保留小数位数）、`DATE`、`DATETIME` / `TIMESTAMP` 和 `TIME`。相同的值可以绑定为参数（文本会被服务器强制转换为列类型）。二进制和 BLOB 列作为 PHP 字符串返回，其中保留了嵌入的 NUL 字节。
- **驱动程序名称。** `getAttribute(PDO::ATTR_DRIVER_NAME)` 返回 `"mysql"`。

## 事务

```php
<?php
$db->beginTransaction();
try {
    $db->exec("INSERT INTO users (name, score) VALUES ('Dee', 1.0)");
    $db->commit();
} catch (PDOException $e) {
    $db->rollBack();
}
```

## 错误

默认错误模式为 `PDO::ERRMODE_EXCEPTION`：失败的 `exec()`、`prepare()` 或连接会抛出 `PDOException`（继承自 `RuntimeException`）。

```php
<?php
try {
    $db->exec("NOT VALID SQL");
} catch (PDOException $e) {
    echo $e->getMessage();
}
```

`PDO::errorCode()` 以字符串形式返回驱动程序的原生结果代码，而 `PDO::errorInfo()` 返回 `[code, code, message]`。请注意，第一个元素是原生驱动程序代码，而不是真实的 5 字符 `SQLSTATE` —— 此处使用的客户端库不公开 `SQLSTATE`（请参阅限制）。

错误模式可以通过 `ATTR_ERRMODE` 进行配置：

```php
<?php
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_SILENT);
$rows = $db->exec("UPDATE …");       // false on error instead of throwing
if ($db->exec("BAD SQL") === false) {
    echo $db->errorInfo()[2];
}
```

- `ERRMODE_EXCEPTION`（默认）抛出 `PDOException`。
- `ERRMODE_SILENT` 抑制该异常：在出错时，`exec()`、`query()` 和 `prepare()` 都会返回 `false`（使用 `=== false` 进行检查）。
- `ERRMODE_WARNING` 将消息写入 `STDERR`，并返回与 `SILENT` 相同的失败值。

该模式也可以通过构造函数的选项数组进行初始化：`new PDO($dsn, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_SILENT])`。预处理语句在创建时继承连接当前的错误模式。`getAttribute()` 读取属性；`ATTR_DRIVER_NAME` 返回当前活动的驱动程序（`"sqlite"`、`"pgsql"` 或 `"mysql"`）。可以在构造函数选项中设置 `ATTR_PERSISTENT` 以使用进程本地的 DSN 连接池；稍后通过 `setAttribute()` 设置该属性会更新返回的属性值，但不会重新打开已经创建的连接。持久连接是运行的原生进程本地的；没有跨进程的连接池。

## 支持的功能范围

- **PDO**: `__construct`, `exec`, `query`, `prepare`, `quote`, `lastInsertId`, `beginTransaction`, `commit`, `rollBack`, `errorCode`, `errorInfo`, `getAttribute`, `setAttribute`, `__destruct`。
- **PDOStatement**: `execute`, `bindValue`, `bindParam`, `setFetchMode`, `fetch`, `fetchAll`, `fetchColumn`, `rowCount`, `columnCount`, `__destruct`；Traversable，因此语句可以通过 `foreach` 进行遍历。

连接和预处理语句在对象被释放时（在作用域结束时、当其变量被重新赋值或 `unset()` 时，或在程序退出时），会自动通过 `__destruct` 释放其底层的桥接资源：`PDO` 关闭其连接（完成任何剩余的语句），并且 `PDOStatement` 完成其自身。您不需要显式关闭它们。
- **获取模式**: `FETCH_ASSOC`, `FETCH_NUM`, `FETCH_BOTH`, `FETCH_OBJ`, `FETCH_COLUMN`（单个列作为标量；列索引是 `setFetchMode(PDO::FETCH_COLUMN, $col)` 的第二个参数）, `FETCH_CLASS` 和 `FETCH_INTO`。
- **参数**: 位置占位符 `?` 和命名占位符 `:name`；`PARAM_INT` / `PARAM_STR` / `PARAM_NULL` / `PARAM_BOOL` 常量。
- **常量**: 上文使用的获取模式、参数、`ATTR_ERRMODE`、`ATTR_DRIVER_NAME`、`ATTR_PERSISTENT` 和 `ERRMODE_*` 常量。

## 局限性

- **SQLite, PostgreSQL, and MySQL / MariaDB。** 未实现其他 PDO 驱动程序（Oracle、SQL Server 等）；桥接部分的结构设计支持在相同的 prelude 之后添加更多驱动程序。
- **`PDO::quote()`** 对每个驱动程序应用 SQLite 风格的单引号转义；它不感知驱动程序（对于 MySQL，它不会转义反斜杠），因此请优先使用预处理语句（这是所有驱动程序推荐的做法）。
- **`errorCode()` / `errorInfo()`** 报告驱动程序的*原生*错误代码，而不是真实的 5 字符 `SQLSTATE`：SQLite 和 MySQL 暴露原生的整数代码，而 PostgreSQL 客户端仅呈现一条消息（报告为通用代码）。因此 `errorInfo()[0]` 反映的是原生代码，而不是真正的 `SQLSTATE`。
- **`bindParam()`** 绑定当前值，而不是延迟的按引用读取。
- **`getAttribute` / `setAttribute`** 支持 `ATTR_ERRMODE`、`ATTR_DRIVER_NAME` 和 `ATTR_PERSISTENT`；其他属性虽被存储和读取，但没有实际效果。
- **避免直接使用 `new PDOStatement(...)`** —— 语句应该通过 `query()` / `prepare()` 创建。
