| [`tmpfile()`](./builtins/filesystem/tmpfile.md) | `(): mixed` | `mixed` |
| [`touch()`](./builtins/filesystem/touch.md) | `(string $filename, int $mtime, int $atime): bool` | `bool` |
| [`umask()`](./builtins/filesystem/umask.md) | `(int $mask): int` | `int` |
| [`unlink()`](./builtins/filesystem/unlink.md) | `(string $filename): bool` | `bool` |
| [`closedir()`](./builtins/io/closedir.md) | `(resource $dir_handle): void` | `void` |
| [`fclose()`](./builtins/io/fclose.md) | `(resource $stream): bool` | `bool` |
| [`fdatasync()`](./builtins/io/fdatasync.md) | `(resource $stream): bool` | `bool` |
| [`feof()`](./builtins/io/feof.md) | `(resource $stream): bool` | `bool` |
| [`fflush()`](./builtins/io/fflush.md) | `(resource $stream): bool` | `bool` |
| [`fgetc()`](./builtins/io/fgetc.md) | `(resource $stream): mixed` | `mixed` |
| [`fgetcsv()`](./builtins/io/fgetcsv.md) | `(resource $stream, int $length, string $separator, string $enclosure, string $escape): array` | `array` |
| [`fgets()`](./builtins/io/fgets.md) | `(resource $stream, int $length): mixed` | `mixed` |
| [`file()`](./builtins/io/file.md) | `(string $filename, int $flags, mixed $context): array` | `array` |
| [`file_get_contents()`](./builtins/io/file_get_contents.md) | `(string $filename, bool $use_include_path, mixed $context, int $offset, int $length): mixed` | `mixed` |
| [`file_put_contents()`](./builtins/io/file_put_contents.md) | `(string $filename, mixed $data, int $flags = 0, mixed $context = null): int` | `int` |
| [`flock()`](./builtins/io/flock.md) | `(resource $stream, int $operation, bool $would_block): bool` | `bool` |
| [`fopen()`](./builtins/io/fopen.md) | `(string $filename, string $mode, bool $use_include_path, mixed $context): mixed` | `mixed` |
| [`fpassthru()`](./builtins/io/fpassthru.md) | `(resource $stream): int` | `int` |
| [`fprintf()`](./builtins/io/fprintf.md) | `(resource $stream, string $format, ...$values): int` | `int` |
| [`fputcsv()`](./builtins/io/fputcsv.md) | `(resource $stream, array $fields, string $separator = ',', string $enclosure = '"', string $escape = '\\', string $eol = '\n'): int` | `int` |
| [`fread()`](./builtins/io/fread.md) | `(resource $stream, int $length): string` | `string` |
| [`fscanf()`](./builtins/io/fscanf.md) | `(resource $stream, string $format, ...$vars): array` | `array` |
| [`fseek()`](./builtins/io/fseek.md) | `(resource $stream, int $offset, int $whence): int` | `int` |
| [`fstat()`](./builtins/io/fstat.md) | `(resource $stream): mixed` | `mixed` |
| [`fsync()`](./builtins/io/fsync.md) | `(resource $stream): bool` | `bool` |
| [`ftell()`](./builtins/io/ftell.md) | `(resource $stream): int` | `int` |
| [`ftruncate()`](./builtins/io/ftruncate.md) | `(resource $stream, int $size): bool` | `bool` |
| [`fwrite()`](./builtins/io/fwrite.md) | `(resource $stream, string $data, int $length): int` | `int` |
| [`gethostbyaddr()`](./builtins/io/gethostbyaddr.md) | `(string $ip): mixed` | `mixed` |
| [`gethostbyname()`](./builtins/io/gethostbyname.md) | `(string $hostname): string` | `string` |
| [`gethostname()`](./builtins/io/gethostname.md) | `(): string` | `string` |
| [`getprotobyname()`](./builtins/io/getprotobyname.md) | `(string $protocol): mixed` | `mixed` |
| [`getprotobynumber()`](./builtins/io/getprotobynumber.md) | `(int $protocol): mixed` | `mixed` |
| [`getservbyname()`](./builtins/io/getservbyname.md) | `(string $service, string $protocol): mixed` | `mixed` |
| [`getservbyport()`](./builtins/io/getservbyport.md) | `(int $port, string $protocol): mixed` | `mixed` |
| [`hash_file()`](./builtins/io/hash_file.md) | `(string $algo, string $filename, bool $binary = false, array $options = []): mixed` | `mixed` |
| [`opendir()`](./builtins/io/opendir.md) | `(string $directory): mixed` | `mixed` |
| [`readdir()`](./builtins/io/readdir.md) | `(resource $dir_handle): mixed` | `mixed` |
| [`rewind()`](./builtins/io/rewind.md) | `(resource $stream): bool` | `bool` |
| [`rewinddir()`](./builtins/io/rewinddir.md) | `(resource $dir_handle): void` | `void` |
| [`stream_bucket_make_writeable()`](./builtins/io/stream_bucket_make_writeable.md) | `(mixed $brigade): mixed` | `mixed` |
| [`stream_bucket_new()`](./builtins/io/stream_bucket_new.md) | `(resource $stream, string $buffer): mixed` | `mixed` |
| [`stream_context_create()`](./builtins/io/stream_context_create.md) | `(array $options, array $params): mixed` | `mixed` |
| [`stream_context_get_default()`](./builtins/io/stream_context_get_default.md) | `(array $options): mixed` | `mixed` |
| [`stream_context_get_options()`](./builtins/io/stream_context_get_options.md) | `(resource $stream_or_context): array` | `array` |
| [`stream_context_get_params()`](./builtins/io/stream_context_get_params.md) | `(resource $context): array` | `array` |
| [`stream_context_set_default()`](./builtins/io/stream_context_set_default.md) | `(array $options): mixed` | `mixed` |
| [`stream_context_set_option()`](./builtins/io/stream_context_set_option.md) | `(resource $context, string $wrapper_or_options, string $option_name, mixed $value): bool` | `bool` |
| [`stream_context_set_params()`](./builtins/io/stream_context_set_params.md) | `(resource $context, array $params): bool` | `bool` |
| [`stream_copy_to_stream()`](./builtins/io/stream_copy_to_stream.md) | `(resource $from, resource $to, int $length, int $offset): mixed` | `mixed` |
| [`stream_filter_register()`](./builtins/io/stream_filter_register.md) | `(string $filter_name, string $class): bool` | `bool` |
| [`stream_filter_remove()`](./builtins/io/stream_filter_remove.md) | `(resource $stream_filter): bool` | `bool` |
| [`stream_get_contents()`](./builtins/io/stream_get_contents.md) | `(resource $stream, int $length, int $offset): mixed` | `mixed` |
| [`stream_get_filters()`](./builtins/io/stream_get_filters.md) | `(): array` | `array` |
| [`stream_get_line()`](./builtins/io/stream_get_line.md) | `(resource $stream, int $length, string $ending): string` | `string` |
| [`stream_get_meta_data()`](./builtins/io/stream_get_meta_data.md) | `(resource $stream): array` | `array` |
| [`stream_get_transports()`](./builtins/io/stream_get_transports.md) | `(): array` | `array` |
| [`stream_get_wrappers()`](./builtins/io/stream_get_wrappers.md) | `(): array` | `array` |
| [`stream_is_local()`](./builtins/io/stream_is_local.md) | `(resource $stream): bool` | `bool` |
| [`stream_isatty()`](./builtins/io/stream_isatty.md) | `(resource $stream): bool` | `bool` |
| [`stream_resolve_include_path()`](./builtins/io/stream_resolve_include_path.md) | `(string $filename): mixed` | `mixed` |
| [`stream_select()`](./builtins/io/stream_select.md) | `(array $read, array $write, array $except, int $seconds, int $microseconds): int` | `int` |
| [`stream_set_blocking()`](./builtins/io/stream_set_blocking.md) | `(resource $stream, bool $enable): bool` | `bool` |
| [`stream_set_chunk_size()`](./builtins/io/stream_set_chunk_size.md) | `(resource $stream, int $size): int` | `int` |
| [`stream_set_read_buffer()`](./builtins/io/stream_set_read_buffer.md) | `(resource $stream, int $size): int` | `int` |
| [`stream_set_timeout()`](./builtins/io/stream_set_timeout.md) | `(resource $stream, int $seconds, int $microseconds): bool` | `bool` |
| [`stream_set_write_buffer()`](./builtins/io/stream_set_write_buffer.md) | `(resource $stream, int $size): int` | `int` |
| [`stream_socket_accept()`](./builtins/io/stream_socket_accept.md) | `(resource $socket, float $timeout, string $peer_name): mixed` | `mixed` |
| [`stream_socket_client()`](./builtins/io/stream_socket_client.md) | `(string $address, int $error_code, int $error_message, string $timeout, float $flags): mixed` | `mixed` |
| [`stream_socket_enable_crypto()`](./builtins/io/stream_socket_enable_crypto.md) | `(resource $stream, bool $enable, int $crypto_method, resource $session_stream): bool` | `bool` |
| [`stream_socket_get_name()`](./builtins/io/stream_socket_get_name.md) | `(resource $socket, bool $remote): mixed` | `mixed` |
| [`stream_socket_pair()`](./builtins/io/stream_socket_pair.md) | `(int $domain, int $type, int $protocol): mixed` | `mixed` |
| [`stream_socket_recvfrom()`](./builtins/io/stream_socket_recvfrom.md) | `(resource $socket, int $length, int $flags, string $address): mixed` | `mixed` |
| [`stream_socket_sendto()`](./builtins/io/stream_socket_sendto.md) | `(resource $socket, string $data, int $flags, string $address): mixed` | `mixed` |
| [`stream_socket_server()`](./builtins/io/stream_socket_server.md) | `(string $address, int $error_code, int $error_message): mixed` | `mixed` |
| [`stream_socket_shutdown()`](./builtins/io/stream_socket_shutdown.md) | `(resource $stream, int $mode): bool` | `bool` |
| [`stream_supports_lock()`](./builtins/io/stream_supports_lock.md) | `(resource $stream): bool` | `bool` |
| [`stream_wrapper_register()`](./builtins/io/stream_wrapper_register.md) | `(string $protocol, string $class, int $flags): bool` | `bool` |
| [`stream_wrapper_restore()`](./builtins/io/stream_wrapper_restore.md) | `(string $protocol): bool` | `bool` |
| [`stream_wrapper_unregister()`](./builtins/io/stream_wrapper_unregister.md) | `(string $protocol): bool` | `bool` |
| [`vfprintf()`](./builtins/io/vfprintf.md) | `(resource $stream, string $format, array $values): int` | `int` |
| [`json_decode()`](./builtins/json/json_decode.md) | `(string $json, bool $associative, int $depth, int $flags): mixed` | `mixed` |
| [`json_encode()`](./builtins/json/json_encode.md) | `(mixed $value, int $flags, int $depth): string` | `string` |
| [`json_last_error()`](./builtins/json/json_last_error.md) | `(): int` | `int` |
| [`json_last_error_msg()`](./builtins/json/json_last_error_msg.md) | `(): string` | `string` |
| [`json_validate()`](./builtins/json/json_validate.md) | `(string $json, int $depth, int $flags): bool` | `bool` |
| [`abs()`](./builtins/math/abs.md) | `(int $num): mixed` | `mixed` |
| [`acos()`](./builtins/math/acos.md) | `(float $num): float` | `float` |
| [`asin()`](./builtins/math/asin.md) | `(float $num): float` | `float` |
| [`atan()`](./builtins/math/atan.md) | `(float $num): float` | `float` |
| [`atan2()`](./builtins/math/atan2.md) | `(float $y, float $x): float` | `float` |
| [`ceil()`](./builtins/math/ceil.md) | `(float $num): float` | `float` |
| [`clamp()`](./builtins/math/clamp.md) | `(int $value, int $min, int $max): string` | `string` |
| [`cos()`](./builtins/math/cos.md) | `(float $num): float` | `float` |
| [`cosh()`](./builtins/math/cosh.md) | `(float $num): float` | `float` |
| [`deg2rad()`](./builtins/math/deg2rad.md) | `(float $num): float` | `float` |
| [`exp()`](./builtins/math/exp.md) | `(float $num): float` | `float` |
| [`fdiv()`](./builtins/math/fdiv.md) | `(float $num1, float $num2): float` | `float` |
| [`floor()`](./builtins/math/floor.md) | `(float $num): float` | `float` |
| [`fmod()`](./builtins/math/fmod.md) | `(float $num1, float $num2): float` | `float` |
| [`hypot()`](./builtins/math/hypot.md) | `(float $x, float $y): float` | `float` |
| [`intdiv()`](./builtins/math/intdiv.md) | `(int $num1, int $num2): int` | `int` |
| [`is_finite()`](./builtins/math/is_finite.md) | `(float $num): bool` | `bool` |
| [`is_infinite()`](./builtins/math/is_infinite.md) | `(float $num): bool` | `bool` |
| [`is_nan()`](./builtins/math/is_nan.md) | `(float $num): bool` | `bool` |
| [`log()`](./builtins/math/log.md) | `(float $num, float $base): float` | `float` |
| [`log10()`](./builtins/math/log10.md) | `(float $num): float` | `float` |
| [`log2()`](./builtins/math/log2.md) | `(float $num): float` | `float` |
| [`max()`](./builtins/math/max.md) | `(mixed $value, ...$values): float` | `float` |
| [`min()`](./builtins/math/min.md) | `(mixed $value, ...$values): float` | `float` |
| [`mt_rand()`](./builtins/math/mt_rand.md) | `(int $min, int $max): int` | `int` |
| [`pi()`](./builtins/math/pi.md) | `(): float` | `float` |
| [`pow()`](./builtins/math/pow.md) | `(float $num, float $exponent): float` | `float` |
| [`rad2deg()`](./builtins/math/rad2deg.md) | `(float $num): float` | `float` |
| [`rand()`](./builtins/math/rand.md) | `(int $min, int $max): int` | `int` |
| [`random_int()`](./builtins/math/random_int.md) | `(int $min, int $max): int` | `int` |
| [`round()`](./builtins/math/round.md) | `(float $num, int $precision): float` | `float` |
| [`sin()`](./builtins/math/sin.md) | `(float $num): float` | `float` |
| [`sinh()`](./builtins/math/sinh.md) | `(float $num): float` | `float` |
| [`sqrt()`](./builtins/math/sqrt.md) | `(float $num): float` | `float` |
| [`tan()`](./builtins/math/tan.md) | `(float $num): float` | `float` |
| [`tanh()`](./builtins/math/tanh.md) | `(float $num): float` | `float` |
| [`buffer_new()`](./builtins/misc/buffer_new.md) | `(int $length): mixed` | `mixed` |
| [`call_user_func()`](./builtins/misc/call_user_func.md) | `(callable $callback, ...$args): mixed` | `mixed` |
| [`call_user_func_array()`](./builtins/misc/call_user_func_array.md) | `(callable $callback, array $args): mixed` | `mixed` |
| [`define()`](./builtins/misc/define.md) | `(string $constant_name, mixed $value, bool $case_insensitive): bool` | `bool` |
| [`defined()`](./builtins/misc/defined.md) | `(string $constant_name): bool` | `bool` |
| [`empty()`](./builtins/misc/empty.md) | `(mixed $value): bool` | `bool` |
| [`header()`](./builtins/misc/header.md) | `(mixed $header, mixed $replace, mixed $response_code): void` | `void` |
| [`http_response_code()`](./builtins/misc/http_response_code.md) | `(mixed $response_code): int` | `int` |
| [`isset()`](./builtins/misc/isset.md) | `(mixed $var, ...$vars): bool` | `bool` |
| [`php_uname()`](./builtins/misc/php_uname.md) | `(string $mode): string` | `string` |
| [`phpversion()`](./builtins/misc/phpversion.md) | `(string $extension = null): string` | `string` |
| [`print_r()`](./builtins/misc/print_r.md) | `(...$values): void` | `void` |
| [`serialize()`](./builtins/misc/serialize.md) | `(mixed $value): string` | `string` |
| [`unserialize()`](./builtins/misc/unserialize.md) | `(mixed $data, mixed $options): mixed` | `mixed` |
| [`unset()`](./builtins/misc/unset.md) | `(mixed $var, ...$vars): void` | `void` |
| [`var_dump()`](./builtins/misc/var_dump.md) | `(...$values): void` | `void` |
| [`ptr()`](./builtins/pointer/ptr.md) | `(mixed $value): mixed` | `mixed` |
| [`ptr_get()`](./builtins/pointer/ptr_get.md) | `(pointer $pointer): int` | `int` |
| [`ptr_is_null()`](./builtins/pointer/ptr_is_null.md) | `(pointer $pointer): bool` | `bool` |
| [`ptr_null()`](./builtins/pointer/ptr_null.md) | `(): mixed` | `mixed` |
| [`ptr_offset()`](./builtins/pointer/ptr_offset.md) | `(pointer $pointer, int $offset): mixed` | `mixed` |
