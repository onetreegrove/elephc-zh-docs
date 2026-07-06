### 赋值解析

当解析器看到 `Variable` 时，会向前查看来决定：

```php
$x = 42;         →  Assign { name: "x", value: IntLiteral(42) }
$x += 5;         →  Assign { name: "x", value: BinaryOp(Add, Variable("x"), IntLiteral(5)) }
$x <<= 1;        →  Assign { name: "x", value: BinaryOp(ShiftLeft, Variable("x"), IntLiteral(1)) }
$x ??= 5;        →  Assign { name: "x", value: NullCoalesce(Variable("x"), IntLiteral(5)) }
$x = true and false; → ExprStmt(BinaryOp(Assignment(Variable("x"), BoolLiteral(true)), And, BoolLiteral(false)))
echo ($x += 1);  →  Echo(Assignment(Variable("x"), BinaryOp(Add, Variable("x"), IntLiteral(1))))
$arr[0] = 5;     →  ArrayAssign { array: "arr", index: IntLiteral(0), value: IntLiteral(5) }
$arr[0] += 5;    →  ArrayAssign { array: "arr", index: IntLiteral(0), value: BinaryOp(Add, ArrayGet(...), IntLiteral(5)) }
$arr[] = 5;      →  ArrayPush { array: "arr", value: IntLiteral(5) }
$x++;            →  ExprStmt(PostIncrement("x"))
```

复合赋值（`+=`、`-=`、`*=`、`**=`、`/=`、`.=`、`%=`、`&=`、`|=`、`^=`、`<<=`、`>>=`）会脱糖为带二元运算的常规赋值。null coalescing assignment（`??=`）表示为一个带 `NullCoalesce` 值的常规赋值；codegen 会识别这种形状并发出条件存储，因此只有当当前目标值为 `null` 时才会求值右侧。在表达式形式中，类型检查器和优化器会把 `ExprKind::Assignment`、其隐藏 prelude 和条件值临时变量视为可观察的赋值机制，因此赋值不会被折叠掉，也不会被陈旧的常量传播事实隐藏。

复合赋值可以作用于变量、对象属性、static 属性和非 append 数组元素。对于简单目标，解析器会直接降为最终赋值节点。对于 `$obj->items[next_key()] += 1` 这样的 effectful 非本地目标，解析器会发出一个 `StmtKind::Synthetic` 序列，把 receiver 或 index 表达式存入隐藏临时变量，然后使用这些临时变量执行读-改-写。这既保留了 PHP 的单次求值行为，也避免 codegen 复制目标表达式。

### `try` / `catch` / `finally`

`control.rs` 会解析具有如下总体形状的异常处理语句：

```php
try {
    // body
} catch (TypeA | TypeB $e) {
    // handler
} catch (Exception) {
    // optional variable binding omitted
} finally {
    // cleanup
}
```

每个 `catch` 会变成一个 `CatchClause { exception_types, variable, body }`。`exception_types` 始终存储一个 vector，因此单类型 catch 只是一个单元素列表。

## 如何连接

解析器的输出 `Program`（即 `Vec<Stmt>`）会先进入每文件魔术常量 lowering，然后进入 elephc 的 `ifdef` 构建期条件 pass，再进入 [resolver](how-elephc-works.md)，然后进入专用的名称解析 pass 来规范化 namespace-aware 名称，最后进入 [类型检查器](the-type-checker.md)：

```
[(Token, Span), ...] → Parser → Program (Vec<Stmt>) → MagicConstants → Conditional → Resolver → NameResolver → Type Checker
```
