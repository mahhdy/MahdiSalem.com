#!/usr/bin/env node

/**
 * Script to fix/update 'interface' field in all content frontmatter
 * Forces re-evaluation even if interface field exists
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Category mapping from old names to new slugs
const CATEGORY_MAPPING = {
  // Politics-related
  'انقلاب‌شناسی': 'descriptive-politics',
  'نظریه سیاسی': 'foundational-politics',
  'فلسفه سیاسی': 'foundational-politics',
  'گذار دموکراتیک': 'descriptive-politics',
  'اصلاحات سیاسی': 'descriptive-politics',
  'سیاست توصیفی': 'descriptive-politics',
  'سیاست تاسیسی': 'foundational-politics',
  'ایران': 'iran',

  // Ethics-related
  'اخلاق': 'philosophy-of-ethics',
  'فلسفه اخلاق': 'philosophy-of-ethics',
  'اخلاق توصیفی': 'descriptive-ethics',
  'اخلاق تجویزی': 'prescriptive-ethics',
  'اخلاق کاربردی': 'applied-ethics',

  // Philosophy-related
  'فلسفه': 'philosophy-other',
  'هستی‌شناسی': 'ontology',
  'معرفت‌شناسی': 'epistemology',
  'معناشناسی': 'semantics',
  'روش‌شناسی': 'methodology',

  // Science-related
  'علم': 'philosophy-of-science',
  'فلسفه علم': 'philosophy-of-science',
  'فیزیک': 'physics',
  'کوانتوم': 'quantum',
  'زیست‌شناسی': 'biology',
  'عصب‌شناسی': 'neuroscience',

  // Logic & Mathematics
  'منطق': 'meta-logic',
  'فلسفه ریاضیات': 'philosophy-of-mathematics',
  'نظریه مدل': 'model-theory',
  'نظریه اثبات': 'proof-theory',
  'نظریه مجموعه‌ها': 'set-theory',
  'نظریه بازگشتی': 'recursion-theory',

  // Economics
  'اقتصاد': 'economics',

  // Life
  'زندگی': 'life',

  // Fallback
  'متفرقه': 'philosophy-other',
};

// Valid interface categories from categories.ts
const VALID_CATEGORIES = [
  'ontology', 'epistemology', 'semantics', 'methodology', 'philosophy-other',
  'philosophy-of-science', 'physics', 'quantum', 'biology', 'neuroscience',
  'philosophy-of-mathematics', 'meta-logic', 'model-theory', 'proof-theory',
  'set-theory', 'recursion-theory',
  'philosophy-of-ethics', 'descriptive-ethics', 'prescriptive-ethics', 'applied-ethics',
  'descriptive-politics', 'foundational-politics', 'iran',
  'economics', 'life'
];

/**
 * Map old category name to new category slug
 */
function mapCategory(oldCategory) {
  return CATEGORY_MAPPING[oldCategory] || 'philosophy-other';
}

/**
 * Determine interface category based on content metadata
 */
function determineInterfaceCategory(frontmatter) {
  // Check categories array - prioritize ethics and specific topics
  if (frontmatter.categories && Array.isArray(frontmatter.categories)) {
    // First pass: look for ethics categories
    for (const cat of frontmatter.categories) {
      if (cat.includes('اخلاق') || cat.toLowerCase().includes('ethics')) {
        return 'philosophy-of-ethics';
      }
    }

    // Second pass: look for Iran
    for (const cat of frontmatter.categories) {
      if (cat.includes('ایران') || cat.toLowerCase().includes('iran')) {
        return 'iran';
      }
    }

    // Third pass: general mapping
    for (const cat of frontmatter.categories) {
      const mapped = mapCategory(cat);
      if (VALID_CATEGORIES.includes(mapped)) {
        return mapped;
      }
    }
  }

  // Check single category field
  if (frontmatter.category) {
    const mapped = mapCategory(frontmatter.category);
    if (VALID_CATEGORIES.includes(mapped)) {
      return mapped;
    }
  }

  // Check title and description for keywords
  const text = `${frontmatter.title || ''} ${frontmatter.description || ''}`.toLowerCase();

  // Ethics - check first as it's very specific
  if (text.match(/اخلاق|ethics|moral/)) return 'philosophy-of-ethics';

  // Iran - check second as it's also specific
  if (text.match(/ایران|iran/)) return 'iran';

  // Politics
  if (text.match(/انقلاب|revolution|گذار|transition/)) return 'descriptive-politics';
  if (text.match(/فلسفه سیاسی|political philosophy|نظریه سیاسی/)) return 'foundational-politics';

  // Science
  if (text.match(/علم|science|فیزیک|physics|کوانتوم|quantum/)) return 'philosophy-of-science';

  // Logic
  if (text.match(/منطق|logic|ریاضیات|mathematics/)) return 'meta-logic';

  // Economics
  if (text.match(/اقتصاد|economics/)) return 'economics';

  // Life
  if (text.match(/زندگی|life/)) return 'life';

  // Default fallback
  return 'philosophy-other';
}

/**
 * Process a single content file - FORCE UPDATE
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);

    const oldInterface = parsed.data.interface;
    const newInterface = determineInterfaceCategory(parsed.data);

    // Always update to the newly determined category
    parsed.data.interface = newInterface;

    // Rebuild frontmatter
    const newContent = matter.stringify(parsed.content, parsed.data);
    fs.writeFileSync(filePath, newContent, 'utf8');

    if (oldInterface !== newInterface) {
      console.log(`✓ Updated: ${path.basename(filePath)}`);
      console.log(`  ${oldInterface || '(none)'} -> ${newInterface}`);
      return true;
    } else {
      console.log(`  Confirmed: ${path.basename(filePath)} -> ${newInterface}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Process all files in a directory
 */
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  let updated = 0;

  for (const file of files) {
    const fullPath = path.join(dirPath, file.name);

    if (file.isDirectory()) {
      updated += processDirectory(fullPath);
    } else if (file.name.endsWith('.md') || file.name.endsWith('.mdx')) {
      if (processFile(fullPath)) {
        updated++;
      }
    }
  }

  return updated;
}

// Main execution
console.log('Fixing interface categories in content files...\n');

let totalUpdated = 0;

// Process articles
const articlesDir = path.join(rootDir, 'src/content/articles');
if (fs.existsSync(articlesDir)) {
  console.log('📄 Processing articles...');
  totalUpdated += processDirectory(articlesDir);
  console.log('');
}

// Process books
const booksDir = path.join(rootDir, 'src/content/books');
if (fs.existsSync(booksDir)) {
  console.log('📚 Processing books...');
  totalUpdated += processDirectory(booksDir);
  console.log('');
}

// Process statements
const statementsDir = path.join(rootDir, 'src/content/statements');
if (fs.existsSync(statementsDir)) {
  console.log('📢 Processing statements...');
  totalUpdated += processDirectory(statementsDir);
  console.log('');
}

console.log(`\n✅ Complete! Updated ${totalUpdated} files with corrected interface categories.`);
