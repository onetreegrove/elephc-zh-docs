### Externs, Pointers, Buffers, and Packed Data

| Op | Operands | Result | Effects |
|---|---|---|---|
| `PtrCast(target_type)` | pointer value | `I64` | pure type metadata change |
| `PtrRead(width)` | pointer | `I64` | `reads_heap`/native memory, `may_fatal` |
| `PtrWrite(width)` | pointer, value | `Void` | `writes_heap`/native memory, `may_fatal` |
| `PtrReadString`, `PtrWriteString` | pointer and string/len | string or int | native memory effects, maybe `alloc_heap`, `may_fatal` |
| `PtrOffset` | pointer, byte offset | `I64` pointer | pure arithmetic, but php_type tag preserved |
| `PtrCheckNonnull` | pointer | `Void` | `may_fatal` |
| `BufferNew(element_type, len)` | length | `Heap(Buffer)` | `alloc_heap`, `may_fatal` |
| `BufferLen` | buffer | `I64` | `reads_heap`, `may_fatal` on freed buffer |
| `BufferGet`, `BufferSet` | buffer, index, value | typed value or `Void` | `reads_heap`/`writes_heap`, bounds `may_fatal` |
| `BufferFree` | buffer | `Void` | `writes_heap`, `may_fatal` on invalid state |
| `PackedFieldGet`, `PackedFieldSet` | packed pointer, field metadata | typed value or `Void` | raw memory effects |
| `ExternGlobalLoad`, `ExternGlobalStore` | global metadata | typed value or `Void` | external state effects |

指针和 extern memory effects 是保守的，因为它们可以别名到 PHP 堆之外的数据。

### Output, Diagnostics, Exceptions, Fibers, and Generators

| Op | Operands | Result | Effects |
|---|---|---|---|
| `EchoValue`, `PrintValue`, `WriteStdout` | value | `Void` or `I64` for print | `output`, value conversion effects |
| `VarDump`, `PrintR` | value | `Void` or string/int per builtin | `output` or `alloc_concat` |
| `ErrorSuppressBegin`, `ErrorSuppressEnd` | none | `Void` | diagnostic state effects |
| `Warn(message_id)` | args | `Void` | `may_warn`, `output`/diagnostic effect |
| `ThrowException` | exception object | terminator path | `may_throw`, `writes_global` exception state |
| `TryPushHandler`, `TryPopHandler` | handler slot metadata | `Void` | `writes_local`, `writes_global` exception stack |
| `CatchBind` | exception object, optional local | `Void` | `writes_local`, ownership transfer |
| `FinallyEnter`, `FinallyExit` | finally state | `Void` | control-flow bookkeeping effects |
| `FiberRuntimeCall` | helper, args | typed value | runtime effects, `may_throw`, `may_fatal` |
| `GeneratorNew` | frame metadata | `Heap(Object)` or generator handle | `alloc_heap` |
| `GeneratorYield` | key, value | suspend/resume value | `writes_heap`, `may_throw`, suspension effect |
| `GeneratorYieldFrom` | iterable | yielded values | iterator/generator effects |
| `GeneratorReturn` | value | `Void` | writes generator return state |

`Yield` 和 `YieldFrom` 目前不会通过普通表达式结果路径发出。EIR 必须通过 generator state-machine lowering 建模它们，而不是把它们当作普通表达式 instruction。

### Include and Resolver Artifacts

| Op | Operands | Result | Effects |
|---|---|---|---|
| `IncludeOnceMark(label)` | none | `Void` | `writes_global` |
| `IncludeOnceGuard(label)` | none | branch condition | `reads_global`, `writes_global` |
| `FunctionVariantDispatch(group)` | none | `Void` | pure metadata for dispatcher emission |
| `FunctionVariantMark(name, variant)` | none | `Void` | `writes_global` marker state |

普通 `Include` 在正常操作中不应经过 resolver 后到达 EIR。如果到达，lowering 必须产生编译器错误，而不是静默发出不完整 IR。

## Terminators

每个 block 都以且仅以一个 terminator 结束。Terminators 拥有无法表示为 instruction 后跟 fallthrough 的控制流 effects。

```rust
pub enum Terminator {
    Br { target: BlockId, args: Vec<ValueId> },
    CondBr {
        cond: ValueId,
        then_target: BlockId,
        then_args: Vec<ValueId>,
        else_target: BlockId,
        else_args: Vec<ValueId>,
    },
    Switch {
        scrutinee: ValueId,
        cases: Vec<SwitchCase>,
        default: BlockId,
        default_args: Vec<ValueId>,
    },
    Return { value: Option<ValueId> },
    Throw { value: ValueId },
    Fatal { message: DataId },
    GeneratorSuspend {
        key: Option<ValueId>,
        value: Option<ValueId>,
        resume: BlockId,
        resume_args: Vec<ValueId>,
    },
    Unreachable,
}
```

