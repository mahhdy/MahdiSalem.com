/**
 * patch-hidden-frontmatter.mjs
 *
 * Adds `hidden: false` and `showInContents: true` to any content file
 * that is missing those frontmatter fields.
 *
 * Skips: Archive folders, non-md/mdx files.
 *
 * Usage:
 *   node scripts/patch-hidden-frontmatter.mjs           # preview (dry-run)
 *   node scripts/patch-hidden-frontmatter.mjs --apply   # actually write files
 */

import { readdir, readFile, writeFile, stat } from 'fs/promises';
import { join, extname, relative } from 'path';

const DRY_RUN = !process.argv.includes('--apply');
const ROOT = new URL('../src/content', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

// Skip these folder name patterns (case-insensitive)
const SKIP_DIRS = ['archive', '_archive', 'Archive', '.git'];

let patched = 0;
let skipped = 0;
let unchanged = 0;

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (SKIP_DIRS.some(s => entry.name.toLowerCase().includes(s.toLowerCase()))) {
        console.log(`  ⏭  Skipping archive dir: ${relative(ROOT, fullPath)}`);
        skipped++;
        continue;
      }
      await walk(fullPath);
      continue;
    }

    const ext = extname(entry.name).toLowerCase();
    if (ext !== '.md' && ext !== '.mdx') continue;

    await patchFile(fullPath);
  }
}

async function patchFile(filePath) {
  const rel = relative(ROOT, filePath);
  let content;
  try {
    content = await readFile(filePath, 'utf-8');
  } catch (e) {
    console.log(`  ✗  Could not read: ${rel}`);
    return;
  }

  // Must have frontmatter
  if (!content.startsWith('---')) {
    console.log(`  ⚠  No frontmatter: ${rel}`);
    return;
  }

  const fmEnd = content.indexOf('\n---', 3);
  if (fmEnd === -1) {
    console.log(`  ⚠  Malformed frontmatter: ${rel}`);
    return;
  }

  const fmBlock = content.slice(3, fmEnd);
  const rest = content.slice(fmEnd); // includes the closing ---

  let changed = false;
  let newFm = fmBlock;

  // Add `hidden: false` if missing
  if (!/^hidden\s*:/m.test(newFm)) {
    newFm += '\nhidden: false';
    changed = true;
  }

  // Add `showInContents: true` if missing
  if (!/^showInContents\s*:/m.test(newFm)) {
    newFm += '\nshowInContents: true';
    changed = true;
  }

  if (!changed) {
    unchanged++;
    return;
  }

  const newContent = `---${newFm}${rest}`;

  if (DRY_RUN) {
    console.log(`  [DRY] Would patch: ${rel}`);
  } else {
    await writeFile(filePath, newContent, 'utf-8');
    console.log(`  ✅  Patched: ${rel}`);
  }
  patched++;
}

console.log(`\n🔧 Patching content files (${DRY_RUN ? 'DRY RUN - use --apply to write' : 'WRITING'})...\n`);
await walk(ROOT);

console.log(`\n─────────────────────────────────`);
console.log(`  Patched  : ${patched}`);
console.log(`  Unchanged: ${unchanged}`);
console.log(`  Skipped  : ${skipped}`);
if (DRY_RUN) {
  console.log(`\n  Run with --apply to write changes.`);
}
console.log(`─────────────────────────────────\n`);
