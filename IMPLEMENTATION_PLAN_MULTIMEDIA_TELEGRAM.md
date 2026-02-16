# Implementation Plan: Multimedia Content & Telegram Feed Integration

## Context

این طرح برای پیاده‌سازی دو قابلیت موکول شده از PR قبلی است:

### ۱. سیستم محتوای چندرسانه‌ای (Multimedia Content)
کاربر می‌خواهد سیستمی برای مدیریت و نمایش محتوای ویدیویی، صوتی و پادکست‌ها داشته باشد. این محتوا باید:
- به صورت دوزبانه (فارسی/انگلیسی) پشتیبانی شود
- دارای player مخصوص (ویدیو/صدا) باشد
- در ساختار موجود سایت (Content Collections) جای بگیرد
- الگوی مشابه Articles/Books را دنبال کند

### ۲. نمایش فید تلگرام (Telegram Feed)
کاربر می‌خواهد 3-5 پست آخر کانال تلگرامش در صفحه اصلی نمایش داده شود با:
- تعداد بازدید و کامنت‌ها
- لینک به کانال برای مشاهده کامل
- بروزرسانی خودکار یا زمان‌بندی شده
- استفاده از Cloudflare Worker برای Telegram API

### زیرساخت موجود:
- سیستم Content Collections با Astro
- الگوی PDFViewer برای player components
- سیستم دوزبانه کامل (FA/EN)
- CategoryTabView برای سازماندهی محتوا
- Static site با امکان API routes

---

## Feature 1: سیستم محتوای چندرسانه‌ای

### معماری راه‌حل

یک Content Collection جدید با نام `multimedia` ایجاد می‌کنیم که انواع مختلف رسانه را پشتیبانی کند:
- **Video**: ویدیوهای YouTube, Vimeo, یا self-hosted
- **Audio**: فایل‌های صوتی MP3/OGG
- **Podcast**: اپیزودهای پادکست با متادیتای کامل

### مراحل پیاده‌سازی

#### مرحله 1: تعریف Schema

**فایل**: `src/content.config.ts`

```typescript
const multimedia = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/multimedia' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lang: z.enum(['fa', 'en']),
    publishDate: z.coerce.date(),

    // Media Type
    type: z.enum(['video', 'audio', 'podcast']),

    // Media URLs
    mediaUrl: z.string(),  // Main media file/embed URL
    thumbnailUrl: z.string().optional(),

    // Media Metadata
    duration: z.number().optional(),  // Duration in seconds
    platform: z.enum(['youtube', 'vimeo', 'soundcloud', 'self-hosted']).optional(),

    // Podcast-specific
    episodeNumber: z.number().optional(),
    seasonNumber: z.number().optional(),
    podcastName: z.string().optional(),

    // Standard fields
    author: z.string().default('مهدی سالم'),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    coverImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// Add to collections export
export const collections = {
  articles,
  books,
  statements,
  wiki,
  multimedia, // NEW
};
```

#### مرحله 2: ایجاد Player Components

**فایل جدید**: `src/components/VideoPlayer.astro`

الگوبرداری از `PDFViewer.astro`:
- Props: `videoUrl`, `thumbnailUrl`, `platform`, `lang`
- پشتیبانی از YouTube/Vimeo embed
- پشتیبانی از HTML5 video برای self-hosted
- کنترل‌های مخصوص (play/pause, volume, fullscreen)
- دارک مود
- RTL layout awareness

**فایل جدید**: `src/components/AudioPlayer.astro`

- Props: `audioUrl`, `title`, `lang`
- استفاده از HTML5 `<audio>` element
- Custom UI controls
- Waveform visualization (optional با wavesurfer.js)
- Playlist support برای چند اپیزود

**فایل جدید**: `src/components/PodcastPlayer.astro`

- Extends AudioPlayer
- نمایش شماره اپیزود/فصل
- لینک به سایر اپیزودها
- Subscribe button

#### مرحله 3: ایجاد صفحات

**ساختار محتوا**:
```
src/content/multimedia/
├── fa/
│   ├── video-interview-democracy.md
│   ├── podcast-ep01-ethics.md
│   └── audio-speech-2024.md
└── en/
    └── video-lecture-philosophy.md
```

**صفحات جدید**:

1. `src/pages/multimedia/index.astro` (فارسی)
2. `src/pages/en/multimedia/index.astro` (انگلیسی)
3. `src/pages/multimedia/[slug].astro` (صفحه جزئیات)
4. `src/pages/en/multimedia/[slug].astro`

الگو از `articles/index.astro`:
- لیست همه محتوای چندرسانه‌ای
- فیلتر بر اساس نوع (video/audio/podcast)
- جستجو و مرتب‌سازی
- CategoryTabView integration
- نمایش thumbnail و duration

