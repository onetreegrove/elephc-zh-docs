目标：将 `docs/internals/the-codegen.md` 翻译为简体中文，用于本地站点“elephc 中文文档”。

偏好：

- 目标语言：简体中文（zh-CN）。
- 读者：中文技术读者、编译器/运行时开发者。
- 风格：技术文档风格，准确、简洁、自然，避免口语化和营销语气。
- 保留 Markdown 结构、标题层级、表格、链接目标和代码围栏。
- 不翻译代码块内容。
- 不翻译内联标识符、PHP/Rust 符号、模块名、文件路径、URL、CLI flag、API 名称和汇编助记符。
- 术语遵循 `.translation/glossary.md`：如 compiler=编译器、runtime=运行时、assembly=汇编、target=目标平台、type checker=类型检查器、codegen=代码生成；`elephc`、`EIR`、`FFI`、`extern`、`buffer<T>`、`packed class` 保持原样。
- frontmatter 只翻译面向用户的 `title` 和 `description` 值，保持键名与 `sidebar` 顺序不变。
