import { writeText } from "./lib/content.mjs";

const sidebar = {
  "/docs/": [
    {
      text: "文档",
      items: [
        { text: "总览", link: "/docs/" },
        { text: "文档概览", link: "/docs/overview" }
      ]
    }
  ],
  "/showcases/": [
    {
      text: "案例展示",
      items: [{ text: "总览", link: "/showcases/" }]
    }
  ],
  "/examples/": [
    {
      text: "示例索引",
      items: [{ text: "总览", link: "/examples/" }]
    }
  ]
};

const output = `export const sidebar = ${JSON.stringify(sidebar, null, 2)};
`;

await writeText("site/.vitepress/sidebar.generated.mjs", output);

console.log("Generated site/.vitepress/sidebar.generated.mjs.");
