#!/usr/bin/env python3
"""
SVG Cover Generator — تولید خودکار کاور SVG برای مقالات MDX
بدون نیاز به API خارجی — خروجی SVG سه‌بعدی با عمق و سایه
"""

import json
import math
import random
import hashlib
from pathlib import Path
from dataclasses import dataclass


# ─────────────────────────────────────────────────────
# تنظیمات
# ─────────────────────────────────────────────────────
WIDTH = 1920
HEIGHT = 1080
OUTPUT_DIR = Path("./generated-covers")


# ─────────────────────────────────────────────────────
# تم‌های رنگی بر اساس موضوع
# ─────────────────────────────────────────────────────
@dataclass
class Theme:
    name: str
    bg_start: str
    bg_mid: str
    bg_end: str
    accent: str
    accent2: str
    glow: str
    particle: str


THEMES = {
    "democracy": Theme(
        "democracy", "#0f0c29", "#302b63", "#24243e",
        "#7c6dd8", "#c4b5fd", "#f7c948", "#e2d5ff"
    ),
    "revolution": Theme(
        "revolution", "#1a0a0a", "#2d1117", "#1a1a2e",
        "#dc2626", "#f59e0b", "#ef4444", "#fca5a5"
    ),
    "philosophy": Theme(
        "philosophy", "#0a192f", "#112240", "#1d3461",
        "#64ffda", "#8892b0", "#00d4aa", "#ccd6f6"
    ),
    "politics": Theme(
        "politics", "#0d1b2a", "#1b2838", "#2c3e50",
        "#3498db", "#e74c3c", "#f39c12", "#ecf0f1"
    ),
    "freedom": Theme(
        "freedom", "#0b0b1a", "#1a1a3e", "#2d1b69",
        "#a78bfa", "#f9a825", "#e879f9", "#ddd6fe"
    ),
    "military": Theme(
        "military", "#1a1a1a", "#2d2d2d", "#1a2332",
        "#6b7280", "#9ca3af", "#ef4444", "#d1d5db"
    ),
    "history": Theme(
        "history", "#1c1410", "#2d1f15", "#3d2b1f",
        "#d4a574", "#e8c9a0", "#c88b48", "#f5e6d3"
    ),
    "test": Theme(
        "test", "#0f172a", "#1e293b", "#334155",
        "#38bdf8", "#818cf8", "#22d3ee", "#e2e8f0"
    ),
}

# مپ کردن slug / کلمات کلیدی به تم
KEYWORD_THEME_MAP = {
    "transition": "democracy",
    "گذار": "democracy",
    "دموکرا": "democracy",
    "انقلاب": "revolution",
    "revolution": "revolution",
    "ارتش": "military",
    "نظامی": "military",
    "army": "military",
    "فرانسه": "revolution",
    "روسیه": "revolution",
    "آزادی": "freedom",
    "freedom": "freedom",
    "فلسف": "philosophy",
    "تغییر سیاسی": "politics",
    "رژیم": "politics",
    "راست": "politics",
    "چپ": "politics",
    "test": "test",
    "chart": "test",
    "mermaid": "test",
    "تاریخ": "history",
}


def detect_theme(task: dict) -> Theme:
    """بر اساس عنوان، توضیح و تگ‌ها تم مناسب را تشخیص بده."""
    searchable = " ".join([
        task.get("title", ""),
        task.get("description", ""),
        " ".join(task.get("tags", [])),
        task.get("slug", ""),
    ]).lower()

    for keyword, theme_name in KEYWORD_THEME_MAP.items():
        if keyword in searchable:
            return THEMES[theme_name]

    return THEMES["philosophy"]  # پیش‌فرض


# ─────────────────────────────────────────────────────
# تولیدکننده‌های شکل — هر تابع یک لایه SVG برمی‌گرداند
# ─────────────────────────────────────────────────────
def seeded_random(slug: str, index: int = 0) -> random.Random:
    """Random با seed ثابت بر اساس slug — خروجی تکرارپذیر."""
    seed = int(hashlib.md5(f"{slug}-{index}".encode()).hexdigest()[:8], 16)
    return random.Random(seed)


