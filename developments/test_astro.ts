import { getCollection } from 'astro:content';

async function test() {
  const articles = await getCollection('articles');
  console.log(`Total articles: ${articles.length}`);
  articles.forEach(a => {
    console.log(`- ID: ${a.id}, Lang: ${a.data.lang}, Draft: ${a.data.draft}`);
  });
}

test();
