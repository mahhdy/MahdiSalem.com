import fs from 'fs';
import path from 'path';

const baseDir = 'c:/Users/b0583931/GitHub/MahdiSalem.com/src/content/articles/fa/medium';
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.mdx'));

files.forEach(file => {
    const filePath = path.join(baseDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove the redundant year before </div>
    // Matches: [newline] [any number of spaces/tabs] [4 digits] . [newline] [any number of spaces/tabs] </div>
    const newContent = content.replace(/\n\s*\d{4}\.\s*\n\s*<\/div>/g, '\n</div>');

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log(`Updated: ${file}`);
    }
});

console.log('Done.');
