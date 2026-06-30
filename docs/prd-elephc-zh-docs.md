# elephc 中文文档 PRD

## 1. 背景

elephc 是一个 PHP-to-native 编译器项目，官方仓库为 <https://github.com/illegalstudio/elephc>，官网为 <https://elephc.dev>。项目文档主要分布在上游仓库的 `docs/`、`showcases/` 和 `examples/` 目录中。

当前中文资料库项目 `elephc-zh-docs` 目标是建设“elephc 中文文档”，帮助中文开发者理解 elephc 的使用方式、语言支持范围、编译器扩展能力、内部实现和典型案例。

上游内容规模较大：`docs/` 下已有 900 多个 Markdown 文件，其中大量是 PHP builtins 参考文档。仅做一次性人工翻译不可持续，因此本项目需要具备自动同步、增量翻译、术语一致性管理和站点构建能力。

## 2. 产品定位

“elephc 中文文档”是面向中文开发者的官方/社区型中文资料库，核心价值是：

- 提供 elephc 官方文档的中文版本。
- 跟随上游文档变化自动同步和增量翻译。
- 基于 `showcases/` 和 `examples/` 整理中文案例和示例索引。
- 降低中文开发者理解 PHP 原生编译、FFI、buffer、packed class、EIR、运行时等概念的门槛。

## 3. 目标

### 3.1 业务目标

- 建立一个可访问、可搜索、可持续更新的 elephc 中文文档站。
- 让中文用户可以通过资料站完成安装、入门、编译、案例运行和核心概念理解。
- 将上游文档变化同步与翻译流程自动化，减少长期维护成本。

### 3.2 产品目标

- 完成上游 `docs/` 目录中文翻译与站点化展示。
- 整理 `showcases/` 中高价值案例的中文导读。
- 基于 `examples/` 自动生成示例分类索引，并为重点示例补充中文说明。
- 为每篇翻译内容保留上游来源、源文件路径和上游提交信息。

### 3.3 非目标

- 不翻译 PHP 示例代码本身，代码块应保持原样。
- 不承诺完整替代上游英文文档，资料站应保留来源链接。
- 不在第一阶段构建复杂社区、评论、登录、在线运行等功能。
- 不对 elephc 源码进行功能性修改。
- 不部署到 GitHub Pages，站点发布目标另行配置。

## 4. 用户画像

### 4.1 PHP 开发者

熟悉 PHP，希望了解如何将 PHP 编译为原生二进制文件。关注安装、用法、支持的 PHP 特性和实际可运行示例。

### 4.2 对编译器感兴趣的开发者

希望通过 elephc 学习编译器、汇编、运行时、内存模型和中间表示。关注 internals 文档和源码导读。

### 4.3 系统/性能方向开发者

关注 FFI、指针、buffer、packed class、native binary、web server、cdylib 等能力，想判断 elephc 是否适合特定实验或性能场景。

## 5. 内容范围

### 5.1 第一优先级

- `docs/README.md`
- `docs/getting-started/**`
- `docs/compiling/**`
- `docs/beyond-php/**`
- `docs/how-to/**`
- `showcases/http-server/README.md`
- `showcases/doom/README.md`
- `examples/cdylib/README.md`

### 5.2 第二优先级

- `docs/php/*.md`
- `docs/internals/*.md`
- 基于 `examples/` 目录生成中文示例索引页。
- 基于 `showcases/` 目录生成中文案例总览页。

### 5.3 第三优先级

- `docs/php/builtins/**`
- 其他自动生成或半结构化 API 参考页。

## 6. 功能需求

### 6.1 上游同步

系统应支持从 <https://github.com/illegalstudio/elephc> 拉取最新内容，并记录同步状态。

需求：

- `elephc-src` 必须作为 git submodule 引入，指向 <https://github.com/illegalstudio/elephc>。
- 支持定时拉取上游 `main` 分支。
- 记录当前同步到的上游 commit hash。
- 仅扫描指定内容目录：`docs/`、`showcases/`、`examples/`。
- 支持识别新增、修改、删除和移动文件。
- 支持本地手动触发同步。
- 自动化更新 submodule 指针时必须通过 Pull Request 提交，不直接合并到主分支。

### 6.2 增量翻译

