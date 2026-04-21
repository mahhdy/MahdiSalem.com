import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/b0583931/GitHub/MahdiSalem.com/src/content/articles/fa/medium';
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.mdx'));

const months = {
    'January': '01', 'February': '02', 'March': '03', 'April': '04', 'May': '05', 'June': '06',
    'July': '07', 'August': '08', 'September': '09', 'October': '10', 'November': '11', 'December': '12'
};

const faMonths = {
    'ژانویه': '01', 'فوریه': '02', 'مارس': '03', 'آوریل': '04', 'می': '05', 'جون': '06',
    'جولای': '07', 'اوت': '08', 'سپتامبر': '09', 'اکتبر': '10', 'نوامبر': '11', 'دسامبر': '12'
};

const allMonths = { ...months, ...faMonths };

function normalizeText(text) {
    if (!text) return '';
    return text.toLowerCase()
        .replace(/[^\p{L}\d]/gu, '')
        .replace(/\s+/g, '');
}

function parseDate(line) {
    // Case 1: on [June 22, 2023] or on June 22, 2023
    const match = line.match(/on\s+(?:\[)?([A-Za-z\u0600-\u06FF]+)\s+(\d{1,2}),\s+(\d{4})/);
    if (match) {
        const [_, month, day, year] = match;
        const monthNum = allMonths[month];
        if (monthNum) {
            return `${year}-${monthNum}-${day.padStart(2, '0')}`;
        }
    }

    // Case 2: Persian date like "جون 2023" or "7 مارس 2023"
    for (const [name, num] of Object.entries(allMonths)) {
        if (line.includes(name)) {
            const yearMatch = line.match(/\d{4}/);
            const dayMatch = line.match(/\b(\d{1,2})\b/);
            if (yearMatch) {
                const year = yearMatch[0];
                const day = dayMatch ? dayMatch[1].padStart(2, '0') : '01';
                return `${year}-${num}-${day}`;
            }
        }
    }

    return null;
}

files.forEach(file => {
    const filePath = path.join(baseDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) return;
    
    let fm = fmMatch[1];
    const titleMatch = fm.match(/title:\s*"(.*)"/);
    const title = titleMatch ? titleMatch[1].trim() : '';
    const descMatch = fm.match(/description:\s*"(.*)"/);
    const description = descMatch ? descMatch[1].trim() : '';
    const normTitle = normalizeText(title);
    const normDesc = normalizeText(description);

    let pubDate = null;
    const lines = content.split('\n');
    for (let i = lines.length - 1; i >= Math.max(0, lines.length - 30); i--) {
        const d = parseDate(lines[i]);
        if (d) {
            pubDate = d;
            break;
        }
    }

    if (pubDate) {
        fm = fm.replace(/publishDate:\s*'.*?'/, `publishDate: '${pubDate}'`);
    }

    let body = content.slice(fmMatch[0].length);
    const bodyLines = body.split('\n');
    let newBodyLines = [];
    let skippingHeader = true;
    
    for (let i = 0; i < bodyLines.length; i++) {
        const rawLine = bodyLines[i];
        const line = rawLine.trim();
        
        if (skippingHeader && line === '') continue;

        // Keep structural tags
        if (skippingHeader && (line.startsWith('<div') || line.includes('medium-') || line.startsWith('<svg') || line.startsWith('<circle') || line.startsWith('<line') || line.startsWith('<path') || line.startsWith('</div') || line === '---')) {
            newBodyLines.push(rawLine);
            continue;
        }

        const cleanLine = normalizeText(line.replace(/^#+\s*/, ''));

        if ((cleanLine === normTitle && line.startsWith('#')) || (skippingHeader && cleanLine === normTitle)) {
            continue;
        }

        if (cleanLine === normDesc && normDesc !== '') {
            continue;
        }
        
        if (line !== '') {
            skippingHeader = false;
            newBodyLines.push(rawLine);
        }
    }

    const bodyContent = newBodyLines.join('\n');
    const finalContent = `---\n${fm.trim()}\n---\n\n${bodyContent.trim()}`;
    fs.writeFileSync(filePath, finalContent);
});

console.log('Final cleanup complete.');
