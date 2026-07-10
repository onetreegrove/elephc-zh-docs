---
title: "SPL"
description: "PHP 标准库（SPL）接口、异常以及由运行时支持的容器类。"
sidebar:
  order: 10
---

elephc 提供了目前所支持的 PHP 代码需要的 SPL 组件：迭代器/计数/访问接口、SPL 异常体系、自动加载和内省辅助函数、Phase 4 容器类、Phase 5 存储迭代器/装饰器基础、Phase 6 堆/对象存储类，以及 Phase 8 文件/目录迭代器。
这包括 `EmptyIterator`、`InternalIterator`、`ArrayIterator`、`ArrayObject`、`IteratorIterator`、`LimitIterator`、`NoRewindIterator`、`InfiniteIterator`，过滤器/缓存装饰器 `FilterIterator`、`CallbackFilterIterator`、`RegexIterator` 和 `CachingIterator`，多源装饰器 `AppendIterator` 和 `MultipleIterator`，递归系列 `RecursiveArrayIterator`、`RecursiveFilterIterator`、`RecursiveCallbackFilterIterator`、`RecursiveRegexIterator`、`RecursiveIteratorIterator` 和 `RecursiveCachingIterator`，文件系统类 `SplFileInfo`、`SplFileObject`、`SplTempFileObject`、`DirectoryIterator`、`FilesystemIterator`、`GlobIterator` 和 `RecursiveDirectoryIterator`，以及 `ParentIterator`，加上 `SplHeap`、`SplMaxHeap`、`SplMinHeap`、`SplPriorityQueue` 和 `SplObjectStorage`。

与 PHP 一致，SPL 名称位于全局命名空间中。它们无需导入或运行时扩展即可直接使用。

## 接口

编译器会注入以下 SPL 相关的接口：

| 接口 | 说明 |
|---|---|
| `Traversable` | 可迭代对象的标记接口 |
| `Iterator` | 需要实现 `current()`、`key()`、`next()`、`valid()`、`rewind()` |
| `IteratorAggregate` | 需要实现 `getIterator(): Traversable` |
| `OuterIterator` | 继承 `Iterator` 并增加 `getInnerIterator()` |
| `RecursiveIterator` | 继承 `Iterator` 并增加递归遍历钩子 |
| `SeekableIterator` | 继承 `Iterator` 并增加 `seek()` |
| `Countable` | `count($obj)` 会分发到 `count()` 方法 |
| `ArrayAccess` | 下标语法会分发到 offset 方法 |
| `SplObserver`, `SplSubject` | 观察者/目标契约 |

完整的接口方法签名在 [Classes](classes.md) 中列出。

## 异常

SPL 异常层次结构是内置的，因此用户代码可以直接抛出和捕获这些类型：

| 父类 | 内置子类 |
|---|---|
| `LogicException` | `BadFunctionCallException`, `BadMethodCallException`, `DomainException`, `InvalidArgumentException`, `LengthException`, `OutOfRangeException` |
| `RuntimeException` | `OutOfBoundsException`, `OverflowException`, `RangeException`, `UnderflowException`, `UnexpectedValueException` |

它们继承了标准的 `Exception` 构造函数和 `Throwable` API。Catch 匹配遵循 PHP 的常规类层次结构规则。

## 容器类

Phase 4 SPL 容器和 Phase 5 存储/装饰器迭代器是内置类。`SplDoublyLinkedList`、`SplStack`、`SplQueue` 和 `SplFixedArray` 使用专用的运行时存储；`ArrayIterator` 和 `ArrayObject` 在装箱的 `mixed` 单元上使用编译器管理的键/值存储；迭代器装饰器则转发给一个或多个 `Iterator` 对象：

