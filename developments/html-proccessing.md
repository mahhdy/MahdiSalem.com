# دقیقاً کجا و چه چیزی عوض شد

شما فقط باید **یک متد را جایگزین کنید** و **یک متد جدید اضافه کنید**. بقیه pipeline دست‌نخورده می‌ماند.

---

## تغییرات (فقط ۲ مورد)

```
ContentPipeline class:
  ├── processHTML()           ← 🔴 جایگزین شود (متد موجود)
  ├── _preprocessHTMLBody()   ← 🟢 اضافه شود (متد کمکی جدید)
  ├── processFile()           ← ✅ بدون تغییر (قبلاً HTML دارد)
  ├── enrichWithAI()          ← ✅ بدون تغییر
  ├── buildFrontmatter()      ← ✅ بدون تغییر
  ├── saveResult()            ← ✅ بدون تغییر
  └── escapeForMDX()          ← ⚠️ یک خط اضافه شود
```

---

## کد کامل — فقط بخش‌های تغییریافته

### ۱. جایگزین کامل `processHTML()` (خط ~۱۹۰ تقریبی)

```javascript
    // ═══════════════════════════════════════════════════════════════
    // 🔴 REPLACE the existing processHTML() with this version
    // This preserves rich HTML formatting instead of flattening to markdown
    // ═══════════════════════════════════════════════════════════════

    async processHTML(filePath, options = {}) {
        console.log(`   🌐 پردازش HTML (rich-preserve mode)...`);
        let content = await fs.readFile(filePath, 'utf-8');

        // ── Step 1: Extract metadata BEFORE stripping ──
        const $ = cheerio.load(content);

        // Title: from <header>, then <h1>, then <title>, then filename
        let title = '';
        const pageHeader = $('header.page-header');
        if (pageHeader.length) {
            title = pageHeader.find('h1').text().trim();
        }
        if (!title) title = $('h1').first().text().trim();
        if (!title) title = $('title').text().trim();
        if (!title) title = path.basename(filePath, path.extname(filePath));

        // Description: from header subtitle, then meta tag
        let description = '';
        const subtitle = pageHeader.find('.subtitle');
        if (subtitle.length) {
            description = subtitle.text().trim();
        }
        if (!description) {
            description = $('meta[name="description"]').attr('content') || '';
        }

        // Author: from header
        let author = '';
        const metaDiv = pageHeader.find('.meta strong');
        if (metaDiv.length) {
            author = metaDiv.first().text().trim();
        }

        // Detect language
        const htmlLang = $('html').attr('lang') || '';
        const lang = htmlLang || (this.hasPersianCharacters(title) ? 'fa' : 'en');

        // ── Step 2: Preprocess HTML body ──
        const processedBody = this._preprocessHTMLBody(content);

        // ── Step 3: Run MermaidProcessor on the result ──
        const prefix = path.basename(filePath, path.extname(filePath));
        const finalContent = await this.mermaidProcessor.process(processedBody, { prefix });

        console.log(`   ✅ HTML processed: ${title}`);

        return {
            type: 'html',
            source: filePath,
            title: this._decodeEntities(title),
            content: finalContent,
            metadata: {
                description: this._decodeEntities(description),
                author: this._decodeEntities(author),
                lang,
            }
        };
    }
```

### ۲. اضافه کردن `_preprocessHTMLBody()` و توابع کمکی (بعد از `processHTML`)

