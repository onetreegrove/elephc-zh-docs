---
title: "Fiber / 协程"
description: "协作式协程（PHP 8.1+ Fiber）：创建、启动、暂停、恢复，并包含 FiberError。"
sidebar:
  order: 15
---

`Fiber` 是一个协作式协程：一个拥有自己调用栈的可调用对象，并且可以在任意深度暂停执行。控制权在调用者与 `Fiber` 之间显式切换——没有抢占。

`elephc` 在支持的原生目标平台矩阵上支持 `Fiber`：macOS ARM64、Linux ARM64 和 Linux x86_64。

## 类摘要

| 方法 | 签名 | 行为 |
|---|---|---|
| `__construct` | `__construct(callable $callback)` | 分配一个 `Fiber` 并捕获可调用对象。该可调用对象将在首次调用 `start()` 时运行。 |
| `start` | `start(mixed $arg0 = null, ..., mixed $arg6 = null): mixed` | 切换到 `Fiber` 中并运行它，直到它暂停或返回。最多可以将七个参数转发给回调。返回通过 `Fiber::suspend()` 产生的值，如果 `Fiber` 在暂停前已终止，则返回 `null`。 |
| `resume` | `resume(mixed $value = null): mixed` | 将一个值传递给 `Fiber` 挂起的 `Fiber::suspend()` 调用并继续执行。返回下一个产生的值，如果 `Fiber` 终止则返回 `null`。 |
| `throw` | `throw(Throwable $exception): mixed` | 在 `Fiber` 挂起的暂停点重新抛出异常。该异常会展开 `Fiber` 本地的 `try`/`catch` 链。 |
| `getReturn` | `getReturn(): mixed` | 读取 `Fiber` 终止后返回的值。如果在 `Fiber` 终止前调用，则抛出 `FiberError`。 |
| `isStarted` | `isStarted(): bool` | 一旦 `start()` 被调用，则返回 `true`。 |
| `isSuspended` | `isSuspended(): bool` | 当 `Fiber` 在 `Fiber::suspend()` 调用处暂停时返回 `true`。 |
| `isRunning` | `isRunning(): bool` | 当 `Fiber` 当前正在执行时返回 `true`。 |
| `isTerminated` | `isTerminated(): bool` | 在 `Fiber` 的可调用对象返回后返回 `true`。 |
| `Fiber::suspend` | `static suspend(mixed $value = null): mixed` | （从 `Fiber` 内部调用。）将值产生给恢复者并暂停；在下一次 `resume()` 传递值时恢复。 |
| `Fiber::getCurrent` | `static getCurrent(): ?Fiber` | 当前正在执行的 `Fiber`，如果在主线程中调用则返回 `null`。在内部，这表示为一个装箱的 `mixed` 值。 |

`FiberError` 被建模为 `Error` 的子类，与 PHP 一致。`catch (FiberError $e)`、`catch (Error $e)` 和 `catch (Throwable $e)` 均适用；但 `catch (Exception $e)` 不适用。

## 生命周期状态

`Fiber` 按顺序经历四个状态，绝不回退：

| 状态 | 触发时机 |
|---|---|
| `NotStarted` | 刚刚构建；尚未调用 `start()`。 |
| `Running` | 当前正在执行。`Fiber::getCurrent()` 返回此 `Fiber`。 |
| `Suspended` | 在 `Fiber::suspend()` 内部暂停，等待来自调用者的 `resume()`。 |
| `Terminated` | 可调用对象已返回。对其调用 `start()`/`resume()` 将不再有效。 |

## 示例

```php
<?php
$counter = new Fiber(function(): void {
    $a = Fiber::suspend("one");
    echo "resumed with " . $a;
    $b = Fiber::suspend("two");
    echo "resumed with " . $b;
    Fiber::suspend("three");
});

echo $counter->start();         // one
echo "|";
echo $counter->resume("alpha"); // resumed with alpha two
echo "|";
echo $counter->resume("beta");  // resumed with beta three
```

输出：
```
one|resumed with alpha two|resumed with beta three
```

## 参数与捕获传递

`Fiber` 调用跨越了栈边界。在切换栈之前，`elephc` 会将传递给回调的可见值复制到 `Fiber` 对象的固定字段中：

