# transformations/merge_databases.py
import sqlite3
import os

DBS = [
    r"src\db\gratka.db",
    r"src\db\autotrader.pl.db",
]

MERGED_DB = r"src\db\polish_cars.db"

def merge_dbs(dbs, output_db):
    if os.path.exists(output_db):
        os.remove(output_db)

    out_conn = sqlite3.connect(output_db)
    out_cur = out_conn.cursor()

    # Create unified schema
    out_cur.execute("""
        CREATE TABLE IF NOT EXISTS cars (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            price INTEGER,
            currency TEXT,
            mileage INTEGER,
            mileage_unit TEXT,
            transmission TEXT,
            fuelType TEXT,
            source TEXT,
            link TEXT UNIQUE,
            year INTEGER,
            make TEXT,
            model TEXT,
            trim TEXT,
            manual_review INTEGER DEFAULT 0
        )
    """)

    for db in dbs:
        in_conn = sqlite3.connect(db)
        in_cur = in_conn.cursor()

        in_cur.execute("SELECT title, price, currency, mileage, mileage_unit, transmission, fuelType, source, link, year, make, model, trim, manual_review FROM cars")
        rows = in_cur.fetchall()

        for row in rows:
            try:
                out_cur.execute("""
                    INSERT OR IGNORE INTO cars
                    (title, price, currency, mileage, mileage_unit, transmission, fuelType, source, link, year, make, model, trim, manual_review)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, row)
            except Exception as e:
                print(f"Error inserting row from {db}: {e}")

        in_conn.close()

    out_conn.commit()
    out_conn.close()
    print(f"Merged {len(dbs)} DBs into {output_db}")

if __name__ == "__main__":
    merge_dbs(DBS, MERGED_DB)
