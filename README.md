# 汇医盟网站

汇医盟广州医馆信息网站。使用既有 React 19、TypeScript、Vinext/Vite、Tailwind 和 Three.js，继续静态导出到腾讯云 COS。浏览、搜索和联系入口无需注册登录。

2026-10-24 新版已发布到[正式网站](https://www.huiyimeng.com/)，139 个文件在正式域名和 COS 源站的 279 项读取核验全部通过。公众号 3 组 10 项菜单已提交发布，后台提示传播中；欢迎、固定回复及 14 条规则的 40 个关键词均已保存并重新读回。实际用户端收消息与小程序预约仍待真机核验。详见[正式发布记录](docs/deployment-20261024.md)。

配套材料：[公众号交接与状态](docs/wechat/handoff.md)、[菜单与真实目标地址表](docs/wechat/generated/menu-table.md)、[完整回复文案](docs/wechat/generated/replies.txt)、[首次使用图文稿](docs/wechat/generated/first-use-article.md)、[后台配置步骤](docs/wechat/backend-setup.md)。生成文件中的草稿标签描述配置源，实际发布状态以发布记录为准；首次使用图文尚未发表。

新增手机页面 `/locations.html`、`/service-guide.html`、`/support.html`、`/privacy.html`；`/wechat-preview.html` 为不索引的内部审阅入口。首页四项核心服务在手机首屏可见，3D 模型按需开启。没有审核记录的科普与无有效活动不加入公众号菜单。四馆网页分享二维码已经独立解码核对，原预约小程序码保持不变，真机扫码仍待验。

本次围绕医馆查询、独立详情、联系预约、合作入驻和推广来源改版。完整交接、资料缺口及部署步骤见 [2026-10-24 改版说明](docs/revision-20261024.md)；统计状态见 [统计接入说明](docs/analytics-integration.md)。上线结果与业务资料待项以[正式发布记录](docs/deployment-20261024.md)为准。

预览截图：[桌面首页](docs/previews/home-desktop-1280.jpg)、[手机首页](docs/previews/home-mobile-320.jpg)、[手机医馆详情](docs/previews/clinic-mobile-390.png)、[人体查询空结果](docs/previews/body-empty-mobile-320.jpg)、[医馆合作](docs/previews/cooperation-mobile-390.png)。[详情与规范链接复验](docs/final-qa-20261024.md)。

## 运行与构建

需要 Node.js 22.13 或更新版本及 pnpm。运行依赖沿用原版本；新增三个固定版本开发依赖用于静态二维码生成、PNG 读取和独立解码，详情见 [二维码说明](docs/wechat/share-qr.md)。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
pnpm check:compat
pnpm check:clinics
pnpm check:wechat
pnpm check:share-codes
pnpm start
```

`pnpm build` 输出 `dist/client`，并执行既有浏览器兼容处理。`pnpm start` 只绑定本机 `127.0.0.1`，直接预览导出的 `.html` 链接。不要使用 SPA fallback 掩盖缺失的详情页面。静态导出必须有实际 HTML；构建后处理会拒绝跳过路由或缺失产物的导出。

菜单、回复与页面入口统一维护于 `content/platform-links.json`、`content/wechat-content.json`，构建前自动生成配置稿与已解码的四馆网页二维码。只更新公众号稿可运行 `pnpm prepare:wechat`；它只生成本地文件，不连接公众号后台。修改域名、路由或医馆 ID 后，必须重新构建、检查二维码并核对已分发物料。

恢复既有源码后、改动前的全仓库 lint 基线有 23 个错误，涉及旧 UI 组件、hooks 和阅读组件；不能把这部分算成本轮新增问题，也不能据此称全仓库 lint 通过。改动文件需单独检查，并保留最终检查结果。

医馆改版首轮记录：TypeScript、28 路由静态构建（0 跳过）、修改范围 lint、4 馆资料绑定、浏览器兼容检查通过；全仓库 lint 仍是上述 23 个原有错误。28 页本地 HTTP 读取、1081 个本地资源/页面引用和 17 个片段链接检查无缺失。浏览器完成 320/390px 查询、空态、人体选择、4 馆直开刷新和联系绑定检查；这不代表微信真机或真实预约已验收。

公众号配套本轮新增 5 页，静态构建共 33 页（0 跳过）；菜单 3 组 10 项、关键词 14 条规则共 40 个精确词及 4 馆网页二维码均有本地校验。已保留后台原有 21 个词，增补 19 个词；全部规则已原生后台保存与读回。完整技术与手机验证、截图及外部验收边界见 [本轮交接](docs/wechat/handoff.md) 与 [浏览器验收](docs/wechat/browser-qa.md)。

## 页面与统一数据

- 首页 `/`：查找医馆主入口、人体导览与合作入口。
- `/clinics.html`：文字搜索、真实区域筛选和空结果；只有数据支持时才开放服务或排班筛选。
- `/clinics/<医馆ID>.html`：四家既有医馆的独立详情与本馆联系、分享入口。
- `/body-guide.html`：保留 3D 人体和文字部位入口；专业审核映射为空时如实显示无资料。
- `/appointment.html`：按医馆区分已有预约方式，保留汇医堂原二维码。
- `/doctors.html`：医生资料及排班核实状态；资料未齐不展示候选姓名或排班。
- `/cooperation.html`：99 元/月或 1000 元/年的基础合作、服务范围、步骤及机构电话。
- 保留关于、品牌理念、联系、到访指南、养生目录与 12 篇既有文章的网址。

开发服务器使用不带 `.html` 的路由；生产链接由 `lib/site-links.ts` 统一生成。

唯一医馆基础数据为 `content/clinics-source.json`，由 `lib/clinics.ts` 提供类型、数据读取和已确认资料筛选。修改电话、地址或预约方式应先修改该数据并逐馆核对，避免在页面中另写一份资料。代码整理日期 `codeAuditedAt` 与医馆业务核实日期 `businessVerifiedAt` 分开记录。

当前仅有四家原网站记录，所有展示授权和业务复核仍待医馆确认。不能把四条既有记录称为四家已核实合作医馆，也不能根据“约五家”的背景新增占位医馆。营业时间、核实医生、出诊、诊疗科目、现行确认价格缺失时显示待确认，不创建示例数据。

## 统计与共享服务

`lib/referrals.ts` 为每家生成绑定医馆 ID 的来源链接，区分医馆自有渠道与汇医盟公共推广；规范链接不含来源参数。来源参数不含身份、病情或人体选择。

当前没有已配置的统计服务、共享数据库或预约存储。`lib/analytics.ts` 明确禁用采集，所有访问、联系点击和到店数据均为“暂未统计”，不会保存浏览器事件缓冲、写 localStorage 或向第三方发请求。电话点击不能直接当作咨询、预约或到店。合作页使用真实电话，没有模拟提交表单。

## 源码与素材依据

本轮发现仓库旧 main 缺少已上线功能，不能直接用旧 main 或 9 月 ZIP 还原网站。此次恢复 2026-10-16 `huiyimeng-compat` 的 React/Vinext 源码，并对照 2026-10-21 已发布 V7 的页面、公开素材与资料边界进行改版；V7 的覆盖页面通过独立静态脚本生成，不能把旧 React 构建误认为已经包含全部 V7 行为。详细本地来源见交接说明。

保留 `public/huiyimeng-brand-user.jpg` 原版汇医盟品牌图、原有门店照片、预约二维码与有许可记录的人体模型。未找到可确认的独立汇医堂原版 Logo，保持缺失，不生成替代。医学内容、医生资料、服务范围和推广文案须由业务方相应专业负责人核查，免责声明不替代审核。

## 发布

源码上传仓库不会自动部署网站。上线前补齐必要资料确认，完成静态预览与手机验收；先备份当前 COS 对象及元数据，再上传 `dist/client` 内部产物，资源在前、非首页页面其次、`index.html` 最后。保留域名验证文件、旧哈希资源、DNS、权限和 HTTPS 设置。禁止上传源码、依赖、备份包、账户资料或本地证据。
