# elephc 中文文档

elephc 中文文档基于 [illegalstudio/elephc](https://github.com/illegalstudio/elephc) 的公开文档翻译和整理，目标是提供可持续同步的中文文档站。

## 本地开发

首次克隆后初始化上游子模块：

```bash
git submodule update --init --recursive
npm install
```

生成内容索引和 manifest：

```bash
npm run prepare:content
```

启动文档站：

```bash
npm run dev
```

构建和校验：

```bash
npm run validate
npm run build
```

## 内容来源

- 上游仓库：<https://github.com/illegalstudio/elephc>
- 上游源码子模块：`elephc-src`
- 中文内容：`content/`
- 站点入口：`site/`
- 翻译状态：`.translation/manifest.json`
- 术语表：`.translation/glossary.md`

## 授权与版权

elephc 项目名称、源码、原始英文文档、图片和示例代码的版权归上游作者或对应贡献者所有。上游许可证请以 [`illegalstudio/elephc` 仓库中的 LICENSE](https://github.com/illegalstudio/elephc/blob/main/LICENSE) 为准。

中文翻译和整理内容参考上游项目许可证授权。再分发时应保留上游来源、许可证链接和本声明。
