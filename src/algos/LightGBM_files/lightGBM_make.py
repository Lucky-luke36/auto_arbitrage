import sqlite3
import pandas as pd
import numpy as np
import os
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error
import lightgbm as lgb
import datetime

# ============================
# 1. Load Data
# ============================
print("Loading data from DB...")
DB_PATH = r"src\db\polish_cars.db"
TABLE = "cars"

conn = sqlite3.connect(DB_PATH)
df = pd.read_sql(f"SELECT * FROM {TABLE}", conn)
conn.close()

print(f"Loaded {len(df)} rows from {TABLE}")

# ============================
# 2. Clean & Filter
# ============================
print("Cleaning and filtering data...")

# Clean Price Fields
df["price"] = pd.to_numeric(df["price"], errors="coerce")
#df['price'] = df['price'].str.replace('[\$,PLN]', '', regex=True).str.replace(' ', '').astype(float)

# Drop rows with missing target
df = df[df["price"].notnull() & (df["price"] > 1000) & (df["make"] != '')]

current_year = datetime.datetime.now().year

# Remove any non-digit characters just in case
#df['year'] = df['year'].astype(str).str.extract('(\d{4})')[0]

# Convert to numeric (coerce errors to NaN)
df['year'] = pd.to_numeric(df['year'], errors='coerce')

df['age'] = current_year - df['year']

num_features = ["age", "mileage"]
cat_features = ["model", "fuelType", "transmission"]

# Impute missing values
df[num_features] = df[num_features].fillna(df[num_features].median())
df[cat_features] = df[cat_features].fillna("unknown")

# ============================
# 3. Prepare output folders
# ============================
MODEL_DIR = r"models/make_level"
os.makedirs(MODEL_DIR, exist_ok=True)
LOG_FILE = os.path.join(MODEL_DIR, "make_level_MAE_log.txt")

# Clear previous log
with open(LOG_FILE, "w") as f:
    f.write("Make-Level Model MAE Log\n\n")

# ============================
# 4. Train Make-Level Models
# ============================
makes = df["make"].unique()
for make in makes:
    df_make = df[df["make"] == make]
    if len(df_make) < 20:  # skip makes with too few rows
        continue

    print(f"Training model for make: {make} ({len(df_make)} rows)")

    X = df_make[num_features + cat_features]
    y = np.log1p(df_make["price"])  # log-transform

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", "passthrough", num_features),
            ("cat", OneHotEncoder(handle_unknown="ignore"), cat_features)
        ]
    )

    model = lgb.LGBMRegressor(
        n_estimators=500,
        learning_rate=0.05,
        max_depth=-1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42
    )

    pipe = Pipeline([
        ("pre", preprocessor),
        ("model", model)
    ])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    pipe.fit(X_train, y_train)
    y_pred = pipe.predict(X_test)
    mae = mean_absolute_error(np.expm1(y_test), np.expm1(y_pred))

    # Save model
    model_path = os.path.join(MODEL_DIR, f"{make}.pkl")
    joblib.dump(pipe, model_path)

    # Log results
    with open(LOG_FILE, "a") as f:
        f.write(f"{make}: MAE = {mae:.2f} PLN ({len(df_make)} rows) -> {model_path}\n")

    print(f"{make}: MAE = {mae:.2f} PLN, model saved to {model_path}")

print("All make-level models trained and logged.")
