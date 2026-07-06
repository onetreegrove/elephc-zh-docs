### 作为 callback 参数的闭包

`array_map`、`array_filter`、`array_reduce`、`array_walk`、`usort`、`uksort`、`uasort` 和 `preg_replace_callback` 等 built-in 函数接受 callback 值。PHP callable 存储会携带 descriptor 指针；callback 运行时接收从该 descriptor 加载出的原生 entry，以及一个可选 environment pointer，然后通过 `blr` 调用该 entry。

对于通过 `array_map`、`array_filter`、`array_reduce`、`array_walk`、`usort`、`uksort`、`uasort` 和 `preg_replace_callback` 等 callback 运行时传入的捕获闭包，codegen 会构建一个临时 callback environment，其中包含原始 entry 地址及其隐藏的 `use (...)` 值。运行时把该 environment 传给生成的 callback wrapper，wrapper 会在调用闭包之前重新物化原始可见参数和隐藏捕获。`array_map()`、`array_filter()`、`array_reduce()`、`array_walk()`、`usort()`、`uksort()`、`uasort()` 和 `preg_replace_callback()` 会把 descriptor-valued callable 变量和 `callable` 参数路由到 descriptor-backed callback wrapper，因此存储的闭包捕获和 first-class-callable receiver environment 来自 descriptor，而不是来自可能已经改变的源码局部变量。这些 callback 运行时还会为运行时 callable-array 变量（例如 `[$object, $method]` 或 `[$class, $method]`）选择 descriptor case，并在运行时 receiver/class 和方法字符串匹配 public 方法后构建同样的 descriptor callback environment。这些运行时还可以把分支形态的捕获 callable 表达式路由到 descriptor-backed callback wrapper：environment 存储选中的 descriptor，wrapper 把可见参数装箱进临时 Mixed 参数数组，调用 descriptor 的 uniform invoker，为 callback 运行时强制转换或丢弃 boxed 结果，并在生成的 invoker 周围保留 runtime-loop callee-saved 寄存器。`CallbackFilterIterator` 和 `RecursiveCallbackFilterIterator` 使用该 descriptor environment 的堆支持变体，使分支选中的捕获 descriptor 以及运行时选中的 callable-array 变量或字面量 descriptor 能保持附着在 iterator 对象和递归子 filter 上。`iterator_apply()` 对分支形态的捕获 callback 和运行时选中的 callable-array 变量使用同一个 uniform descriptor invoker，其 callback 参数数组会在 iterator loop 之前求值一次，并在每次调用时复用。产生字符串的 descriptor-backed `array_map()` 和 `preg_replace_callback()` 调用会在释放 invoker 结果之前，把字符串结果从 boxed Mixed 值中 detach 出来。`call_user_func()` 和 `call_user_func_array()` 可以直接通过 callable descriptor 分发：带隐藏上下文的闭包和 first-class-callable 值会分配运行时 descriptor 副本，其静态 header 后跟 16 字节捕获 slot。动态 callback 分发使用携带 descriptor 标签的 `codegen::callable_dispatch` case，其中包含 PHP 可见名称、签名元数据、defaults、by-reference flag、variadic 元数据和隐藏捕获。Descriptor-selected callback 会把 entry slot 与用户函数和已生成的 closure/FCC wrapper 比较；当匹配的 case 暴露 invoker 时，调用点切回实际 descriptor 并调用 uniform wrapper。运行时字符串名 callback 会与用户函数、extern-wrapper、builtin-wrapper 和静态方法名进行大小写不敏感比较，物化匹配的 descriptor，然后调用 descriptor 的 uniform invoker wrapper。编译期静态方法 callable array 也会对直接变量和字面量调用、`call_user_func()` 调用和 `call_user_func_array()` 调用使用 static-method descriptor，包括 indexed spread 之前的关联 variadic tail 和位置 prefix。直接实例方法 callable-array 变量调用会从存储的 callable array slot 读取 receiver，而直接字面量调用会在可见调用参数之前求值 receiver；二者随后都会构建 receiver-prefixed descriptor 参数容器。直接 invokable-object 变量调用会从局部对象构建同样的 receiver-prefixed descriptor 参数容器，并使用 object-invoke 调用形态。带 receiver 绑定的 `call_user_func()` 调用如果只有一个 spread source，就会把该 source 容器通过 receiver-prefix normalizer 和 descriptor invoker 传递，而不是回退到直接方法生成。带 receiver 绑定的调用如果包含位置 prefix 后跟 indexed spread，会构建一个原始 Mixed-slot 索引参数数组，把 receiver 作为 descriptor slot zero 前置，追加 prefix 值，合并克隆的 indexed spread tail，然后让 descriptor normalizer 克隆并装箱该容器以供调用。把 spread prefix 与命名参数组合在一起的直接分支选中表达式调用，会从源码顺序的位置 prefix 加上命名 suffix 条目构建临时 Mixed hash；而唯一参数 segment 是一个 spread source 的直接调用，会把该 source 容器传给同一个 descriptor invoker。带位置 prefix 后跟 indexed spread 的直接 descriptor 调用使用同一个原始 Mixed-slot 索引容器 builder，但不添加 receiver slot。当局部调用点不再具备可信的静态签名或捕获列表时，对 callable 变量或数组元素的间接调用会回退到 descriptor invoker；indexed 容器中的变量参数、indexed spread 之前的位置 prefix，以及关联命名参数 hash 会被编码为 ref-cell marker，使生成的 invoker 可以应用 descriptor 中的运行时 by-reference flag，或为 by-value 参数解引用同一个 marker。Invoker 接收 `(descriptor, boxed argument container)`，自行加载 entry slot，在存在隐藏捕获时从 descriptor 重新加载，基于 boxed 容器 tag 分支到 indexed-array 或 associative-hash 物化，为声明为 array 的参数解箱 boxed array/hash payload，应用匹配签名，并返回 boxed `mixed`。`call_user_func_array()` descriptor invoker 接收一个克隆的临时参数容器，该容器被拓宽为 boxed `Mixed`，因此 wrapper 按 callable 签名共享，而不是按调用方的静态元素类型或参数数组形态共享。当 `call_user_func_array()` 目标是 by-reference callback 且接收字面量参数数组时，codegen 会为 by-reference 位置中的变量元素传递 frame-slot 地址，而不是加载数组 payload 值。

