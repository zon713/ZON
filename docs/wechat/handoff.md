# 汇医盟网站与公众号发布交接

日期：2026-10-24（北京时间）。本页按实际发布证据更新；公众号任务仍在收尾时，逐项标记状态，不将后台保存、传播和手机真实触发混为一项。

## 当前发布状态

网站新版已经上传既有静态 COS，并通过正式域名及 COS 源站核验。最终冻结版本为 `outputs/deploy-20261024-wechat/release-site-v2/`，139 个文件、279 个 HTTP 目标全部通过内容长度和 SHA-256 一致性检查；首页 `/`、`/index.html`、源站 `index.html` 3 个目标亦通过。全量证据为 `outputs/deploy-20261024-wechat/verification/2026-10-24T13-34-58.430Z-9d5b23ee.json`，首页证据为同目录 `2026-10-24T13-34-48.656Z-9a49b4cc.json`。

可复用的静态发布包为 [huiyimeng-live-web-20261024-384d0e9.zip](../../outputs/huiyimeng-live-web-20261024-384d0e9.zip)，对应 [本地清单与独立解包验证](../../outputs/huiyimeng-live-web-20261024-384d0e9.manifest.json)。它只取上述 v2 冻结目录，源提交 `384d0e946ae4323785eb8c4952c990663bdcf1fa`，包含 `.vite/manifest.json` 在内的 139 个公开文件；没有重建，也没有把 ZIP 上传 COS。独立解包后全部 139 文件的路径、大小、SHA-256 与冻结清单完全一致；不含源码、后台备份、截图或日志。ZIP 为 9,972,288 字节，SHA-256：`a6449594f57f116cfec9e427c2c37a25e5683642582c52becafb340fc4ae9db9`。

公众号菜单已经提交发布，后台显示“菜单发布中，预计60分钟后生效”，发布提示说明24小时内对所有用户生效。关注回复、固定回复已经保存并从界面读回。14 条关键词规则、40 个词均已实际保存并逐项读回；两页总清单独立复核通过，规则名及词集与最终来源一致，40 词全部唯一，无重复或缺失，原 21 词完整保留并新增 19 词，全部为 1 条文本回复，两页关键词开关均开启。列表不显示匹配模式，全匹配依据为各负责人 14 条保存后重新打开详情的证据。普通微信账号的消息触发和菜单最终传播仍待管理员完成验收。

| 配置项目 | 当前实际状态 | 证据 |
| --- | --- | --- |
| 菜单 | 3 个一级组、10 个网页目标；名称、动作与完整地址读回后提交；传播中 | `wechat-applied/menu-published-ui.txt`、`menu-publishing.png` |
| 被关注回复 | 已保存、启用、完整读回 | `wechat-applied/welcome-saved-ui.txt`、`welcome-saved.png` |
| 固定回复 | 已保存、启用、完整读回；AI 关闭；关键词优先触发仍需手机验证 | `wechat-applied/fixed-saved-ui.txt`、`fixed-saved-ai-off.png` |
| 原找医馆、联系咨询、医馆入驻 | 3 个旧规则名保留，原 12 词保留，新增人工、帮助、加盟，共 15 词逐词全匹配；逐条保存后重新编辑读回 | `evidence/keyword-old-rules-saved.json`、`keyword-rule-clinic-directory-saved.jpg`、`keyword-rule-cooperation-saved.jpg`、`keyword-own-three-saved-list.jpg` |
| 四馆完整名称、原营业时间 | 新增 4 馆名规则，更新原营业时间规则，共 5 规则、8 词逐词全匹配；保存后重新打开读回 | `wechat-evidence/clinic-rules-configuration-result.json` 及其中各馆/营业时间截图、JSON |
| 人体导览、医生出诊、诊疗费用、活动福利 | 4 新规则、10 词全匹配，保存并读回 | `evidence/keyword-root-five-saved.json` |
| 原地址导航 | 原 4 词保留并增加位置，共 5 词全匹配，统一位置页文本，1 条回复，保存与详情读回完成 | `wechat-applied/locations-saved-details-ui.txt`、`locations-saved-fullmatch.png` |
| 原预约指南 | 原规则名保留，预约、挂号 2 词全匹配，1 条最终文本，保存后详情读回；只替换该回复中的旧文章条目，未删除素材 | `evidence/keyword-root-five-saved.json` |

