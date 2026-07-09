---
title: "图像"
description: "GD 图像创建和 I/O，以及始终可用的图像信息函数，由纯 Rust 编解码器桥接层支持。"
sidebar:
  order: 18
---

elephc 在**纯 Rust** 图像桥接层之上实现了 PHP 的图像表面（GD、Exif/IPTC 以及 Imagick/Gmagick/Cairo OOP 扩展）。它不依赖于系统的 GD、libpng、libjpeg 或 ImageMagick：编解码器会被编译到程序中，因此二进制文件保持独立，并在 macOS arm64、Linux arm64 和 Linux x86_64 上表现完全一致。

只有当程序引用了图像符号时，才会链接图像库，因此不使用图像的程序不会受到影响。

> GD、Exif/IPTC、Imagick、Gmagick 和 Cairo 表面均已实现。
> 文档中记录的差距（没有纯 Rust 路径的操作）已在文中单独标出。

## 图像信息（始终可用）

这些函数在 PHP 中不需要任何扩展，并且始终可用。

### `getimagesize`

```php
getimagesize(string $filename): array|false
```

在不完全解码的情况下返回图像文件的信息，如果文件无法读取或不是可识别的图像，则返回 `false`。返回的数组包含：

- `0` —— 以像素为单位的宽度
- `1` —— 以像素为单位的高度
- `2` —— `IMAGETYPE_*` 常量之一
- `3` —— 一个 `width="…" height="…"` HTML 属性字符串
- `"bits"` —— 位深度
- `"channels"` —— 通道数
- `"mime"` —— MIME 类型

```php
$info = getimagesize("photo.png");
if ($info !== false) {
    echo $info[0] . "x" . $info[1] . " " . $info["mime"];   // 800x600 image/png
}
```

由于返回的数组是异构的，在传递给类型化参数之前需要进行类型转换：`image_type_to_extension((int) $info[2])`。

### `getimagesizefromstring`

```php
getimagesizefromstring(string $data): array|false
```

类似于 `getimagesize`，但图像字节是通过 PHP 字符串传入，而不是通过文件路径传入 —— 这些字节会被暂存到桥接层缓冲区中，并在不完全解码的情况下进行探测。返回与 `getimagesize` 相同的数组结构，如果字符串为空或字节无法识别则返回 `false`。PHP 接受的可选 `&$image_info` APP-markers 参数在此被省略（如需获取标签请使用 `exif_read_data()`）。

```php
$data = file_get_contents("photo.png");
$info = getimagesizefromstring($data);
if ($info !== false) {
    echo $info[0] . "x" . $info[1] . " " . $info["mime"];   // 800x600 image/png
}
```

### `image_type_to_mime_type`

```php
image_type_to_mime_type(int $image_type): string
```

将 `IMAGETYPE_*` 常量映射到其对应的 MIME 类型，例如 `image_type_to_mime_type(IMAGETYPE_PNG)` 返回 `"image/png"`。

### `image_type_to_extension`

```php
image_type_to_extension(int $image_type, bool $include_dot = true): string|false
```

返回图像类型的扩展名，默认带前导点：
`image_type_to_extension(IMAGETYPE_JPEG)` 返回 `".jpeg"`，而
`image_type_to_extension(IMAGETYPE_JPEG, false)` 返回 `"jpeg"`。

> 不兼容性：对于未知的图像类型，PHP 会返回 `false`。目前 elephc 返回 `""`（空字符串）代替，此项有待后续支持标量或 `false` 的联合返回类型。

## GD：创建和写入图像

### 创建图像

```php
imagecreatetruecolor(int $width, int $height): GdImage
imagecreate(int $width, int $height): GdImage
```

`imagecreatetruecolor` 返回一个由不透明原生句柄支持的 `GdImage` 对象。当 `GdImage` 超出作用域时图像会自动被释放，也可以使用 `imagedestroy()` 显式释放。

### 颜色和像素

```php
imagecolorallocate(GdImage $image, int $red, int $green, int $blue): int
imagecolorallocatealpha(GdImage $image, int $red, int $green, int $blue, int $alpha): int
imagesetpixel(GdImage $image, int $x, int $y, int $color): bool
imagecolorat(GdImage $image, int $x, int $y): int
imagecolorsforindex(GdImage $image, int $color): array
```

颜色是 GD 打包整数；`$alpha` 遵循 GD 的 7 位约定（`0` = 不透明，`127` = 透明）。`imagecolorat` 返回像素的打包颜色，`imagecolorsforindex` 将其解包为 `["red", "green", "blue", "alpha"]`。

面向调色板的查找函数的行为与其真彩色等价函数相同（由于所有图像均为 RGBA 格式，因此无需搜索索引调色板），它们都返回一个打包颜色：

```php
imagecolorexact / imagecolorclosest / imagecolorclosesthwb / imagecolorresolve
    (GdImage $image, int $red, int $green, int $blue): int
imagecolorexactalpha / imagecolorclosestalpha / imagecolorresolvealpha
    (GdImage $image, int $red, int $green, int $blue, int $alpha): int
imagecolordeallocate(GdImage $image, int $color): bool   // 对真彩色无操作 (no-op)
imagecolorstotal(GdImage $image): int                    // 真彩色返回 0
imagecolortransparent(GdImage $image, ?int $color = null): int
imagecolorset(GdImage $image, int $color, int $red, int $green, int $blue, int $alpha = 0): bool
imagepalettecopy(GdImage $dst, GdImage $src): bool
```

