## Class 类型检查

interface 已知后，checker 会构建每个 class，使其能够看到 parent-first 属性布局、继承方法签名、abstract/final 约束、已实现 interface contracts 和 vtable slot 分配。

当类型检查器遇到 `ClassDecl` 时，它会：

1. **注册 class** 到 `classes: HashMap<String, ClassInfo>` map 中
2. **解析 parent chain**（`extends`）并合并继承元数据
3. **记录每个实例属性**及其类型（属性类型存在时使用声明类型，否则从默认值或构造函数赋值推断），并在继承对象布局中分配固定 offset
4. **类型检查每个方法 body**，其中 `$this` 绑定到 `Object(ClassName)`
5. **构建 `ClassInfo`**，其中包含实例和 static 属性类型、默认值、visibility maps、final property/method sets、signatures、declaring/implementation class maps、instance/static vtable slots、implemented interface lists，以及 constructor-to-property mappings

`ClassInfo` struct：

```rust
pub struct ClassInfo {
    pub class_id: u64,
    pub parent: Option<String>,
    pub is_abstract: bool,
    pub is_final: bool,
    pub is_readonly_class: bool,
    pub allow_dynamic_properties: bool, // #[\AllowDynamicProperties] (PHP 8.2)
    pub constants: HashMap<String, Expr>, // user-declared class constants
    pub attribute_names: Vec<String>,
    pub attribute_args: Vec<Option<Vec<AttrArgValue>>>,
    pub method_attribute_names: HashMap<String, Vec<String>>,
    pub method_attribute_args: HashMap<String, Vec<Option<Vec<AttrArgValue>>>>,
    pub property_attribute_names: HashMap<String, Vec<String>>,
    pub property_attribute_args: HashMap<String, Vec<Option<Vec<AttrArgValue>>>>,
    pub used_traits: Vec<String>,
    pub properties: Vec<(String, PhpType)>,
    pub property_offsets: HashMap<String, usize>,
    pub property_declaring_classes: HashMap<String, String>,
    pub defaults: Vec<Option<Expr>>,
    pub property_visibilities: HashMap<String, Visibility>,
    pub declared_properties: HashSet<String>,
    pub final_properties: HashSet<String>,
    pub readonly_properties: HashSet<String>,
    pub reference_properties: HashSet<String>,
    pub abstract_properties: HashSet<String>,
    pub abstract_property_hooks: HashMap<String, PropertyHookContract>,
    pub static_properties: Vec<(String, PhpType)>,
    pub static_defaults: Vec<Option<Expr>>,
    pub static_property_declaring_classes: HashMap<String, String>,
    pub static_property_visibilities: HashMap<String, Visibility>,
    pub declared_static_properties: HashSet<String>,
    pub final_static_properties: HashSet<String>,
    pub method_decls: Vec<ClassMethod>,
    pub methods: HashMap<String, FunctionSig>,
    pub static_methods: HashMap<String, FunctionSig>,
    pub callable_method_return_sigs: HashMap<String, FunctionSig>,
    pub callable_array_method_return_sigs: HashMap<String, FunctionSig>,
    pub method_visibilities: HashMap<String, Visibility>,
    pub final_methods: HashSet<String>,
    pub method_declaring_classes: HashMap<String, String>,
    pub method_impl_classes: HashMap<String, String>,
    pub vtable_methods: Vec<String>,
    pub vtable_slots: HashMap<String, usize>,
    pub static_method_visibilities: HashMap<String, Visibility>,
    pub final_static_methods: HashSet<String>,
    pub static_method_declaring_classes: HashMap<String, String>,
    pub static_method_impl_classes: HashMap<String, String>,
    pub static_vtable_methods: Vec<String>,
    pub static_vtable_slots: HashMap<String, usize>,
    pub interfaces: Vec<String>,
    pub constructor_param_to_prop: Vec<Option<String>>,
}
```

