// backend/routes/polish.js
const express = require("express");
const router = express.Router();

/**
 * GET /api/polish
 * Query params:
 *   make, model, year (required)
 *   mileage (optional) - will center results around this value
 *   radius (optional, default 30000) - +/- mileage window
 *   limit (optional, default 500)
 *
 * Response:
 *  { count, avg_price, min_price, max_price, rows: [...] }
 */
module.exports = ({ polishDb }) => {
  const baseQuery = `
    SELECT id, title, price, mileage, currency, make, model, year, link
    FROM cars
    WHERE make = ? AND model = ? AND year = ?
  `;

  // We'll sort by absolute mileage difference if mileage provided
  const rangedQuery = `
    SELECT id, title, price, mileage, currency, make, model, year, link
    FROM cars
    WHERE make = ? AND model = ? AND year = ?
      AND mileage BETWEEN ? AND ?
    ORDER BY ABS(mileage - ?) ASC
    LIMIT ?
  `;

  const statsQuery = `
    SELECT COUNT(*) AS cnt, AVG(price) AS avg_price, MIN(price) AS min_price, MAX(price) AS max_price
    FROM cars
    WHERE make = ? AND model = ? AND year = ?
      AND mileage BETWEEN ? AND ?
  `;

  // fallback stats without mileage filter
  const statsNoMileageQuery = `
    SELECT COUNT(*) AS cnt, AVG(price) AS avg_price, MIN(price) AS min_price, MAX(price) AS max_price
    FROM cars
    WHERE make = ? AND model = ? AND year = ?
  `;

  router.get("/", (req, res) => {
    try {
      const { make, model, year } = req.query;
      if (!make || !model || !year) {
        return res
          .status(400)
          .json({ error: "make, model and year are required" });
      }

      const mileage = req.query.mileage
        ? parseInt(req.query.mileage, 10)
        : null;
      const radius = req.query.radius ? parseInt(req.query.radius, 10) : 30000;
      const limit = req.query.limit
        ? Math.min(1000, parseInt(req.query.limit, 10))
        : 500;

      let rows = [];
      let stats = { cnt: 0, avg_price: null, min_price: null, max_price: null };

      if (mileage !== null && !Number.isNaN(mileage)) {
        rows = polishDb
          .prepare(rangedQuery)
          .all(
            make,
            model,
            year,
            Math.max(0, mileage - radius),
            mileage + radius,
            mileage,
            limit
          );
        stats =
          polishDb
            .prepare(statsQuery)
            .get(
              make,
              model,
              year,
              Math.max(0, mileage - radius),
              mileage + radius
            ) || stats;
      } else {
        rows = polishDb
          .prepare(baseQuery + " LIMIT ?")
          .all(make, model, year, limit);
        stats =
          polishDb.prepare(statsNoMileageQuery).get(make, model, year) || stats;
      }

      // convert possible null avg_price to number
      if (stats.avg_price !== null) stats.avg_price = Number(stats.avg_price);

      res.json({
        params: { make, model, year, mileage, radius, limit },
        count: stats.cnt || rows.length,
        avg_price: stats.avg_price,
        min_price: stats.min_price,
        max_price: stats.max_price,
        rows,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: String(err) });
    }
  });

  return router;
};
