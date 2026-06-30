# elephc 中文文档 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first usable MVP for “elephc 中文文档”: upstream submodule, VitePress site skeleton, translation configuration, source scanning manifest, generated navigation/index pages, and baseline validation.

**Architecture:** Keep the upstream project in `elephc-src` as a git submodule. Store authored Chinese site content in `content/`, operational translation state in `.translation/`, reusable scripts in `scripts/`, and the VitePress app in `site/`. MVP automation reads from the submodule, writes deterministic JSON/Markdown outputs, and avoids invoking live translation APIs until the translation provider and budget are confirmed.

**Tech Stack:** Git submodules, Node.js ESM scripts, VitePress, Markdown, JSON manifest files, `$baoyu-translate`-style translation configuration.

---

## File Structure

- `elephc-src`: git submodule pointing to `https://github.com/illegalstudio/elephc`.
- `.gitmodules`: records the `elephc-src` submodule.
- `package.json`: root npm scripts for site dev/build and automation.
- `site/index.md`: VitePress home page for “elephc 中文文档”.
- `site/docs/index.md`: documentation landing page.
- `site/showcases/index.md`: generated showcase index page.
- `site/examples/index.md`: generated examples index page.
- `site/legal.md`: license and upstream attribution page.
- `site/.vitepress/config.mjs`: VitePress config, nav, sidebar, search, and site metadata.
- `content/docs/README.md`: first translated/seed documentation page copied into site docs flow.
- `content/showcases/README.md`: generated Chinese showcase overview source.
- `content/examples/README.md`: generated Chinese examples overview source.
- `.baoyu-skills/baoyu-translate/EXTEND.md`: project translation preferences based on `$baoyu-translate`.
- `.translation/glossary.md`: project glossary.
- `.translation/manifest.json`: source file hash and translation status registry.
- `.translation/work/.gitkeep`: preserves the translation work directory.
- `scripts/lib/content.mjs`: shared file walking, hashing, path, and frontmatter helpers.
- `scripts/sync-manifest.mjs`: scans `elephc-src` content and updates `.translation/manifest.json`.
- `scripts/build-example-index.mjs`: scans `elephc-src/examples` and writes `content/examples/README.md` plus `site/examples/index.md`.
- `scripts/build-showcase-index.mjs`: scans `elephc-src/showcases` and writes `content/showcases/README.md` plus `site/showcases/index.md`.
- `scripts/build-sidebar.mjs`: generates VitePress sidebar data from seeded content.
- `scripts/validate-site.mjs`: validates manifest shape, required pages, links, and submodule presence.
- `.gitignore`: ignores build artifacts and dependency directories.

## Task 1: Convert `elephc-src` To A Submodule

**Files:**
- Create: `.gitmodules`
- Modify: git index entry for `elephc-src`
- Verify: `git submodule status`

- [ ] **Step 1: Preserve current local upstream commit**

Run:

```bash
git -C elephc-src rev-parse HEAD
```

Expected: prints a commit hash. Save it in the task notes for comparison.

- [ ] **Step 2: Move the untracked working copy out of the way**

Run:

```bash
mv elephc-src /tmp/elephc-src-before-submodule
```

Expected: `elephc-src` no longer exists in the repository root and `/tmp/elephc-src-before-submodule` exists. This preserves the current untracked clone while freeing the path for a proper submodule.

- [ ] **Step 3: Add the upstream repository as a submodule**

Run:

```bash
git submodule add https://github.com/illegalstudio/elephc.git elephc-src
```

Expected: `.gitmodules` is created and `elephc-src` appears as a gitlink in `git status --short`.

- [ ] **Step 4: Verify submodule status**

Run:

```bash
git submodule status elephc-src
```

Expected: output contains one commit hash followed by `elephc-src`.

- [ ] **Step 5: Verify upstream content is available**

Run:

```bash
test -f elephc-src/docs/README.md && test -d elephc-src/examples && test -d elephc-src/showcases
```

Expected: command exits 0.

- [ ] **Step 6: Commit submodule setup**

Run:

```bash
git add .gitmodules elephc-src
git commit -m "chore: add elephc upstream submodule"
```

Expected: commit succeeds and includes `.gitmodules` plus the `elephc-src` gitlink.

## Task 2: Create Root Project Scripts And Ignore Rules

**Files:**
- Create: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Create `package.json`**

Create `package.json` with this content:

```json
{
  "name": "elephc-zh-docs",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vitepress dev site",
    "build": "vitepress build site",
    "preview": "vitepress preview site",
    "sync": "node scripts/sync-manifest.mjs",
    "build:examples": "node scripts/build-example-index.mjs",
    "build:showcases": "node scripts/build-showcase-index.mjs",
    "build:sidebar": "node scripts/build-sidebar.mjs",
    "validate": "node scripts/validate-site.mjs",
    "prepare:content": "npm run sync && npm run build:examples && npm run build:showcases && npm run build:sidebar"
  },
  "devDependencies": {
    "vitepress": "^1.6.4"
  }
}
```

