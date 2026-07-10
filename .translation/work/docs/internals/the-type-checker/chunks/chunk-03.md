## Class type checking

After interfaces are known, the checker builds each class so it sees parent-first property layout, inherited method signatures, abstract/final constraints, implemented interface contracts, and vtable slot assignments.

When the type checker encounters a `ClassDecl`, it:

1. **Registers the class** in a `classes: HashMap<String, ClassInfo>` map
2. **Resolves the parent chain** (`extends`) and merges inherited metadata
3. **Records each instance property** with its type (declared when a property type is present, otherwise inferred from default values or constructor assignments) and a fixed offset in the inherited object layout
4. **Type-checks each method body** with `$this` bound to `Object(ClassName)`
5. **Builds `ClassInfo`** containing instance and static property types, defaults, visibility maps, final property/method sets, signatures, declaring/implementation class maps, instance/static vtable slots, implemented interface lists, and constructor-to-property mappings

The `ClassInfo` struct:

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

`vtable_methods` / `vtable_slots` drive ordinary inherited instance dispatch, while `static_vtable_methods` / `static_vtable_slots` carry the parallel metadata used by `static::method()` late static binding. `allow_dynamic_properties` records the PHP 8.2 `#[\AllowDynamicProperties]` attribute so codegen can route undeclared property storage through a per-object side table. The `*_attribute_names` / `*_attribute_args` fields carry PHP 8 attribute metadata for the class, its methods, and its properties so the Reflection codegen path can materialize `ReflectionAttribute` objects. `abstract_property_hooks` records PHP 8.4 property hook contracts that concrete subclasses must satisfy.

For abstract methods, the checker keeps the inherited signature but intentionally leaves the implementation-class entry unset until a concrete subclass provides a body. Concrete classes are rejected if any abstract or interface requirement remains unresolved after inheritance + trait flattening + interface conformance checks.

When checking property access (`$obj->prop`), the type checker validates that:

- The variable is an `Object` type
- The class has a property with that name
- The property is accessible (`public`, `protected` from the declaring class or a subclass, or `private` only from the declaring class)

Nullsafe access (`$obj?->prop`, `$obj?->method()`) accepts object and nullable-object receivers. If the static receiver type is exactly `null`, the expression type is `null` without validating the skipped member. If the receiver is `T|null`, the checker validates the member against `T` and widens the result to include `null`.

Ordinary member access on a nullable union is also accepted when the union resolves to one concrete class. That keeps mixed chains such as `$obj?->profile->address` typeable: the null introduced by the earlier nullsafe segment remains in the inferred result, while codegen decides whether a later ordinary `->` is skipped by the shared nullsafe branch or receives a real null and must warn/fatal like PHP.

When checking static property access (`ClassName::$prop`, `self::$prop`, `parent::$prop`, or `static::$prop`), the checker resolves the receiver to a class scope, verifies the static property exists, applies visibility rules against the declaring class, and enforces declared property types on assignment. Static property storage is keyed by the effective declaring class: inherited static properties share the parent slot until a subclass redeclares the property, at which point the subclass gets its own slot. Non-private redeclarations must keep invariant declared types, cannot reduce visibility, and cannot override `final`; private redeclarations are independent. Codegen handles late-bound `static::$prop` dispatch and reports a runtime fatal error if the called class resolves to a private redeclared slot outside the current method scope.

When checking property writes, explicitly declared property types stay fixed. Defaults, direct assignments, array writes, and constructor assignments routed through untyped parameters must be compatible with the declared property type. Nullable and union property types use the same boxed mixed runtime representation as typed locals, while untyped properties keep the existing inference and refinement behavior.

Constructor-promoted properties reach the checker as ordinary class properties plus synthetic constructor assignments produced by the parser. This lets promoted parameter type hints, defaults, visibility, readonly checks, and by-reference parameter validation reuse the same `FunctionSig`, property metadata, and constructor-to-property mapping used by handwritten constructor assignments. The checker records by-reference promoted properties in `reference_properties`, which codegen uses to store an alias pointer instead of an owned property value.

PHP 8.4 property hook contracts are represented as abstract property requirements on class metadata. Interface properties and abstract trait/class properties record separate get and set type obligations: get contracts are covariant, set contracts are contravariant, and get+set contracts are effectively invariant for ordinary properties. Concrete classes clear those abstract requirements when they redeclare a compatible instance property.

When checking method calls, it verifies the method exists, enforces method visibility (`public`, subclass-visible `protected`, declaring-class-only `private`), validates argument count and types against the method's `FunctionSig`, resolves `parent::method()` against the immediate parent class, resolves `self::method()` against the current lexical class, and accepts `static::method()` as a late-static-bound static call against the current class hierarchy. First-class callable validation uses the same method metadata for `static::method(...)` and stable object receiver targets such as `$obj->method(...)`.

When checking `new ClassName(...)`, it also rejects interfaces and abstract classes before codegen.

### Built-in coroutine and iterator classes

`Throwable`, `Error`, `Exception`, `Fiber`, and `FiberError` are registered as built-in class-like types before user code is checked. `FiberError` extends `Error`, matching PHP's throwable hierarchy. `Fiber` method bodies are placeholders in `ClassInfo`: their signatures make calls type-checkable, while codegen intercepts construction, instance methods, `Fiber::suspend()`, and `Fiber::getCurrent()` and routes them to `__rt_fiber_*` helpers.

`src/types/fibers.rs` owns the additional static checks for Fiber callbacks. `new Fiber(...)` accepts closures, known callable variables, first-class callables, runtime string callbacks, static-method callable arrays, stored or literal instance-method callable arrays such as `[$object, "method"]`, runtime-selected callable arrays such as `[$object, $method]`, and invokable-object expressions such as `new Job()`. Literal string callbacks are resolved to user-function, builtin, extern, or public static-method signatures when possible; dynamic string variables defer descriptor selection to codegen. Stored instance-method callable-array variables are checked through the same first-class callable signature path, while codegen binds the receiver from the array slot itself. The visible callback parameter count is capped at seven start arguments, and by-reference callback start parameters are rejected when the signature is statically known. Closure captures and receiver environments live in callable descriptor capture slots rather than in Fiber's visible start-argument area. Values moving through `start()`, `resume()`, `suspend()`, and `getReturn()` are typed as boxed `mixed`.

`Iterator`, `IteratorAggregate`, and the final built-in `Generator` class are injected by `src/types/checker/builtin_iterators.rs`. `Generator` implements `Iterator` and carries placeholder method bodies for `current`, `key`, `next`, `valid`, `rewind`, `send`, `throw`, and `getReturn`; codegen intercepts those methods and routes them to `__rt_gen_*` helpers. `yield_validation` marks any function or closure body containing `yield` as returning `Object("Generator")`, while still allowing declared return types compatible with `Generator`, `Iterator`, `Traversable`, or `iterable`.

## Output: CheckResult

The type checker produces a `CheckResult`:

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

This is passed to the [code generator](the-codegen.md), which uses it to:

- Allocate the right amount of stack space per variable
- Choose the correct registers and instructions
- Emit proper type coercions
- Carry FFI declarations and linker requirements into codegen

## Error examples

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

Each error includes the exact line and column, thanks to the `Span` carried through from the [lexer](the-lexer.md).