const Database = require('better-sqlite3');
const path = require('path');

// Use persistent disk in production, local file in development
const dbPath = process.env.NODE_ENV === 'production'
  ? '/data/nicmap.db'
  : path.join(__dirname, 'nicmap.db');

const db = new Database(dbPath);

// Create deals table
db.exec(`
  CREATE TABLE IF NOT EXISTS deals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    storeName TEXT NOT NULL,
    product TEXT NOT NULL,
    originalPrice REAL,
    salePrice REAL NOT NULL,
    location TEXT,
    zipCode TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    description TEXT,
    createdAt TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    reports INTEGER DEFAULT 0
  )
`);

module.exports = db;
