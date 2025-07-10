const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

// Pastikan folder `db/` sudah ada
const dbDir = path.join(__dirname, "db");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log("📁 Folder 'db/' dibuat.");
}

// Load JSON bootstrap-data
const bootstrapPath = path.join(__dirname, "data/bootstrap-data.json");
if (!fs.existsSync(bootstrapPath)) {
  console.error("❌ File 'bootstrap-data.json' tidak ditemukan.");
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(bootstrapPath, "utf-8"));

// Inisialisasi SQLite
const db = new Database(path.join(dbDir, "database.sqlite"));

// ─────────────────────────────
// CREATE TABLES
// ─────────────────────────────
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE,
  password TEXT
);

CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY,
  name TEXT
);

CREATE TABLE IF NOT EXISTS devices (
  id INTEGER PRIMARY KEY,
  name TEXT,
  uuid TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  room_id INTEGER NOT NULL,
  device_uuid TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`);

// ─────────────────────────────
// INSERT PRELOAD DATA
// ─────────────────────────────
const insertUser = db.prepare(
  `INSERT OR REPLACE INTO users (id, username, password) VALUES (@id, @username, @password)`
);
const insertRoom = db.prepare(
  `INSERT OR REPLACE INTO rooms (id, name) VALUES (@id, @name)`
);
const insertDevice = db.prepare(
  `INSERT OR REPLACE INTO devices (id, name, uuid) VALUES (@id, @name, @uuid)`
);

data.users?.forEach((user) => insertUser.run(user));
data.rooms?.forEach((room) => insertRoom.run(room));
data.devices?.forEach((device) => insertDevice.run(device));

console.log("✅ Bootstrap preload selesai.");