`imagecolorset` 和 `imagepalettecopy` 会被接受并作为无操作成功执行：elephc 将每个图像存储为真彩色 RGBA，没有索引调色板，因此没有需要重新着色或复制的调色板插槽。如果代码依赖于 `imagecolorset` 执行后调色板颜色确实发生改变，则应将此视为已记录的局限性。

### Alpha 混合和保存

```php
imagealphablending(GdImage $image, bool $enable): bool
imagesavealpha(GdImage $image, bool $enable): bool
imagelayereffect(GdImage $image, int $effect): bool
imagepalettetotruecolor(GdImage $image): bool
imagetruecolortopalette(GdImage $image, bool $dither, int $num_colors): bool
```

当混合开启（真彩色的默认设置）时，`imagesetpixel` 会将新颜色合成到现有像素之上；当混合关闭时，该像素会被覆写并保留其 alpha 值。`imagesavealpha(true)` 在编码时保留 alpha 通道（默认情况下会扁平化为不透明）。`imagelayereffect` 映射到混合模型（`IMG_EFFECT_REPLACE` 禁用混合，其他值则启用混合）。`imagepalettetotruecolor`/`imagetruecolortopalette` 会切换真彩色标志；因为每个图像都存储为 RGBA，所以 `imagetruecolortopalette` 实际上并不会进行重新量化。

### 绘制图元

```php
imagesetthickness(GdImage $image, int $thickness): bool
imageline(GdImage $image, int $x1, int $y1, int $x2, int $y2, int $color): bool
imagedashedline(GdImage $image, int $x1, int $y1, int $x2, int $y2, int $color): bool
imagerectangle(GdImage $image, int $x1, int $y1, int $x2, int $y2, int $color): bool
imagefilledrectangle(GdImage $image, int $x1, int $y1, int $x2, int $y2, int $color): bool
imageellipse(GdImage $image, int $cx, int $cy, int $width, int $height, int $color): bool
imagefilledellipse(GdImage $image, int $cx, int $cy, int $width, int $height, int $color): bool
imagearc(GdImage $image, int $cx, int $cy, int $w, int $h, int $start, int $end, int $color): bool
imagefilledarc(GdImage $image, int $cx, int $cy, int $w, int $h, int $start, int $end, int $color, int $style): bool
imagepolygon(GdImage $image, array $points, int $color): bool
imageopenpolygon(GdImage $image, array $points, int $color): bool
imagefilledpolygon(GdImage $image, array $points, int $color): bool
imagefill(GdImage $image, int $x, int $y, int $color): bool
imagefilltoborder(GdImage $image, int $x, int $y, int $border_color, int $color): bool
```

轮廓线遵循当前的 `imagesetthickness` 设置以及 alpha 混合模式；`imagefill`/`imagefilltoborder` 会像 GD 那样直接设置颜色（无混合）。多边形参数 `$points` 是一个扁平数组 `[x0, y0, x1, y1, …]`。弧度角使用 GD 的约定（3 点钟方向为 0°，顺时针增加）；`imagefilledarc` 填充一个扇形区，而 `IMG_ARC_NOFILL` 会绘制轮廓以代替填充（其中 `IMG_ARC_EDGED` 半径边缘会由该轮廓线逼近）。样式化/笔刷/平铺绘制模式（`imagesetbrush`/`imagesetstyle`/`imagesettile`）、裁剪以及抗锯齿尚未实现。

### 文本（内置字体）

```php
imagestring(GdImage $image, int $font, int $x, int $y, string $string, int $color): bool
imagestringup(GdImage $image, int $font, int $x, int $y, string $string, int $color): bool
imagechar(GdImage $image, int $font, int $x, int $y, string $char, int $color): bool
imagecharup(GdImage $image, int $font, int $x, int $y, string $char, int $color): bool
imagefontwidth(int $font): int
imagefontheight(int $font): int
```

内置文本使用公有领域的 `font8x8` 字符集。每个字体编号 (1–5) 都以相同的统一 **8×8** 单元格进行渲染，因此 `imagefontwidth`/`imagefontheight` 会返回 `8`，且字体编号不会改变其大小（原生 GD 的每字体 5–9×8–15 像素单元格未在此处复现）。`imagestringup` 会将文本逆时针旋转 90°；`imagechar`/`imagecharup` 会绘制字符串的第一个字符。

> 尚未实现：TrueType/FreeType 文本（`imagettftext`、`imagettfbbox`、`imagefttext`、`imageftbbox`）以及 `.gdf` 字体加载器（`imageloadfont`）。

### 尺寸与清理

```php
imagesx(GdImage $image): int
imagesy(GdImage $image): int
imagedestroy(GdImage $image): bool
```

### 图像信息

```php
imageistruecolor(GdImage $image): bool
imageresolution(GdImage $image, ?int $resolution_x = null, ?int $resolution_y = null): array|bool
imagetypes(): int
gd_info(): array
```

`imageistruecolor` 报告图像是否是由 `imagecreatetruecolor`（真彩色，返回 true）或 `imagecreate`（调色板，返回 false）创建的。当仅传入一个参数时，`imageresolution` 返回 `[res_x, res_y]`（默认为 `[96, 96]`），或者在给定分辨率时设置 DPI 并返回 `true`。`imagetypes` 返回支持格式的位掩码（`IMG_PNG | IMG_JPG | IMG_GIF | IMG_WEBP | IMG_BMP`），而 `gd_info` 返回各个格式的能力数组。

## GD：读取和写入文件

### 加载图像