def svg_defs(theme: Theme) -> str:
    return f"""  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{theme.bg_start}"/>
      <stop offset="50%" stop-color="{theme.bg_mid}"/>
      <stop offset="100%" stop-color="{theme.bg_end}"/>
    </linearGradient>
    <radialGradient id="glow" cx="70%" cy="35%" r="50%">
      <stop offset="0%" stop-color="{theme.glow}" stop-opacity="0.3"/>
      <stop offset="70%" stop-color="{theme.glow}" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <filter id="shadow3d">
      <feDropShadow dx="6" dy="8" stdDeviation="12"
                    flood-color="#000" flood-opacity="0.5"/>
    </filter>
    <filter id="shadowSoft">
      <feDropShadow dx="3" dy="4" stdDeviation="8"
                    flood-color="#000" flood-opacity="0.3"/>
    </filter>
    <filter id="glowFilter">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{theme.accent}"/>
      <stop offset="100%" stop-color="{theme.accent2}"/>
    </linearGradient>
  </defs>"""


def svg_background(theme: Theme) -> str:
    return f"""  <rect width="{WIDTH}" height="{HEIGHT}" fill="url(#bg)"/>
  <rect width="{WIDTH}" height="{HEIGHT}" fill="url(#glow)"/>"""


def svg_stars(slug: str, count: int = 25) -> str:
    """ستاره‌های ریز تصادفی."""
    rng = seeded_random(slug, 1)
    stars = []
    for _ in range(count):
        cx = rng.randint(50, WIDTH - 50)
        cy = rng.randint(30, HEIGHT // 3)
        r = rng.uniform(0.8, 2.5)
        op = rng.uniform(0.2, 0.6)
        stars.append(f'    <circle cx="{cx}" cy="{cy}" r="{r:.1f}" opacity="{op:.2f}"/>')
    return f'  <g fill="#fff">\n' + "\n".join(stars) + "\n  </g>"


def svg_mountains(theme: Theme, slug: str) -> str:
    """کوه‌های لایه‌ای — عمق سه‌بعدی."""
    rng = seeded_random(slug, 2)
    layers = []
    base_y = 650
    for layer in range(3):
        y_offset = base_y + layer * 80
        opacity = 0.4 + layer * 0.2
        color_shift = max(0, int(theme.bg_start.replace("#", ""), 16) + layer * 0x111111)
        color = f"#{min(color_shift, 0xFFFFFF):06x}"

        points = [f"0,{y_offset + rng.randint(50, 120)}"]
        x = 0
        while x < WIDTH:
            x += rng.randint(120, 300)
            y = y_offset - rng.randint(50, 200) + layer * 40
            points.append(f"{min(x, WIDTH)},{y}")
        points.append(f"{WIDTH},{y_offset + 100}")
        points.append(f"{WIDTH},{HEIGHT}")
        points.append(f"0,{HEIGHT}")

        layers.append(
            f'  <polygon points="{" ".join(points)}" '
            f'fill="{color}" opacity="{opacity:.1f}" filter="url(#shadowSoft)"/>'
        )
    return "\n".join(layers)


def svg_geometric_shapes(theme: Theme, slug: str) -> str:
    """اشکال هندسی سه‌بعدی — مکعب، دایره، مثلث."""
    rng = seeded_random(slug, 3)
    shapes = []
    num_shapes = rng.randint(4, 8)

    for i in range(num_shapes):
        cx = rng.randint(200, WIDTH - 200)
        cy = rng.randint(200, HEIGHT - 300)
        size = rng.randint(40, 120)
        op = rng.uniform(0.08, 0.25)
        shape_type = rng.choice(["circle", "rect", "polygon"])

        if shape_type == "circle":
            shapes.append(
                f'    <circle cx="{cx}" cy="{cy}" r="{size}" '
                f'fill="{theme.accent}" opacity="{op:.2f}" filter="url(#shadow3d)"/>'
            )
        elif shape_type == "rect":
            angle = rng.randint(-30, 30)
            shapes.append(
                f'    <rect x="{cx}" y="{cy}" width="{size}" height="{size}" rx="8" '
                f'fill="{theme.accent2}" opacity="{op:.2f}" '
                f'transform="rotate({angle} {cx + size // 2} {cy + size // 2})" '
                f'filter="url(#shadow3d)"/>'
            )
        else:
            s = size
            points = f"{cx},{cy - s} {cx - s},{cy + s} {cx + s},{cy + s}"
            shapes.append(
                f'    <polygon points="{points}" '
                f'fill="{theme.glow}" opacity="{op:.2f}" filter="url(#shadow3d)"/>'
            )

    return f'  <g>\n' + "\n".join(shapes) + "\n  </g>"


def svg_connecting_lines(theme: Theme, slug: str) -> str:
    """خطوط اتصال — نماد ارتباطات و نهادها."""
    rng = seeded_random(slug, 4)
    lines = []
    num = rng.randint(5, 12)

    for _ in range(num):
        x1 = rng.randint(100, WIDTH - 100)
        y1 = rng.randint(200, HEIGHT - 200)
        x2 = x1 + rng.randint(-300, 300)
        y2 = y1 + rng.randint(-200, 200)
        op = rng.uniform(0.05, 0.15)
        sw = rng.uniform(1, 3)
        lines.append(
            f'    <line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
            f'stroke="{theme.accent2}" stroke-width="{sw:.1f}" opacity="{op:.2f}"/>'
        )

    return f'  <g>\n' + "\n".join(lines) + "\n  </g>"


def svg_central_symbol(theme: Theme, slug: str) -> str:
    """نماد مرکزی بزرگ — بر اساس seed هر مقاله متفاوت."""
    rng = seeded_random(slug, 5)
    cx, cy = WIDTH // 2, HEIGHT // 2 - 50
    symbol_type = rng.choice(["rings", "diamond", "burst", "arch"])

    if symbol_type == "rings":
        rings = []
        for i in range(4):
            r = 80 + i * 55
            op = 0.3 - i * 0.06
            rings.append(
                f'    <circle cx="{cx}" cy="{cy}" r="{r}" '
                f'fill="none" stroke="url(#accentGrad)" '
                f'stroke-width="2.5" opacity="{op:.2f}"/>'
            )
        return f'  <g filter="url(#shadow3d)">\n' + "\n".join(rings) + "\n  </g>"

    elif symbol_type == "diamond":
        s = 160
        return f"""  <g filter="url(#shadow3d)" transform="rotate(45 {cx} {cy})">
    <rect x="{cx - s // 2}" y="{cy - s // 2}" width="{s}" height="{s}" rx="12"
          fill="none" stroke="url(#accentGrad)" stroke-width="4" opacity="0.35"/>
    <rect x="{cx - s // 3}" y="{cy - s // 3}" width="{s * 2 // 3}" height="{s * 2 // 3}" rx="8"
          fill="url(#accentGrad)" opacity="0.1"/>
  </g>"""

    elif symbol_type == "burst":
        rays = []
        num_rays = 12
        for i in range(num_rays):
            angle = (360 / num_rays) * i
            rad = math.radians(angle)
            x2 = cx + math.cos(rad) * 220
            y2 = cy + math.sin(rad) * 220
            op = 0.15 + (i % 3) * 0.05
            rays.append(
                f'    <line x1="{cx}" y1="{cy}" '
                f'x2="{x2:.0f}" y2="{y2:.0f}" '
                f'stroke="{theme.glow}" stroke-width="2" opacity="{op:.2f}"/>'
            )
        rays.append(
            f'    <circle cx="{cx}" cy="{cy}" r="30" '
            f'fill="{theme.glow}" opacity="0.15"/>'
        )
        return f'  <g filter="url(#glowFilter)">\n' + "\n".join(rays) + "\n  </g>"

    else:  # arch
        return f"""  <g filter="url(#shadow3d)">
    <path d="M {cx - 200},{cy + 120} Q {cx - 200},{cy - 150} {cx},{cy - 180}
             Q {cx + 200},{cy - 150} {cx + 200},{cy + 120}"
          fill="none" stroke="url(#accentGrad)" stroke-width="5" opacity="0.3"/>
    <path d="M {cx - 140},{cy + 120} Q {cx - 140},{cy - 100} {cx},{cy - 120}
             Q {cx + 140},{cy - 100} {cx + 140},{cy + 120}"
          fill="url(#accentGrad)" opacity="0.06"/>
  </g>"""


def svg_particles(theme: Theme, slug: str, count: int = 20) -> str:
    """ذرات معلق — جان‌بخشی به تصویر."""
    rng = seeded_random(slug, 6)
    parts = []
    for _ in range(count):
        cx = rng.randint(50, WIDTH - 50)
        cy = rng.randint(100, HEIGHT - 100)
        r = rng.uniform(1, 3.5)
        op = rng.uniform(0.05, 0.2)
        parts.append(f'    <circle cx="{cx}" cy="{cy}" r="{r:.1f}" opacity="{op:.2f}"/>')

    return f'  <g fill="{theme.particle}">\n' + "\n".join(parts) + "\n  </g>"


def svg_bottom_fog(theme: Theme) -> str:
    """مه پایین — عمق بیشتر."""
    return f"""  <rect x="0" y="{HEIGHT - 250}" width="{WIDTH}" height="250"
        fill="{theme.bg_start}" opacity="0.4"/>
  <ellipse cx="{WIDTH // 2}" cy="{HEIGHT}" rx="{WIDTH}" ry="200"
           fill="{theme.bg_mid}" opacity="0.3"/>"""


# ─────────────────────────────────────────────────────
# تولید SVG نهایی
# ─────────────────────────────────────────────────────
def generate_cover_svg(task: dict) -> str:
    """یک SVG کامل برای یک تسک تولید کن."""
    theme = detect_theme(task)
    slug = task.get("slug", "untitled")

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {HEIGHT}">',
        f"  <!-- Cover: {task.get('title', '')} -->",
        svg_defs(theme),
        svg_background(theme),
        svg_stars(slug),
        svg_mountains(theme, slug),
        svg_connecting_lines(theme, slug),
        svg_geometric_shapes(theme, slug),
        svg_central_symbol(theme, slug),
        svg_particles(theme, slug),
        svg_bottom_fog(theme),
        "</svg>",
    ]

    return "\n\n".join(parts)


