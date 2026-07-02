---
title: "架构"
description: "模块图、调用约定和流水线图。"
sidebar:
  order: 10
---

## 编译流水线

```
PHP source (.php)
    │
    ▼
┌─────────┐
│  Lexer   │  src/lexer/
│          │  scan.rs, literals.rs, cursor.rs, token.rs
│          │  Source text → Vec<(Token, Span)>
└────┬─────┘
     │
     ▼
┌─────────┐
│  Parser  │  src/parser/
│          │  expr/, stmt/, control.rs, ast/
│          │  Tokens → Program (Vec<Stmt>)
└────┬─────┘
     │
     ▼
┌────────────────┐
│ MagicConstants │  src/magic_constants.rs
│                │  Lowers PHP magic constants per source file before
│                │  include inlining and semantic passes.
└────┬───────────┘
     │
     ▼
┌─────────────┐
│ Conditional │  src/conditional/
│             │  Applies CLI `--define` symbols to `ifdef` branches.
│             │  Removes inactive AST branches before include resolution.
└────┬────────┘
     │
     ▼
┌──────────┐
│ Autoload │  src/autoload/
│ (build)  │  Reads Composer autoload metadata and extracts supported
│          │  top-level `spl_autoload_register()` rules.
└────┬─────┘
     │
     ▼
┌─────────┐
│ Resolver │  src/resolver/
│          │  Pre-scans statically resolvable include declarations,
│          │  inlines executable include bodies, and lowers *_once guards.
└────┬─────┘
     │
     ▼
┌──────────────┐
│ NameResolver │  src/name_resolver/
│              │  Flattens namespace/use scopes and rewrites names to
│              │  canonical fully-qualified names before semantic passes.
└─────┬────────┘
      │
      ▼
┌──────────┐
│ Autoload │  src/autoload/
│  (run)   │  Inserts Composer/SPL-resolved class files before the first
│          │  reference that needs each class-like symbol.
└────┬─────┘
     │
     ▼
┌──────────────┐
│  Optimizer   │  src/optimize/
│   (fold)     │  Folds scalar constants and simplifies pure expressions
│              │  before type checking.
└─────┬────────┘
      │
      ▼
┌─────────┐
│  Type    │  src/types/
│  Checker │  traits.rs, checker/mod.rs, checker/builtins/, checker/functions/, warnings/
│          │  Validates types, computes packed layouts, collects warnings, returns CheckResult
└────┬─────┘
     │
     ▼
┌──────────────┐
│   Exports    │  src/exports.rs
│    Scan      │  Collects #[Export]-marked functions and validates their
│              │  C-ABI signatures for --emit cdylib (warns and ignores
│              │  them in executable mode).
└─────┬────────┘
      │
      ▼
┌──────────────┐
│  Optimizer   │  src/optimize/
│ (propagate)  │  Propagates scalar locals conservatively after
│              │  successful checking.
└─────┬────────┘
      │
      ▼
┌──────────────┐
│  Optimizer   │  src/optimize/
│  (prune)     │  Removes constant-dead control flow after successful
│              │  checking.
└─────┬────────┘
      │
      ▼
┌──────────────┐
│  Optimizer   │  src/optimize/
│ (normalize)  │  Canonicalizes equivalent control-flow shells into
│              │  simpler AST shapes.
└─────┬────────┘
      │
      ▼
┌──────────────┐
│  Optimizer   │  src/optimize/
│   (DCE)      │  Drops leftover unreachable or non-observable
│              │  statements from the normalized AST.
└─────┬────────┘
      │
      ▼
┌─────────────┐
│ EIR Lowerer │  src/ir_lower/ + src/ir/
│             │  Lowers the checked optimized AST into validated EIR.
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ EIR passes  │  src/ir_passes/
│             │  Module-level fixed-point pipeline: a cross-function
│             │  small-function inliner interleaved with the per-function
│             │  pass driver (identity folding, peephole rewrites, constant
│             │  folding, common-subexpression elimination, loop-invariant
│             │  code motion, dead-instruction elimination, dead-store
│             │  elimination, branch simplification) plus dominance and loop
│             │  analysis and linear-scan register allocation (liveness,
│             │  intervals, pools) before codegen.
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ EIR Codegen │  src/codegen_ir/ + shared src/codegen/abi/
│             │  Emits target assembly text from EIR. The legacy AST backend
│             │  remains in src/codegen/ behind --ast-backend.
└──────┬──────┘
     │
     ▼
┌───────────────┐
│ Tooling glue  │  src/runtime_cache.rs, src/source_map.rs
│               │  Reuses cached runtime objects, optionally emits
│               │  sidecar source maps, and feeds timing output in CLI mode.
└─────┬─────────┘
      │
      ▼
┌─────────┐
│ as + ld  │  System assembler and linker
│          │  .s → .o → target-native binary
└─────────┘
```

## 目标平台模型

编译器现在将目标平台的操作系统端与指令集区分开来：

- `Platform` 描述了操作系统 / 二进制格式 / libc 相关的事项，例如 macOS 与 Linux。
- `Arch` 描述了指令集和调用约定，例如 `AArch64` 与 `X86_64`。
- `Target` 结合了两者，并从 CLI 传递到代码生成（codegen）和测试套件（test harness）中。

