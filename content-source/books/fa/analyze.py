import re
import sys

file_path = r'c:\Users\b0583931\GitHub\MahdiSalem.com\content-source\books\fa\khomeini.tex'
out_path = r'c:\Users\b0583931\GitHub\MahdiSalem.com\content-source\books\fa\analyze_out.txt'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

with open(out_path, 'w', encoding='utf-8') as out:
    # 1. Check Chapters
    out.write("--- Chapters ---\n")
    chapter_pattern = re.compile(r'\\chapter\*{0,1}\s*\{([^}]+)\}')
    chapters = chapter_pattern.finditer(content)
    chapter_list = []
    for m in chapters:
        title = m.group(1).replace('\n', ' ')
        pos = m.end()
        # check if label exists right after
        after_text = content[pos:pos+50]
        has_label = '\\label' in after_text
        out.write(f"Chapter: {title} | Has label: {has_label}\n")
        chapter_list.append((title, has_label))

    out.write("\n--- English Footnotes ---\n")
    # find footnotes that might be english
    fn_pattern = re.compile(r'\\footnote\s*\{([^}]+)\}')
    for m in fn_pattern.finditer(content):
        fn_text = m.group(1).replace('\n', ' ')
        if 'en{' in fn_text or re.search(r'[a-zA-Z]{4,}', fn_text):
            out.write(f"Footnote text: {fn_text}\n")

    out.write("\n--- TikZ nodes ---\n")
    tikz_pattern = re.compile(r'\\begin\{tikzpicture\}(.*?)\\end\{tikzpicture\}', re.DOTALL)
    for tikz in tikz_pattern.finditer(content):
        nodes = re.findall(r'\{([^}]+)\}', tikz.group(1))
        for n in nodes:
            if re.search(r'[\u0600-\u06FF]', n): # contains persian
                out.write(f"Tikz text: {n}\n")

    out.write("\n--- Digits ---\n")
    digits_pattern = re.compile(r'\d{1,3}(?:,\d{3})+')
    for m in digits_pattern.finditer(content):
        out.write(f"Number with comma: {m.group(0)}\n")


