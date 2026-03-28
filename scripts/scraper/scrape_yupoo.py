from __future__ import annotations

import argparse
import mimetypes
import os
import re
import sys
import time
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urljoin, urlparse, urlunparse

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import create_client

from catalog_config import CATEGORY_DEFINITIONS, ENTITY_ALIASES, LEAGUE_COUNTRY, PATCHES_BY_LEAGUE, REST_OF_WORLD_LEAGUE

sys.stdout.reconfigure(encoding="utf-8")

load_dotenv(dotenv_path=Path(__file__).parent.parent.parent / ".env.local")

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
PHOTO_BASE_URL = "https://photo.yupoo.com"
DEFAULT_BUCKET = os.getenv("SUPABASE_PRODUCT_IMAGES_BUCKET", "product-images")
DEFAULT_PROVIDER = os.getenv("YUPOO_SUPPLIER_NAME", "yupoo-category-supplier")
DEFAULT_PRICE = float(os.getenv("YUPOO_DEFAULT_PRICE", "34.90"))
DEFAULT_DELAY = float(os.getenv("YUPOO_REQUEST_DELAY", "0.5"))
DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"]
SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"]
SOURCE_MARKER_PREFIX = "Ref catalogue"
ALLOWED_PRODUCT_KINDS = {"jersey", "goalkeeper", "pre_match"}
TYPE_LABELS = {"domicile": "Domicile", "exterieur": "Exterieur", "third": "Third"}
SKIP_AUDIENCE = re.compile(r"\b(kids?|kid|youth|infant|baby|womens?|ladies|female|woman)\b", re.I)
SIZE_RANGE = re.compile(r"\b(XS|S|M|L|XL|XXL|2XL|3XL|4XL|5XL)\s*[-/~]\s*(XS|S|M|L|XL|XXL|2XL|3XL|4XL|5XL)\b", re.I)
SIZE_TOKENS = re.compile(r"\b(XS|S|M|L|XL|XXL|2XL|3XL|4XL|5XL)\b", re.I)
DESCRIPTOR_SPLIT = re.compile(r"\b(home|away|third|goalkeeper|jersey|shirt|retro|training|jacket|windbreaker|hoodie|pants|shorts|kit|set)\b", re.I)
TYPE_PATTERNS = [(re.compile(r"\b(third|3rd)\b", re.I), "third"), (re.compile(r"\b(away|exterieur)\b", re.I), "exterieur")]
KIND_PATTERNS = [
    (re.compile(r"\b(goalkeeper|keeper|gardien)\b|\u95e8\u5c06|\u5b88\u95e8\u5458", re.I), "goalkeeper"),
    (re.compile(r"\b(pre[- ]?match|avant[- ]match)\b|\u8d5b\u524d", re.I), "pre_match"),
    (re.compile(r"\b(training|drill|entrai)\b|\u8bad\u7ec3", re.I), "training"),
    (re.compile(r"\b(jacket|windbreaker|track top|hoodie|coat|sweat)\b|\u5916\u5957|\u5939\u514b|\u98ce\u8863|\u536b\u8863", re.I), "jacket"),
    (re.compile(r"\b(pants|trousers)\b|\u957f\u88e4", re.I), "pants"),
    (re.compile(r"\b(shorts)\b|\u77ed\u88e4", re.I), "shorts"),
    (re.compile(r"\b(set|kit|suit|ensemble)\b|\u5957\u88c5", re.I), "set"),
    (re.compile(r"\b(vest|tank)\b|\u80cc\u5fc3", re.I), "vest"),
    (re.compile(r"\b(lifestyle|tee|t-shirt|polo|casual|street)\b", re.I), "lifestyle"),
]
MODIFIER_PATTERNS = [
    (re.compile(r"\b(player version|authentic|player issue)\b", re.I), "Version Joueur"),
    (re.compile(r"\b(fan version|supporter)\b", re.I), "Version Supporter"),
    (re.compile(r"\b(long sleeve|long sleeves|ls)\b|\u957f\u8896", re.I), "Manches Longues"),
    (re.compile(r"\b(special edition|limited edition|anniversary|commemorative)\b", re.I), "Edition Speciale"),
]


