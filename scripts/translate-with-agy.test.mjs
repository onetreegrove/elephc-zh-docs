import test from "node:test";
import assert from "node:assert/strict";
import {
  buildAgyArgs,
  parseArgs,
  selectSources
} from "./translate-with-agy.mjs";

test("parseArgs accepts repeated source options and defaults", () => {
  const options = parseArgs([
    "--source",
    "docs/getting-started/installation.md",
    "--source",
    "showcases/doom/README.md"
  ]);

  assert.deepEqual(options.sources, [
    "docs/getting-started/installation.md",
    "showcases/doom/README.md"
  ]);
  assert.equal(options.limit, 1);
  assert.equal(options.timeout, "10m");
  assert.equal(options.model, "Claude Sonnet 4.6 (Thinking)");
  assert.equal(options.dryRun, false);
});

test("selectSources prefers explicit sources over pending manifest limit", () => {
  const manifest = {
    files: [
      { sourcePath: "docs/a.md", status: "pending" },
      { sourcePath: "docs/b.md", status: "pending" }
    ]
  };

  assert.deepEqual(selectSources(manifest, ["showcases/doom/README.md"], 1), [
    "showcases/doom/README.md"
  ]);
});

test("selectSources returns pending manifest entries up to limit", () => {
  const manifest = {
    files: [
      { sourcePath: "docs/a.md", status: "translated" },
      { sourcePath: "docs/b.md", status: "pending" },
      { sourcePath: "docs/c.md", status: "pending" }
    ]
  };

  assert.deepEqual(selectSources(manifest, [], 1), ["docs/b.md"]);
});

test("parseArgs accepts model override", () => {
  const options = parseArgs(["--model", "GPT-OSS 120B (Medium)"]);

  assert.equal(options.model, "GPT-OSS 120B (Medium)");
});

test("buildAgyArgs uses model, project add-dir, print timeout, and skip permissions", () => {
  const args = buildAgyArgs("/repo", "Translate this", "5m", "Claude Sonnet 4.6 (Thinking)");

  assert.deepEqual(args, [
    "--model",
    "Claude Sonnet 4.6 (Thinking)",
    "--add-dir",
    "/repo",
    "--print",
    "Translate this",
    "--print-timeout",
    "5m",
    "--dangerously-skip-permissions"
  ]);
});
