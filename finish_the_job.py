import os

filepath = 'keystatic.config.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    orig_content = f.read()

# 1. PREPARE THE NEW GROUPS (removed duplicated lang)
identity_fields = """const identityFields = {
  author:      fields.text({ label: 'Author', defaultValue: 'مهدی سالم' }),
  authorTitle: fields.text({ label: 'Author Title' }),
  email:       fields.text({ label: 'Email' }),
  website:     fields.text({ label: 'Website' }),
  location:    fields.text({ label: 'Location' }),
};"""

classification_fields = """const classificationFields = {
  sourceType: fields.text({ label: 'Source Type' }),
  interface:  fields.text({ label: 'Interface Taxonomy' }),
  category:   fields.text({ label: 'Category' }),
  book:       fields.text({ label: 'Related Book Slug' }),
  difficulty: fields.select({
    label: 'Difficulty',
    options: [
      { label: 'Beginner / مبتدی',        value: 'مبتدی' },
      { label: 'Intermediate / متوسط',    value: 'متوسط' },
      { label: 'Advanced / پیشرفته',      value: 'پیشرفته' },
    ],
    defaultValue: 'متوسط',
  }),
  readingTime: fields.number({ label: 'Reading Time (min)' }),
};"""

# 2. FIX navigation labels (ensure they are clean)
# 3. FIX slugField usage (ensure it is consistent)

# Global replacements
content = orig_content
# Ensure lang is not duplicated
content = re.sub(r'const classificationFields = \{.*?\};', classification_fields, content, flags=re.DOTALL)

# Ensure slug field is required and has valid description
content = content.replace("slug:        fields.text({ label: 'Identifier (English/Slug)', description: 'MUST match the English filename for the URL to work.', validation: { isRequired: true } }),",
                         "slug:        fields.text({ label: 'Slug / Identifier', description: 'URL-friendly ID (e.g. "my-article-title"). Must match filename.', validation: { isRequired: true } }),")

# Fix navigation labels (Persian flag, English flag)
content = content.replace("'PERSIAN (FA)'", "'������ Persian (fa)'")
content = content.replace("'ENGLISH (EN)'", "'������ English (en)'")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
