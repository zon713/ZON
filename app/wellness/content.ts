import {
  CloudSun,
  CookingPot,
  MoonStar,
  Waves,
  type LucideIcon,
} from 'lucide-react';

export type WellnessArticle = {
  slug: 'seasons' | 'food-and-tea' | 'sleep' | 'meridians';
  eyebrow: string;
  title: string;
  shortTitle: string;
  summary: string;
  readingTime: string;
  icon: LucideIcon;
  accent: string;
  opening: string;
  sections: Array<{
    title: string;
    body: string;
    points?: string[];
  }>;
  visitTitle: string;
  visitBody: string;
  sourceLabel: string;
  sourceUrl: string;
};

export const wellnessArticles: WellnessArticle[] = [
  {
    slug: 'seasons',
    eyebrow: '顺时而养',
    title: '四时调养：把身体放回自然的节律里',
    shortTitle: '四时调养',
    summary: '天气变了，作息、穿衣和运动怎么跟着调，先从不勉强自己开始。',
    readingTime: '约 4 分钟',
    icon: CloudSun,
    accent: '#b98b46',
    opening:
      '顺时调养，不是每到一个节气就更换“养生处方”，而是留意温度、湿度与昼夜变化，适度调整衣着、作息和活动。',
    sections: [
      {
        title: '先照顾日常节律',
        body: '规律起居比追逐复杂方法更重要。尽量保持稳定的起床与入睡时间，根据昼夜变化安排工作、休息和户外活动。',
        points: ['温差明显时及时增减衣物', '白天适度活动，夜间减少过度兴奋', '天气炎热或寒冷时降低运动强度'],
      },
      {
        title: '饮食跟着体感微调',
        body: '不必机械套用“应季食谱”。以新鲜、均衡和规律为基础，再结合个人消化感受、既往疾病与医生建议调整。',
      },
      {
        title: '留意变化，而不是给自己下结论',
        body: '季节转换时出现短暂疲倦、食欲或睡眠变化并不少见；若症状持续、反复或明显影响生活，应由专业医生评估。',
      },
    ],
    visitTitle: '季节变化后，身体一直不舒服？',
    visitBody: '如果疲倦、咳嗽、消化不适或睡眠问题反复出现，可先记录持续时间与诱因，并及时到正规医疗机构寻求专业评估。',
    sourceLabel: '中医药健康促进行动（国务院政策文件）',
    sourceUrl:
      'https://www.gov.cn/zhengce/zhengceku/202504/P020250414516765123320.pdf',
  },
  {
    slug: 'food-and-tea',
    eyebrow: '饮食有节',
    title: '食养茶饮：从一日三餐开始温和调养',
    shortTitle: '食养茶饮',
    summary: '三餐先吃规律，再聊茶饮和药食同源食材该怎么选、什么时候别乱用。',
    readingTime: '约 5 分钟',
    icon: CookingPot,
    accent: '#8b6a39',
    opening:
      '食养的重点不是寻找一种“万能食材”，而是饮食有节、搭配合理，并根据体质、时令和身体状况作适度选择。',
    sections: [
      {
        title: '先做好三个基础',
        body: '规律、适量、均衡，是任何食养建议的前提。',
        points: ['三餐尽量定时，避免长期饥一顿饱一顿', '食物种类多样，不过分依赖单一食材', '留意吃完后的真实感受，而不是只看“功效标签”'],
      },
      {
        title: '茶饮不是人人相同',
        body: '同一种茶饮，对不同年龄、体质、疾病和用药情况的人未必都合适。孕期、儿童、慢性病患者或正在服药者，使用药食同源材料前宜先咨询专业人员。',
      },
      {
        title: '不舒服时，不用食疗代替诊疗',
        body: '持续腹痛、吞咽困难、反复呕吐、黑便或体重明显下降等情况，不适合只靠饮食调整，应及时就医。',
      },
    ],
    visitTitle: '饮食调整不能代替个体化诊疗',
    visitBody: '有慢性病、特殊饮食需求或正在用药时，饮食建议应结合个人情况判断；持续不适请向专业医务人员咨询。',
    sourceLabel: '中医药健康促进行动（国务院政策文件）',
    sourceUrl:
      'https://www.gov.cn/zhengce/zhengceku/202504/P020250414516765123320.pdf',
  },
  {
    slug: 'sleep',
    eyebrow: '起居有常',
    title: '睡眠调理：让夜晚重新变得有秩序',
    shortTitle: '睡眠调理',
    summary: '先把起床时间稳下来，也给睡前留一点安静，不让“必须睡够”变成新的压力。',
    readingTime: '约 4 分钟',
    icon: MoonStar,
    accent: '#5c6f78',
    opening:
      '睡眠容易受到节律、情绪、饮食、光线和疾病影响。改善睡眠通常从稳定生活节奏开始，而不是一次性寻找强力方法。',
    sections: [
      {
        title: '稳定起床时间',
        body: '即使前一晚睡得不理想，也尽量让起床时间保持相对稳定。白天适度接触自然光、安排活动，有助于重新建立昼夜节律。',
      },
      {
        title: '给睡前留出缓冲',
        body: '睡前减少剧烈运动、过饱饮食与持续刷屏，让身体从工作和信息刺激中慢慢退出。',
        points: ['把灯光调暗，保持卧室安静舒适', '把担心的事情先写下来，留到白天处理', '困意明显时再上床，避免长时间躺着焦虑'],
      },
      {
        title: '这些情况建议尽早评估',
        body: '长期失眠、明显打鼾并伴呼吸暂停、白天嗜睡，或睡眠问题已影响工作和情绪时，应及时寻求专业帮助。',
      },
    ],
    visitTitle: '睡不好已经影响白天状态？',
    visitBody: '记录一至两周的入睡时间、夜醒次数和白天精神状态，可帮助医生更快了解你的睡眠问题。',
    sourceLabel: '睡眠健康核心信息及释义（国家卫生健康委）',
    sourceUrl:
      'https://www.nhc.gov.cn/guihuaxxs/c100133/202503/70d5836afe804a858b899ee951a24a13.shtml',
  },
  {
    slug: 'meridians',
    eyebrow: '舒展有度',
    title: '经络养护：轻柔活动，比用力按压更重要',
    shortTitle: '经络养护',
    summary: '久坐以后怎么舒展、怎么轻轻按揉，也说说哪些情况不适合自己硬扛。',
    readingTime: '约 4 分钟',
    icon: Waves,
    accent: '#51796b',
    opening:
      '日常经络养护可以理解为一种温和的自我照顾：让久坐后的身体动起来，让紧张的部位慢慢放松，但不追求“越痛越有效”。',
    sections: [
      {
        title: '先活动，再按揉',
        body: '久坐后先做缓慢的肩颈转动、伸展和散步，再根据舒适程度轻柔按揉。动作应可控、可停止，不强扳、不猛压。',
      },
      {
        title: '以舒适为界',
        body: '按揉过程中出现明显疼痛、麻木、头晕或不适加重，应立即停止。皮肤破损、急性扭伤或不明肿块处不要自行刺激。',
      },
      {
        title: '不把保健当治疗',
        body: '自我按揉属于日常保健，不能替代对颈肩腰腿痛、神经症状或其他疾病的诊断和治疗。',
      },
    ],
    visitTitle: '疼痛、麻木或活动受限反复出现？',
    visitBody: '不要继续用力按压或自行判断病因。反复出现疼痛、麻木或活动受限时，请到正规医疗机构由专业人员评估。',
    sourceLabel: '中医药健康管理服务规范（国家卫生健康委）',
    sourceUrl:
      'https://www.nhc.gov.cn/zwgk/wtwj/201308/09a61d0d407a4f12ad37c01576913be4.shtml',
  },
];

export function getWellnessArticle(slug: WellnessArticle['slug']) {
  return wellnessArticles.find((article) => article.slug === slug)!;
}
