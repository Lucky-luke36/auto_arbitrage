const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// ====== CONFIGURATION - UPDATE THESE PATHS TO YOUR DATABASE FILES ======
const KIJIJI_DB_PATH = "../../../db/kijiji.db"; // Change this to your kijiji database path
const POLISH_DB_PATH = "../../../db/polish_cars.db"; // Change this to your polish cars database path
// ========================================================================

// Middleware
app.use(cors());
app.use(express.json());

// Database connections
const kijijiDb = new sqlite3.Database(KIJIJI_DB_PATH, (err) => {
  if (err) {
    console.error("Error connecting to Kijiji database:", err.message);
  } else {
    console.log("Connected to Kijiji SQLite database.");
  }
});

const polishDb = new sqlite3.Database(POLISH_DB_PATH, (err) => {
  if (err) {
    console.error("Error connecting to Polish database:", err.message);
  } else {
    console.log("Connected to Polish SQLite database.");
  }
});

// API Routes

// Get all Kijiji cars
app.get("/api/kijiji-cars", (req, res) => {
  const query = `
    SELECT id, make, model, year, price, mileage
    FROM cars 
    WHERE length(model) > 0 AND price > 3000
    ORDER BY price DESC
  `;

  kijijiDb.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching Kijiji cars:", err.message);
      res.status(500).json({ error: "Failed to fetch Kijiji cars" });
      return;
    }
    res.json(rows);
  });
});

// Get all Polish cars
app.get("/api/polish-cars", (req, res) => {
  const query = `
    SELECT id, make, model, year, price, mileage
    FROM cars 
    WHERE price > 3000
    ORDER BY price DESC
  `;

  polishDb.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching Polish cars:", err.message);
      res.status(500).json({ error: "Failed to fetch Polish cars" });
      return;
    }
    res.json(rows);
  });
});

// Get Polish cars matching specific criteria
app.get("/api/polish-cars/matching", (req, res) => {
  const { make, model, year, mileage } = req.query;

  if (!make || !model || !year) {
    res
      .status(400)
      .json({ error: "Missing required parameters: make, model, year" });
    return;
  }

  const mileageNum = parseInt(mileage) || 0;
  const mileageRange = 30000; // ±30,000 km range

  const query = `
    SELECT id, make, model, year, price, mileage
    FROM polish_cars 
    WHERE make = ? AND model = ? AND year = ?
    AND (? = 0 OR (mileage BETWEEN ? AND ?))
    ORDER BY price ASC
  `;

  const params = [
    make,
    model,
    parseInt(year),
    mileageNum,
    mileageNum - mileageRange,
    mileageNum + mileageRange,
  ];

  polishDb.all(query, params, (err, rows) => {
    if (err) {
      console.error("Error fetching matching Polish cars:", err.message);
      res.status(500).json({ error: "Failed to fetch matching Polish cars" });
      return;
    }
    res.json(rows);
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(
    `🚗 Car Arbitrage API server running on http://localhost:${PORT}`
  );
  console.log(`📊 Kijiji DB: ${KIJIJI_DB_PATH}`);
  console.log(`🇵🇱 Polish DB: ${POLISH_DB_PATH}`);
  console.log("📡 API endpoints:");
  console.log(`   GET /api/kijiji-cars`);
  console.log(`   GET /api/polish-cars`);
  console.log(
    `   GET /api/polish-cars/matching?make=BMW&model=320i&year=2018&mileage=95000`
  );
  console.log(`   GET /api/health`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  kijijiDb.close((err) => {
    if (err) console.error("Error closing Kijiji database:", err.message);
    else console.log("Kijiji database connection closed.");
  });
  polishDb.close((err) => {
    if (err) console.error("Error closing Polish database:", err.message);
    else console.log("Polish database connection closed.");
  });
  process.exit(0);
});