```php
imagecreatefrompng(string $filename): GdImage
imagecreatefromjpeg(string $filename): GdImage
imagecreatefromgif(string $filename): GdImage
imagecreatefrombmp(string $filename): GdImage
imagecreatefromwebp(string $filename): GdImage
imagecreatefromtga(string $filename): GdImage
imagecreatefromstring(string $data): GdImage
```

`imagecreatefrom*` 负责对文件进行解码（强制使用指定的格式），而 `imagecreatefromstring` 则负责在自动检测格式的情况下对内存中的字符串进行解码。

> **不兼容性 —— 失败时将通过抛出异常来报告，而不是返回 `false`。** PHP 的这些函数会返回 `GdImage|false`。elephc 无法返回保持可用状态的 `GdImage|false`：结果必须传递给接受 `GdImage` 类型的函数，但类型检查器既不接受将 `GdImage|false` 作为参数，也无法在 `=== false` 检查后对其类型进行收窄。因此，elephc 会返回一个普通的 `GdImage`，并在失败时抛出 `ImageException` 异常。常规使用路径保持不变 ——
> `$im = imagecreatefrompng($f); imagesx($im);` —— 而错误处理则需要使用 try/catch：
>
> ```php
> try {
>     $im = imagecreatefrompng($path);
> } catch (ImageException $e) {
>     // 处理文件丢失/损坏/格式错误的情况
> }
> ```

### 写入图像

```php
imagepng(GdImage $image, ?string $file = null, int $quality = -1, int $filters = -1): bool
imagejpeg(GdImage $image, ?string $file = null, int $quality = -1): bool
imagegif(GdImage $image, ?string $file = null): bool
imagebmp(GdImage $image, ?string $file = null, bool $compressed = true): bool
imagewebp(GdImage $image, ?string $file = null, int $quality = -1): bool
```

如果指定了 `$file` 路径，图像将直接编码并写入磁盘。如果省略 `$file`（或传入 `null`），编码后的字节将被输出到标准输出，这与 GD 的行为一致。JPEG 遵循 `$quality`（0–100）。PNG 是无损的（接受其 `$quality`/`$filters` 参数但不会改变像素），WebP 使用无损编码，而 BMP 为未压缩格式。

### 支持的格式

得益于捆绑的纯 Rust 编解码器，PNG、JPEG、GIF、BMP 和 WebP 在读取和写入方面均得到了完全支持。TGA 格式支持通过 `imagecreatefromtga()` 进行读取（PHP 自 7.4 起支持 TGA 读取），但目前没有 TGA 写入器。其余的 GD 格式尚未有纯 Rust 实现路径，因而不受支持：WBMP、XBM、XPM、原生 GD/GD2 格式以及 AVIF。调用它们的 `imagecreatefrom*`/输出函数将不可用；此项正在路线图中跟踪，并会由 `gd_info()` 报告。

## GD：变换、复制和过滤

### 复制区域

```php
imagecopy(GdImage $dst, GdImage $src, int $dst_x, int $dst_y, int $src_x, int $src_y, int $src_width, int $src_height): bool
imagecopymerge(GdImage $dst, GdImage $src, int $dst_x, int $dst_y, int $src_x, int $src_y, int $src_width, int $src_height, int $pct): bool
imagecopymergegray(GdImage $dst, GdImage $src, int $dst_x, int $dst_y, int $src_x, int $src_y, int $src_width, int $src_height, int $pct): bool
imagecopyresized(GdImage $dst, GdImage $src, int $dst_x, int $dst_y, int $src_x, int $src_y, int $dst_width, int $dst_height, int $src_width, int $src_height): bool
imagecopyresampled(GdImage $dst, GdImage $src, int $dst_x, int $dst_y, int $src_x, int $src_y, int $dst_width, int $dst_height, int $src_width, int $src_height): bool
```

`imagecopy` 用于块传输（blit）一个区域，当目标的 alpha 混合开启时，会将其合成在目标之上。`imagecopymerge` 以 `$pct` 的不透明度百分比将源图像线性混合到目标图像之上；`imagecopymergegray` 会先对目标图像进行去饱和处理以保留源图像的色调。`imagecopyresized` 使用最近邻采样进行缩放，而 `imagecopyresampled` 则使用双线性采样。在单个图像内部进行复制（`$dst === $src`）是安全的 —— 源区域会在写入目标之前被先读取。

### 缩放、裁剪、翻转、旋转

```php
imagescale(GdImage $image, int $width, int $height = -1, int $mode = IMG_BILINEAR_FIXED): GdImage
imagecrop(GdImage $image, array $rectangle): GdImage
imagecropauto(GdImage $image, int $mode = IMG_CROP_DEFAULT, float $threshold = 0.5, int $color = -1): GdImage
imageflip(GdImage $image, int $mode): bool
imagerotate(GdImage $image, float $angle, int $background_color, int $ignore_transparent = 0): GdImage
imageaffine(GdImage $image, array $affine, ?array $clip = null): GdImage
imageaffinematrixconcat(array $matrix1, array $matrix2): array
```

