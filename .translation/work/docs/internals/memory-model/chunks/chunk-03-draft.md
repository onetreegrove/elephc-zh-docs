### 哈希与冲突处理

字符串键在查找或插入前会进行规范化：PHP 中形如整数的数字字符串会转换为整数键，而带前导零的字符串（如 `"01"`）仍保持为字符串键。字符串键使用 **FNV-1a** 算法进行哈希（对短字符串速度快、分布均匀）；整数键使用标量整数混合算法。冲突通过**线性探测**解决——若槽位 `hash % capacity` 已被占用，则依次尝试 `(hash + 1) % capacity`，以此类推。

条目地址：`base + 40 + (slot_index × 64)`

### 迭代顺序

查找时仍会探测物理桶，但迭代是沿 `head -> next -> ... -> tail` 链表进行遍历。头部的 `val_type` 现在仅作概要信息，正确性敏感路径会读取每个条目自身的 `value_tag`。以下场景均能保留 PHP 的插入顺序：

- 关联数组的 `foreach`
- `array_keys()` 和 `array_values()`
- 存在重复值时的 `array_search()` / `in_array()`
- 关联数组的 `json_encode()`
- 扩容时的重哈希与写时复制克隆

### 与索引数组的对比

| | 索引数组 | 关联数组 |
|---|---|---|
| 头部 | 24 字节 | 40 字节 |
| 元素大小 | 8 或 16 字节 | 64 字节（固定） |
| 访问 | 按索引 O(1) | 按哈希平均 O(1) |
| 迭代 | 顺序访问 | 按插入顺序遍历已占用槽位的链表 |
| 键 | 隐式（0, 1, 2, ...） | 显式字符串 |

## 对象布局

对象在堆上分配，布局在编译期固定。每个对象以一个 8 字节的类标识符开头，之后整个继承链上的每个属性各占 16 字节：

```
_heap_buf + offset:
┌──────────┬──────────────────┬──────────────────┬─────┐
│ class_id │   prop[0] (16B)  │   prop[1] (16B)  │ ... │
│ (8 bytes)│                  │                  │     │
└──────────┴──────────────────┴──────────────────┴─────┘
 offset+0    offset+8           offset+24          ...
```

| 字段 | 大小 | 描述 |
|---|---|---|
| `class_id` | 8 字节 | 标识该对象所属的类 |
| `prop[n]` | 16 字节 | 属性值（无论类型如何均占 16 字节，以保证偏移量统一） |

对象总大小：`8 + (num_properties × 16)`

属性访问为 O(1)——编译器在编译期解析每个属性继承后的最终偏移量，并直接生成该偏移处的 load/store 指令，无需运行时查找或哈希表。

与数组不同，对象不可调整大小。属性数量由类声明固定。属性按父类优先的顺序存储，其次是子类自身声明的属性。

## 生成器帧布局

`Generator` 对象是堆分配的对象类型块，具有固定的自定义头部，之后跟随生成器专用的参数/局部变量槽。第一个字仍为 class id，因此普通的 `instanceof Generator` 和 `Iterator` 检查可以正常工作，但其余载荷由生成的 resume 函数和 `__rt_gen_*` 运行时辅助函数解释，而非由属性元数据解释。

```
Offset  Size  Field
  0      8    class_id
  8      8    resume_fn_ptr
 16      4    state_idx
 20      4    flags (bit 0 = rewound, bit 1 = terminated)
 24      8    auto_key_counter
 32      8    last_key boxed Mixed pointer
 40      8    last_value boxed Mixed pointer
 48      8    return_value boxed Mixed pointer
 56      8    sent_value boxed Mixed pointer
 64      8    delegated_iter pointer used by `yield from`
 72      8    layout_id
 80      ...  parameter and local slots, 8 bytes each
```

Mixed 字段在存在时拥有装箱单元格的所有权。当生成器帧被释放时，对象深度释放逻辑检测到 `_generator_class_id` 后，会通过与其他地方相同的引用计数运行时路径释放 `last_key`、`last_value`、`return_value`、`sent_value` 以及所有活跃的委托迭代器。

## 数据节

字符串字面量和浮点常量直接内嵌于二进制文件中：