الگو از `articles/[slug].astro`:
- نمایش player مناسب بر اساس نوع
- متادیتا (تاریخ، نویسنده، مدت زمان)
- توضیحات و محتوای Markdown
- تگ‌ها و دسته‌بندی‌ها
- محتوای مرتبط

#### مرحله 4: UI Strings

**فایل**: `src/i18n/fa.json` و `en.json`

```json
{
  "multimedia": {
    "title": "محتوای چندرسانه‌ای / Multimedia",
    "video": "ویدیو / Video",
    "audio": "صوتی / Audio",
    "podcast": "پادکست / Podcast",
    "duration": "مدت زمان / Duration",
    "episode": "قسمت / Episode",
    "season": "فصل / Season",
    "play": "پخش / Play",
    "pause": "توقف / Pause",
    "volume": "صدا / Volume",
    "fullscreen": "تمام صفحه / Fullscreen",
    "download": "دانلود / Download",
    "subscribe": "اشتراک / Subscribe",
    "view_on_platform": "مشاهده در {platform} / View on {platform}"
  }
}
```

#### مرحله 5: Navigation Integration

**فایل**: `src/components/Header.astro`

افزودن لینک "محتوای چندرسانه‌ای / Multimedia" به منوی اصلی

**فایل**: `src/pages/index.astro` (صفحه اصلی)

افزودن بخش "آخرین ویدیوها" یا "پادکست‌های اخیر" به homepage

---

## Feature 2: نمایش فید تلگرام

### معماری راه‌حل

چون سایت Static است، نمی‌توانیم مستقیماً در browser به Telegram API دسترسی داشته باشیم. استراتژی:

1. **Cloudflare Worker** برای fetch کردن دیتا از Telegram API
2. **Caching** در Cloudflare KV برای کاهش تعداد درخواست‌ها
3. **Client-side fetch** از Worker endpoint
4. **Component** برای نمایش پست‌ها در homepage

### مراحل پیاده‌سازی

#### مرحله 1: Cloudflare Worker Setup

**فایل جدید**: `workers/telegram-feed.js`

```javascript
export default {
  async fetch(request, env) {
    const CHANNEL_USERNAME = env.TELEGRAM_CHANNEL; // e.g., '@yourusername'
    const BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
    const CACHE_KEY = 'telegram_feed_cache';
    const CACHE_TTL = 300; // 5 minutes

    // Check cache first
    const cachedData = await env.KV.get(CACHE_KEY, 'json');
    if (cachedData) {
      return new Response(JSON.stringify(cachedData), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    // Fetch from Telegram API
    const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Process and extract latest 5 posts
    const posts = processTeleg ramData(data); // Helper function

    // Cache the result
    await env.KV.put(CACHE_KEY, JSON.stringify(posts), {
      expirationTtl: CACHE_TTL,
    });

    return new Response(JSON.stringify(posts), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300',
      },
    });
  },
};

function processTelegramData(data) {
  // Extract posts, views, comments
  // Return structured data
  return data.result.slice(-5).map(item => ({
    id: item.message_id,
    text: item.text || item.caption,
    date: item.date,
    views: item.views || 0,
    link: `https://t.me/${CHANNEL_USERNAME}/${item.message_id}`,
  }));
}
```

**Deployment**:
```bash
npm install -g wrangler
wrangler init telegram-feed
wrangler publish
```

**Environment Variables** (در Cloudflare Dashboard):
- `TELEGRAM_CHANNEL`: نام کانال
- `TELEGRAM_BOT_TOKEN`: توکن ربات تلگرام

#### مرحله 2: TelegramFeed Component

**فایل جدید**: `src/components/TelegramFeed.astro`

```astro
---
import { t } from '../i18n';
import type { Locale } from '../i18n';

interface Props {
  lang: Locale;
  limit?: number;
}

const { lang, limit = 5 } = Astro.props;
const workerUrl = import.meta.env.PUBLIC_TELEGRAM_WORKER_URL;
---

<div class="telegram-feed" data-worker-url={workerUrl} data-limit={limit} data-lang={lang}>
  <h2 class="text-2xl font-bold mb-6">
    {t('telegram.latest_posts', lang)}
  </h2>

  <div class="feed-loading">
    <svg class="animate-spin h-8 w-8" ...>...</svg>
    <p>{t('telegram.loading', lang)}</p>
  </div>

  <div class="feed-error hidden">
    <p class="text-red-500">{t('telegram.error', lang)}</p>
  </div>

  <div class="feed-posts grid gap-4">
    <!-- Posts will be injected here -->
  </div>

  <a href={`https://t.me/${import.meta.env.PUBLIC_TELEGRAM_CHANNEL}`}
     class="view-channel-btn mt-6 inline-block">
    {t('telegram.view_channel', lang)} →
  </a>
</div>

