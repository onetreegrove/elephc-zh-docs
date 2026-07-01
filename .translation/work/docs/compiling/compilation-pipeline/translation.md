---
title: "编译流水线"
description: "PHP 文件到达原生二进制文件（native binary）所经历的每个阶段，按顺序列出，并附有各阶段在 `--timings` 输出中对应的计时标签。"
sidebar:
  order: 2
---

编译过程是一个固定的阶段序列，每个阶段对程序进行变换后交给下一个阶段。下方的阶段名称与 [`--timings`](output-and-diagnostics.md#--timings) 打印的标签一一对应，因此可以直接将编译缓慢的问题定位到某个具体阶段。

## 阶段顺序

```text
PHP source
  -> read              read the source file from disk
  -> tokenize          Lexer: text -> tokens
  -> parse             Parser: tokens -> AST (Pratt expression parsing)
  -> magic-constants   lower __FILE__, __DIR__, __LINE__, __FUNCTION__, ...
  -> (conditional)     apply compiler ifdef branches from --define
  -> autoload-build    discover autoload rules
  -> resolve           resolve include/require and declarations
  -> pdo-prelude        inject the PDO prelude when used
  -> tz-prelude         inject the timezone-introspection prelude when used
  -> list-id-prelude    inject the DateTimeZone identifier-list prelude when used
  -> var-export-prelude inject the var_export prelude when used
  -> name-resolve       apply namespace/use rules, canonicalize names
  -> autoload-run       run autoload insertion
  -> opt-fold           AST constant folding
  -> typecheck          Type checker / warnings
  -> exports-scan       collect #[Export] functions (cdylib)
  -> opt-prop           AST constant propagation
  -> opt-post           prune constant control flow
  -> opt-norm           control-flow normalization
  -> dce                AST dead-code elimination
  -> ir-lower           AST -> EIR lowering + EIR validation
  -> ir-opt             EIR optimization passes (fixed-point driver)
  -> ir-print           print EIR and stop (with --emit-ir)
  -> runtime-cache      build/reuse the prebuilt runtime object
  -> codegen-ir         EIR -> target assembly
  -> write-asm          write the generated assembly
  -> source-map         write the .map sidecar (with --source-map)
  -> assemble           assembler: assembly -> object file
  -> link               linker: object files -> binary
```

## 前端：源码到已检查 AST

- **read / tokenize / parse** — [Lexer](../internals/the-lexer.md) 将源文本转换为 token，[Parser](../internals/the-parser.md) 据此构建抽象语法树（AST）。
- **magic-constants** — `__DIR__`、`__LINE__` 等魔术常量在任何后续阶段处理之前完成替换。
- **conditional compilation** — 使用 [`--define`](linking-and-conditional-compilation.md#conditional-compilation) 传入的符号解析 `ifdef` 分支。
- **resolve / prelude injection / name-resolve** — 解析 `include`/`require`，发现声明；仅在被引用时按需注入 PDO、时区自省、`DateTimeZone::listIdentifiers()` 以及 `var_export()` 的 PHP prelude；通过命名空间/`use` 规则将引用重写为全限定名。自动加载逻辑在这些步骤周围接入。
- **typecheck** — [类型检查器](../internals/the-type-checker.md)推断并验证类型，并发出警告。

## 中间层：AST 优化

AST 优化器执行在语法层面自然表达的、保持 PHP 语义的重写：**opt-fold**（常量折叠）、**opt-prop**（常量传播）、**opt-post**（常量控制流剪枝）、**opt-norm**（控制流规范化）以及 **dce**（死代码消除）。详见 [优化器](../internals/the-optimizer.md)。这些优化始终运行，不需要任何标志开启。

## 后端：EIR 与代码生成

- **ir-lower** — 已检查的 AST 被降级（lower）为 EIR，即 elephc 以 PHP 为形态的中间表示，随后对结构、类型、支配关系、所有权及副作用不变量进行一次性验证。详见 [EIR 设计](../internals/the-ir.md)。
- **ir-opt** — [EIR 优化 pass](optimization.md#eir-optimization-passes) 对每个函数运行不动点驱动，包括：恒等算术折叠、局部窥孔重写、常量折叠、公共子表达式消除、循环不变代码外提（LICM）、CFG 感知的死指令消除、死存储消除以及分支化简。在 debug/test 构建中，每个 pass 后都会重新验证函数。此阶段可通过 [`--no-ir-opt`](optimization.md#eir-optimization-passes) 关闭。
- **ir-print** — 仅在使用 [`--emit-ir`](output-and-diagnostics.md#--emit-ir) 时存在；将优化后（或未优化的）EIR 格式化为文本形式输出到 stdout，并在运行时准备或代码生成之前停止。
- **runtime-cache** — 手写的运行时汇编一次后缓存至 `~/.cache/elephc/`，后续编译复用。详见 [运行时](../internals/the-runtime.md)。
- **codegen-ir** — EIR 通过默认后端降级为目标平台汇编。详见 [代码生成器](../internals/the-codegen.md)。

## 尾部：汇编与链接

生成的汇编被写出，汇编为目标文件，再与缓存的运行时目标文件（以及任何[额外的库](linking-and-conditional-compilation.md)）链接，最终生成二进制文件。

## 查看中间阶段

无需运行完整的流水线。若干标志可提前停止或转储中间产物：

- [`--check`](output-and-diagnostics.md#--check) 仅运行前端。
- [`--emit-ir`](output-and-diagnostics.md#--emit-ir) 打印 EIR（在 `ir-opt` 之后）并停止。
- [`--emit-asm`](output-and-diagnostics.md#--emit-asm) 写出汇编而不进行链接。
- [`--timings`](output-and-diagnostics.md#--timings) 打印各阶段耗时。