`vtable_methods` / `vtable_slots` 驱动普通继承实例分发，而 `static_vtable_methods` / `static_vtable_slots` 携带并行元数据，用于 `static::method()` late static binding。`allow_dynamic_properties` 记录 PHP 8.2 `#[\AllowDynamicProperties]` attribute，因此 codegen 可以把未声明属性存储路由到每对象 side table。`*_attribute_names` / `*_attribute_args` 字段携带 class 及其方法和属性的 PHP 8 attribute 元数据，使 Reflection codegen 路径可以实体化 `ReflectionAttribute` 对象。`abstract_property_hooks` 记录具体子类必须满足的 PHP 8.4 property hook contracts。

对于 abstract methods，checker 会保留继承签名，但有意把 implementation-class 条目留空，直到具体子类提供 body。如果 inheritance + trait flattening + interface conformance checks 后仍有任何 abstract 或 interface requirement 未解决，具体 class 会被拒绝。

检查属性访问（`$obj->prop`）时，类型检查器会验证：

- 变量是 `Object` 类型
- class 拥有该名称的属性
- 属性可访问（`public`、来自声明 class 或子类的 `protected`，或只来自声明 class 的 `private`）

Nullsafe access（`$obj?->prop`、`$obj?->method()`）接受对象和 nullable-object receiver。如果静态 receiver 类型恰好是 `null`，表达式类型就是 `null`，不会验证被跳过的成员。如果 receiver 是 `T|null`，checker 会针对 `T` 验证成员，并把结果拓宽为包含 `null`。

当 nullable union 解析为一个具体 class 时，普通成员访问也会被接受。这使 `$obj?->profile->address` 这样的混合链可以类型化：较早 nullsafe segment 引入的 null 会保留在推断结果中，而 codegen 决定后续普通 `->` 是由共享 nullsafe branch 跳过，还是接收真实 null 并像 PHP 一样 warning/fatal。

检查 static 属性访问（`ClassName::$prop`、`self::$prop`、`parent::$prop` 或 `static::$prop`）时，checker 会把 receiver 解析到 class scope，验证 static 属性存在，根据 declaring class 应用可见性规则，并在赋值时强制声明属性类型。static 属性存储以有效 declaring class 为 key：继承的 static 属性共享 parent slot，直到子类重新声明该属性，此时子类会获得自己的 slot。非 private 重声明必须保持声明类型 invariant，不能降低可见性，不能覆盖 `final`；private 重声明相互独立。codegen 会处理 late-bound `static::$prop` 分发，并在被调用 class 解析到当前方法作用域外的 private 重声明 slot 时报告运行时 fatal error。

检查属性写入时，显式声明的属性类型保持固定。默认值、直接赋值、数组写入以及经由未类型化参数路由的构造函数赋值，都必须与声明属性类型兼容。Nullable 和 union 属性类型使用与 typed locals 相同的 boxed mixed 运行时表示，而未类型化属性保留现有推断和 refinement 行为。

构造函数提升属性到达 checker 时，已经是普通 class properties 加上解析器生成的合成构造函数赋值。这使提升参数 type hints、默认值、可见性、readonly 检查和按引用参数验证可以复用与手写构造函数赋值相同的 `FunctionSig`、属性元数据和 constructor-to-property mapping。checker 会在 `reference_properties` 中记录按引用提升的属性，codegen 用它来存储 alias pointer，而不是 owned property value。

PHP 8.4 property hook contracts 在 class 元数据上表示为 abstract property requirements。Interface properties 和 abstract trait/class properties 会分别记录 get 和 set 类型义务：get contracts 是协变的，set contracts 是逆变的，get+set contracts 对普通属性实际上是 invariant。具体 class 在重新声明兼容实例属性时，会清除这些 abstract requirements。

检查方法调用时，它会验证方法存在，强制方法可见性（`public`、子类可见的 `protected`、仅 declaring-class 可见的 `private`），根据方法的 `FunctionSig` 验证参数数量和类型，把 `parent::method()` 解析到直接父类，把 `self::method()` 解析到当前 lexical class，并接受 `static::method()` 作为针对当前 class hierarchy 的 late-static-bound static call。First-class callable 验证会为 `static::method(...)` 和 `$obj->method(...)` 这样的稳定对象 receiver 目标使用相同方法元数据。

检查 `new ClassName(...)` 时，它还会在 codegen 前拒绝 interface 和 abstract class。

