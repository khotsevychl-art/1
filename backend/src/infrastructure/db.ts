import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

export const dbPath = path.join(dataDir, "app.db");
export const db = new sqlite3.Database(dbPath);

db.run("PRAGMA foreign_keys = ON");

export function run(sql: string, params: unknown[] = []): Promise<{ changes: number; lastID: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (this: sqlite3.RunResult, err: Error | null) {
      if (err) reject(err);
      else resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
}

export function get<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err: Error | null, row: unknown) => {
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });
}

export function all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err: Error | null, rows: unknown[]) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}