def norm(text: str) -> str:
    text = unicodedata.normalize("NFKC", text or "")
    text = text.replace("·", " ").replace("—", "-").replace("–", "-")
    return re.sub(r"\s+", " ", re.sub(r"[._/]+", " ", text)).strip(" -_,")


def ascii_norm(text: str) -> str:
    text = unicodedata.normalize("NFKD", text or "").encode("ascii", "ignore").decode("ascii").lower()
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", text)).strip()


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text or "").encode("ascii", "ignore").decode("ascii").lower()
    return re.sub(r"[\s_-]+", "-", re.sub(r"[^\w\s-]", "", text)).strip("-")


def with_page(url: str, page: int) -> str:
    parsed = urlparse(url)
    params = dict(parse_qsl(parsed.query, keep_blank_values=True))
    params["page"] = str(page)
    return urlunparse(parsed._replace(query=urlencode(params)))


def absolute(base_url: str, url: str | None) -> str:
    if not url:
        return ""
    if url.startswith("//"):
        return f"https:{url}"
    return urljoin(base_url, url)


def original_photo_url(data_path: str | None) -> str:
    if not data_path:
        return ""
    if data_path.startswith("//"):
        return f"https:{data_path}"
    return f"{PHOTO_BASE_URL}/{data_path.lstrip('/')}" if not data_path.startswith("/") else f"{PHOTO_BASE_URL}{data_path}"


def photo_candidates(base_url: str, image) -> list[str]:
    candidates = [
        absolute(base_url, image.get("data-src")),
        absolute(base_url, image.get("data-origin-src")),
        original_photo_url(image.get("data-path")),
        absolute(base_url, image.get("src")),
    ]
    unique = []
    for candidate in candidates:
        if candidate and candidate not in unique:
            unique.append(candidate)
    return unique


def photo_signature(url: str) -> str:
    parts = [part for part in urlparse(url).path.split("/") if part]
    if len(parts) >= 2:
        return parts[-2]
    return parts[-1] if parts else ""


def prioritize_cover_photo(photos: list[list[str]], cover_candidates: list[str]) -> list[list[str]]:
    cover_signatures = {photo_signature(url) for url in cover_candidates if photo_signature(url)}
    if not cover_signatures:
        return photos

    leading = []
    trailing = []
    for photo in photos:
        signatures = {photo_signature(url) for url in photo if photo_signature(url)}
        if signatures & cover_signatures:
            leading.append(photo)
        else:
            trailing.append(photo)
    return leading + trailing if leading else photos


def fetch_text(session: requests.Session, url: str, timeout: int | tuple[int, int] = 30, retries: int = 4) -> str:
    last_error = None
    for attempt in range(retries):
        try:
            response = session.get(url, timeout=timeout)
            response.raise_for_status()
            return response.text
        except requests.RequestException as exc:
            last_error = exc
            if attempt < retries - 1:
                time.sleep(1 + attempt * 2)
    raise RuntimeError(f"Failed to fetch {url}: {last_error}")


def get_total_pages(soup: BeautifulSoup) -> int:
    page_input = soup.select_one(".pagination__jumpwrap input[name='page']")
    if page_input and page_input.get("max", "").isdigit():
        return int(page_input["max"])
    values = []
    for item in soup.select(".pagination__number"):
        try:
            values.append(int(item.get_text(strip=True)))
        except ValueError:
            pass
    return max(values) if values else 1


def normalize_size(token: str) -> str:
    return {"2XL": "XXL", "XXXL": "3XL", "XXXXL": "4XL"}.get(token.upper(), token.upper())


def extract_sizes(title: str) -> list[str]:
    upper = norm(title).upper()
    match = SIZE_RANGE.search(upper)
    if match:
        start = normalize_size(match.group(1))
        end = normalize_size(match.group(2))
        if start in SIZE_ORDER and end in SIZE_ORDER:
            return SIZE_ORDER[SIZE_ORDER.index(start) : SIZE_ORDER.index(end) + 1]
    found = []
    for token in SIZE_TOKENS.findall(upper):
        normalized = normalize_size(token)
        if normalized not in found:
            found.append(normalized)
    return found or DEFAULT_SIZES


def expand_two_digit_year(value: int) -> int:
    pivot = (datetime.now(timezone.utc).year + 5) % 100
    return 2000 + value if value <= pivot else 1900 + value


