import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/b0583931/GitHub/MahdiSalem.com/src/content/articles/fa/medium';
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.mdx'));

const mediumIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42zM24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75c.66 0 1.19 2.58 1.19 5.75z"/></svg>`;

files.forEach(file => {
    const filePath = path.join(baseDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Regex to match the "ugly" footer we want to replace
    const footerRegex = /<div className="medium-source-footer">[\s\S]*?<div className="footer-date">انتشار در تاریخ: (.*?)<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/g;

    const newContent = content.replace(footerRegex, (match, dateText) => {
        // We try to keep the same link if possible, but currently we only have the profile link
        // UNLESS we find a way to extract the real article link.
        // For now, we'll use the profile link as fallback but keep the date.
        return `<div className="medium-source-footer">
  <div className="footer-content">
    <div className="medium-icon-container">
      ${mediumIcon}
    </div>
    <div className="footer-text">
      <span className="published-label">منتشر شده در مدیوم نویسنده</span>
      <p className="main-footer-text">
        توسط <a href="https://medium.com/@mahhdy">مهدی سالم</a> در <a href="https://medium.com/@mahhdy">${dateText}</a>
      </p>
    </div>
  </div>
</div>`;
    });

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log(`Upgraded footer: ${file}`);
    }
});

console.log('Upgrade complete.');