AArch64 仍然是建立最完善且文档最齐全的后端（macOS 和 Linux），并且显式的 `Target` 模型现在也涵盖了 Linux `x86_64` 及其特有的 ABI/运行时（runtime）切片。`Target` 的拆分允许每个 ISA 与其他 ISA 并存，而无需重新引入以往“`Linux` 自动意味着 ARM64”的假设。

## 模块图

```
src/
├── lib.rs                     Public module exports
├── main.rs                    CLI binary entry point
├── cli.rs                     Command-line option parsing
├── pipeline.rs                Frontend/backend compilation pipeline
├── exports.rs                 #[Export] collection and C-ABI signature validation for --emit cdylib
├── linker.rs                  Assembler and linker invocation
├── timings.rs                 Phase timing collection/reporting
├── span.rs                    Source position (line, col)
├── intrinsics.rs              Compiler-recognized intrinsic method calls for runtime-managed core objects
├── string_bytes.rs            Parser string-literal payload → PHP runtime bytes conversion
├── magic_constants.rs         Per-file lowering for PHP magic constants
├── magic_constants/           File/scope/trait magic-constant walkers
├── conditional/               Build-time `ifdef` pass
├── autoload/                  Composer/SPL AOT autoload indexing, rule interpretation, and file insertion
├── resolver/                  Include/require resolution, declaration discovery, once guards
├── optimize.rs                Public optimizer entry points and effect context
├── optimize/                  Constant folding, constant propagation, control-flow pruning, normalization, dead-code elimination
├── ir/                        EIR types, builder, validator, printer, effects, and tests
├── ir_lower/                  Active checked-AST to EIR lowering
├── ir_passes/                 EIR optimization pass driver, identity folding, peephole patterns, constant folding, common-subexpression elimination, loop-invariant code motion, dead-instruction elimination, dead-store elimination, branch simplification, the cross-function small-function inliner (run to a module-level fixed point), dominance analysis, loop analysis, and linear-scan register allocation
├── codegen_ir/                Active EIR to target assembly backend
├── runtime_cache.rs           Cached shared runtime object preparation
├── source_map.rs              Assembly comment markers → JSON sidecar map
├── termination.rs             Structured terminal-effect analysis shared by checker and optimizer
├── names.rs                   Qualified/FQN name model + assembly symbol mangling
├── name_resolver/             Namespace/use resolution to canonical names
├── pdo_prelude.rs             PDO standard-library prelude injection entry point
├── pdo_prelude/               PDO driver detection from the DSN prefix
├── tz_prelude.rs              Timezone-introspection prelude injection entry point
├── tz_prelude/                Timezone-introspection prelude usage detection
├── list_id_prelude.rs         DateTimeZone identifier-list prelude injection entry point
├── list_id_prelude/           Identifier-list prelude detection and baked table data
├── var_export_prelude.rs      var_export prelude injection entry point
├── var_export_prelude/        var_export prelude usage detection
│
├── lexer/
│   ├── mod.rs                 tokenize() → Vec<(Token, Span)>
│   ├── token.rs               Token enum
│   ├── cursor.rs              Byte-level source reader
│   ├── scan.rs                Main scanning loop, operators
│   ├── literals.rs            String, number, variable, keyword scanning entry point
│   └── literals/              Identifier, number, and string literal scanners
│
├── parser/
│   ├── mod.rs                 parse() → Program
│   ├── ast/                   ExprKind, StmtKind, BinOp, CastType
│   ├── expr/                  Pratt parser passes and expression helpers
│   ├── stmt/                  Statement parsing, assignment, functions, OOP, namespaces, FFI
│   └── control.rs             if, while, for, do-while, foreach, try/catch/finally
│
├── types/
│   ├── mod.rs                 Public checker entry point and type exports
│   ├── model.rs               PhpType enum and TypeEnv
│   ├── result.rs              CheckResult and semantic metadata returned by the checker
│   ├── schema.rs              Class/interface/enum/trait metadata models
│   ├── signatures.rs          Built-in call signatures and first-class callable wrappers
│   ├── call_args/             Shared named/spread call-argument planner
│   ├── array_keys.rs          PHP array-key normalization helpers
│   ├── ffi.rs                 C-facing extern type models
│   ├── fibers.rs              Fiber callback validation helpers
│   ├── traits.rs              Trait flattening and conflict-resolution helpers
│   ├── traits/                Trait expansion, merge, and validation helpers
│   ├── warnings/              Non-fatal diagnostics (unused vars, unreachable code)
│   └── checker/
│       ├── mod.rs             Type-checker orchestration boundary
│       ├── driver/            Main checker driver and program passes
│       ├── builtin_interfaces.rs Built-in SPL/core interface injection
│       ├── builtin_iterators.rs Built-in Iterator / IteratorAggregate metadata
│       ├── builtin_json.rs    JsonException / JsonSerializable metadata
│       ├── builtin_spl_classes.rs SPL class metadata orchestration
│       ├── builtin_spl_classes/ Focused SPL container and iterator metadata builders
│       ├── builtin_spl_exceptions.rs SPL exception hierarchy metadata
│       ├── builtin_stdclass.rs stdClass dynamic-property metadata
│       ├── builtin_types/     Shared builtin class/type helper predicates
│       ├── builtins/          Built-in function type signatures
│       ├── callables/         Closure, extern-callable, and first-class callable signature resolution
│       ├── extern_decl.rs     Extern declaration validation
│       ├── functions.rs       Function-checking module root / orchestration
│       ├── functions/         Call validation, signature resolution, return collection
│       ├── inference/         Focused expression and object inference helpers
│       ├── method_pass.rs     Method pre-declaration and override checking
│       ├── schema/            Class, interface, enum, and declaration validation
│       ├── stmt_check.rs      Statement-checking module root
│       ├── stmt_check/        Assignment and control-flow statement checks
│       ├── type_compat.rs     Type-compatibility module root
│       ├── type_compat/       Declaration, object, pointer, and union compatibility helpers
│       ├── yield_validation/  Generator return coercion and yield-scope validation
│       └── ...
│
├── codegen/
│   ├── mod.rs                 Frozen legacy AST-backend orchestration plus shared runtime feature scans
│   ├── driver_support.rs      Pipeline glue and orchestration helpers
│   ├── main_emission.rs       Top-level program, globals, and deferred-body emission
│   ├── class_methods.rs       Instance/static method emission orchestration
│   ├── function_variants.rs   Include-loaded function variant dispatchers
│   ├── interface_wrappers.rs  Interface dispatch return-shape adapters
│   ├── callables.rs           Top-level callable metadata and indirect-call helpers
│   ├── reflection.rs          Shared ReflectionAttribute materialization helpers
│   ├── prescan.rs             Pre-pass that collects program-wide codegen metadata
│   ├── program_usage.rs       Program-usage analysis feeding metadata emission
│   ├── program_usage/         Required-class and variable usage scanners
│   ├── functions/generator/   Generator wrapper and resume state-machine lowering
│   ├── expr.rs                Expression codegen dispatcher
│   ├── expr/                  Expression submodules
│   │   ├── arrays.rs          Array-expression dispatch
│   │   ├── arrays/            `access.rs`, `indexed.rs`, `assoc.rs`
│   │   ├── assignment.rs      Assignment expression lowering
│   │   ├── binops/            `arithmetic.rs`, `array_union.rs`, `comparison.rs`, `target.rs`, `mod.rs`
│   │   ├── calls.rs           Call-expression dispatch
│   │   ├── calls/             `function.rs`, `closure.rs`, `first_class.rs`, `indirect.rs`, `args/`
│   │   ├── chains.rs          Mixed nullsafe/member postfix-chain lowering
│   │   ├── coerce.rs          Truthiness / string / null coercions
│   │   ├── compare/           Comparison and widening helpers
│   │   ├── diagnostics.rs     Error-control / runtime-diagnostic expression helpers
│   │   ├── helpers.rs         Shared expression-codegen utilities
│   │   ├── objects.rs         Object-expression dispatch
│   │   ├── objects/           `allocation.rs`, `access.rs`, `instanceof.rs`, `nullsafe.rs`, `static_properties.rs`, `dispatch/`
│   │   ├── ownership.rs       Result ownership classification
│   │   ├── scalars.rs         Literal / negate / bit-not / logical-not lowering
│   │   ├── ternary.rs         Full and short ternary lowering
│   │   └── variables.rs       Variable load / increment / decrement helpers
│   ├── stmt.rs                Statement codegen dispatcher
│   ├── stmt/                  Statement submodules
│   │   ├── arrays.rs          Array statement dispatch
│   │   ├── arrays/            `assign/`, `push.rs`, `unpack.rs`
│   │   ├── assignments.rs     Variable / property assignment dispatch
│   │   ├── assignments/       `locals.rs`, `properties.rs`, `properties/`, `static_properties.rs`, `static_properties/`
│   │   ├── control_flow.rs    Control-flow dispatch
│   │   ├── control_flow/      `branching/`, `foreach/`, `loops/`, `exceptions/`
│   │   ├── helpers.rs         Shared statement-codegen helpers
│   │   ├── includes.rs        Runtime guard flags for *_once and include-loaded function variants
│   │   ├── io.rs              Echo / print helpers
│   │   ├── null_coalesce_assign.rs `??=` read-modify-write helpers for non-local targets
│   │   ├── storage.rs         Global / static / extern-global dispatch
│   │   └── storage/           `locals.rs`, `extern_globals.rs`
│   ├── functions/             User function emission
│   │   ├── mod.rs             Function lowering entry point
│   │   ├── callback_wrapper.rs Captured callback environment wrappers
│   │   ├── cleanup.rs         Epilogue / ownership cleanup helpers
│   │   ├── control_flow.rs    Return / early-exit lowering
│   │   ├── fiber_wrapper.rs   Fiber callback entry wrappers
│   │   ├── locals.rs          Local slot layout
│   │   └── types/             Function-local type inference helpers
│   ├── abi/                   Target-aware calling convention helpers
│   │   ├── mod.rs             Public ABI helpers
│   │   ├── bootstrap.rs       Program entry / bootstrap helpers
│   │   ├── calls/             Call-site argument / result wiring
│   │   ├── frame.rs           Stack frame prologue / epilogue
│   │   ├── registers.rs       Register names per architecture
│   │   ├── symbols.rs         Symbol / literal address loading
│   │   ├── tests.rs           ABI unit-test module root
│   │   ├── tests/             ABI unit tests (`basics.rs`, `arguments.rs`, `symbols.rs`, `linux_x86_64.rs`)
│   │   └── values.rs          Push/pop/load/store by PhpType
│   ├── platform/              Target selection and Linux transforms
│   │   ├── mod.rs             Platform module root, re-exports Platform / Arch / Target
│   │   ├── target.rs          Platform / Arch / Target definitions and derived codegen properties
│   │   ├── linux_transform.rs Linux post-emit transforms, syscall mapping, C-symbol remapping
│   │   └── toolchain.rs       Assembler / linker invocation
│   ├── ffi.rs                 Extern function/global/class codegen
│   ├── cdylib.rs              C-ABI export trampolines + lifecycle symbols for --emit cdylib
│   ├── visibility.rs          ELF .hidden directives for internal globals in cdylib emission
│   ├── sentinels.rs           Null representation selection (sentinel vs tagged) and constants
│   ├── context.rs             Variables, labels, loop/finally stacks, ownership lattice
│   ├── data_section.rs        String/float literal .data section
│   ├── emit.rs                Assembly text buffer
│   │
│   ├── builtins/              Built-in function codegen (one file per language function)
│   │   ├── mod.rs             Dispatcher — chains to category modules
│   │   ├── strings/           strlen, substr, strpos, explode, sprintf, md5, ... (75 files)
│   │   ├── arrays/            count, array_push, buffer_len/free, sort, array_map, usort, ... (64 files)
│   │   ├── math/              abs, floor, pow, rand, fmod, fdiv, round, min, max, sin, cos, ... (33 files)
│   │   ├── types/             is_*, gettype, empty, unset, settype, class introspection, ... (27 files)
│   │   ├── io/                fopen, fwrite, file_get_contents, streams, sockets, scandir, ... (142 files)
│   │   ├── pointers/          ptr, ptr_get, ptr_set, ptr_read8, ptr_write8, ptr_offset, ... (16 files)
│   │   ├── spl/               iterator_to_array, iterator_count, iterator_apply, iterator_common (5 files)
│   │   └── system/            exit, define, time, date, mktime, json_encode, preg_match, attribute reflection, ... (38 files)
│   │
│   └── runtime/               Runtime routines and target-specific emission helpers
│       ├── mod.rs             Runtime module boundary; re-exports the emission entry points
│       ├── data/              Fixed, user-program, and instanceof runtime data tables (4 files)
│       ├── diagnostics.rs     Suppressible runtime-warning channel used by `@`
│       ├── emitters.rs        `emit_runtime()` orchestration — emits every runtime category in a fixed order
│       ├── strings/           itoa, concat, resource display, ftoa, sprintf, md5, sha1, str_persist, ... (71 files)
│       ├── arrays/            heap_alloc, heap_free, array_free_deep, array_grow, hash_grow, hash_*, mixed boxing/freeing, mixed instanceof, sort, usort, refcount, gc/decref dispatch, ... (132 files)
│       ├── callables/         Runtime `is_callable()` fallback for dynamic strings/arrays/hashes/objects/Mixed plus callable descriptor release (3 files)
│       ├── io/                fopen, fgets, fread, stat, streams, sockets, filters, scandir, ... (113 files)
│       ├── buffers/           buffer_new, buffer_len, bounds_fail, use_after_free helpers (5 files incl. mod.rs)
│       ├── exceptions.rs      Exception runtime module root / re-exports
│       ├── exceptions/        cleanup_frames, dynamic_instanceof, matches, throw_current, rethrow_current, class_implements helpers (6 files)
│       ├── system/            build_argv, time, getenv, shell_exec, php_uname, date, gmdate, mktime, strtotime, getdate, localtime, checkdate, microtime, hrtime, date_default_timezone, match_unhandled, json_encode_*, json_decode, preg_*, ... (40 files)
│       ├── pointers/          ptoa, ptr_check_nonnull, str_to_cstr, cstr_to_str, ptr_read_string, ptr_write_string, ... (7 files)
│       ├── fibers/            stack allocation/free, context switch, entry trampoline (4 files) + `api/` (target-aware public API helpers)
│       ├── objects/           stdClass, Mixed property/index access, JSON stdClass encoding, destructor dispatch, new-by-name helpers (6 files)
│       ├── spl/               SplDoublyLinkedList and SplFixedArray runtime container helpers (3 files)
│       └── generators/        Generator frame layout and __rt_gen_* helpers (2 files)
│
│
└── errors/
    ├── mod.rs                 CompileError, error trait
    └── report.rs              Error formatting
```