def normalize_season_year(year: int) -> int:
    max_allowed = datetime.now(timezone.utc).year + 5
    if year > max_allowed and 2000 <= year <= 2099:
        return expand_two_digit_year(year % 100)
    return year


def parse_season(title: str) -> str:
    text = norm(title)
    match = re.search(r"\b(19\d{2}|20\d{2})\s*[-/ ]\s*(19\d{2}|20\d{2}|\d{2})\b", text)
    if match:
        start = normalize_season_year(int(match.group(1)))
        end_raw = match.group(2)
        end = normalize_season_year(int(end_raw)) if len(end_raw) == 4 else expand_two_digit_year(int(end_raw))
        return f"{start}-{end}"
    match = re.search(r"\b(\d{2})\s*[-/ ]\s*(\d{2})\b", text)
    if match:
        return f"{expand_two_digit_year(int(match.group(1)))}-{expand_two_digit_year(int(match.group(2)))}"
    match = re.search(r"\b(19\d{2}|20\d{2})\b", text)
    return str(normalize_season_year(int(match.group(1)))) if match else "A definir"


def infer_kind(title: str) -> str:
    for pattern, label in KIND_PATTERNS:
        if pattern.search(title):
            return label
    return "jersey"


def infer_type(title: str) -> str:
    for pattern, label in TYPE_PATTERNS:
        if pattern.search(title):
            return label
    return "domicile"


def entity_from_title(title: str):
    normalized = ascii_norm(title)
    for alias, entity in sorted(ENTITY_ALIASES.items(), key=lambda item: len(item[0]), reverse=True):
        if re.search(rf"(?<![a-z0-9]){re.escape(alias)}(?![a-z0-9])", normalized):
            return entity
    return None


def fallback_club(title: str) -> str:
    text = ascii_norm(title)
    split = DESCRIPTOR_SPLIT.search(text)
    candidate = text[: split.start()] if split else text
    candidate = re.sub(r"\b(19\d{2}|20\d{2}|\d{2}|retro|mens|men|adult|player|version|fan)\b", " ", candidate)
    candidate = re.sub(r"\s+", " ", candidate).strip()
    return candidate.title() if candidate else "A definir"


def modifiers_from_title(title: str, is_retro: bool) -> list[str]:
    found = []
    for pattern, label in MODIFIER_PATTERNS:
        if pattern.search(title) and label not in found:
            found.append(label)
    if is_retro and "Retro" not in found:
        found.append("Retro")
    return found


def parse_product(title: str, category: dict) -> dict | None:
    title = norm(title)
    if not title or SKIP_AUDIENCE.search(ascii_norm(title)):
        return None
    kind = infer_kind(title)
    if kind not in ALLOWED_PRODUCT_KINDS:
        return None
    entity = entity_from_title(title)
    club = entity[0] if entity else fallback_club(title)
    league = category["league"] or (entity[2] if entity else REST_OF_WORLD_LEAGUE)
    country = (entity[1] if entity else None) or category["country"] or LEAGUE_COUNTRY.get(league) or "A definir"
    season = parse_season(title)
    product_type = infer_type(title)
    is_retro = category["is_retro"] or "retro" in ascii_norm(title)
    modifiers = modifiers_from_title(title, is_retro)
    display_kind = "Gardien" if kind == "goalkeeper" else "Maillot"
    name_parts = [club, display_kind, TYPE_LABELS[product_type], *modifiers]
    if season != "A definir":
        name_parts.append(season)
    description = f"{display_kind} {TYPE_LABELS[product_type].lower()} de {club}"
    if is_retro:
        description += " retro"
    if season != "A definir":
        description += f" saison {season}"
    description += ". Produit importe automatiquement depuis le catalogue fournisseur et heberge sur KITLAB."
    return {
        "name": " ".join(part for part in name_parts if part).strip(),
        "club": club,
        "league": league,
        "country": country,
        "product_kind": kind,
        "type": product_type,
        "season": season,
        "sizes": extract_sizes(title),
        "is_retro": is_retro,
        "available_patches": PATCHES_BY_LEAGUE.get(league, PATCHES_BY_LEAGUE[REST_OF_WORLD_LEAGUE]),
        "description": description,
    }


