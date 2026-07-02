---
title: "ARM64 指令"
description: "elephc 使用的 ARM64 指令参考。"
sidebar:
  order: 12
---

这是 elephc 最常使用的 ARM64 指令参考，按类别组织。每个条目展示了指令、其功能以及 elephc 在何处使用它。

## 算术

| 指令 | 语法 | 功能 |
|---|---|---|
| `add` | `add x0, x1, x2` | x0 = x1 + x2 |
| `adds` | `adds x0, x1, x2` | 相加并设置条件标志，用于带溢出检查的整数加法 |
| `sub` | `sub x0, x1, x2` | x0 = x1 - x2 |
| `subs` | `subs x0, x0, #1` | 相减并设置条件标志，常用于在条件跳转前递减计数器 |
| `mul` | `mul x0, x1, x2` | x0 = x1 × x2 |
| `madd` | `madd x0, x1, x2, x3` | x0 = x3 + (x1 × x2)。乘加，用于索引/步长地址计算 |
| `smulh` | `smulh x3, x1, x2` | 有符号 128 位乘积的高 64 位，用于检测乘法溢出 |
| `udiv` | `udiv x0, x1, x2` | x0 = x1 ÷ x2（无符号） |
| `sdiv` | `sdiv x0, x1, x2` | x0 = x1 ÷ x2（有符号） |
| `msub` | `msub x0, x1, x2, x3` | x0 = x3 - (x1 × x2)。用于求模：`a % b = a - (a/b)*b` |
| `neg` | `neg x0, x0` | x0 = -x0（补码取反） |
| `cmn` | `cmn x0, #1` | 比较相反数：设置标志，效果等同于加上该操作数。用于诸如 `-1` 的哨兵值检查 |
| `clz` | `clz x0, x1` | 计算前导零的位数 |
| `cneg` | `cneg x0, x0, mi` | 有条件地对寄存器取反 |
| `sxtw` | `sxtw x0, w0` | 将 32 位值符号扩展为 64 位 |
| `uxtw` | `uxtw x0, w0` | 将 32 位值零扩展为 64 位 |

### 使用立即数

| 指令 | 语法 | 功能 |
|---|---|---|
| `add` | `add x0, x0, #16` | x0 = x0 + 16 |
| `sub` | `sub sp, sp, #48` | 在栈上分配 48 字节 |

### 浮点算术

| 指令 | 语法 | 功能 |
|---|---|---|
| `fadd` | `fadd d0, d1, d0` | d0 = d1 + d0 |
| `fsub` | `fsub d0, d1, d0` | d0 = d1 - d0 |
| `fmul` | `fmul d0, d1, d0` | d0 = d1 × d0 |
| `fdiv` | `fdiv d0, d1, d0` | d0 = d1 ÷ d0 |
| `fneg` | `fneg d0, d0` | d0 = -d0 |
| `fsqrt` | `fsqrt d0, d0` | d0 = √d0 |
| `fabs` | `fabs d0, d0` | d0 = |d0| |
| `fmsub` | `fmsub d0, d1, d2, d3` | d0 = d3 - (d1 × d2)。浮点求模 |
| `frintm` | `frintm d0, d0` | d0 = floor(d0) |
| `frintp` | `frintp d0, d0` | d0 = ceil(d0) |
| `frinta` | `frinta d0, d0` | d0 = round(d0)，使用 elephc 为 `round()` 生成的当前浮点舍入规则 |
| `frintz` | `frintz d0, d0` | d0 = 向零舍入，用于截断浮点值 |
| `fmax` | `fmax d0, d0, d1` | d0 = max(d0, d1) |
| `fmin` | `fmin d0, d0, d1` | d0 = min(d0, d1) |

## 加载和存储

这些指令用于在寄存器和内存之间移动数据。寻址模式请参见[ARM64 汇编简介](arm64-assembly.md)。

| 指令 | 语法 | 功能 |
|---|---|---|
| `ldr` | `ldr x0, [x29, #-8]` | 将 8 字节从内存加载到 x0 |
| `ldr` | `ldr w0, [x1]` | 将 4 字节加载到 32 位 `w` 寄存器 |
| `ldur` | `ldur x0, [x29, #-8]` | 与 `ldr` 相同，但用于未对齐/负偏移量 |
| `str` | `str x0, [x29, #-8]` | 将 x0（8 字节）存储到内存 |
| `stur` | `stur x0, [x29, #-8]` | 与 `str` 相同，但用于未对齐/负偏移量 |
| `ldrb` | `ldrb w0, [x1]` | 加载 1 字节（零扩展至 32 位） |
| `ldrsb` | `ldrsb x0, [x1]` | 加载 1 字节（符号扩展至 64 位） |
| `strb` | `strb w0, [x1]` | 存储 w0 的最低字节 |
| `ldrh` | `ldrh w0, [x1]` | 加载 2 字节（半字） |
| `strh` | `strh w0, [x1]` | 存储 2 字节 |
| `ldrsw` | `ldrsw x15, [sp, x14]` | 加载 4 字节并符号扩展至 64 位 |
| `stp` | `stp x29, x30, [sp, #16]` | 存储一对寄存器（共 16 字节） |
| `ldp` | `ldp x29, x30, [sp, #16]` | 加载一对寄存器 |

