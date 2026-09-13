#!/usr/bin/env python3
"""Pulls the IB Atlas country guides from the community forum
(forum.illyrianbrains.org/c/nisma/ib-atlas/144), downloads their images, and
writes cleaned HTML fragments to src/data/atlas/<slug>.html for the
/projektet/atlas/[slug] page to render.

Re-run this whenever a country guide is updated on the forum:
    python3 scripts/sync-atlas.py

Requires: pip install beautifulsoup4
"""

import json, os, re, sys, time
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from bs4 import BeautifulSoup

FORUM_ORIGIN = "https://forum.illyrianbrains.org"
UA = "Mozilla/5.0 (illyrianbrains.org content sync)"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS_ROOT = os.path.join(ROOT, "public", "assets", "atlas")
DATA_ROOT = os.path.join(ROOT, "src", "data", "atlas")

# Forum topic id -> (slug, title) for each country/city guide in the Atlas category.
# Update this list when a new country guide is published on the forum.
TOPICS = [
    (303, "gjermani", "Gjermani"),
    (668, "zvicer", "Zvicër"),
    (293, "austri", "Austri"),
    (292, "france", "Francë"),
    (233, "finlande", "Finlandë"),
    (933, "suedi", "Suedi"),
    (51, "malte", "Maltë"),
    (506, "trento", "Trento (Itali)"),
    (652, "mbreteria-e-bashkuar", "Mbretëria e Bashkuar"),
    (875, "oxford", "Oxford (Mbretëria e Bashkuar)"),
]


def resolve_url(url):
    if url.startswith("//"):
        return "https:" + url
    if url.startswith("/"):
        return FORUM_ORIGIN + url
    return url


def fetch_bytes(url):
    req = Request(resolve_url(url), headers={"User-Agent": UA})
    with urlopen(req, timeout=30) as resp:
        return resp.read()


def fetch_json(url):
    return json.loads(fetch_bytes(url))


def safe_filename(url, used):
    name = os.path.basename(urlparse(url).path)
    name = re.sub(r"[^A-Za-z0-9._-]", "_", name)
    if not name:
        name = "image.jpg"
    base, ext = os.path.splitext(name)
    candidate = name
    i = 1
    while candidate in used:
        candidate = f"{base}-{i}{ext}"
        i += 1
    used.add(candidate)
    return candidate


def clean_topic(topic_id, slug):
    data = fetch_json(f"{FORUM_ORIGIN}/t/{topic_id}.json")
    post = data["post_stream"]["posts"][0]
    soup = BeautifulSoup(post["cooked"], "html.parser")

    # Decorative emoji icons and Discourse's heading-permalink anchors carry no
    # real content — drop them.
    for img in soup.find_all("img", class_="emoji"):
        img.decompose()
    for a in soup.find_all("a", class_="anchor"):
        a.decompose()

    asset_dir = os.path.join(ASSETS_ROOT, slug)
    os.makedirs(asset_dir, exist_ok=True)
    used_names = set(os.listdir(asset_dir))
    downloaded = 0

    # Lightbox-wrapped images -> download the original, replace with a plain <img>.
    for wrapper in soup.find_all("div", class_="lightbox-wrapper"):
        a_tag = wrapper.find("a", class_="lightbox")
        img_tag = wrapper.find("img")
        if not img_tag:
            wrapper.decompose()
            continue
        src_url = a_tag["href"] if a_tag and a_tag.get("href") else img_tag.get("src")
        alt = img_tag.get("alt", "")
        try:
            content = fetch_bytes(src_url)
            fname = safe_filename(src_url, used_names)
            with open(os.path.join(asset_dir, fname), "wb") as out:
                out.write(content)
            downloaded += 1
            new_img = soup.new_tag("img", src=f"/assets/atlas/{slug}/{fname}", alt=alt)
            wrapper.replace_with(new_img)
        except Exception as e:
            print(f"  ! failed to download {src_url}: {e}", file=sys.stderr)
            wrapper.decompose()
        time.sleep(0.15)

    # Any other <img> not already handled.
    for img_tag in soup.find_all("img"):
        src = img_tag.get("src", "")
        if src.startswith("/assets/atlas/") or "emoji" in (img_tag.get("class") or []):
            continue
        try:
            content = fetch_bytes(src)
            fname = safe_filename(src, used_names)
            with open(os.path.join(asset_dir, fname), "wb") as out:
                out.write(content)
            downloaded += 1
            img_tag["src"] = f"/assets/atlas/{slug}/{fname}"
        except Exception as e:
            print(f"  ! failed to download standalone img {src}: {e}", file=sys.stderr)
            img_tag.decompose()
        time.sleep(0.15)

    # External links open in a new tab.
    for a in soup.find_all("a", href=True):
        if a["href"].startswith("http"):
            a["target"] = "_blank"
            a["rel"] = "noopener noreferrer"

    # Wrap embedded maps for a responsive aspect-ratio box.
    for iframe in soup.find_all("iframe"):
        wrapper = soup.new_tag("div", **{"class": "atlas-map"})
        iframe.wrap(wrapper)
        for attr in ["width", "height", "marginheight", "marginwidth"]:
            if iframe.has_attr(attr):
                del iframe[attr]

    # Strip every attribute we don't explicitly need — no Discourse classes/ids
    # carried into the site's own styling.
    keep_attrs = {
        "a": {"href", "target", "rel"},
        "img": {"src", "alt"},
        "iframe": {"src"},
        "div": {"class"},
    }
    for tag in soup.find_all(True):
        allowed = keep_attrs.get(tag.name, set())
        for attr in list(tag.attrs.keys()):
            if attr not in allowed:
                del tag[attr]
        if tag.name == "div" and tag.get("class") != ["atlas-map"] and "class" in tag.attrs:
            del tag["class"]

    # Drop empty leftovers.
    for tag in soup.find_all(["div", "p"]):
        if tag.name == "div" and tag.get("class") == ["atlas-map"]:
            continue
        if not tag.get_text(strip=True) and not tag.find(["img", "iframe"]):
            tag.decompose()

    html = str(soup)
    out_path = os.path.join(DATA_ROOT, f"{slug}.html")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"{slug}: {downloaded} image(s), {len(html)} chars -> {os.path.relpath(out_path, ROOT)}")


def main():
    os.makedirs(DATA_ROOT, exist_ok=True)
    for topic_id, slug, _title in TOPICS:
        try:
            clean_topic(topic_id, slug)
        except Exception as e:
            print(f"! failed topic {topic_id} ({slug}): {e}", file=sys.stderr)
        time.sleep(0.3)


if __name__ == "__main__":
    main()
