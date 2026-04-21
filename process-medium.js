const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'content-source', 'articles', 'fa', 'Medium Posts');
const indexFile = path.join(__dirname, 'content-source', 'articles', 'fa', 'Medium Posts 2e6e9556a4c946bab33c5015e1bcb8ce.md');
const outDir = path.join(__dirname, 'src', 'content', 'articles', 'fa');
const categoriesFile = path.join(__dirname, 'src', 'data', 'categories.ts');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. Read categories
const catContent = fs.readFileSync(categoriesFile, 'utf8');
const catRegex = /slug:\s*'([^']+)',\s*nameFa:\s*'([^']+)'/g;
const categories = [];
let match;
while ((match = catRegex.exec(catContent)) !== null) {
  categories.push({ slug: match[1], fa: match[2] });
}

// 2. Read published vs draft from index
const indexContent = fs.readFileSync(indexFile, 'utf8');
const publishedSection = indexContent.split('## پیش‌نویس‌ها')[0];
const draftSection = indexContent.split('## پیش‌نویس‌ها')[1];

function isDraft(fileName) {
  if (draftSection && draftSection.includes(encodeURI(fileName))) return true;
  if (draftSection && draftSection.includes(fileName)) return true;
  return false; // Assuming published if not in draft
}

// Helper to generate slug from Persian text
function createSlug(text) {
  return text.trim().replace(/[\s_]+/g, '-').replace(/[^\w\u0600-\u06FF\-]/g, '');
}

// Decorative SVGs per category (just some simple artistic shapes)
const catSvgs = {
  // Simple abstract svg to inject
  default: `<div className="my-8 flex justify-center"><svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" opacity="0.5"/><path d="M50 20 L80 80 L20 80 Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1"/></svg></div>`
};

const report = [];

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.md'));

files.forEach(file => {
  const fullPath = path.join(srcDir, file);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Extract Title (usually original file name without the hex UUID)
  // Format: "Title text 3c92a97e4908473b932568807776e2db.md"
  let originalTitle = file.replace(/\.md$/, '');
  let extractedTitle = originalTitle.replace(/\s*[a-f0-9]{32}$/i, '');
  
  if(extractedTitle === '') extractedTitle = 'بدون عنوان'; // Fallback
  
  const draft = isDraft(file);
  const slug = createSlug(extractedTitle);
  let finalFileName = \`\${slug}.mdx\`;
  
  // Match categories by keywords
  let matchedCategories = [];
  categories.forEach(c => {
    if (content.includes(c.fa) || extractedTitle.includes(c.fa)) {
      matchedCategories.push(c.slug);
    }
  });
  if (matchedCategories.length === 0) matchedCategories = ['philosophy-other']; // fallback
  
  // Clean notion UUIDs in links [text](... uuid.md)
  content = content.replace(/\]\([^\)]+[a-f0-9]{32}\.md\)/gi, '](#)');
  
  // Clean empty paragraphs / double newlines
  content = content.replace(/\n{3,}/g, '\n\n');

  // Convert to MDX with artistic layout wrapper
  // We'll wrap the content in a custom medium-style div if needed, 
  // or just depend on global styles using a specific interface/sourceType.
  
  const frontmatter = \`---
title: "\${extractedTitle}"
description: "مقاله‌ای برگرفته از یادداشت‌های مدیوم درباره \${matchedCategories[0]}"
lang: fa
publishDate: '2026-04-21'
author: مهدی سالم
sourceType: medium
interface: iran
book: 
pdfUrl: 
pdfOnly: false
showPdfViewer: false
tags:
\${matchedCategories.map(c => \`  - \${c}\`).join('\\n')}
categories:
\${matchedCategories.map(c => \`  - \${c}\`).join('\\n')}
draft: \${draft}
hidden: false
showheader: true
category: \${matchedCategories[0]}
keywords:
\${matchedCategories.map(c => \`  - \${c}\`).join('\\n')}
showInContents: true
coverImage: /images/articles/covers/\${matchedCategories[0]}.jpg
imageDisplay: side
cardImage: show
hasSlide: false
---

<div className="medium-article-wrapper premium-design">

\${catSvgs.default}

\${content}

</div>
\`;

  const outFilePath = path.join(outDir, finalFileName);
  fs.writeFileSync(outFilePath, frontmatter, 'utf8');
  
  report.push({
    title: extractedTitle,
    file: finalFileName,
    status: draft ? 'Draft' : 'Published',
    categories: matchedCategories.join(', '),
    action: 'Cleaned, IDs removed, UI wrapper added, SVG injected'
  });
});

console.log("Processed " + report.length + " files.");
fs.writeFileSync('migration-report.json', JSON.stringify(report, null, 2));

