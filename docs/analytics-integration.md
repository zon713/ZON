# 推广来源与统计接入

## 当前状态（2026-10-24）

本项目继续静态导出至腾讯云 COS。没有发现可用于本次官网统计的已配置账号、收集端点、共享数据库或月报服务。`lib/analytics.ts` 的 `clinicAnalytics.enabled` 明确为 `false`，页面访问和联系点击均为 **暂未统计**。

`recordClinicEvent` 只提供受限的集成边界，返回 `not_collected`。它不发请求，不写 localStorage / sessionStorage / Cookie，不建内存事件队列，不生成演示数字；点击不因统计缺失而受阻。没有全站统计后端时，不能把页面上的来源参数称为已采集的数据。

## 分享来源约定

每家医馆使用其真实独立静态详情路径：

```text
/clinics/huiyitang-guangzhou.html?clinic=huiyitang-guangzhou&source=clinic
/clinics/huiyitang-guangzhou.html?clinic=huiyitang-guangzhou&source=platform
```

- `clinic`：医馆自有渠道。
- `platform`：汇医盟公共推广。
- `unknown`：未标记、无法识别、重复参数或医馆 ID 不匹配。

`getClinicReferralSource` 只在当前医馆 ID、URL 的 `clinic` 参数以及唯一 `source` 参数同时匹配时返回来源；从某家分享页主动进入公共目录再看另一家，不能沿用上一家来源。没有跨页持久化归因、患者标识或自动读取 referrer。来源参数是入口标签，能够被用户修改，不是支付、合作或患者身份凭证。

`createClinicShareUrl` 从统一医馆数据验证 ID，仅生成该馆链接，不继承浏览器中的其他参数。所有分享版本的 canonical 指向不含参数的本馆详情页。二维码若随后制作，须对该真实链接生成并实际解码核对医馆 ID；现有预约二维码与本次详情分享二维码用途不同，不可互相替代。

## 对接 API

```tsx
import { ClinicEvents, ClinicEventLink } from '@/components/clinic-events';
import { createClinicShareUrl } from '@/lib/referrals';

<ClinicEvents clinicId={clinic.id} />
<ClinicEventLink clinicId={clinic.id} event="phone_click" href={`tel:${clinic.phone}`}>
  电话咨询
</ClinicEventLink>
const shareUrl = createClinicShareUrl(clinic.id, 'clinic');
```

允许事件为 `page_view`、`phone_click`、`navigation_click`、`appointment_click`。将来收集时，仅允许传递事件类型、当前医馆 ID 和有效来源枚举。服务端也必须重新校验该白名单，不能仅依赖 TypeScript。

**不发送**完整 URL、查询词、referrer、人体点击部位、症状、地理位置、患者姓名、手机号、预约资料及其他身份或健康信息。不默认加载第三方统计脚本。若采用第三方服务，应先确认其自动采集字段、自动页面跟踪与 URL/referrer 收集可关闭，验证后才开放接入。

## 实际开放所需最小条件

1. 业务方确认使用的统计服务或自有后端，提供可用账号、统计站点与对接权限；密钥保存在服务端。
2. 提供可访问的收集端点、共享存储和月报读取权限，确认 HTTPS、正式域名/CORS、数据保留期限及运营责任人。
3. 明确事件去重、机器人排除、访问量口径和按医馆/来源/月份汇总规则；URL 标签不能证明真实咨询。
4. 技术方接入收集器，验证请求载荷只有允许字段、成功事件得到后端确认、失败不影响联系操作，并用后端查询或真实报表对账。
5. 在具备真实服务及验收记录后更新配置和页面状态。不能仅把 `enabled` 改为 `true` 就称为接入完成；当前函数没有启用采集的分支。

需要分别统计的业务结果：

| 指标         | 可用证据                                       | 当前状态 |
| ------------ | ---------------------------------------------- | -------- |
| 医馆页面访问 | 已落库的 page_view 与明确访问口径              | 暂未统计 |
| 电话点击     | 已落库的 phone_click，仅代表发起拨号入口       | 暂未统计 |
| 导航点击     | 已落库的 navigation_click，仅代表打开地图入口  | 暂未统计 |
| 预约入口点击 | 已落库的 appointment_click，仅代表打开预约入口 | 暂未统计 |
| 真实咨询     | 医馆确认并按口径记录的咨询结果                 | 暂未统计 |
| 确认预约     | 预约系统确认或医馆核实记录                     | 暂未统计 |
| 实际到店     | 门店按口径确认的到店记录                       | 暂未统计 |

来源参数不代表采集同意，也不提供患者来源证明。将来涉及共享咨询、预约或到店记录时，应另行确认授权、隐私告知和数据最小范围；本次代码不接收这些数据。

## 资料依据

- 部署方式：原项目 `next.config.ts`、`vite.preview.config.ts`，以及 2026-10-21 V7 生产交付 `README-DEPLOYMENT.md`。
- 既有 V7 `content/huiyitang-metrics.json`：统计值为空、未批准公开；不以旧占位字段生成数字。
- 本次基础合作价格与服务范围：2026-10-24 用户明确需求。电话从统一医馆数据的 `platformPhone` 读取，沿用原官网机构电话，尚未独立回访。
