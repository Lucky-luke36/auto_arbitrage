import sqlite3
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error
import lightgbm as lgb

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

# Convert price column to numeric, forcing errors to NaN
df["price"] = pd.to_numeric(df["price"], errors="coerce")

# Drop rows with missing target
df = df[df["price"].notnull() & (df["price"] > 1000) & (df["make"] != '')]

# Features
num_features = ["year", "mileage"]
cat_features = ["make", "model", "fuelType", "transmission"]

# Drop rows with missing key fields
#df = df.dropna(subset=num_features + cat_features)

# Impute missing numerical values with median
df[num_features] = df[num_features].fillna(df[num_features].median())
# Impute missing categorical values with 'unknown'
df[cat_features] = df[cat_features].fillna("unknown")

# Target → log(price)
y = np.log1p(df["price"])  # log1p handles 0 safely
X = df[num_features + cat_features]


# ============================
# 3. Preprocessing
# ============================
print("Setting up preprocessing...")
preprocessor = ColumnTransformer(
    transformers=[
        ("num", "passthrough", num_features),
        ("cat", OneHotEncoder(handle_unknown="ignore"), cat_features)
    ]
)


# ============================
# 4. Model
# ============================
print("Setting up model...")
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


# ============================
# 5. Train/Test Split
# ============================
print("Training model...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

pipe.fit(X_train, y_train)
y_pred = pipe.predict(X_test)

mae = mean_absolute_error(np.expm1(y_test), np.expm1(y_pred))
print(f"Validation MAE: {mae:.2f} PLN")


# ============================
# 6. Save Model
# ============================
print("Saving model...")
MODEL_PATH = r".\src\algos\models\global_GMB_model.pkl"
joblib.dump(pipe, MODEL_PATH)
print(f"Model saved to {MODEL_PATH}")


# ============================
# 7. Example Scoring
# ============================
print("Example prediction...")
example = {
    "year": 2016,
    "mileage": 120000,
    "engine_size": 1998,
    "power": 150,
    "make": "Opel",
    "model": "Insignia",
    "fuelType": "gas",
    "transmission": "manual"
}

example_df = pd.DataFrame([example])
pred_price = np.expm1(pipe.predict(example_df))[0]

print(f"Predicted price: {pred_price:.2f} PLN")