| 类 | 父类 | 接口 |
|---|---|---|
| `SplDoublyLinkedList` | - | `Iterator`, `Countable`, `ArrayAccess` |
| `SplStack` | `SplDoublyLinkedList` | 继承自父类 |
| `SplQueue` | `SplDoublyLinkedList` | 继承自父类 |
| `SplFixedArray` | - | `IteratorAggregate`, `ArrayAccess`, `Countable`, `JsonSerializable` |
| `SplHeap` | - | `Iterator`, `Countable` |
| `SplMaxHeap` | `SplHeap` | 继承自父类 |
| `SplMinHeap` | `SplHeap` | 继承自父类 |
| `SplPriorityQueue` | - | `Iterator`, `Countable` |
| `SplObjectStorage` | - | `Iterator`, `Countable`, `ArrayAccess` |
| `SplFileInfo` | - | `Stringable` |
| `SplFileObject` | `SplFileInfo` | `RecursiveIterator`, `SeekableIterator` |
| `SplTempFileObject` | `SplFileObject` | 继承自父类 |
| `DirectoryIterator` | `SplFileInfo` | `Iterator`, `SeekableIterator` |
| `FilesystemIterator` | `DirectoryIterator` | 继承自父类 |
| `GlobIterator` | `FilesystemIterator` | `Countable` |
| `RecursiveDirectoryIterator` | `FilesystemIterator` | `RecursiveIterator` |
| `RecursiveCachingIterator` | `CachingIterator` | `RecursiveIterator` |
| `EmptyIterator` | - | `Iterator` |
| `InternalIterator` | - | `Iterator` |
| `ArrayIterator` | - | `Iterator`, `ArrayAccess`, `SeekableIterator`, `Countable` |
| `ArrayObject` | - | `IteratorAggregate`, `ArrayAccess`, `Countable` |
| `IteratorIterator` | - | `OuterIterator` |
| `LimitIterator` | `IteratorIterator` | 继承自父类 |
| `NoRewindIterator` | `IteratorIterator` | 继承自父类 |
| `InfiniteIterator` | `IteratorIterator` | 继承自父类 |
| `FilterIterator` | `IteratorIterator` | 继承自父类 |
| `CallbackFilterIterator` | `FilterIterator` | 继承自父类 |
| `RegexIterator` | `FilterIterator` | 继承自父类 |
| `CachingIterator` | `IteratorIterator` | `ArrayAccess`, `Countable`, `Stringable` |
| `RecursiveArrayIterator` | `ArrayIterator` | `RecursiveIterator` |
| `RecursiveFilterIterator` | `FilterIterator` | `RecursiveIterator` |
| `RecursiveCallbackFilterIterator` | `CallbackFilterIterator` | `RecursiveIterator` |
| `RecursiveRegexIterator` | `RegexIterator` | `RecursiveIterator` |
| `RecursiveIteratorIterator` | - | `OuterIterator` |
| `ParentIterator` | `RecursiveFilterIterator` | 继承自父类 |
| `AppendIterator` | `IteratorIterator` | 继承自父类 |
| `MultipleIterator` | - | `Iterator` |

容器插槽存储 `mixed`，因此标量值和对象值可以混合在同一个容器中。运行时所有权由 SPL 辅助函数处理，包括在释放拥有它的对象时进行清理。

### SplDoublyLinkedList

支持的方法：

| 方法 | 说明 |
|---|---|
| `push(mixed $value): void` | 追加到尾部 |
| `pop(): mixed` | 从尾部移除 |
| `unshift(mixed $value): void` | 插入到头部 |
| `shift(): mixed` | 从头部移除 |
| `add(int $index, mixed $value): void` | 在指定索引处插入 |
| `top(): mixed` | 读取尾部 |
| `bottom(): mixed` | 读取头部 |
| `count(): int` | 存储的值的数量 |
| `isEmpty(): bool` | 列表是否为空 |
| `setIteratorMode(int $mode): void` | 设置迭代器标志 |
| `getIteratorMode(): int` | 读取迭代器标志 |
| `rewind()`, `current()`, `key()`, `next()`, `prev()`, `valid()` | 迭代器操作 |
| `offsetExists()`, `offsetGet()`, `offsetSet()`, `offsetUnset()` | `ArrayAccess` 支持 |
| `serialize()`, `unserialize(string $data): void` | 传统 SPL 列表有效载荷的往返序列化 |
| `__serialize()`, `__unserialize(array $data): void` | PHP 7.4+ 数组状态往返序列化 |
| `__debugInfo(): array` | 包含标志和列表内容的调试状态 |

支持的常量：

| 常量 | 值 |
|---|---:|
| `IT_MODE_FIFO` | `0` |
| `IT_MODE_LIFO` | `2` |
| `IT_MODE_DELETE` | `1` |
| `IT_MODE_KEEP` | `0` |

```php
<?php
$list = new SplDoublyLinkedList();
$list->push("a");
$list->push(2);
$list[] = "c";

$list->setIteratorMode(SplDoublyLinkedList::IT_MODE_LIFO);

foreach ($list as $index => $value) {
    echo $index;
    echo ":";
    echo $value;
    echo "\n";
}
```

迭代期间会遵循 `IT_MODE_FIFO`、`IT_MODE_LIFO` 和 `IT_MODE_DELETE` 标志。

### SplStack

