import fs from 'fs';
import path from 'path';

// This is a quick check script
const categoriesFile = 'c:/Users/b0583931/GitHub/MahdiSalem.com/src/data/categories.ts';
const imagesDir = 'c:/Users/b0583931/GitHub/MahdiSalem.com/public/images/categories';

const content = fs.readFileSync(categoriesFile, 'utf8');
const slugs = [...content.matchAll(/imagePath:\s*'(.*?)'/g)].map(m => m[1]);
const basePublicDir = 'c:/Users/b0583931/GitHub/MahdiSalem.com/public';

console.log('Missing Image Files:');
slugs.forEach(imgatePath => {
    const fullPath = path.join(basePublicDir, imgatePath);
    if (!fs.existsSync(fullPath)) {
        console.log(`- ${imgatePath}`);
    }
});
