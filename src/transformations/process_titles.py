import sqlite3
from utils.title_parser import parse_title

DB_PATH = r"C:\Users\lukas\Documents\Car_Arbitrage\src\scrapers\listingScraper\kijiji.db"
DEBUG_MODE = True  # toggle for manual review

def process_titles():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Select rows where make is missing OR manual review is needed
    cursor.execute("""
        SELECT id, title, year
        FROM cars
        WHERE make IS NULL OR make = ''
    """)
    rows = cursor.fetchall()
    print(f"Found {len(rows)} rows to process.")

    for row_id, title, current_year in rows:
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

        # Only update year if it’s currently empty
        new_year = parsed["year"] if not current_year else current_year

        cursor.execute("""
            UPDATE cars
            SET year = ?, make = ?, model = ?, trim = ?, manual_review = 0
            WHERE id = ?
        """, (new_year, parsed["make"], parsed["model"], parsed["trim"], row_id))

    conn.commit()
    conn.close()
    print("Processing complete.")


if __name__ == "__main__":
    process_titles()