```javascript
    // ═══════════════════════════════════════════════════════════════
    // 🟢 NEW: HTML Body Preprocessor — rich formatting preserved
    // Add this right after processHTML()
    // ═══════════════════════════════════════════════════════════════

    _preprocessHTMLBody(html) {
        let c = html;

        // 1. Extract <body> if full document
        const bodyMatch = c.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        if (bodyMatch) c = bodyMatch[1];

        // 2. Strip boilerplate
        c = c.replace(/<header\s+class="page-header">[\s\S]*?<\/header>/gi, '');
        c = c.replace(/<footer[\s\S]*?<\/footer>/gi, '');
        c = c.replace(/<style[\s\S]*?<\/style>/gi, '');
        c = c.replace(/<script[\s\S]*?<\/script>/gi, '');
        c = c.replace(/<main[^>]*>/gi, '');
        c = c.replace(/<\/main>/gi, '');

        // 3. Strip ALL comments
        c = removeAllHtmlComments(c);
        // Also strip CSS comments in inline styles
        c = c.replace(
            /style="([^"]*)"/gi,
            (match, styleContent) => {
                const cleaned = styleContent.replace(/\/\*[\s\S]*?\*\//g, '');
                return `style="${cleaned}"`;
            }
        );

        // 4. Convert Mermaid <pre> blocks → ```mermaid fences
        //    (MUST happen before entity decoding!)
        c = this._convertMermaidPreBlocks(c);

        // 5. Collapse split/broken tags
        c = c.replace(
            /<(\w+)((?:\s+[\w-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^>\s]+))?)*)\s*>/g,
            (match) => match.replace(/\s*\n\s*/g, ' ')
        );

        // 6. Convert headings
        c = this._convertHTMLHeadings(c);

        // 7. Fix self-closing tags for MDX
        c = c.replace(/<br\s*>/gi, '<br/>');
        c = c.replace(/<br\s+\/>/gi, '<br/>');
        c = c.replace(/<hr\s*>/gi, '<hr/>');
        c = c.replace(/<hr\s+\/>/gi, '<hr/>');
        c = c.replace(/<img\s+([^>]*?)(?<!\/)>/gi, '<img $1 />');

        // 8. Remove empty wrapper divs
        let prev;
        do {
            prev = c;
            c = c.replace(/<div>\s*<\/div>/gi, '');
            c = c.replace(
                /<div>\s*(<(?:div|section|table|article|nav|details)\s[\s\S]*?<\/(?:div|section|table|article|nav|details)>)\s*<\/div>/gi,
                '$1'
            );
        } while (c !== prev);

        // 9. Map CSS classes to site equivalents
        c = this._mapHTMLClasses(c);

        // 10. Decode HTML entities (selective — skip mermaid fences)
        c = this._decodeEntitiesSelective(c);

        // 11. Clean whitespace
        c = c.replace(/\n{4,}/g, '\n\n\n');
        c = c.split('\n').map(l => l.trimEnd()).join('\n');
        c = c.trim() + '\n';

        return c;
    }

    // ─── Convert <pre class="mermaid"> → ```mermaid ───
    _convertMermaidPreBlocks(html) {
        // Pattern 1: Full wrapper with title + pre.mermaid + caption
        let r = html.replace(
            /<div\s+class="diagram-wrapper">\s*(?:<(?:div|p)\s+class="diagram-title"[^>]*>([\s\S]*?)<\/(?:div|p)>\s*)?<pre\s+class="mermaid">([\s\S]*?)<\/pre>\s*(?:<(?:div|p|figcaption)\s+class="diagram-caption"[^>]*>([\s\S]*?)<\/(?:div|p|figcaption)>\s*)?<\/div>/gi,
            (_, rawTitle, rawMermaid, rawCaption) =>
                this._buildMermaidFence(rawTitle, rawMermaid, rawCaption)
        );

        // Pattern 2: Bare <pre class="mermaid"> without wrapper
        r = r.replace(
            /<pre\s+class="mermaid">([\s\S]*?)<\/pre>/gi,
            (_, rawMermaid) => this._buildMermaidFence(null, rawMermaid, null)
        );

        return r;
    }

    _buildMermaidFence(rawTitle, rawMermaid, rawCaption) {
        // Decode entities INSIDE mermaid content
        let code = this._decodeEntities(rawMermaid.trim());

        // Strip :::className (mindmap)
        code = code.replace(/:::[\w-]+/g, '');

        // Fix = in mindmap text
        code = code.replace(/^(\s{2,}\S.*?)\s+=\s+(.*)$/gm, '$1 as $2');

        // Fix comma before year in mindmap
        code = code.replace(/^(\s{2,}.*),\s+(\d{4})\s*$/gm, '$1 $2');

        // Fix \n → <br/> in flowchart nodes
        code = code.replace(/\["([^"]*?)"\]/g, m => m.replace(/\\n/g, '<br/>'));
        code = code.replace(/\[([^\]"]*?\\n[^\]]*?)\]/g, m => m.replace(/\\n/g, '<br/>'));

        // Clean whitespace
        code = code.split('\n').map(l => l.trimEnd()).join('\n').trim();

        const parts = [];

        if (rawTitle) {
            const t = this._decodeEntities(rawTitle.replace(/<[^>]*>/g, '').trim());
            parts.push(`\n**${t}**\n`);
        }

        parts.push('```mermaid');
        parts.push(code);
        parts.push('```');

        if (rawCaption) {
            const cap = this._decodeEntities(rawCaption.replace(/<[^>]*>/g, '').trim());
            parts.push(`\n*${cap}*`);
        }

        return '\n' + parts.join('\n') + '\n';
    }

    // ─── Convert HTML headings → markdown ───
    _convertHTMLHeadings(html) {
        let r = html;

        // <h2 class="section-title"><span class="num">N</span> Title</h2>
        r = r.replace(
            /<h2\s+class="section-title">\s*<span\s+class="num">(.*?)<\/span>\s*([\s\S]*?)\s*<\/h2>/gi,
            (_, num, title) => {
                const clean = this._decodeEntities(title.replace(/<[^>]*>/g, '').trim());
                return `\n## ${num}. ${clean}\n`;
            }
        );

        // <h3 id="...">content</h3>
        r = r.replace(
            /<h3\s+(?:id="([^"]*)")?\s*>([\s\S]*?)<\/h3>/gi,
            (_, id, content) => {
                const clean = this._decodeEntities(content.replace(/<[^>]*>/g, '').trim());
                return id ? `\n### ${clean} {#${id}}\n` : `\n### ${clean}\n`;
            }
        );

        return r;
    }

    // ─── Map HTML classes to site CSS equivalents ───
    _mapHTMLClasses(html) {
        let r = html;

        // Adjust these mappings to match YOUR global.css!
        const classMap = {
            'card accent-right':   'card right',
            'card accent-primary': 'card primary',
            'card accent-green':   'card accent',
            'card accent-gold':    'card gold',
        };

        for (const [from, to] of Object.entries(classMap)) {
            r = r.replaceAll(`class="${from}"`, `class="${to}"`);
        }

        // Wave cards → card (preserve border style)
        r = r.replace(/<div\s+class="wave-card"/gi, '<div class="card"');

        // Remove wave-num (heading already has the number)
        r = r.replace(/<div\s+class="wave-num"[^>]*>.*?<\/div>/gi, '');

        return r;
    }

    // ─── HTML Entity Decoder ───
    static _ENTITY_MAP = {
        '&hellip;':'…','&mdash;':'—','&ndash;':'–','&laquo;':'«','&raquo;':'»',
        '&bull;':'•','&middot;':'·','&ldquo;':'\u201C','&rdquo;':'\u201D',
        '&lsquo;':'\u2018','&rsquo;':'\u2019',
        '&nbsp;':'\u00A0','&zwnj;':'\u200C','&zwj;':'\u200D',
        '&thinsp;':'\u2009','&ensp;':'\u2002','&emsp;':'\u2003',
        '&rarr;':'→','&larr;':'←','&darr;':'↓','&uarr;':'↑','&harr;':'↔',
        '&eacute;':'é','&Eacute;':'É','&egrave;':'è','&Egrave;':'È',
        '&ecirc;':'ê','&Ecirc;':'Ê','&euml;':'ë',
        '&aacute;':'á','&agrave;':'à','&acirc;':'â','&auml;':'ä','&Auml;':'Ä',
        '&ouml;':'ö','&Ouml;':'Ö','&uuml;':'ü','&Uuml;':'Ü',
        '&icirc;':'î','&ccedil;':'ç','&scaron;':'š','&szlig;':'ß',
        '&oslash;':'ø','&Oslash;':'Ø','&aring;':'å','&Aring;':'Å',
        '&aelig;':'æ','&AElig;':'Æ','&ntilde;':'ñ',
        '&times;':'×','&divide;':'÷','&copy;':'©','&reg;':'®',
        '&trade;':'™','&deg;':'°','&para;':'¶','&sect;':'§',
    };

    _decodeEntities(text) {
        if (!text) return '';
        let r = text;

        for (const [entity, char] of Object.entries(ContentPipeline._ENTITY_MAP)) {
            r = r.replaceAll(entity, char);
        }

        // Numeric decimal: &#128214;
        r = r.replace(/&#(\d+);/g, (_, c) => {
            try { return String.fromCodePoint(parseInt(c, 10)); }
            catch { return `&#${c};`; }
        });

        // Numeric hex: &#x02BB;
        r = r.replace(/&#x([0-9a-f]+);/gi, (_, h) => {
            try { return String.fromCodePoint(parseInt(h, 16)); }
            catch { return `&#x${h};`; }
        });

        // &amp; last (avoid creating new entities)
        r = r.replace(/&amp;(?!#?\w+;)/g, '&');

        return r;
    }

    // ─── Decode entities but skip inside mermaid code fences ───
    _decodeEntitiesSelective(content) {
        let inMermaid = false;
        return content.split('\n').map(line => {
            if (line.trim() === '```mermaid') { inMermaid = true; return line; }
            if (inMermaid && line.trim() === '```') { inMermaid = false; return line; }
            if (inMermaid) return line; // Already decoded in _buildMermaidFence
            return this._decodeEntities(line);
        }).join('\n');
    }
```

### ۳. یک خط تغییر در `escapeForMDX()` — محافظت از mermaid

```javascript
    escapeForMDX(content) {
        if (!content) return '';
        let result = content;

        // 1. Protect code blocks (INCLUDING mermaid)
        const codeBlocks = [];
        result = result.replace(/```[\s\S]*?```/g, match => {
            codeBlocks.push(match);
            return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
        });

        // 2. Protect HTML tags
        const htmlTags = [];
        result = result.replace(/<[^>]+>/g, match => {
            htmlTags.push(match);
            return `__HTML_TAG_${htmlTags.length - 1}__`;
        });

        // 🟢 NEW: Also protect inline styles with var() 
        // var(--clr-primary) contains { } which would get escaped
        const varRefs = [];
        result = result.replace(/var\(--[\w-]+\)/g, match => {
            varRefs.push(match);
            return `__VAR_REF_${varRefs.length - 1}__`;
        });

        // 3. Escape { and }
        result = result.replace(/\{/g, '&#123;');
        result = result.replace(/\}/g, '&#125;');

        // 4. Escape dangerous backslashes
        result = result.replace(/\\([uxUX])/g, '&#92;$1');

        // 5. Restore everything
        result = result.replace(/__VAR_REF_(\d+)__/g, (_, idx) => varRefs[idx]);    // 🟢 NEW
        result = result.replace(/__HTML_TAG_(\d+)__/g, (_, idx) => htmlTags[idx]);
        result = result.replace(/__CODE_BLOCK_(\d+)__/g, (_, idx) => codeBlocks[idx]);

        return result;
    }
```

### ۴. تغییر کوچک در `buildFrontmatter()` — استفاده از metadata.author و metadata.lang

```javascript
    buildFrontmatter(result) {
        const existing = result.frontmatter || {};

        // 🟢 UPDATED: Also check metadata for lang and author (from HTML extraction)
        const lang = existing.lang || result.metadata?.lang || 'fa';
        const defaultAuthor = lang === 'en' ? 'Mahdi Salem' : 'مهدی سالم';

        const fm = {
            title: existing.title || result.title,
            description: existing.description
                || result.ai?.description
                || result.ai?.summary?.slice(0, 160)
                || result.metadata?.description   // 🟢 HTML description
                || '',
            lang: lang,
            publishDate: existing.publishDate || existing.date
                || new Date().toISOString().split('T')[0],
            author: existing.author
                || result.metadata?.author         // 🟢 HTML author
                || defaultAuthor,
            sourceType: existing.sourceType || result.type,
            interface: existing.interface
                || (result.metadata?.bookSlug ? 'iran' : undefined)
        };

        // ... rest stays exactly the same ...
```

(بقیه `buildFrontmatter` بدون تغییر)

### ۵. در `printFinalReport()` — اضافه کردن شمارنده HTML

```javascript
    printFinalReport() {
        const mermaidStats = this.mermaidProcessor.getStats();

        console.log(`\n${'═'.repeat(60)}`);
        console.log('📊 گزارش نهایی');
        console.log('═'.repeat(60));
        console.log(`   📄 LaTeX: ${this.stats.latex}`);
        console.log(`   📝 Markdown: ${this.stats.markdown}`);
        console.log(`   🌐 HTML: ${this.stats.html || 0}`);    // 🟢 NEW
        console.log(`   📑 PDF: ${this.stats.pdf}`);
        console.log(`   📃 Word: ${this.stats.word}`);
        console.log(`   🤖 AI: ${this.stats.aiTagged}`);
        console.log(`   📊 Mermaid: ${mermaidStats.processed} (کش: ${mermaidStats.cached})`);
        console.log(`   ⏩ صرف‌نظر: ${this.stats.skipped || 0}`);
        console.log(`   ❌ خطا: ${this.stats.errors}`);
        console.log('═'.repeat(60) + '\n');
    }
```

---

## هیچ چیز دیگری تغییر نمی‌کند

### فلوی اجرا — قبل و بعد

```
قبل (فعلی):
  processFile() → processHTML()  
    → cheerio parse → Turndown → flat markdown  ← ❌ همه چیز flat می‌شود
    → mermaidProcessor  
  → enrichWithAI()  ← ✅ کار می‌کند  
  → saveResult() → buildFrontmatter() → escapeForMDX()  ← ✅ کار می‌کند

بعد (جدید):
  processFile() → processHTML()  
    → cheerio parse (فقط metadata)  
    → _preprocessHTMLBody() ← 🟢 حفظ rich HTML + mermaid conversion  
    → mermaidProcessor  ← ✅ همان  
  → enrichWithAI()  ← ✅ بدون تغییر — AI روی content کار می‌کند  
  → saveResult() → buildFrontmatter() → escapeForMDX()  ← ✅ بدون تغییر
```

---

## تست سریع

```bash
# یک فایل HTML
node scripts/process-content.mjs --file content-source/articles/fa/freedom_article_full.html

# همه محتوا (شامل HTML ها)
node scripts/process-content.mjs --all

# بدون AI (تست سریع)
node scripts/process-content.mjs --file content-source/articles/fa/freedom_article_full.html --no-ai
```

---

## چک‌لیست نهایی

| مورد | وضعیت |
|---|---|
| `processHTML()` جایگزین شد | ▢ |
| `_preprocessHTMLBody()` اضافه شد | ▢ |
| `_convertMermaidPreBlocks()` اضافه شد | ▢ |
| `_buildMermaidFence()` اضافه شد | ▢ |
| `_convertHTMLHeadings()` اضافه شد | ▢ |
| `_mapHTMLClasses()` اضافه شد | ▢ |
| `_decodeEntities()` اضافه شد | ▢ |
| `_decodeEntitiesSelective()` اضافه شد | ▢ |
| `_ENTITY_MAP` static property اضافه شد | ▢ |
| `escapeForMDX()` — var() protection اضافه شد | ▢ |
| `buildFrontmatter()` — metadata.author/lang | ▢ |
| `printFinalReport()` — HTML counter | ▢ |
| `mermaid-processor.mjs` — به‌روز شد (قبلاً داده شد) | ▢ |
