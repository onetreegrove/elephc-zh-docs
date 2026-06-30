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
