import fs from 'fs';
import path from 'path';
import { globby } from 'globby';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, '../src/content');
const publicDir = path.join(__dirname, '../public');

async function main() {
  const allCovers = fs.readdirSync(path.join(publicDir, 'images/articles/covers'))
    .filter(f => f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.jpg'))
    .filter(f => !fs.statSync(path.join(publicDir, 'images/articles/covers', f)).isDirectory())
    .map(f => `/images/articles/covers/${f}`);

  let fallbackIndex = 0;
  
  // Find all internal content files
  const mdFiles = await globby([`${contentDir.replace(/\\/g, '/')}/**/*.md`, `${contentDir.replace(/\\/g, '/')}/**/*.mdx`]);
  
  if (mdFiles.length === 0) {
      console.log('No Markdown files found.');
      return;
  }

  console.log(`Verifying image frontmatters for ${mdFiles.length} files...`);

  for (const file of mdFiles) {
    let content = fs.readFileSync(file, 'utf8');
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) continue;

    let fm = match[1];
    let modified = false;

    // --- 1. check coverImage ---
    const coverMatch = fm.match(/^coverImage:\s*(.*)$/m);
    let coverVal = coverMatch ? coverMatch[1].replace(/['"]/g, '').trim() : null;

    let hasValidImage = false;
    if (coverVal && coverVal.length > 0) {
       // Validate physical existence
       const physPath = path.join(__dirname, '..', 'public', coverVal.replace(/^\/+/, ''));
       if (fs.existsSync(physPath)) {
           hasValidImage = true;
       } else {
           // Not physically found -> need fallback
           hasValidImage = false;
       }
    }

    if (!hasValidImage) {
       const fbCover = allCovers[fallbackIndex % allCovers.length];
       fallbackIndex++;
       if (coverMatch) {
          fm = fm.replace(/^coverImage:\s*.*$/m, `coverImage: ${fbCover}`);
       } else {
          fm += `\ncoverImage: ${fbCover}`;
       }
       modified = true;
    }

    // --- 2. check imageDisplay ---
    const displayMatch = fm.match(/^imageDisplay:\s*(.*)$/m);
    if (!displayMatch) {
        fm += `\nimageDisplay: full`;
        modified = true;
    }

    // --- 3. check cardImage ---
    const cardMatch = fm.match(/^cardImage:\s*(.*)$/m);
    if (!cardMatch) {
        fm += `\ncardImage: show`;
        modified = true;
    }

    if (modified) {
       // normalize newlines in the injected string
       const newContent = content.replace(match[0], `---\n${fm}\n---`);
       fs.writeFileSync(file, newContent, 'utf8');
       console.log(`Fixed frontmatters for: ${path.basename(file)}`);
    }
  }
  
  console.log('Done verifying images!');
}

main().catch(console.error);