接收 descriptor 值的 extern `callable` 参数使用单独的 C-ABI trampoline 路径。Codegen 为每个调用点生成一个可变 descriptor slot 和一个 trampoline 符号；extern 调用把 retained descriptor 存入该 slot，把 trampoline 地址传给 C，然后 trampoline 在调用 descriptor invoker 之前把传入的标量/指针 callback 参数装箱。这让只有原始函数指针 slot 的 C API 能保留闭包捕获、first-class 方法 receiver 和分支选中的 descriptor 状态，而无需改变 C 签名。

当 callable 目标携带上下文时，First-class callable wrapper 会复用这条隐藏参数路径。`$obj->method(...)` 会把 receiver 记录为隐藏捕获；非局部 receiver 表达式会在 wrapper 创建前求值一次并存入隐藏临时值。`static::method(...)` 会记录转发的 called-class id，或在实例方法中记录 `$this`，从而为直接 callable 调用以及会转发 environment 的 callback 路径保留 late static binding。

## Generator 代码生成

**文件：**`src/codegen/functions/generator/`、`src/codegen/runtime/generators/`、`src/codegen/expr/objects/dispatch/vtable.rs`

包含 `yield` 的函数或闭包主体不会作为普通函数主体生成。Codegen 会生成两个符号：

1. `_fn_<name>` — 一个 wrapper，分配堆上的 `GeneratorFrame`，把它标记为内建 `Generator` 对象，把受支持的标量参数/捕获复制到 frame slot，清零局部 slot，并返回 frame 指针。
2. `_fn_<name>__resume` — 状态机入口点。状态 `0` 进入主体；每个 yield 都有一个编号 resume label。在 yield 处，resume 函数会把 key/value 装箱到 Mixed cell 中，替换 frame 的 last key/value slot，存储下一个 state index，并返回调用方。