系统应根据源文件内容 hash 判断是否需要翻译。

需求：

- 对每个源文件计算内容 hash。
- hash 未变化时跳过翻译。
- hash 变化时重新生成翻译。
- 翻译后写入 manifest，记录源文件、源 hash、上游 commit、翻译时间和状态。
- 翻译失败时不覆盖上一版可用译文。
- 支持后续人工修订译文。

### 6.3 翻译规则

翻译应参考 `$baoyu-translate` 技能的流程和原则，保持技术文档风格，准确、简洁、术语一致。

需求：

- 保留 Markdown 结构。
- 保留代码块、命令、函数名、类名、参数名、文件路径和 URL。
- 保留 YAML frontmatter，并翻译其中适合展示的字段，例如 `title`、`description`。
- 内部链接应指向中文站内对应页面。
- 外部链接应保留原链接。
- 首次出现关键技术术语时可保留英文原文。
- builtins 类参考页优先保持结构一致，不做过度意译。
- 长文档应按 Markdown 块切分，保持 frontmatter、标题层级、表格、代码块和列表结构。
- 翻译产物应保留分析、提示词、草稿、修订等中间文件，便于审查和复用。
- 正常文档默认使用 normal 流程，重点文档使用 refined 流程，短结构化参考页可使用 quick 或结构化模板流程。

### 6.4 翻译流程

翻译流程参考 `$baoyu-translate` 技能设计，按文档类型分级执行。

流程要求：

- 加载项目级翻译偏好配置和术语表。
- 对源文件进行内容分析，识别领域、语气、术语和翻译难点。
- 对超过阈值的 Markdown 文档进行分块，分块应基于 Markdown 结构边界。
- 生成共享翻译上下文，包含目标语言、读者、风格、术语表和注意事项。
- 对核心文档执行 Analyze -> Translate。
- 对首页、入门、案例、架构类重要文档执行 Analyze -> Translate -> Review -> Polish。
- 对 builtins 等重复结构参考页优先使用一致模板，避免自由改写导致结构漂移。
- 翻译完成后进行轻量检查：代码块数量、链接、图片引用、frontmatter、标题层级。
- 对包含图片的文档记录可能需要图片文字本地化的候选项，但不自动修改图片。

### 6.5 术语表

系统应维护项目级术语表，用于翻译一致性。

初始术语建议：

| 英文 | 中文建议 |
| --- | --- |
| native binary | 原生二进制文件 |
| compiler | 编译器 |
| assembly | 汇编 |
| runtime | 运行时 |
| target | 目标平台 |
| source map | 源码映射 |
| static subset | 静态子集 |
| FFI | FFI |
| extern | extern |
| pointer | 指针 |
| buffer | buffer / 缓冲区 |
| packed class | packed class / 紧凑类 |
| Fiber | Fiber / 协程 |
| EIR | EIR |
| codegen | 代码生成 |
| type checker | 类型检查器 |

### 6.6 中文文档站

中文文档站应以中文内容为主，并提供清晰的信息架构。

建议导航：

- 首页
- 快速开始
- 编译与 CLI
- PHP 支持
- Beyond PHP
- How-To
- 案例展示
- 示例索引
- 编译器内部
- API / Builtins

页面需求：

- 首页说明 elephc 是什么、适合谁、能做什么。
- 文档页支持侧边栏导航。
- 支持全文搜索。
- 每篇页面展示上游来源信息。
- 每篇页面应能跳转到对应英文源文件。
- 案例展示页应优先展示 HTTP server 和 DOOM。
- 示例索引页应按主题聚合 `examples/`。
- 站点品牌名称统一使用“elephc 中文文档”。
- 站点不部署到 GitHub Pages，部署目标由后续发布环境决定。

### 6.7 示例索引

系统应扫描 `examples/` 目录，生成中文示例索引。

需求：

- 按目录生成示例条目。
- 显示示例名称、路径、涉及主题和简短说明。
- 有 README 的示例优先使用 README 内容生成说明。
- 没有 README 的示例可基于目录名和 `main.php` 生成简短说明。
- 代码文件不翻译，只提供中文导读。

### 6.8 案例展示

系统应基于 `showcases/` 生成案例展示页。

需求：

