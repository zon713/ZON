import type { Metadata } from 'next';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { SiteHeader } from '@/app/site-header';
import { clinicSourceAuditDate } from '@/lib/clinics';
import { clinicsHref, supportHref } from '@/lib/site-links';
import '../service-guide/service-guide.css';

export const metadata: Metadata = {
  title: '隐私与使用说明｜汇医盟',
  description:
    '说明汇医盟公开查询页面的资料来源、定位与分享行为、外部电话地图和预约服务，以及当前未接入的统计与预约存储能力。',
  alternates: { canonical: 'https://www.huiyimeng.com/privacy.html' },
};

export default function PrivacyPage() {
  return (
    <>
      <a className="site-skip-link" href="#privacy-main">
        跳到隐私与使用说明
      </a>
      <SiteHeader active="about" backHref="/" />
      <main className="service-page" id="privacy-main">
        <header className="service-hero">
          <p className="service-eyebrow">汇医盟 · 平台说明</p>
          <span className="service-hero-icon">
            <ShieldCheck size={28} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <h1>隐私与使用说明</h1>
          <p>
            按当前网站实际功能说明。
            <br />
            公开资料无需注册；网站不保存预约记录。
          </p>
        </header>
        <p className="service-update">
          本说明整理日期：
          <time dateTime={clinicSourceAuditDate}>{clinicSourceAuditDate}</time>
          。新增服务接入后，应同步更新相关说明。
        </p>
        <div className="service-prose">
          <section aria-labelledby="privacy-info-title">
            <h2 id="privacy-info-title">1. 平台提供什么信息</h2>
            <p>
              汇医盟是广州医馆信息查询平台，展示医馆资料及原网站留存的联系、地图和预约入口。机构资料、图片、服务、医生、排班和价格均应按实际核实状态标记；代码整理日期不代表医馆完成业务确认或展示授权。
            </p>
            <p>
              人体导览用于查看资料收录状态，不根据部位作出诊断、治疗方案、疗效判断或医馆适配结论。医学内容和医馆推广内容仍需专业核查，本说明不能替代审核。
            </p>
          </section>
          <section aria-labelledby="privacy-query-title">
            <h2 id="privacy-query-title">2. 查询与人体选择</h2>
            <p>
              医馆名称、地区、地址及人体部位筛选用于当前页面查询。部分筛选条件会保留在当前网址或浏览器页面历史中，以便返回或刷新后继续查询；不要求填写患者姓名、手机号、身份证或病情。
            </p>
            <p>
              当前网站未配置第三方营销统计服务。人体部位选择、搜索词与病情信息不作为统计事件发送。请不要在搜索框输入身份证、病历或其他个人敏感资料，转发查询网址前也请检查其中的文字。
            </p>
          </section>
          <section aria-labelledby="privacy-location-title">
            <h2 id="privacy-location-title">3. 位置、剪贴板与系统分享</h2>
            <ul>
              <li>
                <strong>定位：</strong>
                医馆目录仅在您主动点击距离排序并允许浏览器定位后读取当前位置，用于本页估算直线距离。拒绝或无法定位时，仍可按名称、地址与地区查询。该功能未接入位置上传或共享存储。
              </li>
              <li>
                <strong>复制：</strong>
                仅在您主动点击复制时，尝试把所选文本或本馆分享链接写入剪贴板；不读取剪贴板内容。浏览器不支持时会提示手动复制。
              </li>
              <li>
                <strong>分享：</strong>
                仅在您主动点击分享时调用系统分享功能，分享内容为该医馆名称、简短说明和本馆链接。取消分享不会创建预约或咨询记录。
              </li>
            </ul>
          </section>
          <section aria-labelledby="privacy-external-title">
            <h2 id="privacy-external-title">4. 电话、地图与预约是怎样打开的</h2>
            <p>
              电话按钮调用设备拨号功能；地图按钮打开对应医馆的外部地图地址；小程序入口与二维码由相关服务处理。只有您主动点击或扫码后才会进入相应渠道，请再核对机构名称、接诊地点与页面内容。
            </p>
            <p>
              外部服务可能按自身规则处理位置、登录、预约与支付等信息。其信息处理与预约记录以该服务和实际医馆的规则为准。汇医盟网页未接入预约存储、支付、在线问诊或在线人工客服。
            </p>
            <p>
              电话点击不等于电话接通或真实咨询；打开预约入口不等于预约成功；导航点击不等于实际到店。预约、改期、费用和退费需要对应医馆或其预约系统确认。
            </p>
            <p>
              公众号菜单与自动回复在公众号后台单独配置，消息处理以公众号和微信的实际设置为准。本网站没有接入公众号消息接口，不将消息中的病情描述用于网页营销统计。
            </p>
          </section>
          <section aria-labelledby="privacy-source-title">
            <h2 id="privacy-source-title">5. 来源标识与统计状态</h2>
            <p>
              分享链接可带医馆编号和来源标识，用于区分医馆自有分享、汇医盟公共推广及公众号不同入口。标识只描述入口，不包含患者身份、病情或人体部位信息。
            </p>
            <p>
              当前未接入共享数据库或全站统计服务，页面访问、电话点击、导航点击与预约入口点击均标为“暂未统计”。浏览器本地状态不能当作全站数据、实际咨询、确认预约或到店记录。
            </p>
            <p>
              网站部署服务可能保留基础访问日志；运营方尚需核对实际日志配置、保留时间和访问权限。后续接入统计或后台存储时，应明确采集字段、用途和保存规则后再启用。
            </p>
          </section>
          <section aria-labelledby="privacy-contact-title">
            <h2 id="privacy-contact-title">6. 资料反馈与联系</h2>
            <p>
              如需更正机构资料、处理图片与展示授权问题或反馈网站使用问题，请查看平台联系方式。普通反馈无需提供身份证、病历或诊疗记录，具体诊疗问题请向接诊医师咨询。
            </p>
            <a className="service-prose-action" href={supportHref}>
              查看平台联系方式
              <ArrowRight size={16} aria-hidden="true" />
            </a>
            <br />
            <a className="service-prose-action" href={clinicsHref}>
              查看医馆目录
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </section>
        </div>
        <footer className="service-footer">
          <span>汇医盟 · 广州医馆信息服务</span>
          <a href={supportHref}>联系与资料反馈</a>
        </footer>
      </main>
    </>
  );
}
