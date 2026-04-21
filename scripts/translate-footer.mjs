import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/b0583931/GitHub/MahdiSalem.com/src/content/articles/fa/medium';
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.mdx'));

const monthMap = {
    'January': 'ژانویه', 'February': 'فوریه', 'March': 'مارس', 'April': 'آوریل', 'May': 'می', 'June': 'ژوئن',
    'July': 'جولای', 'August': 'اوت', 'September': 'سپتامبر', 'October': 'اکتبر', 'November': 'نوامبر', 'December': 'دسامبر'
};

const enToFaDigits = (s) => s.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

files.forEach(file => {
    const filePath = path.join(baseDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Pattern: By [Mahdi Salem](LINK) on [Month Day, Year](LINK).
    const regex = /By\s+\[Mahdi Salem\]\((.*?)\)\s+on\s+\[(.*?)\s+(\d{1,2}),\s+(\d{4})\]\((.*?)\)\./g;

    const newContent = content.replace(regex, (match, authorLink, month, day, year, articleLink) => {
        const faMonth = monthMap[month] || month;
        const faDay = enToFaDigits(day);
        const faYear = enToFaDigits(year);
        
        // Return with double spacing before and translated text
        return `\n\nتوسط [مهدی سالم](${authorLink}) در [${faDay} ${faMonth} ${faYear}](${articleLink}).`;
    });

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log(`Translated and spaced: ${file}`);
    }
});

console.log('Done.');
