#!/usr/bin/env python3
"""One-time re-migration for forum-ideas-migration.csv.

The original backfill flattened every forum post to a single plain-text
paragraph, losing all structure (headings, lists, bold, links). This script
re-fetches each post's cooked HTML from the forum and converts it to real
Markdown instead, which the "Ndaj Ide" page now renders (see ide.astro).

Topics are matched to CSV rows by exact title (TOPIC_IDS below, built from
forum.illyrianbrains.org/c/diskutime/202.json). Images are dropped (the
compact ideas list doesn't render them), decorative heading-anchor links are
removed, onebox link-preview cards are collapsed to a plain Markdown link,
and relative /u/ profile links are resolved to absolute forum URLs.

Also fills in the real author per post (their forum display name, falling
back to their @username if they never set one) into the "Emri" column, and
sets "Dëshiron të shfaqet emri yt publikisht?" to "Po" — the backfill had
been defaulting both to a placeholder, since the one-time export that
produced forum-ideas-migration.csv never captured the actual per-post author.
These are already public forum posts with visible attribution, so this just
carries that same attribution onto the "Ndaj Ide" page.

Re-run only if a migrated idea's forum post is edited and needs to resync:
    python3 scripts/migrate-ideas-forum.py

Requires: pip install beautifulsoup4 markdownify
"""

import csv
import json
import os
import re
import sys
import time
from urllib.request import Request, urlopen

from bs4 import BeautifulSoup
from markdownify import markdownify as html_to_md

FORUM_ORIGIN = "https://forum.illyrianbrains.org"
UA = "Mozilla/5.0 (illyrianbrains.org content sync)"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(ROOT, "scripts", "forum-ideas-migration.csv")

# Forum topic id -> exact "Titulli i idesë" text in forum-ideas-migration.csv.
TOPIC_IDS = {
    932: "Info rreth publikimeve",
    929: "Rregullat e pashkruara të politikës dhe pushtetit në punë",
    926: "Bursë studimi ne UK",
    925: "Sugjerime për fjalorin e madh të gjuhës shqipe",
    923: "Real examples of LLM-built marketing tools",
    904: "ALIA Conference 2026: për të apasionuarit pas gjuhës shqipe",
    879: "Sugjerime për fjalorin e ri të gjuhës shqipe",
    867: "Materiale për Komunikim Alternativ",
    860: "Si i ndërtova dhe publikova 3 produkte me AI!",
    777: "PhDonts - çfarë mos të bëjmë në doktoraturë?",
    763: "Lajme të mira dhe arritje - zbulim në Shqipëri",
    754: "Propozime dhe ide per te gjalleruar grupin",
    752: "Bëhu pjesë e IB-Akademix",
    723: "AI, anshmëria e modeleve",
    721: "Business Analyst - Fashion & Luxury RFID Solutions - Italy, Firenze",
    693: "Avokati Im - Keshilla ligjore nga AI",
    687: "HappyHours për Shtatorin!",
    682: "Cloud Database Administrator - Italy",
    646: "Roli i hackerspaces në tech",
    624: "Cyber StartUp & Hackerspaces",
    609: "Ftesë për komunitetin IB Milano x IB Atlas",
    574: "Rrugët e suksesit: Mjekët shqiptarë në shëndetësinë italiane",
    559: "The power of You, me Tomorr Kokona",
    547: "🚀 Let's collaborate on AI – Call for contributors🤖",
    464: "Personal Finance in Germany",
    430: "02/05/25 Vienna Evening Organisation",
    420: "Building an OSS Phishing Simulator",
    398: "Komunitete dhe hapësira shqipfolëse mbi teknologjinë",
    397: "Panel Discussion: Work-Life Balance!",
    391: "#HackingFatherhood takim online! 👶",
    367: "1-vjetori i IB-Tech",
    366: "Shëndeti mendor dhe burnout",
    365: "Siguria dhe privatësia online për individë",
    362: "Pyetësor socio-linguistik për gjuhën shqiptare në Itali",
    361: "1 vjetori i IB-Berlin BookClub!",
    356: "Ajo GUXON! Bëhu mentore nga diaspora!",
    305: "Shoqata shqiptare",
    90: "Perkthimi i forumit ne shqip",
    27: "[2024] Takimet e IB-Tech - lista",
}


def fetch_json(url):
    req = Request(url, headers={"User-Agent": UA})
    with urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def clean_and_convert(cooked_html):
    soup = BeautifulSoup(cooked_html, "html.parser")

    for a in soup.find_all("a", class_="anchor"):
        a.decompose()

    for wrapper in soup.find_all("div", class_="lightbox-wrapper"):
        wrapper.decompose()

    for img in soup.find_all("img"):
        parent = img.parent
        img.decompose()
        if parent is not None and parent.name == "a" and not parent.get_text(strip=True):
            parent.decompose()

    for aside in soup.find_all("aside", class_="onebox"):
        link_tag = aside.find("a", href=True)
        href = aside.get("data-onebox-src") or (link_tag["href"] if link_tag else None)
        title_tag = aside.find(["h3", "h4"])
        text = title_tag.get_text(strip=True) if title_tag else (link_tag.get_text(strip=True) if link_tag else None)
        if href:
            new_a = soup.new_tag("a", href=href)
            new_a.string = text or href
            aside.replace_with(new_a)
        else:
            aside.decompose()

    for a in soup.find_all("a", href=True):
        if a["href"].startswith("/"):
            a["href"] = FORUM_ORIGIN + a["href"]

    text = html_to_md(str(soup), heading_style="ATX", bullets="-")
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def main():
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        rows = list(csv.reader(f))
    header, records = rows[0], rows[1:]
    title_i = header.index("Titulli i idesë")
    desc_i = header.index("Përshkrimi")
    name_i = header.index("Emri")
    show_name_i = header.index("Dëshiron të shfaqet emri yt publikisht?")

    title_to_topic = {title: topic_id for topic_id, title in TOPIC_IDS.items()}
    updated = 0
    for row in records:
        title = row[title_i]
        topic_id = title_to_topic.get(title)
        if topic_id is None:
            print(f"! no forum topic match for {title!r}, leaving as-is", file=sys.stderr)
            continue
        data = fetch_json(f"{FORUM_ORIGIN}/t/{topic_id}.json")
        post = data["post_stream"]["posts"][0]
        row[desc_i] = clean_and_convert(post["cooked"])
        author = (post.get("name") or "").strip() or (post.get("username") or "").strip()
        if author:
            row[name_i] = author
            row[show_name_i] = "Po"
        updated += 1
        print(f"  {topic_id}: {title} — {author}")
        time.sleep(0.2)

    with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(records)
    print(f"Updated {updated}/{len(records)} row(s) with real Markdown from the forum.")


if __name__ == "__main__":
    main()
