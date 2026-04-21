import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/b0583931/GitHub/MahdiSalem.com/src/content/articles/fa/medium';
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.mdx'));

const premiumHeader = `
<div className="medium-premium-header">
  <div className="header-content">
    <div className="category-badge">نوشته‌ی مدیوم</div>
    <div className="header-decoration">
      <div className="deco-line"></div>
      <div className="deco-dot"></div>
      <div className="deco-line"></div>
    </div>
  </div>
</div>`;

files.forEach(file => {
    const filePath = path.join(baseDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Regex to match the old deco container and its SVG
    // It usually looks like:
    // <div className="medium-deco-container">
    // <svg ... > ... </svg>
    // </div>
    const oldDecoRegex = /<div\s+className="medium-deco-container">[\s\S]*?<\/svg>\s*<\/div>/g;

    const newContent = content.replace(oldDecoRegex, premiumHeader.trim());

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log(`Premium Header applied: ${file}`);
    }
});

console.log('Done.');
