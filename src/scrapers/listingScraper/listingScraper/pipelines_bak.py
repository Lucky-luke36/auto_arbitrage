import sqlite3

class SQLitePipeline:
    def open_spider(self, spider):
        # Open DB connection and create table if it doesn't exist
        self.connection = sqlite3.connect("cars.db")
        self.cursor = self.connection.cursor()
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS cars (
                id INTEGER PRIMARY KEY,
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
        ''')
        self.connection.commit()

    def close_spider(self, spider):
        # Close DB connection when spider finishes
        self.connection.close()

    def process_item(self, item, spider):
        # Insert item into DB, ignore if link already exists
        self.cursor.execute("""
            INSERT INTO cars (
                link, title, price, currency, mileage, mileage_unit,
                transmission, fuelType, source, year, make, model, trim, manual_review
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(link) DO UPDATE SET
                price = excluded.price
            WHERE excluded.price != cars.price
        """, (
            item['link'], item['title'], item['price'], item['currency'],
            item['mileage'], item['mileage_unit'], item['transmission'], item['fuelType'],
            item['source'], item['year'], item['make'], item['model'], item['trim'],
            item['manual_review']
        ))
        self.connection.commit()
        return item
