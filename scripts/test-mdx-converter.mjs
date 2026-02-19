#!/usr/bin/env node
/**
 * Test و Validation Script برای Enhanced MDX Converter
 * اجرا: node scripts/test-mdx-converter.mjs
 */

import { AstroMDXConverter } from './lib/astro-mdx-converter.mjs';
import { ContentValidator } from './lib/astro-content-schema.mjs';
import { ImageOptimizer } from './lib/image-optimizer.mjs';
import { LinkNormalizer } from './lib/link-normalizer.mjs';

console.log('🧪 MDX Converter Test Suite\n');
console.log('═'.repeat(60));

// ═══════════════════════════════════════════════════════════════
// Test ۱: Content Validation
// ═══════════════════════════════════════════════════════════════

console.log('\n📋 Test ۱: Frontmatter Validation');
console.log('─'.repeat(60));

const testFrontmatter = {
  title: 'تست تبدیل MDX',
  description: 'این یک تست برای سیستم تبدیل است',
  lang: 'fa',
  publishDate: new Date('2026-02-15'), // گذشته برای test
  author: 'تست',
  tags: ['تست', 'MDX'],
  categories: ['تکنولوژی'],
  interface: 'descriptive-politics',
  draft: false,
};

const validation = ContentValidator.validateFrontmatter(testFrontmatter);
if (validation.success) {
  console.log('✅ Frontmatter معتبر است');
  console.log(`   Title: ${validation.data.title}`);
  console.log(`   Lang: ${validation.data.lang}`);
  console.log(`   Tags: ${validation.data.tags.join(', ')}`);
} else {
  console.log('❌ خطا:');
  validation.errors.forEach(e => console.log(`   - ${e.path}: ${e.message}`));
}

// ═══════════════════════════════════════════════════════════════
// Test ۲: Image Processing
// ═══════════════════════════════════════════════════════════════

console.log('\n🖼️ Test ۲: Image Extraction & Processing');
console.log('─'.repeat(60));

const imageOptimizer = new ImageOptimizer();

const testContent = `
# مقالە

![عکس ۱](/images/test.jpg)

متن میانی

<img src="/images/test2.png" alt="عکس ۲" />
`;

const extractedImages = imageOptimizer.extractImages(testContent);
console.log(`✅ تعداد تصاویری یافت شده: ${extractedImages.length}`);
extractedImages.forEach((img, i) => {
  console.log(`   ${i + 1}. ${img.alt} (${img.type})`);
});

// ═══════════════════════════════════════════════════════════════
// Test ۳: Link Normalization
// ═══════════════════════════════════════════════════════════════

console.log('\n🔗 Test ۳: Link Normalization');
console.log('─'.repeat(60));

const linkNormalizer = new LinkNormalizer();

const contentWithLinks = `
[لینک داخلی](../folder/file.md)
[لینک خارجی](https://example.com)
[تابع](https://github.com/user/repo)
[Anchor](#section)
`;

const links = linkNormalizer.extractLinks(contentWithLinks);
console.log(`✅ تعداد لینک‌های یافت شده: ${links.length}`);
links.forEach((link, i) => {
  const linkType = linkNormalizer.detectLinkType(link.href);
  console.log(`   ${i + 1}. ${link.text} (${linkType})`);
});

// ═══════════════════════════════════════════════════════════════
// Test ۴: Main Converter
// ═══════════════════════════════════════════════════════════════

console.log('\n⚙️ Test ۴: Full MDX Conversion');
console.log('─'.repeat(60));

const converter = new AstroMDXConverter({
  strict: false,
  autoFixFrontmatter: true,
});

const testMDX = `---
title: تست کامل تبدیل
description: این یک تست جامع برای سیستم تبدیل است
lang: fa
publishDate: 2026-02-19
author: تست سیستم
tags:
  - تست
  - MDX
categories:
  - تکنولوژی
interface: descriptive-politics
draft: false
---

# مقدمە

این یک **متن تست** است.

## بخش اول

متن مع [لینک داخلی](./another-file.md) و [لینک خارجی](https://example.com).

| سر ستون ۱ | سرستون ۲ |
|---------|---------|
| داده ۱  | داده ۲  |

![تصویر تست](/images/test.jpg)

## بخش دوم

- لیست اول
- لیست دوم
`;

(async () => {
  const result = await converter.convert(testMDX);

  if (result.success) {
    console.log('✅ تبدیل موفق!');
    console.log(`   Frontmatter fields: ${Object.keys(result.frontmatter).length}`);
    console.log(`   Body length: ${result.body.length} characters`);
    console.log(`   Final MDX length: ${result.content.length} characters`);

    // نمایش بخشی از نتیجە
    console.log('\n📄 نمونەی خروجی (۱۰۰ کاراکتر اول):');
    console.log('─'.repeat(60));
    console.log(result.content.substring(0, 100) + '...');
  } else {
    console.log(`❌ خطا: ${result.error}`);
  }

  // Stats
  const stats = converter.getStats();
  console.log('\n📊 آمار:');
  console.log('─'.repeat(60));
  console.log(`   پردازش شده: ${stats.processed}`);
  console.log(`   موفق: ${stats.succeeded}`);
  console.log(`   ناموفق: ${stats.failed}`);
  console.log(`   درصد موفقیت: ${stats.successRate}`);
  console.log(`   هشدارها: ${stats.warnings.length}`);
  console.log(`   خطاها: ${stats.errors.length}`);

  if (stats.warnings.length > 0) {
    console.log('\n⚠️ هشدارها:');
    stats.warnings.forEach(w => console.log(`   - ${w}`));
  }

  console.log('\n' + '═'.repeat(60));
  console.log('✅ تمام تست‌ها اجرا شدند');
})();
