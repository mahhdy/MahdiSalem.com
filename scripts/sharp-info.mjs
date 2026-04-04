import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dirs = [
  'public/images/articles/covers',
  'public/images/books/covers'
];

async function main() {
  for (const dir of dirs) {
    console.log(`\nChecking directory: ${dir}`);
    if (!fs.existsSync(dir)) continue;
    
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (!file.match(/\.(png|jpg|jpeg|webp)$/i)) continue;
      
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      // Only check images larger than 500KB
      if (stats.size > 500 * 1024) {
        try {
          const metadata = await sharp(filePath).metadata();
          console.log(`- ${file}: ${Math.round(stats.size/1024)}KB, ${metadata.width}x${metadata.height}, format: ${metadata.format}`);
        } catch (e) {
          console.log(`- ${file}: ERROR: ${e.message}`);
        }
      }
    }
  }
}

main();
