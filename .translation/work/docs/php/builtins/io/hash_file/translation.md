---
title: "hash_file()"
description: "通过读取文件字节并对其进行哈希运算，将 `hash_file(algo, filename, binary?)` 降级处理。"
sidebar:
  order: 182
---

## hash_file()

```php
function hash_file(string $algo, string $filename, bool $binary = false, array $options = []): mixed
```

通过读取文件字节并对其进行哈希运算，将 `hash_file(algo, filename, binary?)` 降级处理。

**参数**：
- `$algo` (`string`)
- `$filename` (`string`)
- `$binary` (`bool`)，默认值 `false`，可选
- `$options` (`array`)，默认值 `[]`，可选

**返回值**：`mixed`

_暂无示例——请参阅 `examples/` 和 `showcases/` 目录中的使用模式。_




## 内部实现

有关 `hash_file` 在编译器中的实现方式，请参阅[内部实现页面](../../../internals/builtins/io/hash_file.md)。

