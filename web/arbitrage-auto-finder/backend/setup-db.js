const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Database file paths - update these to match your server.js configuration
const KIJIJI_DB_PATH = './kijiji_cars.db';
const POLISH_DB_PATH = './polish_cars.db';

// Sample data (from your current mock data)
const sampleKijijiCars = [
  { id: 'k1', make: 'BMW', model: '320i', year: 2018, price: 28500, mileage: 95000, location: 'Toronto, ON' },
  { id: 'k2', make: 'Audi', model: 'A4', year: 2019, price: 32000, mileage: 78000, location: 'Vancouver, BC' },
  { id: 'k3', make: 'Mercedes-Benz', model: 'C300', year: 2017, price: 30000, mileage: 105000, location: 'Calgary, AB' },
  { id: 'k4', make: 'BMW', model: '320i', year: 2018, price: 27000, mileage: 112000, location: 'Montreal, QC' },
  { id: 'k5', make: 'Volkswagen', model: 'Golf GTI', year: 2020, price: 29500, mileage: 45000, location: 'Ottawa, ON' },
  { id: 'k6', make: 'Audi', model: 'A4', year: 2019, price: 31500, mileage: 82000, location: 'Edmonton, AB' }
];

const samplePolishCars = [
  { id: 'p1', make: 'BMW', model: '320i', year: 2018, price: 95000, mileage: 85000, location: 'Warsaw' },
  { id: 'p2', make: 'BMW', model: '320i', year: 2018, price: 88000, mileage: 120000, location: 'Krakow' },
  { id: 'p3', make: 'BMW', model: '320i', year: 2018, price: 92000, mileage: 95000, location: 'Gdansk' },
  { id: 'p4', make: 'BMW', model: '320i', year: 2018, price: 89500, mileage: 110000, location: 'Wroclaw' },
  { id: 'p5', make: 'Audi', model: 'A4', year: 2019, price: 105000, mileage: 70000, location: 'Warsaw' },
  { id: 'p6', make: 'Audi', model: 'A4', year: 2019, price: 98000, mileage: 95000, location: 'Poznan' },
  { id: 'p7', make: 'Audi', model: 'A4', year: 2019, price: 110000, mileage: 65000, location: 'Krakow' },
  { id: 'p8', make: 'Mercedes-Benz', model: 'C300', year: 2017, price: 85000, mileage: 130000, location: 'Warsaw' },
  { id: 'p9', make: 'Mercedes-Benz', model: 'C300', year: 2017, price: 92000, mileage: 95000, location: 'Gdansk' },
  { id: 'p10', make: 'Volkswagen', model: 'Golf GTI', year: 2020, price: 78000, mileage: 35000, location: 'Warsaw' },
  { id: 'p11', make: 'Volkswagen', model: 'Golf GTI', year: 2020, price: 82000, mileage: 45000, location: 'Krakow' }
];

function createKijijiDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(KIJIJI_DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log(`📊 Creating Kijiji database at ${KIJIJI_DB_PATH}`);
    });

    // Create table
    db.run(`
      CREATE TABLE IF NOT EXISTS kijiji_cars (
        id TEXT PRIMARY KEY,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER NOT NULL,
        price INTEGER NOT NULL,
        mileage INTEGER NOT NULL,
        location TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('✅ Kijiji cars table created');
    });

    // Insert sample data
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO kijiji_cars (id, make, model, year, price, mileage, location)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    sampleKijijiCars.forEach(car => {
      stmt.run(car.id, car.make, car.model, car.year, car.price, car.mileage, car.location);
    });

    stmt.finalize((err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log(`✅ Inserted ${sampleKijijiCars.length} Kijiji cars`);
      
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

function createPolishDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(POLISH_DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log(`🇵🇱 Creating Polish database at ${POLISH_DB_PATH}`);
    });

    // Create table
    db.run(`
      CREATE TABLE IF NOT EXISTS polish_cars (
        id TEXT PRIMARY KEY,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER NOT NULL,
        price INTEGER NOT NULL,
        mileage INTEGER NOT NULL,
        location TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('✅ Polish cars table created');
    });

    // Insert sample data
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO polish_cars (id, make, model, year, price, mileage, location)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    samplePolishCars.forEach(car => {
      stmt.run(car.id, car.make, car.model, car.year, car.price, car.mileage, car.location);
    });

    stmt.finalize((err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log(`✅ Inserted ${samplePolishCars.length} Polish cars`);
      
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

async function setupDatabases() {
  try {
    console.log('🚗 Setting up Car Arbitrage databases...\n');
    
    await createKijijiDatabase();
    await createPolishDatabase();
    
    console.log('\n🎉 Database setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Run "npm start" to start the API server');
    console.log('2. Update your frontend to use the API endpoints');
    console.log('3. Replace the database paths in server.js with your actual .db files');
    console.log('\n📡 Test your API:');
    console.log('   curl http://localhost:3001/api/kijiji-cars');
    console.log('   curl http://localhost:3001/api/polish-cars');
    
  } catch (error) {
    console.error('❌ Error setting up databases:', error.message);
    process.exit(1);
  }
}

// Run setup
setupDatabases();