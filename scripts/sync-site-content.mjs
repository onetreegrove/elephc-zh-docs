import path from "node:path";
import { promises as fs } from "node:fs";
import { ensureDir, readText, UPSTREAM_DIR, walkFiles, writeText } from "./lib/content.mjs";

const roots = ["docs", "examples", "showcases"];
const assetExtensions = new Set([".apng", ".avif", ".gif", ".ico", ".jpg", ".jpeg", ".png", ".svg", ".webp"]);

function sitePathForContentPath(contentPath) {
  const relative = contentPath.split(path.sep).join("/").replace(/^content\//, "");
  if (relative.endsWith("/README.md")) {
    return path.posix.join("site", relative.replace(/README\.md$/, "index.md"));
  }
  return path.posix.join("site", relative);
}

function normalizeFrontmatter(markdown) {
  return markdown.replace(/^---\n([\s\S]*?)\n---/, (_match, frontmatter) => {
    const normalized = frontmatter
      .replace(/\\`/g, "`")
      .replace(/\\\|/g, "|")
      .split("\n")
      .map((line) => {
        const quoted = line.match(/^([A-Za-z][\w-]*):\s*"(.*)"\s*$/);
        if (!quoted) {
          return line;
        }

        const value = quoted[2].replace(/\\"/g, '"');
        return `${quoted[1]}: ${JSON.stringify(value)}`;
      })
      .join("\n");
    return `---\n${normalized}\n---`;
  });
}

function normalizeMarkdownForSite(markdown) {
  return normalizeFrontmatter(markdown).replace(/\[([^\]]+)\]\(\)/g, "$1");
}

let copied = 0;
let copiedAssets = 0;

for (const root of roots) {
  const files = await walkFiles(path.join("content", root), (filePath) => filePath.endsWith(".md"));
  for (const filePath of files) {
    const markdown = normalizeMarkdownForSite(await readText(filePath));
    await writeText(sitePathForContentPath(filePath), markdown);
    copied += 1;
  }
}

for (const root of roots) {
  const files = await walkFiles(path.join(UPSTREAM_DIR, root), (filePath) =>
    assetExtensions.has(path.extname(filePath).toLowerCase())
  );
  for (const filePath of files) {
    const relative = path.relative(UPSTREAM_DIR, filePath).split(path.sep).join("/");
    const targetPath = path.posix.join("site", relative);
    await ensureDir(path.dirname(targetPath));
    await fs.copyFile(filePath, targetPath);
    copiedAssets += 1;
  }
}

console.log(`Synced ${copied} content markdown files and ${copiedAssets} assets into site/.`);
