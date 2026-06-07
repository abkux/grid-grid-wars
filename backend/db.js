import Database from 'better-sqlite3';
import { DB_PATH, GRID_SIZE, TOTAL_CELLS } from './config.js';

const db = new Database(DB_PATH);

// Database schema, using SQLite for simplicity. In production, we will consider PostgreSQL or another robust DB.
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch())
  );
  CREATE TABLE IF NOT EXISTS cells (
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    owner_id TEXT,
    owner_name TEXT,
    owner_color TEXT,
    claimed_at INTEGER,
    locked_until INTEGER DEFAULT 0,
    PRIMARY KEY (x, y)
  );
  CREATE INDEX IF NOT EXISTS idx_cells_owner ON cells(owner_id);
`);

// Initial seed of the grid
const count = db.prepare('SELECT COUNT(*) as count FROM cells').get();
if (count.count === 0) {
  console.log('Initializing grid...');
  const insert = db.prepare('INSERT INTO cells (x, y) VALUES (?, ?)');
  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(row.x, row.y);
  });
  const rows = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      rows.push({ x, y });
    }
  }
  insertMany(rows);
  console.log(`Initialized ${TOTAL_CELLS} cells`);
}

export default db;