## ARM64 调用约定

| 内容 | 寄存器 | 说明 |
|---|---|---|
| 整数结果 | `x0` | 对 Int/Bool/Void/Resource 执行 emit_expr 后 |
| 浮点数结果 | `d0` | 对 Float 执行 emit_expr 后 |
| 字符串结果 | `x1` (ptr), `x2` (len) | 对 Str 执行 emit_expr 后 |
| 数组结果 | `x0` (堆指针) | 对 Array/AssocArray/Iterable 执行 emit_expr 后 |
| Mixed 结果 | `x0` (堆指针) | 指向装箱 mixed 单元的指针 |
| 对象结果 | `x0` (堆指针) | 对 Object 执行 emit_expr 后 |
| 指针 / Buffer / Packed / 可调用对象结果 | `x0` | 原始地址、连续 buffer 指针、packed 记录指针，或可调用描述符指针 |
| 函数参数 (整数) | `x0`-`x7` | Int/Bool/Resource/Array/AssocArray/Iterable/Mixed/Object/Pointer/Buffer/Packed/Callable/Union = 1 个寄存器，Str = 2 个寄存器 |
| 函数参数 (浮点数) | `d0`-`d7` | 与整数寄存器分开索引 |
| 帧指针 | `x29` | 在函数序言（prologue）中保存 |
| 链接寄存器 | `x30` | 在函数序言（prologue）中保存 |
| 栈局部变量 | `[x29, #-offset]` | 帧指针的负偏移量 |
| Null 哨兵值 | `0x7FFFFFFFFFFFFFFE` | 与真实整数进行区分 |

