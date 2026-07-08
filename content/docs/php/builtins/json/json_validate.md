---
title: "json_validate()"
description: "将 `json_validate(json, depth?, flags?)` 降级到共享的验证器运行时。"
sidebar:
  order: 232
---

## json_validate()

```php
function json_validate(string $json, int $depth, int $flags): bool
```

将 `json_validate(json, depth?, flags?)` 降级到共享的验证器运行时。

**参数**：
- `$json` (`string`)
- `$depth` (`int`)，可选
- `$flags` (`int`)，可选

**返回值**：`bool`

_暂无示例 — 请查看 `examples/` 和 `showcases/` 以获取使用模式。_







## 内部实现

关于 `json_validate` 在编译器中的实现方式，请参见[内部实现页面](../../../internals/builtins/json/json_validate.md)。
