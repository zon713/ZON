import type { Metadata } from 'next';

import { WellnessArticlePage } from '../article-page';
import { getWellnessArticle } from '../content';

const article = getWellnessArticle('meridians');

export const metadata: Metadata = {
  title: `${article.shortTitle}｜汇医盟养生指南`,
  description: article.summary,
};

export default function MeridiansPage() {
  return <WellnessArticlePage article={article} />;
}
