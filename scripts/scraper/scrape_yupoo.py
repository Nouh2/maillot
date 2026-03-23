"""
Yupoo product scraper for KITLAB.
Fetches album listings and product photos from the supplier site.
Usage: python scrape_yupoo.py --limit 10 --dry-run
"""
import os
import re
import time
import json
import argparse
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
BASE_URL = "https://svip-1688.x.yupoo.com"

def slugify(text: str) -> str:
    """Convert product name to URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text

def parse_product_name(raw_name: str) -> dict:
    """
    Parse raw album name into structured product data.
    Expected format: "Real Madrid Domicile 24/25" or "PSG Home 2024-2025"
    """
    parts = raw_name.strip().split()
    result = {
        "name": raw_name,
        "club": " ".join(parts[:-2]) if len(parts) > 2 else raw_name,
        "type": "domicile",
        "season": "2024-2025",
    }
    for keyword, jersey_type in [
        ("domicile", "domicile"), ("home", "domicile"),
        ("extérieur", "exterieur"), ("away", "exterieur"), ("exterior", "exterieur"),
        ("third", "third"), ("troisième", "third"),
    ]:
        if keyword in raw_name.lower():
            result["type"] = jersey_type
            break
    return result

def scrape_albums(limit: int = None, dry_run: bool = False):
    """Main scraper function."""
    import requests
    from bs4 import BeautifulSoup

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    })

    print(f"Fetching albums from {BASE_URL}/albums...")
    page = 1
    products_inserted = 0

    while True:
        url = f"{BASE_URL}/albums?tab=gallery&page={page}"
        resp = session.get(url, timeout=30)
        soup = BeautifulSoup(resp.text, "html.parser")

        albums = soup.select(".album__main")
        if not albums:
            print(f"No more albums at page {page}")
            break

        for album in albums:
            if limit and products_inserted >= limit:
                break

            title_el = album.select_one(".album__title")
            link_el = album.select_one("a[href]")
            if not title_el or not link_el:
                continue

            raw_name = title_el.get_text(strip=True)
            album_url = BASE_URL + link_el["href"]

            album_resp = session.get(album_url, timeout=30)
            album_soup = BeautifulSoup(album_resp.text, "html.parser")
            photos = [img["src"] for img in album_soup.select(".photo__img")[:3]]

            if len(photos) < 1:
                print(f"  Skipping {raw_name} — no photos found")
                continue

            parsed = parse_product_name(raw_name)
            slug = slugify(raw_name)

            product_data = {
                "slug": slug,
                "name": parsed["name"],
                "club": parsed["club"],
                "league": "À catégoriser",
                "country": "À définir",
                "type": parsed["type"],
                "season": parsed["season"],
                "price": 34.90,
                "photos": photos,
                "sizes": ["S", "M", "L", "XL", "XXL"],
                "available_patches": [],
                "stock": 100,
                "is_active": False,
            }

            if dry_run:
                print(f"  [DRY RUN] Would insert: {product_data['name']} ({len(photos)} photos)")
            else:
                result = supabase.table("products").upsert(product_data, on_conflict="slug").execute()
                print(f"  Inserted: {product_data['name']}")

            products_inserted += 1
            time.sleep(0.5)

        page += 1
        if limit and products_inserted >= limit:
            break

    print(f"\nDone. {products_inserted} products processed.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    scrape_albums(limit=args.limit, dry_run=args.dry_run)
