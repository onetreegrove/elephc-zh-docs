## 旧版 AST 表达式代码生成

**文件：**`src/codegen/expr.rs`、`src/codegen/expr/`

冻结的 `--ast-backend` 路径仍使用 `emit_expr()` 接收一个表达式节点，并生成会把结果留在标准寄存器中的代码。默认后端则通过 `src/ir_lower/` 中的 EIR lowering 和 `src/codegen_ir/` 中的指令 lowering 抵达同一组 ABI/运行时 helper。顶层旧版 `expr.rs` 文件主要分发到 `expr/` 下更聚焦的 helper，例如 `scalars.rs`、`variables.rs`、`binops/`、`arrays.rs`、`compare/`、`calls/` 和 `objects/`。

| 类型 | 结果位置 |
|---|---|
| `Int` / `Bool` / `Void` / `Resource` | `x0` |
| `Float` | `d0` |
| `Str` | `x1`（pointer）、`x2`（length） |
| `Array` / `AssocArray` / `Iterable` | `x0`（heap pointer） |
| `Mixed` | `x0`（指向 boxed mixed cell 的指针） |
| `Object` | `x0`（heap pointer） |
| `Callable` / `Pointer` | `x0` |
| `Buffer` / `Packed` | `x0`（heap pointer） |
| `Union` | `x0`（与 Mixed 相同，即 boxed runtime-tagged payload） |

### 表达式 AST 分发覆盖范围

旧版表达式 dispatcher 有意保持很薄。它把每个 `ExprKind` variant 路由到下面某个聚焦的 lowering 路径；EIR 路径则通过 `src/ir_lower/expr/` 映射同样的 PHP 可见覆盖范围：

| Variants | Lowering 路径 |
|---|---|
| `StringLiteral`, `IntLiteral`, `FloatLiteral`, `BoolLiteral`, `Null`, `Negate`, `Not`, `BitNot`, `Cast`, `Print`, `ErrorSuppress` | 标量、强制转换、stdout 和诊断 helper |
| `Variable`, `This`, `PreIncrement`, `PostIncrement`, `PreDecrement`, `PostDecrement`, `Assignment` | 变量加载/存储和赋值表达式 helper |
| `BinaryOp`, `InstanceOf`, `NullCoalesce`, `Pipe`, `Ternary`, `ShortTernary`, `Throw` | 运算符、比较、call-pipe、分支和异常感知表达式 helper |
| `ArrayLiteral`, `ArrayLiteralAssoc`, `ArrayAccess`, `Spread`, `Match` | 索引数组、关联数组、解包、字符串索引和 match 表达式 helper |
| `FunctionCall`, `NamedArg`, `ClosureCall`, `ExprCall`, `Closure`, `FirstClassCallable` | 共享的调用参数规划器、闭包 wrapper 和 callable 分发 helper |
| `ConstRef`, `ClassConstant`, `ScopedConstantAccess`, `MagicConstant` | 编译期常量和类常量加载。`MagicConstant` 应该已经在 codegen 之前由前端降低。 |
| `NewObject`, `NewDynamic`, `NewScopedObject`, `NewDynamicObject`, `PropertyAccess`, `DynamicPropertyAccess`, `NullsafePropertyAccess`, `NullsafeDynamicPropertyAccess`, `StaticPropertyAccess`, `MethodCall`, `NullsafeMethodCall`, `StaticMethodCall` | 对象分配（包括经由 `NewDynamic` 的 `new $var()` 和内部 runtime-class-string 工厂 `NewDynamicObject`）、属性/成员访问、nullsafe 链 lowering、vtable 分发和 late-static-binding helper |
| `PtrCast`, `BufferNew`, `Yield`, `YieldFrom` | 指针/buffer 扩展和 generator 状态机 lowering |

### Intrinsic Calls

大多数方法调用使用普通的类元数据路径：求值 receiver，物化参数，选择 vtable 或直接方法目标，然后调用已生成的 PHP 方法主体。少量由运行时管理的核心对象不能把合成 PHP stub 当作真实实现。对于这些对象，`src/intrinsics.rs` 会按 PHP 类和方法名记录一个 `IntrinsicCall` 条目，`src/codegen/expr/objects/dispatch/intrinsic.rs` 则会在普通 receiver 和参数设置完成后生成直接的运行时 helper 调用。

当前 intrinsic 调用点覆盖 `Fiber` 实例/静态 API，以及由运行时支持的 `Generator` 方法表面。具有相同方法名的用户类不受影响，因为查找会包含已解析的类名。

