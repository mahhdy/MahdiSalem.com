import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { globby } from 'globby';

const dataPath = 'cover-generation-data.json';
const generatedDir = 'public/images/articles/covers/medium';
const coversDir = 'public/images/articles/covers';
const contentDir = 'src/content/articles';

async function main() {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const generatedFiles = fs.readdirSync(generatedDir)
    .filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp'))
    .map(f => path.join(generatedDir, f));

  if (generatedFiles.length === 0) {
    console.error("No generated files found in", generatedDir);
    return;
  }

  let genIndex = 0;
  const targetMap = {}; 

  console.log('Converting generated images to WebP...');
  for (const item of data.articles) {
    const targetFile = item.target_filename; 
    const baseName = path.basename(targetFile, path.extname(targetFile));
    const newCoverName = baseName + '.webp';
    const newCoverPath = path.join(coversDir, newCoverName);
    
    const sourceImage = generatedFiles[genIndex % generatedFiles.length];
    genIndex++;

    try {
      await sharp(sourceImage)
        .webp({ quality: 80 })
        .toFile(newCoverPath);
      // console.log(`Created ${newCoverName}`);
    } catch (err) {
      console.error(`Error converting ${sourceImage}:`, err);
    }

    targetMap[baseName] = `/images/articles/covers/${newCoverName}`;
  }

  // Reload coversDir to include both existing ones and the new ones
  const allCovers = fs.readdirSync(coversDir)
    .filter(f => f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.jpg'))
    .filter(f => !fs.statSync(path.join(coversDir, f)).isDirectory())
    .map(f => `/images/articles/covers/${f}`);

  let fallbackIndex = 0;

  console.log('Updating MDX/MD files...');
  const articles = await globby([`${contentDir}/**/*.md`, `${contentDir}/**/*.mdx`]);
  
  for (const article of articles) {
    const ext = path.extname(article);
    const baseName = path.basename(article, ext); 

    let content = fs.readFileSync(article, 'utf8');
    let newContent = content;
    let modified = false;

    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (match) {
      let fm = match[1];
      const hasCover = fm.match(/^coverImage:(.*)$/m);
      
      if (hasCover) {
         const currentCover = hasCover[1].trim();
         if (targetMap[baseName]) {
             fm = fm.replace(/^coverImage:.*/m, `coverImage: ${targetMap[baseName]}`);
             modified = true;
         } else if (currentCover.endsWith('.svg') || currentCover === "''" || currentCover === '""') {
             const fbCover = allCovers[fallbackIndex % allCovers.length];
             fallbackIndex++;
             fm = fm.replace(/^coverImage:.*/m, `coverImage: ${fbCover}`);
             modified = true;
         }
      } else {
         if (targetMap[baseName]) {
             fm += `\ncoverImage: ${targetMap[baseName]}`;
             modified = true;
         } else {
             const fbCover = allCovers[fallbackIndex % allCovers.length];
             fallbackIndex++;
             fm += `\ncoverImage: ${fbCover}`;
             modified = true;
         }
      }
      
      if (modified) {
         newContent = content.replace(match[0], `---\n${fm}\n---`);
         fs.writeFileSync(article, newContent, 'utf8');
         console.log(`Updated cover for ${article}`);
      }
    }
  }

  console.log("Processing complete.");
}

main().catch(console.error);
