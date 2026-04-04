import fs from 'fs';
import path from 'path';

const contentDir = 'src/content';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const extensions = ['.md', '.mdx'];

walkDir(contentDir, (filePath) => {
  if (!extensions.includes(path.extname(filePath))) return;

  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  // 1. Convert .png/.jpg/.jpeg to .webp for coverImage
  // Look for coverImage: /images/.../*.png
  content = content.replace(/(coverImage:\s+.*?)\.(png|jpg|jpeg)/gi, '$1.webp');

  // 2. Specific fix for iraq-invasion-results vs iraq-invasion-result
  content = content.replace(/iraq-invasion-results\.webp/gi, 'iraq-invasion-result.webp');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Updated: ${filePath}`);
  }
});
