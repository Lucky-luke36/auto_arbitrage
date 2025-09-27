// backend/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const { openDbs } = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS for local dev. In prod restrict origin.
app.use(cors());
app.use(express.json());

// open DBs
const { kijijiDb, polishDb } = openDbs();

// mount routes
const kijijiRouter = require("./routes/kijiji")({ kijijiDb, polishDb });
const polishRouter = require("./routes/polish")({ polishDb });

app.use("/api/kijiji", kijijiRouter);
app.use("/api/polish", polishRouter);

// simple convert endpoint (CAD -> PLN) with fixed multiplier 2.62
app.get("/api/convert", (req, res) => {
  const cad = Number(req.query.cad || 0);
  const rate = 2.62;
  res.json({ cad, rate, pln: Math.round(cad * rate * 100) / 100 });
});

// Optionally serve a built frontend from ../frontend (if you build it)
const frontendBuild = path.resolve(__dirname, "..", "frontend", "build");
app.use(express.static(frontendBuild));
app.get("*", (req, res) => {
  // serve index.html if exists, otherwise return 404 for unknown API routes
  if (req.path.startsWith("/api/"))
    return res.status(404).json({ error: "Not found" });
  res.sendFile(path.join(frontendBuild, "index.html"), (err) => {
    if (err) res.status(404).send("Not found");
  });
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
