---
title: "getenv()"
description: "通过目标感知的环境查找辅助函数降级实现 `getenv(name)`。"
sidebar:
  order: 118
---

## getenv()

```php
function getenv(string $name, bool $local_only): mixed
```

通过目标感知的环境查找辅助函数降级实现 `getenv(name)`。

**参数**：
- `$name` (`string`)
- `$local_only` (`bool`)

**返回值**：`mixed`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `getenv` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/getenv.md)。
