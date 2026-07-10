### 访问

```php
$m["name"]
```

1. 在栈上保存 hash table pointer
2. 求值 key 表达式 → `x1`/`x2`（string）
3. 调用 `__rt_hash_get` → `x0` = found（0/1），`x1` = value_lo，`x2` = value_hi，`x3` = 每个 entry 的 value tag
4. 根据值类型把结果移动到标准寄存器；如果静态结果是 `Mixed`，则先把 payload 装箱到堆 cell 中

### 关联数组上的函数

`array_key_exists`、`in_array`、`array_keys`、`array_values` 等 builtin 函数会在编译期按数组类型分发：

- `PhpType::Array` → 使用索引运行时例程（例如边界检查、线性扫描）
- `PhpType::AssocArray` → 使用 hash table 例程（例如 `__rt_hash_get`、`__rt_hash_iter_next`）

### 关联数组上的 `foreach`

当 `foreach` 迭代 `PhpType::AssocArray` 时，lowering 不同于索引数组：

1. 在栈上保存 hash 指针和迭代游标（`0` 表示“从 header.head 开始”）
2. 调用 `__rt_hash_iter_next`
3. 如果 `x0 == -1`，退出循环
4. 否则保存返回的游标，把 `x1`/`x2` 存入可选 key 变量，并根据推断出的元素类型把 `x3`/`x4`/`x5` 存入 value 变量；`Mixed` 循环变量会按需复用或分配 boxed mixed cell
5. 生成循环主体，然后分支回 iterator 调用

这会保留 PHP 风格的插入顺序，因为 `__rt_hash_iter_next` 遍历的是 hash table 的链式插入顺序链，而不是扫描物理 bucket。

hash table 例程细节参见 [The Runtime](the-runtime.md)，hash table 内存布局参见 [Memory Model](memory-model.md)。

## 字符串索引代码生成

同一个 `ArrayAccess` AST 节点也覆盖 `$str[1]` 或 `$str[-1]` 这样的字符串索引。在 `src/codegen/expr/arrays.rs` 中，`emit_array_access()` 会检查 `PhpType::Str`，并内联降低该操作：

1. 在求值 index 表达式时保存字符串指针/长度
2. 按字符串末尾调整负索引
3. 把小于 `-len` 的偏移 clamp 到开头，把越过末尾的偏移 clamp 到末尾
4. 把字符串指针推进到选中的 byte
5. 当偏移未越界时返回单字符字符串（`x1` + `x2 = 1`），否则返回空字符串

因此该行为类似 slice，但不会调用 `substr()` 或专用运行时 helper。

## 语句代码生成

**文件：**`src/codegen/stmt.rs`、`src/codegen/stmt/`

`emit_stmt()` 同样拆分到 `stmt/` 下聚焦的 helper 中：赋值/存储逻辑、数组语句、include-once guard 和控制流 lowering（`branching`、`foreach`、`loops`）现在都位于很薄的顶层 dispatcher 之外。`stmt/includes.rs` 生成 resolver 产生的 `IncludeOnceMark` 和 `IncludeOnceGuard` 节点所使用的 `.comm` flag 与分支序列，以及 include 点加载隐藏函数实现时使用的 active-variant store。借用结果 retain、局部 slot 所有权更新、static-init guard、索引数组元数据 stamping 等小型共享 statement-side policy 现在位于 `stmt/helpers.rs`，而不是让 `stmt.rs` 自身膨胀。存储 lowering 也已拆分：`stmt/storage.rs` 只是边界，`storage/locals.rs` 处理普通 global/static 符号访问，`storage/extern_globals.rs` 负责 extern-global load/store 约定。赋值 lowering 也更深入地拆了一层：`stmt/assignments/locals.rs` 处理普通 local/global/ref 写入，而 `stmt/assignments/properties.rs` 现在跨 `properties/target.rs`、`magic_set.rs` 和 `storage.rs` 编排属性写入。数组索引写入现在也遵循同样模式：`stmt/arrays/assign.rs` 只是 dispatcher，而 `stmt/arrays/assign/buffer.rs` 和 `assoc.rs` 隔离非索引容器路径，`stmt/arrays/assign/indexed.rs` 则跨 `indexed/prepare.rs`、`normalize.rs`、`store.rs` 和 `extend.rs` 编排索引数组写入。Branching lowering 现在也采用同样形态：`stmt/control_flow/branching.rs` 只是边界，而 `branching/if_stmt.rs` 和 `branching/switch_stmt.rs` 负责不同 lowering 路径。异常 lowering 遵循同样结构：`stmt/control_flow/exceptions.rs` 编排高层 try/catch/finally 流程，而 `exceptions/handlers.rs`、`catches.rs` 和 `finally.rs` 负责更低层的 handler stack、catch matching 和 pending-action/finally 分发机制。循环 lowering 也已拆分：`stmt/control_flow/loops.rs` 现在只是边界，`loops/iterative.rs` 处理 `for`/`while`/`do...while`，`loops/exits.rs` 负责 `break`/`continue`/`return`。`foreach` lowering 现在同样遵循该模式：`stmt/control_flow/foreach.rs` 会在 `foreach/indexed.rs`、`foreach/assoc.rs` 和 `foreach/iterator.rs` 之间分发，覆盖数组、hash、`Iterator`、`IteratorAggregate` 和 object-backed `iterable` 值。