`imagescale` 缩放整个图像（负的 `$height` 会保持宽高比；若 `$mode` 设为 `IMG_NEAREST_NEIGHBOUR` 则使用最近邻插值，否则使用双线性插值）。`imagecrop` 接受一个关联数组形式的矩形参数 `["x" => , "y" => , "width" => , "height" => ]`，并将超出源图像边缘的任何区域填充为透明。`imagecropauto` 裁剪均匀的边界（`IMG_CROP_DEFAULT`/`IMG_CROP_SIDES` 使用左上角像素，另外还有 `IMG_CROP_TRANSPARENT`/`IMG_CROP_BLACK`/`IMG_CROP_WHITE`/`IMG_CROP_THRESHOLD`）。`imageflip` 在原位进行镜像翻转（`IMG_FLIP_HORIZONTAL`、`IMG_FLIP_VERTICAL`、`IMG_FLIP_BOTH`）。`imagerotate` 将图像逆时针旋转 `$angle` 度到放大后的画布上，并使用 `$background_color` 填充暴露出来的区域；直角倍数的旋转是精确的，其他角度使用最近邻采样。`imageaffine` 应用 6 元素矩阵 `[a, b, c, d, e, f]`（将 `(x, y)` 映射 to `(a·x + c·y + e, b·x + d·y + f)`）并返回变换后的包围盒；`imageaffinematrixconcat` 组合两个此类矩阵。

> **不兼容性 —— 失败时将通过抛出异常来报告，而不是返回 `false`。** 与 `imagecreatefrom*` 类似，返回新图像的函数（`imagescale`、`imagecrop`、`imagecropauto`、`imagerotate`、`imageaffine`）在失败时会返回一个普通的 `GdImage` 并抛出 `ImageException` 异常，因为 `GdImage|false` 的结果无法传递给以 `GdImage` 为类型限制的函数，且在进行 `=== false` 检查后类型无法被收窄。`imageaffine` 的 `$clip` 参数虽然接受但会被忽略（始终返回完整变换后的图像），且 `imageaffinematrixget` 尚未实现（其返回的 `array|float` 类型在 elephc 中没有单类型表示方式）。

### 滤镜与颜色调整

```php
imagefilter(GdImage $image, int $filter, int $arg1 = 0, int $arg2 = 0, int $arg3 = 0, int $arg4 = 0): bool
imageconvolution(GdImage $image, array $matrix, float $divisor, float $offset): bool
imagegammacorrect(GdImage $image, float $input_gamma, float $output_gamma): bool
```

`imagefilter` 支持所有的 GD 选择器：`IMG_FILTER_NEGATE`、`IMG_FILTER_GRAYSCALE`、`IMG_FILTER_BRIGHTNESS`、`IMG_FILTER_CONTRAST`、`IMG_FILTER_COLORIZE`、`IMG_FILTER_EDGEDETECT`、`IMG_FILTER_EMBOSS`、`IMG_FILTER_GAUSSIAN_BLUR`、`IMG_FILTER_SELECTIVE_BLUR`、`IMG_FILTER_MEAN_REMOVAL`、`IMG_FILTER_SMOOTH`、`IMG_FILTER_PIXELATE` 和 `IMG_FILTER_SCATTER`。基于卷积的滤镜使用 libgd 的 3×3 内核；`IMG_FILTER_SELECTIVE_BLUR` 由高斯内核逼近，而 `IMG_FILTER_SCATTER` 使用确定的伪随机序列（GD 的伪随机序列是不可复现的）。不支持颜色数组格式的 `IMG_FILTER_SCATTER`。`imageconvolution` 应用任意 3×3 矩阵并进行边缘复制且保留 alpha 通道。`imagegammacorrect` 将每个通道提升为 `input_gamma / output_gamma` 次幂。

### 插值、渐进式加载和抗锯齿

```php
imagesetinterpolation(GdImage $image, int $method = IMG_BILINEAR_FIXED): bool
imagegetinterpolation(GdImage $image): int
imageinterlace(GdImage $image, ?bool $enable = null): int
imageantialias(GdImage $image, bool $enable): bool
```

`imagesetinterpolation`/`imagegetinterpolation` 存储并报告插值方法（即 `IMG_BELL` …… `IMG_WEIGHTED4` 常量）。`imageinterlace` 存储并返回渐进式扫描位（捆绑的编码器总是写入非渐进式输出）。`imageantialias` 被作为无操作接受 —— 尚未实现抗锯齿的图元绘制。

> 不提供已废弃/移除的 GD 转换器（`image2wbmp`、`jpeg2wbmp`、`png2wbmp`）以及仅在 Windows 上可用的屏幕截取函数（`imagegrabscreen`、`imagegrabwindow`）。

## Exif 和 IPTC 元数据

读取 EXIF（相机/TIFF）标签和 IPTC（标题/关键词）记录。EXIF 解析由纯 Rust 的 EXIF/TIFF 读取器支持；IPTC 则直接进行解析和嵌入，因此不需要系统的 libexif。

### 读取 EXIF

```php
exif_imagetype(string $filename): int|false
exif_read_data(string $filename, ?string $sections = null, bool $as_arrays = false, bool $thumbnail = false): array|false
read_exif_data(string $filename, ...): array|false
exif_tagname(int $index): string
exif_thumbnail(string $filename, &$width = 0, &$height = 0, &$image_type = 0): string
```

`exif_imagetype` 从文件头的探测中返回 `IMAGETYPE_*` 代码，若文件不是图像或丢失则返回 `false`。`exif_read_data`（及其别名 `read_exif_data`）返回一个扁平的关联数组，键名为标准的 EXIF 助记符（`Make`、`Model`、`Orientation`、`DateTime`、`XResolution`、`GPSLatitude` 等），若文件没有 EXIF 块则返回 `false`。`exif_tagname` 将标签编号映射到其助记符。`exif_thumbnail` 返回嵌入的 JPEG 缩略图，并填充通过引用传递的输出参数 `width`/`height`/`image_type`。