| Terminator | Rules |
|---|---|
| `Br` | Destination arg 数量和类型必须匹配 destination block params。 |
| `CondBr` | `cond` 必须是 `I64` bool/truthiness value。两个 destination 都接收匹配的 args。 |
| `Switch` | Cases 保留 PHP `switch`/`match` 语义。`switch` 的 fallthrough 由 block 结构表示，而不是隐式 terminator 行为。 |
| `Return` | 将返回的 owned value 的所有权转移给 caller。`Never` 函数不能正常返回。 |
| `Throw` | 将 exception object 转移到运行时 exception state，并且不会 fall through。 |
| `Fatal` | 结束程序路径；fatal 之后没有 cleanup，除非 cleanup 已在之前显式表示。 |
| `GeneratorSuspend` | 捕获 generator frame state，并在 `resume` 处恢复。 |
| `Unreachable` | 只允许出现在从 `Never`、fatal、throw 或不可能分支证明出来之后。 |

`try`/`catch`/`finally` 表示为显式 handler instructions 和指向 landing blocks 的 CFG edges。Validator 会把 active exception regions 视为控制流契约的一部分。

## 文本格式

文本格式只由 printer 生成。它用于 `--emit-ir`、测试、调试和审阅。在 v0.24.x 轨道中不要求 parser。

必需属性：

- deterministic function order
- deterministic block order
- stable value numbering per function
- source spans shown when available
- effects printed when non-pure
- ownership printed for values whose ownership is not obvious
- heap subkind and PHP type shown for heap/boxed values

## 使用 `--emit-ir`

`--emit-ir` 是诊断输出模式：

```bash
cargo run -- --emit-ir examples/hello/main.php
```

编译器会按正常 frontend 顺序运行到类型检查和 AST 优化，将优化后的 AST 降低为 EIR，验证 module，将文本格式打印到 stdout，然后在 runtime-cache preparation、assembly generation、assembling 或 linking 之前退出。

`--emit-ir`、`--emit-asm` 和 `--check` 互斥，因为它们都是同一个源码文件的终端输出模式。

示例：

```eir
module target=macos-aarch64 {
  data str[0] = "hello\n"

  function main() -> Void flags(main) {
    entry:
      v0: Str php=string own=persistent = const_str str[0]
      echo v0                              ; effects: output
      return
  }
}
```

带 block parameters 的示例：

```eir
function sum_to(p0: I64 php=int) -> I64 {
  entry:
    v0: I64 php=int = const_i64 0
    v1: I64 php=int = const_i64 1
    br loop(v1, v0)

  loop(i: I64 php=int, acc: I64 php=int):
    v2: I64 php=bool = icmp sle i, p0
    cond_br v2, body(i, acc), exit(acc)

  body(i: I64 php=int, acc: I64 php=int):
    v3: I64 php=int = iadd acc, i
    v4: I64 php=int = iadd i, 1
    br loop(v4, v3)

  exit(result: I64 php=int):
    return result
}
```

文本语法要求：

- Function header: `function <name>(params) -> <IrType> flags(...)`.
- Block header: `<label>(params):`.
- Instruction: `vN: <IrType> php=<PhpType> own=<Ownership> = <op> ...`.
- Void instruction: `<op> ...`.
- Terminator: `return`, `br`, `cond_br`, `switch`, `throw`, `fatal`,
  `generator_suspend`, or `unreachable`.
- Effects comment: `; effects: reads_heap, writes_heap, may_throw`.
- Source span comment: `; span: line:col`.

## Validator

Validation 有两种模式：

- **Structural mode：** 便宜，在 builder operations 之后以及每个 pass 之后运行。
- **Full mode：** structural + dominance + ownership + effects，在为测试打印前和 EIR 后端 codegen 前运行。

### Structural Rules

1. 每个 block 只属于一个 function。
2. 每个 block 都有且仅有一个 terminator。
3. Terminators 只能作为 block terminator 出现。
4. 每个 `ValueId` 都只定义一次。
5. 每个 `InstId` 都只属于一个 block。
6. 每个 operand 都引用同一 function 中存在的 value。
7. 每个 use 都受其 definition 支配，除非该 value 是由所有 incoming branches 提供的 destination block parameter。
8. Destination block argument count 匹配 destination block parameter count。
9. Destination block argument types 匹配 destination block parameter types。
10. Entry block 没有 block parameters。
11. 每个 value 的 `IrType` 和 `php_type` 都兼容。
12. Void instructions 不能作为 operands 使用。
13. `Never`-typed PHP operations 以 non-returning control flow 结束。

