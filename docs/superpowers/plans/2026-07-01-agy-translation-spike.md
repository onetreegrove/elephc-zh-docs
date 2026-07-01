# agy Translation Spike Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove that `agy --print` can translate a small batch of upstream Markdown files into `content/`, preserve translation work artifacts, update `.translation/manifest.json`, and keep the VitePress site buildable.

**Architecture:** Add a local Node.js orchestrator that selects pending manifest entries, materializes source/prompt/work files, invokes `agy --add-dir <repo> --print ... --dangerously-skip-permissions`, validates the translation output, writes content files, and marks manifest entries translated. Keep the first run limited to two hand-picked files.

**Tech Stack:** Node.js ESM, built-in `node:test`, `agy` CLI non-interactive print mode, VitePress.

---

## Scope

Translate exactly these first two files during the spike:

- `docs/getting-started/installation.md`
- `showcases/doom/README.md`

Do not attempt full batch translation in this spike.

## Task 1: Add Testable Translation Helpers

**Files:**
- Create: `scripts/lib/translation.mjs`
- Create: `scripts/lib/translation.test.mjs`
- Modify: `package.json`

Steps:

1. Add an npm script:
   - `"test": "node --test scripts/**/*.test.mjs"`
2. Write failing tests in `scripts/lib/translation.test.mjs` for:
   - code fence counting
   - target path mapping for docs and showcases
   - allowed write path guard
   - manifest translated update
3. Run `npm test` and verify it fails because `scripts/lib/translation.mjs` does not exist.
4. Implement `scripts/lib/translation.mjs` with:
   - `countCodeFences(markdown)`
   - `targetPathForSource(sourcePath)`
   - `workDirForSource(sourcePath)`
   - `assertAllowedOutputPath(repoRoot, filePath)`
   - `markManifestEntryTranslated(manifest, sourcePath, translatedAt)`
5. Run `npm test`.
6. Commit with message `test: add translation helper tests`.

## Task 2: Add agy Translation Orchestrator

**Files:**
- Create: `scripts/translate-with-agy.mjs`
- Modify: `package.json`

Steps:

1. Add npm script:
   - `"translate:agy": "node scripts/translate-with-agy.mjs"`
2. Implement CLI options:
   - `--source <sourcePath>` repeatable
   - `--limit <n>` default `1`
   - `--dry-run`
   - `--timeout <duration>` default `10m`
3. Implement source selection:
   - if `--source` exists, translate those paths in that order
   - otherwise pick pending entries from manifest up to `--limit`
4. For each source:
   - read `elephc-src/<sourcePath>`
   - write `.translation/work/<source-without-md>/source.md`
   - write `.translation/work/<source-without-md>/02-prompt.md`
   - call `agy --add-dir <repo> --print <prompt> --print-timeout <timeout> --dangerously-skip-permissions`
   - require output file `.translation/work/<...>/translation.md`
   - validate code fence count matches source
   - copy translation to mapped `content/...`
   - mark manifest entry translated
5. In `--dry-run`, print selected sources and do not call agy or write manifest.
6. Run `npm run translate:agy -- --source docs/getting-started/installation.md --dry-run`.
7. Commit with message `feat: add agy translation orchestrator`.

## Task 3: Run Two-File agy Translation Spike

**Files:**
- Create: `content/docs/getting-started/installation.md`
- Create: `content/showcases/doom/README.md`
- Create: `.translation/work/docs/getting-started/installation/*`
- Create: `.translation/work/showcases/doom/README/*`
- Modify: `.translation/manifest.json`

Steps:

1. Run:
   ```bash
   npm run translate:agy -- --source docs/getting-started/installation.md --source showcases/doom/README.md --timeout 10m
   ```
2. Run:
   ```bash
   npm run validate
   npm run build
   ```
3. Inspect generated translations for:
   - Markdown structure
   - code blocks preserved
   - no obvious English body text left in headings/paragraphs except technical terms
4. Commit with message `docs: translate first agy spike documents`.

## Task 4: Spike Report

**Files:**
- Create: `docs/translation/agy-spike-report.md`

Steps:

1. Document:
   - commands run
   - translated files
   - timing/observed behavior
   - quality issues found
   - whether agy is acceptable for Phase 2
   - recommended next batch size and review policy
2. Run:
   ```bash
   npm run validate
   npm run build
   ```
3. Commit with message `docs: add agy translation spike report`.