- `start_args[0..6]` 存储了传递给 `$fiber->start(...)` 的最多七个装箱的 `mixed` 值。

这种复制有时被称为“溢出（spilling）”：在 `__rt_fiber_switch` 采用 `Fiber` 的独立栈之前，调用者的参数寄存器或通过栈传递的溢出参数会被保存到 `Fiber` 拥有的稳定存储中。

带有 `use (...)` 捕获的闭包、第一类（first-class）方法接收者、可调用数组接收者以及可调用对象（invokable-object）接收者均在构建 `Fiber` 时进行求值，而不是在其启动时。它们被存储在可调用描述符的运行时捕获槽中，因此 `$fiber->start(...)` 无法覆写它们，且捕获也不受七个可见启动参数槽的限制。字符串回调在创建 `Fiber` 对象之前被解析为用户函数、内置（builtin）、extern 或公共静态方法描述符。运行时选择的可调用数组（例如 `[$object, $method]`）和内联接收者（例如 `[new Job(), "run"]`）会在构建时绑定到描述符中。

## 运行时模型

每个 `Fiber` 都拥有一个通过 `mmap` 分配的原生栈。底部 16 KiB 通过 `mprotect(PROT_NONE)` 保护作为保护页（guard page），可用栈默认大小为 256 KiB。当 `Fiber` 对象被释放时，映射的栈会通过 `munmap` 返回给操作系统（OS）。

上下文切换是协作式的：

- AArch64 保存 `x19-x28`、`x29-x30` 和 `d8-d15`
- x86_64 SysV 保存 `rbx`、`rbp` 和 `r12-r15`；保存的返回地址通过正常的 `ret` 路径恢复
- `_fiber_current`、异常处理链以及清理调用帧链（cleanup call-frame chain）会与目标上下文进行交换

首次切换到 `Fiber` 时会返回到 `__rt_fiber_entry`，这是新栈上的一个蹦床（trampoline）函数。该蹦床函数会安装一个哨兵异常处理器，调用为回调生成的 ABI 包装器，存储最终的返回值，将 `Fiber` 标记为 `Terminated`，然后切换回调用者。

## 限制

| 限制 | 说明 |
|---|---|
| `start()` 具有固定参数个数 | `Fiber::start()` 拥有七个可选的 `mixed` 参数。超过七个值的调用将被拒绝，且拥有超过七个固定启动参数的回调也会被拒绝。变参回调尾部（variadic callback tails）将收集在固定参数之后剩余的已提供的值。 |
| 回调参数不能引用传递 | 类似于 `function (&$value): void {}` 的 `Fiber` 回调会被拒绝，因为启动参数在栈切换之前已被装箱并存储。 |
| 可调用形式由描述符支持 | `new Fiber(...)` 接受闭包、第一类可调用对象（first-class callables）、描述符值变量、运行时字符串回调、静态方法可调用数组、存储的和字面的实例方法可调用数组（例如 `$cb = [$object, "method"]`）、运行时选择的可调用数组（例如 `[$object, $method]`），以及可调用对象表达式（例如 `new Job()`）。 |
| 混合运算仍需要显式转换 | 通过 `start()`、`resume()`、`Fiber::suspend()` 和 `getReturn()` 传输的值都是装箱的 `mixed` 单元（cell）。虽然 `echo`、比较、`gettype()`、`instanceof` 和类型化回调参数可以处理它们，但对从 `Fiber::suspend()` 接收到的未类型化值进行算术运算可能不会自动拆箱（unbox）。在计算前请进行显式类型转换，例如 `(int)$value + 10`。 |
| `Fiber::getCurrent()` 内部类型不精确 | PHP 暴露了 `?Fiber`；`elephc` 目前在内部将结果表示为装箱的 `mixed`。类似于 `instanceof Fiber` 的运行时检查可以正常工作，但类型推导不如 PHP 的签名精确。 |
| 栈大小固定 | 每个 `Fiber` 获得 256 KiB 的可用栈以及一个 16 KiB 的保护页。没有面向用户的栈大小配置。栈溢出故障通过保护页触发，而不是抛出可捕获的 PHP 异常。 |
| 仅支持协作式 | `Fiber` 不提供并行执行、抢占、定时器或事件循环。调度完全通过 `start()`、`resume()`、`suspend()` 和 `throw()` 显式进行。 |
