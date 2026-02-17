# Interface Categories Update

## Overview
Added `interface` field to all content items (articles, books, statements) to properly categorize them according to the taxonomy defined in `src/data/categories.ts`.

## Scripts Created

### 1. `scripts/add-interface-categories.mjs`
- Initial script to add `interface` field to content without one
- Maps old category names to new category slugs
- Skips files that already have valid interface values

### 2. `scripts/fix-interface-categories.mjs`
- Enhanced script that forces re-evaluation of all interface categories
- Improved prioritization logic:
  1. Ethics topics get highest priority
  2. Iran-specific content is second priority
  3. Then other categories based on keywords
- Always updates to ensure consistency

## Category Mapping

### Old Categories → New Interface Slugs

**Politics:**
- انقلاب‌شناسی → `descriptive-politics`
- گذار دموکراتیک → `descriptive-politics`
- نظریه سیاسی → `foundational-politics`
- فلسفه سیاسی → `foundational-politics`
- ایران → `iran`

**Ethics:**
- اخلاق → `philosophy-of-ethics`
- فلسفه اخلاق → `philosophy-of-ethics`
- اخلاق توصیفی → `descriptive-ethics`
- اخلاق تجویزی → `prescriptive-ethics`
- اخلاق کاربردی → `applied-ethics`

**Philosophy:**
- فلسفه → `philosophy-other`
- هستی‌شناسی → `ontology`
- معرفت‌شناسی → `epistemology`

**Science:**
- علم → `philosophy-of-science`
- فیزیک → `physics`
- کوانتوم → `quantum`

**Other:**
- اقتصاد → `economics`
- زندگی → `life`
- متفرقه → `philosophy-other`

## Distribution of Interface Categories

Current distribution across all content:
```
14 × philosophy-other       (general philosophy topics)
11 × descriptive-politics   (revolution studies, transitions, political analysis)
 3 × philosophy-of-ethics   (ethics and moral philosophy)
 3 × iran                   (Iran-specific political content)
 2 × foundational-politics  (political philosophy and theory)
```

## Files Updated

### Articles (10 files)
- ✓ All articles now have proper `interface` field
- ✓ Ethics articles correctly categorized as `philosophy-of-ethics`
- ✓ Revolution/politics articles as `descriptive-politics` or `foundational-politics`

### Books (21 files)
- ✓ iran-action book and chapters properly categorized
- ✓ All book chapters have appropriate interface categories

### Statements (2 files)
- ✓ Statements about Iran correctly categorized as `iran`

## Key Changes in Final Run

1. **democracy-and-ethics.md**: `philosophy-other` → `philosophy-of-ethics`
2. **Ethics-and-Conflicts.md**: `foundational-politics` → `philosophy-of-ethics`
3. **democratic-transition.md** (×2): `descriptive-politics` → `iran`

## Usage

To add interface categories to new content:
```bash
node scripts/add-interface-categories.mjs
```

To fix/update existing interface categories:
```bash
node scripts/fix-interface-categories.mjs
```

## Next Steps

The category view should now properly display content grouped by their interface categories. All content items are now compatible with the category taxonomy defined in `categories.ts`.
