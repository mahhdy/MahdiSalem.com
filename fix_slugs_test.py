import os
import re

def fix_frontmatter(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if file has frontmatter
    if not content.startswith('---'):
        return

    # Extract frontmatter
    match = re.match(r'^---(.*?)^---', content, re.MULTILINE | re.DOTALL)
    if not match:
        return

    frontmatter = match.group(1)
    body = content[match.end():]

    # Check if slug already exists
    if re.search(r'^slug:', frontmatter, re.MULTILINE):
        return

    # Determine slug from filename
    filename = os.path.basename(filepath)
    slug = os.path.splitext(filename)[0]
    # Remove .mdx if it was part of the name (double extension case)
    if slug.endswith('.md'):
        slug = slug[:-3]

    # Add slug field
    new_frontmatter = frontmatter.rstrip() + f'\nslug: "{slug}"\n'
    new_content = '---' + new_frontmatter + '---' + body

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Fixed {filepath} with slug: {slug}")

# Fix specific files for testing
test_files = [
    r'c:\Users\b0583931\GitHub\MahdiSalem.com\src\content\articles\fa\being-becoming.mdx',
    r'c:\Users\b0583931\GitHub\MahdiSalem.com\src\content\multimedia\videos\fa\example-video.mdx',
    r'c:\Users\b0583931\GitHub\MahdiSalem.com\src\content\multimedia\podcasts\fa\podcast-ethics-and-law.mdx'
]

for f in test_files:
    if os.path.exists(f):
        fix_frontmatter(f)