## FFI 流水线

FFI 声明被解析为专用的 AST 节点：

- `StmtKind::ExternFunctionDecl`
- `StmtKind::ExternClassDecl`
- `StmtKind::ExternGlobalDecl`

在类型检查期间，extern 声明会被注册到专用的映射表中，并传递到代码生成（codegen）阶段：

- `extern_functions`：通过 C ABI 暴露的 extern 签名
- `extern_classes`：扁平的 C 结构体布局元数据
- `extern_globals`：通过链接器加载的原生全局符号

Extern 调用与普通的 elephc 函数调用在以下四个重要方面有所不同：

1. 代码生成（Codegen）在内置函数之前分派 extern 函数，因此 `extern function strlen(...)` 声明实际调用的是 C 语言的 `strlen`，而不是 elephc 的内置函数。
2. `string` 参数会使用 `__rt_str_to_cstr` 进行转换，该函数会分配一个以空字符结尾的 C 缓冲区（buffer），该缓冲区在原生调用期间有效，并在调用返回后立即释放。
3. `string` 返回值会使用 `__rt_cstr_to_str` 进行转换，该函数将返回的 `char *` 视为借用，并在之后将字节复制回拥有的 elephc 字符串中。
4. `extern class` 布局对面向指针的代码生成也同样可用，因此 `ptr_sizeof("StructName")` 和 `ptr_cast<StructName>($p)->field` 使用的是由类型检查器记录的相同已检查布局元数据。

