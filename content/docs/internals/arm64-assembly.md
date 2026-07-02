---
title: "ARM64 汇编"
description: "用于编译器输出的 ARM64 汇编介绍。"
sidebar:
  order: 11
---

## 什么是汇编语言？

汇编是原始机器码之上最薄的一层。每条汇编指令（几乎）与单个 CPU 操作呈 1 对 1 映射。在高级语言中写为 `$x = $a + $b` 的地方，在汇编中则写为：

```asm
ldr x1, [x29, #-16]     ; load $a from the stack into register x1
ldr x2, [x29, #-24]     ; load $b from the stack into register x2
add x0, x1, x2          ; add them, put the result in x0
str x0, [x29, #-32]     ; store the result back to the stack ($x)
```

每一行都是一个操作。CPU 会按顺序读取它们（除非分支指令另有指示）。

## 什么是 ARM64？

ARM64（也称为 AArch64）是 Apple Silicon 芯片（M1、M2、M3、M4）和大多数现代智能手机所使用的指令集。它是一种 **RISC**（精简指令集计算机）架构——指令简单、固定大小（每条指令 4 字节）且格式统一。

相比之下，x86-64 (Intel/AMD) 是 **CISC**（复杂指令集）架构——指令长度可变，且有许多特殊情况。ARM64 更加干净且易于学习。

## 寄存器：CPU 的变量

寄存器是 CPU 内部一个微型、超快速的存储位置。ARM64 拥有 31 个通用寄存器，每个寄存器宽度为 64 位（8 字节）：

### 通用寄存器

| 寄存器 | 约定 | elephc 用法 |
|---|---|---|
| `x0`-`x7` | 函数参数与返回值 | 传递给/来自函数的参数。`x0` = 整数/布尔值结果 |
| `x8` | 间接结果 | 暂存寄存器 |
| `x9`-`x15` | 临时寄存器（调用者保存） | 中间计算的暂存空间 |
| `x16`-`x17` | 过程内暂存寄存器 | `x16` = macOS 上的系统调用号 |
| `x29` | 帧指针（FP） | 指向当前函数的栈帧 |
| `x30` | 链接寄存器（LR） | 返回地址（在 `ret` 之后要跳转的地址） |
| `sp` | 栈指针 | 栈顶（向下增长） |

你还可以使用 `w0`-`w30` 来仅访问每个寄存器的低 32 位（在像 `strb w12, [x9]` 这样的字节操作中很有用）。

### 浮点寄存器

| 寄存器 | 用途 |
|---|---|
| `d0`-`d7` | 浮点参数与返回值 |
| `d8`-`d15` | 被调用者保存（在函数调用之间保留） |
| `d16`-`d31` | 临时寄存器 |

在 elephc 中，`d0` 存放浮点结果。传给函数的浮点参数使用 `d0`-`d7`。

### elephc 如何使用寄存器

elephc 遵循一个简单的约定（详见[代码生成器](the-codegen.md)）：

```
Integer/Bool result  → x0
Float result         → d0
String result        → x1 (pointer to bytes), x2 (length)
Array result         → x0 (pointer to heap-allocated header)
```

## 栈：函数局部存储

**栈**是一个向下增长（从高地址到低地址）的内存区域。每次函数调用都会创建一个**栈帧**——用于存放该函数局部变量的一块内存。

```
High addresses
┌─────────────────────┐
│  caller's frame      │
├─────────────────────┤ ← x29 (frame pointer) points here
│  saved x29, x30      │  (16 bytes: frame pointer + return address)
├─────────────────────┤
│  local variable 1    │  [x29, #-8]
│  local variable 2    │  [x29, #-16]
│  local variable 3    │  [x29, #-24]
│  ...                 │
├─────────────────────┤ ← sp (stack pointer) points here
Low addresses
```

核心概念：

- **`sp`**（栈指针）标记当前栈顶。你通过减去 `sp` 的值来分配空间。
- **`x29`**（帧指针）标记当前帧的基址。局部变量通过相对于 `x29` 的负偏移量来访问。
- **`x30`**（链接寄存器）存放返回地址——即函数结束时 CPU 应该跳转到的位置。

### 函数序言与尾声

每个函数都以**序言（prologue）**开始（设置帧），并以**尾声（epilogue）**结束（销毁帧）：

```asm
; Prologue
sub sp, sp, #48          ; allocate 48 bytes on the stack
stp x29, x30, [sp, #32] ; save old frame pointer and return address
add x29, sp, #32        ; set new frame pointer

; ... function body ...

; Epilogue
ldp x29, x30, [sp, #32] ; restore frame pointer and return address
add sp, sp, #48          ; deallocate stack space
ret                      ; jump to address in x30
```

这就是 elephc 为每个函数生成的结构。详见[代码生成器](the-codegen.md)。

## 内存：加载与存储

ARM64 是一种**加载/存储（load/store）架构**。你不能直接对内存进行操作——必须先将值加载到寄存器中，在寄存器中对其进行操作，然后再将结果存回内存：

```asm
ldr x0, [x29, #-8]      ; LOAD: read 8 bytes from stack into x0
add x0, x0, #1           ; OPERATE: add 1 to x0
str x0, [x29, #-8]       ; STORE: write x0 back to the stack
```