def headers(content_type: str | None = None) -> dict[str, str]:
    base = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    if content_type:
        base["Content-Type"] = content_type
    return base


def ensure_bucket(bucket: str) -> None:
    check = requests.get(f"{SUPABASE_URL}/storage/v1/bucket/{bucket}", headers=headers(), timeout=30)
    if check.ok:
        return
    create = requests.post(f"{SUPABASE_URL}/storage/v1/bucket", headers=headers("application/json"), json={"id": bucket, "name": bucket, "public": True}, timeout=30)
    create.raise_for_status()


def ensure_league(supabase, *, slug: str, name: str, country: str, flag_emoji: str, display_order: int) -> None:
    existing = supabase.table("leagues").select("id").eq("slug", slug).limit(1).execute().data or []
    payload = {
        "slug": slug,
        "name": name,
        "country": country,
        "flag_emoji": flag_emoji,
        "display_order": display_order,
    }
    if existing:
        supabase.table("leagues").update(payload).eq("slug", slug).execute()
    else:
        supabase.table("leagues").insert(payload).execute()


def supports_source_columns(supabase) -> bool:
    try:
        supabase.table("products").select("id,source_provider,source_album_id").limit(1).execute()
        return True
    except Exception:
        return False


def build_source_marker(provider: str, album_id: str) -> str:
    return f"{SOURCE_MARKER_PREFIX}:{provider}:{album_id}"


def extract_source_album_id(description: str | None, provider: str) -> str | None:
    for part in (description or "").split("|"):
        token = part.strip()
        if not token.lower().startswith(f"{SOURCE_MARKER_PREFIX.lower()}:"):
            continue
        pieces = token.split(":", 2)
        if len(pieces) != 3:
            continue
        _, parsed_provider, album_id = pieces
        if parsed_provider == provider and album_id:
            return album_id
    return None


def apply_source_marker(description: str, provider: str, album_id: str) -> str:
    parts = [part.strip() for part in (description or "").split("|") if part.strip()]
    cleaned = [part for part in parts if not part.lower().startswith(f"{SOURCE_MARKER_PREFIX.lower()}:")]
    cleaned.append(build_source_marker(provider, album_id))
    return " | ".join(cleaned)


def upload_image(session: requests.Session, image_urls: str | list[str], bucket: str, object_prefix: str) -> str:
    last_error = None
    urls = [image_urls] if isinstance(image_urls, str) else image_urls
    for image_url in urls:
        for attempt in range(3):
            try:
                response = session.get(image_url, timeout=(30, 120))
                response.raise_for_status()
                content_type = response.headers.get("content-type", "image/jpeg").split(";")[0].strip() or "image/jpeg"
                ext = Path(urlparse(image_url).path).suffix.lower() or mimetypes.guess_extension(content_type) or ".jpg"
                object_path = f"{object_prefix}{'.jpg' if ext == '.jpe' else ext}"
                upload = requests.post(
                    f"{SUPABASE_URL}/storage/v1/object/{bucket}/{object_path}",
                    headers={**headers(content_type), "x-upsert": "true"},
                    data=response.content,
                    timeout=(30, 120),
                )
                upload.raise_for_status()
                return f"{SUPABASE_URL}/storage/v1/object/public/{bucket}/{object_path}"
            except requests.RequestException as exc:
                last_error = exc
                if attempt < 2:
                    time.sleep(1 + attempt * 2)
    raise RuntimeError(f"Image upload failed for {urls[0]}: {last_error}")


def fetch_all(supabase, columns: str, provider: str | None = None, use_source_columns: bool = False) -> list[dict]:
    rows, offset, size = [], 0, 1000
    while True:
        query = supabase.table("products").select(columns).order("created_at").range(offset, offset + size - 1)
        if provider and use_source_columns:
            query = query.eq("source_provider", provider)
        batch = query.execute().data or []
        rows.extend(batch)
        if len(batch) < size:
            return rows
        offset += size


def resolve_categories(selected: list[str], overrides: dict[str, str]) -> list[dict]:
    wanted = set(selected or [item["key"] for item in CATEGORY_DEFINITIONS])
    categories, missing = [], []
    for definition in CATEGORY_DEFINITIONS:
        if definition["key"] not in wanted:
            continue
        url = overrides.get(definition["key"]) or os.getenv(definition["env_var"], "").strip()
        if not url:
            missing.append(f"{definition['key']} ({definition['env_var']})")
            continue
        categories.append({**definition, "url": url})
    if missing:
        raise RuntimeError("Missing category URLs: " + ", ".join(missing))
    return categories


