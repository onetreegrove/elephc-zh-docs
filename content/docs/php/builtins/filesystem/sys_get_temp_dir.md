---
title: "sys_get_temp_dir()"
description: "将 `sys_get_temp_dir()` 降级为项目硬编码的 `/tmp` 字符串。"
sidebar:
  order: 145
---

## sys_get_temp_dir()

```php
function sys_get_temp_dir(): string
```

将 `sys_get_temp_dir()` 降级为项目硬编码的 `/tmp` 字符串。

**参数**：无。

**返回值**：`string`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `sys_get_temp_dir` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/sys_get_temp_dir.md)。
