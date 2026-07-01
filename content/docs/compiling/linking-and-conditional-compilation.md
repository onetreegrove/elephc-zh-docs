---
title: "链接、堆内存与条件编译"
description: "为 FFI 链接原生库和框架、配置运行时堆大小，以及定义编译时符号以用于 ifdef 分支。"
sidebar:
  order: 7
---

这些标志控制二进制文件的链接方式、程序的堆内存大小，以及在编译时选择哪些分支。

## 链接原生库

当程序通过 [extern/FFI](../beyond-php/extern.md) 调用 C 库时，这些库必须被链接到二进制文件中。

### `--link` / `-l`

链接一个额外的原生库。支持空格形式、短标志形式和连写形式；可重复使用以链接多个库。

```bash
elephc app.php --link sqlite3
elephc app.php -l sqlite3
elephc app.php -lsqlite3
```

### `--link-path` / `-L`

向库搜索路径中添加一个目录。可重复使用。

```bash
elephc app.php -l sqlite3 -L /opt/homebrew/lib
elephc app.php --link-path /usr/local/lib
```

### `--framework`

链接一个 macOS 框架。可重复使用。

```bash
elephc app.php --framework Cocoa --framework Metal
```

源码中的 `extern "libname" { ... }` 块会自动添加相应的 `-l` 标志；上述标志用于那些未在源码中命名的库。参见 [FFI & Extern](../beyond-php/extern.md)。

## 堆内存大小

编译后的程序使用固定大小的运行时堆，默认为 **8 MB**。分配大量数组、字符串或对象的程序可能需要更多堆空间。

### `--heap-size`

以字节为单位设置堆大小，最小值为 `65536`（64 KB）。

```bash
elephc --heap-size=16777216 heavy.php   # 16 MB
```

如果程序耗尽堆内存，将以致命错误 "heap memory exhausted" 中止；解决方法是增大 `--heap-size`。参见[内存模型](../internals/memory-model.md)。

## 运行时死代码剥离

编译器附带一个完整的运行时，其中包含所有受支持内置功能的辅助函数，但某个程序通常只会用到其中的一小部分。在链接**可执行文件**时，链接器只保留从程序可达的运行时辅助函数，其余部分将被丢弃，因此小程序不会携带整个运行时。这是自动完成的——无需任何标志——且不会改变程序行为，仅影响二进制文件大小。

该机制在所有受支持的目标平台上均以各平台的原生机制实现：

- **Linux** 将每个运行时辅助函数放入独立的 section，并以 `--gc-sections` 进行链接。
- **macOS** 在运行时对象中使用 `.subsections_via_symbols`，使每个辅助函数成为可独立回收的原子单元，并以 `-dead_strip` 进行链接。

共享库（`--emit cdylib`）会保留完整的运行时，因为任何导出符号都可能被链接器无法感知的宿主访问。

## 条件编译

elephc 通过 `ifdef` 支持编译时特性分支。符号在命令行中定义，分支在优化和代码生成之前被解析，因此未使用的分支永远不会被编译。

### `--define` / `--define=`

定义一个编译时符号。可重复使用。

```bash
elephc --define DEBUG app.php
elephc --define=DEBUG --define=METAL app.php
```

```php
ifdef (DEBUG) {
    echo "debug build\n";
}
```

完整的 `ifdef` 语法和语义请参见[条件编译](../beyond-php/ifdef.md)。
