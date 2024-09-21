import { app } from 'electron';
import path from 'node:path';

import SQLite3 from 'sqlite3';

const dbPath = path.join(app.getPath('userData'), 'profiles.db');
const sqlite = SQLite3.verbose();

export function initDatabase(): SQLite3.Database {
  const db = new sqlite.Database(dbPath);

  db.run(`CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    avatar TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name)
  )`);

  return db;
}

export async function getProfile(db: SQLite3.Database, profileId: number): Promise<Profile> {
  return new Promise<Profile>((resolve, reject) => {
    db.get<Profile>('SELECT * FROM profiles WHERE id = ?', [profileId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

export async function getProfiles(db: SQLite3.Database): Promise<Profile[]> {
  return new Promise<Profile[]>((resolve, reject) => {
    db.all<Profile>('SELECT * FROM profiles', (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}
