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