```php
$exif = exif_read_data("photo.jpg");
echo $exif["Make"], " ", $exif["Model"], "\n";
echo exif_tagname(0x0112), "\n";                 // Orientation

$thumb = exif_thumbnail("photo.jpg", $w, $h, $type);
if ($thumb !== "") {
    file_put_contents("thumb.jpg", $thumb);      // $w x $h, $type = IMAGETYPE_JPEG
}
```

PHP 兼容性说明（已记录的简化行为）：

- EXIF 值均以字符串形式返回：ASCII 作为文本，整数类型作为十进制数，有理数作为 `"num/den"`。而 PHP 会返回类型化的标量和数组。如果某个标签在多个 IFD 中同时存在，则保留其最后一个值。
- PHP 注入到 `exif_read_data` 中的合成元切片 `FILE` / `COMPUTED` / `SectionsFound` 在此不会被生成；文件级别的数据请使用 `getimagesize()` / `exif_imagetype()`。`$sections`、`$as_arrays` 以及 `$thumbnail` 参数已被接受以保持签名兼容，但它们不会改变返回的标签。
- `exif_tagname`（未知标签）和 `exif_thumbnail`（无缩略图）返回 `""` 而不是 `false`，因为 elephc 将 `string|false` 的返回类型合并为了字符串。请使用 `=== ""` 替代 `=== false` 进行测试。
- 仅提取经 JPEG 压缩的 EXIF 缩略图；不支持罕见的未压缩 TIFF 缩略图格式。

### IPTC

```php
iptcparse(string $iptcblock): array|false
iptcembed(string $iptcdata, string $jpeg_file_name, int $spool = 0): string|false
```

`iptcparse` 将原始 IPTC IIM 块解码为以 `record#dataset`（例如 `"2#005"`、`"2#025"`）为键的数组，其中每个键保存一个值数组（重复的数据集，例如关键词，会产生多个条目）。如果该块没有 IPTC 标记，则返回 `false`。`iptcembed` 将 IPTC 块作为 Photoshop `APP13` 标记插入到 JPEG 中（替换任何现有标记）并返回新的 JPEG 字节；当 `$spool >= 2` 时它还会将它们直接输出。

```php
$data = iptcparse($block);
echo $data["2#005"][0], "\n";                    // caption
echo implode(", ", $data["2#025"]), "\n";        // keywords

$tagged = iptcembed($block, "photo.jpg");
file_put_contents("tagged.jpg", $tagged);
```

## Imagick（对象 API）

elephc 提供了 **Imagick** 对象 API —— `Imagick`、`ImagickDraw`、`ImagickPixel`、`ImagickPixelIterator` 以及 `ImagickKernel` —— 并在 GD 背后的同一个编解码器桥接层上通过纯 Rust 进行了重写。不需要系统的 ImageMagick；生成的二进制文件在每个目标平台上均可独立运行。

由于目前还没有 ImageMagick 的纯 Rust 移植版本，因此这是一个语义级的重新实现：它复现了有记录的行为，但与 ImageMagick 在字节级并不完全等价。其声明了完整的 PHP API 接口层：`Imagick`、`ImagickDraw`、`ImagickPixel`、`ImagickPixelIterator` 和 `ImagickKernel` 的每个方法均可调用，因此任何 ImageMagick 程序均可成功编译。下文所示的方法包含纯 Rust 的真实实现；所有其他方法均为抛出异常的存根，在运行时会引发 `ImagickException("<Class>::<method>() is not supported in elephc")` 异常，而不会静默失败或在编译时引发 “Undefined method”（未定义方法）错误（参见下文的*抛出异常的操作*）。

### 创建与读取

```php
$im = new Imagick();                 // empty wand
$im->newImage(200, 120, "white");    // background: name, #hex, rgb()/rgba(), or ImagickPixel
$im->setImageFormat("PNG");

$photo = new Imagick("photo.jpg");   // 通过构造函数读取文件
$photo->readImage("other.png");      // 或显式读取
$photo->readImageBlob($bytes);       // 或从内存字节中读取
```

`getImageWidth()`、`getImageHeight()` 和 `getImageGeometry()` 报告当前帧的大小。`getImagePixelColor($x, $y)` 返回一个 `ImagickPixel`。

### 写入与 Blob

```php
$im->setImageCompressionQuality(90);
$im->writeImage("out.png");          // 格式来自扩展名或 setImageFormat()
$bytes = $im->getImageBlob();        // 编码后的字节 (二进制安全)
```

### 变换与特效

```php
$im->resizeImage(400, 300, Imagick::FILTER_LANCZOS, 1.0); // 可选的第5个参数 bestfit
$im->scaleImage(100, 75);
$im->thumbnailImage(120, 0);         // 在一维设为 0 可以保持宽高比
$im->cropImage(80, 80, 10, 10);
$im->rotateImage("white", 90);       // 背景颜色，然后是角度度数
$im->flipImage();                    // 垂直翻转
$im->flopImage();                    // 水平翻转
$im->blurImage(2, 1);                // 半径，标准差 sigma (高斯)
$im->gaussianBlurImage(2, 1);
$im->sharpenImage(1, 0.5);
$im->negateImage();
$im->modulateImage(110, 120, 100);   // 亮度、饱和度、色调 (100 = 保持不变)
```

接受缩放滤镜和模糊度参数以保持 API 兼容性；但无论如何 elephc 都会使用双线性滤镜进行缩放。重采样/采样还原度很高，但在像素级别与 ImageMagick 并不完全等价。

### 图像合成

```php
$canvas->compositeImage($overlay, Imagick::COMPOSITE_OVER, $x, $y);
$canvas->compositeImage($overlay, Imagick::COMPOSITE_COPY, $x, $y);
```

