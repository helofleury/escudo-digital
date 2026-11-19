import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function init(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('escudo-digital.db');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'basico',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS kv (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      kind TEXT NOT NULL,
      content TEXT NOT NULL,
      label TEXT NOT NULL,
      risk_level TEXT NOT NULL,
      score REAL NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      summary TEXT NOT NULL,
      advice TEXT NOT NULL,
      findings_json TEXT NOT NULL,
      extracted_text TEXT,
      demo_ocr INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tips_read (
      user_id INTEGER NOT NULL,
      item_id TEXT NOT NULL,
      PRIMARY KEY (user_id, item_id)
    );
  `);
  return db;
}

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbPromise === null) dbPromise = init();
  return dbPromise;
}
