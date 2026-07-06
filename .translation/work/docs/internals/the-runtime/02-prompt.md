# Translation instructions

Target: Simplified Chinese for `elephc 中文文档`.

Audience: Chinese-speaking developers reading compiler/runtime internals.

Style: technical, concise, documentation-like. Prefer natural Chinese explanations over literal English word order, while preserving the source facts and structure.

Rules:

- Preserve Markdown heading levels, tables, lists, links, emphasis, and code fences.
- Do not translate code blocks.
- Do not translate inline identifiers, PHP/Rust symbols, runtime routine names, register names, file paths, URLs, CLI flags, ABI names, or API names.
- Keep `elephc`, `EIR`, `FFI`, `extern`, `buffer<T>`, `packed class`, `Fiber`, `Mixed`, `stdClass`, `Generator`, and `__rt_*` symbols unchanged.
- Translate human-facing table headers and descriptions.
- Use glossary terms consistently: runtime = 运行时, compiler = 编译器, codegen = 代码生成, source map = 源码映射, pointer = 指针, heap = 堆, buffer = 缓冲区, type checker = 类型检查器.
- Frontmatter keys and `sidebar` order must remain unchanged; translate only human-facing `title` and `description` values.
