# DOOM E1M1 — 用 PHP 渲染，编译为原生 ARM64 二进制文件

本示例加载原版 DOOM WAD 文件并实时渲染关卡，整个过程完全由 PHP 编写，并由 [elephc](https://github.com/illegalstudio/elephc) 编译为独立的原生二进制文件（native binary）。

无解释器，无虚拟机，除 SDL2 外无任何运行时依赖。

## 功能概览

- 解析原版 `DOOM1.WAD` 二进制格式（文件头、目录、lump 数据块）
- 加载 E1M1 全部几何数据：顶点、linedef、sidedef、sector、seg、subsector、BSP 节点
- 从前到后遍历 BSP 树以确定可见性排序
- 基于每列透视投影并叠加指数距离雾效的墙体渲染
- 从 WAD PLAYPAL 调色板中读取每个 sector 的颜色
- 每个 sector 地板/天花板的平面渲染，带深度阴影
- 动态 sector 光照效果（闪烁、频闪、振荡）
- 滚动全景天空
- 使用 WASD + 方向键控制摄像机移动
- 台阶攀爬（最高 24 单位）
- 墙体、高度差和低矮天花板的碰撞检测
- 加载时自动预开所有门
- 小地图叠加层，显示玩家位置和物体标记
- HUD 状态栏，包含罗盘、高度指示器和实时 FPS 计数器
- 关闭的门以特定金属色区分显示

## 使用的 elephc 特性

- `packed class`：用于所有 WAD 数据结构（Vertex、Linedef、Sidedef、Sector、Seg、SubSector、Node、Thing）
- `buffer<T>`：用于地图几何数据的连续类型化存储
- `extern "SDL2" { ... }`：SDL2 函数声明的 FFI 块
- `ptr`、`ptr_null()`、`ptr_is_null()`、`ptr_offset()`、`ptr_read8()`：用于 SDL 键盘状态读取
- 命名空间与 `require_once`：构建模块化项目结构
- 普通类：用于高层编排（Application、Game、Camera、Renderer）
- 枚举：用于状态机（GameState、RenderMode）

## 构建

需要 SDL2 及一份 `DOOM1.WAD` 共享版文件（shareware）。

```bash
# compile
cargo run -- -l SDL2 -L /opt/homebrew/lib --heap-size=67108864 showcases/doom/main.php

# run
./showcases/doom/main
```

下载共享版 WAD：搜索 "DOOM1.WAD shareware"，或从[原版共享版发布包](https://doomwiki.org/wiki/DOOM1.WAD)中提取。将文件放置在本目录下。

## 操作说明

| 按键 | 功能 |
|-----|-----------|
| W / 上箭头 | 前进 |
| S / 下箭头 | 后退 |
| A | 向左平移 |
| D | 向右平移 |
| 左箭头 | 左转 |
| 右箭头 | 右转 |
| Tab | 切换小地图 |
| ESC | 退出 |

## 架构

```
main.php                 Entry point
src/
  bootstrap.php          Module loader
  App/
    Application.php      Top-level shell
    Config.php           Window size, WAD path, timing
    Game.php             Game loop, input, camera, collisions
    GameState.php         Enum: Booting, Running, Stopped
    RenderMode.php        Enum: Map2D, World3D, Split
  SDL/
    extern.php           SDL2 FFI declarations
    SDL.php              SDL wrapper (init, window, renderer)
    Input.php            Keyboard state helpers
  IO/
    BinaryReader.php     Little-endian binary parsing
  Wad/
    WadEntry.php         Lump metadata
    WadFile.php          WAD file metadata
    WadLoader.php        WAD header + directory parser
  Map/
    MapData.php          All parsed level data
    MapLoader.php        Lump parser, palette loader, door opener
  Bsp/
    BspWalker.php        BSP tree front-to-back traversal
  Render/
    Renderer.php         Orchestrator, HUD, thing rendering, FPS counter
    WallRenderer.php     BSP wall column renderer with fog and palette
    MinimapRenderer.php  2D map overlay
    Projection.php       Perspective math helpers
  Player/
    Camera.php           Position, height, angle
  Data/
    Vertex.php           packed class (x, y)
    Linedef.php          packed class (7 fields)
    Sidedef.php          packed class (3 fields)
    Sector.php           packed class (5 fields)
    Seg.php              packed class (6 fields)
    SubSector.php        packed class (2 fields)
    Node.php             packed class (14 fields)
    Thing.php            packed class (5 fields)
  Support/
    Direction.php        Trig helpers for camera movement
```

## 已知限制

- 无墙体贴图（使用 WAD 调色板中的纯色代替）
- 无垂直裁剪（远处墙体可能透过传送门台阶渗出）——需实现 `solidsegs`
- 门在运行时无法动画播放（编译器限制：#62/#65）
- 物体以彩色列渲染，而非精灵图
- 无音频