<script>
  document.querySelectorAll('.telegram-feed').forEach(async (container) => {
    const workerUrl = container.dataset.workerUrl;
    const limit = parseInt(container.dataset.limit || '5');
    const lang = container.dataset.lang;

    const loadingEl = container.querySelector('.feed-loading');
    const errorEl = container.querySelector('.feed-error');
    const postsEl = container.querySelector('.feed-posts');

    try {
      const response = await fetch(workerUrl);
      const posts = await response.json();

      loadingEl.classList.add('hidden');

      posts.slice(0, limit).forEach(post => {
        const postCard = createPostCard(post, lang);
        postsEl.appendChild(postCard);
      });

    } catch (error) {
      console.error('Telegram feed error:', error);
      loadingEl.classList.add('hidden');
      errorEl.classList.remove('hidden');
    }
  });

  function createPostCard(post, lang) {
    const card = document.createElement('div');
    card.className = 'post-card p-4 border rounded-lg hover:shadow-lg transition';
    card.dir = lang === 'fa' ? 'rtl' : 'ltr';

    const formattedDate = new Intl.DateTimeFormat(
      lang === 'fa' ? 'fa-IR' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    ).format(new Date(post.date * 1000));

    card.innerHTML = `
      <div class="post-meta text-sm text-gray-500 mb-2">
        <span>${formattedDate}</span>
        <span class="mx-2">•</span>
        <span>${post.views.toLocaleString()} ${lang === 'fa' ? 'بازدید' : 'views'}</span>
      </div>
      <p class="post-text mb-3 line-clamp-3">${post.text}</p>
      <a href="${post.link}" target="_blank" class="text-blue-500 hover:underline text-sm">
        ${lang === 'fa' ? 'ادامه مطلب ←' : 'Read more →'}
      </a>
    `;

    return card;
  }
</script>

<style>
  .telegram-feed {
    @apply bg-surface dark:bg-surface-dark rounded-lg p-6;
  }

  .post-card {
    @apply bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700;
  }

  .feed-loading {
    @apply flex flex-col items-center justify-center py-8;
  }
</style>
```

#### مرحله 3: Homepage Integration

**فایل**: `src/pages/index.astro`

```astro
---
import TelegramFeed from '../components/TelegramFeed.astro';
// ... other imports
---

<BaseLayout>
  <!-- Existing hero and content -->

  <section class="container mx-auto px-4 py-16">
    <TelegramFeed lang="fa" limit={5} />
  </section>

  <!-- Rest of homepage -->
