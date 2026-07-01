import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  MANIFEST_PATH,
  ROOT,
  UPSTREAM_DIR,
  ensureDir,
  pathExists,
  readJson,
  readText,
  writeJson,
  writeText
} from "./lib/content.mjs";
import {
  assertAllowedOutputPath,
  countCodeFences,
  markManifestEntryTranslated,
  restoreCodeFences,
  targetPathForSource,
  workDirForSource
} from "./lib/translation.mjs";

const DEFAULT_TIMEOUT = "10m";
const DEFAULT_MODEL = "Claude Sonnet 4.6 (Thinking)";
const PREFERENCES_PATH = path.join(ROOT, ".baoyu-skills", "baoyu-translate", "EXTEND.md");
const GLOSSARY_PATH = path.join(ROOT, ".translation", "glossary.md");

export function parseArgs(argv) {
  const options = {
    sources: [],
    limit: 1,
    timeout: DEFAULT_TIMEOUT,
    model: DEFAULT_MODEL,
    dryRun: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--source") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--source requires a source path");
      }
      options.sources.push(value);
      index += 1;
    } else if (arg === "--limit") {
      const value = Number.parseInt(argv[index + 1], 10);
      if (!Number.isInteger(value) || value < 1) {
        throw new Error("--limit requires a positive integer");
      }
      options.limit = value;
      index += 1;
    } else if (arg === "--timeout") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--timeout requires a duration");
      }
      options.timeout = value;
      index += 1;
    } else if (arg === "--model") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--model requires a model label");
      }
      options.model = value;
      index += 1;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

export function selectSources(manifest, explicitSources, limit) {
  if (explicitSources.length > 0) {
    return explicitSources;
  }

  return manifest.files
    .filter((file) => file.status === "pending")
    .slice(0, limit)
    .map((file) => file.sourcePath);
}

export function buildAgyArgs(repoRoot, prompt, timeout, model) {
  return [
    "--model",
    model,
    "--add-dir",
    repoRoot,
    "--print",
    prompt,
    "--print-timeout",
    timeout,
    "--dangerously-skip-permissions"
  ];
}

export function buildTranslationPrompt({
  sourcePath,
  sourceFile,
  outputFile,
  promptFile,
  preferences,
  glossary
}) {
  const preferenceBlock = preferences
    ? `\nProject translation preferences from .baoyu-skills/baoyu-translate/EXTEND.md:\n\n${preferences}\n`
    : "";
  const glossaryBlock = glossary ? `\nProject glossary from .translation/glossary.md:\n\n${glossary}\n` : "";

  return `You are translating elephc upstream documentation into Simplified Chinese for the local site "elephc 中文文档".

Source path: ${sourcePath}
Source file to read: ${sourceFile}
Prompt artifact file: ${promptFile}
Final output file to write: ${outputFile}
${preferenceBlock}${glossaryBlock}
Follow this workflow, based on the baoyu-translate normal/refined translation style:

1. Read the source Markdown file.
2. Translate the document into Simplified Chinese for Chinese-speaking developers.
3. Preserve Markdown structure, headings, tables, links, images, HTML, frontmatter keys, comments, admonitions, and all code fences.
4. Do not translate code blocks, inline code identifiers, CLI flags, file paths, URLs, PHP symbols, Rust module names, or API names.
5. Keep technical names such as elephc, EIR, FFI, extern, buffer<T>, packed class, Homebrew, GitHub Releases, PHP, Rust, LLVM, WebAssembly unchanged unless the glossary says otherwise.
6. Frontmatter may keep keys unchanged; translate human-facing values when appropriate.
7. Produce natural technical Chinese. Avoid marketing tone and avoid adding content not present in the source.
8. Write only the final translated Markdown to ${outputFile}. Do not wrap it in commentary or a Markdown code fence.

After writing ${outputFile}, reply with a concise one-line status.`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const manifest = await readJson(MANIFEST_PATH, null);
  if (!manifest) {
    throw new Error(`Manifest not found: ${MANIFEST_PATH}`);
  }

  const sources = selectSources(manifest, options.sources, options.limit);
  if (sources.length === 0) {
    console.log("No sources selected.");
    return;
  }

  console.log(`Selected ${sources.length} source(s):`);
  for (const sourcePath of sources) {
    console.log(`- ${sourcePath}`);
  }

  if (options.dryRun) {
    console.log("Dry run: no files written and agy was not called.");
    return;
  }

  for (const sourcePath of sources) {
    await translateOne({ manifest, sourcePath, timeout: options.timeout, model: options.model });
  }

  await writeJson(MANIFEST_PATH, manifest);
  console.log(`Updated manifest: ${path.relative(ROOT, MANIFEST_PATH)}`);
}

async function translateOne({ manifest, sourcePath, timeout, model }) {
  const sourceFile = path.join(UPSTREAM_DIR, sourcePath);
  const source = await readText(sourceFile);
  const workDir = path.join(ROOT, workDirForSource(sourcePath));
  const sourceArtifact = path.join(workDir, "source.md");
  const promptArtifact = path.join(workDir, "02-prompt.md");
  const translationArtifact = path.join(workDir, "translation.md");
  const targetFile = path.join(ROOT, targetPathForSource(sourcePath));

  for (const filePath of [sourceArtifact, promptArtifact, translationArtifact, targetFile]) {
    assertAllowedOutputPath(ROOT, filePath);
  }

  await ensureDir(workDir);
  await writeText(sourceArtifact, source);

  const [preferences, glossary] = await Promise.all([
    readOptionalText(PREFERENCES_PATH),
    readOptionalText(GLOSSARY_PATH)
  ]);
  const prompt = buildTranslationPrompt({
    sourcePath,
    sourceFile: path.relative(ROOT, sourceArtifact),
    outputFile: path.relative(ROOT, translationArtifact),
    promptFile: path.relative(ROOT, promptArtifact),
    preferences,
    glossary
  });
  await writeText(promptArtifact, prompt);

  console.log(`Translating ${sourcePath} with agy...`);
  await runAgy(prompt, timeout, model);

  if (!(await pathExists(translationArtifact))) {
    throw new Error(`agy did not create expected translation file: ${translationArtifact}`);
  }

  const translation = await readText(translationArtifact);
  const sourceFenceCount = countCodeFences(source);
  const translationFenceCount = countCodeFences(translation);
  if (sourceFenceCount !== translationFenceCount) {
    throw new Error(
      `Code fence count mismatch for ${sourcePath}: source=${sourceFenceCount}, translation=${translationFenceCount}`
    );
  }

  const finalTranslation = restoreCodeFences(source, translation);
  await writeText(translationArtifact, finalTranslation);
  await writeText(targetFile, finalTranslation);
  markManifestEntryTranslated(manifest, sourcePath, new Date().toISOString());
  console.log(`Wrote ${path.relative(ROOT, targetFile)}`);
}

async function readOptionalText(filePath) {
  if (!(await pathExists(filePath))) {
    return "";
  }
  return readText(filePath);
}

function runAgy(prompt, timeout, model) {
  return new Promise((resolve, reject) => {
    const child = spawn("agy", buildAgyArgs(ROOT, prompt, timeout, model), {
      cwd: ROOT,
      stdio: "inherit"
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`agy exited with code ${code}`));
      }
    });
  });
}

const executedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (executedDirectly) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
