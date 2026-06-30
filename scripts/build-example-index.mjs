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

function markdownTableCell(value) {
  return String(value).replace(/\s+/g, " ").replace(/\|/g, "\\|").trim();
}

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
  .map((entry) => {
    const content = `${entry.hasReadme ? "README" : ""}${entry.hasReadme && entry.hasMain ? " + " : ""}${entry.hasMain ? "main.php" : ""}`;
    return `| \`${markdownTableCell(entry.slug)}\` | ${markdownTableCell(entry.title)} | ${markdownTableCell(entry.summary)} | ${markdownTableCell(content)} |`;
  })
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
