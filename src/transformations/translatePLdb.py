# transformations/normalize_fields.py
import sqlite3

# Fuel mappings
FUEL_MAP = {
    "benzyna": "gas",
    "benzyna + gaz": "gas+lpg",
    "cng": "cng",
    "diesel": "diesel",
    "inne": "other",
    "napęd elektryczny": "electric",
    "elektryczny": "electric",
    "technologia hybrydowa": "hybrid",
    "Hybrid": "hybrid",
}

# Transmission mappings
TRANSMISSION_MAP = {
    "automatyczna": "automatic",
    "manualna": "manual",
    "półautomatyczna": "semi-automatic",
    "manual": "manual",
    "automatic": "automatic"
}

def normalize_table(db_path: str):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    cur.execute("SELECT id, fuelType, transmission FROM cars")
    rows = cur.fetchall()

    for row_id, fuel, trans in rows:
        norm_fuel = FUEL_MAP.get(fuel.strip().lower(), fuel) if fuel else None
        norm_trans = TRANSMISSION_MAP.get(trans.strip().lower(), trans) if trans else None

        cur.execute("""
            UPDATE cars
            SET fuelType = ?, transmission = ?
            WHERE id = ?
        """, (norm_fuel, norm_trans, row_id))

    conn.commit()
    conn.close()
    print(f"Normalization complete for {db_path}")

if __name__ == "__main__":
    # Example usage
    normalize_table(r"src\db\gratka.db")
    normalize_table(r"src\db\autotrader.pl.db")
