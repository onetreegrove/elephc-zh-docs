### If / Elseif / Else

```php
if ($cond1) { body1 } elseif ($cond2) { body2 } else { body3 }
```

```asm
; evaluate $cond1
cmp x0, #0
b.eq _elseif_1           ; skip to next branch if falsy

; body1
b _end_if_1               ; done — skip all remaining branches

_elseif_1:
; evaluate $cond2
cmp x0, #0
b.eq _else_1

; body2
b _end_if_1

_else_1:
; body3

_end_if_1:
```

### While loop

```php
while ($cond) { body }
```

```asm
_while_1:                  ; ← continue jumps here
; evaluate $cond
cmp x0, #0
b.eq _end_while_1         ; exit if falsy ← break jumps here

; body
b _while_1                 ; loop back

_end_while_1:
```

### For loop

```php
for ($i = 0; $i < 10; $i++) { body }
```

```asm
; emit init ($i = 0)

_for_1:
; evaluate condition ($i < 10)
cmp x0, #0
b.eq _end_for_1

; body

_for_cont_1:               ; ← continue jumps here
; emit update ($i++)
b _for_1

_end_for_1:                 ; ← break jumps here
```

### Foreach

```php
foreach ($arr as $v) { body }
```

对于索引数组：

1. 在栈上保存数组指针、长度和 index counter（3 个 16 字节 slot）
2. 循环：加载当前索引处的元素；当静态元素类型为 `Mixed` 时，通过运行时 `value_type` tag 解箱；存入 `$v`；并把堆支持循环变量归类为被迭代容器的借用别名
3. 分支回条件检查
4. 清理：释放 48 字节