### 语句 AST 分发覆盖范围

语句 dispatcher 会把 `StmtKind` variant 映射到存储、控制流、声明、include 或扩展路径：

| Variants | Lowering 路径 |
|---|---|
| `Echo`, `ExprStmt`, `Throw`, `Synthetic` | 直接语句 helper、表达式分发、异常 throw，或已经降低的语句序列 |
| `Assign`, `RefAssign`, `TypedAssign`, `ArrayAssign`, `NestedArrayAssign`, `ArrayPush`, `ListUnpack`, `PropertyAssign`, `StaticPropertyAssign`, `PropertyArrayPush`, `PropertyArrayAssign`, `StaticPropertyArrayPush`, `StaticPropertyArrayAssign` | Local/global/static 存储、引用别名、数组存储、解构和属性存储 helper |
| `If`, `IfDef`, `While`, `DoWhile`, `For`, `Foreach`, `Switch`, `Try`, `Break`, `Continue`, `Return` | Branching、编译期条件 lowering、循环、foreach 分发、switch lowering、异常/finally 控制流、循环退出和 return epilogue |
| `Include`, `IncludeOnceMark`, `IncludeOnceGuard`, `FunctionVariantGroup`, `FunctionVariantMark` | resolver 生成的 include guard 和 include-loaded function variant activation |
| `NamespaceDecl`, `NamespaceBlock`, `UseDecl`, `ConstDecl` | 主要是前端/name-resolution 产物；常量仍可通过 codegen context 使用 |
| `FunctionDecl`, `ClassDecl`, `EnumDecl`, `InterfaceDecl`, `TraitDecl`, `PackedClassDecl` | 延迟函数/方法生成，以及由元数据驱动的类、enum、interface、trait 和 packed-record setup |
| `Global`, `StaticVar` | 由符号支持的局部别名和每函数 static 存储 |
| `ExternFunctionDecl`, `ExternClassDecl`, `ExternGlobalDecl` | 语句生成期间仅注册；表达式/调用 lowering 使用收集到的 FFI 元数据 |

### Echo 和 print

```php
echo $x;
echo "a", "b";
$status = print $x;
```

