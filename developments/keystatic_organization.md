# Keystatic Admin — Current Organization & Recommendations

## Current State

### What You Have Now

Keystatic shows **7 collections** in the left sidebar:

| Collection | Path | # Files |
|---|---|---|
| Articles / مقالات | `src/content/articles/` | ~15+ |
| Books / کتاب‌ها | `src/content/books/` | several |
| Proposals / طرح‌ها | `src/content/proposals/` | 2 |
| Statements / بیانیه‌ها | `src/content/statements/` | 1 |
| Multimedia / چندرسانه‌ای | `src/content/multimedia/` | 4 |
| Dialogues / گفتگوها | `src/content/dialogues/` | several |
| Wiki / دانشنامه | `src/content/wiki/` | several |

### Layout per Entry (entryLayout: 'content')

```
┌─────────────────────────────────┬──────────────────────────────┐
│           MAIN PANE             │         RIGHT SIDEBAR        │
│                                 │                              │
│  ┌─────────────────────────┐    │  Title                       │
│  │                         │    │  Description                 │
│  │   RICH TEXT EDITOR      │    │  Publish Date                │
│  │   (Markdoc toolbar)     │    │  Author / Author Title       │
│  │                         │    │  Language                    │
│  │   Bold, Italic, Lists,  │    │  Category / Tags             │
│  │   Images, Tables...     │    │  Draft ☑ Hidden ☑           │
│  │                         │    │  Cover Image                 │
│  │   "Start writing or     │    │  ... (all other fields)      │
│  │    press / for cmds"    │    │                              │
│  └─────────────────────────┘    │                              │
└─────────────────────────────────┴──────────────────────────────┘
```

### Known Limitation: All fields appear as a flat list in the sidebar  
Keystatic does NOT natively support visual section headers between fields.  
The only way to group fields visually is `fields.object()` — but that **changes the data structure** (nested YAML) which would break your existing content.

---

## Problems with Current Multimedia Setup

The `Multimedia` collection mixes 3 very different content types in one flat schema:

| Type | Needed Fields | Not Needed |
|---|---|---|
| **Video** | mediaUrl, platform, thumbnailUrl, duration | episodeNumber, seasonNumber, podcastName |
| **Audio** | mediaUrl, duration | episodeNumber, seasonNumber, podcastName, platform |
| **Podcast** | mediaUrl, podcastName, episodeNumber, seasonNumber, platform | thumbnailUrl |

**Result:** When creating a new multimedia entry you see ALL fields for all types — confusing.

---

## Recommendation: Split into 3 Sub-Collections + Templates

### Option A — Recommended: Separate Collections with Templates ✅

Split `Multimedia` into 3 focused collections.  
Each collection gets a **template file** (pre-filled frontmatter) so clicking "Create" gives you the right structure immediately.

```
src/
  content/
    multimedia/
      videos/fa/   ← new home for videos
      audio/fa/    ← new home for audio
      podcasts/fa/ ← new home for podcasts
  
  templates/
    video-template.md      ← pre-filled frontmatter for video
    audio-template.md      ← pre-filled frontmatter for audio  
    podcast-template.md    ← pre-filled frontmatter for podcast
```

**Keystatic sidebar would show:**
```
COLLECTIONS
  ├── Articles
  ├── Books
  ├── Proposals
  ├── Statements
  ├── 🎬 Videos
  ├── 🎵 Audio
  ├── 🎙️ Podcasts
  ├── Dialogues
  └── Wiki
```

Each collection shows only relevant fields — no noise.

### Option B — Stay in one collection, add type hint (simpler) 

Keep single `Multimedia` collection but create 3 template files selectable manually.  
User creates entry, picks the right template filename as starting point.  
Less clean but zero migration effort.

---

## Template Files (what they look like)

### Video Template
```yaml
---
title: ""
lang: fa
publishDate: 2026-01-01
type: video
mediaUrl: ""          # paste YouTube/Vimeo URL here
platform: youtube
thumbnailUrl: ""
duration: 0           # seconds
description: ""
author: مهدی سالم
tags: []
categories: []
draft: true
hidden: false
showInContents: true
coverImage: ""
imageDisplay: side
---

خلاصه ویدئو را اینجا بنویسید...
```

### Podcast Template
```yaml
---
title: ""
lang: fa
publishDate: 2026-01-01
type: podcast
mediaUrl: ""          # direct mp3 URL
platform: self-hosted
podcastName: ""
episodeNumber: 1
seasonNumber: 1
duration: 0           # seconds
description: ""
author: مهدی سالم
tags: []
categories: []
draft: true
hidden: false
showInContents: true
coverImage: ""
---

## محتوای این قسمت

- موضوع اول
- موضوع دوم
```

### Audio Template
```yaml
---
title: ""
lang: fa
publishDate: 2026-01-01
type: audio
mediaUrl: ""          # direct audio file URL
duration: 0
description: ""
author: مهدی سالم
tags: []
categories: []
draft: true
hidden: false
showInContents: true
---

توضیحات را اینجا بنویسید...
```

---

## My Recommendation

**Implement Option A** — 3 separate collections with template files.  
This gives you:

- ✅ Clean, focused forms per media type  
- ✅ Template auto-fills when you click "Create"
- ✅ Better list view (Videos vs Podcasts clearly separated)
- ✅ No extra work on the Astro rendering side (same content.config.ts)
- ✅ Works with the current local admin too (files are still `.md`)

> **Note on `show-header`:** You already renamed it to `showheader` in the admin and content files.
> The Keystatic field is now active. All good ✅

---

## What Keystatic Can NOT Do (Honest Limitations)

| Feature | Status |
|---|---|
| Upload video/audio files directly | ❌ Must use a URL |
| Conditional fields (show only if type = podcast) | ❌ Not supported |
| Visual field section headers in sidebar | ❌ Flat list only |
| Multiple selectable templates per collection | ❌ One template per collection |
| Markdown components (video player inline in content) | ✅ Via custom markdoc components |
