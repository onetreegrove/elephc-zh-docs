### Assignment parsing

When the parser sees a `Variable`, it looks ahead to decide:

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

Compound assignments (`+=`, `-=`, `*=`, `**=`, `/=`, `.=`, `%=`, `&=`, `|=`, `^=`, `<<=`, `>>=`) are desugared into regular assignments with binary operations. Null coalescing assignment (`??=`) is represented as a regular assignment with a `NullCoalesce` value; codegen recognizes this shape and emits a conditional store so the right-hand side is only evaluated when the current target value is `null`. In expression form, the type checker and optimizer treat `ExprKind::Assignment`, its hidden prelude, and its conditional value temp as observable assignment machinery so the assignment cannot be folded away or hidden by stale constant-propagation facts.

Compound assignments can target variables, object properties, static properties, and non-append array elements. For simple targets, the parser lowers directly to the final assignment node. For effectful non-local targets such as `$obj->items[next_key()] += 1`, the parser emits a `StmtKind::Synthetic` sequence that stores the receiver or index expressions in hidden temporaries, then performs the read-modify-write using those temporaries. This preserves PHP's single-evaluation behavior without making codegen duplicate the target expressions.

### `try` / `catch` / `finally`

`control.rs` parses exception handling statements with this general shape:

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

Each `catch` becomes a `CatchClause { exception_types, variable, body }`. `exception_types` always stores a vector, so single-type catches are just a one-element list.

## How it connects

The parser's output — `Program` (which is `Vec<Stmt>`) — first feeds into per-file magic-constant lowering, then elephc's build-time conditional pass for `ifdef`, then into the [resolver](how-elephc-works.md), then into the dedicated name-resolution pass that canonicalizes namespace-aware names, and finally into the [type checker](the-type-checker.md):

```
[(Token, Span), ...] → Parser → Program (Vec<Stmt>) → MagicConstants → Conditional → Resolver → NameResolver → Type Checker
```