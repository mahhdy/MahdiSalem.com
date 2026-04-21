import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/b0583931/GitHub/MahdiSalem.com/src/content/articles/fa/medium';
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.mdx'));

files.forEach(file => {
    const filePath = path.join(baseDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) return;
    
    let fm = fmMatch[1];
    let body = content.slice(fmMatch[0].length);

    // Split body into lines
    let lines = body.split('\n');
    let newLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // 1. If it's a header or horizontal rule (---)
        const isHeader = trimmed.startsWith('#');
        const isHR = trimmed === '---';

        if (isHeader || isHR) {
            // Ensure empty line before if not at the very top and previous line isn't empty
            if (newLines.length > 0 && newLines[newLines.length - 1].trim() !== '') {
                newLines.push('');
            }
            
            newLines.push(line);
            
            // Ensure empty line after if not at the very end and next line isn't empty
            if (i < lines.length - 1 && lines[i + 1].trim() !== '') {
                newLines.push('');
            }
        } else {
            newLines.push(line);
        }
    }

    // Join and clean up double empty lines created by the logic
    let newBody = newLines.join('\n');
    
    // Replace 3+ newlines with 2
    newBody = newBody.replace(/\n{3,}/g, '\n\n');

    const finalContent = `---\n${fm.trim()}\n---\n\n${newBody.trim()}\n`;
    fs.writeFileSync(filePath, finalContent);
});

console.log('Spacing correction complete.');
