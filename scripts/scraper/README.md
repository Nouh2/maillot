# KITLAB — Yupoo Scraper

Script Python pour importer le catalogue fournisseur depuis Yupoo vers Supabase.

## Installation

```bash
cd scripts/scraper
pip install -r requirements.txt
```

## Configuration

Le script lit les variables d'environnement depuis `.env.local` à la racine du projet :
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Utilisation

```bash
# Test sans insérer (dry run)
python scrape_yupoo.py --dry-run --limit 5

# Importer les 50 premiers produits
python scrape_yupoo.py --limit 50

# Importer tout le catalogue
python scrape_yupoo.py
```

## Notes

- Les produits sont insérés avec `is_active: False` — à activer manuellement après vérification
- Le champ `league` est initialisé à "À catégoriser" — à mettre à jour via l'interface Supabase
- Respecte un délai de 0.5s entre chaque requête
- Vérifier le robots.txt du site fournisseur avant utilisation