这就是为什么 PHP 中的 `$i++` 在汇编中会变成至少 3 条指令的原因。

### 寻址模式

| 语法 | 含义 | 示例 |
|---|---|---|
| `[x29, #-16]` | 基址 + 偏移量 | 从帧指针下方 16 字节处加载 |
| `[x1]` | 仅基址 | 从 x1 中的地址加载 |
| `[x0, x1, lsl #3]` | 基址 + 移位索引 | 数组访问：基址 + (索引 × 8) |

## 系统调用：与操作系统通信

CPU 自身无法向屏幕打印内容或读取文件——它需要请求操作系统。在 macOS ARM64 上，这是通过 `svc`（系统服务调用）指令完成的：

```asm
mov x0, #1          ; file descriptor 1 = stdout
; x1 = pointer to string data (already set)
; x2 = string length (already set)
mov x16, #4         ; syscall number 4 = write
svc #0x80           ; invoke the kernel
```

这就是 elephc 中 `echo` 的工作原理——每个 `echo` 最终都会变成一个 `write` 系统调用。有关打印前如何将值转换为字符串的更多细节，请参阅[运行时](the-runtime.md)。

## 分支：控制流

CPU 默认会按顺序执行指令，除非**分支（branch）**改变了执行流：

| 指令 | 含义 | 用途 |
|---|---|---|
| `b label` | 无条件跳转 | `else` 块、循环回跳边 |
| `b.eq label` | 等于则分支跳转 | 在 `cmp` 之后，用于 `==` |
| `b.ne label` | 不等于则分支跳转 | 用于 `!=` |
| `b.lt label` | 小于则分支跳转 | 用于 `<` |
| `b.gt label` | 大于则分支跳转 | 用于 `>` |
| `b.le label` | 小于或等于则分支跳转 | 用于 `<=` |
| `b.ge label` | 大于或等于则分支跳转 | 用于 `>=` |
| `b.lo label` | 低于则分支跳转（无符号） | 堆/指针下界检查 |
| `b.hs label` | 高于或相同则分支跳转（无符号） | 堆/指针上界检查 |
| `b.hi label` | 高于则分支跳转（无符号） | 无符号范围检查 |
| `b.ls label` | 低于或相同则分支跳转（无符号） | 无符号范围检查 |
| `b.cs label` | 进位设置则分支跳转 | 标志设置的算术运算和无符号进位检查 |
| `cbz x0, label` | 如果 x0 为零则分支跳转 | `if` 条件（假值检查） |
| `cbnz x0, label` | 如果 x0 不为零则分支跳转 | 循环条件 |
| `tbnz x0, #bit, label` | 测试位并当其非零时分支跳转 | 运行时标志/标签（flag/tag）检查 |
| `bl label` | 带链接的分支跳转（函数调用） | 将返回地址保存在 x30 中 |
| `blr xN` | 分支跳转并链接至寄存器（间接调用） | 调用寄存器中地址指向的函数（用于闭包） |
| `br xN` | 分支跳转至寄存器 | 尾跳转/运行时分发，不保存返回地址 |
| `brk #0` | 断点陷阱 | 运行时守护失败（guard failure）与硬陷阱（hard trap） |
| `ret` | 从函数返回 | 跳转到 x30 中的地址 |

### 一个 `if` 语句如何变成汇编

```php
if ($x > 0) {
    echo "positive";
}
```

变成（简化版）：

```asm
ldr x0, [x29, #-8]      ; load $x
cmp x0, #0               ; compare $x with 0
b.le _end_if_1           ; if $x <= 0, skip the body
; ... emit "positive" ...
_end_if_1:
```

对于局部栈插槽（stack slot），elephc 通常会发射 `ldur` / `stur`（或先用 `sub` 计算地址），而不是直接使用带负立即数的原始 `ldr` / `str`。本页中的简化示例侧重于控制流结构，而不是确切的辅助指令序列。

关于 elephc 使用的每条指令，请参阅 [ARM64 指令参考](arm64-instructions.md)；关于每个 PHP 结构如何映射到汇编，请参阅[代码生成器](the-codegen.md)。

## 标签：命名位置

标签是代码中位置的名称。它们不会生成指令——只是标记分支可以跳转到的地址：

```asm
_while_1:                ; ← this is a label
    ldr x0, [x29, #-8]
    cmp x0, #10
    b.ge _end_while_1   ; jump forward to end
    ; ... loop body ...
    b _while_1           ; jump back to start
_end_while_1:            ; ← another label
```

在 elephc 中，标签是使用全局计数器生成的，以避免冲突：`_while_1`、`_while_2`、`_if_3` 等。关于 `Context::next_label()` 的工作原理，请参阅[代码生成器](the-codegen.md)。

## 数据段：常量

汇编输出有两个段：

- **`.text`** —— 可执行代码（指令）
- **`.data`** —— 只读数据（字符串字面量、浮点数常量）

```asm
.data
_str_0: .ascii "Hello, world!\n"    ; 14 bytes
_float_0: .quad 0x400921FB54442D18  ; 3.14159... stored as raw bits

.text
; ... code that references _str_0 and _float_0 ...
```

字符串字面量直接嵌入在二进制文件中。要使用它们，你可以使用 `adrp` + `add` 加载其地址（请参阅 [ARM64 指令参考](arm64-instructions.md)）。