### 浮点加载/存储

| 指令 | 语法 | 功能 |
|---|---|---|
| `ldr` | `ldr d0, [x9]` | 将 8 字节双精度值加载到浮点寄存器 |
| `str` | `str d0, [x29, #-16]` | 将浮点寄存器存储到内存 |

### PC 相对寻址（用于数据段）

| 指令 | 语法 | 功能 |
|---|---|---|
| `adrp` | `adrp x1, _str_0@PAGE` | 加载标签的 4KB 页面基地址 |
| `add` | `add x1, x1, _str_0@PAGEOFF` | 加上页面内的偏移量 |
| `adr` | `adr x9, _label` | 直接加载附近标签的地址（PC 相对寻址，不进行页面拆分） |

这两条指令总是成对出现 —— `adrp` 获取页面，`add` 获取确切地址。用于从[数据段](arm64-assembly.md#data-section-constants)加载字符串字面量和浮点常量。

## 移动与立即数

| 指令 | 语法 | 功能 |
|---|---|---|
| `mov` | `mov x0, x1` | 将 x1 复制到 x0 |
| `mov` | `mov x0, #42` | 加载小常量（0-65535） |
| `fmov` | `fmov d0, d1` | 在浮点（FP）与通用（GP）寄存器之间移动浮点值（或位模式） |
| `movz` | `movz x0, #0x1234` | 加载 16 位值，其余位清零 |
| `movk` | `movk x0, #0x5678, lsl #16` | 在指定的位位置插入 16 位值，保持其余位不变 |
| `movn` | `movn x0, #0` | 加载立即数的按位取反。`movn x0, #0` = -1 |
| `mvn` | `mvn x0, x0` | 寄存器按位取反：x0 = ~x0。用于 PHP 的 `~` 运算符 |

### 加载大常量

ARM64 指令的长度固定为 32 位，因此无法通过单条指令加载 64 位值。大数值需要使用 `movz` + `movk`：

```asm
; Load 0x7FFFFFFFFFFFFFFE (the null sentinel) into x0
movz x0, #0xFFFE            ; bits  0-15
movk x0, #0xFFFF, lsl #16   ; bits 16-31
movk x0, #0xFFFF, lsl #32   ; bits 32-47
movk x0, #0x7FFF, lsl #48   ; bits 48-63
```

请参见[内存模型](memory-model.md)以了解为何使用该特定值作为 null 哨兵值。

## 比较与条件指令

| 指令 | 语法 | 功能 |
|---|---|---|
| `cmp` | `cmp x0, #0` | 将 x0 与 0 进行比较（设置条件标志） |
| `cmp` | `cmp x0, x1` | 将 x0 与 x1 进行比较 |
| `tst` | `tst x0, #1` | 按位与，设置标志（但丢弃结果） |
| `cset` | `cset x0, eq` | 若相等标志置位，则 x0 = 1，否则为 0 |
| `csel` | `csel x0, x1, x2, gt` | 如果大于（gt），则 x0 = x1，否则 x0 = x2 |
| `csinv` | `csinv x0, x0, xzr, ge` | 如果条件为假：x0 = ~xzr = -1，否则 x0 保持不变。用于太空船操作符（`<=>`） |
| `cinc` | `cinc x0, x0, eq` | 当条件满足时，有条件地将寄存器递增 1 |

### 浮点比较

| 指令 | 语法 | 功能 |
|---|---|---|
| `fcmp` | `fcmp d0, d1` | 比较两个双精度值，并设置标志 |
| `fcmp` | `fcmp d0, #0.0` | 将双精度值与零进行比较 |

### 条件码

在 `cmp` 之后，使用这些条件码来测试结果：

| 代码 | 含义 | PHP 运算符 |
|---|---|---|
| `eq` | 相等 | `==` |
| `ne` | 不相等 | `!=` |
| `lt` | 小于（有符号） | `<` |
| `gt` | 大于（有符号） | `>` |
| `le` | 小于或等于（有符号） | `<=` |
| `ge` | 大于或等于（有符号） | `>=` |
| `mi` | 负数 | 用于符号检查 |
| `cs` | 进位置位 | 用于无符号比较或设置标志的算术运算后 |

## 跳转（控制流）

| 指令 | 语法 | 功能 |
|---|---|---|
| `b` | `b _label` | 无条件跳转 |
| `b.eq` | `b.eq _label` | 如果相等则跳转（在 `cmp` 之后） |
| `b.ne` | `b.ne _label` | 如果不相等则跳转 |
| `b.lt` | `b.lt _label` | 如果小于则跳转 |
| `b.gt` | `b.gt _label` | 如果大于则跳转 |
| `b.le` | `b.le _label` | 如果小于或等于则跳转 |
| `b.ge` | `b.ge _label` | 如果大于或等于则跳转 |
| `b.lo` | `b.lo _label` | 如果低于则跳转（无符号比较） |
| `b.hs` | `b.hs _label` | 如果高于或相同则跳转（无符号比较） |
| `b.hi` | `b.hi _label` | 如果高于则跳转（无符号比较） |
| `b.ls` | `b.ls _label` | 如果低于或相同则跳转（无符号比较） |
| `b.cs` | `b.cs _label` | 如果进位置位则跳转 |
| `cbz` | `cbz x0, _label` | 如果 x0 == 0 则跳转 |
| `cbnz` | `cbnz x0, _label` | 如果 x0 != 0 则跳转 |
| `tbnz` | `tbnz x0, #3, _label` | 测试某一位，如果其非零则跳转 |
| `bl` | `bl _fn_add` | 带链接的跳转 —— 调用函数（将返回地址保存到 x30 中） |
| `blr` | `blr x9` | 带链接的寄存器跳转 —— 通过寄存器进行间接函数调用（用于闭包和回调） |
| `br` | `br x9` | 跳转到寄存器中的地址，而不保存返回地址 |
| `brk` | `brk #0` | 陷入调试器 / 触发断点异常终止 |
| `ret` | `ret` | 返回 —— 跳转到 x30 中的地址 |

### 跳转指令如何映射到 PHP

请参见[代码生成器](the-codegen.md)以获取完整细节。

```
if ($x > 0)     →  cmp x0, #0  /  b.le _else_1
while ($i < 10)  →  cmp x0, #10  /  b.ge _end_while_1
break            →  b _end_while_1
continue         →  b _while_1
```

## 类型转换

| 指令 | 语法 | 功能 |
|---|---|---|
| `scvtf` | `scvtf d0, x0` | 有符号整数 → 双精度浮点数 |
| `fcvtzs` | `fcvtzs x0, d0` | 双精度浮点数 → 有符号整数（向零截断） |

用于 PHP 的类型转换（`(int)3.14`，`(float)42`）和混合算术运算。请参见[类型检查器](the-type-checker.md)。

## 按位运算

| 指令 | 语法 | 功能 |
|---|---|---|
| `and` | `and x0, x0, #0xFF` | 按位与 |
| `orr` | `orr x0, x0, x1` | 按位或 |
| `eor` | `eor x0, x0, x1` | 按位异或 |
| `lsr` | `lsr x0, x0, #4` | 逻辑右移 |
| `lsl` | `lsl x0, x0, #3` | 逻辑左移 |
| `asr` | `asr x0, x0, #63` | 算术右移（保留符号位） |
| `ubfx` | `ubfx x13, x13, #8, #7` | 无符号位段提取：提取一定范围的位，用于读取运行时标记（tag） |

用于 PHP 的按位运算符（`&`、`|`、`^`、`<<`、`>>`），以及在[运行时例程](the-runtime.md)中用于十六进制转换、哈希算法和 base64 编码等功能。

## 系统调用

| 指令 | 语法 | 功能 |
|---|---|---|
| `svc` | `svc #0x80` | 主管呼叫（Supervisor call）—— 调用 macOS 内核 |

在调用 `svc` 之前，需进行设置：`x16` = 系统调用号，`x0`-`x5` = 参数。

| 系统调用 | x16 | 参数 | 用于 |
|---|---|---|---|
| exit | `#1` | x0 = 退出状态码 | `exit()`，程序终止 |
| write | `#4` | x0 = fd, x1 = buf, x2 = len | `echo`, `print` |
| stat64 | `#338` | 路径 / 缓冲区指针 | 文件系统元数据助手函数 |

## 汇编伪指令

这些不是 CPU 指令 —— 它们是给汇编器的命令：

| 伪指令 | 示例 | 功能 |
|---|---|---|
| `.global` | `.global _main` | 使标签对链接器可见 |
| `.align` | `.align 2` | 将下一个数据对齐到 2^2 = 4 字节 |
| `.data` | `.data` | 切换到数据段 |
| `.text` | `.text` | 切换到代码段 |
| `.ascii` | `.ascii "hello"` | 生成字符串字节（无空终止符） |
| `.quad` | `.quad 0x4028000000000000` | 生成 8 字节值（用于浮点常量） |
| `.comm` | `.comm _heap_buf, 1048576` | 保留未初始化的内存（BSS 段） |