`SplStack` 继承了 `SplDoublyLinkedList` 并使用相同的运行时存储。它继承了列表的方法和常量，具有栈风格的 LIFO（后进先出）用法：

```php
<?php
$stack = new SplStack();
$stack->push("first");
$stack->push("second");

echo $stack->pop();   // second
echo $stack->top();   // first
```

### SplQueue

`SplQueue` 继承了 `SplDoublyLinkedList` 并添加了队列别名：

| 方法 | 底层行为 |
|---|---|
| `enqueue(mixed $value): void` | 与 `push()` 相同的存储路径 |
| `dequeue(): mixed` | 与 `shift()` 相同的存储路径 |

```php
<?php
$queue = new SplQueue();
$queue->enqueue("first");
$queue->enqueue("second");

echo $queue->dequeue(); // first
```

### SplFixedArray

支持的方法：

| 方法 | 说明 |
|---|---|
| `__construct(int $size = 0)` | 分配固定大小的存储空间 |
| `__wakeup(): void` | PHP 唤醒（wakeup）钩子 |
| `fromArray(array $array, bool $preserveKeys = true): SplFixedArray` | 从 PHP 数组数据构建固定数组 |
| `__serialize(): array` | 返回与 `toArray()` 相同的索引值 |
| `__unserialize(array $data): void` | 用打包的源值替换存储 |
| `count(): int` | 当前大小 |
| `getIterator(): Iterator` | 返回在活动固定数组存储上的 `InternalIterator` |
| `getSize(): int` | 当前大小 |
| `setSize(int $size): void` | 调整存储大小 |
| `offsetExists(mixed $index): bool` | 对于无效、未设置或 null 的插槽返回 false |
| `offsetGet(mixed $index): mixed` | 将未设置的插槽读取为 `null`；无效偏移量会抛出异常 |
| `offsetSet(mixed $index, mixed $value): void` | 写入有效的整数偏移量 |
| `offsetUnset(mixed $index): void` | 将有效插槽重置为 `null` |
| `toArray(): array` | 返回索引数组副本 |
| `jsonSerialize(): array` | 返回与 `toArray()` 相同的数组形状 |

```php
<?php
$fixed = new SplFixedArray(2);
$fixed[0] = "left";
$fixed[1] = "right";

echo $fixed->getSize();
echo $fixed[0];

$fixed->setSize(3);
$fixed[2] = "tail";
```

### 堆、优先级队列和对象存储

支持的堆方法：

| 类 | 方法 |
|---|---|
| `SplHeap` | abstract `compare(mixed $value1, mixed $value2): int`, `insert(mixed $value): bool`, `extract(): mixed`, `top(): mixed`, `count(): int`, `isEmpty(): bool`, `rewind()`, `current()`, `key()`, `next()`, `valid()`, `recoverFromCorruption(): bool`, `isCorrupted(): bool`, `__debugInfo(): array` |
| `SplMaxHeap` | 继承 `SplHeap`；优先比较较大的值 |
| `SplMinHeap` | 继承 `SplHeap`；优先比较较小的值 |
| `SplPriorityQueue` | `compare(mixed $priority1, mixed $priority2): int`, `insert(mixed $value, mixed $priority): bool`, `setExtractFlags(int $flags): void`, `getExtractFlags(): int`, `extract(): mixed`, `top(): mixed`, `count(): int`, `isEmpty(): bool`, `rewind()`, `current()`, `key()`, `next()`, `valid()`, `recoverFromCorruption(): bool`, `isCorrupted(): bool`, `__debugInfo(): array` |

`SplPriorityQueue` 支持以下提取常量：

| 常量 | 值 |
|---|---:|
| `EXTR_DATA` | `1` |
| `EXTR_PRIORITY` | `2` |
| `EXTR_BOTH` | `3` |

```php
<?php
$heap = new SplMaxHeap();
$heap->insert(3);
$heap->insert(1);
$heap->insert(5);

while (!$heap->isEmpty()) {
    echo $heap->extract();
}

$queue = new SplPriorityQueue();
$queue->insert("low", 1);
$queue->insert("high", 10);
$queue->setExtractFlags(SplPriorityQueue::EXTR_BOTH);

$item = $queue->extract();
echo $item["data"];
echo $item["priority"];
```

与 PHP SPL 一致，`SplHeap` 和 `SplPriorityQueue` 迭代器是破坏性的：`next()` 会移除当前顶部的值。用户自定义 of `SplHeap` 子类可以重写受保护的 `compare()` 方法来定义自己的排序方式。

