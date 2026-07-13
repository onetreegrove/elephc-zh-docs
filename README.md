# elephc 中文文档

elephc 中文文档基于 [illegalstudio/elephc](https://github.com/illegalstudio/elephc) 的公开文档翻译和整理，目标是提供可持续同步的中文文档站。

## 本地开发

首次克隆后初始化上游子模块：

```bash
git submodule update --init --recursive
npm install
```

生成内容索引、站点页面和侧边栏：

```bash
npm run prepare:content
```

启动文档站：

```bash
npm run dev
```

`npm run dev` 会通过 `predev` 自动执行 `prepare:content`。本地访问地址默认是 VitePress 输出的 `http://localhost:5173/`。

构建和校验：

```bash
npm test
npm run validate
npm run build
```

`npm run build` 会通过 `prebuild` 自动执行 `prepare:content`，并将静态站点输出到 `site/.vitepress/dist/`。

## 内容来源

- 上游仓库：<https://github.com/illegalstudio/elephc>
- 上游源码子模块：`elephc-src`
- 中文内容：`content/`
- 站点入口：`site/`
- 站点生成内容：`scripts/sync-site-content.mjs` 会把 `content/` 同步到 `site/` 下供 VitePress 构建；深层同步页属于派生产物，不直接维护。
- 翻译状态：`.translation/manifest.json`
- 术语表：`.translation/glossary.md`

## 自动化翻译

翻译入口：

```bash
npm run translate:agy -- --model "Gemini 3.5 Flash (High)" --timeout 20m --source docs/example.md
```

翻译脚本会：

- 读取 `elephc-src/` 中的上游 Markdown。
- 生成 `.translation/work/<source>/source.md`、`02-prompt.md` 和 `translation.md`。
- 将最终译文写入 `content/<source>`。
- 更新 `.translation/manifest.json`。
- 校验代码围栏数量，并用上游源文件恢复代码块内容。

## 独立服务器部署

当前项目不部署到 GitHub Pages。未来部署到独立服务器时，推荐只发布静态构建产物：

```bash
npm ci
git submodule update --init --recursive
npm run build
rsync -av --delete site/.vitepress/dist/ user@server:/var/www/elephc-zh-docs/
```

Nginx 可以将站点根目录指向 `/var/www/elephc-zh-docs`，并用 `try_files $uri $uri.html $uri/ /404.html;` 支持 VitePress clean URLs。更完整的部署说明见 [docs/deployment.md](docs/deployment.md)。

## 授权与版权

elephc 项目名称、源码、原始英文文档、图片和示例代码的版权归上游作者或对应贡献者所有。上游许可证请以 [`illegalstudio/elephc` 仓库中的 LICENSE](https://github.com/illegalstudio/elephc/blob/main/LICENSE) 为准。

中文翻译和整理内容参考上游项目许可证授权。再分发时应保留上游来源、许可证链接和本声明。
