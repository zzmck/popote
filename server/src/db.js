const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { DATA_DIR } = require('./config');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new Database(path.join(DATA_DIR, 'popote.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS popotes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  mission TEXT DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  popote_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'autre',
  price REAL NOT NULL DEFAULT 0,
  stock_reserve INTEGER NOT NULL DEFAULT 0,
  fridge_qty INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  popote_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  popote_id TEXT NOT NULL,
  type TEXT NOT NULL,
  member_id TEXT,
  payer_id TEXT,
  items TEXT,
  drinkers TEXT,
  amount REAL NOT NULL DEFAULT 0,
  payment_method TEXT,
  note TEXT,
  timestamp INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS shopping_manual (
  id TEXT PRIMARY KEY,
  popote_id TEXT NOT NULL,
  name TEXT NOT NULL,
  note TEXT DEFAULT '',
  done INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS popotiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT,
  pin_salt TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'popotier',
  popote_id TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  popote_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  packs INTEGER NOT NULL DEFAULT 0,
  pack_size INTEGER NOT NULL DEFAULT 1,
  pack_cost REAL NOT NULL DEFAULT 0,
  total_cost REAL NOT NULL DEFAULT 0,
  note TEXT DEFAULT '',
  actor_id TEXT,
  actor_name TEXT,
  timestamp INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cash_adjustments (
  id TEXT PRIMARY KEY,
  popote_id TEXT NOT NULL,
  amount REAL NOT NULL,
  reason TEXT DEFAULT '',
  actor_id TEXT,
  actor_name TEXT,
  timestamp INTEGER NOT NULL
);
`);

function tryAlter(sql) {
  try { db.exec(sql); } catch (e) { if (!/duplicate column/i.test(e.message)) throw e; }
}
tryAlter("ALTER TABLE products ADD COLUMN pack_size INTEGER NOT NULL DEFAULT 1");
tryAlter("ALTER TABLE products ADD COLUMN pack_cost REAL NOT NULL DEFAULT 0");
tryAlter("ALTER TABLE products ADD COLUMN unit_cost REAL NOT NULL DEFAULT 0");
tryAlter("ALTER TABLE products ADD COLUMN created_by_id TEXT");
tryAlter("ALTER TABLE products ADD COLUMN created_by_name TEXT");
tryAlter("ALTER TABLE popotes ADD COLUMN created_by_id TEXT");
tryAlter("ALTER TABLE popotes ADD COLUMN created_by_name TEXT");
tryAlter("ALTER TABLE members ADD COLUMN created_by_id TEXT");
tryAlter("ALTER TABLE members ADD COLUMN created_by_name TEXT");
tryAlter("ALTER TABLE transactions ADD COLUMN created_by_id TEXT");
tryAlter("ALTER TABLE transactions ADD COLUMN created_by_name TEXT");
tryAlter("ALTER TABLE transactions ADD COLUMN beneficiaries TEXT");
tryAlter("ALTER TABLE popotiers ADD COLUMN role TEXT NOT NULL DEFAULT 'popotier'");
tryAlter("ALTER TABLE popotiers ADD COLUMN popote_id TEXT");
tryAlter("ALTER TABLE popotiers ADD COLUMN username TEXT");
tryAlter("ALTER TABLE purchases ADD COLUMN items TEXT");
tryAlter("ALTER TABLE popotes ADD COLUMN code TEXT");
tryAlter("ALTER TABLE products ADD COLUMN bottle_open INTEGER NOT NULL DEFAULT 0");
tryAlter("ALTER TABLE transactions ADD COLUMN pending INTEGER NOT NULL DEFAULT 0");


const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function genPopoteCode() {
  for (;;) {
    let code = '';
    for (let i = 0; i < 6; i++) code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    if (!db.prepare('SELECT id FROM popotes WHERE code=?').get(code)) return code;
  }
}

for (const p of db.prepare('SELECT id FROM popotes WHERE code IS NULL OR code=\'\'').all()) {
  db.prepare('UPDATE popotes SET code=? WHERE id=?').run(genPopoteCode(), p.id);
}

db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_popotiers_username ON popotiers(username COLLATE NOCASE)");

const now = () => Date.now();

function getConfig(key, fallback) {
  const row = db.prepare('SELECT value FROM config WHERE key=?').get(key);
  return row ? JSON.parse(row.value) : fallback;
}
function setConfig(key, value) {
  db.prepare('INSERT INTO config(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value')
    .run(key, JSON.stringify(value));
}

module.exports = { db, now, genPopoteCode, getConfig, setConfig };
