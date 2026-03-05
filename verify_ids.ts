import { getCollection } from 'astro:content';

async function verify() {
  const articles = await getCollection('articles');
  console.log(`Articles found: ${articles.length}`);
  articles.forEach(a => {
    if (a.id.includes('tttt')) {
       console.log(`FOUND tttt: ID="${a.id}", Slug="${a.id.replace(/^en\//, '')}"`);
    }
  });
}
verify();