def chunked(values: list[str], size: int = 100) -> list[list[str]]:
    return [values[index : index + size] for index in range(0, len(values), size)]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--category", action="append", choices=[item["key"] for item in CATEGORY_DEFINITIONS])
    parser.add_argument("--category-url", action="append", default=[])
    parser.add_argument("--provider", default=DEFAULT_PROVIDER)
    parser.add_argument("--bucket", default=DEFAULT_BUCKET)
    parser.add_argument("--delay", type=float, default=DEFAULT_DELAY)
    parser.add_argument("--page-from", type=int, default=1)
    parser.add_argument("--page-to", type=int, default=None)
    parser.add_argument("--skip-image-upload", action="store_true")
    parser.add_argument("--reuse-existing-photos", action="store_true")
    parser.add_argument("--deactivate-missing", action="store_true")
    parser.add_argument("--cutover", action="store_true")
    args = parser.parse_args()

    overrides = {}
    for value in args.category_url:
        if "=" not in value:
            raise ValueError(f"Invalid category override: {value}")
        key, url = value.split("=", 1)
        overrides[key.strip()] = url.strip()
    categories = resolve_categories(args.category or [], overrides)

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    source_columns = supports_source_columns(supabase)
    ensure_league(
        supabase,
        slug="liga-portugal",
        name="Liga Portugal",
        country="Portugal",
        flag_emoji="🇵🇹",
        display_order=6,
    )
    supabase.table("leagues").update({"display_order": 7}).eq("slug", "champions-league").execute()
    if not args.dry_run and not args.skip_image_upload:
        ensure_bucket(args.bucket)

    session = requests.Session()
    session.headers.update({"User-Agent": "Mozilla/5.0", "Referer": "https://www.yupoo.com/"})

    row_columns = "id,slug,is_active,is_featured,description,season,photos"
    if source_columns:
        row_columns += ",source_album_id"
    all_rows = fetch_all(supabase, row_columns, args.provider if source_columns else None, source_columns)
    if source_columns:
        provider_rows = all_rows
    else:
        provider_rows = []
        for row in all_rows:
            source_album_id = extract_source_album_id(row.get("description"), args.provider)
            if source_album_id:
                provider_rows.append({**row, "source_album_id": source_album_id})
    existing_by_album = {row["source_album_id"]: row for row in provider_rows if row.get("source_album_id")}
    all_slugs = {row["slug"] for row in fetch_all(supabase, "slug") if row.get("slug")}
    seen, processed, inserted, updated, skipped = set(), 0, 0, 0, 0

    for category in categories:
        if args.limit and processed >= args.limit:
            break
        first_url = with_page(category["url"], 1)
        first_soup = BeautifulSoup(fetch_text(session, first_url), "html.parser")
        total_pages = get_total_pages(first_soup)
        start_page = max(1, args.page_from)
        end_page = min(total_pages, args.page_to) if args.page_to else total_pages
        if start_page > total_pages:
            print(f"{category['key']}: skipped, start page {start_page} > total pages {total_pages}")
            continue
        print(f"{category['key']}: pages {start_page}-{end_page} / {total_pages}")
        for page in range(start_page, end_page + 1):
            if args.limit and processed >= args.limit:
                break
            soup = first_soup if page == 1 else BeautifulSoup(fetch_text(session, with_page(category["url"], page)), "html.parser")
            for album in soup.select(".album__main"):
                if args.limit and processed >= args.limit:
                    break
                try:
                    title_el = album.parent.select_one(".album__title") if album.parent else None
                    cover_el = album.select_one(".album__img") or (album.parent.select_one(".album__img") if album.parent else None)
                    href = album.get("href")
                    raw_title = album.get("title") or (title_el.get_text(strip=True) if title_el else "")
                    if not raw_title or not href:
                        continue
                    album_id_match = re.search(r"/albums/(\d+)", href)
                    album_id = album_id_match.group(1) if album_id_match else ""
                    if not album_id or album_id in seen:
                        continue
                    title = norm(raw_title)
                    parsed = parse_product(title, category)
                    if not parsed:
                        skipped += 1
                        continue
                    album_url = absolute(category["url"], href)
                    album_soup = BeautifulSoup(fetch_text(session, album_url), "html.parser")
                    if "access code" in " ".join(album_soup.stripped_strings).lower():
                        print(f"  locked album skipped: {album_url}")
                        skipped += 1
                        continue
                    photos = []
                    for image in album_soup.select(".image__img"):
                        candidates = photo_candidates(album_url, image)
                        if candidates and candidates[0] not in {item[0] for item in photos}:
                            photos.append(candidates)
                    photos = prioritize_cover_photo(photos, photo_candidates(category["url"], cover_el) if cover_el else [])
                    if not photos:
                        skipped += 1
                        continue
                    existing = existing_by_album.get(album_id)
                    slug = existing["slug"] if existing else slugify(parsed["name"]) or f"album-{album_id}"
                    if not existing and slug in all_slugs:
                        slug = f"{slug}-{album_id}"
                    all_slugs.add(slug)
                    if existing and args.reuse_existing_photos and existing.get("photos"):
                        final_photos = existing["photos"]
                    elif args.dry_run or args.skip_image_upload:
                        final_photos = [photo[0] for photo in photos]
                    else:
                        final_photos = [upload_image(session, photo, args.bucket, f"{args.provider}/{category['key']}/{album_id}/{index:02d}") for index, photo in enumerate(photos, start=1)]
                    payload = {
                        **parsed,
                        "slug": slug,
                        "price": DEFAULT_PRICE,
                        "photos": final_photos,
                        "stock": 100,
                        "is_featured": existing.get("is_featured", False) if existing else False,
                        "is_active": existing.get("is_active", False) if existing else False,
                    }
                    if source_columns:
                        payload.update(
                            {
                                "source_provider": args.provider,
                                "source_album_id": album_id,
                                "source_album_url": album_url,
                                "source_category_key": category["key"],
                                "source_title": title,
                                "last_synced_at": datetime.now(timezone.utc).isoformat(),
                            }
                        )
                    else:
                        payload["description"] = apply_source_marker(parsed["description"], args.provider, album_id)
                    if args.dry_run:
                        print(f"  [DRY RUN] {category['key']} | {title} -> {payload['name']} | {payload['league']}")
                    elif existing:
                        supabase.table("products").update(payload).eq("id", existing["id"]).execute()
                        updated += 1
                    else:
                        supabase.table("products").insert(payload).execute()
                        inserted += 1
                    processed += 1
                    seen.add(album_id)
                    time.sleep(args.delay)
                except Exception as exc:
                    skipped += 1
                    print(f"  error skipped: {href} | {exc}")
                    continue

    if not args.dry_run and args.deactivate_missing:
        stale_ids = [row["id"] for row in provider_rows if row.get("source_album_id") and row["source_album_id"] not in seen]
        for chunk in chunked(stale_ids):
            supabase.table("products").update({"is_active": False}).in_("id", chunk).execute()
        print(f"Deactivated missing provider products: {len(stale_ids)}")

    if not args.dry_run and args.cutover:
        if source_columns:
            rows = fetch_all(supabase, "id,source_provider,season")
            provider_ids = [row["id"] for row in rows if row.get("source_provider") == args.provider]
            other_ids = [row["id"] for row in rows if row.get("source_provider") != args.provider and row.get("season") != "A definir"]
        else:
            rows = fetch_all(supabase, "id,description,season")
            provider_ids = [row["id"] for row in rows if extract_source_album_id(row.get("description"), args.provider)]
            other_ids = [row["id"] for row in rows if not extract_source_album_id(row.get("description"), args.provider) and row.get("season") != "A definir"]
        for chunk in chunked(other_ids):
            supabase.table("products").update({"is_active": False}).in_("id", chunk).execute()
        for chunk in chunked(provider_ids):
            supabase.table("products").update({"is_active": True}).in_("id", chunk).execute()
        print(f"Cutover complete: {len(provider_ids)} active provider rows, {len(other_ids)} deactivated rows.")

    print(f"Done. processed={processed} inserted={inserted} updated={updated} skipped={skipped}")


if __name__ == "__main__":
    main()
