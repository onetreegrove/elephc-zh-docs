import path from "node:path";

const allowedSourcePrefixes = ["docs/", "showcases/", "examples/"];

export function countCodeFences(markdown) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => line.trimStart().startsWith("```")).length;
}

export function targetPathForSource(sourcePath) {
  assertSupportedSourcePath(sourcePath);
  return path.posix.join("content", sourcePath);
}

export function workDirForSource(sourcePath) {
  assertSupportedSourcePath(sourcePath);
  const parsed = path.posix.parse(sourcePath);
  return path.posix.join(".translation/work", parsed.dir, parsed.name);
}

export function assertAllowedOutputPath(repoRoot, filePath) {
  const relative = path.relative(repoRoot, filePath);

  if (
    relative &&
    !relative.startsWith("..") &&
    !path.isAbsolute(relative) &&
    (relative === "content" ||
      relative.startsWith(`content${path.sep}`) ||
      relative === path.join(".translation", "work") ||
      relative.startsWith(path.join(".translation", "work", path.sep)))
  ) {
    return;
  }

  throw new Error(`Refusing to write outside allowed translation outputs: ${filePath}`);
}

export function markManifestEntryTranslated(manifest, sourcePath, translatedAt) {
  const entry = manifest.files.find((file) => file.sourcePath === sourcePath);

  if (!entry) {
    throw new Error(`Manifest entry not found for ${sourcePath}`);
  }

  entry.status = "translated";
  entry.translatedAt = translatedAt;
  entry.targetPath = targetPathForSource(sourcePath);
}

function assertSupportedSourcePath(sourcePath) {
  if (
    !sourcePath.endsWith(".md") ||
    sourcePath.includes("..") ||
    path.posix.isAbsolute(sourcePath) ||
    !allowedSourcePrefixes.some((prefix) => sourcePath.startsWith(prefix))
  ) {
    throw new Error(`Unsupported translation source path: ${sourcePath}`);
  }
}
