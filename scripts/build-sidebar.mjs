import path from "node:path";
import { extractTitle, readText, titleFromSlug, walkFiles, writeText } from "./lib/content.mjs";

const sections = [
  { root: "docs", label: "文档" },
  { root: "showcases", label: "案例展示" },
  { root: "examples", label: "示例" }
];

function routeForContentPath(filePath) {
  const relative = filePath.split(path.sep).join("/").replace(/^content\//, "");
  if (relative.endsWith("/README.md")) {
    return `/${relative.replace(/README\.md$/, "")}`;
  }
  return `/${relative.replace(/\.md$/, "")}`;
}

function insertPath(node, segments, item) {
  if (segments.length === 0) {
    node.index = item;
    return;
  }

  const [segment, ...rest] = segments;
  if (!node.children.has(segment)) {
    node.children.set(segment, { children: new Map(), index: null });
  }
  insertPath(node.children.get(segment), rest, item);
}

function renderNode(name, node) {
  const children = [...node.children.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([childName, childNode]) => renderNode(childName, childNode));

  if (children.length === 0) {
    return node.index;
  }

  const rendered = {
    text: node.index?.text ?? titleFromSlug(name),
    collapsed: true,
    items: children
  };

  if (node.index?.link) {
    rendered.link = node.index.link;
  }

  return rendered;
}

async function buildSection({ root, label }) {
  const tree = { children: new Map(), index: null };
  const files = await walkFiles(path.join("content", root), (filePath) => filePath.endsWith(".md"));

  for (const filePath of files) {
    const markdown = await readText(filePath);
    const route = routeForContentPath(filePath);
    const relative = filePath.split(path.sep).join("/").replace(`content/${root}/`, "");
    const segments = relative === "README.md" ? [] : relative.replace(/\.md$/, "").split("/");
    const normalizedSegments = segments.at(-1) === "README" ? segments.slice(0, -1) : segments;
    const slug = normalizedSegments.at(-1) ?? root;
    const item = {
      text: extractTitle(markdown, titleFromSlug(slug)),
      link: route
    };

    insertPath(tree, normalizedSegments, item);
  }

  const items = [];
  if (tree.index) {
    items.push({ text: "总览", link: tree.index.link });
  }
  items.push(
    ...[...tree.children.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, node]) => renderNode(name, node))
  );

  return {
    text: label,
    items
  };
}

const sidebar = {};

for (const section of sections) {
  sidebar[`/${section.root}/`] = [await buildSection(section)];
}

const output = `export const sidebar = ${JSON.stringify(sidebar, null, 2)};
`;

await writeText("site/.vitepress/sidebar.generated.mjs", output);

console.log("Generated site/.vitepress/sidebar.generated.mjs.");
