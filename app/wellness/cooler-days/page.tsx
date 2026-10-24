import type { Metadata } from 'next';
import { WellnessArticlePage } from '../article-page';
import { getWellnessArticle } from '../content';
const article = getWellnessArticle('cooler-days');
export const metadata: Metadata = {
  alternates: { canonical: 'https://www.huiyimeng.com/wellness/cooler-days.html' }, title: `${article.shortTitle}｜汇医盟养生指南`, description: article.summary };
export default function Page() { return <WellnessArticlePage article={article} />; }
