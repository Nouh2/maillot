# KITLAB - Yupoo Category Scraper

Script Python pour importer le nouveau catalogue fournisseur Yupoo vers Supabase.

## Installation

```bash
cd scripts/scraper
pip install -r requirements.txt
```

## Configuration

Le script lit `.env.local` a la racine du projet.

Variables requises:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Variables recommandees:
- `SUPABASE_PRODUCT_IMAGES_BUCKET=product-images`
- `YUPOO_SUPPLIER_NAME=yupoo-category-supplier`
- `YUPOO_DEFAULT_PRICE=34.90`
- `YUPOO_REQUEST_DELAY=0.5`

URLs de categories Yupoo:
- `YUPOO_CATEGORY_NATIONAL_TEAMS_URL`
- `YUPOO_CATEGORY_LA_LIGA_URL`
- `YUPOO_CATEGORY_PREMIER_LEAGUE_URL`
- `YUPOO_CATEGORY_SERIE_A_URL`
- `YUPOO_CATEGORY_LIGUE_1_URL`
- `YUPOO_CATEGORY_BUNDESLIGA_URL`
- `YUPOO_CATEGORY_LIGA_PORTUGAL_URL`
- `YUPOO_CATEGORY_OTHER_LEAGUES_URL`
- `YUPOO_CATEGORY_RETRO_URL`

## Utilisation

```bash
# Dry run sur une partie du catalogue
python scrape_yupoo.py --dry-run --limit 10

# Dry run sur une categorie precise
python scrape_yupoo.py --dry-run --category ligue-1 --limit 5

# Override d'URL via CLI
python scrape_yupoo.py --dry-run --category-url ligue-1=https://example.yupoo.com/categories/123

# Import en brouillon avec upload Storage
python scrape_yupoo.py

# Desactiver les produits fournisseur disparus
python scrape_yupoo.py --deactivate-missing

# Bascule complete vers ce fournisseur
python scrape_yupoo.py --deactivate-missing --cutover
```

## Comportement

- Import par categories Yupoo et non plus par galerie globale
- Filtre les produits non maillot (training, jacket, hoodie, shorts, pants, set, lifestyle)
- Conserve `is_active` et `is_featured` des produits deja importes chez ce fournisseur
- Stocke les images dans Supabase Storage par defaut
- Alimente les champs `source_provider`, `source_album_id`, `source_album_url`, `source_category_key`, `source_title`, `last_synced_at`
- Les nouveaux produits restent en brouillon (`is_active=false`) tant qu'il n'y a pas de cutover

## Prerequis DB

Appliquer d'abord la migration:

```bash
supabase/migrations/003_supplier_catalog_sync.sql
```