</BaseLayout>
```

#### مرحله 4: Environment Variables

**فایل**: `.env` (local development)
```
PUBLIC_TELEGRAM_WORKER_URL=https://telegram-feed.yourusername.workers.dev
PUBLIC_TELEGRAM_CHANNEL=yourchannelname
```

**Cloudflare Pages** (production):
- افزودن متغیرهای محیطی در dashboard

#### مرحله 5: UI Strings

**فایل**: `src/i18n/fa.json` و `en.json`

```json
{
  "telegram": {
    "latest_posts": "آخرین پست‌های تلگرام / Latest Telegram Posts",
    "loading": "در حال بارگذاری... / Loading...",
    "error": "خطا در بارگذاری / Error loading feed",
    "view_channel": "مشاهده کانال / View Channel",
    "views": "بازدید / Views",
    "comments": "کامنت / Comments",
    "read_more": "ادامه مطلب / Read more"
  }
}
```

---

## توالی پیاده‌سازی

### فاز 1: Multimedia Foundation
1. ✅ تعریف multimedia schema در `content.config.ts`
2. ✅ ایجاد ساختار فولدر `src/content/multimedia/fa/` و `en/`
3. ✅ افزودن i18n strings

### فاز 2: Player Components
4. ✅ ساخت `VideoPlayer.astro`
5. ✅ ساخت `AudioPlayer.astro`
6. ✅ ساخت `PodcastPlayer.astro` (اختیاری، بعداً)
7. ✅ تست player components در isolation

### فاز 3: Multimedia Pages
8. ✅ ایجاد `multimedia/index.astro` (FA)
9. ✅ ایجاد `en/multimedia/index.astro` (EN)
10. ✅ ایجاد `multimedia/[slug].astro` (detail page)
11. ✅ Integration با navigation

### فاز 4: Telegram Worker
12. ✅ Setup Cloudflare Worker project
13. ✅ پیاده‌سازی Telegram API integration
14. ✅ Setup caching با KV
15. ✅ Deploy worker و test

### فاز 5: Telegram Feed Component
16. ✅ ایجاد `TelegramFeed.astro`
17. ✅ Client-side fetch logic
18. ✅ Error handling و loading states
19. ✅ Responsive design

### فاز 6: Homepage Integration
20. ✅ افزودن TelegramFeed به homepage
21. ✅ تست با real data
22. ✅ Performance optimization

### فاز 7: Testing & Polish
23. ✅ Cross-browser testing
24. ✅ Mobile responsiveness
25. ✅ Dark mode
26. ✅ RTL/LTR layouts
27. ✅ Accessibility audit

---

## فایل‌های کلیدی

### فایل‌های جدید (Multimedia)
1. `src/components/VideoPlayer.astro`
2. `src/components/AudioPlayer.astro`
3. `src/components/PodcastPlayer.astro`
4. `src/pages/multimedia/index.astro`
5. `src/pages/en/multimedia/index.astro`
6. `src/pages/multimedia/[slug].astro`
7. `src/pages/en/multimedia/[slug].astro`
8. `src/content/multimedia/fa/*.md`
9. `src/content/multimedia/en/*.md`

### فایل‌های جدید (Telegram)
10. `workers/telegram-feed.js`
11. `wrangler.toml`
12. `src/components/TelegramFeed.astro`

### فایل‌های تغییر یافته
1. `src/content.config.ts` - افزودن multimedia collection
2. `src/components/Header.astro` - لینک multimedia
3. `src/pages/index.astro` - TelegramFeed integration
4. `src/pages/en/index.astro` - TelegramFeed integration (EN)
5. `src/i18n/fa.json` - افزودن strings
6. `src/i18n/en.json` - افزودن strings
7. `.env` - متغیرهای محیطی

---

## Verification Steps

### Multimedia
- [ ] Schema تعریف شده و کار می‌کند
- [ ] VideoPlayer YouTube/Vimeo/self-hosted را پشتیبانی می‌کند
- [ ] AudioPlayer فایل‌های صوتی را play می‌کند
- [ ] صفحات index لیست کامل را نمایش می‌دهند
- [ ] صفحات detail player مناسب را render می‌کنند
- [ ] فیلترینگ بر اساس نوع کار می‌کند
- [ ] دوزبانه صحیح است
- [ ] دارک مود کار می‌کند
- [ ] Mobile responsive است

### Telegram Feed
- [ ] Worker deploy شده و در دسترس است
- [ ] API تلگرام با موفقیت fetch می‌شود
- [ ] Caching کار می‌کند (response سریع است)
- [ ] Component در homepage نمایش داده می‌شود
- [ ] تعداد بازدیدها صحیح است
- [ ] لینک‌ها به کانال درست هستند
- [ ] Error handling کار می‌کند
- [ ] Loading state نمایش داده می‌شود
- [ ] دوزبانه صحیح است
- [ ] RTL/LTR درست است

### Integration
- [ ] Navigation به multimedia صفحه کار می‌کند
- [ ] Homepage به‌روزرسانی می‌شود
- [ ] Performance قابل قبول است (< 3s load)
- [ ] SEO meta tags صحیح هستند
- [ ] RSS feed شامل multimedia می‌شود (اختیاری)

---

## ملاحظات و نکات

**Multimedia Hosting:**
- برای self-hosted video/audio، فایل‌ها در `public/media/` قرار بگیرند
- توجه به حجم فایل‌ها برای performance
- استفاده از CDN برای delivery بهتر (Cloudflare R2 یا S3)

**Telegram API Limits:**
- محدودیت rate limit: 30 request/second
- استفاده از caching برای کاهش تعداد درخواست‌ها
- TTL کش: 5 دقیقه (قابل تنظیم)

**Video Embed:**
- YouTube: استفاده از `youtube-nocookie.com` برای privacy
- Vimeo: پشتیبانی از privacy settings
- Self-hosted: استفاده از HLS برای adaptive streaming (اختیاری)

**Accessibility:**
- کنترل‌های keyboard برای player
- ARIA labels برای screen readers
- Captions/subtitles support (اختیاری)

**Performance:**
- Lazy load players (فقط وقتی در viewport هستند)
- Defer loading Telegram feed (after initial page load)
- Optimize thumbnails (WebP format, responsive sizes)

**Privacy:**
- توضیح استفاده از Telegram API در privacy policy
- Option برای disable کردن external embeds
- GDPR compliance برای European users

---

## Alternative Approaches (در نظر گرفته شده)

### Multimedia Alternative: استفاده از External Platform
- **مزایا**: کمتر پیچیده، hosting توسط platform
- **معایب**: کنترل کمتر، وابستگی به third-party
- **تصمیم**: Self-hosting بهتر است برای کنترل کامل

### Telegram Alternative: RSS Feed
- **مزایا**: ساده‌تر، بدون نیاز به Worker
- **معایب**: تلگرام RSS feed ندارد، نیاز به third-party service
- **تصمیم**: Cloudflare Worker بهترین گزینه است

### Telegram Alternative: Static Generation
- **مزایا**: بدون نیاز به client-side fetch
- **معایب**: نیاز به rebuild برای update، تعداد build زیاد
- **تصمیم**: Client-side fetch flexible-تر است
