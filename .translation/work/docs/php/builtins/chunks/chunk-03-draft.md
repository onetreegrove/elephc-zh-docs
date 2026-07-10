| [`ptr_read16()`](./builtins/pointer/ptr_read16.md) | `(pointer $pointer): int` | `int` |
| [`ptr_read32()`](./builtins/pointer/ptr_read32.md) | `(pointer $pointer): int` | `int` |
| [`ptr_read8()`](./builtins/pointer/ptr_read8.md) | `(pointer $pointer): int` | `int` |
| [`ptr_read_string()`](./builtins/pointer/ptr_read_string.md) | `(pointer $pointer, int $length): string` | `string` |
| [`ptr_set()`](./builtins/pointer/ptr_set.md) | `(pointer $pointer, mixed $value): void` | `void` |
| [`ptr_sizeof()`](./builtins/pointer/ptr_sizeof.md) | `(string $type): mixed` | `mixed` |
| [`ptr_write16()`](./builtins/pointer/ptr_write16.md) | `(pointer $pointer, int $value): void` | `void` |
| [`ptr_write32()`](./builtins/pointer/ptr_write32.md) | `(pointer $pointer, int $value): void` | `void` |
| [`ptr_write8()`](./builtins/pointer/ptr_write8.md) | `(pointer $pointer, int $value): void` | `void` |
| [`ptr_write_string()`](./builtins/pointer/ptr_write_string.md) | `(pointer $pointer, string $string): int` | `int` |
| [`die()`](./builtins/process/die.md) | `(int $status): void` | `void` |
| [`exec()`](./builtins/process/exec.md) | `(string $command, array $output, int $result_code): string` | `string` |
| [`exit()`](./builtins/process/exit.md) | `(int $status): void` | `void` |
| [`passthru()`](./builtins/process/passthru.md) | `(string $command, int $result_code): void` | `void` |
| [`pclose()`](./builtins/process/pclose.md) | `(resource $handle): int` | `int` |
| [`popen()`](./builtins/process/popen.md) | `(string $command, string $mode): mixed` | `mixed` |
| [`readline()`](./builtins/process/readline.md) | `(string $prompt): mixed` | `mixed` |
| [`shell_exec()`](./builtins/process/shell_exec.md) | `(string $command): string` | `string` |
| [`sleep()`](./builtins/process/sleep.md) | `(int $seconds): int` | `int` |
| [`system()`](./builtins/process/system.md) | `(string $command, int $result_code): string` | `string` |
| [`usleep()`](./builtins/process/usleep.md) | `(int $microseconds): void` | `void` |
| [`preg_match()`](./builtins/regex/preg_match.md) | `(string $pattern, string $subject, array $matches): int` | `int` |
| [`preg_match_all()`](./builtins/regex/preg_match_all.md) | `(string $pattern, string $subject, array $matches): int` | `int` |
| [`preg_replace()`](./builtins/regex/preg_replace.md) | `(string $pattern, string $replacement, string $subject, int $limit = -1, int $count = null): string` | `string` |
| [`preg_replace_callback()`](./builtins/regex/preg_replace_callback.md) | `(string $pattern, callable $callback, string $subject, int $limit = -1, int $count = null, int $flags = 0): array` | `array` |
| [`preg_split()`](./builtins/regex/preg_split.md) | `(string $pattern, string $subject, int $limit, int $flags): array` | `array` |
| [`iterator_apply()`](./builtins/spl/iterator_apply.md) | `(traversable $iterator, callable $callback, array $args): int` | `int` |
| [`iterator_count()`](./builtins/spl/iterator_count.md) | `(traversable $iterator): int` | `int` |
| [`iterator_to_array()`](./builtins/spl/iterator_to_array.md) | `(traversable $iterator, bool $preserve_keys): array` | `array` |
| [`spl_autoload()`](./builtins/spl/spl_autoload.md) | `(string $class, string $file_extensions): void` | `void` |
| [`spl_autoload_call()`](./builtins/spl/spl_autoload_call.md) | `(string $class): void` | `void` |
| [`spl_autoload_extensions()`](./builtins/spl/spl_autoload_extensions.md) | `(string $file_extensions): string` | `string` |
| [`spl_autoload_functions()`](./builtins/spl/spl_autoload_functions.md) | `(): array` | `array` |
| [`spl_autoload_register()`](./builtins/spl/spl_autoload_register.md) | `(callable $callback, bool $throw, bool $prepend): bool` | `bool` |
| [`spl_autoload_unregister()`](./builtins/spl/spl_autoload_unregister.md) | `(callable $callback): bool` | `bool` |
| [`spl_classes()`](./builtins/spl/spl_classes.md) | `(): array` | `array` |
| [`spl_object_hash()`](./builtins/spl/spl_object_hash.md) | `(object $object): string` | `string` |
| [`spl_object_id()`](./builtins/spl/spl_object_id.md) | `(object $object): int` | `int` |
| [`fsockopen()`](./builtins/streams/fsockopen.md) | `(string $hostname, int $port, int $error_code, string $error_message, float $timeout): mixed` | `mixed` |
| [`pfsockopen()`](./builtins/streams/pfsockopen.md) | `(string $hostname, int $port, int $error_code, string $error_message, float $timeout): mixed` | `mixed` |
| [`stream_bucket_append()`](./builtins/streams/stream_bucket_append.md) | `(mixed $brigade, mixed $bucket): void` | `void` |
| [`stream_bucket_prepend()`](./builtins/streams/stream_bucket_prepend.md) | `(mixed $brigade, mixed $bucket): void` | `void` |
| [`stream_filter_append()`](./builtins/streams/stream_filter_append.md) | `(resource $stream, string $filter_name, int $mode, mixed $params): mixed` | `mixed` |
| [`stream_filter_prepend()`](./builtins/streams/stream_filter_prepend.md) | `(resource $stream, string $filter_name, int $mode, mixed $params): mixed` | `mixed` |
| [`addslashes()`](./builtins/string/addslashes.md) | `(string $string): string` | `string` |
| [`base64_decode()`](./builtins/string/base64_decode.md) | `(string $string, bool $strict): string` | `string` |
| [`base64_encode()`](./builtins/string/base64_encode.md) | `(string $string): string` | `string` |
| [`bin2hex()`](./builtins/string/bin2hex.md) | `(string $string): string` | `string` |
| [`chop()`](./builtins/string/chop.md) | `(string $string, string $characters): string` | `string` |
| [`chr()`](./builtins/string/chr.md) | `(int $codepoint): string` | `string` |
| [`crc32()`](./builtins/string/crc32.md) | `(string $string): int` | `int` |
| [`explode()`](./builtins/string/explode.md) | `(string $separator, string $string, int $limit): array` | `array` |
| [`grapheme_strrev()`](./builtins/string/grapheme_strrev.md) | `(string $string): mixed` | `mixed` |
| [`gzcompress()`](./builtins/string/gzcompress.md) | `(string $data, int $level, int $encoding): string` | `string` |
| [`gzdeflate()`](./builtins/string/gzdeflate.md) | `(string $data, int $level, int $encoding): string` | `string` |
| [`gzinflate()`](./builtins/string/gzinflate.md) | `(string $data, int $max_length): string` | `string` |
| [`gzuncompress()`](./builtins/string/gzuncompress.md) | `(string $data, int $max_length): string` | `string` |
| [`hash()`](./builtins/string/hash.md) | `(string $algo, string $data, bool $binary = false, array $options = []): string` | `string` |
| [`hash_algos()`](./builtins/string/hash_algos.md) | `(): array` | `array` |
| [`hash_copy()`](./builtins/string/hash_copy.md) | `(resource $context): mixed` | `mixed` |
| [`hash_equals()`](./builtins/string/hash_equals.md) | `(string $known_string, string $user_string): bool` | `bool` |
| [`hash_final()`](./builtins/string/hash_final.md) | `(resource $context, bool $binary): string` | `string` |
| [`hash_hmac()`](./builtins/string/hash_hmac.md) | `(string $algo, string $data, string $key, bool $binary): string` | `string` |
| [`hash_init()`](./builtins/string/hash_init.md) | `(string $algo, int $flags = 0, string $key = '', array $options = []): mixed` | `mixed` |
| [`hash_update()`](./builtins/string/hash_update.md) | `(resource $context, string $data): bool` | `bool` |
| [`hex2bin()`](./builtins/string/hex2bin.md) | `(string $string): string` | `string` |
| [`html_entity_decode()`](./builtins/string/html_entity_decode.md) | `(string $string, int $flags, string $encoding): string` | `string` |
| [`htmlentities()`](./builtins/string/htmlentities.md) | `(string $string, int $flags, string $encoding, bool $double_encode): string` | `string` |
| [`htmlspecialchars()`](./builtins/string/htmlspecialchars.md) | `(string $string, int $flags, string $encoding, bool $double_encode): string` | `string` |
| [`implode()`](./builtins/string/implode.md) | `(string $separator, array $array): string` | `string` |
| [`inet_ntop()`](./builtins/string/inet_ntop.md) | `(string $ip): mixed` | `mixed` |
| [`inet_pton()`](./builtins/string/inet_pton.md) | `(string $ip): mixed` | `mixed` |
| [`ip2long()`](./builtins/string/ip2long.md) | `(string $ip): mixed` | `mixed` |
| [`lcfirst()`](./builtins/string/lcfirst.md) | `(string $string): string` | `string` |
| [`long2ip()`](./builtins/string/long2ip.md) | `(int $ip): string` | `string` |
| [`ltrim()`](./builtins/string/ltrim.md) | `(string $string, string $characters): string` | `string` |
| [`md5()`](./builtins/string/md5.md) | `(string $string, bool $binary): string` | `string` |
| [`nl2br()`](./builtins/string/nl2br.md) | `(string $string, bool $use_xhtml): string` | `string` |
| [`number_format()`](./builtins/string/number_format.md) | `(float $num, int $decimals, string $decimal_separator, string $thousands_separator): string` | `string` |
| [`ord()`](./builtins/string/ord.md) | `(string $character): int` | `int` |
| [`printf()`](./builtins/string/printf.md) | `(string $format, ...$values): int` | `int` |
| [`rawurldecode()`](./builtins/string/rawurldecode.md) | `(string $string): string` | `string` |
| [`rawurlencode()`](./builtins/string/rawurlencode.md) | `(string $string): string` | `string` |
| [`rtrim()`](./builtins/string/rtrim.md) | `(string $string, string $characters): string` | `string` |
| [`sha1()`](./builtins/string/sha1.md) | `(string $string, bool $binary): string` | `string` |
| [`sprintf()`](./builtins/string/sprintf.md) | `(string $format, ...$values): string` | `string` |
| [`sscanf()`](./builtins/string/sscanf.md) | `(string $string, string $format, ...$vars): array` | `array` |
| [`str_contains()`](./builtins/string/str_contains.md) | `(string $haystack, string $needle): bool` | `bool` |
| [`str_ends_with()`](./builtins/string/str_ends_with.md) | `(string $haystack, string $needle): bool` | `bool` |
| [`str_ireplace()`](./builtins/string/str_ireplace.md) | `(mixed $search, mixed $replace, mixed $subject, int $count): mixed` | `mixed` |
| [`str_pad()`](./builtins/string/str_pad.md) | `(string $string, int $length, string $pad_string, int $pad_type): string` | `string` |
| [`str_repeat()`](./builtins/string/str_repeat.md) | `(string $string, int $times): string` | `string` |
| [`str_replace()`](./builtins/string/str_replace.md) | `(string $search, string $replace, string $subject, int $count): mixed` | `mixed` |
| [`str_split()`](./builtins/string/str_split.md) | `(string $string, int $length): array` | `array` |
| [`str_starts_with()`](./builtins/string/str_starts_with.md) | `(string $haystack, string $needle): bool` | `bool` |
| [`strcasecmp()`](./builtins/string/strcasecmp.md) | `(string $string1, string $string2): int` | `int` |
| [`strcmp()`](./builtins/string/strcmp.md) | `(string $string1, string $string2): int` | `int` |
| [`stripslashes()`](./builtins/string/stripslashes.md) | `(string $string): string` | `string` |
| [`strlen()`](./builtins/string/strlen.md) | `(string $string): int` | `int` |
| [`strpos()`](./builtins/string/strpos.md) | `(string $haystack, string $needle, int $offset): mixed` | `mixed` |
| [`strrev()`](./builtins/string/strrev.md) | `(string $string): string` | `string` |
| [`strrpos()`](./builtins/string/strrpos.md) | `(string $haystack, string $needle, int $offset): mixed` | `mixed` |
| [`strstr()`](./builtins/string/strstr.md) | `(string $haystack, string $needle, bool $before_needle): string` | `string` |
| [`strtolower()`](./builtins/string/strtolower.md) | `(string $string): string` | `string` |
| [`strtoupper()`](./builtins/string/strtoupper.md) | `(string $string): string` | `string` |
| [`substr()`](./builtins/string/substr.md) | `(string $string, int $offset, int $length): string` | `string` |
| [`substr_replace()`](./builtins/string/substr_replace.md) | `(string $string, string $replace, int $offset, int $length): string` | `string` |
| [`trim()`](./builtins/string/trim.md) | `(string $string, string $characters): string` | `string` |
| [`ucfirst()`](./builtins/string/ucfirst.md) | `(string $string): string` | `string` |
| [`ucwords()`](./builtins/string/ucwords.md) | `(string $string, string $separators): string` | `string` |
| [`urldecode()`](./builtins/string/urldecode.md) | `(string $string): string` | `string` |
| [`urlencode()`](./builtins/string/urlencode.md) | `(string $string): string` | `string` |
| [`vprintf()`](./builtins/string/vprintf.md) | `(string $format, array $values): int` | `int` |
| [`vsprintf()`](./builtins/string/vsprintf.md) | `(string $format, array $values): string` | `string` |
| [`wordwrap()`](./builtins/string/wordwrap.md) | `(string $string, int $width, string $break, bool $cut_long_words): string` | `string` |
| [`boolval()`](./builtins/type/boolval.md) | `(mixed $value): bool` | `bool` |
| [`ctype_alnum()`](./builtins/type/ctype_alnum.md) | `(string $text): bool` | `bool` |
| [`ctype_alpha()`](./builtins/type/ctype_alpha.md) | `(string $text): bool` | `bool` |
| [`ctype_digit()`](./builtins/type/ctype_digit.md) | `(string $text): bool` | `bool` |
| [`ctype_space()`](./builtins/type/ctype_space.md) | `(string $text): bool` | `bool` |
| [`floatval()`](./builtins/type/floatval.md) | `(mixed $value): float` | `float` |
| [`get_resource_id()`](./builtins/type/get_resource_id.md) | `(resource $resource): int` | `int` |
| [`get_resource_type()`](./builtins/type/get_resource_type.md) | `(resource $resource): string` | `string` |
| [`gettype()`](./builtins/type/gettype.md) | `(mixed $value): string` | `string` |
| [`intval()`](./builtins/type/intval.md) | `(mixed $value, int $base): int` | `int` |
| [`is_array()`](./builtins/type/is_array.md) | `(mixed $value): bool` | `bool` |
| [`is_bool()`](./builtins/type/is_bool.md) | `(mixed $value): bool` | `bool` |
| [`is_callable()`](./builtins/type/is_callable.md) | `(mixed $value, bool $syntax_only = false, string $callable_name = null): bool` | `bool` |
| [`is_float()`](./builtins/type/is_float.md) | `(mixed $value): bool` | `bool` |
| [`is_int()`](./builtins/type/is_int.md) | `(mixed $value): bool` | `bool` |
| [`is_iterable()`](./builtins/type/is_iterable.md) | `(mixed $value): bool` | `bool` |
| [`is_null()`](./builtins/type/is_null.md) | `(mixed $value): bool` | `bool` |
| [`is_numeric()`](./builtins/type/is_numeric.md) | `(mixed $value): bool` | `bool` |
| [`is_object()`](./builtins/type/is_object.md) | `(mixed $value): bool` | `bool` |
| [`is_resource()`](./builtins/type/is_resource.md) | `(mixed $value): bool` | `bool` |
| [`is_scalar()`](./builtins/type/is_scalar.md) | `(mixed $value): bool` | `bool` |
| [`is_string()`](./builtins/type/is_string.md) | `(mixed $value): bool` | `bool` |
| [`settype()`](./builtins/type/settype.md) | `(mixed $var, string $type): bool` | `bool` |
