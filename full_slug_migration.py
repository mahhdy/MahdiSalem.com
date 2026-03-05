import os
import re

# Paths to all content folders
CONTENT_DIRS = [
    r'c:\Users\b0583931\GitHub\MahdiSalem.com\src\content\articles\fa',
    r'c:\Users\b0583931\GitHub\MahdiSalem.com\src\content\books\fa',
    r'c:\Users\b0583931\GitHub\MahdiSalem.com\src\content\proposals\fa',
    r'c:\Users\b0583931\GitHub\MahdiSalem.com\src\content\statements\fa',
    r'c:\Users\b0583931\GitHub\MahdiSalem.com\src\content\multimedia\videos\fa',
    r'c:\Users\b0583931\GitHub\MahdiSalem.com\src\content\multimedia\audio\fa',
    r'c:\Users\b0583931\GitHub\MahdiSalem.com\src\content\multimedia\podcasts\fa',
    r'c:\Users\b0583931\GitHub\MahdiSalem.com\src\content\dialogues\fa',
    r'c:\Users\b0583931\GitHub\MahdiSalem.com\src\content\wiki\fa'
]

def migrate_file(filepath):
    if not os.path.isfile(filepath) or not (filepath.endswith('.mdx') or filepath.endswith('.md')):
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if file has frontmatter
    if not content.startswith('---'):
        return

    # Extract frontmatter
    # Using a non-greedy dotsall match for frontmatter
    match = re.match(r'^---(.*?)---', content, re.MULTILINE | re.DOTALL)
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
    # Handle possible double extensions like .md.bak if they slipped in
    if slug.endswith('.md'):
        slug = slug[:-3]

    # Clean slug from any quotes if they were in the filename
    slug = slug.strip('"\'')

    # Add slug field at the end of frontmatter
    new_frontmatter = frontmatter.rstrip() + f'\nslug: "{slug}"\n'
    new_content = '---' + new_frontmatter + '---' + body

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Migrated {filepath}")

for d in CONTENT_DIRS:
    if os.path.exists(d):
        print(f"Processing directory: {d}")
        for filename in os.listdir(d):
            migrate_file(os.path.join(d, filename))
    else:
        print(f"Skipping non-existent directory: {d}")