### 内置 coroutine 和 iterator class

`Throwable`、`Error`、`Exception`、`Fiber` 和 `FiberError` 会在检查用户代码前注册为内置 class-like 类型。`FiberError` extends `Error`，与 PHP throwable hierarchy 匹配。`Fiber` 方法 body 是 `ClassInfo` 中的占位符：其签名使调用可通过类型检查，而 codegen 会拦截构造、实例方法、`Fiber::suspend()` 和 `Fiber::getCurrent()`，并把它们路由到 `__rt_fiber_*` helpers。

`src/types/fibers.rs` 负责 Fiber callbacks 的额外静态检查。`new Fiber(...)` 接受闭包、已知 callable 变量、first-class callables、运行时字符串 callbacks、static-method callable arrays、存储的或字面量实例方法 callable arrays（例如 `[$object, "method"]`）、运行时选择的 callable arrays（例如 `[$object, $method]`），以及 invokable-object 表达式（例如 `new Job()`）。literal string callbacks 会尽可能解析到 user-function、builtin、extern 或 public static-method signatures；动态字符串变量会把 descriptor selection 延迟到 codegen。存储的实例方法 callable-array 变量会通过同一 first-class callable signature 路径检查，而 codegen 会从数组 slot 自身绑定 receiver。可见 callback 参数数量上限为七个 start arguments；当签名静态已知时，按引用 callback start 参数会被拒绝。闭包捕获和 receiver environments 位于 callable descriptor capture slots，而不是 Fiber 的可见 start-argument 区域。通过 `start()`、`resume()`、`suspend()` 和 `getReturn()` 移动的值都会类型化为 boxed `mixed`。

`Iterator`、`IteratorAggregate` 和 final 内置 `Generator` class 由 `src/types/checker/builtin_iterators.rs` 注入。`Generator` implements `Iterator`，并为 `current`、`key`、`next`、`valid`、`rewind`、`send`、`throw` 和 `getReturn` 携带占位方法 body；codegen 会拦截这些方法并路由到 `__rt_gen_*` helpers。`yield_validation` 会把任何包含 `yield` 的函数或闭包 body 标记为返回 `Object("Generator")`，同时仍允许与 `Generator`、`Iterator`、`Traversable` 或 `iterable` 兼容的声明返回类型。

## 输出：CheckResult

类型检查器会产生一个 `CheckResult`：

```rust
pub struct CheckResult {
    pub global_env: TypeEnv,                    // variable name → type
    pub functions: HashMap<String, FunctionSig>, // function name → signature
    pub callable_param_sigs: HashMap<(String, String), FunctionSig>, // (function, param) → callable signature
    pub callable_return_sigs: HashMap<String, FunctionSig>, // function → returned callable signature
    pub callable_array_return_sigs: HashMap<String, FunctionSig>, // function → returned callable-array element signature
    pub interfaces: HashMap<String, InterfaceInfo>, // interface name → interface info
    pub classes: HashMap<String, ClassInfo>,     // class name → class info
    pub enums: HashMap<String, EnumInfo>,
    pub packed_classes: HashMap<String, PackedClassInfo>,
    pub extern_functions: HashMap<String, ExternFunctionSig>,
    pub extern_classes: HashMap<String, ExternClassInfo>,
    pub extern_globals: HashMap<String, PhpType>,
    pub required_libraries: Vec<String>,
    pub warnings: Vec<CompileWarning>,
}
```

它会传递给 [code generator](the-codegen.md)，后者用它来：

- 为每个变量分配正确数量的栈空间
- 选择正确的寄存器和指令
- 发出恰当的类型强制转换
- 把 FFI 声明和 linker requirements 带入 codegen

## 错误示例

```php
$x = 42;
$x = "hello";
// Error: Type error: cannot reassign $x from Int to Str

strlen(42);
// Error: strlen() expects string, got Int

unknown_func();
// Error: Undefined function: unknown_func

substr("hello");
// Error: substr() takes 2 or 3 arguments
```

每个错误都包含精确的行和列，这要归功于从 [lexer](the-lexer.md) 一路携带过来的 `Span`。
