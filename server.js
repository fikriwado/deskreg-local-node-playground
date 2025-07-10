const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const db = new Database(path.join(__dirname, "db/database.sqlite"));

// Middleware
app.use(express.json());
app.use(express.static("public"));

// ──────────────── API ENDPOINTS ────────────────

// GET: Users
app.get("/users", (req, res) => {
  const rows = db.prepare("SELECT id, username FROM users").all();
  res.json(rows);
});

// GET: Rooms
app.get("/rooms", (req, res) => {
  const rows = db.prepare("SELECT * FROM rooms").all();
  res.json(rows);
});

// GET: Devices
app.get("/devices", (req, res) => {
  const rows = db.prepare("SELECT * FROM devices").all();
  res.json(rows);
});

// GET: Checkins
app.get("/checkins", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM checkins ORDER BY created_at ASC")
    .all();
  res.json(rows);
});

// POST: Checkin
app.post("/checkin", (req, res) => {
  const device_uuid = req.header("X-Device-UUID");
  const { name, type, room_id, created_at } = req.body;

  db.prepare(
    `INSERT INTO checkins (name, type, room_id, device_uuid, created_at) VALUES (?, ?, ?, ?, ?)`
  ).run(name, type, room_id, device_uuid, created_at);

  const data = { name, type, room_id, device_uuid, created_at };
  io.emit("checkin:new", data);

  res.json({ success: true });
});

// ──────────────── SOCKET.IO ────────────────

io.on("connection", (socket) => {
  console.log("🔌 Socket connected");
});

// ──────────────── START ────────────────

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Local Node running at http://localhost:${PORT}`);
});
