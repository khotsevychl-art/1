import fs from "fs";
import path from "path";
import { db, run } from "./db";

function exec(sql: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err: any) => (err ? reject(err) : resolve()));
  });
}

export const runMigrations = async () => {
  await run("PRAGMA foreign_keys = ON");

  const dir = path.join(process.cwd(), "src/infrastructure/migrations");
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((file: any) => file.endsWith(".sql")).sort() : [];

  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), "utf-8");
    await exec(sql);
    console.log("Applied:", file);
  }
};