`callable` FFI 参数通过地址传递用户定义的 elephc 函数。函数名在调用处以字符串字面量的形式提供，代码生成（codegen）在分支进入 C 语言之前加载已编译且重整（mangled）的函数符号地址。因此，带命名空间的函数在规范化（canonicalization）后仍然映射到唯一的汇编标签。

## 命名空间解析与符号重整

命名空间语法在解析和 include 解析阶段会被保留，然后由 `src/name_resolver/` 进行规范化，之后类型检查（type checking）或代码生成（codegen）才会处理程序。该通道（pass）执行以下操作：

- 追踪当前的 `namespace` 作用域
- 应用 `use`、`use function` 和 `use const` 别名，包括群组使用（group-use）形式
- 将类/接口/trait/函数/常量引用解析为规范的完全限定名称（FQN）
- 将支持的字符串字面量回调（例如 `call_user_func("name", ...)`）重写为解析后的目标名称；而 `function_exists("name")` 则保留 PHP 针对字面量名称的自省（introspection）语义
- 扁平化仅含命名空间的 AST 语句，使下游通道能够在更简单的规范 AST 上运行

`src/names.rs` 是用于此项工作的共享工具层。它定义了内部的 `Name` 表示以及以下常用辅助函数：

- 规范声明名称
- 命名空间限定规则
- 针对函数、方法和静态存储的汇编符号重整

因为代码生成接收规范名称，所以命名空间在大多数后续通道中不需要特殊处理：重整后的标签是从最终的完全限定名称中集中导出的。

头等可调用对象（First-class callable）语法依托于相同的规范命名流水线。解析器发射一个专用的可调用目标节点，检查器对目标进行静态验证，代码生成将其降解（lower）为一个合成的包装器函数以及一个静态可调用描述符。实例方法目标和 `static::` 目标使用与闭包相同的隐藏捕获通道，将接收者或被调用类的上下文转发到该包装器中；间接调用处在调用包装器之前加载描述符的入口槽（entry slot）。

## 运行时内存布局

### 数组头部 (堆分配)

```
Offset  Size  Field
  0      8    length    (current number of elements)
  8      8    capacity  (allocated slots)
 16      8    elem_size (8 for Int, 16 for Str)
 24      ...  elements  (contiguous)
```

