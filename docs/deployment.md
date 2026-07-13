# 独立服务器部署说明

本文说明如何把 `elephc 中文文档` 部署到独立服务器。项目输出是 VitePress 静态站点，不依赖 Node.js 运行时提供页面服务。

## 构建产物

构建命令：

```bash
npm ci
git submodule update --init --recursive
npm run build
```

输出目录：

```text
site/.vitepress/dist/
```

`npm run build` 会自动执行 `prepare:content`，包括：

- 同步 `.translation/manifest.json`
- 生成 examples / showcases 索引
- 将 `content/` 同步到 `site/`
- 生成 VitePress sidebar

## 发布到服务器

示例目录：

```text
/var/www/elephc-zh-docs/
```

发布命令示例：

```bash
rsync -av --delete site/.vitepress/dist/ user@server:/var/www/elephc-zh-docs/
```

## Nginx 配置示例

```nginx
server {
    listen 80;
    server_name docs.example.com;

    root /var/www/elephc-zh-docs;
    index index.html;

    location / {
        try_files $uri $uri.html $uri/ /404.html;
    }

    location ~* \.(css|js|png|jpg|jpeg|gif|svg|webp|ico|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
}
```

HTTPS 建议由服务器侧统一配置，例如使用 Let’s Encrypt / certbot。

## 更新流程

推荐流程：

1. 在本地或 CI 中更新 `elephc-src` submodule。
2. 执行 `npm run sync` 检查是否有新增或变更源文档。
3. 对 pending 文件执行 `npm run translate:agy`。
4. 人工 review 自动创建的翻译 PR。
5. 合并后执行 `npm run build`。
6. 将 `site/.vitepress/dist/` 发布到服务器。

## 验证

发布前建议执行：

```bash
npm test
npm run validate
npm run build
```

发布后抽查：

```bash
curl -I https://docs.example.com/
curl -I https://docs.example.com/docs/php/strings
curl -I https://docs.example.com/showcases/http-server/
```

## 授权声明

部署后的站点必须保留“授权与版权”页面及页脚中的上游来源说明。上游 elephc 项目的源码、原始英文文档、图片和示例代码版权归上游作者或对应贡献者所有，上游许可证以 `illegalstudio/elephc` 仓库中的 `LICENSE` 为准。
