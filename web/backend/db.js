// backend/db.js
const path = require("path");
const Database = require("better-sqlite3");

// adjust these relative paths if your DBs are somewhere else
const KIJJI_DB = path.resolve(__dirname, "..", "db", "kijiji.db");
const POLISH_DB = path.resolve(__dirname, "..", "db", "polish_cars.db");

function openDbs() {
  const kijijiDb = new Database(KIJJI_DB, {
    readonly: true,
    fileMustExist: true,
  });
  const polishDb = new Database(POLISH_DB, {
    readonly: true,
    fileMustExist: true,
  });
  return { kijijiDb, polishDb };
}

module.exports = { openDbs };
