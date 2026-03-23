"""
Yupoo product scraper for KITLAB.
Fetches gallery listings, album photos, and translates Chinese album titles to French.
Usage: python scrape_yupoo.py --limit 10 --dry-run
"""
import argparse
import os
import re
import sys
import time
import unicodedata
from pathlib import Path
from urllib.parse import urljoin

sys.stdout.reconfigure(encoding="utf-8")

from dotenv import load_dotenv
from supabase import create_client

load_dotenv(dotenv_path=Path(__file__).parent.parent.parent / ".env.local")

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
BASE_URL = "https://svip-1688.x.yupoo.com"
PHOTO_BASE_URL = "https://photo.yupoo.com"
REST_OF_WORLD_LEAGUE = "Reste du monde"
DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"]
SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"]
SIZE_RANGE_SEPARATORS = r"(?:-|–|—|~|～|一|到|至|--)"
CHINESE_CHAR_PATTERN = re.compile(r"[\u3400-\u9fff]+")
AC_MILAN_VARIANT_PATTERN = re.compile(r"AC\s*[\u3400-\u9fff]|[\u3400-\u9fff]+\s*AC|赛季\s*AC|AC特别版|AC客场|AC主场")
EDITORIAL_TRIGGER_PATTERN = re.compile(
    r"veste baseball|Hollywood gardien|edition edition|lifestyle top|t-shirt lifestyle lifestyle|"
    r"retro lifestyle|collaboration maillot|(?:^|\s)\d{2}\s+\d{2}(?:\s|$)|S\s*"
    + SIZE_RANGE_SEPARATORS
    + r"\s*(?:2XL|3XL|4XL|5XL|XXL|XL)|\bTokyo\b|\bGoku\b|\bSaiyan\b|\bCaptain Tsubasa\b",
    re.IGNORECASE,
)