`COMPOSITE_OVER`（源在上 alpha 混合）和 `COMPOSITE_COPY`（覆写）已实现。使用任何其他合成运算符都将抛出 `ImagickException` 异常。

### 使用 ImagickDraw 绘制

```php
$draw = new ImagickDraw();
$draw->setFillColor("#1d4ed8");                 // 字符串或 ImagickPixel
$draw->setStrokeColor(new ImagickPixel("black"));
$draw->setStrokeWidth(2);
$draw->rectangle(10, 10, 190, 60);
$draw->line(0, 0, 199, 119);
$draw->circle(50, 90, 50, 70);                  // 圆心，然后是圆周上的一点
$draw->ellipse(100, 60, 40, 25, 0, 360);
$draw->point(5, 5);
$draw->polygon([["x" => 0, "y" => 0], ["x" => 20, "y" => 0], ["x" => 10, "y" => 20]]);

$im->drawImage($draw);
```

填充形状会先绘制填充颜色，然后是描边轮廓。

### ImagickPixel

```php
$p = new ImagickPixel("rgb(255,128,0)");
$p->getColor();                       // ["r"=>255, "g"=>128, "b"=>0, "a"=>255]
$p->getColor(1);                      // 归一化的 0..1 浮点数
$p->getColorValue(Imagick::COLOR_RED);// 单个通道作为 0..1 浮点数
$p->getColorAsString();              // "srgb(255,128,0)"
$p->isSimilar(new ImagickPixel("orange"), 0.1);
```

### 多帧图像（Wand）

`Imagick` 是一个帧序列，并实现了 **Iterator** 和 **Countable**：

```php
$seq = new Imagick();
$seq->addImage($frameA);
$seq->addImage($frameB);
echo count($seq);                     // 2 (Countable)
foreach ($seq as $i => $frame) {      // Iterator: $frame 是在第 $i 帧处的 wand
    echo $frame->getImageWidth();
}
$seq->setImageIndex(1);               // 选择活动帧
$seq->nextImage(); $seq->previousImage(); $seq->setFirstIterator();
```

可以通过 `getPixelIterator()` 获取逐像素迭代器：

```php
$it = $im->getPixelIterator();
foreach ($it as $row) {               // 每一行 $row 都是一个由 ImagickPixel 组成的数组
    foreach ($row as $pixel) { /* ... */ }
}
```

### 使用 ImagickKernel 进行卷积

```php
$kernel = ImagickKernel::fromMatrix([
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0],
]);
$im->convolveImage($kernel);          // 支持 3x3 内核
```

`ImagickKernel::fromMatrix` 支持 **3×3** 内核；其他尺寸和 `fromBuiltIn` 将抛出 `ImagickKernelException`（已记录的差距）。

### 抛出异常的操作

上文所示的方法包含纯 Rust 实现。在 Imagick 家族中，任何其他方法 —— 即完整的 PHP `Imagick`/`ImagickDraw`/`ImagickPixel`/`ImagickPixelIterator`/`ImagickKernel` 接口层 —— 均被声明为抛出异常的存根，在调用时会引发 `ImagickException("<Class>::<method>() is not supported in elephc")` 异常。因此，使用其中任何方法的程序依然可以编译通过；这些奇特的操作只需在运行时抛出异常即可。抛出异常的例子包括：`distortImage`、`liquidRescaleImage`、`fxImage`、`waveImage`、`swirlImage`、`quantizeImage`、`sepiaToneImage`、`identifyImage` 和 `annotateImage`（最后一个需要 FreeType 文本）。捕获异常可以用于检测不支持的操作：

```php
try {
    $im->distortImage(Imagick::DISTORTION_PERSPECTIVE ?? 0, [/* ... */], false);
} catch (ImagickException $e) {
    // 回退到支持的变换操作
}
```

与 ImageMagick 的其他差异：颜色是从 CSS 名称 / 十六进制 / `rgb()`（一个通用子集，并非完整的 X11 列表）解析的；`setImageBackgroundColor()` 会对当前帧进行着色（elephc 没有延迟背景插槽）；图像输出使用纯 Rust 编解码器（PNG/JPEG/GIF/BMP/WebP），因此编码器输出的字节并不是完全一致的。

## Gmagick（对象 API）

`Gmagick`、`GmagickDraw` 和 `GmagickPixel` 提供了 GraphicsMagick 风格的对象 API，其运行在与 Imagick 相同的纯 Rust 桥接层上 —— 不需要系统的 GraphicsMagick。Gmagick 方法是**流式的**：变动性操作会返回 `Gmagick` 对象以供链式调用。与 Imagick 一样，其声明了完整的 PHP API 接口层：每个方法均可调用，下文所示的方法具有纯 Rust 的真实实现，其余方法均为抛出异常的存根（参见*抛出异常的操作*）。

### 创建、绘制与写入

```php
$gm = new Gmagick();
$gm->newImage(120, 60, "rgb(245,245,245)", "PNG");

$draw = new GmagickDraw();
$draw->setFillColor("#1d4ed8")->rectangle(8, 8, 60, 50);
$gm->drawImage($draw);

$gm->setCompressionQuality(90)
   ->scaleImage(240, 120)
   ->writeImage("banner.png");

echo $gm->getImageWidth() . "x" . $gm->getImageHeight();   // 240x120
```

`GmagickDraw` 支持 `setFillColor`/`setStrokeColor`（字符串或 `GmagickPixel`）、`setStrokeWidth`、`line`、`rectangle`、`ellipse`、`point` 以及 `polygon`（一个由 `["x" => , "y" => ]` 点构成的数组），每个方法均返回绘制对象以供链式调用。