### Buffer 头部 (堆分配，用于 `buffer<T>`)

```
Offset  Size  Field
  0      8    length    (logical number of elements)
  8      8    stride    (bytes per element)
 16      ...  elements  (contiguous POD payload)
```

`buffer<T>` 故意与 PHP 数组/哈希（hash）运行时路径分离。代码生成（Codegen）使用已检查的静态元素类型以及存储的步长（stride）来生成直接地址运算和直接标量加载/存储，或者对 `buffer<PackedType>` 生成类型化的紧凑字段（packed-field）访问。

`match` 表达式保留在普通的表达式流水线中。当源文件省略 `default` 时，代码生成（codegen）现在会发射一个指向专用运行时致命错误辅助函数（`__rt_match_unhandled`）的分支，而不是落空（fall through）到未定义的结果。

### 运行时 BSS 和数据符号

在 `src/codegen/runtime/data/` 中的运行时数据发射被拆分为：用于共享堆缓冲区（heap buffers）、诊断和查找表的 `emit_runtime_data_fixed()`，以及用于全局变量、静态变量、枚举成员存储、派生自用户程序的元数据和动态 `instanceof` 查找名称的 `emit_runtime_data_user()`：

| 符号组 | 符号 | 用途 |
|---|---|---|
| 字符串暂存区 | `_concat_buf`, `_concat_off` | 表达式求值的临时字符串结果 |
| CLI 全局变量 | `_global_argc`, `_global_argv` | 用于构建 `$argv` 的已保存操作系统参数状态 |
| 堆分配器 | `_heap_buf`, `_heap_off`, `_heap_free_list`, `_heap_small_bins`, `_heap_debug_enabled`, `_heap_max` | 堆存储空间、通用/小块（small-bin）分配器元数据以及堆调试开关 |
| 运行时诊断 | `_rt_diag_suppression`, `_diag_*`, `_heap_err_msg`, `_arr_cap_err_msg`, `_ptr_null_err_msg`, `_buffer_bounds_msg`, `_buffer_uaf_msg`, `_match_unhandled_msg`, `_uncaught_exc_msg`, `_instanceof_target_type_msg`, `_heap_dbg_*` | 可抑制的警告状态/文本、致命错误消息以及堆调试摘要/失败字符串 |
| GC 统计与环状态 | `_gc_allocs`, `_gc_frees`, `_gc_live`, `_gc_peak`, `_gc_collecting`, `_gc_release_suppressed` | 分配/释放/活动字节计数器以及针对性的环垃圾收集器（cycle-collector）协作标志 |
| 异常状态 | `_exc_handler_top`, `_exc_call_frame_top`, `_exc_value`, `_class_parent_ids` | 活跃的处理器栈、激活清理栈、当前异常对象以及用于 catch 匹配的父级链接 |
| Include-once 卫兵 | `_include_once_<hash>` | 由 `include_once` / `require_once` 运行时卫兵使用的每个已解析文件的加载标志 |
| Include 加载的函数变体 | `_fn_variant_active_<function>` | 通过 include 点加载的函数的活跃隐藏实现指针 |
| I/O 暂存区 | `_cstr_buf`, `_cstr_buf2`, `_eof_flags`, `_principal_lookup_buf`, `_etc_passwd_path`, `_etc_group_path`, `_principal_lookup_read_mode` | Syscall-oriented C-string scratch buffers, EOF bookkeeping, and passwd/group lookup state for `chown()` / `chgrp()` name resolution |
| 字符串/运行时表 | `_fmt_g`, `_b64_encode_tbl`, `_b64_decode_tbl` | 运行时辅助函数的格式化和查找表 |
| JSON/日期状态和表 | `_json_last_error`, `_json_active_flags`, `_json_active_depth`, `_json_indent_depth`, `_json_depth_limit`, `_json_validate_*`, `_json_decode_assoc`, `_json_error_*`, `_json_true`, `_json_false`, `_json_null`, `_json_err_msg_*`, `_json_err_msg_table`, `_json_err_loc_*`, `_json_int_max_str`, `_json_int_min_str`, `_day_names`, `_month_names`, `_strtotime_*` | 运行时 JSON 状态、JSON 字面量/错误查找数据、解码错误位置片段、大整数阈值、日期查找表以及 `strtotime()` 关键字/单位表 |
| 用户相关存储 | `_gvar_<name>`, `_static_<func>_<name>`, `_static_<func>_<name>_init`, `_static_prop_<class>_<prop>`, 通过 `enum_case_symbol(...)` 的枚举成员 `.comm` 符号 | 全局/静态局部存储、类静态属性存储，以及枚举成员的单例后备槽位 |
| 类/接口元数据表 | `_instanceof_target_count`, `_instanceof_target_entries`, `_instanceof_name_*`, `_interface_count`, `_interface_method_ptrs`, `_interface_methods_<id>`, `_class_interface_ptrs`, `_class_interfaces_<id>`, `_class_interface_impl_<class>_<iface>`, `_classes_by_name`, `_classes_by_name_count`, `_generator_class_id`, `_fiber_class_id`, `_fiber_error_class_id`, `_class_gc_desc_count`, `_class_gc_desc_ptrs`, `_class_gc_desc_<id>`, `_class_destruct_ptrs`, `_class_vtable_ptrs`, `_class_vtable_<id>`, `_class_static_vtable_ptrs`, `_class_static_vtable_<id>` | 动态 `instanceof` 查找名称、大小写不敏感的 `new $name()` 类查找表、内置的运行时托管类 ID、每个接口的方法顺序元数据、每个类的属性遍历元数据、每个类的 `__destruct` 指针以及实例/静态分派表 |