- [ ] **Step 2: Update `.gitignore`**

Ensure `.gitignore` contains these lines:

```gitignore
node_modules/
site/.vitepress/cache/
site/.vitepress/dist/
.DS_Store
```

- [ ] **Step 3: Install dependencies**

Run:

```bash
npm install
```

Expected: `package-lock.json` is created and `npm` exits 0.

- [ ] **Step 4: Verify scripts are registered**

Run:

```bash
npm run
```

Expected: output lists `dev`, `build`, `preview`, `sync`, `build:examples`, `build:showcases`, `build:sidebar`, `validate`, and `prepare:content`.

- [ ] **Step 5: Commit project script setup**

Run:

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore: initialize docs site tooling"
```

Expected: commit succeeds.

## Task 3: Add Translation Preferences And Glossary

**Files:**
- Create: `.baoyu-skills/baoyu-translate/EXTEND.md`
- Create: `.translation/glossary.md`
- Create: `.translation/work/.gitkeep`
- Create: `.translation/manifest.json`

- [ ] **Step 1: Create translation preference directory**

Run:

```bash
mkdir -p .baoyu-skills/baoyu-translate .translation/work
```

Expected: directories exist.

- [ ] **Step 2: Create `.baoyu-skills/baoyu-translate/EXTEND.md`**

Create `.baoyu-skills/baoyu-translate/EXTEND.md` with this content:

```markdown
# baoyu-translate Preferences

target_language: zh-CN
default_mode: normal
audience: technical
style: technical
chunk_threshold: 4000
chunk_max_words: 5000

## Project Notes

- Translate for Chinese-speaking developers.
- Preserve Markdown structure, code blocks, CLI flags, PHP symbols, Rust module names, paths, URLs, and frontmatter keys.
- Keep `elephc`, `EIR`, `FFI`, `extern`, `buffer<T>`, `packed class`, and PHP API names unchanged unless the glossary says otherwise.
- Use refined mode for landing, getting-started, showcase, and architecture pages.
- Use normal mode for general documentation.
- Use quick or template-guided translation for repetitive builtins reference pages.

## Glossary Files

- ../../../.translation/glossary.md
```

- [ ] **Step 3: Create `.translation/glossary.md`**

Create `.translation/glossary.md` with this content:

```markdown
# elephc 中文文档术语表

| English | 中文建议 | Notes |
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
```

- [ ] **Step 4: Create `.translation/manifest.json`**

Create `.translation/manifest.json` with this content:

```json
{
  "schemaVersion": 1,
  "upstream": {
    "repo": "https://github.com/illegalstudio/elephc",
    "branch": "main",
    "commit": "",
    "submodulePath": "elephc-src"
  },
  "generatedAt": "",
  "files": []
}
```

- [ ] **Step 5: Preserve translation work directory**

Run:

```bash
touch .translation/work/.gitkeep
```

Expected: `.translation/work/.gitkeep` exists.

- [ ] **Step 6: Commit translation configuration**

Run:

```bash
git add .baoyu-skills/baoyu-translate/EXTEND.md .translation/glossary.md .translation/manifest.json .translation/work/.gitkeep
git commit -m "chore: add translation preferences and glossary"
```

Expected: commit succeeds.

## Task 4: Build Shared Content Script Utilities

**Files:**
- Create: `scripts/lib/content.mjs`

- [ ] **Step 1: Create script directory**

Run:

```bash
mkdir -p scripts/lib
```

Expected: `scripts/lib` exists.

- [ ] **Step 2: Create `scripts/lib/content.mjs`**

Create `scripts/lib/content.mjs` with this content:

```js
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export const ROOT = process.cwd();
export const UPSTREAM_DIR = path.join(ROOT, "elephc-src");
export const MANIFEST_PATH = path.join(ROOT, ".translation", "manifest.json");

export async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function readText(filePath) {
  return fs.readFile(filePath, "utf8");
}

export async function writeText(filePath, value) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, value, "utf8");
}

export async function readJson(filePath, fallback) {
  if (!(await pathExists(filePath))) {
    return fallback;
  }
  return JSON.parse(await readText(filePath));
}

export async function writeJson(filePath, value) {
  await writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function sha256(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

export function toPosix(value) {
  return value.split(path.sep).join("/");
}

export async function walkFiles(dirPath, predicate = () => true) {
  const results = [];
  if (!(await pathExists(dirPath))) {
    return results;
  }
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walkFiles(fullPath, predicate)));
    } else if (entry.isFile() && predicate(fullPath)) {
      results.push(fullPath);
    }
  }
  return results.sort((a, b) => a.localeCompare(b));
}

