import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { stripLangPrefix } from '../i18n';

export async function GET(context: APIContext) {
  const articles = await getCollection('articles', ({ data }) => data.lang === 'fa' && !data.draft);
  const sorted = articles.sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());

  return rss({
    title: 'مهدی سالم',
    description: 'پژوهشگر مستقل فلسفه تحلیلی و اخلاق، نویسنده سیاسی',
    site: context.site!.toString(),
    items: sorted.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.publishDate,
      link: `/articles/${stripLangPrefix(article.id)}`,
    })),
    customData: '<language>fa</language>',
  });
}