- 展示案例名称、简介、相关 elephc 能力、构建方式和源文件路径。
- 对已有 README 的案例进行中文翻译。
- 保留图片、GIF 和 benchmark 图表。
- 明确运行依赖，例如 SDL2、DOOM1.WAD 等。

### 6.9 授权与版权声明

中文文档站必须明确声明与上游项目的授权和版权关系。

需求：

- 在站点页脚或专门页面展示上游仓库链接。
- 声明中文文档基于 `illegalstudio/elephc` 项目的公开文档翻译和整理。
- 标注上游项目许可证，并链接到上游 `LICENSE`。
- 声明 elephc 项目名称、源码和原始英文文档版权归上游作者或对应贡献者所有。
- 声明中文翻译和整理内容的授权方式；若未另行指定，应与上游许可证保持兼容。
- 每篇翻译页应保留源文件路径和上游 commit 信息，便于追溯。

## 7. 技术建议

### 7.1 站点框架

推荐第一阶段使用 VitePress。

原因：

- Markdown 友好，适合文档站。
- 侧边栏和导航生成成本低。
- 可生成静态站点，适配自有服务器、对象存储、CDN 或其他非 GitHub Pages 发布环境。
- 可先快速上线，再逐步增强视觉设计。

备选方案：

- Astro Starlight：适合更强官网感和内容组件化，但初始工程复杂度更高。
- Docusaurus：生态成熟，但对当前需求略重。

### 7.2 仓库结构建议

```text
elephc-zh-docs/
  docs/
    prd-elephc-zh-docs.md
  content/
    docs/
    showcases/
    examples/
  scripts/
    sync-upstream.ts
    translate-changed.ts
    build-sidebar.ts
    build-example-index.ts
    validate-links.ts
  .translation/
    manifest.json
    glossary.md
    work/
  site/
    index.md
    .vitepress/
      config.ts
  elephc-src/
```

说明：

- `elephc-src/` 必须作为 git submodule 管理，不直接把完整上游源码提交到中文文档仓库。
- `.translation/manifest.json` 是增量翻译的核心状态文件。
- `.translation/work/` 保存翻译中间产物，例如分析、提示词、草稿、审校意见和分块结果。
- `content/` 保存中文文档内容。
- `site/` 保存站点入口和配置。

## 8. 自动化流程

### 8.1 手动流程

```text
拉取上游
  -> 扫描 docs/showcases/examples
  -> 计算 hash
  -> 找出变化文件
  -> 翻译变化文件
  -> 更新 manifest
  -> 生成导航和索引
  -> 校验 Markdown 链接
  -> 构建站点
```

### 8.2 定时流程

建议使用 GitHub Actions 每日或每周运行：

```text
定时触发
  -> checkout 中文文档仓库
  -> 更新 elephc-src submodule 到上游目标 commit
  -> 运行同步脚本
  -> 如有变化则运行翻译脚本
  -> 构建并校验
  -> 创建 Pull Request
  -> 人工 review
  -> 合并后发布
```

### 8.3 失败处理

- 上游拉取失败：保留当前版本，记录错误。
- 单个文件翻译失败：跳过该文件，记录状态，不影响其他文件。
- 链接校验失败：阻断自动合并，但保留 PR 供人工修复。
- 站点构建失败：阻断发布。
- PR review 未通过：保留分支和日志，等待人工修正后再次校验。

## 9. 数据与状态

`manifest.json` 建议结构：

```json
{
  "upstream": {
    "repo": "https://github.com/illegalstudio/elephc",
    "branch": "main",
    "commit": "4d1998c",
    "submodulePath": "elephc-src"
  },
  "files": [
    {
      "sourcePath": "docs/getting-started/installation.md",
      "targetPath": "content/docs/getting-started/installation.md",
      "sourceHash": "sha256:...",
      "translatedAt": "2026-06-30T00:00:00Z",
      "translationMode": "normal",
      "workDir": ".translation/work/docs/getting-started/installation",
      "status": "translated"
    }
  ]
}
```

## 10. 质量标准

### 10.1 翻译质量