支持的 `SplObjectStorage` 方法：

| 方法 | 说明 |
|---|---|
| `attach(mixed $object, mixed $info): void` | 关联或更新一个对象/信息对 |
| `detach(mixed $object): void` | 移除一个关联的对象 |
| `contains(mixed $object): bool` | 严格的标识查找 |
| `addAll(SplObjectStorage $storage): void` | 关联来自另一个存储的所有对象/信息对 |
| `removeAll(SplObjectStorage $storage): void` | 移除在另一个存储中找到的所有对象 |
| `removeAllExcept(SplObjectStorage $storage): void` | 仅保留在另一个存储中找到的对象 |
| `getInfo(): mixed`, `setInfo(mixed $info): void` | 在迭代器位置读取或写入信息 |
| `count(): int` | 关联对象的数量 |
| `rewind()`, `valid()`, `key()`, `current()`, `next()`, `seek(int $offset): void` | 迭代器操作 |
| `offsetExists()`, `offsetGet()`, `offsetSet()`, `offsetUnset()` | 在对象信息之上的 `ArrayAccess` 支持 |
| `getHash(mixed $object): string` | 为关联到此存储的对象生成稳定的十进制哈希 |
| `serialize()`, `unserialize(string $data): void`, `__serialize()`, `__unserialize(array $data): void`, `__debugInfo(): array` | 轻量级状态/调试钩子 |

```php
<?php
class Node {
    public int $id;

    public function __construct(int $id) {
        $this->id = $id;
    }
}

$left = new Node(1);
$right = new Node(2);

$storage = new SplObjectStorage();
$storage->attach($left, "left");
$storage[$right] = "right";

foreach ($storage as $index => $node) {
    echo $index;
    echo ":";
    echo $storage[$node];
}
```

`SplObjectStorage` 在每个实例 of 存储中存储对象句柄和信息有效载荷。释放存储对象会释放它所拥有的数组和句柄。

### 存储迭代器

支持的方法：

