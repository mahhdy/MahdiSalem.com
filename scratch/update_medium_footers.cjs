const fs = require('fs');
const path = require('path');

const monthMap = {
    'January': 'ژانویه',
    'February': 'فوریه',
    'March': 'مارس',
    'April': 'آوریل',
    'May': 'مه',
    'June': 'ژوئن',
    'July': 'جولای',
    'August': 'آگوست',
    'September': 'سپتامبر',
    'October': 'اکتبر',
    'November': 'نوامبر',
    'December': 'دسامبر'
};

const digitMap = {
    '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
    '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹'
};

function toFarsiDigits(str) {
    if (!str) return '';
    return str.replace(/[0-9]/g, w => digitMap[w]);
}

function convertDateToFarsi(dateStr) {
    // Expected format: "Month Day, Year" e.g., "August 21, 2023"
    let result = dateStr;
    
    // First, convert month name
    for (const [en, fa] of Object.entries(monthMap)) {
        if (result.includes(en)) {
            result = result.replace(en, fa);
            break;
        }
    }
    
    // Then, handle digits and formatting
    // Match something like "آگوست 21, 2023" or "March 7, 2023"
    // Using a more inclusive regex for month (any non-digit characters)
    const match = result.match(/([^\d\s,]+)\s+(\d+),\s+(\d+)/);
    if (match) {
        const [_, month, day, year] = match;
        return `${toFarsiDigits(day)} ${month} ${toFarsiDigits(year)}`;
    }
    
    return toFarsiDigits(result);
}

const farsiFooterTemplate = (url, date) => `
<div className="medium-source-footer">
  <div className="footer-content">
    <div className="medium-icon-container">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42zM24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75c.66 0 1.19 2.58 1.19 5.75z"/></svg>
    </div>
    <div className="footer-text">
      <span className="published-label">منتشر شده در مدیوم نویسنده</span>
      <p className="main-footer-text">
        توسط <a href="https://medium.com/@mahhdy">مهدی سالم</a> در <a href="${url}">${date}</a>
      </p>
    </div>
  </div>
</div>
`;

const englishFooterTemplate = (url, date) => `
<div className="medium-source-footer">
  <div className="footer-content">
    <div className="medium-icon-container">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42zM24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75c.66 0 1.19 2.58 1.19 5.75z"/></svg>
    </div>
    <div className="footer-text">
      <span className="published-label">Published on Author's Medium</span>
      <p className="main-footer-text">
        By <a href="https://medium.com/@mahhdy">Mahdi Salem</a> on <a href="${url}">${date}</a>
      </p>
    </div>
  </div>
</div>
`;

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const langMatch = content.match(/lang:\s*(\w+)/);
    const lang = langMatch ? langMatch[1] : 'fa';

    // Updated pattern to be more flexible and handle the new footer if it's already there (to avoid duplication or fix it)
    // Actually, for now, let's just focus on replacing the old one.
    // The old pattern was: By [Mahdi Salem](...) on [Date](URL).
    // Followed by potentially a Year and a closing div.
    const footerPattern = /By \[Mahdi Salem\]\(https:\/\/medium\.com\/@mahhdy\) on \[(.*?)\]\((.*?)\)\.\s*(?:\d{4}\.\s*)?/g;
    
    // Also, I noticed some files already have the new footer (from previous runs or manual edits)
    // I should check if I should skip them or overwrite them.
    // For this task, I'll assume I'm fixing the ones that were wrong.
    
    let modified = false;
    content = content.replace(footerPattern, (match, date, url) => {
        modified = true;
        if (lang === 'fa') {
            const farsiDate = convertDateToFarsi(date);
            return farsiFooterTemplate(url, farsiDate);
        } else {
            return englishFooterTemplate(url, date);
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

const articlesDir = path.join(process.cwd(), 'src', 'content', 'articles');

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.mdx')) {
            processFile(fullPath);
        }
    }
}

walk(articlesDir);
