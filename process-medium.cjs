/**
 * process-medium.cjs v4
 * Converts Notion-exported Medium posts to clean MDX with:
 *  - Correct category overrides from user review
 *  - Real Medium publish dates
 *  - Half-space (نیم‌فاصله / ZWNJ) normalization
 *  - Proper heading & paragraph joining (fixed algorithm)
 *  - Output to fa/medium/ or en/medium/ subfolders
 *  - Cleanup of old generated files from fa/ root
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC_DIR = path.join(ROOT, 'content-source', 'articles', 'fa', 'Medium Posts');
const INDEX_FILE = path.join(ROOT, 'content-source', 'articles', 'fa', 'Medium Posts 2e6e9556a4c946bab33c5015e1bcb8ce.md');
const OUT_FA = path.join(ROOT, 'src', 'content', 'articles', 'fa', 'medium');
const OUT_EN = path.join(ROOT, 'src', 'content', 'articles', 'en', 'medium');
const OLD_FA = path.join(ROOT, 'src', 'content', 'articles', 'fa');

// Ensure output dirs exist
[OUT_FA, OUT_EN].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ─────────────────────────────────────────────────────────────
// 1. USER-CORRECTED CATEGORY OVERRIDES
//    Primary category slug → what the article ACTUALLY is about
// ─────────────────────────────────────────────────────────────
const OVERRIDES = {
  "Avicenna's argument for the existence of God- Logi": {
    lang: 'en',
    categories: ['theology', 'ontology', 'philosophy-other'],
    interface: 'paper',
  },
  "Being and Perceivability هستی و درک پذیری": {
    lang: 'en',
    categories: ['epistemology', 'ontology', 'philosophy-other'],
    interface: 'paper',
  },
  "ChatGPT Struggling with Simple Logical Calculation": {
    lang: 'en',
    categories: ['philosophy-other', 'methodology'],
    interface: 'paper',
  },
  "What is Superstation خرافه چیست؟": {
    categories: ['methodology', 'epistemology', 'philosophy-of-science'],
    interface: 'paper',
  },
  "آگاهی؛ سوالی سخت و مساله ای در هم تنیده": {
    categories: ['neuroscience', 'philosophy-other', 'life'],
    interface: 'paper',
  },
  "آیا بایدی هست؟": {
    categories: ['philosophy-of-ethics', 'ontology', 'philosophy-other'],
    interface: 'paper',
  },
  "آیا می‌توان از امر خودبنیان امر خودمحقق حرف زد؟": {
    categories: ['theology', 'ontology', 'philosophy-other'],
    interface: 'paper',
  },
  "آیا واقعیتی هست؟": {
    categories: ['ontology', 'epistemology', 'philosophy-other'],
    interface: 'paper',
  },
  "اخلاق منظوم": {
    categories: ['prescriptive-ethics', 'philosophy-of-ethics'],
    interface: 'paper',
  },
  "اخلاق؛ نهادشناسی اخلاق": {
    categories: ['philosophy-of-ethics', 'descriptive-ethics', 'life'],
    interface: 'paper',
  },
  "ارزش و رفتار؛ یک پویا شناسی": {
    categories: ['descriptive-ethics', 'philosophy-of-ethics', 'life'],
    interface: 'paper',
  },
  "ایران؛ حاکمیت و عقلانیت ابزاری": {
    categories: ['iran', 'foundational-politics', 'descriptive-politics'],
    interface: 'iran',
  },
  "این استدلال تو شبیه این هست": {
    categories: ['philosophy-other', 'epistemology'],
    interface: 'paper',
  },
  "براهین من درآوردی برای خدا!": {
    categories: ['theology', 'ontology', 'philosophy-other'],
    interface: 'paper',
  },
  'بررسی انتقادیِ "برهان فرگشتی برعلیه طبیعت گرایی"': {
    categories: ['theology', 'biology', 'philosophy-of-science'],
    interface: 'paper',
  },
  "بررسی تقلیل هستی به داده!": {
    categories: ['ontology', 'philosophy-other', 'philosophy-of-science'],
    interface: 'paper',
  },
  "بهشت زمینی یا بهشت آسمانی؛ انتخابِ اجبار یا اجبارِ": {
    categories: ['ontology', 'theology', 'philosophy-of-ethics'],
    interface: 'paper',
  },
  "تسلسل و دور! بچرخ تا بچرخیم!": {
    categories: ['theology', 'ontology', 'philosophy-other'],
    interface: 'paper',
  },
  "تعابیری فیزیکالیستی از …!": {
    categories: ['theology', 'ontology', 'physics'],
    interface: 'paper',
  },
  "تفسیر و متن مقدس؛ چالش ها، ارزش ها": {
    categories: ['theology', 'epistemology', 'philosophy-of-ethics'],
    interface: 'paper',
  },
  "جبر و اختیار؛ یک سازگارگرایی ناسازگار!": {
    categories: ['theology', 'philosophy-of-ethics', 'ontology'],
    interface: 'paper',
  },
  "جبر یا اختیار؛ ترسیم ایستگاه‌های اندیشه ورزی": {
    categories: ['ontology', 'theology', 'philosophy-other'],
    interface: 'paper',
  },
  "حدوث و قدیم؛ برخی چالش ها": {
    categories: ['epistemology', 'ontology', 'theology'],
    interface: 'paper',
  },
  "حصول کثرت از وحدت، چگونه؟": {
    categories: ['semantics', 'theology', 'ontology'],
    interface: 'paper',
  },
  "حقیقت و سروش!": {
    categories: ['descriptive-politics', 'epistemology', 'life'],
    interface: 'paper',
  },
  "حقیقت و واقعیت؛ وحدت یا کثرت!": {
    categories: ['epistemology', 'ontology', 'semantics'],
    interface: 'paper',
  },
  "خدای عملگر!": {
    categories: ['theology', 'ontology', 'philosophy-other'],
    interface: 'paper',
  },
  "خطامندی منشا بنیادی شدن": {
    categories: ['epistemology', 'philosophy-of-science', 'methodology'],
    interface: 'paper',
  },
  "در توضیح موضع آتئیستی و حدود ادعاهای معرفت شناختی": {
    categories: ['epistemology', 'philosophy-other', 'theology'],
    interface: 'paper',
  },
  "در چرایی مجازات!": {
    categories: ['theology', 'applied-ethics', 'philosophy-of-ethics'],
    interface: 'paper',
  },
  "ذات و صفات و معناداری": {
    categories: ['methodology', 'semantics', 'theology'],
    interface: 'paper',
  },
  "ذات گرایی و اسلام": {
    categories: ['ontology', 'theology', 'epistemology'],
    interface: 'paper',
  },
  "رابطه ی معرفت دینی و معرفت بشری": {
    categories: ['methodology', 'epistemology', 'theology'],
    interface: 'paper',
  },
  "رابطه‌ی معرفت دینی و معرفت بشری": {
    categories: ['philosophy-of-science', 'epistemology', 'methodology'],
    interface: 'paper',
  },
  "زبان؛ شبکه‌ی دلالت، ارجاع و معنا": {
    categories: ['neuroscience', 'semantics', 'philosophy-other'],
    interface: 'paper',
  },
  "سکولاریسم؛ نقد یک دیدگاه": {
    categories: ['ontology', 'theology', 'foundational-politics'],
    interface: 'paper',
  },
  "شعبده بازی چیست؟ برهان شعبده بازانه کدام است!": {
    categories: ['ontology', 'philosophy-other', 'epistemology'],
    interface: 'paper',
  },
  "صدق و کذب از کجاست؟": {
    categories: ['ontology', 'semantics', 'epistemology'],
    interface: 'paper',
  },
  "صدق یا اثبات": {
    categories: ['proof-theory', 'semantics', 'philosophy-other'],
    interface: 'paper',
  },
  "صیروریت، شدن (Becoming)": {
    categories: ['philosophy-of-mathematics', 'ontology', 'physics'],
    interface: 'paper',
  },
  "ضرورت و علم الهی!": {
    categories: ['ontology', 'theology', 'semantics'],
    interface: 'paper',
  },
  "طبیعت گرایی؛ خام یا اصیل": {
    categories: ['theology', 'ontology', 'philosophy-of-science'],
    interface: 'paper',
  },
  "طرح اولیه‌ی مبارزه‌ی موثر": {
    categories: ['iran', 'descriptive-politics', 'foundational-politics'],
    interface: 'iran',
  },
  "عقلانیت انقلابی، چگونه!": {
    categories: ['ontology', 'foundational-politics', 'iran'],
    interface: 'iran',
  },
  "علت و دلیل، تمایزی نام گذارانه یا ماهوی!": {
    categories: ['epistemology', 'ontology', 'methodology'],
    interface: 'paper',
  },
  "علم و دین": {
    categories: ['theology', 'epistemology', 'philosophy-of-science'],
    interface: 'paper',
  },
  "علم و دین؛ نقادی سخنرانی عبدالکریم سروش": {
    categories: ['theology', 'epistemology', 'philosophy-of-science'],
    interface: 'paper',
  },
  "علم و ضرورت، چشم‌پوشی یا فراموشی!": {
    categories: ['methodology', 'philosophy-of-science', 'ontology'],
    interface: 'paper',
  },
  "علیت و ابطال پذیری! پرسش و پاسخی در کلاب هاوس": {
    categories: ['theology', 'ontology', 'philosophy-of-science'],
    interface: 'paper',
  },
  "علیت و مبانی تحلیلی آن": {
    categories: ['ontology', 'philosophy-of-science', 'methodology'],
    interface: 'paper',
  },
  "علیت، چیستی، چرایی و چگونگی": {
    categories: ['ontology', 'philosophy-other', 'methodology'],
    interface: 'paper',
  },
  "فرگشت؛ علم یا آرزو": {
    categories: ['theology', 'biology', 'philosophy-of-science'],
    interface: 'paper',
  },
  "فلسفه‌ی ذهن": {
    categories: ['neuroscience', 'philosophy-other', 'ontology'],
    interface: 'paper',
  },
  "متافیزیک‌ها…": {
    categories: ['ontology', 'philosophy-other', 'theology'],
    interface: 'paper',
  },
  "محدود یا نامحدود بودن عالم!": {
    categories: ['ontology', 'philosophy-other', 'theology'],
    interface: 'paper',
  },
  "مشکل وحدت-کثرت و راه حل سیستم بودن!": {
    categories: ['ontology', 'set-theory', 'philosophy-other'],
    interface: 'paper',
  },
  "نامه‌ای به رحمت!": {
    categories: ['theology', 'philosophy-of-ethics', 'life'],
    interface: 'paper',
  },
  "نظریه بازی‌ها": {
    categories: ['economics', 'descriptive-politics', 'life'],
    interface: 'paper',
  },
  "نظم یا بی‌نظمی، مساله این است!": {
    categories: ['ontology', 'philosophy-of-ethics', 'theology'],
    interface: 'paper',
  },
  "نقد و بررسی برهان امکان و وجوب": {
    categories: ['ontology', 'theology', 'philosophy-other'],
    interface: 'paper',
  },
  "نوع شناسی هستی": {
    categories: ['ontology', 'semantics', 'life'],
    interface: 'paper',
  },
  "هستی‌شناسی و معرفت‌شناسی اخلاق، باورمند غیرباورمند": {
    categories: ['philosophy-of-ethics', 'epistemology', 'ontology'],
    interface: 'paper',
  },
  "پیامبری و عاشقی…": {
    categories: ['theology', 'life', 'philosophy-of-ethics'],
    interface: 'paper',
  },
  "چارچوبی برای مقایسه‌ی تبیین‌ها! نظریه‌ها!": {
    categories: ['epistemology', 'methodology', 'philosophy-of-science'],
    interface: 'paper',
  },
  "چالش‌های علم و امتزاج علم و خدا!": {
    categories: ['theology', 'ontology', 'epistemology'],
    interface: 'paper',
  },
  "چرا برده‌داری موجه هست یا نیست!": {
    categories: ['philosophy-of-ethics', 'foundational-politics', 'applied-ethics'],
    interface: 'paper',
  },
  "چرا سنت اندیشی؟ یا نسبی گرایی پر رنگ فرهنگی-اخلاقی": {
    categories: ['philosophy-of-ethics', 'descriptive-ethics', 'epistemology'],
    interface: 'paper',
  },
  '\u201cخطرات \u201cرفع خطر احتمالی!': {
    categories: ['theology', 'epistemology', 'philosophy-other'],
    interface: 'paper',
  },
  '\u201cدر چرایی \u201cنه به تنظیم دقیق!': {
    categories: ['theology', 'philosophy-of-science', 'ontology'],
    interface: 'paper',
  },
};

// ─────────────────────────────────────────────────────────────
// 2. DRAFT DETECTION
// ─────────────────────────────────────────────────────────────
const indexContent = fs.readFileSync(INDEX_FILE, 'utf8');
const draftSection = indexContent.split('## پیش‌نویس‌ها')[1] || '';
function isDraft(fileName) {
  return draftSection.includes(fileName) || draftSection.includes(encodeURIComponent(fileName));
}

// ─────────────────────────────────────────────────────────────
// 3. SLUG GENERATOR
// ─────────────────────────────────────────────────────────────
function createSlug(text) {
  return text
    .trim()
    .replace(/[«»""''‌،؛؟\.()!؟:;؛]/g, '')
    .replace(/[\s\-_/]+/g, '-')
    .replace(/[^\w\u0600-\u06FF\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─────────────────────────────────────────────────────────────
// 4. HALF-SPACE (ZWNJ) NORMALIZER
//    Conservative: only patterns with >99% precision
// ─────────────────────────────────────────────────────────────
const ZWNJ = '\u200C';
function fixHalfSpaces(text) {
  // می/نمی prefix before verbs (most common error)
  text = text.replace(/\bمی ([^\s،؛.!؟\n\r])/g, `می${ZWNJ}$1`);
  text = text.replace(/\bنمی ([^\s،؛.!؟\n\r])/g, `نمی${ZWNJ}$1`);
  // ها / های / ای / تر / ترین after Persian word
  text = text.replace(/([\u0600-\u06FF]) (ها|های|ای|ترین|تری)\b/g, `$1${ZWNJ}$2`);
  // Common compound suffixes that are often separated
  text = text.replace(/([\u0600-\u06FF]) (شده|شده\b|پذیر|مند|آموز|بخش|ساز|دار|گر|کار)\b/g, `$1${ZWNJ}$2`);
  // Remove accidental double ZWNJ
  text = text.replace(/\u200C\u200C+/g, ZWNJ);
  return text;
}

// ─────────────────────────────────────────────────────────────
// 5. PARAGRAPH & HEADING JOINER (fixed algorithm)
// ─────────────────────────────────────────────────────────────
function fixMdLines(text) {
  const lines = text.split('\n');
  const result = [];

  const BLANK    = /^\s*$/;
  const IS_HEADING  = (l) => /^#{1,6}\s/.test(l.trimStart());
  const IS_DIVIDER  = (l) => /^---+$/.test(l.trim());
  const IS_FENCE    = (l) => /^```/.test(l.trimStart());
  const IS_HTML     = (l) => /^</.test(l.trimStart());
  const IS_QUOTE    = (l) => /^>\s/.test(l.trimStart());
  const IS_LIST     = (l) => /^\s*[-*+]\s/.test(l) || /^\s*\d+\.\s/.test(l);
  const SENT_END    = /[.!?؟!…\-:—»'"،]$/;

  // A "standalone" line that should never be joined TO
  const STANDALONE_NEXT = (l) =>
    BLANK.test(l) || IS_HEADING(l) || IS_DIVIDER(l) || IS_FENCE(l) || IS_HTML(l) || IS_QUOTE(l) || IS_LIST(l);

  for (let i = 0; i < lines.length; i++) {
    const cur  = lines[i];
    const next = lines[i + 1];

    // Always push blank lines, last line, dividers, fences, HTML, quotes
    if (BLANK.test(cur) || next === undefined || IS_DIVIDER(cur) || IS_FENCE(cur) || IS_HTML(cur) || IS_QUOTE(cur)) {
      result.push(cur);
      continue;
    }

    // ── HEADING CONTINUATION (most important fix) ──────────────
    // A heading split across two lines: "### Title and\nRest of title"
    if (IS_HEADING(cur)) {
      // If next is blank, another heading, divider, list, or HTML → keep as-is
      if (STANDALONE_NEXT(next)) {
        result.push(cur);
      } else {
        // Join broken heading
        lines[i + 1] = cur.trimEnd() + ' ' + next.trimStart();
        // Don't push cur – merged into next
      }
      continue;
    }

    // ── LIST ITEM CONTINUATION ─────────────────────────────────
    if (IS_LIST(cur)) {
      if (STANDALONE_NEXT(next) || IS_LIST(next) || SENT_END.test(cur.trimEnd())) {
        result.push(cur);
      } else {
        // Join continuation of list item
        lines[i + 1] = cur.trimEnd() + ' ' + next.trimStart();
      }
      continue;
    }

    // ── REGULAR PARAGRAPH CONTINUATION ────────────────────────
    if (SENT_END.test(cur.trimEnd()) || STANDALONE_NEXT(next)) {
      result.push(cur);
    } else {
      lines[i + 1] = cur.trimEnd() + ' ' + next.trimStart();
    }
  }

  return result.join('\n');
}

// ─────────────────────────────────────────────────────────────
// 6. CLEAN NOTION/MEDIUM ARTIFACTS
// ─────────────────────────────────────────────────────────────
function cleanContent(content) {
  // Remove Medium export footer
  content = content
    .replace(/^By \[.*?\]\(https?:\/\/medium\.com.*?\) on \[.*?\].*$/gm, '')
    .replace(/^\[Canonical link\]\(https?:\/\/medium.*\)$/gm, '')
    .replace(/^Exported from \[Medium\].*$/gm, '');
  // Remove notion UUID links but keep link text
  content = content.replace(/\[([^\]]+)\]\([^)]*[a-f0-9]{32}\.md\)/gi, '$1');
  // Remove orphaned UUIDs
  content = content.replace(/\b[a-f0-9]{32}\b/g, '');
  return content.trim();
}

// ─────────────────────────────────────────────────────────────
// 7. EXTRACT PUBLISH DATE from "on [Month DD, YYYY]" footer
// ─────────────────────────────────────────────────────────────
function extractPublishDate(content) {
  const m = content.match(/on \[([A-Z][a-z]+ \d{1,2}, \d{4})\]/);
  if (m) {
    const d = new Date(m[1]);
    if (!isNaN(d)) return d.toISOString().split('T')[0];
  }
  // Fallback: look for Medium URL with date-like path (less reliable)
  return null;
}

// ─────────────────────────────────────────────────────────────
// 8. TOPIC SVG (by primary category)
// ─────────────────────────────────────────────────────────────
function topicSvg(cat) {
  const C = {
    theology: '#f59e0b', ontology: '#6366f1', epistemology: '#8b5cf6',
    semantics: '#8b5cf6', methodology: '#06b6d4', neuroscience: '#06b6d4',
    iran: '#10b981', physics: '#06b6d4', biology: '#22c55e',
    economics: '#f97316', 'philosophy-of-ethics': '#ec4899',
    'prescriptive-ethics': '#ec4899', 'descriptive-ethics': '#ec4899',
  };
  const color = C[cat] || '#6366f1';

  if (['theology', 'natural-theology'].includes(cat)) {
    return `<svg className="medium-deco-svg" width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <polygon points="60,12 108,96 12,96" stroke="${color}" strokeWidth="1.5" fill="${color}" fillOpacity="0.07"/>
  <polygon points="60,36 90,84 30,84" stroke="${color}" strokeWidth="1" fill="none" opacity="0.5"/>
  <circle cx="60" cy="60" r="7" fill="${color}" opacity="0.85"/>
</svg>`;
  }
  if (['ontology', 'physics', 'philosophy-of-mathematics', 'proof-theory', 'set-theory'].includes(cat)) {
    return `<svg className="medium-deco-svg" width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="60" r="48" stroke="${color}" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6"/>
  <circle cx="60" cy="60" r="28" stroke="${color}" strokeWidth="1" opacity="0.4"/>
  <circle cx="60" cy="60" r="8" fill="${color}" opacity="0.75"/>
  <line x1="12" y1="60" x2="108" y2="60" stroke="${color}" strokeWidth="0.5" opacity="0.3"/>
  <line x1="60" y1="12" x2="60" y2="108" stroke="${color}" strokeWidth="0.5" opacity="0.3"/>
</svg>`;
  }
  if (['epistemology', 'semantics', 'methodology', 'philosophy-of-science'].includes(cat)) {
    return `<svg className="medium-deco-svg" width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 96 Q60 20 100 96" stroke="${color}" strokeWidth="2" fill="none" opacity="0.7"/>
  <path d="M20 96 Q60 56 100 96" stroke="${color}" strokeWidth="1" fill="none" strokeDasharray="5 3" opacity="0.4"/>
  <circle cx="20" cy="96" r="4" fill="${color}" opacity="0.8"/>
  <circle cx="100" cy="96" r="4" fill="${color}" opacity="0.8"/>
  <circle cx="60" cy="38" r="4" fill="${color}" opacity="0.6"/>
</svg>`;
  }
  if (['neuroscience'].includes(cat)) {
    return `<svg className="medium-deco-svg" width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="60" cy="60" rx="48" ry="18" stroke="${color}" strokeWidth="1.5" fill="none" opacity="0.6" transform="rotate(0 60 60)"/>
  <ellipse cx="60" cy="60" rx="48" ry="18" stroke="${color}" strokeWidth="1.5" fill="none" opacity="0.6" transform="rotate(60 60 60)"/>
  <ellipse cx="60" cy="60" rx="48" ry="18" stroke="${color}" strokeWidth="1.5" fill="none" opacity="0.6" transform="rotate(120 60 60)"/>
  <circle cx="60" cy="60" r="7" fill="${color}" opacity="0.9"/>
</svg>`;
  }
  if (['iran', 'foundational-politics', 'descriptive-politics'].includes(cat)) {
    return `<svg className="medium-deco-svg" width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="16" y="16" width="88" height="88" rx="8" stroke="${color}" strokeWidth="1.5" fill="${color}" fillOpacity="0.06"/>
  <rect x="32" y="32" width="56" height="56" rx="4" stroke="${color}" strokeWidth="1" opacity="0.5"/>
  <rect x="49" y="49" width="22" height="22" rx="2" fill="${color}" opacity="0.7"/>
</svg>`;
  }
  // Default
  return `<svg className="medium-deco-svg" width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="60" r="48" stroke="${color}" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5"/>
  <path d="M35 82 Q60 28 85 82" stroke="${color}" strokeWidth="2" fill="none" opacity="0.7"/>
  <circle cx="60" cy="60" r="7" fill="${color}" opacity="0.8"/>
</svg>`;
}

// ─────────────────────────────────────────────────────────────
// 9. CLEANUP OLD GENERATED MEDIUM FILES from fa/ root
// ─────────────────────────────────────────────────────────────
function cleanupOldFiles() {
  const report = JSON.parse(fs.readFileSync(path.join(ROOT, 'migration-report.json'), 'utf8'));
  const oldFiles = report.map(r => r['فایل']);
  let removed = 0;
  oldFiles.forEach(f => {
    const p = path.join(OLD_FA, f);
    if (fs.existsSync(p)) {
      fs.rmSync(p);
      removed++;
    }
    // Also variants with ؛ (semicolons encoded differently)
    const altP = path.join(OLD_FA, f.replace(/-/g, '؛-').replace(/؛-/g, ';-'));
    if (fs.existsSync(altP)) {
      fs.rmSync(altP);
      removed++;
    }
  });
  // Remove any fa/*.mdx that has a UUID slug-like pattern (safety net)
  if (fs.existsSync(OLD_FA)) {
    const remaining = fs.readdirSync(OLD_FA).filter(f => f.endsWith('.mdx') || f.endsWith('.md'));
    remaining.forEach(f => {
      // Match files generated by old script (UUIDs stripped but similar names)
      const mediumTitles = report.map(r => r['عنوان'].substring(0, 10));
      const isOldMedium = mediumTitles.some(t => f.startsWith(createSlug(t).substring(0, 8)));
      if (isOldMedium) {
        const fp = path.join(OLD_FA, f);
        if (fs.existsSync(fp)) {
          // Only if no content that looks hand-crafted (check frontmatter)
          const c = fs.readFileSync(fp, 'utf8');
          if (c.includes('sourceType: medium')) {
            fs.rmSync(fp);
            removed++;
          }
        }
      }
    });
  }
  console.log(`🗑️  Removed ${removed} old generated files from fa/`);
}

// ─────────────────────────────────────────────────────────────
// 10. MAIN PROCESSING
// ─────────────────────────────────────────────────────────────
const report = [];
const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.md'));

files.forEach(file => {
  const fullPath = path.join(SRC_DIR, file);
  let content = fs.readFileSync(fullPath, 'utf8');

  // Extract title (remove UUID)
  const rawTitle = file.replace(/\.md$/, '');
  const extractedTitle = rawTitle.replace(/\s+[a-f0-9]{32}$/i, '').trim() || 'بدون عنوان';

  // Get override (try exact match, then partial)
  let override = OVERRIDES[extractedTitle];
  if (!override) {
    // Try partial match
    const key = Object.keys(OVERRIDES).find(k => extractedTitle.includes(k.substring(0, 15)));
    if (key) override = OVERRIDES[key];
  }

  const lang = (override && override.lang) || 'fa';
  const categories = (override && override.categories) || ['philosophy-other'];
  const interfaceType = (override && override.interface) || 'paper';
  const draft = isDraft(file);

  // Get real publish date before cleaning footer
  const publishDate = extractPublishDate(content) || '2024-01-01';

  // Clean
  content = cleanContent(content);
  content = fixMdLines(content);
  content = fixHalfSpaces(content);
  content = content.replace(/\n{3,}/g, '\n\n').trim();

  // Remove duplicate H1 (same as title)
  const titleWords = extractedTitle.replace(/[^\u0600-\u06FFa-zA-Z]/g, '').substring(0, 12);
  content = content.replace(new RegExp(`^#\\s+.*${titleWords.substring(0, 6)}.*\\n{0,2}`, 'm'), '');

  // First meaningful paragraph for description
  const desc = content.split('\n')
    .find(l => l.trim().length > 40 && !l.startsWith('#') && !l.startsWith('>') && !l.startsWith('-') && !l.startsWith('---') && !l.startsWith('<'))
    || `مقاله‌ای درباره ${extractedTitle}`;
  const description = desc.replace(/[*_`\[\]]/g, '').replace(/\u200C/g, '').substring(0, 160);

  const slug = createSlug(extractedTitle);
  const outDir = lang === 'en' ? OUT_EN : OUT_FA;
  const finalFileName = `${slug}.mdx`;

  const svg = topicSvg(categories[0]);

  const frontmatter = `---
title: "${extractedTitle}"
description: "${description}"
lang: ${lang}
publishDate: '${publishDate}'
author: مهدی سالم
sourceType: medium
interface: ${interfaceType}
book: ''
pdfUrl: ''
pdfOnly: false
showPdfViewer: false
tags:
${categories.map(c => `  - ${c}`).join('\n')}
categories:
${categories.map(c => `  - ${c}`).join('\n')}
draft: ${draft}
hidden: false
showheader: true
category: ${categories[0]}
keywords:
${categories.map(c => `  - ${c}`).join('\n')}
showInContents: true
coverImage: /images/articles/covers/${categories[0]}.png
imageDisplay: side
cardImage: show
hasSlide: false
---

<div className="medium-article-wrapper premium-design">

<div className="medium-deco-container">
${svg}
</div>

${content}

</div>
`;

  fs.writeFileSync(path.join(outDir, finalFileName), frontmatter, 'utf8');

  report.push({
    عنوان: extractedTitle,
    فایل: finalFileName,
    lang,
    وضعیت: draft ? 'پیش‌نویس' : 'منتشرشده',
    'دسته‌بندی': categories.join(', '),
    interface: interfaceType,
    publishDate,
  });

  process.stdout.write(`✓ [${lang}] ${extractedTitle.substring(0, 48)}\n`);
});

// Save new report
fs.writeFileSync(path.join(ROOT, 'migration-report.json'), JSON.stringify(report, null, 2));

// Cleanup old files
cleanupOldFiles();

console.log(`\n✅ ${report.length} articles processed.`);
console.log(`   fa/medium/ → ${report.filter(r => r.lang === 'fa').length} articles`);
console.log(`   en/medium/ → ${report.filter(r => r.lang === 'en').length} articles`);
