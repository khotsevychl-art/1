import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import { applyMigrations } from "./migrations";
import { seedDatabase } from "./seed";

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

export const dbPath = path.join(dataDir, "app.db");
export const db = new sqlite3.Database(dbPath);

export function run(sql: string): Promise<{ changes: number; lastID: number }> {
  console.log(`[DB] RUN: ${sql.slice(0, 120).replace(/\s+/g, " ")}`);
  return new Promise((resolve, reject) => {
    db.run(sql, function (this: sqlite3.RunResult, err: Error | null) {
      if (err) reject(err);
      else resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
}

export function get<T>(sql: string): Promise<T | undefined> {
  console.log(`[DB] GET: ${sql.slice(0, 120).replace(/\s+/g, " ")}`);
  return new Promise((resolve, reject) => {
    db.get(sql, (err: Error | null, row: unknown) => {
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });
}

export function all<T>(sql: string): Promise<T[]> {
  console.log(`[DB] ALL: ${sql.slice(0, 120).replace(/\s+/g, " ")}`);
  return new Promise((resolve, reject) => {
    db.all(sql, (err: Error | null, rows: unknown[]) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

export async function initDatabase(): Promise<void> {
  await run("PRAGMA foreign_keys = ON");
  await run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `);
  await applyMigrations();
  await seedDatabase();
}
