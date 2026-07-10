# `--emit cdylib` 端到端演示

将一个包含两个 `#[Export]` 标记函数的简单 PHP 文件编译为可加载的共享库，然后从一个 C 宿主程序加载该库，以调用并执行生命周期入口点和导出的函数。

## 构建与运行

Linux：

```bash
cargo run -- --emit cdylib examples/cdylib/auth.php
cc -o examples/cdylib/host examples/cdylib/host.c -ldl
./examples/cdylib/host examples/cdylib/libauth.so
```

macOS：

```bash
cargo run -- --emit cdylib examples/cdylib/auth.php
cc -o examples/cdylib/host examples/cdylib/host.c
./examples/cdylib/host examples/cdylib/libauth.dylib
```

预期输出：

```
elephc cdylib demo OK: add_i64(40,2)=42, validate_token long=0 short=1
```

## 演示涵盖的内容 (v1)

- `--emit cdylib` 产物命名：`lib<stem>.{so,dylib}`。
- 通过 `dlopen` + `dlsym` 解析四个生命周期入口点（`elephc_init`、`elephc_shutdown`、`elephc_last_error`、`elephc_free`）。
- `int` 的标量参数传递与封送（通过 `add_i64` 进行往返测试）。
- `string` 类型的输入字符串参数传递与封送（`validate_token` 在两个连续的整数参数寄存器中接收一个 `(const char* ptr, size_t len)` 对）。
- 标量返回值（来自 `validate_token` 的 `int32_t`，以及来自 `add_i64` 的 `int64_t`）。

该演示支持所有受支持的目标平台：macOS aarch64、Linux aarch64 和 Linux x86_64。代码生成在 PIC 模式下运行（全局数据引用通过 GOT 进行），并且在 ELF 目标平台上，每个内部符号都以隐藏（hidden）可见性输出，因此 `.so` 仅导出生命周期入口点和 `#[Export]` 跳板（trampolines）函数。

## v1 特意未涵盖的内容

- 字符串返回值（目前尚不支持需通过 `elephc_free` 释放的、宿主所有的字符串）。
- 数组、对象、可调用对象（callable）或 `null` 参数/返回值类型。
- 异常从 PHP 传回到 C 的传播。
- 单线程宿主之外的线程安全保证。

这些特性将在 v1 稳定之后，在后续迭代中发布。
