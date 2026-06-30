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

function paragraphText(value) {
  const text = String(value).replace(/\s+/g, " ").trim();
  return text.replace(/^([#>*+\-|])/u, "\\$1").replace(/^(\d+)\./u, "$1\\.");
}

function firstParagraph(markdown) {
  return markdown
    .replace(/^---[\s\S]*?---\n/, "")
    .split(/\n\s*\n/)
    .map((value) => value.trim())
    .find((value) => value && !value.startsWith("#") && !value.startsWith("```"));
}

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
    const paragraph = firstParagraph(markdown);
    if (paragraph) {
      summary = paragraphText(paragraph);
    }
  }

  entries.push({ slug, title, summary: paragraphText(summary), hasReadme });
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