ENTITY_CATALOG = {
    "巴黎圣日耳曼": {"name": "Paris Saint-Germain", "country": "France", "league": "A categoriser"},
    "巴黎": {"name": "Paris Saint-Germain", "country": "France", "league": "A categoriser"},
    "皇家马德里": {"name": "Real Madrid", "country": "Espagne", "league": "A categoriser"},
    "皇马": {"name": "Real Madrid", "country": "Espagne", "league": "A categoriser"},
    "巴塞罗那": {"name": "FC Barcelone", "country": "Espagne", "league": "A categoriser"},
    "巴萨": {"name": "FC Barcelone", "country": "Espagne", "league": "A categoriser"},
    "曼彻斯特联": {"name": "Manchester United", "country": "Angleterre", "league": "A categoriser"},
    "曼联": {"name": "Manchester United", "country": "Angleterre", "league": "A categoriser"},
    "曼彻斯特城": {"name": "Manchester City", "country": "Angleterre", "league": "A categoriser"},
    "曼城": {"name": "Manchester City", "country": "Angleterre", "league": "A categoriser"},
    "切尔西": {"name": "Chelsea", "country": "Angleterre", "league": "A categoriser"},
    "利物浦": {"name": "Liverpool", "country": "Angleterre", "league": "A categoriser"},
    "热刺": {"name": "Tottenham", "country": "Angleterre", "league": "A categoriser"},
    "纽卡斯尔": {"name": "Newcastle", "country": "Angleterre", "league": "A categoriser"},
    "纽卡斯": {"name": "Newcastle", "country": "Angleterre", "league": "A categoriser"},
    "阿森纳": {"name": "Arsenal", "country": "Angleterre", "league": "A categoriser"},
    "阿斯顿维拉": {"name": "Aston Villa", "country": "Angleterre", "league": "A categoriser"},
    "国际米兰": {"name": "Inter Milan", "country": "Italie", "league": "A categoriser"},
    "国米": {"name": "Inter Milan", "country": "Italie", "league": "A categoriser"},
    "米兰": {"name": "AC Milan", "country": "Italie", "league": "A categoriser"},
    "尤文图斯": {"name": "Juventus", "country": "Italie", "league": "A categoriser"},
    "尤文": {"name": "Juventus", "country": "Italie", "league": "A categoriser"},
    "罗马": {"name": "AS Rome", "country": "Italie", "league": "A categoriser"},
    "那不勒斯": {"name": "Naples", "country": "Italie", "league": "A categoriser"},
    "威尼斯": {"name": "Venezia", "country": "Italie", "league": "A categoriser"},
    "科莫": {"name": "Como", "country": "Italie", "league": "A categoriser"},
    "巴里": {"name": "Bari", "country": "Italie", "league": "A categoriser"},
    "拜仁": {"name": "Bayern Munich", "country": "Allemagne", "league": "A categoriser"},
    "多特蒙德": {"name": "Borussia Dortmund", "country": "Allemagne", "league": "A categoriser"},
    "多特": {"name": "Borussia Dortmund", "country": "Allemagne", "league": "A categoriser"},
    "门兴格拉德巴赫": {"name": "Borussia Monchengladbach", "country": "Allemagne", "league": "A categoriser"},
    "门兴": {"name": "Borussia Monchengladbach", "country": "Allemagne", "league": "A categoriser"},
    "斯图加特": {"name": "Stuttgart", "country": "Allemagne", "league": "A categoriser"},
    "美因茨": {"name": "Mayence", "country": "Allemagne", "league": "A categoriser"},
    "汉堡": {"name": "Hambourg", "country": "Allemagne", "league": "A categoriser"},
    "费耶诺德": {"name": "Feyenoord", "country": "Pays-Bas", "league": "A categoriser"},
    "本菲卡": {"name": "Benfica", "country": "Portugal", "league": "A categoriser"},
    "波尔图": {"name": "FC Porto", "country": "Portugal", "league": "A categoriser"},
    "里斯本竞技": {"name": "Sporting CP", "country": "Portugal", "league": "A categoriser"},
    "巴列卡诺": {"name": "Rayo Vallecano", "country": "Espagne", "league": "A categoriser"},
    "洛杉矶": {"name": "Los Angeles", "country": "Etats-Unis", "league": "A categoriser"},
    "芝华士": {"name": "Chivas", "country": "Mexique", "league": "A categoriser"},
    "弗拉门戈": {"name": "Flamengo", "country": "Bresil", "league": "A categoriser"},
    "米内罗": {"name": "Atletico Mineiro", "country": "Bresil", "league": "A categoriser"},
    "美国队": {"name": "Etats-Unis", "country": "Etats-Unis", "league": "Selections nationales"},
    "美国": {"name": "Etats-Unis", "country": "Etats-Unis", "league": "Selections nationales"},
    "法国": {"name": "France", "country": "France", "league": "Selections nationales"},
    "英格兰": {"name": "Angleterre", "country": "Angleterre", "league": "Selections nationales"},
    "德国": {"name": "Allemagne", "country": "Allemagne", "league": "Selections nationales"},
    "西班牙": {"name": "Espagne", "country": "Espagne", "league": "Selections nationales"},
    "葡萄牙": {"name": "Portugal", "country": "Portugal", "league": "Selections nationales"},
    "意大利": {"name": "Italie", "country": "Italie", "league": "Selections nationales"},
    "荷兰": {"name": "Pays-Bas", "country": "Pays-Bas", "league": "Selections nationales"},
    "比利时": {"name": "Belgique", "country": "Belgique", "league": "Selections nationales"},
    "巴西": {"name": "Bresil", "country": "Bresil", "league": "Selections nationales"},
    "阿根廷": {"name": "Argentine", "country": "Argentine", "league": "Selections nationales"},
    "哥伦比亚": {"name": "Colombie", "country": "Colombie", "league": "Selections nationales"},
    "秘鲁": {"name": "Perou", "country": "Perou", "league": "Selections nationales"},
    "奥地利": {"name": "Autriche", "country": "Autriche", "league": "Selections nationales"},
    "新西兰": {"name": "Nouvelle-Zelande", "country": "Nouvelle-Zelande", "league": "Selections nationales"},
    "加拿大": {"name": "Canada", "country": "Canada", "league": "Selections nationales"},
    "墨西哥": {"name": "Mexique", "country": "Mexique", "league": "Selections nationales"},
    "日本": {"name": "Japon", "country": "Japon", "league": "Selections nationales"},
    "摩洛哥": {"name": "Maroc", "country": "Maroc", "league": "Selections nationales"},
    "突尼斯": {"name": "Tunisie", "country": "Tunisie", "league": "Selections nationales"},
    "阿尔及利亚": {"name": "Algerie", "country": "Algerie", "league": "Selections nationales"},
    "埃尔及利亚": {"name": "Algerie", "country": "Algerie", "league": "Selections nationales"},
    "挪威": {"name": "Norvege", "country": "Norvege", "league": "Selections nationales"},
    "厄瓜多尔": {"name": "Equateur", "country": "Equateur", "league": "Selections nationales"},
    "牙买加": {"name": "Jamaique", "country": "Jamaique", "league": "Selections nationales"},
    "卡塔尔": {"name": "Qatar", "country": "Qatar", "league": "Selections nationales"},
    "刚果": {"name": "Congo", "country": "Congo", "league": "Selections nationales"},
    "海地": {"name": "Haiti", "country": "Haiti", "league": "Selections nationales"},
    "马里": {"name": "Mali", "country": "Mali", "league": "Selections nationales"},
    "哥伦比亚": {"name": "Colombie", "country": "Colombie", "league": "Selections nationales"},
    "乌拉圭": {"name": "Uruguay", "country": "Uruguay", "league": "Selections nationales"},
    "尼日利亚": {"name": "Nigeria", "country": "Nigeria", "league": "Selections nationales"},
    "阿贾克斯": {"name": "Ajax", "country": "Pays-Bas", "league": "A categoriser"},
    "阿贾克斯队": {"name": "Ajax", "country": "Pays-Bas", "league": "A categoriser"},
    "桑托斯": {"name": "Santos", "country": "Bresil", "league": "A categoriser"},
    "圣保罗": {"name": "Sao Paulo", "country": "Bresil", "league": "A categoriser"},
    "佛拉门戈": {"name": "Flamengo", "country": "Bresil", "league": "A categoriser"},
    "克鲁赛罗": {"name": "Cruzeiro", "country": "Bresil", "league": "A categoriser"},
    "福塔莱萨": {"name": "Fortaleza", "country": "Bresil", "league": "A categoriser"},
    "格雷米奥": {"name": "Gremio", "country": "Bresil", "league": "A categoriser"},
    "国际": {"name": "Internacional", "country": "Bresil", "league": "A categoriser"},
    "里斯本": {"name": "Sporting CP", "country": "Portugal", "league": "A categoriser"},
    "利雅得胜利": {"name": "Al-Nassr", "country": "Arabie saoudite", "league": "A categoriser"},
    "利雅得新月": {"name": "Al-Hilal", "country": "Arabie saoudite", "league": "A categoriser"},
    "利雅得": {"name": "Riyadh", "country": "Arabie saoudite", "league": "A categoriser"},
    "波希米亚人": {"name": "Bohemians", "country": "Irlande", "league": "A categoriser"},
    "爱超波希米亚人": {"name": "Bohemians", "country": "Irlande", "league": "A categoriser"},
    "派桑杜": {"name": "Paysandu", "country": "Bresil", "league": "A categoriser"},
    "巴勒莫": {"name": "Palerme", "country": "Italie", "league": "A categoriser"},
    "博卡": {"name": "Boca Juniors", "country": "Argentine", "league": "A categoriser"},
    "巴塞": {"name": "FC Barcelone", "country": "Espagne", "league": "A categoriser"},
    "马赛": {"name": "Olympique de Marseille", "country": "France", "league": "A categoriser"},
    "马竞": {"name": "Atletico Madrid", "country": "Espagne", "league": "A categoriser"},
    "美洲": {"name": "Club America", "country": "Mexique", "league": "A categoriser"},
    "利兹联": {"name": "Leeds United", "country": "Angleterre", "league": "A categoriser"},
    "凯尔特人": {"name": "Celtic", "country": "Ecosse", "league": "A categoriser"},
    "布莱顿": {"name": "Brighton", "country": "Angleterre", "league": "A categoriser"},
    "梅西": {"name": "Lionel Messi", "country": "Argentine", "league": "A categoriser"},
    "C罗": {"name": "Cristiano Ronaldo", "country": "Portugal", "league": "A categoriser"},
    "科特迪瓦": {"name": "Cote d'Ivoire", "country": "Cote d'Ivoire", "league": "Selections nationales"},
    "塞内加尔": {"name": "Senegal", "country": "Senegal", "league": "Selections nationales"},
    "克罗地亚": {"name": "Croatie", "country": "Croatie", "league": "Selections nationales"},
    "苏格兰": {"name": "Ecosse", "country": "Ecosse", "league": "Selections nationales"},
    "威尔士": {"name": "Pays de Galles", "country": "Pays de Galles", "league": "Selections nationales"},
    "爱尔兰": {"name": "Irlande", "country": "Irlande", "league": "Selections nationales"},
    "瑞士": {"name": "Suisse", "country": "Suisse", "league": "Selections nationales"},
    "沙特阿拉伯": {"name": "Arabie saoudite", "country": "Arabie saoudite", "league": "Selections nationales"},
    "喀麦隆": {"name": "Cameroun", "country": "Cameroun", "league": "Selections nationales"},
    "巴勒斯坦": {"name": "Palestine", "country": "Palestine", "league": "Selections nationales"},
}