### Heap allocator

BSS 段中的 8MB 空闲链表（free-list）与碰撞指针（bump）混合分配器（`_heap_buf`）。每个分配都有统一的 16 字节头部：`[size:4][refcount:4][kind:8]` —— 包含一个 32 位块大小（block size）、一个 32 位引用计数以及一个由数组、哈希、对象、装箱 mixed 单元、持久化字符串和原始辅助缓冲区共享的 8 字节堆类型（heap-kind）标记。分配器现在在通用地址排序空闲链表之前，在 `_heap_small_bins` 中保留了四个隔离的小块箱（segregated small-block bins，`<=8`、`<=16`、`<=32`、`<=64` 字节），因此微小且短命的内存块通常可以被重用，而无需遍历整个首次适应（first-fit）链。当释放内存（通过 `__rt_heap_free`）时，尾部的块仍然直接折叠回 `_heap_off`，小型的非尾部块缓存到其对应的尺寸类别（size class）中，较大的块保留在有序空闲链表中，在此相邻的块会被合并，并且任何到达当前碰撞指针尾部的空闲链都会被修剪回碰撞指针中。新的分配会先咨询匹配的小块箱类别，然后是通用空闲链表（在需要时拆分过大的空闲块），仅在两条路径都无法满足请求时才进行碰撞分配。引用计数（`__rt_incref`、`__rt_decref_array`、`__rt_decref_hash`、`__rt_decref_mixed`、`__rt_decref_object`）仍然处理常见的无环情况，而数组和哈希现在在修改共享容器之前，通过 `__rt_array_ensure_unique` / `__rt_hash_ensure_unique` 以及浅拷贝（shallow clone）辅助函数来增加写时复制（copy-on-write）分裂。`kind` 字的低 16 位现在是持久容器元数据：低字节 = 堆类型，第 8-14 位 = 索引数组的 `value_type`，第 15 位 = 写时复制容器标志，更高的位则保留用于瞬态环垃圾收集器（cycle-collector）的状态。堆类型标记目前使用 `0=raw/untyped`、`1=string`、`2=indexed array`、`3=assoc/hash`、`4=object`、`5=boxed mixed`，从而无论负载布局如何，都赋予运行时统一的判别器。在启用 `--heap-debug` 时，运行时会在分配/释放变动时验证有序空闲链表和隔离小块箱链表，在发生重复释放（double free）或零引用计数的 `incref`/`decref` 路径时捕获错误（trap），给已释放的负载字节下毒（poison），并打印包含分配/释放计数、活跃块、活跃字节以及活跃字节峰值水印的进程结束摘要。在启用 `--gc-stats` 时，生成的程序也会在退出时向 stderr 打印分配/释放计数器，而无需启用更重的堆调试检查。Fiber 执行状态使用专用的 BSS 槽位（`_fiber_current`、`_fiber_main_saved_sp`、`_fiber_main_saved_exc`、`_fiber_main_saved_call_frame`）以及使用 `mmap` 分配的有保护屏障的单协程栈（per-fiber stack）；`Fiber` 对象在对象深释放（deep-free）期间通过 `__rt_fiber_free_stack` 释放这些栈。代码生成（Codegen）现在在 `Context::variables` 中记录一个局部所有权格（ownership lattice：`Owned`、`Borrowed`、`MaybeOwned`、`NonHeap`）以及一个 `epilogue_cleanup_safe` 位，以便能够区分真正拥有堆值的栈槽位以及仅仅作为全局/静态/容器备份存储别名的槽位。所有权转移点当前包括普通重赋值、值传递的调用参数、借用的堆返回值、索引数组写入、关联数组/哈希写入、对象属性写入、静态（`static`）槽位写入、全局（`global`）加载、`foreach` 目标以及 `list(...)` 目标，而容器拷贝内置函数现在分派到专用的 `_refcounted` 运行时辅助函数，用以处理嵌套的数组/哈希/对象/字符串负载（带有展开运算符的数组字面量、`array_merge`、`array_chunk`、`array_slice`、`array_reverse`、`array_pad`、`array_unique`、`array_splice`、`array_diff`、`array_intersect`、`array_filter`、`array_fill`、`array_combine`、`array_fill_keys`）。Mixed 堆释放现在汇集到 `__rt_decref_any`，而对象/容器的深释放路径则使用更丰富的运行时元数据以及逐类的 GC 描述符表来发现嵌套的堆备份子节点。函数收尾（epilogue）现在仅清理既是 `Owned` 又仍然标记为安全的局部变量；借用别名（例如 `$this`、引用参数、全局变量和静态变量）被明确排除在外，当每个穿透（fallthrough）分支直接将相同的堆备份类型存储到相同的局部变量时，详尽的 `if` / `elseif` / `else` 分支现在可以恢复函数收尾清理。由循环驱动、switch 驱动以及更多动态的重度别名合并在更多控制流情况被证实之前，仍然保持保守。可通过 `--heap-size=BYTES`（最小 64KB）、`--gc-stats` 和 `--heap-debug` 进行运行时验证的配置。进行边界检查，溢出时报告致命错误。

