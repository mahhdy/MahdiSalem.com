# تحلیل ساختار پروژه

## 1. فایل `src/content/config.ts`

این فایل در مسیر `src/content/` وجود ندارد.
پروژه از یک سیستم پردازش محتوای سفارشی (`scripts/process-content.mjs`) استفاده می‌کند که فایل‌های منبع (Markdown, LaTeX, Docx) را پردازش کرده و به `src/content/` منتقل می‌کند.
اسکیمای محتوا به صورت ضمنی در کلاس `ContentPipeline` و متد `buildFrontmatter` تعریف شده است.

## 2. ساختار پوشه `src/content/`

ساختار فعلی به صورت زیر است:

```
src/content/
├── articles/
│   ├── fa/
│   └── en/
├── books/
│   ├── fa/
│   └── en/
├── statements/
│   ├── fa/
│   └── en/
└── wiki/
    ├── fa/
    └── en/
```

## 3. نمونه Frontmatter

### مقاله (Article)

```yaml
---
title: "عنوان مقاله"
description: "توضیحات مقاله"
lang: fa
publishDate: 2025-03-04
categories:
  - "دسته بندی"
tags:
  - "تگ ۱"
  - "تگ ۲"
draft: true
---
```

### فصل کتاب (Book Chapter)

```yaml
---
title: "عنوان فصل"
description: ""
lang: "fa"
book: "نام-کتاب"
bookSlug: "book-slug"
sectionType: "chapter"
chapterNumber: 1
order: 1
readingTime: 5
---
```

### بیانیه (Statement)

```yaml
---
title: "عنوان بیانیه"
description: "توضیحات بیانیه"
lang: fa
publishDate: 2025-03-01
type: statement
---
```

### صفحه ویکی (Wiki)

```yaml
---
title: "عنوان صفحه"
description: "توضیحات"
lang: fa
section: "بخش مربوطه"
order: 1
lastUpdated: 2025-03-15
---
```

## 4. فایل `astro.config.mjs`

```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { remarkMermaid } from './src/plugins/remark-mermaid.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://mahdisalem.com',
  output: 'static',
  i18n: {
    defaultLocale: 'fa',
    locales: ['fa', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
    remarkPlugins: [remarkMermaid],
  },
});
```

## 5. وضعیت i18n

بله، از i18n داخلی Astro استفاده می‌شود.

- **پیکربندی**: در `astro.config.mjs` تعریف شده است (`locales: ['fa', 'en']`).
- **ساختار**: محتوا در پوشه‌های `fa` و `en` در هر کالکشن جدا شده است.
- **مسیریابی**: `prefixDefaultLocale: false` تنظیم شده (زبان پیش‌فرض `fa` بدون پیشوند است).

## 6. ذخیره‌سازی تصاویر و رسانه‌ها

- **تصاویر عمومی**: `public/images/`
- **دیاگرام‌ها (Mermaid/TikZ)**: `public/diagrams/`
- **تصاویر استخراج شده از اسناد**: `public/images/extracted/`

## 7. سیستم تگ/دسته‌بندی

- **Articles**: از فیلدهای `tags` (لیست) و `categories` (لیست) در Frontmatter استفاده می‌کنند.
- **Wiki**: از `section` برای گروه‌بندی موضوعی استفاده می‌کند.
- **Books**: ساختار سلسله‌مراتب دارند (slug کتاب و شماره فصل).
- **AI Tagging**: اسکریپت پردازش محتوا قابلیت برچسب‌گذاری خودکار با AI را دارد که فیلدهای `keywords`، `category`، `difficulty` و `summary` را اضافه می‌کند.