### 字面量

```php
42        →  mov x0, #42
3.14      →  adrp x9, _float_0@PAGE  /  add x9, ...  /  ldr d0, [x9]
"hello"   →  adrp x1, _str_0@PAGE  /  add x1, ...  /  mov x2, #5
true      →  mov x0, #1
null      →  movz x0, #0xFFFE  /  movk x0, ...  (load null sentinel)
```

大整数（> 65535 或负数）使用 `movz` + `movk` 序列。参见 [ARM64 Instruction Reference](arm64-instructions.md#loading-large-constants)。

### 二元运算的 push/pop 模式

像 `$a + $b` 这样的二元运算需要两个操作数同时位于寄存器中，但 `emit_expr` 对每个表达式都使用相同寄存器。解决办法是：**把左侧结果 push 到栈上，求值右侧，然后再把左侧 pop 回来**。

```php
$a + $b
```

```asm
; Step 1: evaluate left ($a)
ldur x0, [x29, #-8]              ; x0 = $a

; Step 2: push left onto stack
str x0, [sp, #-16]!              ; save x0 to stack, decrement sp

; Step 3: evaluate right ($b)
ldur x0, [x29, #-16]             ; x0 = $b  (overwrites left!)

; Step 4: pop left back into a different register
ldr x1, [sp], #16                ; restore left into x1, increment sp

; Step 5: operate
add x0, x1, x0                   ; x0 = left + right
```

对于字符串（使用两个寄存器），push 会保存 `x1` 和 `x2`，pop 会把它们恢复到 `x3` 和 `x4`。

对于浮点数，push/pop 使用 `d0`/`d1`：

```asm
str d0, [sp, #-16]!              ; push left float
; ... evaluate right → d0 ...
ldr d1, [sp], #16                ; pop left float into d1
fadd d0, d1, d0                  ; d0 = left + right
```

### 比较运算符

比较使用 `cmp`（整数）或 `fcmp`（浮点数），后接 `cset`：

```php
$x > 5
```

```asm
; ... push $x, evaluate 5 ...
cmp x1, x0                       ; compare left with right
cset x0, gt                      ; x0 = 1 if greater, 0 otherwise
```

结果始终位于 `x0`，值为 0 或 1（`PhpType::Bool`）。

### 短路逻辑运算符

`&&`、`||`、`and` 和 `or` 使用**短路求值**：如果左侧已经决定结果，就不会求值右侧。`xor` 也是逻辑运算符，但它会求值两个操作数，因为异或需要两个 truthiness 值。

```php
$a && $b
```

```asm
; evaluate $a
cmp x0, #0
b.eq _sc_end_1          ; if $a is falsy, skip $b entirely (result = 0)
; evaluate $b
cmp x0, #0
cset x0, ne             ; result = whether $b is truthy
_sc_end_1:
```

### 字符串拼接

`.` 运算符调用运行时的 `__rt_concat`：

```php
"hello" . " world"
```

```asm
; push left string (x1, x2)
; evaluate right string → x1, x2
; pop left → x3, x4
; call concat
mov x3, ...              ; left ptr
mov x4, ...              ; left len
bl __rt_concat           ; result → x1 (ptr), x2 (len)
```

关于 `__rt_concat` 的工作方式，参见 [The Runtime](the-runtime.md)。

### 位运算

位运算符（`&`、`|`、`^`、`~`、`<<`、`>>`）作用于整数，并生成单条 ARM64 指令：

```php
$a & $b    →  and x0, x1, x0     // bitwise AND
$a | $b    →  orr x0, x1, x0     // bitwise OR
$a ^ $b    →  eor x0, x1, x0     // bitwise XOR
$a << $b   →  lsl x0, x1, x0     // logical shift left
$a >> $b   →  asr x0, x1, x0     // arithmetic shift right (preserves sign)
~$a        →  mvn x0, x0         // bitwise complement (one's complement)
```

和其他二元运算一样，位运算也使用 push/pop 模式：求值左侧、push、求值右侧、pop 左侧、应用运算。

### Spaceship operator

spaceship operator（`<=>`）会根据比较结果返回 -1、0 或 1。它使用条件选择指令：

```php
$a <=> $b
```

```asm
; ... push $a, evaluate $b ...
cmp x1, x0                      ; compare left with right
cset x0, gt                     ; x0 = 1 if left > right, else 0
csinv x0, x0, xzr, ge           ; if left < right: x0 = ~0 = -1 (all ones)
```

`csinv`（conditional select invert）会反转 `xzr`（零寄存器），在条件不满足时产生 -1。

对于浮点数，会用 `fcmp` 替代 `cmp`，但仍采用相同的 `cset`/`csinv` 模式。

### 数组 union

当 `+` 的两个操作数都是数组时，codegen 会把表达式路由到 PHP 数组 union lowering，而不是数值加法。索引数组调用 `__rt_array_union`：它克隆左操作数，并只追加右侧中左侧缺失 key 对应的数值后缀。关联数组调用 `__rt_hash_union`：它克隆左侧 hash，按插入顺序遍历右侧 hash，并且只插入克隆中不存在的 key。混合索引/关联操作数会返回 hash 结果：`__rt_array_hash_union` 会先把左侧索引位置映射为整数 hash key，再合并右侧 hash；`__rt_hash_array_union` 则克隆左侧 hash，并把右侧索引位置作为整数 key 探测。

### Null coalescing operator

`??` 运算符在左操作数非 null 时返回左操作数，否则返回右操作数：

```php
$x ?? "default"
```

```asm
; evaluate $x
; compare with null sentinel (0x7FFFFFFFFFFFFFFE)
b.ne _nc_done_1          ; if not null, keep left value
; evaluate "default"      ; otherwise, use right side
_nc_done_1:
```

null 检查会把值与 [null sentinel](memory-model.md) 比较。该运算符是右结合的（`$a ?? $b ?? $c` = `$a ?? ($b ?? $c)`）。

Null coalescing assignment 会被解析为 `$x = $x ?? expr`，但赋值 lowering 会识别这个确切形态并生成条件存储：

```php
$x ??= "default";
```

生成的代码会加载 `$x`，在其非 null 时跳过赋值，并且只在 null 路径上求值/存储右侧。这保留了 PHP 的 `??=` 短路行为，并避免把已经 owned 的堆值重新写回同一个局部 slot。

### Pipe operator

PHP 8.5 的 `value |> callable` 通过 `src/codegen/expr/calls/pipe.rs` 降低。
`emit_expr()` 会先把左值存入隐藏的局部 slot，确保左侧在 callable 目标之前可观察地完成求值。随后它会使用该隐藏局部作为唯一位置参数，构建一个合成的一参数调用。

pipe lowering 会尽可能委托给现有调用路径：first-class function 目标变成 `FunctionCall`，first-class static method 目标变成 `StaticMethodCall`，first-class instance method 目标变成 `MethodCall`，局部 callable 变量变成 `ClosureCall`，其他 callable 表达式变成 `ExprCall`。因此，参数规划、ABI 物化、所有权和诊断都能与普通调用保持一致。

### Error-control operator

`@` 运算符会降低为一对带作用域的运行时诊断抑制调用：

1. 调用 `__rt_diag_push_suppression`
2. 正常求值操作数
3. 以适当的 ABI 结果形态保存操作数结果
4. 调用 `__rt_diag_pop_suppression`
5. 恢复操作数结果

异常 handler frame 还会在 `setjmp()` 之前快照当前抑制深度，并在 `longjmp()` 进入 catch 分发后恢复它。这可以防止 `@` 内部抛出的表达式把 warning 抑制泄漏到后续代码。

### Nullsafe operator

`?->` 运算符会把 nullable receiver 经由 nullable 和 union 存储所使用的 boxed mixed 路径降低。Codegen 会展平包含 nullsafe segment 的 postfix 链，只求值一次 base，并在 nullsafe receiver 为 null 时分支到共享的 boxed-`null` 结果。该分支会跳过链的其余部分，包括后续普通 `->` segment、数组索引、方法参数和 callable 参数。如果普通 segment 后续从非短路路径接收到真实 null 值，它仍会遵循 PHP 的 warning 或 fatal 行为。

### 类型强制转换

当类型需要匹配时（例如 int + float），codegen 会插入转换指令：

```asm
scvtf d0, x0             ; convert signed integer (x0) → double (d0)
fcvtzs x0, d0            ; convert double (d0) → signed integer (x0)
```

`.`（concat）运算符也会强制转换非字符串：

- `Int` → 调用 `__rt_itoa` 得到字符串
- `Float` → 调用 `__rt_ftoa`
- `Bool true` → 字符串 "1"
- `Bool false` / `Null` → 空字符串（长度 0）
