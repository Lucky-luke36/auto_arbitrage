import sqlite3
import pandas as pd
from thefuzz import process

# ===============================
# 1. Load clean models from Canada
# ===============================
print("Loading clean models from Canada DB...")
canada_db = r"src\db\kijiji.db"
poland_db = r"src\db\polish_cars.db"

print("Loading clean models...")
conn_ca = sqlite3.connect(canada_db)
print("Connected to Canada DB.")
df_models = pd.read_sql("SELECT model FROM clean_models;", conn_ca)
conn_ca.close()

clean_models = df_models['model'].tolist()

# ===============================
# 2. Load Polish cars
# ===============================
conn_pl = sqlite3.connect(poland_db)
df_polish = pd.read_sql("SELECT * FROM cars;", conn_pl)

# ===============================
# 3. Fuzzy match Polish models to Canada clean models
# ===============================
def match_model(polish_model, choices, threshold=80):
    """Return best match from choices if score >= threshold, else None"""
    if not polish_model or polish_model.strip() == "":
        return None
    result = process.extractOne(polish_model, choices)
    if not result:
        return None
    match, score = result[0], result[1]  # take only first two elements
    if score >= threshold:
        return match
    return None


# Apply fuzzy matching
df_polish['matched_model'] = df_polish['model'].apply(lambda x: match_model(x, clean_models))

# Drop rows that didn't match any clean model
df_filtered = df_polish[df_polish['matched_model'].notnull()].copy()

# ===============================
# 4. Keep only relevant fields for predictions
# ===============================
fields_for_model = [
    'make', 'matched_model', 'year', 'mileage', 'price'
]
df_filtered = df_filtered[fields_for_model]

# ===============================
# 5. Write filtered dataset to new table in Polish DB
# ===============================
df_filtered.to_sql("filtered_models", conn_pl, if_exists="replace", index=False)
conn_pl.close()

print(f"Filtered dataset saved with {len(df_filtered)} rows.")
