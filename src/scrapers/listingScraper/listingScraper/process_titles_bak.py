import sqlite3
from utils.title_parser import parse_title

DB_PATH = r"C:\Users\lukas\Documents\Car_Arbitrage\src\scrapers\listingScraper\gratka.db"
DEBUG_MODE = True  # toggle for manual review

def process_titles():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Select rows without a make
    cursor.execute("""
        SELECT id, title
        FROM cars
        WHERE make IS NULL OR make = ''
    """)
    rows = cursor.fetchall()
    print(f"Found {len(rows)} rows to process.")

    for row_id, title in rows:
        parsed = parse_title(title)

        if not parsed["valid_make"]:
            if DEBUG_MODE:
                cursor.execute("""
                    UPDATE cars
                    SET manual_review = 1
                    WHERE id = ?
                """, (row_id,))
                print(f"Row {row_id} flagged for review: {title}")
            else:
                cursor.execute("DELETE FROM cars WHERE id = ?", (row_id,))
                print(f"Dropped row {row_id} (bad make: {parsed['make']})")
            continue

        # Update the row
        cursor.execute("""
            UPDATE cars
            SET year = ?, make = ?, model = ?, trim = ?, manual_review = 0
            WHERE id = ?
        """, (parsed["year"], parsed["make"], parsed["model"], parsed["trim"], row_id))

    conn.commit()
    conn.close()
    print("Processing complete.")

if __name__ == "__main__":
    process_titles()
