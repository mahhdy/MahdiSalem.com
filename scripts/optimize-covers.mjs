import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dirs = [
  'public/images/articles/covers',
  'public/images/books/covers'
];

const backupDir = 'public/images/backups';

async function optimizeImages() {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    
    console.log(`\nProcessing directory: ${dir}`);
    const files = fs.readdirSync(dir);

    for (const file of files) {
      if (!file.match(/\.(png|jpg|jpeg|svg)$/i)) continue;
      if (file.endsWith('.svg')) continue; // Skip SVGs

      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      const ext = path.extname(file);
      const baseName = path.basename(file, ext);
      const webpPath = path.join(dir, `${baseName}.webp`);

      console.log(`- Optimizing ${file} (${Math.round(stats.size/1024)}KB)`);

      try {
        const image = sharp(filePath);
        const metadata = await image.metadata();

        // 1. Move original to backup
        fs.copyFileSync(filePath, path.join(backupDir, file));

        // 2. Resize and Convert to WebP
        let pipeline = image;
        if (metadata.width > 1200) {
          pipeline = pipeline.resize(1200);
        }

        await pipeline.webp({ quality: 80 }).toFile(webpPath);

        // 3. Remove original if it was a PNG/JPG
        fs.unlinkSync(filePath);

        const newStats = fs.statSync(webpPath);
        console.log(`  ✅ Done: ${Math.round(newStats.size/1024)}KB (${Math.round((1 - newStats.size/stats.size)*100)}% reduction)`);
      } catch (e) {
        console.error(`  ❌ Error processing ${file}: ${e.message}`);
      }
    }
  }
}

optimizeImages();