1. 按源码顺序求值每个 `echo` 表达式 → 结果在寄存器中
2. 检查 null/false（若是则跳过打印，这匹配 PHP 中 `echo false` 不输出任何内容的行为）
3. 从 [ABI module](#the-abi-module) 调用 `emit_write_stdout()`

`print` 表达式复用同一个 stdout helper，然后把整数 `1` 写入表达式结果寄存器，使该值可被赋值、拼接或传给另一个表达式。

### 赋值

```php
$x = expr;
```

1. 求值表达式
2. 如果结果是借用的堆值，则在局部 slot 成为新 owner 前 retain 它
3. 覆盖堆支持 slot 时，释放 `$x` 之前 owned 的堆值
4. `emit_store()` — 把结果写入 `$x` 的栈 slot，并把堆支持类型的局部 slot 归类为 `Owned`

`int $x = 42;` 或 `buffer<int> $xs = buffer_new<int>(8);` 等带类型局部声明，在 checker 已将 `StmtKind::TypedAssign` 解析为具体 `PhpType` 后，会共享同一条存储路径。

### 常量声明

```php
const MAX = 100;
```

`ConstDecl` 注册编译期常量。值存储在 codegen context 中，并在任何通过 `ConstRef` 引用该常量的位置直接替换。不需要运行时存储或栈分配。

### 全局变量

```php
$x = 10;
function inc() {
    global $x;
    $x++;
}
```

函数内部的 `global` 语句声明变量引用的是全局存储，而不是局部栈 slot。Codegen 使用 BSS 分配的存储（`_gvar_NAME`，每个 16 字节）表示全局变量：

1. 在 `global $x;` 处：变量会在 context 中标记为 global。当前值从 `_gvar_x` 加载到局部栈 slot。
   局部视图会被跟踪为 BSS-backed owner 的借用别名。
2. 对全局变量赋值时：codegen 通过 `adrp`/`add`/`str` 写入 BSS 存储（`_gvar_x`），而不是写入局部栈 slot（或除局部栈 slot 外也写入 BSS）。
3. 在 `_main` 中：当 main 作用域赋值给任何函数声明为 `global` 的变量时，该值也会写入 `_gvar_NAME`，以便函数读取。

### Extern 声明

`ExternFunctionDecl`、`ExternClassDecl` 和 `ExternGlobalDecl` 在 codegen 期间是仅注册语句。它们的元数据已经由类型检查器收集并复制进 `Context`，因此 `emit_stmt()` 会把声明本身视为 no-op，而后续表达式 codegen 会使用记录的 FFI 数据。

Extern globals 通过 GOT-relative 寻址（`adrp ...@GOTPAGE` / `ldr ...@GOTPAGEOFF`）加载，而不是通过普通栈或 BSS slot。

### Static 变量

```php
function counter() {
    static $count = 0;
    $count++;
    echo $count;
}
```

Static 变量的值会跨函数调用保持。每个 static 变量获得两个 BSS slot：

- `_static_FUNC_VAR`（16 字节）— 存储持久值
- `_static_FUNC_VAR_init`（8 字节）— 初始化 flag（0 = 尚未初始化）

`static $count = 0;` 的 codegen：

1. 检查 init flag；如果已经初始化，跳到加载持久值
2. 如果尚未初始化：求值 init 表达式，存储到 BSS slot，把 init flag 设为 1
3. 把持久值加载到局部栈 slot

该每次调用的局部 slot 被跟踪为 `Borrowed`；持久 static 存储仍是长生命周期 owner。

在函数 epilogue 中，标记为 static 的变量会被写回它们的 BSS 存储。

### Static 属性

Static 属性按每个有效声明类属性使用一个全局 16 字节存储 slot：

- `_static_prop_CLASS_PROP` 存储当前值 payload
- 继承的 static 属性会指回声明类 slot，直到子类重新声明该属性
- 重新声明的 static 属性会获得单独的子类 slot

程序启动时，`_main` 会在用户语句运行前求值 static 属性默认值并存入这些 slot。`ClassName::$count` 这样的读取会直接从已解析符号加载，赋值则会在类型强制转换和对堆支持值释放旧值之后，把新结果存回同一符号。`static::$count` 使用转发的 called-class id（或实例方法中的 `$this`）在运行时选择重新声明的后代 slot；如果 late-bound slot 是 private 且当前方法作用域无法访问，生成的代码会发出 fatal private-static-property 诊断。

### List 解包

```php
[$a, $b, $c] = [10, 20, 30];
```

简单的局部位置解构仍是 `ListUnpack` 语句。Codegen 会：

1. 求值右侧表达式（数组）
2. 在栈上保存数组指针
3. 对列表中的每个变量：从数组中加载对应索引处的元素，将其存入变量栈 slot，并把堆支持元素标记为源容器的借用别名

更丰富的 PHP 解构模式会在检查和 codegen 之前由 parser 降低为普通合成赋值。跳过的条目不生成赋值，带 key 的条目变成用给定 key 读取数组，嵌套模式为嵌套源数组绑定隐藏临时值，非局部目标则复用与 `$arr[$i] = ...`、`$arr[] = ...`、`$obj->prop = ...` 和 static-property 写入相同的赋值 emitter。