### Opcode Rules

1. Integer ops 只接受 `I64` operands。
2. Float ops 只接受 `F64` operands。
3. String ops 只接受 `Str` operands，除非 opcode 显式 cast。
4. Array ops 要求 `Heap(Array)`。
5. Hash ops 要求 `Heap(Hash)`。
6. Object property ops 要求 `Heap(Object(_))`、`Heap(Mixed)`，或可以在运行时验证的 dynamic receiver opcode。
7. Mixed ops 要求 `Heap(Mixed)` 或 `Heap(Union)`。
8. Callable descriptor ops 即使存储类型为 `I64`，也要求 `PhpType::Callable` metadata。
9. Pointer ops 要求 `PhpType::Pointer(_)` metadata。
10. Buffer ops 要求 `Heap(Buffer(_))`。

### Ownership Rules

1. 每个 owned value 在每条可达路径上都恰好消费一次。
2. `Release`、`Move` 和 `Return` 消费所有权。
3. 返回 owned value 会把所有权转移给 caller。
4. 返回 borrowed value 要求在 `Return` 前执行 `Acquire`。
5. `Borrow` 不能比 source owner 活得更久。
6. `Moved` values 不能读取。
7. `Persistent` values 不能释放。
8. CFG joins 必须显式合并 ownership。如果 incoming ownership states 不匹配，joined value 为 `MaybeOwned`。
9. `MaybeOwned` values 必须在 unconditional cleanup 前解析。
10. Exception、early return、break、continue、fatal 和 generator suspend 路径必须对仍需 cleanup 的 values 做平衡 cleanup。

### Effect Rules

1. Pure operations 不能设置隐藏 memory、output、diagnostic、allocation 或 control-flow effects。
2. 带有 `output`、`may_warn`、`may_throw`、`may_fatal`、`writes_*`、`alloc_*` 或 `refcount_op` 的 operations 是可观察的。
3. Passes 不能把 `may_throw` 或 `may_fatal` operations 移过其他可观察 operations，除非它们证明 PHP 行为等价。
4. `alloc_concat` operations 不能跨越 statement-boundary concat resets。
5. `writes_global` 会使关于 globals、statics、runtime global symbols、JSON error state 和 include-once/function-variant state 的假设失效。
6. `writes_heap` 会使对可能别名的 arrays、hashes、objects、mixed cells、iterators、buffers、generators、fibers 和 callable descriptors 的读取失效。

## Optimization Passes

Lowering 和一次性 module validation 之后，EIR 会在 codegen 前运行固定点 pass driver（`src/ir_passes/driver.rs`）。IR 级变换都放在这个 driver 中，也就是 AST 优化器无法表达的重写，因为这些重写需要 value identity、basic blocks 或 dominance。

Pass 实现 `IrPass` trait：稳定的 `name()`，以及一个会就地修改 function 并报告是否发生变化的 `run(&mut Function, &mut DataPool) -> bool`。`DataPool` 是 module 的共享 literal pool，会被一路传入，这样需要物化新常量的 pass（peephole string-literal fold 会 intern 拼接后的字符串）可以使用它；不需要新 literal 的 pass 会忽略它。Driver 会对每个 function-like body（functions、methods、closures、trampolines、invokers）反复运行已注册 passes，直到完整一轮没有变化，并受固定迭代预算限制。

整个流水线运行到**module-level fixed point**：`optimize_module`
会把跨函数 [small-function inliner](#small-function-inlining) 与这些 per-function passes 交错执行，并重复整轮直到两层都不再变化（受单独的 module-iteration budget 限制）。交错让两者彼此供给：内联后的 body 暴露新的常量和死代码给 per-function passes；被简化的函数又暴露新的（更小的）inline candidates。第一轮复现之前的 "inline once, then optimize" 行为，所以后续轮次只会进一步优化，不会改变语义。

在 debug 和 test builds（`debug_assertions`）中，driver 会在每个 pass 后用 `validate_function` 重新验证 function；如果某个 pass 产生了 malformed IR，就会 panic 并点名 offending pass。同样的 build 中，如果 pass set 在上限内无法收敛也会 panic，这只会发生在 non-converging pass bug 中。两个 guard 都会在 `--release` 中编译掉；达到上限时会简单停止并继续使用当前 IR。

Mutating passes 共享 use-rewriting helper `replace_all_uses`
（`src/ir_passes/rewrite.rs`），它会把某个 value 的每个 *use* 重定向到 replacement，覆盖 instruction operands 和所有 terminator slots，但不触碰 definitions（block parameters 和 instruction results）。