对于关联数组，参见 [Associative array codegen](#associative-array-codegen)：循环会存储 hash 指针和游标，然后通过 `__rt_hash_iter_next` 前进。

对于 `Iterator` 对象，codegen 会把 receiver 停放在一个 16 字节栈 slot 中，分发 `rewind()`，然后通过 `valid()`、`key()`、`current()` 和 `next()` 驱动循环。key 和 value 会被装箱为 `Mixed`，因为具体运行时 payload 可能因 iterator 实现而异。`IteratorAggregate` 值会先分发 `getIterator()`，然后复用相同的 iterator 循环路径。类型为 `iterable` 的值会通过运行时 heap-kind 和 interface 元数据分支，使数组、直接 `Iterator` 对象和 aggregate-backed 对象选择正确的 lowering。

在第一次 `valid()` 调用之前，foreach 目标 slot 会被规范化为 boxed `Mixed`。这让空 iterator 与 PHP 兼容：已有目标变量保持有效 mixed cell，新鲜循环变量保持 null-like，receiver 别名则在循环清理前保持存活。

### Break / Continue

`break` 会生成一个到所选 loop/switch end label 的 `b`（无条件跳转）。
`continue` 会生成一个到所选 continue label 的 `b`（对 `while` 是条件检查，对 `for` 是 update，对 PHP 风格的 `switch` 内 `continue` 是 switch end label）。

`Context` 中的 `loop_stack` 跟踪嵌套循环和 switch 的标签。
`break 2;` 和 `continue 2;` 等多级形式会反向索引该栈。每个 `LoopLabels` 条目还携带 `sp_adjust` 字段，使多级退出和 return 能在跳转到所选目标或共享函数 epilogue 之前，撤销任何被跳过的 switch-subject 临时栈 slot。如果退出跨过 `finally`，codegen 会记录所选目标，并在恢复分支之前运行活跃的 `finally` 链。

类型检查器会拒绝会从 `finally` 主体跳出的 `break` / `continue`，因此 codegen 只需要把受保护的 `try` 或 `catch` 主体中的合法退出通过 `finally_stack` 路由。

### Exceptions 和 `finally`

异常 lowering 位于 `src/codegen/stmt/control_flow/exceptions.rs`。基本策略是：

1. 求值被抛出的对象，并把它发布到 `_exc_value`
2. 调用 `__rt_throw_current`，它会展开 activation record，并 `longjmp` 到最近的 handler
3. 对于 `try`，生成一个 `_setjmp` resume point，以及 `_exc_handler_top` 中的链式 handler record
4. 通过 `__rt_exception_matches` 按 class id 或 interface id 测试每个 catch 目标
5. 通过 `finally_stack` 路由 `return`、`break`、`continue` 和 rethrow，使每个外层 `finally` 都在控制流离开受保护区域前运行。Checker 会拒绝从 `finally` 内部发起并以外层 loop/switch 为目标的 `break` / `continue`。

这意味着 `finally` 是普通控制流 lowering 的一部分，而不是单独的运行时 pass。运行时只负责展开 frame 并选择 landing pad；编译器生成的标签仍会决定执行是在匹配的 `catch`、`finally` 还是外层 handler 中恢复。

### Switch

```php
switch ($x) {
    case 1: echo "one"; break;
    case 2: echo "two"; break;
    default: echo "other"; break;
}
```

1. 求值 subject 表达式一次，并把结果 push 到栈上
2. 对每个 case：pop subject，求值 case value，比较（整数使用 `cmp` + `b.ne`，字符串使用 `bl __rt_str_eq`）
3. 如果匹配：生成 case body，其中可能包含 `break`（跳到 end label）或 fall through 到下一个 case
4. Default case：无条件生成 body
5. 所有 case 之后的 end label

Switch 使用 loop stack，因此 case body 中的 `break` 会跳到 switch end label，而不是外层循环。

### Match expression

Match 是表达式（返回值），不是语句。它使用严格比较（`===`），且没有 fall-through：

```php
$result = match($x) {
    1 => "one",
    2 => "two",
    default => "other",
};
```

1. 求值 subject，push 到栈上
2. 对每个 arm：把 subject 与该 arm 的 pattern list 中每个 pattern 比较
3. 如果任意 pattern 匹配：求值该 arm 的结果表达式，跳到 end
4. Default arm：无条件求值结果
5. 结果留在标准寄存器中（`x0`、`d0` 或 `x1`/`x2`）

## 类代码生成

### 对象分配（`new ClassName(...)`）

当 codegen 遇到 `NewObject` 表达式时：

1. **计算对象大小**：`8 + (num_properties × 16) + dyn_props_slot` — class ID 占 8 字节，完整继承 layout 中每个属性占 16 字节，若类携带 `#[\AllowDynamicProperties]`，还会为 dynamic-property hash pointer 增加一个可选 8 字节 slot
2. **分配堆内存**：以计算出的大小调用 `__rt_heap_alloc`
3. **零初始化**：把所有属性 slot 清零
4. **存储 class ID**：在 offset 0 写入类标识符
5. **应用默认值**：对具有默认值的属性，在其固定 offset 处求值并存储默认值
6. **调用构造器**：如果类暴露 `__construct`，则把新对象指针作为 `x0`（`$this`）传入，后跟构造器参数，然后分支到类元数据中记录的实现标签（可能来自继承构造器）

声明了 PHP 8.2 `#[\AllowDynamicProperties]` 属性的类会保留一个尾随的 per-object hash slot，使未声明属性的写/读能经由运行时 side table 路由，而不是在编译期失败。

结果是 `x0` 中的对象指针。

### Attribute reflection objects

`new ReflectionClass(...)`、`new ReflectionMethod(...)` 和 `new ReflectionProperty(...)` 会被 `src/codegen/expr/objects/reflection.rs` 拦截，而不是依赖普通用户定义构造器主体。类型检查器已经在普通调用参数规划之后强制其 class/member 参数为编译期字符串，因此 codegen 可以直接查找目标 `ClassInfo`，并用新构建的 `array<ReflectionAttribute>` 填充 private `__attrs` slot。

`src/codegen/reflection.rs` 负责共享的物化路径。它会分配每个合成 `ReflectionAttribute`，写入已解析的 `__name`，从受支持的字面量 attribute 参数构建 `array<mixed>` `__args` payload，并存储确定性的 `__factory` id。随后 `ReflectionAttribute::newInstance()` 会在 `src/codegen/class_methods.rs` 中生成为这些 factory id 上的分支表；每个分支会用捕获的字面量 args 构造真实 attribute 类，fallback 会在无法物化已定义 attribute 类时返回 `null`。

`_class_attribute_*` 运行时数据表仍会从同一组 `ClassInfo` 字段生成类级 attribute 元数据，但受支持的 Reflection owner 构造器会在编译期物化，不会为类、方法或属性执行运行时名称查找。

### 类型检查（`$obj instanceof ClassName`）

`ExprKind::InstanceOf` 会精确求值左侧一次，从生成的元数据中物化目标 class 或 interface id，并在 `x0` 中返回 boolean。直接对象值会调用 `__rt_exception_matches`，也就是异常 catch lowering 使用的同一个元数据 matcher，因此继承类和已实现 interface 会通过同一组 parent-id 和 class-interface table 处理。

对于命名目标，当左侧被降低为 `Mixed` 或 `Union` 时，codegen 会改为调用 `__rt_mixed_instanceof`。该 helper 会解开嵌套 mixed box，对 scalar、array、null 和 unknown payload tag 返回 `false`，并且只把对象 payload 转发到 `__rt_exception_matches`。这让 nullable 和 union 对象检查保持 PHP 兼容，而不会把 boxed mixed cell 自身当作对象指针。

命名目标会在 codegen 前解析。命名 class/interface 会变成具体元数据 id，`self` 和 `parent` 在当前词法类上下文中解析，`static` 使用转发的 called-class id 实现 late static binding。动态目标会在左侧求值后再求值和验证；字符串目标通过生成的大小写不敏感 class/interface 名称元数据解析，对象目标加载目标对象的运行时 class id，无效目标 payload 会分支到 fatal 运行时诊断，而非对象左侧 payload 会在该验证步骤之后变成 `false`。

### 属性访问（`$obj->prop`）

属性访问通常使用从 `ClassInfo.property_offsets` 编译期计算出的固定 offset：

```asm
; $obj->prop where prop resolved to offset 24
ldur x0, [x29, #-offset]            ; load object pointer
ldur x0, [x0, #24]                  ; load property at resolved inherited offset
```

如果属性不存在但类暴露 `__get($name)`，codegen 会把属性名物化为字符串字面量，将其作为参数 push，并通过普通对象调用路径分发实例方法。返回值随后会根据推断出的返回类型流回普通结果寄存器。

对于属性赋值（`$obj->prop = value`），先求值 value，然后存储到已解析的 inherited offset。如果属性缺失但类暴露 `__set($name, $value)`，codegen 会把 value 装箱为 `Mixed`，物化属性名，并分发 `__set`，而不是生成直接 store。

Property-array 写入会先使用同一套固定 offset 属性解析，然后委托给普通数组存储路径处理嵌套容器。`$obj->items[] = $value` 通过 `PropertyArrayPush` 降低，`$obj->items[$key] = $value` 通过 `PropertyArrayAssign` 降低；二者都要求属性是具体 array/assoc-array，而不是 magic `__set` fallback。

### 方法调用（`$obj->method(args)`）

1. 求值对象表达式，在 `x0` 中得到指针
2. 把对象指针 push 到栈上
3. 求值并 push 所有参数
4. 把参数 pop 到 ABI 寄存器，其中对象指针作为第一个参数（`x0`）
5. 加载对象的 `class_id`，从 `_class_vtable_ptrs` 获取 class vtable pointer，加载 method slot，并用 `blr` 跳转到已解析实现
6. 结果根据返回类型位于标准寄存器中

在方法主体内，`$this` 是第一个参数，并存在函数的第一个栈 slot 中。

Private 实例方法是例外：它们没有 vtable slot，因此解析为当前词法类 private 方法的调用会使用直接 `_method_Class_method` 分支，而不是虚分发。