- 技术含义准确。
- 命令、代码、API 名称不被错误翻译。
- 术语在同一上下文内保持一致。
- 中文表达自然，不明显机器翻译腔。
- 页面标题和描述适合中文搜索。
- 翻译流程符合 `$baoyu-translate` 的分级处理思路，并保留必要中间产物。

### 10.2 工程质量

- 支持重复运行，结果稳定。
- 未变化文件不重复翻译。
- 翻译失败不会破坏已有内容。
- 构建流程可在本地和 CI 中运行。
- 导航和链接可自动校验。
- `elephc-src` 作为 submodule 管理，上游版本可追溯。
- 自动化变更通过 PR 和人工 review 合并。
- 站点构建产物可部署到非 GitHub Pages 环境。

## 11. 验收标准

### 11.1 MVP 验收

- 完成 VitePress 站点骨架。
- 首页、导航、侧边栏可用。
- 完成第一优先级内容翻译。
- 能本地运行并预览站点。
- 能记录上游 commit 和文件 hash。
- 能识别至少新增/修改文件并触发增量翻译。
- 站点名称统一显示为“elephc 中文文档”。
- 站点包含授权与版权声明页面或页脚信息。

### 11.2 自动化验收

- 一条命令可完成上游同步和变化检测。
- 一条命令可翻译变化文件并更新 manifest。
- 一条命令可生成 sidebar 和示例索引。
- CI 能构建站点。
- CI 能在上游有变化时更新 `elephc-src` submodule 指针并创建 PR。
- 自动化 PR 必须经过人工 review 后合并。

### 11.3 内容验收

- 第一优先级文档无明显术语错误。
- Markdown 链接可用。
- 代码块未被翻译破坏。
- 案例图片和 GIF 正常显示。
- 每篇翻译页可追溯到上游源文件。
- 每篇翻译页可追溯到翻译模式和必要中间产物。

## 12. 里程碑

### Phase 1：资料站 MVP

- 搭建 VitePress。
- 建立内容目录。
- 将 `elephc-src` 设置为 git submodule。
- 翻译第一优先级文档。
- 配置基础导航和搜索。
- 增加授权与版权声明。
- 支持本地构建。

### Phase 2：同步与增量翻译

- 实现上游同步脚本。
- 实现 manifest。
- 实现变化检测。
- 接入自动翻译流程。
- 支持失败状态记录。

### Phase 3：案例和示例增强

- 生成 showcases 总览。
- 生成 examples 分类索引。
- 精修 HTTP server、DOOM、cdylib 等重点案例。
- 增加运行依赖说明。

### Phase 4：CI 与发布

- 配置 GitHub Actions。
- 定时检查上游变化。
- 自动创建更新 PR。
- 人工 review 后合并自动化 PR。
- 接入非 GitHub Pages 发布环境。

## 13. 风险与对策

| 风险 | 影响 | 对策 |
| --- | --- | --- |
| 上游文档数量大 | 初始翻译成本高 | 分优先级推进，先核心后 builtins |
| 术语不一致 | 阅读体验差 | 建立项目术语表，翻译时强制注入 |
| 自动翻译破坏代码块 | 文档不可用 | 翻译前后校验 Markdown 和代码块 |
| 上游自动生成文档频繁变化 | 重翻成本高 | 使用 hash 缓存和增量翻译 |
| 链接路径变化 | 站内跳转失效 | 构建前运行链接校验 |
| 资料站范围膨胀 | MVP 延迟 | 第一阶段只做文档站和重点内容 |
| submodule 指针更新未 review | 引入未验证上游变化 | 自动化只创建 PR，必须人工 review 后合并 |
| 授权声明不清晰 | 版权和合规风险 | 建立专门授权声明，保留上游 LICENSE 链接和来源追溯 |

## 14. 已确认决策

- 中文文档站不部署到 GitHub Pages。
- 翻译流程和方式参考 `$baoyu-translate` 技能。
- 允许自动化创建 PR，并由人工 review 后合并。
- `elephc-src` 需要作为 git submodule。
- 需要声明与上游项目的授权和版权关系。
- 站点名称使用“elephc 中文文档”。

## 15. 待确认问题

- 非 GitHub Pages 的具体部署环境和发布方式。
- 翻译模型、API 密钥管理方式和调用成本预算。
- 中文翻译与整理内容采用哪一种具体许可证。
