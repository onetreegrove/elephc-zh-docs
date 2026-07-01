# agy Translation Spike Report

Date: 2026-07-01

## Scope

This spike tested whether `agy --print` can support the local translation workflow for
the `elephc 中文文档` site.

Translated files:

- `docs/getting-started/installation.md`
- `showcases/doom/README.md`

## Commands

```bash
npm run translate:agy -- --source docs/getting-started/installation.md --dry-run
npm run translate:agy -- --source docs/getting-started/installation.md --source showcases/doom/README.md --timeout 10m
npm test
npm run validate
npm run build
```

## Findings

`agy` is usable for the Phase 2 translation workflow, but not through an `agy agents`
subcommand. The usable integration is a Node.js orchestrator that spawns non-interactive
`agy --print` runs with `--add-dir <repo>`.

The default `agy` model resolved to `Gemini 3.1 Pro (High)` during this run and hit a
quota error. The CLI still exited with status 0 and produced no translation file, so the
orchestrator now passes an explicit model. The verified default is
`Claude Sonnet 4.6 (Thinking)`, with `--model` available for override.

`agy` can write files when called with:

```bash
agy --model "Claude Sonnet 4.6 (Thinking)" --add-dir <repo> --print <prompt> --print-timeout 10m --dangerously-skip-permissions
```

Because `--dangerously-skip-permissions` is required for unattended runs, the local
orchestrator validates every output path before writing or accepting generated files.
Allowed outputs are restricted to `content/` and `.translation/work/`.

## Quality

The generated Chinese was acceptable for a first review pass. It followed the project
translation preferences and produced natural technical Chinese for both files.

One issue appeared in the first DOOM translation: fenced code blocks were translated even
though project rules require code blocks to remain unchanged. The orchestrator now validates
fence counts and restores fenced code blocks from the upstream source before writing the
final `translation.md` and `content/` file.

Verification after the fix:

- Both translated files preserve the same fenced code blocks as their upstream source.
- `npm test` passed.
- `npm run validate` passed.
- `npm run build` passed.

## Recommendation

Use `agy --print` as the Phase 2 translation worker behind the local Node.js orchestrator.

Recommended next batch:

- Start with 5 to 10 files per PR.
- Keep showcase, getting-started, and architecture pages in smaller batches.
- Use larger batches only for repetitive reference pages after review confirms consistent output.

Review policy:

- Automated PRs are allowed.
- A human must review before merge.
- Reviewers should check terminology, headings, tables, code blocks, links, and whether the
  Chinese reads like documentation rather than a literal translation.

Open follow-ups:

- Add retry/fallback behavior when the selected `agy` model fails or produces no output.
- Add a lightweight untranslated-English scan for headings and prose.
- Consider chunking before translating very large Markdown files.