| 类 | 方法 |
|---|---|
| `EmptyIterator` | `current()`, `key()`, `next()`, `rewind()`, `valid()` |
| `ArrayIterator` | `__construct(array $array = [], int $flags = 0)`, `current()`, `key()`, `next()`, `rewind()`, `valid()`, `seek(int $offset): void`, `count(): int`, `offsetExists()`, `offsetGet()`, `offsetSet()`, `offsetUnset()`, `append()`, `getArrayCopy()` |
| `ArrayObject` | `__construct(array $array = [], int $flags = 0)`, `getIterator(): ArrayIterator`, `count(): int`, `offsetExists()`, `offsetGet()`, `offsetSet()`, `offsetUnset()`, `append()`, `getArrayCopy()` |
| `IteratorIterator` | `__construct(Traversable $iterator, ?string $class = null)`, `current()`, `key()`, `next()`, `rewind()`, `valid()`, `getInnerIterator(): ?Iterator` |
| `LimitIterator` | `__construct(Iterator $iterator, int $offset = 0, int $limit = -1)`, `rewind()`, `next()`, `valid()`, `seek(int $offset): void`, `getPosition(): int` 以及继承的转发方法 |
| `NoRewindIterator` | `__construct(Iterator $iterator)`，`rewind()` 空操作，以及继承的转发方法 |
| `InfiniteIterator` | `__construct(Iterator $iterator)`，当内部迭代器耗尽时 `next()` 循环到起点，以及继承的转发方法 |
| `FilterIterator` | `__construct(Iterator $iterator)`，抽象方法 `accept(): bool`，`rewind()`，`next()`，以及继承的转发方法 |
| `CallbackFilterIterator` | `__construct(Iterator $iterator, callable $callback)`，通过 `callback(current, key, inner)` 调用回调的 `accept(): bool` |
| `RegexIterator` | `__construct(Iterator $iterator, string $pattern, int $mode = RegexIterator::MATCH, int $flags = 0, int $pregFlags = 0)`, `accept()`, `current()`, `key()`, `getMode()`, `setMode()`, `getFlags()`, `setFlags()`, `getRegex()`, `getPregFlags()`, `setPregFlags()` |
| `CachingIterator` | `__construct(Iterator $iterator, int $flags = CachingIterator::CALL_TOSTRING)`, `rewind()`, `valid()`, `next()`, `current()`, `key()`, `hasNext()`, `__toString()`, `getFlags()`, `setFlags(int $flags): void`, `getCache()`, `count()`, `offsetExists()`, `offsetGet()`, `offsetSet()`, `offsetUnset()` |
| `SplFileInfo` | `__construct(string $filename)`、`__toString()`、`getPath()`、`getFilename()`、`getExtension()`、`getBasename(string $suffix = "")`、`getPathname()`、stat/谓词辅助函数、`getFileInfo()`、`getPathInfo()`、`openFile()`、`setFileClass()`、`setInfoClass()` |
| `SplFileObject` | `__construct(string $filename, string $mode = "r", bool $useIncludePath = false, mixed $context = null)`、行迭代器方法、`eof()`、`fgets()`、`fgetc()`、`fread()`、`fwrite()`、`fseek()`、`ftell()`、`fstat()`、CSV 控制辅助函数、`hasChildren()`、`getChildren()` |
| `SplTempFileObject` | `__construct(int $maxMemory = 2097152)` 以及继承的 `SplFileObject` 方法 |
| `DirectoryIterator` | `__construct(string $directory)`、`current()`、`key()`、`next()`、`rewind()`、`seek(int $offset): void`、`valid()`、`isDot()` 以及继承的 `SplFileInfo` 方法 |
| `FilesystemIterator` | `__construct(string $directory, int $flags = FilesystemIterator::SKIP_DOTS)`、`current()`、`key()`、`getFlags()`、`setFlags(int $flags): void` 以及继承的目录迭代 |
| `GlobIterator` | `__construct(string $pattern, int $flags = 0)`、`count()` 以及继承的文件系统迭代 |
| `RecursiveArrayIterator` | `__construct(array\|object $array = [], int $flags = 0)`、`hasChildren(): bool`、`getChildren(): ?RecursiveIterator` 以及继承的 `ArrayIterator` 方法 |
| `RecursiveFilterIterator` | `__construct(RecursiveIterator $iterator)`、`hasChildren(): bool`、`getChildren(): ?RecursiveIterator` 以及继承的 `FilterIterator` 方法 |
| `RecursiveCallbackFilterIterator` | `__construct(RecursiveIterator $iterator, callable $callback)`、`hasChildren(): bool`、`getChildren(): ?RecursiveIterator` 以及继承的回调过滤 |
| `RecursiveRegexIterator` | `__construct(RecursiveIterator $iterator, string $pattern, int $mode = RecursiveRegexIterator::MATCH, int $flags = 0, int $pregFlags = 0)`、`hasChildren(): bool`、`getChildren(): ?RecursiveIterator` 以及继承的正则过滤 |
| `RecursiveDirectoryIterator` | `__construct(string $directory, int $flags = 0)`、`hasChildren(): bool`、`getChildren(): ?RecursiveIterator` 以及继承的文件系统迭代 |
| `RecursiveCachingIterator` | `__construct(RecursiveIterator $iterator, int $flags = CachingIterator::CALL_TOSTRING)`、`hasChildren(): bool`、`getChildren(): ?RecursiveIterator` 以及继承的缓存方法 |
| `RecursiveIteratorIterator` | `__construct(RecursiveIterator $iterator, int $mode = RecursiveIteratorIterator::LEAVES_ONLY, int $flags = 0)`, `rewind()`, `valid()`, `current()`, `key()`, `next()`, `getDepth(): int`, `getInnerIterator(): ?Iterator`, `getSubIterator(int $level = -1): ?RecursiveIterator` |
| `ParentIterator` | `__construct(RecursiveIterator $iterator)`、`accept(): bool`、`getChildren(): ?RecursiveIterator` 以及继承的递归过滤 |
| `AppendIterator` | `__construct()`, `append(Iterator $iterator): void`, `rewind()`, `valid()`, `current()`, `key()`, `next()`, `getInnerIterator(): ?Iterator`, `getIteratorIndex(): int\|string\|null`, `getArrayIterator(): ArrayIterator` |
| `MultipleIterator` | `__construct(int $flags = MultipleIterator::MIT_NEED_ALL)`, `attachIterator(Iterator $iterator, string\|int\|null $info = null): void`, `detachIterator(Iterator $iterator): void`, `containsIterator(Iterator $iterator): bool`, `countIterators(): int`, `getFlags(): int`, `setFlags(int $flags): void`, `rewind()`, `valid()`, `key()`, `current()`, `next()` |