Generator 闭包复用与普通延迟闭包相同的路径，但其隐藏的 `use (...)` 捕获会与可见参数一起复制进 generator frame。`yield from` 会把活跃的内部 generator 存储到 frame 的 `delegated_iter` slot，并通过用户可见 `Generator` 方法所使用的同一组 `__rt_gen_*` 运行时 helper 恢复它。

生成的 `Generator` 对象使用自定义 payload layout，而不是普通 PHP 属性。`current`、`key`、`valid`、`next`、`rewind`、`send`、`throw` 和 `getReturn` 的方法分发会在 vtable 查找前被拦截，并直接路由到 `__rt_gen_*`。AArch64 和 Linux `x86_64` 都遵循同样的高层状态机模型；wrapper、resume dispatcher 和运行时 helper emitter 会在内部选择目标平台特定的指令序列。

## Fiber 代码生成

**文件：**`src/codegen/expr/objects/allocation.rs`、`src/codegen/expr/objects/dispatch/`、`src/codegen/expr/objects/fiber_callable.rs`、`src/codegen/expr/objects/fiber_wrapper.rs`、`src/codegen/functions/fiber_wrapper.rs`、`src/codegen/runtime/fibers/`

`Fiber` 是内建类，但 codegen 不会通过普通对象构造器和方法分发路径降低它。`new Fiber($callable)` 会被拦截，把原始字符串 callback、callable-array 和 invokable-object 形态物化为 callable descriptor，然后委托给 `__rt_fiber_construct`；后者会分配更大的运行时管理 Fiber 对象，创建受保护的原生栈，存储 callable descriptor 指针，并记录用于把 Fiber start 值适配到 callback ABI 的生成 wrapper 标签。存储的实例方法 callable array 会把 `$callback[0]` 中的 receiver 绑定进 descriptor capture，因此后续对源 callable 变量的写入无法改变 Fiber 主体。内联 receiver 表达式、invokable-object 表达式，以及运行时选中的 callable-array 变量或字面量会在构造时求值一次，然后 receiver 才被存入 descriptor。

每个被接受的 Fiber callback 都会获得一个延迟 entry wrapper，与延迟闭包主体一起生成。Wrapper 在 Fiber 栈上运行，从 `start_args[0..6]` 重新加载 boxed `start()` 值，把它们解箱为 callback 声明的参数类型，从存储的 callable descriptor 的运行时捕获 slot 重新加载隐藏捕获或方法 receiver，从该 descriptor 加载原始 entry，以普通 ABI 物化方式调用它，并把最终返回值重新装箱为 `mixed`。

实例和静态 Fiber 方法也会被拦截：

- `$fiber->start(...)` 会把最多七个 boxed `mixed` start 参数 spill 到 Fiber 对象中，然后调用 `__rt_fiber_start`；callable 捕获和 receiver 已经存储在 descriptor 中，不会被 start 参数覆盖。
- `$fiber->resume($value)`、`$fiber->throw($exception)`、`$fiber->getReturn()` 和状态 predicate 会直接分支到各自的 `__rt_fiber_*` 运行时 helper。
- `Fiber::suspend($value)` 和 `Fiber::getCurrent()` 会降低为运行时 helper 调用，而不是普通静态方法分发。

AArch64 和 Linux `x86_64` 使用同一套高层 lowering。最终的寄存器移动、临时栈 layout、直接/间接调用和 frame setup 都通过 ABI 模块完成，使 Fiber wrapper 遵循各目标平台的调用约定，而不是在共享代码中硬编码 ARM64 寄存器名。

## 关联数组代码生成

关联数组使用存储在堆上的 hash table。Codegen 在各个层面都不同于索引数组：

### 字面量创建

```php
$m = ["name" => "Alice", "age" => "30"];
```

1. 用初始容量和值类型 tag 调用 `__rt_hash_new` → `x0` = hash table pointer
2. 对每个 key-value pair：求值 key（string → `x1`/`x2`），求值 value，调用 `__rt_hash_set`