TERM_TRANSLATIONS = {
    "球衣": "maillot",
    "赛前训练服": "tenue d'entrainement d'avant-match",
    "第五客场": "cinquieme maillot exterieur",
    "第四客场": "quatrieme maillot exterieur",
    "第三客场": "third",
    "第二客场": "deuxieme maillot exterieur",
    "第四赛前服": "quatrieme tenue d'avant-match",
    "第三赛前服": "troisieme tenue d'avant-match",
    "第二赛前服": "deuxieme tenue d'avant-match",
    "赛前服": "tenue d'avant-match",
    "训练服": "tenue d'entrainement",
    "守门员长袖": "gardien manches longues",
    "守门员": "gardien",
    "门将": "gardien",
    "休闲长袖": "lifestyle manches longues",
    "休闲": "lifestyle",
    "球员版": "version joueur",
    "球迷版": "version supporter",
    "女款": "femme",
    "女子": "femme",
    "童装": "enfant",
    "儿童": "enfant",
    "套装": "ensemble",
    "外套": "veste",
    "夹克": "veste",
    "风衣": "coupe-vent",
    "卫衣": "sweat",
    "连帽": "a capuche",
    "无帽": "sans capuche",
    "拉链": "zippe",
    "棉服": "doudoune",
    "羽绒服": "doudoune",
    "长裤": "pantalon",
    "短裤": "short",
    "裤": "pantalon",
    "T恤": "t-shirt",
    "T裇": "t-shirt",
    "polo": "polo",
    "纪念版": "edition commemorative",
    "特别版": "edition speciale",
    "复古版": "edition retro",
    "联名版": "collaboration",
    "漫威": "Marvel",
    "刺绣版": "brodee",
    "带星": "avec etoiles",
    "长袖": "manches longues",
    "短袖": "manches courtes",
    "背心": "debardeur",
    "主": "maillot domicile",
    "客": "maillot exterieur",
    "棒球服": "veste baseball",
    "迷彩": "camouflage",
    "正确版提花布1:1": "version jacquard 1:1",
    "正确版": "version authentique",
    "悟空": "Goku",
    "太阳小悟空": "Petit Goku solaire",
    "赛亚人": "Saiyan",
    "东京城市版": "edition Tokyo City",
    "东京": "Tokyo",
    "火龙": "dragon de feu",
    "好莱坞": "Hollywood",
    "女神": "deesse",
    "叶子版": "edition feuilles",
    "龙年": "annee du Dragon",
    "复古体恤": "t-shirt retro",
    "复古": "retro",
    "游戏浅": "edition gaming clair",
    "游戏上青": "edition gaming turquoise",
    "上青色": "turquoise",
    "上青": "turquoise",
    "浅": "clair",
    "深": "fonce",
    "十字": "croix",
    "概念版渐变粉": "edition concept rose degrade",
    "概念版": "edition concept",
    "圆广告": "sponsor rond",
    "联名款": "collaboration",
    "联名": "collaboration",
    "欧冠板": "version Ligue des champions",
    "联赛版": "version championnat",
    "款": "edition",
    "文化衫": "t-shirt lifestyle",
    "酒": "bordeaux",
    "云朵": "nuages",
    "海贼王": "One Piece",
    "啤酒节": "Oktoberfest",
    "万圣节": "Halloween",
    "泥王": "roi de la boue",
    "龙版": "edition dragon",
    "龙纹": "motif dragon",
    "彩兰": "bleu irise",
    "衫": "top",
    "宝": "joyau",
    "慕尼": "Munich",
    "青龙": "dragon azur",
    "星海": "mer d'etoiles",
    "足球小将": "Captain Tsubasa",
    "卡通版": "edition cartoon",
    "龙开筒": "dragon",
    "詹姆斯联名": "collaboration James",
    "体恤": "t-shirt",
    "墨": "encre",
    "老鹰": "aigle",
    "豹": "leopard",
    "NTS联名": "collaboration NTS",
    "Polo衫": "polo",
    "有带广告和无广告": "avec ou sans sponsor",
    "第": "",
    "队": "",
    "主场": "maillot domicile",
    "客场": "maillot exterieur",
    "二客": "deuxieme maillot exterieur",
    "三客": "third",
    "四客": "quatrieme maillot exterieur",
    "五客": "cinquieme maillot exterieur",
    "赛季": "saison",
    "世界杯": "Coupe du monde",
    "周年": "anniversaire",
    "马年": "annee du Cheval",
    "深苔绿": "vert mousse fonce",
    "天蓝色": "bleu ciel",
    "粉色": "rose",
    "黄色": "jaune",
    "紫色": "violet",
    "橙色": "orange",
    "金色": "or",
    "银色": "argent",
    "棕色": "marron",
    "深蓝色": "bleu marine",
    "浅蓝色": "bleu clair",
    "荧光绿": "vert fluo",
    "草绿色": "vert prairie",
    "灰色": "gris",
    "黑色": "noir",
    "白色": "blanc",
    "蓝色": "bleu",
    "绿色": "vert",
    "红色": "rouge",
    "黑": "noir",
    "白": "blanc",
    "蓝": "bleu",
    "绿": "vert",
    "红": "rouge",
    "灰": "gris",
    "黄": "jaune",
    "紫": "violet",
    "橙": "orange",
    "金": "or",
    "银": "argent",
    "棕": "marron",
}