上述证据相对根目录均为 `outputs/deploy-20261024-wechat/`。后台配置汇总还见 `wechat-applied/menu-welcome-fixed-locations-summary.json`、`wechat-config-ledger.jsonl`。截图捕获失败的单次尝试不作为成功截图；完整读回 JSON 另行保留。各关键词最终源为 14 条规则、40 个词的 [关键词规则](./generated/keyword-rules.json)，包括原 21 词；生成文件的 `draft_not_applied` 描述其生成器不会自动发布，不是当前后台实际状态，应以上表证据为准。

最终两页独立总验为 `evidence/list-full-final.json`，截图为 `evidence/keyword-list-final-page-1.png`、`evidence/keyword-list-final-page-2.png`。总验为只读操作，未发送测试消息，也没有重复修改已保存规则。

公众号原生文字编辑器会归一化部分换行。核对时保留所有字词、金额、电话和 URL，另核网址与下一句之间有明确间隔；不以忽略空白的文本比较单独证明链接边界。合作与预约回复的网址分隔已在保存后读回检查；关注和固定回复的 ProseMirror 内容保留真实换行，分别 3 条和 2 条 URL 边界已核查，见 `wechat-applied/welcome-url-boundary.json`、`fixed-url-boundary.json`。

## 可直接查看的正式页面

