import {
  CloudSun,
  CookingPot,
  MoonStar,
  Waves,
  Footprints, Armchair, GlassWater, Salad, Eye, NotebookPen, Sun, Shirt,
  type LucideIcon,
} from 'lucide-react';

export type WellnessArticle = {
  slug: 'seasons' | 'food-and-tea' | 'sleep' | 'meridians' | 'daily-walking' | 'desk-breaks' | 'hydration' | 'balanced-meals' | 'eye-rest' | 'calm-evening' | 'summer-outdoors' | 'cooler-days';
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
    eyebrow: '季节与作息',
    title: '四时调养：不同季节的生活注意事项',
    shortTitle: '四时调养',
    summary: '季节变化时，如何调整穿衣、作息和运动。',
    readingTime: '约 4 分钟',
    icon: CloudSun,
    accent: '#b98b46',
    opening:
      '根据气温、湿度和昼夜变化，适当调整衣着、作息和活动。无需每到一个节气就更换调养方法。',
    sections: [
      {
        title: '保持规律作息',
        body: '尽量固定起床和入睡时间，根据天气与昼夜变化安排休息和户外活动。',
        points: [
          '温差明显时及时增减衣物',
          '白天适度活动，夜间减少过度兴奋',
          '天气炎热或寒冷时降低运动强度',
        ],
      },
      {
        title: '饮食保持规律',
        body: '饮食以新鲜、均衡和规律为基础。有消化不适或既往疾病时，按个人情况和医生建议调整。',
      },
      {
        title: '不适持续时及时就医',
        body: '季节转换后，如果疲倦、食欲或睡眠变化持续、反复或明显影响生活，应就医评估。',
      },
    ],
    visitTitle: '出现持续或反复不适时',
    visitBody:
      '如果疲倦、咳嗽、消化不适或睡眠问题反复出现，可先记录持续时间与诱因，并及时到正规医疗机构寻求专业评估。',
    sourceLabel: '中医药健康促进行动（国务院政策文件）',
    sourceUrl:
      'https://www.gov.cn/zhengce/zhengceku/202504/P020250414516765123320.pdf',
  },
  {
    slug: 'food-and-tea',
    eyebrow: '饮食与茶饮',
    title: '食养茶饮：饮食搭配与注意事项',
    shortTitle: '食养茶饮',
    summary: '三餐、茶饮和药食同源食材的选择，以及需要注意的人群。',
    readingTime: '约 5 分钟',
    icon: CookingPot,
    accent: '#8b6a39',
    opening:
      '保持三餐规律、份量适当和食物多样。选择茶饮或药食同源食材时，应考虑个人身体状况。',
    sections: [
      {
        title: '规律、适量、均衡',
        body: '三餐尽量定时，注意食量和食物搭配。',
        points: [
          '三餐尽量定时，避免长期饥一顿饱一顿',
          '食物种类多样，不过分依赖单一食材',
          '注意进食后是否出现不适',
        ],
      },
      {
        title: '使用前应注意的人群',
        body: '同一种茶饮，对不同年龄、体质、疾病和用药情况的人未必都合适。孕期、儿童、慢性病患者或正在服药者，使用药食同源材料前宜先咨询专业人员。',
      },
      {
        title: '持续不适请及时就医',
        body: '持续腹痛、吞咽困难、反复呕吐、黑便或体重明显下降等情况，不适合只靠饮食调整，应及时就医。',
      },
    ],
    visitTitle: '饮食调整不能代替个体化诊疗',
    visitBody:
      '有慢性病、特殊饮食需求或正在用药时，饮食建议应结合个人情况判断；持续不适请向专业医务人员咨询。',
    sourceLabel: '中医药健康促进行动（国务院政策文件）',
    sourceUrl:
      'https://www.gov.cn/zhengce/zhengceku/202504/P020250414516765123320.pdf',
  },
  {
    slug: 'sleep',
    eyebrow: '作息与睡眠',
    title: '睡眠调理：作息与睡前习惯',
    shortTitle: '睡眠调理',
    summary: '固定起床时间、调整睡前习惯，以及需要就医的睡眠问题。',
    readingTime: '约 4 分钟',
    icon: MoonStar,
    accent: '#5c6f78',
    opening:
      '睡眠受作息、情绪、饮食、光线和疾病等因素影响。可以先检查日常作息与睡前习惯，长期睡眠问题应就医评估。',
    sections: [
      {
        title: '稳定起床时间',
        body: '尽量保持固定的起床时间。白天适度接触自然光并安排活动，有助于保持昼夜节律。',
      },
      {
        title: '减少睡前刺激',
        body: '睡前减少剧烈运动，避免吃得过饱和长时间刷手机。',
        points: [
          '把灯光调暗，保持卧室安静舒适',
          '把担心的事情先写下来，留到白天处理',
          '困意明显时再上床，避免长时间躺着焦虑',
        ],
      },
      {
        title: '建议就医的情况',
        body: '长期失眠、明显打鼾并伴呼吸暂停、白天嗜睡，或睡眠问题已影响工作和情绪时，应及时寻求专业帮助。',
      },
    ],
    visitTitle: '睡眠问题影响日常生活时',
    visitBody:
      '就医时可提供一至两周的睡眠记录，包括入睡时间、夜醒次数和白天精神状态。',
    sourceLabel: '睡眠健康核心信息及释义（国家卫生健康委）',
    sourceUrl:
      'https://www.nhc.gov.cn/guihuaxxs/c100133/202503/70d5836afe804a858b899ee951a24a13.shtml',
  },
  {
    slug: 'meridians',
    eyebrow: '活动与按揉',
    title: '经络养护：活动与按揉注意事项',
    shortTitle: '经络养护',
    summary: '久坐后的轻柔活动、按揉注意事项，以及应停止操作的情况。',
    readingTime: '约 4 分钟',
    icon: Waves,
    accent: '#51796b',
    opening:
      '久坐后可适当活动肩颈与四肢。按揉时控制力度，出现疼痛或不适应停止。',
    sections: [
      {
        title: '先活动，再按揉',
        body: '久坐后先做缓慢的肩颈转动、伸展和散步，再根据舒适程度轻柔按揉。动作应可控、可停止，不强扳、不猛压。',
      },
      {
        title: '出现不适立即停止',
        body: '按揉过程中出现明显疼痛、麻木、头晕或不适加重，应立即停止。皮肤破损、急性扭伤或不明肿块处不要自行刺激。',
      },
      {
        title: '保健不能替代诊疗',
        body: '自我按揉属于日常保健，不能替代对颈肩腰腿痛、神经症状或其他疾病的诊断和治疗。',
      },
    ],
    visitTitle: '疼痛、麻木或活动受限反复出现时',
    visitBody:
      '反复出现疼痛、麻木或活动受限时，应停止自行按揉，到正规医疗机构就诊。',
    sourceLabel: '中医药健康管理服务规范（国家卫生健康委）',
    sourceUrl:
      'https://www.nhc.gov.cn/zwgk/wtwj/201308/09a61d0d407a4f12ad37c01576913be4.shtml',
  },
];