ENTITY_KEYS = sorted(ENTITY_CATALOG, key=len, reverse=True)
TERM_KEYS = sorted(TERM_TRANSLATIONS, key=len, reverse=True)
PRODUCT_KIND_RULES = [
    (("守门员", "门将"), "goalkeeper"),
    (("赛前训练服", "赛前服"), "pre_match"),
    (("训练服",), "training"),
    (("棒球服",), "jacket"),
    (("外套", "夹克", "风衣", "卫衣", "棉服", "羽绒服"), "jacket"),
    (("长裤",), "pants"),
    (("短裤",), "shorts"),
    (("套装",), "set"),
    (("背心",), "vest"),
    (("休闲", "T恤", "T裇", "体恤", "文化衫", "Polo衫", "polo"), "lifestyle"),
]

LEAGUE_BY_CLUB = {
    "Paris Saint-Germain": "Ligue 1",
    "Olympique de Marseille": "Ligue 1",
    "Manchester United": "Premier League",
    "Manchester City": "Premier League",
    "Liverpool": "Premier League",
    "Tottenham": "Premier League",
    "Newcastle": "Premier League",
    "Arsenal": "Premier League",
    "Aston Villa": "Premier League",
    "Chelsea": "Premier League",
    "Brighton": "Premier League",
    "Real Madrid": "La Liga",
    "FC Barcelone": "La Liga",
    "Atletico Madrid": "La Liga",
    "Rayo Vallecano": "La Liga",
    "Inter Milan": "Serie A",
    "AC Milan": "Serie A",
    "Juventus": "Serie A",
    "AS Rome": "Serie A",
    "Naples": "Serie A",
    "Como": "Serie A",
    "Venezia": "Serie A",
    "Bayern Munich": "Bundesliga",
    "Borussia Dortmund": "Bundesliga",
    "Borussia Monchengladbach": "Bundesliga",
    "Stuttgart": "Bundesliga",
    "Mayence": "Bundesliga",
    "Hambourg": "Bundesliga",
}


def clean_spaces(text: str) -> str:
    text = re.sub(r"[._/]+", " ", text)
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\s+([,)\]])", r"\1", text)
    text = re.sub(r"([(\[])\s+", r"\1", text)
    return text.strip(" -_,")


def normalize_text(text: str) -> str:
    text = unicodedata.normalize("NFKC", text or "")
    text = text.replace("·", " ").replace("＊", " ").replace("，", " ").replace("。", " ")
    text = text.replace("（", "(").replace("）", ")")
    return clean_spaces(text)


def slugify(text: str) -> str:
    """Convert product name to URL-friendly slug."""
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")


def normalize_size_token(token: str) -> str:
    token = token.upper()
    mapping = {
        "2XL": "XXL",
        "XXXL": "3XL",
        "XXXXL": "4XL",
        "5X": "5XL",
        "4X": "4XL",
        "3X": "3XL",
    }
    return mapping.get(token, token)


def remove_chinese_fragments(text: str) -> str:
    return clean_spaces(CHINESE_CHAR_PATTERN.sub(" ", text or ""))


def normalize_compact_season_token(start: str, end: str) -> str:
    start_year = 2000 + int(start)
    end_year = 2000 + int(end)
    if start_year <= end_year <= start_year + 1:
        return f"{start_year}-{end_year}"
    return f"{start} {end}"


