// backend/routes/kijiji.js
const express = require("express");
const router = express.Router();

/**
 * GET /api/kijiji
 * Query params:
 *   page (default 1), limit (default 50)
 *
 * Returns:
 *  [{ id, make, model, year, price, mileage, link, match_count }, ...]
 */
module.exports = ({ kijijiDb, polishDb }) => {
  // prepared statements for performance
  const selectKijiji = kijijiDb.prepare(`
    SELECT id, make, model, year, price, mileage, link
    FROM cars
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `);

  const countMatches = polishDb.prepare(`
    SELECT COUNT(*) as cnt
    FROM cars
    WHERE make = ? AND model = ? AND year = ?
  `);

  router.get("/", (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page || "1", 10));
      const limit = Math.min(200, parseInt(req.query.limit || "50", 10)); // cap limit
      const offset = (page - 1) * limit;

      const rows = selectKijiji.all(limit, offset);

      // compute match_count per row (fast due to prepared statement)
      const result = rows.map((r) => {
        const make = r.make || "";
        const model = r.model || "";
        const year = r.year || null;
        let cnt = 0;
        if (make && model && year) {
          try {
            const row = countMatches.get(make, model, year);
            cnt = row ? row.cnt : 0;
          } catch (e) {
            cnt = 0;
          }
        }
        return { ...r, match_count: cnt };
      });

      res.json({ page, limit, count: result.length, data: result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: String(err) });
    }
  });

  return router;
};