### 变换、效果与帧管理

`resizeImage`、`scaleImage`、`thumbnailImage`、`cropImage`、`rotateImage`（背景颜色 + 角度）、`flipImage`、`flopImage`、`blurImage`、`gaussianBlurImage`、`modulateImage` 和 `compositeImage`（OVER/COPY）都返回 `Gmagick` 对象。多帧图像通过 `addImage`、`getNumberImages`、`getImageIndex`/`setImageIndex`、`nextImage`/`previousImage` 以及 `hasNextImage`/`hasPreviousImage` 进行管理。

### 读取像素

Gmagick 没有逐像素读取的方法（与 PHP 一致）。如果需要检查输出，可使用 `getImageBlob()` 对帧进行编码并用 GD 进行解码：

```php
$img = imagecreatefromstring($gm->getImageBlob());
$rgb = imagecolorat($img, 9, 9);   // 0xRRGGBB
```

### GmagickPixel

```php
$p = new GmagickPixel("rgb(255,0,0)");
echo $p->getColorAsString();              // srgb(255,0,0)
$c = $p->getColor();                      // ["r"=>255, "g"=>0, "b"=>0, "a"=>255]
echo $p->getColorValue(Gmagick::COLOR_RED);  // 1
$p->setColorValue(Gmagick::COLOR_GREEN, 1.0);
```

与 GraphicsMagick（其 `getColor()` 可以返回文本形式）不同，elephc 的 `GmagickPixel::getColor()` 始终返回通道数组；字符串格式可通过 `getColorAsString()` 获取。

### 抛出异常的操作

上文所示的方法包含纯 Rust 实现。Gmagick 家族中的任何其他方法 —— 即完整的 PHP `Gmagick`/`GmagickDraw`/`GmagickPixel` 接口层 —— 均被声明为抛出异常的存根，在调用时会引发 `GmagickException("<Class>::<method>() is not supported in elephc")` 异常，因此任何 GraphicsMagick 程序依然可以编译。抛出异常的例子包括：`swirlImage`、`charcoalImage`、`oilPaintImage`、`embossImage`、`quantizeImage` 和 `annotateImage`（FreeType 文本）。`GmagickDraw::annotate` 同样会抛出 `GmagickDrawException`。未识别的颜色会抛出 `GmagickPixelException`，而不受支持的合成运算符会抛出 `GmagickException`。与 Imagick 一样，`setImageBackgroundColor()` 会对当前帧进行着色，且纯 Rust 编解码器的输出与 GraphicsMagick 在字节级并不完全等价。

## Cairo（对象 API）

