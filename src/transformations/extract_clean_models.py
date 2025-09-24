import sqlite3
import re
import unicodedata

# connect to your kijiji.db
conn = sqlite3.connect(r"..\scrapers\kijiji.db")
cur = conn.cursor()

# fetch distinct models
cur.execute("SELECT DISTINCT model FROM cars;")
rows = cur.fetchall()

models = [r[0] for r in rows if r[0]]

cleaned = []
for m in models:
    m = m.strip()
    # remove stray punctuation/commas
    m = re.sub(r"[^\w\s\-]", "", m)
    # normalize accents
    m = unicodedata.normalize("NFKD", m).encode("ascii", "ignore").decode()
    # title case (but keep uppercase if already like CR-V)
    if not m.isupper():
        m = m.title()
    # skip junk
    if not m or m.isdigit() or len(m) < 2:
        continue
    cleaned.append(m)

# deduplicate
cleaned = sorted(set(cleaned))

# preview
print("Cleaned models count:", len(cleaned))
for m in cleaned[:50]:
    print(m)

# optional: write back to db in a new table
cur.execute("DROP TABLE IF EXISTS clean_models;")
cur.execute("CREATE TABLE clean_models (model TEXT PRIMARY KEY);")
cur.executemany("INSERT INTO clean_models (model) VALUES (?)", [(m,) for m in cleaned])
conn.commit()
conn.close()
