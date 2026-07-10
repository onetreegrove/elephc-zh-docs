You are translating elephc upstream documentation into Simplified Chinese for the local site "elephc 中文文档".

Source path: docs/php/builtins/type/intval.md
Source file to read: .translation/work/docs/php/builtins/type/intval/source.md
Prompt artifact file: .translation/work/docs/php/builtins/type/intval/02-prompt.md
Final output file to write: .translation/work/docs/php/builtins/type/intval/translation.md

Project translation preferences from .baoyu-skills/baoyu-translate/EXTEND.md:

# baoyu-translate Preferences

target_language: zh-CN
default_mode: normal
audience: technical
style: technical
chunk_threshold: 4000
chunk_max_words: 5000
glossary_files:
  - ../../.translation/glossary.md

## Project Notes

- Translate for Chinese-speaking developers.
- Preserve Markdown structure, code blocks, CLI flags, PHP symbols, Rust module names, paths, URLs, and frontmatter keys.
- Keep `elephc`, `EIR`, `FFI`, `extern`, `buffer<T>`, `packed class`, and PHP API names unchanged unless the glossary says otherwise.
- Use refined mode for landing, getting-started, showcase, and architecture pages.
- Use normal mode for general documentation.
- Use quick or template-guided translation for repetitive builtins reference pages.


Project glossary from .translation/glossary.md:

# elephc 中文文档术语表

| from | to | note |
| --- | --- | --- |
| native binary | 原生二进制文件 | 首次出现可写作“原生二进制文件（native binary）” |
| compiler | 编译器 |  |
| assembly | 汇编 |  |
| runtime | 运行时 |  |
| target | 目标平台 | 指编译目标时使用 |
| source map | 源码映射 |  |
| static subset | 静态子集 |  |
| FFI | FFI | 保留英文 |
| extern | extern | 保留英文 |
| pointer | 指针 |  |
| buffer | buffer / 缓冲区 | 泛型形式 `buffer<T>` 保留 |
| packed class | packed class / 紧凑类 | 特性名保留英文 |
| Fiber | Fiber / 协程 | PHP 类型名保留 `Fiber` |
| EIR | EIR | 保留英文缩写 |
| codegen | 代码生成 | 文件名或模块名中保留英文 |
| type checker | 类型检查器 |  |
| AST | AST | 保留英文缩写 |
| CLI | CLI | 保留英文缩写 |
| submodule | submodule / 子模块 | Git 语境可写“子模块” |


Follow this workflow, based on the baoyu-translate normal/refined translation style:

1. Read the source Markdown file.
2. Translate the document into Simplified Chinese for Chinese-speaking developers.
3. Preserve Markdown structure, headings, tables, links, images, HTML, frontmatter keys, comments, admonitions, and all code fences.
4. Do not translate code blocks, inline code identifiers, CLI flags, file paths, URLs, PHP symbols, Rust module names, or API names.
5. Keep technical names such as elephc, EIR, FFI, extern, buffer<T>, packed class, Homebrew, GitHub Releases, PHP, Rust, LLVM, WebAssembly unchanged unless the glossary says otherwise.
6. Frontmatter may keep keys unchanged; translate human-facing values when appropriate.
7. Produce natural technical Chinese. Avoid marketing tone and avoid adding content not present in the source.
8. Write only the final translated Markdown to .translation/work/docs/php/builtins/type/intval/translation.md. Do not wrap it in commentary or a Markdown code fence.

After writing .translation/work/docs/php/builtins/type/intval/translation.md, reply with a concise one-line status.