```php
<?php
$it = new ArrayIterator(["a" => 10, "b" => 20]);
$it["c"] = 30;

foreach ($it as $key => $value) {
    echo $key;
    echo "=";
    echo $value;
    echo "\n";
}

$obj = new ArrayObject(["left" => 1, "right" => 2]);
foreach ($obj as $key => $value) {
    echo $key;
    echo $value;
}

$wrapped = new IteratorIterator($obj, "ArrayObject");
foreach ($wrapped as $key => $value) {
    echo $key;
    echo $value;
}

$limited = new LimitIterator(
    new InfiniteIterator(new ArrayIterator([1, 2])),
    0,
    5
);
foreach ($limited as $value) {
    echo $value; // 12121
}

function keep_large(int $value, string $key, Iterator $inner): bool {
    return $value > 1;
}

$filter = new CallbackFilterIterator(
    new ArrayIterator(["a" => 1, "b" => 2]),
    keep_large(...)
);
foreach ($filter as $key => $value) {
    echo $key;
    echo $value;
}

$regex = new RegexIterator(
    new ArrayIterator(["first" => "item-10", "second" => "skip"]),
    "/([a-z]+)-([0-9]+)/",
    RegexIterator::GET_MATCH
);
foreach ($regex as $key => $matches) {
    echo $key;
    echo $matches[1];
    echo $matches[2];
}

$cache = new CachingIterator(
    new ArrayIterator(["a" => "A", "b" => "B"]),
    CachingIterator::FULL_CACHE | CachingIterator::TOSTRING_USE_KEY
);
foreach ($cache as $key => $value) {
    echo (string) $cache;
    echo $cache->hasNext() ? "more" : "last";
}
echo $cache["a"];

$append = new AppendIterator();
$append->append(new ArrayIterator(["a" => 1]));
$append->append(new ArrayIterator(["b" => 2]));
foreach ($append as $key => $value) {
    echo $key;
    echo $value;
}

$multi = new MultipleIterator(
    MultipleIterator::MIT_NEED_ANY | MultipleIterator::MIT_KEYS_ASSOC
);
$multi->attachIterator(new ArrayIterator(["a" => 1, "b" => 2]), "left");
$multi->attachIterator(new ArrayIterator(["x" => 10]), "right");
foreach ($multi as $keys => $values) {
    echo $keys["left"];
    echo is_null($values["right"]) ? "missing" : $values["right"];
}

$tree = new RecursiveIteratorIterator(
    new RecursiveArrayIterator(["a" => ["x" => 1], "b" => 2]),
    RecursiveIteratorIterator::SELF_FIRST
);
foreach ($tree as $key => $value) {
    echo $tree->getDepth();
    echo ":";
    echo $key;
    echo "=";
    echo gettype($value) === "array" ? "array" : $value;
}

$regexTree = new RecursiveIteratorIterator(
    new RecursiveRegexIterator(
        new RecursiveArrayIterator(["keep" => ["apple" => 1], "drop" => ["pear" => 2]]),
        "/keep|apple/",
        RecursiveRegexIterator::MATCH,
        RecursiveRegexIterator::USE_KEY
    ),
    RecursiveIteratorIterator::SELF_FIRST
);
foreach ($regexTree as $key => $value) {
    echo $key;
}

$info = new SplFileInfo("notes/todo.txt");
echo $info->getFilename();
echo $info->getExtension();

$file = $info->openFile();
foreach ($file as $line => $text) {
    echo $line;
    echo trim($text);
}

$paths = new FilesystemIterator(
    "notes",
    FilesystemIterator::KEY_AS_FILENAME |
    FilesystemIterator::CURRENT_AS_PATHNAME |
    FilesystemIterator::SKIP_DOTS
);
foreach ($paths as $name => $path) {
    echo $name;
    echo $path;
}
```

`IteratorIterator` 接受 PHP 可选的 `$class` 向下转换参数。直接的 `Iterator` 输入会评估该参数并忽略它。`IteratorAggregate` 输入在调用 `getIterator()` 之前，会验证该类字符串是否命名了该聚合类或其具体的可遍历（Traversable）基类之一。

`ArrayIterator` 和 `ArrayObject` 会为数组输入以及通过 `ArrayAccess` 写入的数据保留插入顺序的键。追加操作使用当前存储长度作为下一个整数键。`IteratorIterator` 接受任何 `Traversable`；当传入 `IteratorAggregate` 时，它会调用一次 `getIterator()` 并封装返回的迭代器。`LimitIterator`、`NoRewindIterator` 和 `InfiniteIterator` 遵循 PHP 的构造函数，并直接要求传入 `Iterator`。

