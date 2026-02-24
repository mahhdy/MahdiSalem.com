#!/usr/bin/env python3
"""
MDX Frontmatter Extractor & Cover Prompt Generator
استخراج فرانت‌متر از فایل‌های MDX و تولید پرامپت برای ساخت کاور
"""

import os
import re
import yaml
import json
import argparse
from pathlib import Path
from datetime import datetime


# ─────────────────────────────────────────────
# 1. استخراج فرانت‌متر از فایل MDX
# ─────────────────────────────────────────────
FRONTMATTER_PATTERN = re.compile(
    r"^---\s*\n(.*?)\n---", re.DOTALL
)

FIELDS = ["title", "description", "lang", "tags", "categories", "slug"]


def extract_frontmatter(filepath: Path) -> dict | None:
    """فرانت‌متر YAML را از فایل MDX استخراج می‌کند."""
    try:
        text = filepath.read_text(encoding="utf-8")
    except Exception as e:
        print(f"⚠️  خطا در خواندن {filepath}: {e}")
        return None

    match = FRONTMATTER_PATTERN.match(text)
    if not match:
        print(f"⚠️  فرانت‌متر پیدا نشد: {filepath}")
        return None

    try:
        data = yaml.safe_load(match.group(1))
    except yaml.YAMLError as e:
        print(f"⚠️  خطای YAML در {filepath}: {e}")
        return None

    if not isinstance(data, dict):
        return None

    # فقط فیلدهای موردنظر
    extracted = {}
    for field in FIELDS:
        value = data.get(field)
        if value is not None:
            extracted[field] = value

    # اگه slug نداشت، از نام فایل بسازیم
    if "slug" not in extracted:
        extracted["slug"] = filepath.stem

    extracted["_source_file"] = str(filepath)

    return extracted


# ─────────────────────────────────────────────
# 2. اسکن پوشه و زیرپوشه‌ها
# ─────────────────────────────────────────────
def scan_mdx_files(root_dir: str) -> list[dict]:
    """تمام فایل‌های MDX را پیدا و فرانت‌مترشان را استخراج می‌کند."""
    root = Path(root_dir)
    if not root.exists():
        raise FileNotFoundError(f"پوشه پیدا نشد: {root_dir}")

    results = []
    mdx_files = sorted(root.rglob("*.mdx"))

    print(f"🔍 پیدا شد: {len(mdx_files)} فایل MDX در {root_dir}\n")

    for filepath in mdx_files:
        data = extract_frontmatter(filepath)
        if data:
            results.append(data)
            print(f"  ✅ {filepath.relative_to(root)}")
        else:
            print(f"  ❌ {filepath.relative_to(root)}")

    return results


# ─────────────────────────────────────────────
# 3. ساخت پرامپت برای هر مقاله
# ─────────────────────────────────────────────
def build_cover_prompt(entry: dict) -> dict:
    """برای هر مقاله یک پرامپت تولید تصویر کاور می‌سازد."""

    title = entry.get("title", "Untitled")
    description = entry.get("description", "")
    lang = entry.get("lang", "en")
    tags = entry.get("tags", [])
    categories = entry.get("categories", [])
    slug = entry.get("slug", "untitled")

    if isinstance(tags, list):
        tags_str = ", ".join(tags)
    else:
        tags_str = str(tags)

    if isinstance(categories, list):
        cats_str = ", ".join(categories)
    else:
        cats_str = str(categories)

    # پرامپت انگلیسی برای تولید تصویر
    image_prompt = (
        f"Create a professional, modern book/article cover image. "
        f"Title: \"{title}\". "
        f"Description: \"{description}\". "
        f"Theme keywords: {tags_str}. "
        f"Category: {cats_str}. "
        f"Style: Clean, elegant, minimalist with subtle gradients. "
        f"Use symbolic imagery related to the topic. "
        f"Do NOT include any text or letters in the image. "
        f"Aspect ratio: 16:9, high quality, editorial style."
    )

    # پرامپت فارسی برای ایجنت
    agent_instruction = (
        f"🎨 ساخت کاور برای مقاله‌ی «{title}»\n"
        f"📄 توضیح: {description}\n"
        f"🏷️  تگ‌ها: {tags_str}\n"
        f"📂 دسته‌بندی: {cats_str}\n"
        f"🌐 زبان: {lang}\n"
        f"💾 نام فایل خروجی: {slug}-cover.png\n"
        f"🖼️  ابعاد: 1920×1080 (16:9)\n"
    )

    return {
        "slug": slug,
        "output_filename": f"{slug}-cover.png",
        "title": title,
        "description": description,
        "lang": lang,
        "tags": tags,
        "categories": categories,
        "image_prompt": image_prompt,
        "agent_instruction_fa": agent_instruction,
        "source_file": entry.get("_source_file", ""),
    }


