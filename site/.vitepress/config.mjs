import { sidebar } from "./sidebar.generated.mjs";

export default {
  title: "elephc 中文文档",
  description: "elephc PHP-to-native 编译器中文文档",
  lang: "zh-CN",
  cleanUrls: true,
  ignoreDeadLinks: false,
  themeConfig: {
    logo: "https://raw.githubusercontent.com/illegalstudio/elephc/main/assets/logo-mark.png",
    nav: [
      { text: "首页", link: "/" },
      { text: "文档", link: "/docs/" },
      { text: "案例", link: "/showcases/" },
      { text: "示例", link: "/examples/" },
      { text: "授权", link: "/legal" },
      { text: "上游", link: "https://github.com/illegalstudio/elephc" }
    ],
    sidebar,
    search: {
      provider: "local"
    },
    footer: {
      message: "中文内容基于 illegalstudio/elephc 文档翻译和整理。",
      copyright: "Original elephc content belongs to its upstream authors and contributors."
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/illegalstudio/elephc" }
    ]
  }
};
