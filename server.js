const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const app = express();
const port = 3000;

const db = new sqlite3.Database("db.sqlite");

// Setup DB
db.run(`CREATE TABLE IF NOT EXISTS checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  participant_id TEXT,
  status TEXT,
  device_id TEXT,
  timestamp TEXT
)`);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// API untuk menerima check-in
app.post("/sync-checkin", (req, res) => {
  const { participant_id, status, device_id, timestamp } = req.body;
  const sql = `INSERT INTO checkins (participant_id, status, device_id, timestamp)
               VALUES (?, ?, ?, ?)`;
  db.run(sql, [participant_id, status, device_id, timestamp], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// API untuk get semua check-in
app.get("/checkins", (req, res) => {
  db.all("SELECT * FROM checkins ORDER BY timestamp DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`Local check-in server listening at http://localhost:${port}`);
});
