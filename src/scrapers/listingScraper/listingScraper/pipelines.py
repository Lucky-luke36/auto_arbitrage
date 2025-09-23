import sqlite3
import os

class SQLitePipeline:
    def open_spider(self, spider):
        # Keep a dictionary of connections per source
        self.connections = {}
        self.cursors = {}

    def close_spider(self, spider):
        # Close all DB connections
        for conn in self.connections.values():
            conn.close()

    def get_connection(self, source):
        # Return a connection for a given source, creating DB/table if needed
        if source not in self.connections:
            db_name = f"{source}.db"
            conn = sqlite3.connect(db_name)
            cursor = conn.cursor()
            cursor.execute('''
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
            conn.commit()
            self.connections[source] = conn
            self.cursors[source] = cursor
        return self.connections[source], self.cursors[source]

    def process_item(self, item, spider):
        conn, cursor = self.get_connection(item['source'])

        cursor.execute("""
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
        conn.commit()
        return item
