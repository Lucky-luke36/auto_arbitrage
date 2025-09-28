# Car Arbitrage Backend API

A Node.js Express server that connects to SQLite databases and provides REST API endpoints for your car arbitrage dashboard.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set up sample databases** (optional - for testing)
   ```bash
   npm run setup-db
   ```

3. **Start the server**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

4. **Update your frontend** to use API calls instead of mock data

## 📊 Database Configuration

### Option 1: Use Your Existing SQLite Files

1. Open `server.js`
2. Update these paths at the top of the file:
   ```javascript
   const KIJIJI_DB_PATH = './path/to/your/kijiji_cars.db';
   const POLISH_DB_PATH = './path/to/your/polish_cars.db';
   ```

### Option 2: Import Your Data

If your data is in different tables or formats, you can:

1. **Copy your .db files** to the backend directory
2. **Update table names** in the SQL queries if needed
3. **Modify column names** in the SELECT statements to match your schema

**Required table structure:**
```sql
-- For kijiji_cars table
CREATE TABLE kijiji_cars (
  id TEXT PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price INTEGER NOT NULL,      -- Price in CAD
  mileage INTEGER NOT NULL,    -- Mileage in km
  location TEXT NOT NULL
);

-- For polish_cars table  
CREATE TABLE polish_cars (
  id TEXT PRIMARY KEY,
  make TEXT NOT NULL,  
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price INTEGER NOT NULL,      -- Price in PLN
  mileage INTEGER NOT NULL,    -- Mileage in km
  location TEXT NOT NULL
);
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/kijiji-cars` | Get all Kijiji car listings |
| GET | `/api/polish-cars` | Get all Polish car listings |
| GET | `/api/polish-cars/matching` | Get Polish cars matching criteria |
| GET | `/api/health` | Server health check |

### Example API Calls

```bash
# Get all Kijiji cars
curl http://localhost:3001/api/kijiji-cars

# Get all Polish cars  
curl http://localhost:3001/api/polish-cars

# Get matching Polish cars
curl "http://localhost:3001/api/polish-cars/matching?make=BMW&model=320i&year=2018&mileage=95000"
```

## 🔄 Data Migration

### From CSV files:
```sql
-- Import Kijiji data from CSV
.mode csv
.import kijiji_data.csv kijiji_cars

-- Import Polish data from CSV  
.import polish_data.csv polish_cars
```

### From existing SQLite database:
```sql
-- Attach your existing database
ATTACH DATABASE 'your_existing.db' AS source;

-- Copy data
INSERT INTO kijiji_cars SELECT * FROM source.your_kijiji_table;
INSERT INTO polish_cars SELECT * FROM source.your_polish_table;
```

## 🛠 Customization

### Adding New Endpoints

Add new routes in `server.js`:
```javascript
app.get('/api/custom-endpoint', (req, res) => {
  const query = 'SELECT * FROM your_table WHERE condition = ?';
  db.all(query, [req.query.param], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});
```

### Modifying Queries

Update the SQL queries in `server.js` to match your database schema:
```javascript
// Example: If your price column is named 'cost'
const query = `
  SELECT id, make, model, year, cost as price, mileage, location 
  FROM kijiji_cars 
  ORDER BY cost DESC
`;
```

## 🔍 Troubleshooting

### Common Issues

1. **Database not found**
   - Check file paths in `server.js`
   - Ensure .db files exist and are readable

2. **Port already in use**
   - Change PORT in `server.js` or set environment variable:
   ```bash
   PORT=3002 npm start
   ```

3. **CORS errors**
   - CORS is already enabled for all origins
   - If issues persist, check browser developer console

4. **Frontend can't connect**
   - Ensure backend server is running on http://localhost:3001
   - Check API_BASE_URL in `src/services/carApi.ts`

### Logging

The server logs all database operations and errors. Check the console output for debugging information.

## 📁 Project Structure

```
backend/
├── server.js          # Main Express server
├── setup-db.js        # Database setup script
├── package.json       # Dependencies and scripts
├── README.md          # This file
├── kijiji_cars.db     # Kijiji cars database (created by setup)
└── polish_cars.db     # Polish cars database (created by setup)
```

## 🚀 Production Deployment

For production use:

1. **Environment variables**: Use environment variables for database paths
2. **Error handling**: Add more robust error handling
3. **Authentication**: Add API authentication if needed  
4. **Rate limiting**: Add rate limiting for public APIs
5. **Logging**: Use proper logging libraries like Winston
6. **Database pooling**: Consider connection pooling for high traffic

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your database schema matches the expected structure
3. Check server logs for detailed error messages
4. Test API endpoints directly with curl or Postman