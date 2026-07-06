## Builtins

| Function | Signature | Returns |
|---|---|---|
| [`array_all()`](./builtins/array/array_all.md) | `(array $array, mixed $callback): mixed` | `mixed` |
| [`array_any()`](./builtins/array/array_any.md) | `(array $array, mixed $callback): mixed` | `mixed` |
| [`array_chunk()`](./builtins/array/array_chunk.md) | `(array $array, int $length, bool $preserve_keys): array` | `array` |
| [`array_column()`](./builtins/array/array_column.md) | `(array $array, string $column_key, string $index_key): array` | `array` |
| [`array_combine()`](./builtins/array/array_combine.md) | `(array $keys, array $values): array` | `array` |
| [`array_diff()`](./builtins/array/array_diff.md) | `(array $array, ...$arrays): array` | `array` |
| [`array_diff_assoc()`](./builtins/array/array_diff_assoc.md) | `(array $array, ...$arrays): mixed` | `mixed` |
| [`array_diff_key()`](./builtins/array/array_diff_key.md) | `(array $array, ...$arrays): array` | `array` |
| [`array_fill()`](./builtins/array/array_fill.md) | `(int $start_index, int $count, mixed $value): array` | `array` |
| [`array_fill_keys()`](./builtins/array/array_fill_keys.md) | `(array $keys, mixed $value): array` | `array` |
| [`array_filter()`](./builtins/array/array_filter.md) | `(array $array, callable $callback, int $mode): array` | `array` |
| [`array_find()`](./builtins/array/array_find.md) | `(array $array, mixed $callback): mixed` | `mixed` |
| [`array_flip()`](./builtins/array/array_flip.md) | `(array $array): float` | `float` |
| [`array_intersect()`](./builtins/array/array_intersect.md) | `(array $array, ...$arrays): array` | `array` |
| [`array_intersect_assoc()`](./builtins/array/array_intersect_assoc.md) | `(array $array, ...$arrays): mixed` | `mixed` |
| [`array_intersect_key()`](./builtins/array/array_intersect_key.md) | `(array $array, ...$arrays): array` | `array` |
| [`array_is_list()`](./builtins/array/array_is_list.md) | `(mixed $array): bool` | `bool` |
| [`array_key_exists()`](./builtins/array/array_key_exists.md) | `(string $key, array $array): bool` | `bool` |
| [`array_key_first()`](./builtins/array/array_key_first.md) | `(array $array): mixed` | `mixed` |
| [`array_key_last()`](./builtins/array/array_key_last.md) | `(array $array): mixed` | `mixed` |
| [`array_keys()`](./builtins/array/array_keys.md) | `(array $array, string $filter_value, bool $strict): array` | `array` |
| [`array_map()`](./builtins/array/array_map.md) | `(callable $callback, array $array, ...$arrays): array` | `array` |
| [`array_merge()`](./builtins/array/array_merge.md) | `(...$arrays): array` | `array` |
| [`array_merge_recursive()`](./builtins/array/array_merge_recursive.md) | `(...$arrays): mixed` | `mixed` |
| [`array_multisort()`](./builtins/array/array_multisort.md) | `(array $array1, int $array2): bool` | `bool` |
| [`array_pad()`](./builtins/array/array_pad.md) | `(array $array, int $length, mixed $value): array` | `array` |
| [`array_pop()`](./builtins/array/array_pop.md) | `(array $array): mixed` | `mixed` |
| [`array_product()`](./builtins/array/array_product.md) | `(array $array): float` | `float` |
| [`array_push()`](./builtins/array/array_push.md) | `(array $array, ...$values): void` | `void` |
| [`array_rand()`](./builtins/array/array_rand.md) | `(array $array, int $num): int` | `int` |
| [`array_reduce()`](./builtins/array/array_reduce.md) | `(array $array, callable $callback, mixed $initial): int` | `int` |
| [`array_replace()`](./builtins/array/array_replace.md) | `(array $array, array $replacements): mixed` | `mixed` |
| [`array_replace_recursive()`](./builtins/array/array_replace_recursive.md) | `(array $array, array $replacements): mixed` | `mixed` |
| [`array_reverse()`](./builtins/array/array_reverse.md) | `(array $array, bool $preserve_keys): array` | `array` |
| [`array_search()`](./builtins/array/array_search.md) | `(mixed $needle, array $haystack, bool $strict): mixed` | `mixed` |
| [`array_shift()`](./builtins/array/array_shift.md) | `(array $array): mixed` | `mixed` |
| [`array_slice()`](./builtins/array/array_slice.md) | `(array $array, int $offset, int $length, bool $preserve_keys): array` | `array` |
| [`array_splice()`](./builtins/array/array_splice.md) | `(array $array, int $offset, int $length, array $replacement): array` | `array` |
| [`array_sum()`](./builtins/array/array_sum.md) | `(array $array): float` | `float` |
| [`array_udiff()`](./builtins/array/array_udiff.md) | `(array $array1, array $array2, callable $callback): mixed` | `mixed` |
| [`array_uintersect()`](./builtins/array/array_uintersect.md) | `(array $array1, array $array2, callable $callback): mixed` | `mixed` |
| [`array_unique()`](./builtins/array/array_unique.md) | `(array $array, int $flags): array` | `array` |
| [`array_unshift()`](./builtins/array/array_unshift.md) | `(array $array, ...$values): int` | `int` |
| [`array_values()`](./builtins/array/array_values.md) | `(array $array): array` | `array` |
| [`array_walk()`](./builtins/array/array_walk.md) | `(array $array, callable $callback, mixed $arg): void` | `void` |
| [`array_walk_recursive()`](./builtins/array/array_walk_recursive.md) | `(array $array, callable $callback, mixed $value): void` | `void` |
| [`arsort()`](./builtins/array/arsort.md) | `(array $array, int $flags): bool` | `bool` |
| [`asort()`](./builtins/array/asort.md) | `(array $array, int $flags): bool` | `bool` |
| [`count()`](./builtins/array/count.md) | `(array $value, int $mode): int` | `int` |
| [`in_array()`](./builtins/array/in_array.md) | `(mixed $needle, array $haystack, bool $strict): mixed` | `mixed` |
| [`krsort()`](./builtins/array/krsort.md) | `(array $array, int $flags): bool` | `bool` |
| [`ksort()`](./builtins/array/ksort.md) | `(array $array, int $flags): bool` | `bool` |
| [`natcasesort()`](./builtins/array/natcasesort.md) | `(array $array): bool` | `bool` |
| [`natsort()`](./builtins/array/natsort.md) | `(array $array): bool` | `bool` |
| [`range()`](./builtins/array/range.md) | `(mixed $start, mixed $end, int $step): array` | `array` |
| [`rsort()`](./builtins/array/rsort.md) | `(array $array, int $flags): bool` | `bool` |
| [`shuffle()`](./builtins/array/shuffle.md) | `(array $array): bool` | `bool` |
| [`sort()`](./builtins/array/sort.md) | `(array $array, int $flags): bool` | `bool` |
| [`uasort()`](./builtins/array/uasort.md) | `(array $array, callable $callback): bool` | `bool` |
| [`uksort()`](./builtins/array/uksort.md) | `(array $array, callable $callback): bool` | `bool` |
| [`usort()`](./builtins/array/usort.md) | `(array $array, callable $callback): bool` | `bool` |
| [`buffer_free()`](./builtins/buffer/buffer_free.md) | `(buffer $buffer): mixed` | `mixed` |
| [`buffer_len()`](./builtins/buffer/buffer_len.md) | `(buffer $buffer): int` | `int` |
| [`class_alias()`](./builtins/class/class_alias.md) | `(string $class, string $alias, bool $autoload): bool` | `bool` |
| [`class_attribute_args()`](./builtins/class/class_attribute_args.md) | `(string $class_name, string $attribute_name): array` | `array` |
| [`class_attribute_names()`](./builtins/class/class_attribute_names.md) | `(string $class_name): array` | `array` |
| [`class_exists()`](./builtins/class/class_exists.md) | `(string $class, bool $autoload): bool` | `bool` |
| [`class_get_attributes()`](./builtins/class/class_get_attributes.md) | `(string $class_name): mixed` | `mixed` |
| [`class_implements()`](./builtins/class/class_implements.md) | `(mixed $object_or_class, bool $autoload): mixed` | `mixed` |
| [`class_parents()`](./builtins/class/class_parents.md) | `(mixed $object_or_class, bool $autoload): mixed` | `mixed` |
| [`class_uses()`](./builtins/class/class_uses.md) | `(mixed $object_or_class, bool $autoload): mixed` | `mixed` |
| [`enum_exists()`](./builtins/class/enum_exists.md) | `(string $enum, bool $autoload): bool` | `bool` |
| [`function_exists()`](./builtins/class/function_exists.md) | `(string $function): bool` | `bool` |
| [`get_class()`](./builtins/class/get_class.md) | `(object $object): string` | `string` |
| [`get_declared_classes()`](./builtins/class/get_declared_classes.md) | `(): array` | `array` |
| [`get_declared_interfaces()`](./builtins/class/get_declared_interfaces.md) | `(): array` | `array` |
| [`get_declared_traits()`](./builtins/class/get_declared_traits.md) | `(): array` | `array` |
| [`get_parent_class()`](./builtins/class/get_parent_class.md) | `(mixed $object_or_class): string` | `string` |
| [`interface_exists()`](./builtins/class/interface_exists.md) | `(string $interface, bool $autoload): bool` | `bool` |
| [`is_a()`](./builtins/class/is_a.md) | `(object $object_or_class, string $class, bool $allow_string): bool` | `bool` |
| [`is_subclass_of()`](./builtins/class/is_subclass_of.md) | `(mixed $object_or_class, string $class, bool $allow_string): bool` | `bool` |
| [`trait_exists()`](./builtins/class/trait_exists.md) | `(string $trait, bool $autoload): bool` | `bool` |
| [`checkdate()`](./builtins/date/checkdate.md) | `(int $month, int $day, int $year): bool` | `bool` |
| [`date()`](./builtins/date/date.md) | `(string $format, int $timestamp): string` | `string` |
| [`date_default_timezone_get()`](./builtins/date/date_default_timezone_get.md) | `(): string` | `string` |
| [`date_default_timezone_set()`](./builtins/date/date_default_timezone_set.md) | `(string $timezoneId): bool` | `bool` |
| [`getdate()`](./builtins/date/getdate.md) | `(int $timestamp): array` | `array` |
| [`gmdate()`](./builtins/date/gmdate.md) | `(string $format, int $timestamp): string` | `string` |
| [`gmmktime()`](./builtins/date/gmmktime.md) | `(int $hour, int $minute, int $second, int $month, int $day, int $year): int` | `int` |
| [`hrtime()`](./builtins/date/hrtime.md) | `(bool $as_number): mixed` | `mixed` |
| [`localtime()`](./builtins/date/localtime.md) | `(int $timestamp, bool $associative): array` | `array` |
| [`microtime()`](./builtins/date/microtime.md) | `(bool $as_float): int` | `int` |
| [`mktime()`](./builtins/date/mktime.md) | `(int $hour, int $minute, int $second, int $month, int $day, int $year): int` | `int` |
| [`strtotime()`](./builtins/date/strtotime.md) | `(string $datetime, int $baseTimestamp): mixed` | `mixed` |
| [`time()`](./builtins/date/time.md) | `(): int` | `int` |
| [`basename()`](./builtins/filesystem/basename.md) | `(string $path, string $suffix): string` | `string` |
| [`chdir()`](./builtins/filesystem/chdir.md) | `(string $directory): bool` | `bool` |
| [`chgrp()`](./builtins/filesystem/chgrp.md) | `(string $filename, int $group): bool` | `bool` |
| [`chmod()`](./builtins/filesystem/chmod.md) | `(string $filename, int $permissions): bool` | `bool` |
| [`chown()`](./builtins/filesystem/chown.md) | `(string $filename, int $user): bool` | `bool` |
| [`clearstatcache()`](./builtins/filesystem/clearstatcache.md) | `(bool $clear_realpath_cache, string $filename): void` | `void` |
| [`copy()`](./builtins/filesystem/copy.md) | `(string $from, string $to, mixed $context): bool` | `bool` |
| [`dirname()`](./builtins/filesystem/dirname.md) | `(string $path, int $levels): string` | `string` |
| [`disk_free_space()`](./builtins/filesystem/disk_free_space.md) | `(string $directory): float` | `float` |
| [`disk_total_space()`](./builtins/filesystem/disk_total_space.md) | `(string $directory): float` | `float` |
| [`file_exists()`](./builtins/filesystem/file_exists.md) | `(string $filename): bool` | `bool` |
| [`fileatime()`](./builtins/filesystem/fileatime.md) | `(string $filename): mixed` | `mixed` |
| [`filectime()`](./builtins/filesystem/filectime.md) | `(string $filename): mixed` | `mixed` |
| [`filegroup()`](./builtins/filesystem/filegroup.md) | `(string $filename): mixed` | `mixed` |
| [`fileinode()`](./builtins/filesystem/fileinode.md) | `(string $filename): mixed` | `mixed` |
| [`filemtime()`](./builtins/filesystem/filemtime.md) | `(string $filename): int` | `int` |
| [`fileowner()`](./builtins/filesystem/fileowner.md) | `(string $filename): mixed` | `mixed` |
| [`fileperms()`](./builtins/filesystem/fileperms.md) | `(string $filename): mixed` | `mixed` |
| [`filesize()`](./builtins/filesystem/filesize.md) | `(string $filename): int` | `int` |
| [`filetype()`](./builtins/filesystem/filetype.md) | `(string $filename): mixed` | `mixed` |
| [`fnmatch()`](./builtins/filesystem/fnmatch.md) | `(string $pattern, string $filename, int $flags): bool` | `bool` |
| [`getcwd()`](./builtins/filesystem/getcwd.md) | `(): string` | `string` |
| [`getenv()`](./builtins/filesystem/getenv.md) | `(string $name, bool $local_only): mixed` | `mixed` |
| [`glob()`](./builtins/filesystem/glob.md) | `(string $pattern, int $flags): array` | `array` |
| [`is_dir()`](./builtins/filesystem/is_dir.md) | `(string $filename): bool` | `bool` |
| [`is_executable()`](./builtins/filesystem/is_executable.md) | `(string $filename): bool` | `bool` |
| [`is_file()`](./builtins/filesystem/is_file.md) | `(string $filename): bool` | `bool` |
| [`is_link()`](./builtins/filesystem/is_link.md) | `(string $filename): bool` | `bool` |
| [`is_readable()`](./builtins/filesystem/is_readable.md) | `(string $filename): bool` | `bool` |
| [`is_writable()`](./builtins/filesystem/is_writable.md) | `(string $filename): bool` | `bool` |
| [`is_writeable()`](./builtins/filesystem/is_writeable.md) | `(string $filename): bool` | `bool` |
| [`lchgrp()`](./builtins/filesystem/lchgrp.md) | `(string $filename, int $group): bool` | `bool` |
| [`lchown()`](./builtins/filesystem/lchown.md) | `(string $filename, int $user): bool` | `bool` |
| [`link()`](./builtins/filesystem/link.md) | `(string $target, string $link): bool` | `bool` |
| [`linkinfo()`](./builtins/filesystem/linkinfo.md) | `(string $path): int` | `int` |
| [`lstat()`](./builtins/filesystem/lstat.md) | `(string $filename): mixed` | `mixed` |
| [`mkdir()`](./builtins/filesystem/mkdir.md) | `(string $directory, int $permissions, bool $recursive, bool $context): bool` | `bool` |
| [`pathinfo()`](./builtins/filesystem/pathinfo.md) | `(string $path, int $flags): mixed` | `mixed` |
| [`putenv()`](./builtins/filesystem/putenv.md) | `(string $assignment): bool` | `bool` |
| [`readfile()`](./builtins/filesystem/readfile.md) | `(string $filename, bool $use_include_path, mixed $context): mixed` | `mixed` |
| [`readlink()`](./builtins/filesystem/readlink.md) | `(string $path): mixed` | `mixed` |
| [`realpath()`](./builtins/filesystem/realpath.md) | `(string $path): mixed` | `mixed` |
| [`realpath_cache_get()`](./builtins/filesystem/realpath_cache_get.md) | `(): array` | `array` |
| [`realpath_cache_size()`](./builtins/filesystem/realpath_cache_size.md) | `(): int` | `int` |
| [`rename()`](./builtins/filesystem/rename.md) | `(string $from, string $to, mixed $context): bool` | `bool` |
| [`rmdir()`](./builtins/filesystem/rmdir.md) | `(string $directory, mixed $context = null): bool` | `bool` |
| [`scandir()`](./builtins/filesystem/scandir.md) | `(string $directory, int $sorting_order, mixed $context): array` | `array` |
| [`stat()`](./builtins/filesystem/stat.md) | `(string $filename): mixed` | `mixed` |
| [`symlink()`](./builtins/filesystem/symlink.md) | `(string $target, string $link): bool` | `bool` |
| [`sys_get_temp_dir()`](./builtins/filesystem/sys_get_temp_dir.md) | `(): string` | `string` |
| [`tempnam()`](./builtins/filesystem/tempnam.md) | `(string $directory, string $prefix): string` | `string` |