`Cairo*` 类提供了 cairo 风格的二维矢量图绘制，由纯 Rust 的 [`tiny-skia`](https://crates.io/crates/tiny-skia) 光栅化引擎支持 —— 不需要系统的 cairo。`CairoImageSurface`（光栅、PNG 输出）已完全支持；PDF、PS 和 SVG 表面没有纯 Rust 的路径，属于已记录的差距。

### 绘制到图像表面

```php
$surface = new CairoImageSurface(CairoFormat::ARGB32, 160, 120);
$cr = new CairoContext($surface);

$cr->setSourceRgb(1, 1, 1);          // 白色
$cr->paint();                         // 填充整个表面

$cr->setSourceRgb(0.114, 0.306, 0.847);
$cr->arc(48, 60, 34, 0, 2 * M_PI);    // 一个圆
$cr->fill();

$cr->setSourceRgb(0, 0.5, 0);
$cr->setLineWidth(4);
$cr->moveTo(96, 90);
$cr->lineTo(120, 40);
$cr->lineTo(144, 90);
$cr->closePath();
$cr->stroke();

$surface->writeToPng("out.png");
```

`CairoContext` 支持 `moveTo`/`lineTo`/`curveTo`/`arc`/`arcNegative`/`rectangle`/`closePath`/`newPath`/`newSubPath`，`fill`/`fillPreserve`/`stroke`/`strokePreserve`/`paint`，`setSourceRgb`/`setSourceRgba`/`setSource`，`setLineWidth`/`setLineCap`/`setLineJoin`/`setFillRule`，变换堆栈（`save`/`restore`，`translate`/`scale`/`rotate`/`transform`/`setMatrix`/`identityMatrix`）以及 `getCurrentPoint`。

### 图案与渐变

```php
$grad = new CairoLinearGradient(0, 0, 160, 0);
$grad->addColorStopRgb(0, 1, 0, 0);   // 左侧为红色
$grad->addColorStopRgb(1, 0, 0, 1);   // 右侧为蓝色
$cr->setSource($grad);
$cr->rectangle(0, 0, 160, 24);
$cr->fill();
```

支持 `CairoSolidPattern`、`CairoLinearGradient` 和 `CairoRadialGradient`。`CairoMatrix` 是一个值对象（`initIdentity`/`initTranslate`/`initScale`/`initRotate`/`transformPoint`）。

### 读取像素

`CairoImageSurface` 会写入 PNG；可通过 GD 对其进行解码以检查像素：

```php
$img = imagecreatefrompng("out.png");
$rgb = imagecolorat($img, 48, 60);    // 0xRRGGBB
```

### 已记录的差距

`CairoPdfSurface`、`CairoPsSurface` 和 `CairoSvgSurface` 会抛出 `CairoException` 异常（没有纯 Rust 矢量文档后端）。文本渲染依赖于 FreeType：`CairoContext::showText`/`textExtents`、`CairoToyFontFace` 和 `CairoScaledFont` 会抛出 `CairoException`（`selectFontFace`/`setFontSize` 是可接受的无操作，因此非文本绘制不受影响）。不支持 `CairoSurfacePattern`。输出使用 tiny-skia 的光栅化引擎，因此经过了抗锯齿处理，但在字节级与 cairo 并不完全一致。

### 覆盖范围模型（故意保留不完整性）

与 Imagick 和 Gmagick 家族 —— 即每个 PHP 方法均被声明为真实实现或抛出异常的存根以使得整个 API 接口层皆可调用 —— 不同，Cairo 表面在设计上故意保持不完整。PECL cairo 是实验性的且使用率较低，因此 elephc 保留了三个层级：

1. **已实现** —— 常规的绘制路径（`CairoContext` 的路径/渲染/源/线属性/变换方法，`CairoImageSurface` 光栅 + PNG，`CairoSolidPattern`/`CairoLinearGradient`/`CairoRadialGradient`，`CairoMatrix`）。
2. **抛出异常的存根** —— 没有纯 Rust 等效实现（矢量表面、文本、表面图案）的已记录差距，在运行时会抛出 `CairoException` 异常。
3. **未定义** —— 其余奇特的方法（`clip`、`clipPreserve`、`resetClip`、`setDash`、`setMiterLimit`、`hasCurrentPoint`、`inFill`、`copyPath` 等）未被声明，因此调用将引发编译时 `Undefined method` 错误，而非静默的无操作。

这是刻意设计的：编译错误比静默丢弃裁剪或虚线设置更为理想。此约定由 `test_image_error_cairo_undefined_methods_are_compile_errors` 锁定。

## Cairo（过程式 API）

对于相比对象更倾向于使用函数的调用者，PECL 风格的自由函数层镜像了 `Cairo*` 类。每个封装函数都会构建相应的对象并进行委派，因此这两层表现得完全一致。

```php
$surface = cairo_image_surface_create(CairoFormat::ARGB32, 160, 120);
$cr = cairo_create($surface);

cairo_set_source_rgb($cr, 1, 1, 1);
cairo_paint($cr);

cairo_set_source_rgb($cr, 0.114, 0.306, 0.847);
cairo_arc($cr, 48, 60, 34, 0, 2 * M_PI);
cairo_fill($cr);

cairo_surface_write_to_png($surface, "out.png");
```

支持的常见子集如下：

- **表面：** `cairo_image_surface_create`、`cairo_image_surface_create_from_png`、`cairo_image_surface_get_width`、`cairo_image_surface_get_height`、`cairo_surface_write_to_png`。
- **上下文：** `cairo_create`、`cairo_save`、`cairo_restore`。
- **源/颜色：** `cairo_set_source_rgb`、`cairo_set_source_rgba`、`cairo_set_source`、`cairo_set_line_width`、`cairo_set_line_cap`、`cairo_set_line_join`、`cairo_set_fill_rule`。
- **路径：** `cairo_move_to`、`cairo_line_to`、`cairo_curve_to`、`cairo_rectangle`、`cairo_arc`、`cairo_arc_negative`、`cairo_close_path`、`cairo_new_path`、`cairo_new_sub_path`。
- **渲染：** `cairo_paint`、`cairo_fill`、`cairo_fill_preserve`、`cairo_stroke`、`cairo_stroke_preserve`。
- **变换：** `cairo_translate`、`cairo_scale`、`cairo_rotate`、`cairo_set_matrix`、`cairo_transform`、`cairo_identity_matrix`、`cairo_get_current_point`。
- **图案：** `cairo_pattern_create_rgba`、`cairo_pattern_create_rgb`、`cairo_pattern_create_linear`、`cairo_pattern_create_radial`、`cairo_pattern_add_color_stop_rgb`、`cairo_pattern_add_color_stop_rgba`。
- **矩阵：** `cairo_matrix_init_identity`、`cairo_matrix_init_translate`、`cairo_matrix_init_scale`、`cairo_matrix_init_rotate`、`cairo_matrix_multiply`、`cairo_matrix_transform_point`。

`cairo_get_current_point` 和 `cairo_matrix_transform_point` 返回 `["x" => …, "y" => …]` 关联数组。`cairo_matrix_multiply($m1, $m2)` 组合两个矩阵，其中 `$m2` 首先应用，然后是 `$m1`（cairo 约定）。

晦涩的 PECL 尾部辅助函数（字体选项、缩放字体、toy 字体、PDF/PS/SVG 表面构造函数以及其余约 40 个很少使用的辅助函数）则不提供。被省略的函数是真正的未定义 —— 调用其中之一将引发编译时 `Undefined function:` 错误，而不是静默的无操作。上文的对象 API 是访问已记录差距行为（矢量表面和文本抛出 `CairoException`）的受支持方式。

## 示例

```php
<?php
$im = imagecreatetruecolor(64, 48);
$red = imagecolorallocate($im, 220, 40, 40);
imagesetpixel($im, 0, 0, $red);

imagepng($im, "out.png");
imagejpeg($im, "out.jpg", 90);

$info = getimagesize("out.png");
echo $info[0] . "x" . $info[1] . " " . $info["mime"] . "\n";   // 64x48 image/png

// Decode straight from bytes.
$copy = imagecreatefromstring((string) file_get_contents("out.png"));
echo imagesx($copy) . "x" . imagesy($copy) . "\n";             // 64x48

imagedestroy($copy);
imagedestroy($im);
```
