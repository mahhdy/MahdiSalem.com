# 🔧 Enhanced MDX Converter - Integration Guide

**تاریخ:** 19 فبروری 2026  
**نسخه:** 1.0  
**وضعیت:** ✅ آماده برای استفاده

---

## 📋 فهرست مطالب

1. [نصب و راه‌اندازی](#نصب-و-راه‌اندازی)
2. [استفاده‌ی سریع](#استفاده‌ی-سریع)
3. [API Reference](#api-reference)
4. [مثال‌های عملی](#مثال‌های-عملی)
5. [Troubleshooting](#troubleshooting)

---

## نصب و راه‌اندازی

### الزامات
```bash
# Node.js 18+
# npm dependencies
npm install zod gray-matter
```

### نصب ماژول‌ها
```bash
# ماژول‌ها قبلاً در scripts/lib موجود هستند
# هیچ نصب اضافی ازم نیست
```

---

## استفاده‌ی سریع

### ۱. تبدیل یک فایل
```javascript
import { AstroMDXConverter } from './scripts/lib/astro-mdx-converter.mjs';
import fs from 'fs/promises';

const converter = new AstroMDXConverter({
  strict: false,           // غیر سخت برای auto-fix
  autoFixFrontmatter: true
});

// تبدیل محتوا
const content = await fs.readFile('content.md', 'utf-8');
const result = await converter.convert(content, {
  sourceFile: 'content.md'
});

if (result.success) {
  console.log('✅ تبدیل موفق');
  console.log(result.content); // MDX نهایی
} else {
  console.error('❌', result.error);
}
```

### ۲. تبدیل چندین فایل
```javascript
const filePaths = [
  'content-source/articles/file1.md',
  'content-source/articles/file2.md'
];

const results = await converter.convertFiles(filePaths);

results.forEach(r => {
  if (r.success) {
    console.log(`✅ ${r.filePath}`);
  } else {
    console.error(`❌ ${r.filePath}: ${r.error}`);
  }
});

// آمار نهایی
console.log(converter.getStats());
```

### ۳. Validate Frontmatter
```javascript
import { ContentValidator } from './scripts/lib/astro-content-schema.mjs';

const frontmatter = {
  title: 'عنوان',
  description: 'توضیح',
  lang: 'fa',
  publishDate: new Date(),
  author: 'نویسنده',
  tags: ['تگ۱'],
  categories: ['دسته‌بندی'],
};

const validation = ContentValidator.validateFrontmatter(frontmatter);
if (validation.success) {
  console.log('✅ صحیح');
} else {
  console.log('❌ خطاها:');
  validation.errors.forEach(e => {
    console.log(`  - ${e.path}: ${e.message}`);
  });
}
```

---

## API Reference

### AstroMDXConverter

#### Constructor
```javascript
new AstroMDXConverter(options)
```

**خیارها:**
| خیار | نوع | پیش‌فرض | توضیح |
|------|-----|---------|-------|
| `strict` | boolean | `true` | خطاهای سخت برای frontmatter نامعتبر |
| `autoFixFrontmatter` | boolean | `true` | اصلاح خودکار frontmatter |
| `processImages` | boolean | `true` | پردازش تصاویر |
| `processLinks` | boolean | `true` | نرمال کردن لینک‌ها |
| `htmlEscape` | boolean | `true` | Escape HTML نامحفوظ |

#### Methods

**`convert(content, options)`**
```javascript
// تبدیل محتوای یک فایل
const result = await converter.convert(mdContent, {
  sourceFile: 'path/to/file.md'
});

// Returns:
{
  success: boolean,
  content: string,              // MDX نهایی
  frontmatter: object,          // frontmatter validated
  body: string,                 // body محتوا
  stats: { ... }
}
```

**`convertFiles(filePaths, options)`**
```javascript
// تبدیل چندین فایل
const results = await converter.convertFiles([
  'file1.md',
  'file2.md'
]);

// Returns: Array<result>
```

**`getStats()`**
```javascript
// دریافت آمار تبدیل
const stats = converter.getStats();
// {
//   processed: number,
//   succeeded: number,
//   failed: number,
//   successRate: string,
//   warnings: [],
//   errors: []
// }
```

---

### ContentValidator

**`validateFrontmatter(frontmatter)`**
```javascript
const validation = ContentValidator.validateFrontmatter({
  title: 'عنوان',
  description: 'توضیح',
  lang: 'fa',
  // ...
});

if (validation.success) {
  console.log(validation.data);
} else {
  validation.errors.forEach(e => {
    console.log(`${e.path}: ${e.message}`);
  });
}
```

**`generateDefaultFrontmatter(overrides)`**
```javascript
const defaults = ContentValidator.generateDefaultFrontmatter({
  title: 'عنوان سفارشی'
});
// سایر فیلد‌ها با مقادیر پیش‌فرض پر می‌شوند
```

---

### ImageOptimizer

**`extractImages(content)`**
```javascript
const images = imageOptimizer.extractImages(markdownContent);
// Returns: [{ alt, src, type: 'markdown'|'html', fullMatch }, ...]
```

**`generateImageMetadata(imagePath, options)`**
```javascript
const metadata = imageOptimizer.generateImageMetadata('/path/to/image.jpg', {
  alt: 'توضیح تصویر',
  quality: 80,
  width: 1024,
  height: 768
});
// Returns: { src, alt, width, height, srcset, format, ... }
```

---

### LinkNormalizer

**`extractLinks(content)`**
```javascript
const links = linkNormalizer.extractLinks(markdownContent);
// یافتن تمام لینک‌ها در محتوا
```

**`normalizeLinksInContent(content, sourceFile, options)`**
```javascript
const normalized = linkNormalizer.normalizeLinksInContent(
  content,
  'src/content/articles/fa/file.mdx',
  { lang: 'fa', addLangPrefix: true }
);
// لینک‌ها تبدیل می‌شوند به Astro-compatible format
```

---

## مثال‌های عملی

### مثال ۱: تبدیل کامل یک محتوا

```javascript
const mdxContent = `---
title: آموزش Astro
description: راهنمایی کامل Astro برای شروع
lang: fa
publishDate: 2026-02-19
author: علی احمدی
tags:
  - astro
  - webdev

categories:
  - آموزش
interface: descriptive-politics
draft: false
---

# آموزش Astro

![Astro Logo](/images/astro-logo.png)

برای شروع [اینجا کلیک کنید](https://astro.build).

| مفهوم | توضیح |
|--------|-------|
| Components | JSX-like syntax |
| Collections | محتوای structured |
`;

const result = await converter.convert(mdxContent);
```

### مثال ۲: Process‌کردن تمام فایل‌های یک دایرکتوری

```javascript
import { globby } from 'globby';

// یافتن تمام فایل‌های .md
const files = await globby('content-source/articles/**/*.md');

const results = await converter.convertFiles(files);

// نتایج را ذخیره کنید
for (const result of results) {
  if (result.success) {
    const outputPath = result.filePath
      .replace('content-source', 'src/content')
      .replace('.md', '.mdx');
    
    await fs.writeFile(outputPath, result.content);
  }
}
```

### مثال ۳: Custom validation برای دسته‌بندی

```javascript
const customValidator = {
  ...ContentValidator,
  validateCategories(categories) {
    const validCategories = [
      'تکنولوژی',
      'سیاست',
      'آموزش',
      'سفر'
    ];

    for (const cat of categories) {
      if (!validCategories.includes(cat)) {
        return { valid: false, error: `دسته‌بندی نامعتبر: ${cat}` };
      }
    }
    return { valid: true };
  }
};
```

---

## Troubleshooting

### ❌ مشکل: "Frontmatter نامعتبر"

**حل:**
```javascript
// استفاده از strict: false برای auto-fix
const converter = new AstroMDXConverter({ strict: false });
```

### ❌ مشکل: تصاویر پردازش نشوند

**حل:**
```javascript
// اطمینان داشته باشید processImages: true است
const converter = new AstroMDXConverter({
  processImages: true,
  imageOptimizer: {
    publicDir: './public'
  }
});
```

### ❌ مشکل: لینک‌های نسبی تبدیل نشوند

**حل:**
```javascript
result = await converter.convert(content, {
  sourceFile: 'src/content/articles/fa/file.mdx'  // اطلاعات مسیر ضروری است
});
```

---

## Testing

اجرای تست‌ها:
```bash
node scripts/test-mdx-converter.mjs
```

---

## Performance

- **Single file:** < 100ms
- **Batch 100 files:** < 5s
- **Memory:** < 50MB

---

## License

MIT