def polish_display_name(text: str) -> str:
    polished = clean_spaces(text)
    polished = re.sub(r"(?<!\d)(\d{2})\s+(\d{2})(?!\d)", lambda m: normalize_compact_season_token(m.group(1), m.group(2)), polished)
    polished = re.sub(rf"\b(XS|S|M|L|XL|XXL|2XL|3XL|4XL|5XL)\s*{SIZE_RANGE_SEPARATORS}\s*(XS|S|M|L|XL|XXL|2XL|3XL|4XL|5XL|3X|4X|5X)\b", "", polished, flags=re.IGNORECASE)
    polished = polished.replace("veste baseball", "blouson baseball")
    polished = polished.replace("edition edition", "edition")
    polished = polished.replace("lifestyle t-shirt lifestyle", "t-shirt lifestyle")
    polished = polished.replace("retro lifestyle t-shirt lifestyle", "t-shirt lifestyle retro")
    polished = polished.replace("retro lifestyle top", "top lifestyle retro")
    polished = polished.replace("lifestyle top", "top lifestyle")
    polished = polished.replace("t-shirt top", "t-shirt")
    polished = polished.replace("top lifestyle lifestyle", "top lifestyle")
    polished = polished.replace("Hollywood gardien", "gardien edition Hollywood")
    polished = polished.replace("collaboration maillot", "maillot collaboration")
    polished = polished.replace("lv collaboration maillot", "maillot collaboration LV")
    polished = polished.replace("lv maillot collaboration", "maillot collaboration LV")
    polished = polished.replace("Y3 collaboration", "collaboration Y-3")
    polished = polished.replace("NTS collaboration", "collaboration NTS")
    polished = polished.replace("Marvel collaboration", "collaboration Marvel")
    polished = polished.replace("One Piece collaboration", "collaboration One Piece")
    polished = polished.replace("collaboration James", "edition James")
    polished = polished.replace("edition Tokyo City", "edition Tokyo City")
    polished = polished.replace(" 25-", " 25 ")
    polished = re.sub(r"\b([A-Za-z]+)\s+croix\s+(maillot (?:domicile|exterieur|third))\b", r"\2 \1 croix", polished, flags=re.IGNORECASE)
    polished = re.sub(r"\b(maillot (?:domicile|exterieur|third))\s+(?:version )?authentique\b", r"\1 version authentique", polished, flags=re.IGNORECASE)
    polished = re.sub(r"\b([A-Za-z][A-Za-z -]+?)\s+edition speciale\b", r"\1 edition speciale", polished, flags=re.IGNORECASE)
    polished = re.sub(r"\b([A-Za-z][A-Za-z -]+?)\s+edition commemorative\b", r"\1 edition commemorative", polished, flags=re.IGNORECASE)
    polished = re.sub(r"\b([A-Za-z][A-Za-z -]+?)\s+edition retro\b", r"\1 edition retro", polished, flags=re.IGNORECASE)
    polished = re.sub(r"\btop lifestyle manches longues\b", "top lifestyle manches longues", polished, flags=re.IGNORECASE)
    polished = re.sub(r"\bretro t-shirt\b", "t-shirt retro", polished, flags=re.IGNORECASE)
    polished = re.sub(r"\bretro top\b", "top retro", polished, flags=re.IGNORECASE)
    polished = re.sub(r"\s+\(\s*\)", "", polished)
    polished = re.sub(r"\b2025-2025\b", "2025", polished)
    polished = re.sub(r"\b([A-Za-z][A-Za-z -]+?)\s+(\d{2})\s+(?=edition|maillot|blouson|t-shirt|top|gardien|tenue|lifestyle)", lambda m: f"{m.group(1)} 20{m.group(2)}", polished)
    return clean_spaces(polished)


def postprocess_translated_text(text: str) -> str:
    text = remove_chinese_fragments(text)
    text = re.sub(r"\bsaison\b", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"\btop top\b", "top", text, flags=re.IGNORECASE)
    text = re.sub(r"\bmaillot domicile maillot domicile\b", "maillot domicile", text, flags=re.IGNORECASE)
    text = re.sub(r"\bmaillot exterieur maillot exterieur\b", "maillot exterieur", text, flags=re.IGNORECASE)
    return polish_display_name(text)


def extract_sizes(raw_name: str) -> list[str]:
    compact = raw_name.upper().replace(" ", "")
    range_match = re.search(
        rf"(XS|S|M|L|XL|XXL|2XL|3XL|4XL|5XL)\s*{SIZE_RANGE_SEPARATORS}\s*(XS|S|M|L|XL|XXL|2XL|3XL|4XL|5XL|3X|4X|5X)",
        compact,
    )
    if range_match:
        start = normalize_size_token(range_match.group(1))
        end = normalize_size_token(range_match.group(2))
        if start in SIZE_ORDER and end in SIZE_ORDER:
            start_index = SIZE_ORDER.index(start)
            end_index = SIZE_ORDER.index(end)
            if start_index <= end_index:
                return SIZE_ORDER[start_index : end_index + 1]

    found = []
    for token in re.findall(r"(XS|S|M|L|XL|XXL|2XL|3XL|4XL|5XL)", compact):
        normalized = normalize_size_token(token)
        if normalized not in found:
            found.append(normalized)
    return found or DEFAULT_SIZES


def parse_season(raw_name: str) -> str:
    full_match = re.search(r"(20\d{2})\s*[-/]\s*(20\d{2})", raw_name)
    if full_match:
        return f"{full_match.group(1)}-{full_match.group(2)}"

    compact_match = re.search(r"(?<!\d)(\d{2})(\d{2})(?!\d)", raw_name)
    if compact_match:
        start = 2000 + int(compact_match.group(1))
        end = 2000 + int(compact_match.group(2))
        if start <= end <= start + 1:
            return f"{start}-{end}"

    short_match = re.search(r"(?<!\d)(\d{2})\s*[-/]\s*(\d{2})(?!\d)", raw_name)
    if short_match:
        start = 2000 + int(short_match.group(1))
        end = 2000 + int(short_match.group(2))
        return f"{start}-{end}"

    single_year = re.search(r"(20\d{2})", raw_name)
    if single_year:
        return single_year.group(1)

    return "A definir"


def infer_product_type(raw_name: str) -> str:
    lowered = raw_name.lower()
    if any(token in raw_name for token in ["第三客场", "三客"]) or "third" in lowered:
        return "third"
    if any(token in raw_name for token in ["客场", "二客", "四客", "五客"]) or "away" in lowered or "exterieur" in lowered:
        return "exterieur"
    return "domicile"


def infer_product_kind(raw_name: str) -> str:
    lowered = raw_name.lower()
    for tokens, kind in PRODUCT_KIND_RULES:
        if any(token in raw_name for token in tokens):
            return kind
        if any(token.lower() in lowered for token in tokens if token.isascii()):
            return kind
    return "jersey"