wellnessArticles.push(
  {
    slug: 'daily-walking', eyebrow: '步行与活动', title: '把步行放进日常：从一段舒服的路开始', shortTitle: '日常步行', summary: '不急着追步数，先找到适合自己的路线、节奏和休息方式。', readingTime: '约 3 分钟', icon: Footprints, accent: '#51796b',
    opening: '一段树荫下的散步、少坐一会儿、走到附近的目的地，都可以成为日常活动的一部分。先关注身体感受，再慢慢建立习惯。',
    sections: [
      { title: '把路线安排得容易坚持', body: '选择熟悉、平整、便于休息的路，穿合脚的鞋。天气炎热、路面湿滑或空气状况不佳时，可以换成室内活动，不必为了完成记录勉强出门。', points: ['从较短、轻松的一段路开始', '把散步接在通勤、买菜等日常安排之后', '准备饮水，也留出休息和返回的时间'] },
      { title: '按自己的状态调整节奏', body: '不把他人的步数或速度当作必须完成的目标。久未运动、年长者或有慢性病的人，宜先了解适合自己的活动安排；活动中感到不舒服就停下来。' },
      { title: '让活动分散在一天里', body: '与其把所有活动都留到晚上，不妨在一天中多创造几次起身的机会。走一小段、站起来伸展，或做力所能及的家务，都能帮助打断长时间静坐。记录是否舒服、是否容易坚持，比单看数字更有用。' },
    ], visitTitle: '活动时反复感到不适', visitBody: '出现胸痛、明显气促、头晕或疼痛加重时，应停止活动并及时就医；不要通过增加运动来试探症状。', sourceLabel: '身体活动（世界卫生组织）', sourceUrl: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity',
  },
  {
    slug: 'desk-breaks', eyebrow: '久坐与舒展', title: '久坐的一天，给身体几个小间隙', shortTitle: '久坐间隙', summary: '调整桌椅、定时起身，把轻柔活动放进工作间隙。', readingTime: '约 3 分钟', icon: Armchair, accent: '#5f7c70',
    opening: '忙起来时，很容易一坐就是很久。可以把休息做得简单一些：换个姿势、站起身、走几步，让工作和身体都有一个小间隙。',
    sections: [
      { title: '先把工作位置调整舒服', body: '让双脚有稳定支撑，屏幕和常用物品放在容易看清、容易够到的位置。桌椅高度没有适合所有人的固定答案，重点是避免长时间耸肩、含胸或扭着身体操作。', points: ['身体与桌面之间留出自然活动空间', '把常用物品放近，减少反复探身', '感觉某个姿势不舒服时，及时调整'] },
      { title: '利用事情之间的停顿', body: '完成一段工作、接完电话或准备喝水时，顺便起身活动。可以散步、轻轻转动肩部或舒展四肢。动作保持缓慢，在舒服的范围内完成，不猛拉、不强扳。' },
      { title: '不要靠硬撑换效率', body: '休息不是等到疼痛才开始。把提醒放在看得见的地方，让活动成为自然的工作习惯。已经出现持续疼痛或麻木时，不要把反复揉按当成解决办法，应请专业人员评估。' },
    ], visitTitle: '疼痛或麻木反复出现', visitBody: '症状持续、加重或影响活动时，请停止自行强拉、扳动，到正规医疗机构咨询。', sourceLabel: '身体活动与减少久坐（世界卫生组织）', sourceUrl: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity',
  },
  {
    slug: 'hydration', eyebrow: '饮水与习惯', title: '喝水这件小事，怎样更容易记得', shortTitle: '日常饮水', summary: '水杯放近一点，少量分次饮用，也留意自己的饮水限制。', readingTime: '约 3 分钟', icon: GlassWater, accent: '#557e85',
    opening: '忙碌时忘记喝水，是常见的小困扰。与其临时一次喝很多，不如把饮水安排进日常，让它更容易被记起。',
    sections: [
      { title: '把水放在容易看到的地方', body: '出门携带水杯，办公时把饮水放在顺手的位置。起床、用餐和活动后的生活节点，可以成为提醒；并不需要把每次饮水都做成严格任务。', points: ['普通饮水可以优先选择白水', '分次饮用，不用一次大量补喝', '炎热天气和出汗较多时，及时补充并适当休息'] },
      { title: '饮料不能只看名字', body: '一些标着茶、果汁或风味水的饮料仍可能含糖。可以查看包装上的配料与营养信息，把含糖饮料留作偶尔选择。酒精饮品不适合作为日常补水方式。' },
      { title: '个人情况比统一数字更重要', body: '每个人的活动量、天气环境和身体情况不同，不宜照搬别人的饮水量。因心、肾等问题被医师要求限制饮水的人，应遵循已有医嘱；不要因为读到一般建议就自行增加或减少。' },
    ], visitTitle: '饮水后不适或有明确限制', visitBody: '有明确饮水限制、明显不适或持续口渴等困扰时，请向接诊医师咨询，结合个人情况安排。', sourceLabel: 'Water, drinks and hydration（英国 NHS）', sourceUrl: 'https://www.nhs.uk/live-well/eat-well/food-guidelines-and-food-labels/water-drinks-nutrition/',
  },
  {
    slug: 'balanced-meals', eyebrow: '三餐与搭配', title: '一餐有搭配，一天有规律', shortTitle: '三餐搭配', summary: '从常见食物里做搭配，把规律、多样和适量放在前面。', readingTime: '约 3 分钟', icon: Salad, accent: '#8b6a39',
    opening: '日常饮食不必围着一种“养生食材”转。规律吃饭、食物多样、份量合适，是更容易长期做到的基础。',
    sections: [
      { title: '让餐盘里有不同食物', body: '在自己的饮食习惯中，安排蔬菜、谷物和适量蛋白质来源。食物选择可以轮换，不需要每餐都复杂；一顿饭没有搭配完整，也不必用下一顿过量补偿。', points: ['选购时多留意不同种类的蔬菜', '谷物和蛋白质来源适当轮换', '烹调少一些盐、糖和过多油脂'] },
      { title: '给吃饭留一点时间', body: '尽量在相对固定的时段用餐，吃得从容些，留意饥饿和饱足感。经常用零食代替正餐，或工作结束才一次吃很多，往往让规律饮食更难坚持。' },
      { title: '特殊需求要另作安排', body: '食物过敏、孕期、儿童、年长者，以及有慢性病或特殊营养需求的人，适合的搭配和份量可能不同。不要把一般餐盘建议当作个体食谱，也不要自行停药或用某种食材替代治疗。' },
    ], visitTitle: '需要个体化饮食安排时', visitBody: '有疾病、食物过敏或特殊营养需求时，宜向专业医务人员咨询。持续进食困难或明显不适，请及时就医。', sourceLabel: '健康饮食（世界卫生组织）', sourceUrl: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet',
  },
  {
    slug: 'eye-rest', eyebrow: '用眼与休息', title: '从屏幕前抬头，给视线换个距离', shortTitle: '用眼休息', summary: '调好光线与阅读距离，让近距离用眼之间有短暂休息。', readingTime: '约 3 分钟', icon: Eye, accent: '#64806d',
    opening: '阅读、手机和电脑占据了很多时间。给近距离用眼留出间隙，调整照明和姿势，可以让日常阅读更舒服。',
    sections: [
      { title: '先把光线和位置调好', body: '在清楚、柔和的照明下阅读，避免明显眩光。屏幕字体太小时，可以先调大字号；不要为了看清一直把脸靠近屏幕，或在身体扭曲的姿势里长时间使用手机。', points: ['把字号调到能轻松看清', '减少屏幕上的明显反光', '保持自然、舒适的坐姿与阅读距离'] },
      { title: '休息时，看看远处', body: '长时间看近处后，放下屏幕，看看窗外或较远的地方，也可以起身走动。给休息留一点真正离开近距离阅读的时间，不把电脑休息变成持续刷手机。' },
      { title: '别用偏方解决视力变化', body: '一般休息习惯不能治疗眼病，也不能保证改善视力。不要自行使用不明眼药水、按压眼球或用所谓“护眼偏方”。孩子的视力问题、持续看不清或反复不适，应及时接受专业检查。' },
    ], visitTitle: '视力变化或不适持续时', visitBody: '视力突然变化、明显眼痛或持续不适时，请及时到正规医疗机构就诊，不要只靠休息等待。', sourceLabel: '屏幕用眼与休息（Moorfields Eye Hospital，NHS）', sourceUrl: 'https://www.moorfields.nhs.uk/private/about-moorfields-private/blog-articles/10-steps-for-digital-eye-strain-relief',
  },
  {
    slug: 'calm-evening', eyebrow: '情绪与放松', title: '给忙碌的一天，留一个缓冲', shortTitle: '晚间放松', summary: '关小信息声量，用几件简单的事从忙碌过渡到休息。', readingTime: '约 3 分钟', icon: NotebookPen, accent: '#7b7568',
    opening: '从工作切换到休息，有时需要一点过渡。整理明天的安排、减少信息打扰，或做一件安静的小事，都可以成为晚间的缓冲。',
    sections: [
      { title: '把待办事项放到纸上', body: '挑出明天真正需要处理的事，简单写下来。不是把一天重新检讨一遍，而是让自己不用在临睡前反复记住所有细节。可以顺便准备好次日要用的物品。', points: ['只列少量、具体的待办事项', '为工作消息设一个适合自己的结束时间', '把需要讨论的事情留到合适的白天时段'] },
      { title: '选择自己觉得舒服的放松方式', body: '读几页书、听轻缓的音乐、短暂散步或和信任的人聊聊，都可以尝试。不必追求一个标准的“放松仪式”，也不把没有立即放松下来当成失败。' },
      { title: '困扰持续时，寻求支持', body: '情绪困扰并不总能靠改变习惯解决。若长期影响睡眠、工作或人际相处，可以向专业人员寻求帮助。日常放松方法只是一般参考，不能替代心理或医疗评估。' },
    ], visitTitle: '情绪困扰影响日常生活时', visitBody: '持续困扰、睡眠受影响或难以维持日常生活时，请寻求专业帮助，不必独自硬撑。', sourceLabel: 'Stress（世界卫生组织）', sourceUrl: 'https://www.who.int/news-room/questions-and-answers/item/stress',
  },
  {
    slug: 'summer-outdoors', eyebrow: '天气与外出', title: '炎热天气出门，提前做好几件小事', shortTitle: '炎热天外出', summary: '看天气、选时段、带饮水，给户外活动留出休息空间。', readingTime: '约 3 分钟', icon: Sun, accent: '#ae8548',
    opening: '天气炎热时，一次普通的外出也需要多一点准备。把活动时段、遮阴和饮水安排好，比勉强完成原定行程更重要。',
    sections: [
      { title: '先看看当天的天气', body: '留意高温提示，尽量避开最炎热的时段安排长时间户外活动。行程中考虑阴凉处、室内休息点和返回路线，不让自己长时间暴露在热环境里。', points: ['根据天气调整活动时段和长度', '选择轻便合适的衣物与遮阳用品', '带上饮水，安排分次补充和休息'] },
      { title: '照顾同行者的状态', body: '儿童、年长者、孕妇和有慢性病的人，可能需要更多照顾。外出时留意他们是否感到不舒服，不用成人的行程和速度要求所有人；不要将任何人留在停放的车内。' },
      { title: '感到不适，及时结束活动', body: '在炎热环境中出现头晕、明显乏力或恶心等不适，应停止活动、离开热环境并寻求帮助。不要用继续走路、运动或“出透汗”来应对不适。' },
    ], visitTitle: '热环境中的不适明显或加重', visitBody: '如出现意识异常、昏倒等严重情况，请立即拨打 120，按急救人员指导处理，不要继续原定行程。', sourceLabel: 'Heat and health（世界卫生组织）', sourceUrl: 'https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health',
  },
  {
    slug: 'cooler-days', eyebrow: '换季与生活', title: '天气转凉，把生活调整得刚刚好', shortTitle: '转凉时节', summary: '按实际气温添衣，保持活动与通风，减少过度进补。', readingTime: '约 3 分钟', icon: Shirt, accent: '#9b804e',
    opening: '换季并不意味着必须更换一整套养生办法。关注实际气温、自己的感受和原有生活节奏，把衣着、环境与活动稍作调整就好。',
    sections: [
      { title: '衣着随气温变化', body: '早晚温差明显时，可以选择便于增减的衣物。不要只按日期判断冷暖，也不用为了某种说法刻意挨冻或捂得过热。活动前后和进出空调环境时，留意身体感受。', points: ['外出前看气温和降雨情况', '备一件便于穿脱的外衣', '衣物潮湿后及时更换'] },
      { title: '室内舒服，也要换换空气', body: '根据天气和空气状况适时通风，让生活空间保持清洁。睡眠、用餐与活动继续保持相对规律，不因为天气变凉就整天静坐或长时间待在密闭环境里。' },
      { title: '不把换季等同于进补', body: '没有适合所有人的统一进补方法。日常饮食仍以规律、多样和适量为基础；药食同源材料、补充剂或中药的使用，要结合个人情况，必要时咨询专业人员，不自行照搬他人的做法。' },
    ], visitTitle: '不适反复或影响生活时', visitBody: '症状持续、加重或影响正常生活时，请向专业医务人员咨询，不把持续不适都归为“换季”。', sourceLabel: '中医药健康促进行动（国务院政策文件）', sourceUrl: 'https://www.gov.cn/zhengce/zhengceku/202504/P020250414516765123320.pdf',
  },
);

export function getWellnessArticle(slug: WellnessArticle['slug']) {
  return wellnessArticles.find((article) => article.slug === slug)!;
}
