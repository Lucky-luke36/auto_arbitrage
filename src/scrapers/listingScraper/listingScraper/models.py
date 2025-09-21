import sqlite3

class SQLitePipeline:
    def open_spider(self, spider):
        self.connection = sqlite3.connect("cars.db")
        self.cursor = self.connection.cursor()

        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS cars (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                price NUMERIC,
                currency TEXT,
                mileage NUMERIC,
                mileage_unit TEXT,
                transmission TEXT,
                fuelType TEXT,
                source TEXT,
                link TEXT UNIQUE,
                scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        self.connection.commit()

    def close_spider(self, spider):
        self.connection.close()
