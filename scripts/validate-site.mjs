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
