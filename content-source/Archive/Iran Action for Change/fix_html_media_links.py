#!/usr/bin/env python3
"""
debug_html_media_links.py

DIAGNOSTIC TOOL - Shows exactly why matches aren't found.
Run this first to identify the problem.
"""

import os
import re
import glob
from typing import List, Tuple

# Same regex as main script
RE_MD_IMAGE = re.compile(r'!$$([^$$]*)\]\(([^)\s]+)\)')
RE_PROTECTED = re.compile(r'<pre[^>]*>.*?</pre>', re.DOTALL | re.IGNORECASE)

def diagnose_file(html_path: str):
    print(f"\n{'═'*70}")
    print(f"DIAGNOSING: {os.path.basename(html_path)}")
    print(f"{'═'*70}\n")
    
    # Read file with explicit encoding detection
    raw_bytes = open(html_path, 'rb').read()
    
    # Detect BOM
    bom_info = ""
    if raw_bytes.startswith(b'\xef\xbb\xbf'):
        bom_info = " (UTF-8 BOM detected!)"
    elif raw_bytes.startswith(b'\xff\xfe'):
        bom_info = " (UTF-16 LE BOM detected!)"
    elif raw_bytes.startswith(b'\xfe\xff'):
        bom_info = " (UTF-16 BE BOM detected!)"
    
    # Decode content
    try:
        content = raw_bytes.decode('utf-8-sig')  # utf-8-sig handles BOM automatically
        print(f"✅ File decoded as UTF-8{bom_info}")
    except UnicodeDecodeError:
        content = raw_bytes.decode('latin-1')
        print(f"⚠️  File decoded as Latin-1 (possible encoding issues)")
    
    # Basic stats
    print(f"📊 File size: {len(content)} characters")
    print(f"📊 Lines: {content.count(chr(10)) + 1}")
    
    # Look for potential markdown patterns MANUALLY
    print(f"\n🔍 MANUAL SCAN for '![...](...)' patterns:\n")
    
    lines = content.split('\n')
    found_manual = 0
    
    for i, line in enumerate(lines, 1):
        # Find all occurrences of ![ on the line
        pos = 0
        while True:
            idx = line.find('![', pos)
            if idx == -1:
                break
            
            # Show context
            context_start = max(0, idx - 30)
            context_end = min(len(line), idx + 80)
            context = line[context_start:context_end]
            
            print(f"   Line {i}: ...{context}...")
            
            # Check if it's inside a <pre> tag
            before = content[:content.find(line)]
            pre_opens = before.count('<pre')
            pre_closes = before.count('</pre>')
            is_in_pre = (pre_opens > pre_closes)
            
            if is_in_pre:
                print(f"           🛡️  INSIDE <pre> block (will be protected)")
            else:
                print(f"           ✅ NOT in <pre> block")
                # Try regex on just this snippet
                snippet = line[idx:idx+200]
                match = RE_MD_IMAGE.search(snippet)
                if match:
                    print(f"           ✅ REGEX MATCHES: {match.group(0)[:60]}...")
                else:
                    print(f"           ❌ REGEX DOES NOT MATCH")
                    # Show why
                    if ']' not in snippet:
                        print(f"              → No closing bracket ']' found")
                    elif '(' not in snippet:
                        print(f"              → No opening parenthesis '(' found")
                    elif ')' not in snippet:
                        print(f"              → No closing parenthesis ')' found")
                    elif '\n' in snippet:
                        print(f"              → Contains newline (broken syntax)")
            
            found_manual += 1
            pos = idx + 1
        
        # Also check for URL-encoded characters that look like markdown
        if '%21%5B' in line:  # URL-encoded ![
            print(f"\n🚨 URL-ENCODED MARKDOWN FOUND on line {i}!")
            print(f"   This might be the issue: {line.strip()[:100]}...")
    
    if found_manual == 0:
        print(f"\n❌ No manual '![...](...)' patterns found in entire file!")
        print(f"\n🤔 Possibilities:")
        print(f"   1. Already converted to <img> tags?")
        print(f"   2. Using different syntax like <img src='...'>?")
        print(f"   3. Using wiki-style [[File:...]] syntax?")
        print(f"   4. File is minified/concatenated differently?")
        
        # Show first non-empty lines
        print(f"\n📄 First 10 non-empty lines:")
        shown = 0
        for i, line in enumerate(lines, 1):
            if line.strip():
                print(f"   {i:3d}: {line.strip()[:80]}")
                shown += 1
                if shown >= 10:
                    break
    else:
        print(f"\n✅ Found {found_manual} potential markdown patterns")
    
    return found_manual

def main():
    folder = "."
    html_files = []
    for ext in ("*.html", "*.htm"):
        html_files.extend(glob.glob(os.path.join(folder, "**", ext), recursive=True))
    
    if not html_files:
        print("❌ No HTML files found!")
        return
    
    print(f"Found {len(html_files)} HTML file(s)")
    diagnose_file(html_files[0])

if __name__ == "__main__":
    main()