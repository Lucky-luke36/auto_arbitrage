import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

# --- CONFIG ---
DB_PATH = "src/db/polish_cars.db"   # update with your DB path
SQL_QUERY = """
SELECT make, model, year, mileage, price
FROM cars
WHERE make = ?
  AND model = ?
  AND year = ?
  AND price > 3000;
"""

# --- INPUT ---
MAKE = "Volkswagen"
MODEL = "Golf"
YEAR = 2023

# --- DB QUERY ---
conn = sqlite3.connect(DB_PATH)
df = pd.read_sql_query(SQL_QUERY, conn, params=(MAKE, MODEL, YEAR))
conn.close()

# --- OUTPUT DATA ---
print(f"Retrieved {len(df)} rows for {MAKE} {MODEL} {YEAR}:")
print(df.head())

# --- SCATTERPLOT ---
plt.figure(figsize=(8, 6))
plt.scatter(df["mileage"], df["price"], alpha=0.6, edgecolors="k")
plt.title(f"{MAKE} {MODEL} {YEAR} - Mileage vs Price")
plt.xlabel("Mileage (km)")
plt.ylabel("Price (PLN)")
plt.grid(True, linestyle="--", alpha=0.5)
plt.show()
