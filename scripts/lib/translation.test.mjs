import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import {
  assertAllowedOutputPath,
  countCodeFences,
  markManifestEntryTranslated,
  targetPathForSource,
  workDirForSource
} from "./translation.mjs";

test("countCodeFences counts Markdown fence openings", () => {
  const markdown = [
    "# Example",
    "",
    "```php",
    "<?php echo 'ok';",
    "```",
    "",
    "```bash",
    "echo ok",
    "```"
  ].join("\n");

  assert.equal(countCodeFences(markdown), 4);
});

test("targetPathForSource maps supported upstream paths into content", () => {
  assert.equal(
    targetPathForSource("docs/getting-started/installation.md"),
    "content/docs/getting-started/installation.md"
  );
  assert.equal(
    targetPathForSource("showcases/doom/README.md"),
    "content/showcases/doom/README.md"
  );
});

test("workDirForSource maps markdown source to translation work directory", () => {
  assert.equal(
    workDirForSource("docs/getting-started/installation.md"),
    ".translation/work/docs/getting-started/installation"
  );
  assert.equal(
    workDirForSource("showcases/doom/README.md"),
    ".translation/work/showcases/doom/README"
  );
});

test("assertAllowedOutputPath allows only content and translation work paths", () => {
  const root = "/repo";

  assert.doesNotThrow(() =>
    assertAllowedOutputPath(root, path.join(root, "content/docs/page.md"))
  );
  assert.doesNotThrow(() =>
    assertAllowedOutputPath(root, path.join(root, ".translation/work/docs/page/translation.md"))
  );
  assert.throws(
    () => assertAllowedOutputPath(root, path.join(root, "README.md")),
    /Refusing to write outside allowed translation outputs/
  );
});

test("markManifestEntryTranslated updates the matching entry", () => {
  const manifest = {
    files: [
      {
        sourcePath: "docs/getting-started/installation.md",
        targetPath: "content/docs/getting-started/installation.md",
        translatedAt: "",
        status: "pending"
      }
    ]
  };

  markManifestEntryTranslated(
    manifest,
    "docs/getting-started/installation.md",
    "2026-07-01T00:00:00.000Z"
  );

  assert.equal(manifest.files[0].status, "translated");
  assert.equal(manifest.files[0].translatedAt, "2026-07-01T00:00:00.000Z");
});