`FilterIterator` 是抽象类，在执行 `rewind()` 和 `next()` 时，它会跳过内部迭代器中 `accept()` 返回 false 的位置。`CallbackFilterIterator` 存储一个可调用对象，并在调用时传入当前值、当前键和内部迭代器对象；闭包和第一类可调用对象（first-class-callable）的捕获环境会随迭代器对象一起保留。在运行时选择捕获的可调用描述符的分支结构表达式，会使用相同的描述符调用器路径，并将选定的接收者/捕获环境与迭代器保持一致。可调用数组变量和字面量（例如 `[$object, $method]` 和 `[$class, $method]`）也可以在构建时被解析，并作为持久的描述符回调环境进行存储。
`RegexIterator` 通过将存储的正则表达式应用于当前值来进行过滤，或者在设置了 `USE_KEY` 时应用于键。它支持 `MATCH`、`GET_MATCH`、`ALL_MATCHES`、`SPLIT` 和 `REPLACE` 模式，以及 `INVERT_MATCH`、可变 `replacement` 以及上面列出的访问器/修改器方法。正则表达式的执行使用与 [Regex](regex.md) 中记录的 `preg_*` 函数相同的 PCRE2 支持的运行时。`GET_MATCH` 支持 `PREG_OFFSET_CAPTURE`；`ALL_MATCHES` 支持 `PREG_SET_ORDER` 和 `PREG_OFFSET_CAPTURE`；`SPLIT` 支持 `PREG_SPLIT_NO_EMPTY`、`PREG_SPLIT_DELIM_CAPTURE` 和 `PREG_SPLIT_OFFSET_CAPTURE`。捕获的具体化会暴泄出完整的匹配以及所有编译好的编号捕获组；未匹配的内部捕获是空字符串，而尾部的未匹配组则被省略。`ALL_MATCHES` 会存储为某个元素收集的每个非重叠匹配。
`CachingIterator` 通过 `hasNext()` 实现单元素前瞻，支持字符串模式标志 `CALL_TOSTRING`、`TOSTRING_USE_KEY`、`TOSTRING_USE_CURRENT` 和 `TOSTRING_USE_INNER`，并且为 `getCache()`、`count()` 和 `ArrayAccess` 支持 `FULL_CACHE`。
`SplFileInfo` 将路径组件、stat 数据、权限和类型谓词委托给 [System and IO](system-and-io.md) 中记录的文件系统内置函数。当所选类按要求继承自 `SplFileInfo` 或 `SplFileObject` 时，`getFileInfo()`、`getPathInfo()` 和 `openFile()` 会遵循显式的类字符串参数以及 `setInfoClass()` / `setFileClass()` 的重写。
`SplFileObject` 使用 `file()` 将文件内容快照到行存储中以进行迭代，对 `fread()`、`fwrite()`、`fseek()`、`ftell()` 和 `ftruncate()` 等字节位置方法使用活动流，在流写入后重新加载行存储，支持基本的 CSV 分割，并公开了 `SplFileObject::DROP_NEW_LINE`、`READ_AHEAD`、`SKIP_EMPTY` 和 `READ_CSV`。
`SplTempFileObject` 公开了与 PHP 兼容的逻辑流名称：负的 `maxMemory` 值会报告为 `php://memory`，而非负值则报告为 `php://temp/maxmemory:N`。内容会一直保留在内存中，直到超过配置的 `maxMemory` 阈值；在此之后，该对象会溢出写入内部的临时文件，同时保留当前的流位置。
`DirectoryIterator` 对 `scandir()` 结果进行快照。`FilesystemIterator` 在该快照之上应用 `SKIP_DOTS`、键模式和当前模式标志，而 `GlobIterator` 对 `glob()` 匹配进行快照并实现了 `Countable`。

`AppendIterator` 会跳过已耗尽的追加迭代器，并通过 `getIteratorIndex()` 公开当前的存储键。它的 `getArrayIterator()` 结果是一个活动的 `ArrayIterator` 视图：通过该视图进行的追加、带键的 `offsetSet()` 和 `offsetUnset()` 操作都会更新所有者。`MultipleIterator` 支持 PHP 的 `MIT_NEED_ANY`、`MIT_NEED_ALL`、`MIT_KEYS_NUMERIC` 和 `MIT_KEYS_ASSOC` 标志。重新关联相同的迭代器会更新其信息，而不是对其进行复制。与 PHP 一致，当关联键（associative-key）模式处于活动状态时，如果关联一个带有 `null` 信息的迭代器，当 `key()` 或 `current()` 实例化复合数组时会引发 `InvalidArgumentException`。

