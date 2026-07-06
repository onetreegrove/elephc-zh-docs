---
title: "chgrp()"
description: "针对整数 GID 和字符串组名降级实现 `chgrp(path, group)`。"
sidebar:
  order: 98
---

## chgrp()

```php
function chgrp(string $filename, int $group): bool
```

针对整数 GID 和字符串组名降级实现 `chgrp(path, group)`。

**参数**：
- `$filename` (`string`)
- `$group` (`int`)

**返回值**：`bool`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_







## 内部实现

关于 `chgrp` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/filesystem/chgrp.md)。