- [网站首页](https://www.huiyimeng.com/)、[人体导览](https://www.huiyimeng.com/body-guide.html)、[医馆目录](https://www.huiyimeng.com/clinics.html)
- [汇医堂](https://www.huiyimeng.com/clinics/huiyitang-guangzhou.html)、[岭海](https://www.huiyimeng.com/clinics/linghai-liwan.html)、[培元堂](https://www.huiyimeng.com/clinics/peiyuantang-tianhe.html)、[易安](https://www.huiyimeng.com/clinics/yian-tianhe.html)
- [医生与出诊](https://www.huiyimeng.com/doctors.html)、[联系预约](https://www.huiyimeng.com/appointment.html)、[到店导航](https://www.huiyimeng.com/locations.html)
- [第一次使用与常见问题](https://www.huiyimeng.com/service-guide.html)、[平台联系](https://www.huiyimeng.com/support.html)、[医馆合作](https://www.huiyimeng.com/cooperation.html)、[隐私说明](https://www.huiyimeng.com/privacy.html)
- [公众号配置审阅](https://www.huiyimeng.com/wechat-preview.html)：保持不索引，仅为配置内容审阅和本地匹配模拟，不发送公众号消息。

网站继续使用现有技术栈、原品牌素材与静态 `.html` 部署。原有效路径、已有预约入口及 12 篇原养生文章路径保留。首页原 `#clinics`、`#about`、`#join`、`#faq-title` 入口有兼容桥；原岭海 3 个医生锚点落到资料待核实提示，没有重新公开未授权姓名或价目。

手机页增加清楚的文字查询、地区筛选、空结果、返回与联系动作。四馆地址复制真实调用剪贴板，成功后才提示已复制，失败提供本馆地址文字手动复制。320px 地址复制和旧锚点验证见 `evidence/address-and-legacy-anchor-checks.json` 及相邻截图。手机底部联系区为正文留出空间，电话、导航、预约按实际行为命名。

四张本馆网页分享二维码编码各自详情和固定来源参数，实际 PNG 像素由独立 jsQR 解码，与本馆 ID、URL 及 SHA-256 核对。清单为 `content/clinic-share-codes.json`，说明见 [分享二维码](./share-qr.md)。它们不替代汇医堂原预约小程序码，独立解码也不替代微信手机扫码验收。

## 真实数据与待补业务资料

- 保留原网站四条医馆记录：汇医堂、岭海、培元堂、易安；不补造第五家。各馆授权、执业与基础资料核实状态仍按页面如实标记，不当作已授权合作案例。
- 平台合作与客服电话 `17819754219` 已由用户于 2026-10-24 明确确认；接待时间与实际接通仍待确认。没有已接入在线人工，不回复“已转人工”。医生、诊疗费用和预约变更分别联系本馆。
- 汇医堂代煎按用户本轮确认展示“免费代煎，不送药”，不延伸到其他项目或医馆。原版汇医堂 Logo 仍缺失，不重绘替代。培元堂缺真实门店照片，不用别馆照片补位。
- 岭海原资料有两个地址，实际接诊地点未确认前不提供歧义导航。四馆电话、营业时间和地址仍需各馆业务方再次核实，营业时间不代替出诊时间。
- 尚无核实并授权的医生、有效排班、现行诊疗价目；旧候选医师资料与 15 项价格保留于本地审计档案，不作为已核实信息公开。
- 人体部位与服务对应关系缺专业审核依据时维持待确认和空结果，不生成诊断、治疗方案或最适合某医馆结论。需补服务依据、审核人、日期和适用条件。
- 汇医堂原小程序及二维码保留；其他三馆使用各自电话，不借用预约码。需微信内外、安卓/iPhone 真机核对实际预约目标、可用状态与失败兜底。
- 99 元/月或 1000 元/年是医馆平台基础合作费；诊疗收费不返回此金额。拍摄、代运营、小程序开发按具体需求另行合作。无真实有效活动，不延续历史夜市优惠。
- 12 篇旧文章保留路径；仍需作者、使用权、来源及专业审核记录，未视作本次科普审核通过。首次使用图文是准备好的稿件，尚无发布文章证据。

医学内容与医馆推广需由业务方完成具体资料、授权和专业审核；免责声明不能替代审核。

## 统计、预约与来源边界

来源参数区分医馆自有渠道、平台公共推广以及公众号菜单、关注、关键词等固定入口，不含患者身份或病情，不继承用户文字查询或人体部位。

当前 `lib/analytics.ts` 关闭采集，不发送或缓冲事件；没有新增共享预约数据库、表单后端、消息服务器或在线人工。全站访问、电话/导航/预约入口点击、真实咨询、确认预约、到店均为“暂未统计”。浏览器 localStorage 不作为全站数据库。点击电话、发送关键词、打开预约入口不等于已咨询、已预约或已到店。

若后续接入，需提供可用统计/后端服务、账号权限、维护负责人、字段用途、保留期和日志规则，完成真实写入与读回再改统计状态。原生公众号菜单与文字回复不要求另建消息服务器，本次不切换未知接管、授权或服务器设置。

## 维护来源与复跑

| 修改对象 | 唯一维护来源 | 同步动作 |
| --- | --- | --- |
| 医馆电话、地址、图片、授权、医生、服务与价格 | `content/clinics-source.json`，`lib/clinics.ts` 读取 | 按本馆 ID 核对目录、详情、医生、预约、位置与分享 |
| 正式域名、路径、菜单、平台电话 | `content/platform-links.json` | 重新生成文案与链接，部署后再同步后台 |
| 关注、关键词、固定回复文案 | `content/wechat-content.json` | 运行生成器，再从完整产物配置原生后台 |
| 链接和来源解析 | `lib/site-links.ts`、`lib/wechat.ts` | 同时核对开发路由、COS 静态路径与 SEO canonical |
| 四馆网页分享码 | `scripts/generate-share-codes.mjs` | 生成后以独立解码检查本馆 URL、来源和哈希 |

生成命令为 `pnpm prepare:wechat`、`pnpm prepare:share-codes`；检查命令为 `pnpm typecheck`、`pnpm check:wechat`、`pnpm check:share-codes`、`pnpm check:compat` 及构建。不要直接改生成文件维护业务资料，生成器不登录微信、不自动覆盖后台。

本轮已有类型检查、修改范围 lint、静态构建、链接/片段兼容与分享码解码通过记录。最终发布包含 33 个静态页面；14 规则、40 词与 10 个菜单目标按最终版本校验。全仓 lint 仍有 23 项原有问题，应与本次修改范围通过区分，不能写成全仓 lint 全通过。

## 发布后的最小收尾与回滚

1. 两页关键词总清单独立复核已通过并归档；14 规则、40 词的逐条保存与读回已完成。后续修改继续维护唯一来源并按记录回读，不以生成文件或后台列表推定用户端触发已通过。
2. 菜单传播完成后，用普通手机微信账号逐个打开 10 个入口；测试新关注、40 个关键词、完整医馆名及未匹配消息，确认没有关键词和固定回复重复发送。后台预览不能替代真实触发。
3. 真机核对四馆分享码、汇医堂原预约码、微信内外跳转、安卓/iPhone 地图和返回；拨号接通、真实预约仅按业务方约定范围验证，不产生无必要订单。
4. 补齐授权、岭海地点、排班、费用和平台接待时间后，只解除对应已取得证据的待确认状态。统计接入另行配置验证。

发布前公众号备份位于 `outputs/deploy-20261024-wechat/wechat-backup/`，网站旧版备份位于同目录 `backup/`；发布记录、冻结清单和线上校验留在该部署目录。发现错误时按备份恢复对应菜单/回复或 COS 文件并复测，不删除历史订单、不撤销无关授权、不切换未知消息服务。

截至本页更新，仍未验收真实关注/消息触发、菜单所有客户端传播、电话接通、微信原预约码真机目标、真实预约确认与到店；这些状态不由网页构建、HTTP 哈希、后台读回或桌面截图推定。

## 2026-10-24 晚间：关注回复与日更能力补充

用户提供的手机截图已证明旧版欢迎回复实际送达，且底部三个菜单组可见；这不代表全部子菜单、关键词和所有客户端已验收。用户指出旧版长网址占屏，本次将关注回复改为简短介绍、四个具名服务链接、统一平台电话及简短预约说明。

新版已在原生“被关注回复”保存、刷新及重新打开读回，开关开启。采用微信文本消息的 `<a href="…">文字</a>` 格式，正文中四个目标为医馆目录、联系预约、人体导览、医馆合作，均使用 `entry=wechat_welcome`。四个正式目标 HTTP 200 且标题匹配。富文本直接粘贴会被当前编辑器剥离链接，因此没有采用该方式。后台只读内容显示标签代码，不能据此证明微信客户端已显示蓝字；已请用户用新关注账号验证，当前标记 **客户端显示待验**。保存前备份和保存后证据在 `outputs/wechat-follow-daily-20261024/evidence/`。

新版欢迎配置独立维护于 `content/wechat-welcome-links.json`，运行 `pnpm prepare:wechat-welcome` 生成 [可复制正文](./generated/welcome-linked-text.txt) 和 [本地排版预览](./generated/welcome-linked-preview.html)。电话和地址仍从统一平台配置生成。旧 `content/wechat-content.json` 的 welcome 和已上线 `wechat-preview.html` 为上一发布版本的历史审阅内容；维护当前欢迎回复时应使用本节新版文件，**不要将旧 welcome 再覆盖后台**。本次未重新发布 COS 网站，其他关键词、固定回复及菜单不变。

当前原生关注回复明确一次一条，可选文字、图片、音频或视频等类型。没有在此原生界面配置“文字之后自动再发图片”；若需要多条欢迎消息，须另核消息接口权限、现有接管方式和服务端，不应仅为此擅自切换服务器。图片和真实网站截图已用于本地首次使用图文预览，未冒充已上线的第二条欢迎图片。

### 已查到的发表能力

- 本账号原生发表弹窗明确“今天没有通知次数”，当时群发通知选项禁用。定时发表可展开单次日期与时间，日期列表从当天至10月30日；未见“每天重复”设置。
- 微信官方将“发表”和“群发通知”分开：不开启通知的内容仅在账号主页展示；开启通知才向用户推送并占额度。[官方说明](https://kf.qq.com/faq/230913IjEVNN2309136nUZNZ.html)
- 官方当前对“公众号”和“服务号”的基础群发额度分别为每日一次、每月四次，认证不增加该基础额度。后台类型字段显示“公众号”，应结合本号实际可用通知次数执行，不能只凭可发表按钮判定无限通知。[类型说明](https://kf.qq.com/faq/170815aUZjeQ170815mU7bI7.html)
- 原生定时是逐篇预排，官方说明为5分钟后至7天内，并包含管理员扫码确认；可用它安排已经审核好的内容，不能等同于永久每日循环。[定时说明](https://kf.qq.com/faq/170627JRVbAb170627mMza6F.html)
- 无人值守生成及发布另需本号实际接口权限、受保护的服务端凭据、运行环境、内容审核与失败处理。认证和网页部署成功不能单独证明发布接口可调用；发布接口还需查询最终结果。[发布能力](https://developers.weixin.qq.com/doc/service/guide/product/publish.html)

本次没有群发、发表文章、创建定时发表任务或循环自动化，也没有新增服务器授权。能力核查记录和截图在 `outputs/deploy-20261024-wechat/publishing-audit/`，官方研究在同目录 `research/daily-publishing-and-welcome-links.md`。

[七次内容规划](./daily-content-plan.json)已准备，先围绕真实功能介绍目录、联系、导航、营业与出诊区别等；每篇发布前核对实际链接和截图。它不是已排期清单。医生、排班、价格、活动及医学科普须取得真实资料、授权和对应专业审核依据后才纳入日更。
