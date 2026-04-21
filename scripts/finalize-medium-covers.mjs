import fs from 'fs';
import path from 'path';
import { globby } from 'globby';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, '../src/content/articles');
const publicDir = path.join(__dirname, '../public');
const coversDir = path.join(publicDir, 'images/articles/covers');

async function main() {
  const allCovers = fs.readdirSync(coversDir)
    .filter(f => f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.jpg'))
    .filter(f => !fs.statSync(path.join(coversDir, f)).isDirectory())
    .map(f => `/images/articles/covers/${f}`);

  if (allCovers.length === 0) {
    console.error('No cover images found in', coversDir);
    return;
  }

  let fallbackIndex = 0;
  
  // Find all internal content files
  const articles = await globby([`${contentDir.replace(/\\/g, '/')}/**/*.md`, `${contentDir.replace(/\\/g, '/')}/**/*.mdx`]);
  
  console.log(`Processing ${articles.length} articles...`);

  for (const file of articles) {
    let content = fs.readFileSync(file, 'utf8');
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) continue;

    let fm = match[1];
    let modified = false;

    // Check if it's a medium article (either in medium folder or has sourceType: medium)
    const isMedium = file.includes('\\medium\\') || file.includes('/medium/') || fm.match(/^sourceType:\s*["']?medium["']?$/m);

    if (isMedium) {
        console.log(`Processing Medium article: ${path.basename(file)}`);
        
        // 1. Enforce imageDisplay: full
        if (fm.match(/^imageDisplay:\s*.*$/m)) {
            if (!fm.match(/^imageDisplay:\s*full$/m)) {
                fm = fm.replace(/^imageDisplay:\s*.*$/m, `imageDisplay: full`);
                modified = true;
            }
        } else {
            fm += `\nimageDisplay: full`;
            modified = true;
        }

        // 2. Enforce cardImage: show
        if (fm.match(/^cardImage:\s*.*$/m)) {
            if (!fm.match(/^cardImage:\s*show$/m)) {
                fm = fm.replace(/^cardImage:\s*.*$/m, `cardImage: show`);
                modified = true;
            }
        } else {
            fm += `\ncardImage: show`;
            modified = true;
        }

        // 3. check coverImage
        const coverMatch = fm.match(/^coverImage:\s*(.*)$/m);
        let coverVal = coverMatch ? coverMatch[1].replace(/['"]/g, '').trim() : null;
        let needsNewCover = false;

        if (coverVal) {
            const physPath = path.join(publicDir, coverVal.replace(/^\/+/, ''));
            if (!fs.existsSync(physPath) || coverVal.endsWith('.svg') || coverVal === "''" || coverVal === '""') {
                needsNewCover = true;
            }
        } else {
            needsNewCover = true;
        }

        if (needsNewCover) {
            // Try to find a matching webp by filename
            const baseName = path.basename(file, path.extname(file));
            const potentialCover = `/images/articles/covers/${baseName}.webp`;
            const physPotentialPath = path.join(publicDir, potentialCover.replace(/^\/+/, ''));
            
            let finalCover = '';
            if (fs.existsSync(physPotentialPath)) {
                finalCover = potentialCover;
            } else {
                finalCover = allCovers[fallbackIndex % allCovers.length];
                fallbackIndex++;
            }

            if (coverMatch) {
                fm = fm.replace(/^coverImage:\s*.*$/m, `coverImage: ${finalCover}`);
            } else {
                fm += `\ncoverImage: ${finalCover}`;
            }
            modified = true;
        }
    } else {
        // For non-medium articles, just ensure basic fields exist (as verify-covers did)
        let basicModified = false;
        if (!fm.match(/^imageDisplay:\s*.*$/m)) {
            fm += `\nimageDisplay: full`;
            basicModified = true;
        }
        if (!fm.match(/^cardImage:\s*.*$/m)) {
            fm += `\ncardImage: show`;
            basicModified = true;
        }
        const coverMatch = fm.match(/^coverImage:\s*(.*)$/m);
        let coverVal = coverMatch ? coverMatch[1].replace(/['"]/g, '').trim() : null;
        if (!coverVal || !fs.existsSync(path.join(publicDir, coverVal.replace(/^\/+/, '')))) {
            const fbCover = allCovers[fallbackIndex % allCovers.length];
            fallbackIndex++;
            if (coverMatch) {
                fm = fm.replace(/^coverImage:\s*.*$/m, `coverImage: ${fbCover}`);
            } else {
                fm += `\ncoverImage: ${fbCover}`;
            }
            basicModified = true;
        }
        if (basicModified) modified = true;
    }

    if (modified) {
       const newContent = content.replace(match[0], `---\n${fm.trim()}\n---`);
       fs.writeFileSync(file, newContent, 'utf8');
    }
  }
  
  console.log('Finalization complete!');
}

main().catch(console.error);