def strip_structured_tokens(raw_name: str) -> str:
    text = normalize_text(raw_name)
    text = re.sub(r"(20\d{2})\s*[-/]\s*(20\d{2})", " ", text, count=1)
    text = re.sub(r"(?<!\d)(\d{2})(\d{2})(?!\d)", " ", text, count=1)
    text = re.sub(r"(?<!\d)(\d{2})\s*[-/]\s*(\d{2})(?!\d)", " ", text, count=1)
    text = re.sub(r"(20\d{2})", " ", text, count=1)
    text = re.sub(
        rf"(XS|S|M|L|XL|XXL|2XL|3XL|4XL|5XL)\s*{SIZE_RANGE_SEPARATORS}\s*(XS|S|M|L|XL|XXL|2XL|3XL|4XL|5XL|3X|4X|5X)",
        " ",
        text,
        count=1,
        flags=re.IGNORECASE,
    )
    return clean_spaces(text)


def match_entity(text: str) -> tuple[str | None, dict | None]:
    for chinese_name in ENTITY_KEYS:
        if chinese_name in text:
            return chinese_name, ENTITY_CATALOG[chinese_name]
    return None, None


def translate_fragment(text: str) -> str:
    translated = normalize_text(text)
    for chinese_name in ENTITY_KEYS:
        translated = translated.replace(chinese_name, f" {ENTITY_CATALOG[chinese_name]['name']} ")
    for chinese_term in TERM_KEYS:
        translated = translated.replace(chinese_term, f" {TERM_TRANSLATIONS[chinese_term]} ")
    return postprocess_translated_text(translated)


def build_description(raw_name: str, album_url: str, album_date: str | None) -> str:
    details = [f"Titre source Yupoo: {raw_name}", f"Album Yupoo: {album_url}"]
    if album_date:
        details.append(f"Date album Yupoo: {album_date}")
    details.append("Produit importe automatiquement depuis Yupoo.")
    return " | ".join(details)


def infer_supported_league(club_name: str, current_league: str | None = None) -> str:
    if club_name in LEAGUE_BY_CLUB:
        return LEAGUE_BY_CLUB[club_name]
    if current_league == "Selections nationales":
        return current_league
    if current_league in {"Ligue 1", "Premier League", "La Liga", "Serie A", "Bundesliga", REST_OF_WORLD_LEAGUE}:
        return current_league
    return REST_OF_WORLD_LEAGUE


def infer_special_entity(raw_name: str, translated_text: str) -> dict | None:
    normalized_raw = normalize_text(raw_name)
    if "AC" in normalized_raw and CHINESE_CHAR_PATTERN.search(normalized_raw):
        return {"name": "AC Milan", "country": "Italie", "league": "Serie A"}
    if AC_MILAN_VARIANT_PATTERN.search(normalized_raw):
        return {"name": "AC Milan", "country": "Italie", "league": "Serie A"}
    if re.search(r"\bAC\b", translated_text) and any(token in normalized_raw for token in ["特别版", "客场", "主场", "二客", "赛季"]):
        return {"name": "AC Milan", "country": "Italie", "league": "Serie A"}
    return None


def extract_source_title(description: str | None) -> str | None:
    if not description:
        return None
    match = re.search(r"Titre source Yupoo:\s*(.*?)\s*\|\s*Album Yupoo:", description)
    return match.group(1).strip() if match else None


def extract_album_url_from_description(description: str | None) -> str:
    if not description:
        return ""
    match = re.search(r"Album Yupoo:\s*(.*?)\s*(?:\||$)", description)
    return match.group(1).strip() if match else ""


def extract_album_date_from_description(description: str | None) -> str | None:
    if not description:
        return None
    match = re.search(r"Date album Yupoo:\s*(.*?)\s*(?:\||$)", description)
    return match.group(1).strip() if match else None


def parse_product_name(raw_name: str, album_url: str, album_date: str | None) -> dict:
    """
    Parse raw album name into structured product data.
    Supports Yupoo Chinese album titles and translates them to French.
    """
    normalized_name = normalize_text(raw_name)
    season = parse_season(normalized_name)
    sizes = extract_sizes(normalized_name)
    product_type = infer_product_type(normalized_name)
    product_kind = infer_product_kind(normalized_name)
    core_name = strip_structured_tokens(normalized_name)
    translated_core_name = translate_fragment(core_name)

    entity_key, entity = match_entity(core_name)
    if not entity:
        entity = infer_special_entity(normalized_name, translated_core_name)
        if entity:
            entity_key = "AC"

    club_name = entity["name"] if entity else postprocess_translated_text(core_name) or "A definir"
    country = entity["country"] if entity else "A definir"
    league = infer_supported_league(club_name, entity["league"] if entity else "A categoriser")

    remainder = core_name.replace(entity_key, " ", 1) if entity_key else core_name
    translated_remainder = translate_fragment(remainder)
    translated_full = translated_core_name

    if entity and entity["name"] == "AC Milan":
        translated_remainder = re.sub(r"\bAC\b", " ", translated_remainder).strip()
        translated_full = re.sub(r"\bAC\b", " ", translated_full).strip()

    name_parts = []
    if entity:
        name_parts.append(entity["name"])
    if translated_remainder:
        name_parts.append(translated_remainder)
    elif not entity:
        name_parts.append(translated_full)
    if season != "A definir":
        name_parts.append(season)

    translated_name = postprocess_translated_text(" ".join(part for part in name_parts if part))
    if not translated_name:
        translated_name = postprocess_translated_text(normalized_name)

    return {
        "name": translated_name,
        "raw_name": normalized_name,
        "club": club_name,
        "league": league,
        "country": country,
        "product_kind": product_kind,
        "type": product_type,
        "season": season,
        "sizes": sizes,
        "description": build_description(normalized_name, album_url, album_date),
    }


