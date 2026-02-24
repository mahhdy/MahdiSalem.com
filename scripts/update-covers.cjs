const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Correct mapping based on content.config.ts schema:
// coverImage: string (path to image file)
// imageDisplay: 'full' | 'side' | 'thumbnail' | 'hidden'
// cardImage: 'show' | 'hidden'

const tasks = [
    { row: 2, doc: 'article', title: 'راست یا چپ؛ میانه کجاست؟ (نسخه اول)', file: 'mermaid-test-cover.png', imageDisplay: 'thumbnail', cardImage: 'show' },
    { row: 3, doc: 'article', title: 'الگوی جامع مدیریت دوره گذار', file: 'آشنایی-با-دوران-گذار-انقلابی-cover.png', imageDisplay: 'full', cardImage: 'show' },
    { row: 4, doc: 'article', title: 'نقش ارتش در انقلابها', file: 'ارتش-و-انقلاب-ها-cover.png', imageDisplay: 'full', cardImage: 'show' },
    { row: 5, doc: 'article', title: 'انقلاب فرانسه: تحلیل جامع', file: 'انقلاب-شناسی-تحلیل-جامع-انقلاب-فرانسه-cover.png', imageDisplay: 'full', cardImage: 'show' },
    { row: 6, doc: 'article', title: 'انقلاب روسیه 1917', file: 'انقلاب-شناسی-تحلیلی-از-انقلاب-1917-روسیه-cover.png', imageDisplay: 'full', cardImage: 'show' },
    { row: 7, doc: 'article', title: 'انواع سطوح تغییر سیاسی', file: 'انواع-سطوح-تغییر-سیاسی-cover.png', imageDisplay: 'full', cardImage: 'show' },
    { row: 8, doc: 'article', title: 'راست یا چپ مساله کجاست', file: 'راست-یا-چپ-مساله-کجاست-cover.png', imageDisplay: 'full', cardImage: 'show' },
    { row: 9, doc: 'article', title: 'مروری بر شیوه', file: 'مروری-بر-شیوه-های-تغییر-رژیم-های-سیاسی-cover.png', imageDisplay: 'full', cardImage: 'show' },
    { row: 10, doc: 'article', title: 'مقایسه انقلاب ایران', file: 'مقایسه‌ای-انقلاب-ایران-روسیه-cover.png', imageDisplay: 'full', cardImage: 'show' },
    { row: 11, doc: 'article', title: 'اخلاق و جدال', file: 'Ethics-and-Conflicts-cover.png', imageDisplay: 'full', cardImage: 'show' },
    { row: 12, doc: 'article', title: 'آزادی به مثابه', file: 'Fredoom-As--cover.png', imageDisplay: 'full', cardImage: 'show' },
    { row: 13, doc: 'article', title: 'داستان آزادی', file: 'story-of-freedom-fa-fixed-cover.png', imageDisplay: 'full', cardImage: 'show' },
    { row: 14, doc: 'article', title: 'داستان-آزادی', file: 'داستان-آزادی-cover.png', imageDisplay: 'side', cardImage: 'show' },
    { row: 20, doc: 'article', title: 'راست یا چپ؛ در این میانه', file: 'راست-یا-چپ-در-این-میانه-کجاست-cover.png', imageDisplay: 'full', cardImage: 'show' },
    { row: 1, doc: 'book', title: 'راهبرد گذار دموکراتیک ایران', file: 'iran-transition-article-cover.png', imageDisplay: 'full', cardImage: 'show' },
    { row: 15, doc: 'book', title: 'ملت و ملیت', file: 'nation-nationality-iran-cover.png', imageDisplay: 'full', cardImage: 'show' },
    { row: 16, doc: 'book', title: 'ایران، از بحران', file: 'iran-crisis-to-growth-cover.png', imageDisplay: 'full', cardImage: 'show' },
    { row: 17, doc: 'book', title: 'نظارت بین المللی', file: 'intl-monitoring-democratic-transition-cover.png', imageDisplay: 'full', cardImage: 'show' },
    { row: 18, doc: 'book', title: 'معاهده', file: 'npt-treaty-violations-cover.png', imageDisplay: 'full', cardImage: 'show' },
    { row: 19, doc: 'book', title: 'دادگاه در تبعید', file: 'court-in-exile-cover.png', imageDisplay: 'full', cardImage: 'show' },
];

const basePath = path.join(__dirname, '../src/content');
const articlesDir = path.join(basePath, 'articles/fa');
const booksDir = path.join(basePath, 'books/fa');

function findFile(task) {
    if (task.doc === 'article') {
        const files = fs.readdirSync(articlesDir);
        // 1. Try filename-based match
        const expectedSlug = task.file.replace(/-cover\.png$/, '');
        for (const f of files) {
            const fBase = f.replace(/\.(mdx?|bak)$/, '').replace(/ /g, '-');
            if (fBase === expectedSlug || fBase.includes(expectedSlug) || expectedSlug.includes(fBase)) {
                if (f.endsWith('.mdx') || f.endsWith('.md')) {
                    return path.join(articlesDir, f);
                }
            }
        }
        // 2. Try title-based match in frontmatter
        for (const f of files) {
            if (!f.endsWith('.mdx') && !f.endsWith('.md')) continue;
            try {
                const content = fs.readFileSync(path.join(articlesDir, f), 'utf-8');
                const parsed = matter(content);
                if (parsed.data && parsed.data.title) {
                    if (parsed.data.title.includes(task.title) || task.title.split('-').some(t => parsed.data.title.includes(t))) {
                        return path.join(articlesDir, f);
                    }
                }
            } catch (e) { }
        }
    } else {
        const dirs = fs.readdirSync(booksDir);
        for (const d of dirs) {
            const indexMdx = path.join(booksDir, d, 'index.mdx');
            if (fs.existsSync(indexMdx)) {
                try {
                    const content = fs.readFileSync(indexMdx, 'utf-8');
                    const parsed = matter(content);
                    if (parsed.data && parsed.data.title && parsed.data.title.includes(task.title)) {
                        return indexMdx;
                    }
                } catch (e) { }
            }
        }
    }
    return null;
}

const unmapped = [];
let updated = 0;
for (const task of tasks) {
    const file = findFile(task);
    if (!file) {
        unmapped.push(task.title);
        continue;
    }

    try {
        const content = fs.readFileSync(file, 'utf-8');
        const parsed = matter(content);

        // Correct types per schema:
        // coverImage: string (path)
        // imageDisplay: 'full' | 'side' | 'thumbnail' | 'hidden'
        // cardImage: 'show' | 'hidden'
        parsed.data.coverImage = `/images/articles/covers/${task.file}`;
        parsed.data.imageDisplay = task.imageDisplay;
        parsed.data.cardImage = task.cardImage;

        // Remove stale boolean cardImage if it was set as true
        if (parsed.data.cardImage === true) parsed.data.cardImage = 'show';
        if (parsed.data.cardImage === false) parsed.data.cardImage = 'hidden';

        fs.writeFileSync(file, matter.stringify(parsed.content, parsed.data), 'utf-8');
        console.log(`✅ Updated: ${path.basename(file)}`);
        updated++;
    } catch (e) {
        console.error(`❌ Error updating ${file}: ${e.message}`);
    }
}

console.log(`\nDone: ${updated} files updated.`);
if (unmapped.length > 0) {
    console.log('⚠️  Unmapped:', unmapped.join(', '));
}