# ─────────────────────────────────────────────────────
# خواندن تسک‌ها و تولید دسته‌جمعی
# ─────────────────────────────────────────────────────
def main():
    import argparse

    parser = argparse.ArgumentParser(description="تولید کاور SVG از فایل JSON تسک‌ها")
    parser.add_argument(
        "input_json",
        help="مسیر فایل cover-tasks.json"
    )
    parser.add_argument(
        "-o", "--output-dir",
        default="./generated-covers",
        help="پوشه خروجی SVG ها"
    )
    parser.add_argument(
        "--png",
        action="store_true",
        help="تبدیل به PNG هم انجام بشه (نیاز به cairosvg)"
    )
    args = parser.parse_args()

    # خواندن تسک‌ها
    with open(args.input_json, "r", encoding="utf-8") as f:
        tasks = json.load(f)

    out = Path(args.output_dir)
    out.mkdir(parents=True, exist_ok=True)

    print(f"🎨 تولید {len(tasks)} کاور SVG ...\n")

    for i, task in enumerate(tasks, 1):
        slug = task.get("slug", f"cover-{i}")
        svg_content = generate_cover_svg(task)

        # ذخیره SVG
        svg_path = out / f"{slug}-cover.svg"
        svg_path.write_text(svg_content, encoding="utf-8")
        print(f"  ✅ [{i:02d}/{len(tasks)}] {svg_path.name}")

        # تبدیل به PNG (اختیاری)
        if args.png:
            try:
                import cairosvg
                png_path = out / f"{slug}-cover.png"
                cairosvg.svg2png(
                    bytestring=svg_content.encode(),
                    write_to=str(png_path),
                    output_width=WIDTH,
                    output_height=HEIGHT,
                )
                print(f"       → PNG: {png_path.name}")
            except ImportError:
                print("  ⚠️  cairosvg نصب نیست: pip install cairosvg")
                break

    print(f"\n{'─' * 50}")
    print(f"📊 خلاصه: {len(tasks)} کاور در {out.resolve()}")
    if args.png:
        print(f"   فرمت: SVG + PNG")
    else:
        print(f"   فرمت: SVG")
        print(f"   💡 برای PNG: python cover_svg.py tasks.json --png")
        print(f"   💡 نیاز به: pip install cairosvg")
    print(f"{'─' * 50}\n")


if __name__ == "__main__":
    main()