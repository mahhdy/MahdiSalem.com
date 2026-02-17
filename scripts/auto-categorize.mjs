#!/usr/bin/env node
/**
 * Auto-categorize articles and books based on titles and content
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Category mapping based on keywords
const CATEGORY_MAP = {
  'انقلاب‌شناسی': ['انقلاب', 'revolution', 'روسیه', 'فرانسه', 'آمریکا', 'انقلابی'],
  'گذار دموکراتیک': ['گذار', 'transition', 'دوره گذار', 'مدیریت'],
  'فلسفه سیاسی': ['فلسفه', 'philosophy', 'یوتوپیا', 'ایدئولوژی', 'چپ', 'راست', 'لیبرتارینیسم'],
  'اخلاق': ['اخلاق', 'ethics', 'اخلاقی', 'moral'],
  'نظریه سیاسی': ['نظریه', 'theory', 'تحلیل', 'analysis'],
  'ارتش و نظامیگری': ['ارتش', 'army', 'نظامی', 'military', 'کودتا'],
  'اصلاحات سیاسی': ['اصلاح', 'reform', 'تغییر', 'change', 'رژیم'],
  'دموکراسی': ['دموکراسی', 'democracy', 'آزادی', 'freedom'],
  'استبداد': ['استبداد', 'authoritarianism', 'دیکتاتوری', 'dictatorship'],
};

async function categorizeFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const { data, content: markdown } = matter(content);

  const title = data.title || '';
  const description = data.description || '';
  const fullText = (title + ' ' + description + ' ' + markdown.substring(0, 500)).toLowerCase();

  // Find matching categories
  const categories = [];
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    for (const keyword of keywords) {
      if (fullText.includes(keyword.toLowerCase())) {
        categories.push(category);
        break;
      }
    }
  }

  // If no category found, assign "متفرقه" (Miscellaneous)
  if (categories.length === 0) {
    categories.push('متفرقه');
  }

  // Update frontmatter if categories changed
  if (JSON.stringify(data.categories || []) !== JSON.stringify(categories)) {
    data.categories = categories;
    const newContent = matter.stringify(markdown, data);
    await fs.writeFile(filePath, newContent, 'utf-8');
    return { file: path.basename(filePath), categories, updated: true };
  }

  return { file: path.basename(filePath), categories, updated: false };
}

async function main() {
  const articlesDir = path.join(__dirname, '../src/content/articles/fa');
  const booksDir = path.join(__dirname, '../src/content/books/fa');

  console.log('🏷️  شروع دسته‌بندی خودکار...\n');

  // Process articles
  console.log('📄 مقالات:');
  const articleFiles = await fs.readdir(articlesDir);
  for (const file of articleFiles) {
    if (file.endsWith('.md') || file.endsWith('.mdx')) {
      const filePath = path.join(articlesDir, file);
      try {
        const result = await categorizeFile(filePath);
        const status = result.updated ? '✅ به‌روز شد' : '⏭️  بدون تغییر';
        console.log(`   ${status}: ${result.file}`);
        console.log(`      دسته‌ها: ${result.categories.join(', ')}`);
      } catch (error) {
        console.log(`   ❌ خطا: ${file} - ${error.message}`);
      }
    }
  }

  console.log('\n📚 کتاب‌ها:');
  const bookDirs = await fs.readdir(booksDir);
  for (const bookDir of bookDirs) {
    const indexPath = path.join(booksDir, bookDir, 'index.md');
    try {
      await fs.access(indexPath);
      const result = await categorizeFile(indexPath);
      const status = result.updated ? '✅ به‌روز شد' : '⏭️  بدون تغییر';
      console.log(`   ${status}: ${bookDir}/index.md`);
      console.log(`      دسته‌ها: ${result.categories.join(', ')}`);
    } catch (error) {
      // Skip if index.md doesn't exist
    }
  }

  console.log('\n✨ دسته‌بندی کامل شد!');
}

main().catch(console.error);
