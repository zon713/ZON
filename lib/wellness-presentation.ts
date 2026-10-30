export const wellnessCategories = ['全部', '时令', '饮食', '作息', '活动'] as const;
export type WellnessCategory = typeof wellnessCategories[number];

const themes: Record<string, { category: WellnessCategory; alt: string; caption: string }> = {
  seasons: { category: '时令', alt: '枝叶、日光与山水组成的四季生活插图', caption: '观察天气，也照顾自己的生活节奏。' },
  'food-and-tea': { category: '饮食', alt: '茶壶、茶杯与日常食材插图', caption: '饮食多样，茶饮有度。' },
  sleep: { category: '作息', alt: '月光下安静卧室与床头灯的插图', caption: '把夜晚留给休息。' },
  meridians: { category: '活动', alt: '轻柔伸展的人物与流动线条插图', caption: '动作轻缓，以舒适为度。' },
  'daily-walking': { category: '活动', alt: '沿树荫小路步行的人物插图', caption: '从一段舒服的步行开始。' },
  'desk-breaks': { category: '活动', alt: '书桌、座椅与窗外绿植的插图', caption: '工作间隙，给身体一点活动空间。' },
  hydration: { category: '饮食', alt: '透明水杯、水壶与波纹插图', caption: '让喝水成为容易记得的小习惯。' },
  'balanced-meals': { category: '饮食', alt: '蔬菜、谷物与蛋白质食物组成的餐盘插图', caption: '一餐有搭配，一天有规律。' },
  'eye-rest': { category: '作息', alt: '从书本和屏幕望向窗外树木的插图', caption: '抬头看看远处，让视线换个距离。' },
  'calm-evening': { category: '作息', alt: '暖色台灯、笔记本和绿叶的夜晚插图', caption: '给忙碌的一天留一个缓冲。' },
  'summer-outdoors': { category: '时令', alt: '遮阳帽、水杯和树荫的户外插图', caption: '外出前，看天气，备好饮水。' },
  'cooler-days': { category: '时令', alt: '围巾、外衣与秋冬枝叶的插图', caption: '随气温增减衣物，保持室内通风。' },
};

export function articleVisual(slug: string) {
  return { ...themes[slug], image: `/wellness-art/${slug}.svg` };
}