### Hash table header (heap-allocated, for associative arrays)

```
Offset  Size  Field
  0      8    count       (number of occupied entries)
  8      8    capacity    (number of slots)
 16      8    value_type  (coarse summary: 0=int, 1=str, 2=float, 3=bool, 4=array, 5=assoc, 6=object, 7=mixed)
 24      8    head        (slot index of first inserted entry, or -1)
 32      8    tail        (slot index of last inserted entry, or -1)
 40      ...  entries     (each entry is 64 bytes)
```

Each hash table entry:

```
Offset  Size  Field
  0      8    occupied   (0=empty, 1=occupied, 2=tombstone)
  8      8    key_ptr    (pointer to key string)
 16      8    key_len    (key string length)
 24      8    value_lo   (value or pointer)
 32      8    value_hi   (string length, or unused for single-word payloads)
 40      8    value_tag  (authoritative per-entry runtime tag)
 48      8    prev       (previous inserted slot, or -1)
 56      8    next       (next inserted slot, or -1)
```

查找仍然使用具有线性探测的 FNV-1a 哈希来进行冲突解决，但语言可见的迭代遵循 `head -> next -> ... -> tail` 的插入顺序链。头部 `value_type` 现在仅是一个粗略的摘要；正确性关键的运行时路径会读取每个条目的 `value_tag` 代替。有关完整的运行时布局和迭代约定，请参阅 [Memory Model](memory-model.md)。

### Object layout (heap-allocated)

```
Offset  Size  Field
  0      8    class_id  (identifies which class this object belongs to)
  8     16    prop[0]   (first property — 16 bytes regardless of type)
 24     16    prop[1]   (second property)
 ...    ...   ...
```

总大小：`8 + (num_properties × 16)`。属性以编译时确定的固定偏移量跨继承链以父类优先的顺序存储。属性访问是 `base + resolved_property_offset`。

### Method dispatch

- 实例方法：代码生成（codegen）从静态类元数据中解析出稳定的槽位数，然后使用对象的 `class_id` 加载具体的类 vtable 项，并使用 `blr` 跳转到实现。对象指针仍然作为 `x0` 中的第一个参数传递（作为 `$this`）。
- 私有实例方法排除在 vtable 之外，并作为声明类内的直接调用发射，从而保留了 PHP 对父类私有辅助函数的词法绑定。
- 接口和抽象类在编译时强制执行。运行时方法调用仍然使用现有的类 vtable，而专用的接口元数据表则与类元数据一起发射，用于符合路线图的接口记账和未来的分派工作。
- 静态方法：`bl _static_ClassName_methodName`。不传递对象指针。
- `self::method()` / `parent::method()`：作为直接词法调用发射，但静态目标仍然转发当前的“被调用类”ID 以用于后期的 `static::` 查找。
- `static::method()`：使用以转发的被调用类 ID 为键的逐类静态方法表，因此后期静态绑定可在继承的静态重写中正常工作。
- 未定义属性读取可以回退到 `__get($name)`，未定义属性写入可以回退到 `__set($name, $value)`，一旦类型检查器验证了这些魔术方法，就可以重用相同的实例方法分派路径。
- 在字符串上下文中使用的对象值可以回退到 `__toString()`，这由类型检查器强制执行并通过相同的实例方法分派机制降解（lower）。

在构建继承元数据之前，Trait 会被扁平化到所属的类中。这意味着在 `use` / `as` / `insteadof` 解析之后，Trait 成员参与与普通类成员相同的继承属性布局和 vtable 构建。

### String buffer

BSS 段中的 64KB 暂存缓冲区（`_concat_buf`）。被 `itoa`、`concat`、`strtolower` 以及所有生成字符串的运行时例程所使用。在每个语句开始时重置为偏移量 0。需要在当前语句之外持久化的字符串将通过 `__rt_str_persist` 复制到堆中。

### I/O buffers

底层的 I/O 辅助函数和系统调用仍然使用两个 4KB 的 C 字符串转换缓冲区（`_cstr_buf`、`_cstr_buf2`）。FFI 字符串调用不再使用这些暂存缓冲区；它们通过 `__rt_str_to_cstr` 分配单次调用有效的 C 字符串，以便多个字符串参数在同一次原生调用中保持有效，并在控制权从 C 语言返回时立即释放。256 字节的 EOF 标志数组（`_eof_flags`）追踪每个文件描述符的结束状态。`chown()` / `chgrp()` 的字符串名称变体通过 _principal_lookup_buf 以及固定的路径/模式字面量扫描 `/etc/passwd` 和 `/etc/group` 来解析本地主体，从而避免在静态 Linux 二进制文件中进行 NSS 调用。
