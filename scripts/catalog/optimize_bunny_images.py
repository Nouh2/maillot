from __future__ import annotations

import io
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import urlparse

import requests
from dotenv import load_dotenv
from PIL import Image, ImageOps
from supabase import create_client

load_dotenv(dotenv_path=Path(__file__).parent.parent.parent / ".env.local")

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
BUNNY_STORAGE_ZONE = os.environ["BUNNY_STORAGE_ZONE"]
BUNNY_STORAGE_PASSWORD = os.environ["BUNNY_STORAGE_PASSWORD"]
BUNNY_STORAGE_HOST = os.getenv("BUNNY_STORAGE_HOST", "storage.bunnycdn.com")
BUNNY_CDN_BASE_URL = os.getenv("BUNNY_CDN_BASE_URL", "https://maillotaddict.b-cdn.net").rstrip("/")
QUALITY = int(os.getenv("BUNNY_WEBP_QUALITY", "68"))
MAX_PHOTOS = int(os.getenv("BUNNY_WEBP_MAX_PHOTOS", "2"))
LIMIT = int(os.getenv("BUNNY_WEBP_LIMIT", "0"))
CONCURRENCY = max(1, int(os.getenv("BUNNY_WEBP_CONCURRENCY", "8")))

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
session = requests.Session()


def fetch_all_active_products() -> list[dict]:
    rows: list[dict] = []
    offset = 0
    page_size = 1000

    while True:
      batch = (
          supabase.table("products")
          .select("id,slug,photos,is_active")
          .eq("is_active", True)
          .order("created_at", desc=True)
          .range(offset, offset + page_size - 1)
          .execute()
          .data
          or []
      )
      rows.extend(batch)
      if len(batch) < page_size:
          break
      offset += page_size

    return rows


def is_bunny_url(url: str) -> bool:
    return isinstance(url, str) and url.startswith(BUNNY_CDN_BASE_URL)


def to_webp_url(url: str) -> str:
    parsed = urlparse(url)
    path = parsed.path
    stem = path.rsplit(".", 1)[0] if "." in path else path
    return f"{BUNNY_CDN_BASE_URL}{stem}.webp"


def bunny_object_path(url: str) -> str:
    parsed = urlparse(url)
    path = parsed.path.lstrip("/")
    stem = path.rsplit(".", 1)[0] if "." in path else path
    return f"{stem}.webp"


def download(url: str) -> bytes:
    response = session.get(url, timeout=(30, 120))
    response.raise_for_status()
    return response.content


def encode_webp(content: bytes) -> bytes:
    image = Image.open(io.BytesIO(content))
    image = ImageOps.exif_transpose(image)
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGBA" if "A" in image.getbands() else "RGB")

    output = io.BytesIO()
    image.save(output, format="WEBP", quality=QUALITY, method=6)
    return output.getvalue()


def upload_to_bunny(object_path: str, content: bytes) -> None:
    upload_url = f"https://{BUNNY_STORAGE_HOST}/{BUNNY_STORAGE_ZONE}/{object_path}"
    response = session.put(
        upload_url,
        headers={
            "AccessKey": BUNNY_STORAGE_PASSWORD,
            "Content-Type": "image/webp",
        },
        data=content,
        timeout=(30, 120),
    )
    response.raise_for_status()


def optimize_single_photo(url: str) -> tuple[str, int, int]:
    original = download(url)
    optimized = encode_webp(original)
    if len(optimized) >= len(original):
        return url, len(original), len(original)

    next_url = to_webp_url(url)
    upload_to_bunny(bunny_object_path(url), optimized)
    return next_url, len(original), len(optimized)


def optimize_product(product: dict) -> tuple[str, int, int, int]:
    photos = list(product.get("photos") or [])
    changed = False
    saved_bytes = 0
    optimized_count = 0

    for index, url in enumerate(photos[:MAX_PHOTOS]):
        if not is_bunny_url(url) or url.endswith(".webp"):
            continue

        next_url, original_size, optimized_size = optimize_single_photo(url)
        if next_url != url:
            photos[index] = next_url
            changed = True
            optimized_count += 1
            saved_bytes += original_size - optimized_size

    if changed:
        supabase.table("products").update({"photos": photos}).eq("id", product["id"]).execute()

    return product["slug"], optimized_count, saved_bytes, len(photos[:MAX_PHOTOS])


def main() -> None:
    products = fetch_all_active_products()
    target = products[:LIMIT] if LIMIT > 0 else products

    total_saved = 0
    total_optimized = 0
    processed = 0

    with ThreadPoolExecutor(max_workers=CONCURRENCY) as executor:
        futures = {executor.submit(optimize_product, product): product for product in target}
        for future in as_completed(futures):
            slug, optimized_count, saved_bytes, _ = future.result()
            processed += 1
            total_saved += saved_bytes
            total_optimized += optimized_count
            if optimized_count > 0:
                print(f"[{processed}/{len(target)}] OPTIMIZED {slug} ({optimized_count} photos, saved {saved_bytes / 1024:.1f} KB)")

    print(
        f"Done. products={len(target)} optimized_photos={total_optimized} saved_mb={total_saved / (1024 * 1024):.2f}"
    )


if __name__ == "__main__":
    main()