# ─────────────────────────────────────────────
# 4. خروجی‌ها: JSON + Markdown + Agent Batch
# ─────────────────────────────────────────────
def save_json(tasks: list[dict], output_path: str):
    """ذخیره به‌صورت JSON."""
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(tasks, f, ensure_ascii=False, indent=2)
    print(f"\n💾 JSON ذخیره شد: {output_path}")


def save_markdown_report(tasks: list[dict], output_path: str):
    """ذخیره گزارش Markdown."""
    lines = [
        "# 🎨 لیست کاورهای موردنیاز\n",
        f"> تاریخ تولید: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n",
        f"> تعداد کل: {len(tasks)} کاور\n\n",
        "---\n\n",
    ]

    for i, task in enumerate(tasks, 1):
        lines.append(f"## {i}. {task['title']}\n\n")
        lines.append(f"| فیلد | مقدار |\n")
        lines.append(f"|---|---|\n")
        lines.append(f"| **Slug** | `{task['slug']}` |\n")
        lines.append(f"| **زبان** | {task['lang']} |\n")
        lines.append(f"| **توضیح** | {task['description']} |\n")
        lines.append(f"| **تگ‌ها** | {', '.join(task['tags']) if isinstance(task['tags'], list) else task['tags']} |\n")
        lines.append(f"| **دسته‌بندی** | {', '.join(task['categories']) if isinstance(task['categories'], list) else task['categories']} |\n")
        lines.append(f"| **فایل خروجی** | `{task['output_filename']}` |\n")
        lines.append(f"| **فایل مبدا** | `{task['source_file']}` |\n\n")
        lines.append(f"### پرامپت تولید تصویر:\n\n")
        lines.append(f"```\n{task['image_prompt']}\n```\n\n")
        lines.append(f"---\n\n")

    with open(output_path, "w", encoding="utf-8") as f:
        f.writelines(lines)
    print(f"📝 گزارش Markdown ذخیره شد: {output_path}")


def save_agent_batch(tasks: list[dict], output_path: str):
    """
    خروجی مخصوص ایجنت — هر تسک جداگانه با جداکننده
    این فایل رو مستقیم به ایجنت بده
    """
    lines = [
        "# BATCH COVER GENERATION TASKS\n",
        "# هر بخش یک تسک جداگانه است — برای هرکدام یک تصویر کاور بساز\n",
        f"# تعداد کل تسک‌ها: {len(tasks)}\n",
        "# ابزار تولید تصویر: NanoBanana\n",
        "# ─────────────────────────────────────────\n\n",
    ]

    for i, task in enumerate(tasks, 1):
        lines.append(f"{'='*60}\n")
        lines.append(f"TASK {i}/{len(tasks)}\n")
        lines.append(f"{'='*60}\n\n")
        lines.append(task["agent_instruction_fa"])
        lines.append(f"\n🤖 Image Generation Prompt (English):\n")
        lines.append(f"{task['image_prompt']}\n\n")
        lines.append(f"⚙️  Action:\n")
        lines.append(f"  1. Use NanoBanana to generate image with the above prompt\n")
        lines.append(f"  2. Save as: {task['output_filename']}\n")
        lines.append(f"  3. Resolution: 1920x1080\n\n")

    with open(output_path, "w", encoding="utf-8") as f:
        f.writelines(lines)
    print(f"🤖 فایل دستور ایجنت ذخیره شد: {output_path}")


# ─────────────────────────────────────────────
# 5. اجرا
# ─────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="استخراج فرانت‌متر MDX و تولید پرامپت کاور"
    )
    parser.add_argument(
        "directory",
        help="مسیر پوشه حاوی فایل‌های MDX",
    )
    parser.add_argument(
        "-o", "--output-dir",
        default="./cover-tasks",
        help="پوشه خروجی (پیش‌فرض: ./cover-tasks)",
    )
    args = parser.parse_args()

    # اسکن و استخراج
    entries = scan_mdx_files(args.directory)
    if not entries:
        print("\n❌ هیچ فایل MDX معتبری پیدا نشد!")
        return

    # ساخت تسک‌ها
    tasks = [build_cover_prompt(entry) for entry in entries]
    print(f"\n✅ {len(tasks)} تسک کاور ساخته شد\n")

    # ذخیره خروجی‌ها
    out_dir = Path(args.output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    save_json(tasks, str(out_dir / "cover-tasks.json"))
    save_markdown_report(tasks, str(out_dir / "cover-tasks.md"))
    save_agent_batch(tasks, str(out_dir / "agent-batch.txt"))

    # نمایش خلاصه
    print(f"\n{'─'*50}")
    print(f"📊 خلاصه:")
    print(f"   فایل‌های MDX پردازش‌شده: {len(tasks)}")
    print(f"   خروجی‌ها در: {out_dir.resolve()}")
    print(f"   • cover-tasks.json  → برای استفاده برنامه‌نویسی")
    print(f"   • cover-tasks.md    → گزارش خوانا")
    print(f"   • agent-batch.txt   → مستقیم بده به ایجنت")
    print(f"{'─'*50}\n")


if __name__ == "__main__":
    main()
    
    # 