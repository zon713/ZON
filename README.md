# 汇医盟诊所查询网页

这是汇医盟网站的源码，包含诊所查询首页和养生指南文章页。仓库不包含本机依赖、构建缓存、公众号后台数据、域名验证文件或原站点的托管配置。

## 本地运行

需要 Node.js 22.13 或更新版本和 pnpm。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

构建静态网页：

```bash
pnpm build
```

静态输出位于 `dist/client`。请先在本地验证改动，不要直接覆盖线上网站。

## 常用文件

- `app/page.tsx`：诊所查询首页、诊所资料与预约入口。
- `app/wellness/page.tsx`：养生指南首页。
- `app/wellness/content.ts`：养生文章内容。
- `app/globals.css`：网站样式。
- `public/`：网站图片及图标。
- `lib/site-links.ts`：开发与静态导出时的文章链接。

医疗科普内容在发布前应由具备相应资质的人员复核。