```asm
.data
_str_0: .ascii "Hello, world!\n"
_str_1: .ascii "Error: "
.align 3
_float_0: .quad 0x400921FB54442D18    ; 3.14159...
_float_1: .quad 0x4000000000000000    ; 2.0
```

- 字符串以原始字节存储（无空终止符——长度在编译期已知）
- 浮点数以 64 位 IEEE 754 位模式存储
- 相同的字面量会被去重（源码中两个 `"hello"` = 二进制中一个 `_str_0`）

这些数据是**只读的**——程序永远不会修改它们。当字符串操作需要处理字面量时，从数据节读取，并将结果写入[字符串缓冲区](#the-string-buffer)。

运行时数据层划分为固定共享数据、用户程序数据以及位于 `src/codegen/runtime/data/` 下的动态 `instanceof` 查找格式化数据。它们共同生成以下静态数据表：

- `_fmt_g` — 浮点数转字符串的 printf 格式字符串（`%.14G`）
- `_b64_encode_tbl` — 64 字节的 Base64 编码查找表
- `_b64_decode_tbl` — 256 字节的 Base64 解码查找表
- `_spl_autoload_exts_default`、`_spl_autoload_exts_ptr`、`_spl_autoload_exts_len` — 可变的 SPL 自动加载扩展名状态
- `_heap_err_msg`、`_arr_cap_err_msg`、`_ptr_null_err_msg` — 致命运行时错误字符串
- `_buffer_bounds_msg`、`_buffer_uaf_msg`、`_match_unhandled_msg`、`_static_prop_private_access_msg`、`_instanceof_target_type_msg`、`_iterable_unsupported_kind_msg` — 用于 buffer、`match`、延迟绑定私有静态属性访问、动态 `instanceof` 目标验证及可迭代分发的致命运行时错误字符串
- `_fiber_msg_*` — 构造 `FiberError` 时使用的 Fiber 状态错误消息字符串
- `_rt_diag_suppression`、`_diag_fopen_failed_msg`、`_diag_file_get_contents_failed_msg`、`_diag_define_already_defined_msg` — 运行时警告抑制深度以及 `@` 运算符使用的警告字符串
- `_resource_id_prefix` — 资源显示辅助函数使用的前缀
- `_php_uname_mode_len_msg`、`_php_uname_mode_value_msg` — `php_uname()` 无效模式参数的致命诊断信息
- `_filetype_*`、`_stat_key_*`、`_dirname_*`、`_pathinfo_key_*`、`_tmpfile_template` — I/O 辅助函数使用的文件元数据、路径、stat 数组及临时文件查找字符串
- `_locale_utf8_name`、`_locale_env_name` — 需要回退到宿主 locale 的运行时辅助函数使用的 locale 选择器
- `_json_true`、`_json_false`、`_json_null` — `json_encode` 用于布尔值和 null 的 JSON 关键字字符串（分别为 4、5、4 字节）
- `_json_int_max_str`、`_json_int_min_str` — `JSON_BIGINT_AS_STRING` 使用的十进制阈值字符串
- `_json_err_msg_0` ... `_json_err_msg_10`、`_json_err_msg_table`、`_json_err_msg_count`、`_json_err_loc_prefix`、`_json_err_loc_colon` — `json_last_error_msg()` 的消息查找数据及解码位置后缀片段
- `_day_names` — 84 字节表（7 条目 × 12 字节），包含星期名称、长度及填充，供 `date()` 进行星期格式化
- `_month_names` — 144 字节表（12 条目 × 12 字节），包含月份名称、长度及填充，供 `date()` 进行月份格式化
- `_strtotime_keyword_tab`、`_strtotime_unit_tab` — `strtotime()` 使用的关键字、星期、修饰符及单位查找表
- `_instanceof_target_count`、`_instanceof_target_entries`、`_instanceof_name_*` — 用于动态 `instanceof` 字符串目标的类/接口名称元数据（大小写不敏感），包含前导反斜杠别名
- `_generator_class_id` — 每个程序的 class id，用于在对象深度释放时识别 Generator 帧
- `_json_exception_class_id`、`_stdclass_class_id` — 每个程序的 class id，分别用于 JSON 抛出路径和 stdClass 动态属性辅助函数
- `_class_gc_desc_count`、`_class_gc_desc_ptrs`、`_class_gc_desc_<id>` — 每个类的属性遍历描述符，用于对象深度释放和循环引用收集
- `_class_json_desc_ptrs`、`_class_json_desc_<id>`、`_class_json_pname_<id>_<slot>` — 每个类的 JSON 描述符，用于对象编码和 JsonSerializable 分发
- `_class_attribute_count`、`_class_attribute_ptrs`、`_class_attributes_<id>` — 从 `ClassInfo` 生成的每个类的 PHP attribute 元数据；当前辅助函数和 Reflection API 在代码生成期间将支持的静态查找具体化，而非执行动态运行时类/成员查找
- `_class_vtable_ptrs`、`_class_vtable_<id>` — 每个类的虚表，用于继承实例方法分发
- `_class_static_vtable_ptrs`、`_class_static_vtable_<id>` — 每个类的静态方法表，用于延迟静态绑定
- `_class_destruct_ptrs` — 以 class_id 为索引的 `__destruct` 方法指针（或 `0`），在对象深度释放时查阅
- `_classes_by_name`、`_classes_by_name_count` — 大小写不敏感的类名查找表，用于 `new $variable()` 实例化
- 由 `enum_case_symbol(...)` 生成的枚举 case `.comm` 符号——每个已声明的枚举 case 对应一个 8 字节的单例存储槽

### 全局变量

两个 8 字节的 BSS 槽存储程序的命令行参数：

```asm
.comm _global_argc, 8       ; saved argc from OS
.comm _global_argv, 8       ; saved argv pointer from OS
```

这两个槽在 `_main` 中写入一次（来自操作系统提供的 `x0` 和 `x1`），由 `__rt_build_argv` 例程读取以构建 `$argv`。

### 用户全局变量（`global $var`）

当函数使用 `global $var` 时，编译器为该变量分配 BSS 存储：

```asm
.comm _gvar_x, 16, 3        ; 16 bytes for global $x (enough for string ptr+len or int/float)
.comm _gvar_y, 16, 3        ; 16 bytes for global $y
```

每个全局变量获得 16 字节的 BSS 存储（足以容纳任意 PHP 值）。`_main` 作用域在赋值给任何函数声明为 `global` 的变量时写入这些槽，函数通过这些槽进行读写，而非使用本地栈槽。

### 枚举 case 单例存储

用户定义的枚举同样贡献 BSS 存储。在 `emit_runtime_data_user()` 执行期间，编译器为每个已声明的 case 生成一个 8 字节的 `.comm` 符号，使用 `enum_case_symbol(...)` 生成的经过名称修饰的符号名。

这些槽使枚举 case 在运行时表现为稳定的单例值：代码生成可以直接加载规范 case 的地址，而 `Enum::from()` 等辅助路径可以比较或返回这些规范 case 对象，无需构造临时堆值。

### 静态变量（`static $var`）

静态变量在同一函数的多次调用之间保持其值。每个静态变量获得两个 BSS 分配：

```asm
.comm _static_counter_count, 16, 3    ; 16 bytes for the persisted value
.comm _static_counter_count_init, 8, 3 ; 8-byte init flag (0 = uninitialized)
```

命名模式为 `_static_FUNCNAME_VARNAME`。初始化标志确保初始值表达式仅在第一次调用时求值。在函数尾声处，标记为静态的变量会被保存回其 BSS 存储。

### 静态属性（`ClassName::$prop`）

静态属性是类级别的存储，而非对象字段。在 `emit_runtime_data_user()` 执行期间，每个有效的声明类属性获得一个 16 字节的 BSS 槽：

```asm
.comm _static_prop_Counter_count, 16, 3 ; 16 bytes for Counter::$count
```

命名模式来自 `static_property_symbol(...)`。继承的静态属性指向声明类的槽，因此当属性仅在 `Base` 上声明时，`Base::$count` 和 `Child::$count` 共享同一存储。当子类重新声明静态属性时，该子类获得自己的槽，`static::$count` 在运行时通过被调用类的 id 分发到该槽。`_main` 在用户语句运行之前对静态属性默认值求值，后续的读写直接加载或存储到解析后的槽。
