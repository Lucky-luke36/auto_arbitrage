import sqlite3
import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error
import lightgbm as lgb
import datetime

# ============================
# 0. Config
# ============================
DB_PATH = r"src\db\polish_cars.db"
TABLE = "cars"
MODEL_DIR = r"models/make_model/"
LOG_FILE = r"models/make_model_mae.log"
os.makedirs(MODEL_DIR, exist_ok=True)

MIN_ROWS = 49  # Minimum rows for a make-model to train a separate model

# ============================
# 1. Load Data
# ============================
print("Loading data from DB...")
conn = sqlite3.connect(DB_PATH)
df = pd.read_sql(f"SELECT * FROM {TABLE}", conn)
conn.close()
print(f"Loaded {len(df)} rows from {TABLE}")

# ============================
# 2. Clean & Filter
# ============================
print("Cleaning and filtering data...")
df["price"] = pd.to_numeric(df["price"], errors="coerce")
df = df[df["price"].notnull() & (df["price"] > 1000) & (df["make"] != '')]


current_year = datetime.datetime.now().year
df['age'] = current_year - df['year']


num_features = ["age", "mileage"]
cat_features = ["make", "model", "fuelType", "transmission"]

# Fill missing values
df[num_features] = df[num_features].fillna(df[num_features].median())
df[cat_features] = df[cat_features].fillna("unknown")

# Target
y_all = np.log1p(df["price"])
X_all = df[num_features + cat_features]

# ============================
# 3. Preprocessing
# ============================
preprocessor = ColumnTransformer(
    transformers=[
        ("num", "passthrough", num_features),
        ("cat", OneHotEncoder(handle_unknown="ignore"), cat_features)
    ]
)

# ============================
# 4. Global Model (fallback)
# ============================
print("Training global model...")
global_model = lgb.LGBMRegressor(
    n_estimators=500,
    learning_rate=0.05,
    max_depth=-1,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42
)
global_pipe = Pipeline([("pre", preprocessor), ("model", global_model)])
global_pipe.fit(X_all, y_all)

# ============================
# 5. Make-Model Models
# ============================
makes_models = df.groupby(["make", "model"])
log_lines = []

for (make, model), group in makes_models:
    if len(group) < MIN_ROWS:
        continue  # Skip tiny groups

    X = group[num_features + cat_features]
    y = np.log1p(group["price"])
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    pipe = Pipeline([("pre", preprocessor), ("model", lgb.LGBMRegressor(
        n_estimators=500,
        learning_rate=0.05,
        max_depth=-1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42
    ))])

    pipe.fit(X_train, y_train)
    y_pred = pipe.predict(X_test)
    mae = mean_absolute_error(np.expm1(y_test), np.expm1(y_pred))

    # Save model
    safe_make = make.replace(" ", "_")
    safe_model = model.replace(" ", "_")
    model_path = os.path.join(MODEL_DIR, f"{safe_make}_{safe_model}.pkl")
    joblib.dump(pipe, model_path)

    log_line = f"{make} {model}: {mae:.2f} PLN ({len(group)} rows) -> {model_path}"
    print(log_line)
    log_lines.append(log_line)

# ============================
# 6. Write log
# ============================
with open(LOG_FILE, "w", encoding="utf-8") as f:
    for line in log_lines:
        f.write(line + "\n")

print(f"All make-model MAEs logged to {LOG_FILE}")
print("Done.")