def repair_existing_titles(limit: int = None, dry_run: bool = False):
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    rows = supabase.table("products").select("id,slug,name,description").limit(1000).execute().data or []
    candidates = [row for row in rows if CHINESE_CHAR_PATTERN.search(row.get("name") or "")]
    if limit:
        candidates = candidates[:limit]

    print(f"Found {len(candidates)} products with remaining Chinese fragments.")
    repaired = 0

    for row in candidates:
        raw_name = extract_source_title(row.get("description"))
        album_url = extract_album_url_from_description(row.get("description"))
        album_date = extract_album_date_from_description(row.get("description"))

        if not raw_name:
            print(f"  Skipping {row['slug']} - missing source title in description")
            continue

        parsed = parse_product_name(raw_name, album_url, album_date)
        updated_name = parsed["name"]
        if CHINESE_CHAR_PATTERN.search(updated_name):
            print(f"  Warning: {row['slug']} still contains Chinese after repair -> {updated_name}")

        payload = {
            "name": updated_name,
            "club": parsed["club"],
            "league": parsed["league"],
            "country": parsed["country"],
            "product_kind": parsed["product_kind"],
            "type": parsed["type"],
            "season": parsed["season"],
            "sizes": parsed["sizes"],
            "description": parsed["description"],
        }

        if dry_run:
            print(f"  [DRY RUN] {row['name']} -> {updated_name}")
        else:
            supabase.table("products").update(payload).eq("id", row["id"]).execute()
            print(f"  Repaired: {updated_name}")

        repaired += 1

    print(f"\nDone. {repaired} products repaired.")


def polish_existing_titles(limit: int = None, dry_run: bool = False):
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    rows = supabase.table("products").select("id,slug,name").limit(1000).execute().data or []
    candidates = [row for row in rows if EDITORIAL_TRIGGER_PATTERN.search(row.get("name") or "")]
    if limit:
        candidates = candidates[:limit]

    print(f"Found {len(candidates)} products needing editorial polish.")
    polished_count = 0

    for row in candidates:
        current_name = row.get("name") or ""
        polished_name = polish_display_name(current_name)
        if polished_name == current_name:
            continue

        if dry_run:
            print(f"  [DRY RUN] {current_name} -> {polished_name}")
        else:
            supabase.table("products").update({"name": polished_name}).eq("id", row["id"]).execute()
            print(f"  Polished: {polished_name}")

        polished_count += 1

    print(f"\nDone. {polished_count} products polished.")


def repair_existing_leagues(limit: int = None, dry_run: bool = False):
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    rows = supabase.table("products").select("id,slug,club,league").limit(1000).execute().data or []
    candidates = []
    for row in rows:
        target_league = infer_supported_league(row.get("club") or "", row.get("league"))
        if target_league != (row.get("league") or ""):
            candidates.append((row, target_league))

    if limit:
        candidates = candidates[:limit]

    print(f"Found {len(candidates)} products with repairable league assignment.")
    updated = 0

    for row, target_league in candidates:
        if dry_run:
            print(f"  [DRY RUN] {row['slug']} | {row.get('club')} | {row.get('league')} -> {target_league}")
        else:
            supabase.table("products").update({"league": target_league}).eq("id", row["id"]).execute()
            print(f"  Repaired: {row['slug']} -> {target_league}")
        updated += 1

    print(f"\nDone. {updated} league assignments repaired.")


def repair_ac_milan_variants(limit: int = None, dry_run: bool = False):
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    rows = supabase.table("products").select("id,slug,club,name,description").limit(1000).execute().data or []
    candidates = [
        row
        for row in rows
        if AC_MILAN_VARIANT_PATTERN.search(row.get("club") or "")
        or row.get("club") == "AC"
        or ("AC" in (row.get("name") or "") and CHINESE_CHAR_PATTERN.search(row.get("name") or ""))
        or (
            row.get("club") == "AC Milan"
            and re.search(r"saison\s+AC|\bAC Milan\b.*\bAC\b", row.get("name") or "", re.IGNORECASE)
        )
    ]
    if limit:
        candidates = candidates[:limit]

    print(f"Found {len(candidates)} AC Milan variants to repair.")
    repaired = 0

    for row in candidates:
        raw_name = extract_source_title(row.get("description")) or row.get("name") or ""
        album_url = extract_album_url_from_description(row.get("description"))
        album_date = extract_album_date_from_description(row.get("description"))
        parsed = parse_product_name(raw_name, album_url, album_date)

        payload = {
            "name": parsed["name"],
            "club": "AC Milan",
            "league": "Serie A",
            "country": "Italie",
            "product_kind": parsed["product_kind"],
            "type": parsed["type"],
            "season": parsed["season"],
            "sizes": parsed["sizes"],
            "description": parsed["description"],
        }

        if dry_run:
            print(f"  [DRY RUN] {row['club']} | {row['name']} -> AC Milan | {payload['name']}")
        else:
            supabase.table("products").update(payload).eq("id", row["id"]).execute()
            print(f"  Repaired: {row['slug']} -> {payload['name']}")
        repaired += 1

    print(f"\nDone. {repaired} AC Milan variants repaired.")


def absolutize_url(url: str | None) -> str:
    if not url:
        return ""
    if url.startswith("//"):
        return f"https:{url}"
    return urljoin(BASE_URL, url)


def upgrade_image_url(image_url: str) -> str:
    if not image_url:
        return ""
    return re.sub(r"/small(\.[a-zA-Z0-9]+)$", r"/medium\1", image_url)


def build_original_photo_url(data_path: str | None) -> str:
    if not data_path:
        return ""
    if data_path.startswith("//"):
        return f"https:{data_path}"
    if data_path.startswith("/"):
        return f"{PHOTO_BASE_URL}{data_path}"
    return f"{PHOTO_BASE_URL}/{data_path.lstrip('/')}"


def unique_non_empty(items: list[str]) -> list[str]:
    seen = set()
    result = []
    for item in items:
        if not item or item in seen:
            continue
        seen.add(item)
        result.append(item)
    return result


def extract_photo_token(url: str | None) -> str:
    if not url:
        return ""
    match = re.search(r"/svip-1688/([^/]+)/", url)
    return match.group(1) if match else ""


