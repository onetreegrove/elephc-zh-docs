---
title: "条件编译"
description: "用于编译时特性标志和平台特定代码的 ifdef 块。"
sidebar:
  order: 5
---

`ifdef` 根据编译时符号选择性地包含或排除代码。

## 语法
```php
<?php
ifdef DEBUG {
    echo "debug mode\n";
} else {
    echo "release mode\n";
}
```

## 工作原理
- 通过 `--define` CLI 标志设置符号
- 在 include 解析和类型检查之前解析
- 未激活的分支会从 AST 中完全移除
- 未激活的分支可以引用不存在的文件

## 使用场景
```php
<?php
ifdef USE_SDL {
    extern "SDL2" {
        function SDL_Init(int $flags): int;
    }
    SDL_Init(0x20);
}

ifdef DEBUG {
    if ($hp < 0) {
        echo "BUG: negative HP!\n";
        exit(1);
    }
}
```

## CLI 用法
```bash
elephc --define DEBUG app.php
elephc --define DEBUG --define USE_SDL app.php
```

## 嵌套
```php
<?php
ifdef PLATFORM_MAC {
    ifdef USE_METAL {
        echo "Metal renderer\n";
    } else {
        echo "OpenGL renderer\n";
    }
}
```

## 限制
- 符号为简单名称（无表达式，无 `ifndef`，无 `#if`）
- 符号仅来自 `--define` 标志
- `ifdef` 不是 PHP 语法

## CLI 标志参考

| 标志 | 描述 |
|---|---|
| `--target TARGET` | 编译为 `macos-aarch64`、`linux-aarch64` 或 `linux-x86_64` 目标平台，而不是自动检测宿主机目标平台 |
| `--heap-size=BYTES` | 设置堆缓冲区大小（默认 8MB，最小 64KB） |
| `--gc-stats` | 退出时打印 GC 分配/释放统计信息 |
| `--heap-debug` | 启用运行时堆验证（慢） |
| `--emit-asm` | 写入生成的汇编并跳过汇编/链接 |
| `--check` | 运行前端流水线而不生成汇编或二进制文件 |
| `--timings` | 将编译器各阶段的耗时打印到 stderr |
| `--source-map` | 在生成的汇编旁写入 `.map` 源码映射伴随文件 |
| `--define SYMBOL` | 为 `ifdef` 定义编译时符号 |
| `--link LIB` / `-lLIB` | 链接额外的原生库 |
| `--link-path DIR` / `-LDIR` | 添加额外的原生库搜索路径 |
| `--framework NAME` | 链接 macOS 框架 |
