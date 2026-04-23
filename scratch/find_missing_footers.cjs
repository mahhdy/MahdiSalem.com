const fs = require('fs');
const path = require('path');

const articlesDir = path.join(process.cwd(), 'src', 'content', 'articles');

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.mdx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('medium.com') && !content.includes('medium-source-footer')) {
                const lines = content.split('\n');
                const mediumLines = lines.filter(l => l.includes('medium.com'));
                console.log(`--- ${fullPath} ---`);
                mediumLines.forEach(l => console.log(l));
            }
        }
    }
}

walk(articlesDir);