def reorder_photos_with_cover(photos: list[str], cover_url: str | None) -> list[str]:
    if not photos or not cover_url:
        return photos

    cover_token = extract_photo_token(cover_url)
    if not cover_token:
        return photos

    ordered = []
    for photo in photos:
        if extract_photo_token(photo) == cover_token:
            ordered.append(photo)
            break

    ordered.extend(photo for photo in photos if photo not in ordered)
    return ordered


def fetch_soup(session, url: str):
    import requests
    from bs4 import BeautifulSoup

    response = session.get(url, timeout=30)
    response.raise_for_status()
    return BeautifulSoup(response.text, "html.parser")


def get_total_pages(soup) -> int:
    page_input = soup.select_one(".pagination__jumpwrap input[name='page']")
    if page_input and page_input.get("max", "").isdigit():
        return int(page_input["max"])

    page_numbers = []
    for link in soup.select(".pagination__number"):
        try:
            page_numbers.append(int(link.get_text(strip=True)))
        except ValueError:
            continue
    return max(page_numbers) if page_numbers else 1


def extract_album_images(album_soup) -> tuple[list[str], str | None]:
    images = []
    for image in album_soup.select(".image__img"):
        src = absolutize_url(image.get("src"))
        best_image = build_original_photo_url(image.get("data-path")) or upgrade_image_url(src) or src
        images.append(best_image)

    if not images:
        for thumb in album_soup.select(".viewer__thumbnail img"):
            images.append(absolutize_url(thumb.get("data-src")))

    dates = [tag.get_text(strip=True) for tag in album_soup.select(".image__decwrap time") if tag.get_text(strip=True)]
    album_date = dates[0] if dates else None
    return unique_non_empty(images), album_date


def extract_album_id(album_href: str) -> str | None:
    match = re.search(r"/albums/(\d+)", album_href or "")
    return match.group(1) if match else None


def scrape_albums(limit: int = None, dry_run: bool = False):
    """Main scraper function."""
    import requests

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": f"{BASE_URL}/albums?tab=gallery",
        }
    )

    first_page_url = f"{BASE_URL}/albums?tab=gallery&page=1"
    print(f"Fetching albums from {first_page_url}...")
    first_soup = fetch_soup(session, first_page_url)
    total_pages = get_total_pages(first_soup)
    print(f"Detected {total_pages} gallery pages.")

    products_processed = 0

    for page in range(1, total_pages + 1):
        if limit and products_processed >= limit:
            break

        page_url = f"{BASE_URL}/albums?tab=gallery&page={page}"
        soup = first_soup if page == 1 else fetch_soup(session, page_url)
        albums = soup.select(".album__main")
        print(f"Page {page}/{total_pages}: {len(albums)} albums found.")

        for album in albums:
            if limit and products_processed >= limit:
                break

            try:
                title_el = album.select_one(".album__title")
                album_href = album.get("href")
                if not title_el or not album_href:
                    continue

                raw_name = title_el.get_text(strip=True)
                album_url = absolutize_url(album_href)
                album_id = extract_album_id(album_href)

                cover_img = album.select_one(".album__img")
                cover_src = absolutize_url(cover_img.get("src")) if cover_img else ""

                album_soup = fetch_soup(session, album_url)
                album_photos, album_date = extract_album_images(album_soup)
                photos = album_photos or unique_non_empty([upgrade_image_url(cover_src), cover_src])
                photos = reorder_photos_with_cover(photos, cover_src)

                if not photos:
                    print(f"  Skipping {raw_name} - no photos found")
                    continue

                parsed = parse_product_name(raw_name, album_url, album_date)
                slug_source = parsed["name"] or raw_name or (album_id or "")
                slug = slugify(slug_source) or f"album-{album_id or products_processed + 1}"

                product_data = {
                    "slug": slug,
                    "name": parsed["name"],
                    "club": parsed["club"],
                    "league": parsed["league"],
                    "country": parsed["country"],
                    "product_kind": parsed["product_kind"],
                    "type": parsed["type"],
                    "season": parsed["season"],
                    "price": 34.90,
                    "description": parsed["description"],
                    "photos": photos,
                    "sizes": parsed["sizes"],
                    "available_patches": [],
                    "stock": 100,
                }

                existing = supabase.table("products").select("is_active,is_featured").eq("slug", slug).limit(1).execute()
                existing_row = existing.data[0] if existing.data else None
                if existing_row:
                    product_data["is_active"] = existing_row.get("is_active", False)
                    product_data["is_featured"] = existing_row.get("is_featured", False)
                else:
                    product_data["is_active"] = False
                    product_data["is_featured"] = False

                if dry_run:
                    print(
                        f"  [DRY RUN] {raw_name} -> {product_data['name']} | "
                        f"{len(photos)} photos | sizes={','.join(product_data['sizes'])}"
                    )
                else:
                    supabase.table("products").upsert(product_data, on_conflict="slug").execute()
                    print(f"  Inserted: {product_data['name']}")

                products_processed += 1
                time.sleep(0.5)

            except requests.RequestException as exc:
                print(f"  Error fetching {album_href}: {exc}")
            except Exception as exc:
                print(f"  Error parsing {album_href}: {exc}")

    print(f"\nDone. {products_processed} products processed.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--repair-existing-titles", action="store_true")
    parser.add_argument("--polish-existing-titles", action="store_true")
    parser.add_argument("--repair-existing-leagues", action="store_true")
    parser.add_argument("--repair-ac-milan-variants", action="store_true")
    args = parser.parse_args()
    if args.repair_existing_titles:
        repair_existing_titles(limit=args.limit, dry_run=args.dry_run)
    elif args.polish_existing_titles:
        polish_existing_titles(limit=args.limit, dry_run=args.dry_run)
    elif args.repair_existing_leagues:
        repair_existing_leagues(limit=args.limit, dry_run=args.dry_run)
    elif args.repair_ac_milan_variants:
        repair_ac_milan_variants(limit=args.limit, dry_run=args.dry_run)
    else:
        scrape_albums(limit=args.limit, dry_run=args.dry_run)