`RecursiveArrayIterator` 通过 `hasChildren()` 检测嵌套数组和嵌套的 `RecursiveIterator` 对象。`RecursiveIteratorIterator` 支持 `LEAVES_ONLY`、`SELF_FIRST` 和 `CHILD_FIRST`；它保留了一个活动源子迭代器栈，因此 `getDepth()`、`getInnerIterator()` 和 `getSubIterator()` 能够追踪活动的游标。`RecursiveCallbackFilterIterator` 在封装子迭代器时，会保留闭包和第一类可调用对象（first-class-callable）的捕获环境，包括分支选择的描述符环境以及运行时选择的可调用数组变量或字面量。`RecursiveRegexIterator` 使用相同的模式、模式标志、preg 标志和替换值来封装子迭代器。`RecursiveDirectoryIterator` 使用相同的文件系统标志来封装目录子项。`RecursiveCachingIterator` 会检查缓存的当前值是否为数组或 `RecursiveIterator` 子项，并在另一个缓存迭代器中封装子项。`ParentIterator` 递归地仅保留具有子项的条目。

## 自动加载和内省

SPL 自动加载和类内省辅助函数已在 [Namespaces](namespaces.md) 中记录。这包括 `spl_autoload_register()`、`spl_autoload_unregister()`、`spl_autoload_functions()`、`spl_autoload_extensions()`、`spl_autoload_call()`、`spl_classes()`、`spl_object_id()`、`spl_object_hash()`、`class_implements()`、`class_parents()` 和 `class_uses()`。

## 迭代器辅助函数

迭代器辅助函数涵盖了 PHP SPL 的遍历辅助函数：

| 函数 | 签名 | 说明 |
|---|---|---|
| `iterator_to_array()` | `iterator_to_array(Traversable\|array $iterator, bool $preserve_keys = true): array` | 重置对象迭代器，收集 `current()` 的值，并可选地保留 `key()` 的结果 |
| `iterator_count()` | `iterator_count(Traversable\|array $iterator): int` | 重置并推进对象迭代器，直到 `valid()` 为 false |
| `iterator_apply()` | `iterator_apply(Traversable $iterator, callable $callback, ?array $args = null): int` | 在每个有效位置上调用一次回调，当回调返回 false 时停止，并返回调用次数 |

```php
<?php
class Range implements Iterator {
    private int $i = 0;

    public function rewind(): void { $this->i = 0; }
    public function valid(): bool { return $this->i < 3; }
    public function current(): int { return $this->i + 10; }
    public function key(): string { return "k" . $this->i; }
    public function next(): void { $this->i = $this->i + 1; }
}

$items = iterator_to_array(new Range());
echo iterator_count(new Range());

function tick(string $label): bool {
    echo $label;
    return true;
}

echo iterator_apply(new Range(), "tick", ["!"]);
```

AOT 约束：`iterator_to_array()` 接受字面量或动态标量 `preserve_keys` 值，并在运行时应用 PHP 的真假值判定。`iterator_apply()` 接受静态已知的 Traversable 对象以及运行时分发的 `Traversable` 或 `iterable` 值；如果 `iterable` 值在运行时是数组，则程序会中止，因为 PHP 的 `iterator_apply()` 签名要求必须是 `Traversable`。当回调具有静态已知的签名（包括用户空间的可变参数回调）时，`iterator_apply()` 的第三个参数可以被省略，或者为 `null`、字面量数组、动态索引数组值或动态关联数组。如果调用点没有单一的静态回调签名，elephc 可以通过将运行时可调用对象指针与该代码生成上下文中可用的用户函数以及闭包/FCC 包装器进行匹配，然后应用匹配目标的参数 and 返回元数据，来分发动态索引或关联参数。运行时字符串回调名称通过不区分大小写的名称匹配，在用户函数和支持的内置包装器上进行分发，然后使用相同的元数据路径。在运行时选择捕获的闭包或第一类可调用对象（first-class-callable）描述符的分支结构回调，会通过描述符的统一调用器进行调用，因此接收者/捕获环境以及关联回调参数得以保留。在循环之前，运行时选择的可调用数组变量（例如 `[$object, $method]` 和 `[$class, $method]`）会与公共方法描述符进行匹配，并在每次回调调用中重用。对于可变参数回调，被固定参数消耗的命名键不会被复制到 `...$rest` 中；其余的字符串键保留其名称，其余的数字键则从零开始重新索引。带有表达式的字面量数组在迭代开始前会计算一次。传递给引用参数回调参数的动态数组会使用临时引用单元，因此回调的写入操作不会修改源参数数组。