export function extractTitle(markdown, fallback) {
  const frontmatterTitle = markdown.match(/^---\n[\s\S]*?\ntitle:\s*["']?(.+?)["']?\n[\s\S]*?\n---/m);
  if (frontmatterTitle) {
    return frontmatterTitle[1].trim();
  }
  const heading = markdown.match(/^#\s+(.+)$/m);
  if (heading) {
    return heading[1].trim();
  }
  return fallback;
}

export function titleFromSlug(slug) {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (value) => value.toUpperCase());
}

export function sourceUrl(commit, sourcePath) {
  const ref = commit || "main";
  return `https://github.com/illegalstudio/elephc/blob/${ref}/${sourcePath}`;
}
```

- [ ] **Step 3: Verify utility module imports**

Run:

```bash
node -e "import('./scripts/lib/content.mjs').then((m) => console.log(Boolean(m.sha256('x'))))"
```

Expected: prints `true`.

- [ ] **Step 4: Commit shared utilities**

Run:

```bash
git add scripts/lib/content.mjs
git commit -m "chore: add content script utilities"
```

Expected: commit succeeds.

## Task 5: Implement Manifest Sync

**Files:**
- Create: `scripts/sync-manifest.mjs`
- Modify: `.translation/manifest.json`

- [ ] **Step 1: Create `scripts/sync-manifest.mjs`**

Create `scripts/sync-manifest.mjs` with this content:

```js
import { execFileSync } from "node:child_process";
import path from "node:path";
import {
  MANIFEST_PATH,
  ROOT,
  UPSTREAM_DIR,
  readJson,
  readText,
  sha256,
  toPosix,
  walkFiles,
  writeJson
} from "./lib/content.mjs";

const SOURCE_ROOTS = ["docs", "showcases", "examples"];

function upstreamCommit() {
  return execFileSync("git", ["-C", UPSTREAM_DIR, "rev-parse", "HEAD"], {
    encoding: "utf8"
  }).trim();
}

function isTrackedSource(filePath) {
  return filePath.endsWith(".md");
}

function targetPathFor(sourcePath) {
  if (sourcePath === "docs/README.md") {
    return "content/docs/README.md";
  }
  if (sourcePath.startsWith("docs/")) {
    return `content/${sourcePath}`;
  }
  if (sourcePath.startsWith("showcases/")) {
    return `content/${sourcePath}`;
  }
  if (sourcePath.startsWith("examples/")) {
    return `content/${sourcePath}`;
  }
  return `content/${sourcePath}`;
}

function modeFor(sourcePath) {
  if (
    sourcePath === "docs/README.md" ||
    sourcePath.startsWith("docs/getting-started/") ||
    sourcePath.startsWith("docs/compiling/") ||
    sourcePath.startsWith("docs/beyond-php/") ||
    sourcePath.startsWith("docs/how-to/") ||
    sourcePath === "showcases/http-server/README.md" ||
    sourcePath === "showcases/doom/README.md"
  ) {
    return "refined";
  }
  if (sourcePath.startsWith("docs/php/builtins/")) {
    return "quick";
  }
  return "normal";
}

function workDirFor(sourcePath) {
  return `.translation/work/${sourcePath.replace(/\.md$/, "")}`;
}

const existing = await readJson(MANIFEST_PATH, {
  schemaVersion: 1,
  upstream: {
    repo: "https://github.com/illegalstudio/elephc",
    branch: "main",
    commit: "",
    submodulePath: "elephc-src"
  },
  generatedAt: "",
  files: []
});

const existingBySource = new Map(existing.files.map((file) => [file.sourcePath, file]));
const commit = upstreamCommit();
const files = [];

for (const root of SOURCE_ROOTS) {
  const rootPath = path.join(UPSTREAM_DIR, root);
  const sourceFiles = await walkFiles(rootPath, isTrackedSource);
  for (const fullPath of sourceFiles) {
    const sourcePath = toPosix(path.relative(UPSTREAM_DIR, fullPath));
    const sourceText = await readText(fullPath);
    const sourceHash = sha256(sourceText);
    const previous = existingBySource.get(sourcePath);
    const status =
      previous && previous.sourceHash === sourceHash && previous.status === "translated"
        ? "translated"
        : "pending";

    files.push({
      sourcePath,
      targetPath: targetPathFor(sourcePath),
      sourceHash,
      translatedAt: status === "translated" ? previous.translatedAt : "",
      translationMode: modeFor(sourcePath),
      workDir: workDirFor(sourcePath),
      status
    });
  }
}

const next = {
  schemaVersion: 1,
  upstream: {
    repo: "https://github.com/illegalstudio/elephc",
    branch: "main",
    commit,
    submodulePath: "elephc-src"
  },
  generatedAt: new Date().toISOString(),
  files
};

await writeJson(MANIFEST_PATH, next);

const pending = files.filter((file) => file.status === "pending").length;
console.log(`Synced ${files.length} markdown sources from ${commit}. Pending: ${pending}.`);
console.log(`Manifest: ${path.relative(ROOT, MANIFEST_PATH)}`);
```

- [ ] **Step 2: Run manifest sync**

Run:

```bash
npm run sync
```

Expected: output starts with `Synced` and `.translation/manifest.json` contains entries from `docs`, `showcases`, and `examples`.

- [ ] **Step 3: Verify manifest contains core files**

Run:

```bash
node -e "const m=require('./.translation/manifest.json'); const paths=m.files.map(f=>f.sourcePath); for (const p of ['docs/README.md','showcases/doom/README.md','showcases/http-server/README.md','examples/cdylib/README.md']) { if (!paths.includes(p)) throw new Error(p); } console.log(m.files.length)"
```

Expected: prints a positive number.

- [ ] **Step 4: Commit manifest sync**

Run:

```bash
git add scripts/sync-manifest.mjs .translation/manifest.json
git commit -m "feat: add upstream manifest sync"
```

Expected: commit succeeds.

## Task 6: Create VitePress Site Skeleton

**Files:**
- Create: `site/index.md`
- Create: `site/docs/index.md`
- Create: `site/showcases/index.md`
- Create: `site/examples/index.md`
- Create: `site/legal.md`
- Create: `site/.vitepress/config.mjs`

- [ ] **Step 1: Create `site/index.md`**

Create `site/index.md` with this content:

```markdown
---
layout: home

hero:
  name: elephc 中文文档
  text: PHP 到原生二进制的中文资料库
  tagline: 跟随上游 elephc 文档，整理安装、编译、语言支持、扩展能力、案例和内部实现。
  actions:
    - theme: brand
      text: 开始阅读
      link: /docs/
    - theme: alt
      text: 查看上游
      link: https://github.com/illegalstudio/elephc

features:
  - title: 快速入门
    details: 从安装、第一段 PHP 程序到生成原生二进制文件。
  - title: 编译与扩展
    details: 理解 CLI、目标平台、FFI、buffer、packed class 和 web 模式。
  - title: 案例与示例
    details: 基于 showcases 和 examples 整理可运行示例与中文导读。
---
```

- [ ] **Step 2: Create `site/docs/index.md`**

Create `site/docs/index.md` with this content:

```markdown
# 文档总览

这里是 elephc 中文文档的入口。MVP 阶段优先整理入门、编译、Beyond PHP、How-To、案例展示和示例索引。

## 优先内容

- [文档概览](./overview)
- [案例展示](/showcases/)
- [示例索引](/examples/)
- [授权与版权](/legal)
```

- [ ] **Step 3: Create `site/showcases/index.md`**

Create `site/showcases/index.md` with this content:

```markdown
# 案例展示

案例索引将在运行 `npm run build:showcases` 后根据上游 `showcases/` 目录生成。
```

- [ ] **Step 4: Create `site/examples/index.md`**

Create `site/examples/index.md` with this content:

```markdown
# 示例索引

示例索引将在运行 `npm run build:examples` 后根据上游 `examples/` 目录生成。
```

- [ ] **Step 5: Create `site/legal.md`**

Create `site/legal.md` with this content:

```markdown
# 授权与版权

elephc 中文文档基于 [illegalstudio/elephc](https://github.com/illegalstudio/elephc) 项目的公开文档翻译和整理。

elephc 项目名称、源码、原始英文文档、图片和示例代码的版权归上游作者或对应贡献者所有。上游项目许可证请以 [`illegalstudio/elephc` 仓库中的 LICENSE](https://github.com/illegalstudio/elephc/blob/main/LICENSE) 为准。

本仓库中的中文翻译、整理脚本和站点配置会在后续确认具体许可证后声明授权方式。在许可证确认前，任何再分发都应同时保留上游来源、上游许可证链接和本页声明。
```

- [ ] **Step 6: Create `site/.vitepress/config.mjs`**

Create `site/.vitepress/config.mjs` with this content:

```js
export default {
  title: "elephc 中文文档",
  description: "elephc PHP-to-native 编译器中文文档",
  lang: "zh-CN",
  cleanUrls: true,
  ignoreDeadLinks: false,
  themeConfig: {
    logo: "https://raw.githubusercontent.com/illegalstudio/elephc/main/assets/logo-mark.png",
    nav: [
      { text: "首页", link: "/" },
      { text: "文档", link: "/docs/" },
      { text: "案例", link: "/showcases/" },
      { text: "示例", link: "/examples/" },
      { text: "授权", link: "/legal" },
      { text: "上游", link: "https://github.com/illegalstudio/elephc" }
    ],
    sidebar: {
      "/docs/": [
        {
          text: "文档",
          items: [{ text: "总览", link: "/docs/" }]
        }
      ],
      "/showcases/": [
        {
          text: "案例展示",
          items: [{ text: "总览", link: "/showcases/" }]
        }
      ],
      "/examples/": [
        {
          text: "示例索引",
          items: [{ text: "总览", link: "/examples/" }]
        }
      ]
    },
    search: {
      provider: "local"
    },
    footer: {
      message: "中文内容基于 illegalstudio/elephc 文档翻译和整理。",
      copyright: "Original elephc content belongs to its upstream authors and contributors."
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/illegalstudio/elephc" }
    ]
  }
};
```

- [ ] **Step 7: Run VitePress build**

Run:

```bash
npm run build
```

Expected: VitePress build exits 0 and writes `site/.vitepress/dist`.

- [ ] **Step 8: Commit site skeleton**

Run:

```bash
git add site/index.md site/docs/index.md site/showcases/index.md site/examples/index.md site/legal.md site/.vitepress/config.mjs
git commit -m "feat: add VitePress site skeleton"
```

Expected: commit succeeds.

## Task 7: Seed First Documentation Content

**Files:**
- Create: `content/docs/README.md`
- Create: `site/docs/overview.md`
- Modify: `.translation/manifest.json`

- [ ] **Step 1: Create `content/docs/README.md`**

Create `content/docs/README.md` with this MVP translation:

```markdown
---
title: "elephc 文档"
description: "PHP 到原生编译器。将 PHP 的静态子集编译为原生汇编，并为支持的目标平台生成独立二进制文件。"
sourcePath: "docs/README.md"
translationMode: "refined"
---

# elephc 文档

elephc 会把 PHP 编译为当前支持目标平台上的原生二进制文件：macOS ARM64、Linux ARM64 和 Linux x86_64。它不依赖解释器、虚拟机或运行时环境。本中文文档覆盖从 PHP 语法支持、编译器扩展到内部架构的核心内容。

## 快速开始

- 安装 elephc
- 编写第一个 PHP 程序
- 编译并运行原生二进制文件
- 理解支持的目标平台和构建依赖

## 主要内容

- 编译流程与 CLI 参数
- PHP 语法和标准库支持范围
- Beyond PHP：指针、buffer、packed class、FFI、条件编译、web server 和 cdylib
- 编译器内部：词法分析、解析器、类型检查器、EIR、代码生成、运行时和内存模型
- 案例展示：HTTP server、DOOM 渲染等

## 来源

本文基于上游 `docs/README.md` 翻译和整理。完整内容会在后续增量翻译流程中持续补齐。
```

- [ ] **Step 2: Create `site/docs/overview.md`**

Create `site/docs/overview.md` with this content:

```markdown
---
title: 文档概览
---

<!-- @include: ../../content/docs/README.md -->
```

- [ ] **Step 3: Mark `docs/README.md` translated in manifest**

Run:

```bash
node -e "const fs=require('fs'); const p='.translation/manifest.json'; const m=JSON.parse(fs.readFileSync(p,'utf8')); const f=m.files.find(x=>x.sourcePath==='docs/README.md'); if(!f) throw new Error('docs/README.md missing'); f.targetPath='content/docs/README.md'; f.translatedAt=new Date().toISOString(); f.translationMode='refined'; f.status='translated'; fs.writeFileSync(p, JSON.stringify(m,null,2)+'\n')"
```

Expected: command exits 0 and manifest entry for `docs/README.md` has `status: "translated"`.

- [ ] **Step 4: Build site**

Run:

```bash
npm run build
```

Expected: build exits 0.

- [ ] **Step 5: Commit seeded docs content**

Run:

```bash
git add content/docs/README.md site/docs/overview.md .translation/manifest.json
git commit -m "docs: seed Chinese documentation overview"
```

Expected: commit succeeds.

## Task 8: Generate Example Index

**Files:**
- Create: `scripts/build-example-index.mjs`
- Create: `content/examples/README.md`
- Create: `site/examples/index.md`

- [ ] **Step 1: Create `scripts/build-example-index.mjs`**

Create `scripts/build-example-index.mjs` with this content:

```js
import path from "node:path";
import { promises as fs } from "node:fs";
import {
  UPSTREAM_DIR,
  extractTitle,
  pathExists,
  readText,
  titleFromSlug,
  writeText
} from "./lib/content.mjs";

const examplesDir = path.join(UPSTREAM_DIR, "examples");
const entries = [];

for (const dirent of await fs.readdir(examplesDir, { withFileTypes: true })) {
  if (!dirent.isDirectory()) {
    continue;
  }
  const slug = dirent.name;
  const dir = path.join(examplesDir, slug);
  const readmePath = path.join(dir, "README.md");
  const mainPath = path.join(dir, "main.php");
  const hasReadme = await pathExists(readmePath);
  const hasMain = await pathExists(mainPath);
  let title = titleFromSlug(slug);
  let summary = "elephc 示例程序，后续会补充中文导读。";

  if (hasReadme) {
    const markdown = await readText(readmePath);
    title = extractTitle(markdown, title);
    const firstParagraph = markdown
      .replace(/^---[\s\S]*?---\n/, "")
      .split(/\n\s*\n/)
      .map((value) => value.trim())
      .find((value) => value && !value.startsWith("#") && !value.startsWith("```"));
    if (firstParagraph) {
      summary = firstParagraph.replace(/\n/g, " ");
    }
  } else if (hasMain) {
    summary = "包含 `main.php` 的 elephc 可运行示例。";
  }

  entries.push({ slug, title, summary, hasReadme, hasMain });
}

entries.sort((a, b) => a.slug.localeCompare(b.slug));

const rows = entries
  .map(
    (entry) =>
      `| \`${entry.slug}\` | ${entry.title} | ${entry.summary} | ${entry.hasReadme ? "README" : ""}${entry.hasReadme && entry.hasMain ? " + " : ""}${entry.hasMain ? "main.php" : ""} |`
  )
  .join("\n");

const markdown = `# 示例索引

本页基于上游 \`examples/\` 目录自动生成。示例代码保持原样，中文文档只提供索引和导读。

| 路径 | 名称 | 说明 | 内容 |
| --- | --- | --- | --- |
${rows}
`;

await writeText("content/examples/README.md", markdown);
await writeText(
  "site/examples/index.md",
  `---
title: 示例索引
---

<!-- @include: ../../content/examples/README.md -->
`
);

console.log(`Generated ${entries.length} example entries.`);
```

- [ ] **Step 2: Run example index generation**

Run:

```bash
npm run build:examples
```

Expected: output starts with `Generated` and writes both target Markdown files.

- [ ] **Step 3: Verify generated example index includes known examples**

Run:

```bash
rg -n "cdylib|web-hello|fibers" content/examples/README.md site/examples/index.md
```

Expected: output includes matches from `content/examples/README.md`.

- [ ] **Step 4: Build site**

Run:

```bash
npm run build
```

Expected: build exits 0.

- [ ] **Step 5: Commit example index generation**

Run:

```bash
git add scripts/build-example-index.mjs content/examples/README.md site/examples/index.md
git commit -m "feat: generate examples index"
```

Expected: commit succeeds.

## Task 9: Generate Showcase Index

**Files:**
- Create: `scripts/build-showcase-index.mjs`
- Create: `content/showcases/README.md`
- Create: `site/showcases/index.md`

- [ ] **Step 1: Create `scripts/build-showcase-index.mjs`**

Create `scripts/build-showcase-index.mjs` with this content:

```js
import path from "node:path";
import { promises as fs } from "node:fs";
import {
  UPSTREAM_DIR,
  extractTitle,
  pathExists,
  readText,
  titleFromSlug,
  writeText
} from "./lib/content.mjs";

const showcasesDir = path.join(UPSTREAM_DIR, "showcases");
const entries = [];

for (const dirent of await fs.readdir(showcasesDir, { withFileTypes: true })) {
  if (!dirent.isDirectory()) {
    continue;
  }
  const slug = dirent.name;
  const dir = path.join(showcasesDir, slug);
  const readmePath = path.join(dir, "README.md");
  const hasReadme = await pathExists(readmePath);
  let title = titleFromSlug(slug);
  let summary = "elephc showcase 项目，后续会补充中文导读。";

  if (hasReadme) {
    const markdown = await readText(readmePath);
    title = extractTitle(markdown, title);
    const firstParagraph = markdown
      .replace(/^---[\s\S]*?---\n/, "")
      .split(/\n\s*\n/)
      .map((value) => value.trim())
      .find((value) => value && !value.startsWith("#") && !value.startsWith("```"));
    if (firstParagraph) {
      summary = firstParagraph.replace(/\n/g, " ");
    }
  }

  entries.push({ slug, title, summary, hasReadme });
}

entries.sort((a, b) => a.slug.localeCompare(b.slug));

const cards = entries
  .map(
    (entry) => `## ${entry.title}

- 上游路径：\`showcases/${entry.slug}/\`
- README：${entry.hasReadme ? "有" : "无"}

${entry.summary}
`
  )
  .join("\n");

const markdown = `# 案例展示

本页基于上游 \`showcases/\` 目录自动生成。重点案例会在后续翻译流程中补充完整中文导读。

${cards}`;

await writeText("content/showcases/README.md", markdown);
await writeText(
  "site/showcases/index.md",
  `---
title: 案例展示
---

<!-- @include: ../../content/showcases/README.md -->
`
);

console.log(`Generated ${entries.length} showcase entries.`);
```

- [ ] **Step 2: Run showcase index generation**

Run:

```bash
npm run build:showcases
```

Expected: output starts with `Generated` and writes both target Markdown files.

- [ ] **Step 3: Verify generated showcase index includes known showcases**

Run:

```bash
rg -n "doom|http-server" content/showcases/README.md site/showcases/index.md
```

Expected: output includes matches from `content/showcases/README.md`.

- [ ] **Step 4: Build site**

Run:

```bash
npm run build
```

Expected: build exits 0.

- [ ] **Step 5: Commit showcase index generation**

Run:

```bash
git add scripts/build-showcase-index.mjs content/showcases/README.md site/showcases/index.md
git commit -m "feat: generate showcases index"
```

Expected: commit succeeds.

## Task 10: Generate Sidebar Data

**Files:**
- Create: `scripts/build-sidebar.mjs`
- Create: `site/.vitepress/sidebar.generated.mjs`
- Modify: `site/.vitepress/config.mjs`

- [ ] **Step 1: Create `scripts/build-sidebar.mjs`**

Create `scripts/build-sidebar.mjs` with this content:

```js
import { writeText } from "./lib/content.mjs";

const sidebar = {
  "/docs/": [
    {
      text: "文档",
      items: [
        { text: "总览", link: "/docs/" },
        { text: "文档概览", link: "/docs/overview" }
      ]
    }
  ],
  "/showcases/": [
    {
      text: "案例展示",
      items: [{ text: "总览", link: "/showcases/" }]
    }
  ],
  "/examples/": [
    {
      text: "示例索引",
      items: [{ text: "总览", link: "/examples/" }]
    }
  ]
};

await writeText(
  "site/.vitepress/sidebar.generated.mjs",
  `export const sidebar = ${JSON.stringify(sidebar, null, 2)};\n`
);

console.log("Generated site/.vitepress/sidebar.generated.mjs");
```

- [ ] **Step 2: Update `site/.vitepress/config.mjs` to import generated sidebar**

Replace the file with this content:

```js
import { sidebar } from "./sidebar.generated.mjs";

export default {
  title: "elephc 中文文档",
  description: "elephc PHP-to-native 编译器中文文档",
  lang: "zh-CN",
  cleanUrls: true,
  ignoreDeadLinks: false,
  themeConfig: {
    logo: "https://raw.githubusercontent.com/illegalstudio/elephc/main/assets/logo-mark.png",
    nav: [
      { text: "首页", link: "/" },
      { text: "文档", link: "/docs/" },
      { text: "案例", link: "/showcases/" },
      { text: "示例", link: "/examples/" },
      { text: "授权", link: "/legal" },
      { text: "上游", link: "https://github.com/illegalstudio/elephc" }
    ],
    sidebar,
    search: {
      provider: "local"
    },
    footer: {
      message: "中文内容基于 illegalstudio/elephc 文档翻译和整理。",
      copyright: "Original elephc content belongs to its upstream authors and contributors."
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/illegalstudio/elephc" }
    ]
  }
};
```

- [ ] **Step 3: Generate sidebar**

Run:

```bash
npm run build:sidebar
```

Expected: `site/.vitepress/sidebar.generated.mjs` is created.

- [ ] **Step 4: Build site**

Run:

```bash
npm run build
```

Expected: build exits 0.

- [ ] **Step 5: Commit sidebar generation**

Run:

```bash
git add scripts/build-sidebar.mjs site/.vitepress/sidebar.generated.mjs site/.vitepress/config.mjs
git commit -m "feat: generate VitePress sidebar"
```

Expected: commit succeeds.

## Task 11: Add Site Validation

**Files:**
- Create: `scripts/validate-site.mjs`

- [ ] **Step 1: Create `scripts/validate-site.mjs`**

Create `scripts/validate-site.mjs` with this content:

```js
import { execFileSync } from "node:child_process";
import path from "node:path";
import {
  MANIFEST_PATH,
  pathExists,
  readJson,
  readText,
  walkFiles
} from "./lib/content.mjs";

const errors = [];

async function requireFile(filePath) {
  if (!(await pathExists(filePath))) {
    errors.push(`Missing required file: ${filePath}`);
  }
}

await requireFile(".gitmodules");
await requireFile("elephc-src/docs/README.md");
await requireFile("site/index.md");
await requireFile("site/docs/index.md");
await requireFile("site/legal.md");
await requireFile(".translation/glossary.md");
await requireFile(".baoyu-skills/baoyu-translate/EXTEND.md");

try {
  const status = execFileSync("git", ["submodule", "status", "elephc-src"], {
    encoding: "utf8"
  }).trim();
  if (!status.includes("elephc-src")) {
    errors.push("elephc-src is not reported by git submodule status.");
  }
} catch (error) {
  errors.push(`Unable to inspect elephc-src submodule: ${error.message}`);
}

const manifest = await readJson(MANIFEST_PATH, null);
if (!manifest) {
  errors.push("Missing .translation/manifest.json");
} else {
  if (manifest.schemaVersion !== 1) {
    errors.push("manifest.schemaVersion must be 1");
  }
  if (manifest.upstream?.submodulePath !== "elephc-src") {
    errors.push("manifest.upstream.submodulePath must be elephc-src");
  }
  if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
    errors.push("manifest.files must contain scanned source files");
  }
}

const markdownFiles = await walkFiles("site", (filePath) => filePath.endsWith(".md"));
for (const filePath of markdownFiles) {
  const markdown = await readText(filePath);
  const relative = path.relative(process.cwd(), filePath);
  const localLinks = [...markdown.matchAll(/\[[^\]]+\]\((?!https?:\/\/|#)([^)]+)\)/g)];
  for (const match of localLinks) {
    const href = match[1].split("#")[0];
    if (!href || href.startsWith("/")) {
      continue;
    }
    if (href.includes("..")) {
      errors.push(`${relative} contains upward relative link: ${href}`);
    }
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("Validation passed.");
```

- [ ] **Step 2: Run validation**

Run:

```bash
npm run validate
```

Expected: prints `Validation passed.`

- [ ] **Step 3: Run full content preparation**

Run:

```bash
npm run prepare:content
```

Expected: sync, examples, showcases, and sidebar scripts all exit 0.

- [ ] **Step 4: Run build**

Run:

```bash
npm run build
```

Expected: build exits 0.

- [ ] **Step 5: Commit validation script**

Run:

```bash
git add scripts/validate-site.mjs .translation/manifest.json content/examples/README.md content/showcases/README.md site/examples/index.md site/showcases/index.md site/.vitepress/sidebar.generated.mjs
git commit -m "test: add site validation"
```

Expected: commit succeeds if generated files changed; if only `scripts/validate-site.mjs` changed, commit that file with the same message.

## Task 12: Update README With Local Workflow

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace `README.md`**

Replace `README.md` with this content:

```markdown
# elephc 中文文档

elephc 中文文档基于 [illegalstudio/elephc](https://github.com/illegalstudio/elephc) 的公开文档翻译和整理，目标是提供可持续同步的中文文档站。

## 本地开发

首次克隆后初始化上游子模块：

```bash
git submodule update --init --recursive
npm install
```

生成内容索引和 manifest：

```bash
npm run prepare:content
```

启动文档站：

```bash
npm run dev
```

构建和校验：

```bash
npm run validate
npm run build
```

## 内容来源

- 上游仓库：<https://github.com/illegalstudio/elephc>
- 上游源码子模块：`elephc-src`
- 中文内容：`content/`
- 站点入口：`site/`
- 翻译状态：`.translation/manifest.json`
- 术语表：`.translation/glossary.md`

## 授权与版权

elephc 项目名称、源码、原始英文文档、图片和示例代码的版权归上游作者或对应贡献者所有。上游许可证请以 [`illegalstudio/elephc` 仓库中的 LICENSE](https://github.com/illegalstudio/elephc/blob/main/LICENSE) 为准。

中文翻译和整理内容的具体许可证待确认。在确认前，再分发时应保留上游来源、许可证链接和本声明。
```

- [ ] **Step 2: Run validation**

Run:

```bash
npm run validate
```

Expected: prints `Validation passed.`

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: build exits 0.

- [ ] **Step 4: Commit README update**

Run:

```bash
git add README.md
git commit -m "docs: document local development workflow"
```

Expected: commit succeeds.

## Task 13: Final MVP Verification

**Files:**
- Verify only.

- [ ] **Step 1: Verify working tree**

Run:

```bash
git status --short --branch
```

Expected: no unexpected tracked changes. Untracked `.agents/` may still exist and should not be committed unless explicitly requested.

- [ ] **Step 2: Run full preparation**

Run:

```bash
npm run prepare:content
```

Expected: all scripts exit 0.

- [ ] **Step 3: Run validation**

Run:

```bash
npm run validate
```

Expected: prints `Validation passed.`

- [ ] **Step 4: Run production build**

Run:

```bash
npm run build
```

Expected: VitePress build exits 0 and writes `site/.vitepress/dist`.

- [ ] **Step 5: Inspect latest commits**

Run:

```bash
git log --oneline -8
```

Expected: recent commits include submodule setup, site tooling, translation configuration, manifest sync, site skeleton, generated indexes, validation, and README workflow.

- [ ] **Step 6: Report MVP status**

Report:

```text
MVP implementation status:
- Submodule: verified by git submodule status
- Site build: npm run build passed
- Validation: npm run validate passed
- Content automation: npm run prepare:content passed
- Remaining PRD items: live translation API integration, CI PR automation, non-GitHub-Pages deployment target, final content license decision
```

## Self-Review

- Spec coverage: This plan covers PRD MVP requirements for VitePress skeleton, `elephc-src` submodule, translation preferences, glossary, manifest sync, examples/showcases index generation, attribution page, local validation, and local build. It intentionally leaves live translation API integration, CI-created PRs, non-GitHub-Pages deployment, and final license selection for later phases because those depend on still-open PRD questions.
- Placeholder scan: No `TBD`, `TODO`, or “implement later” placeholders are used in implementation steps. The README and legal page explicitly state unresolved product decisions as user-facing project status, not implementation placeholders.
- Type consistency: Script file names, npm script names, manifest fields, and generated paths are consistent across tasks.
