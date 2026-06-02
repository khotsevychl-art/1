import fs from "fs";
import path from "path";
import { all, run } from "./db";
import { sqlString } from "../utils/sql";

type MigrationRow = { id: string };

function splitSqlStatements(sql: string): string[] {
  return sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

export async function applyMigrations(): Promise<void> {
  const migrationsDir = path.join(process.cwd(), "src", "migrations");
  const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith(".sql")).sort();
  const applied = await all<MigrationRow>("SELECT id FROM schema_migrations");
  const appliedIds = new Set(applied.map((row) => row.id));

  for (const file of files) {
    if (appliedIds.has(file)) {
      console.log(`[MIGRATION] skipped ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    const statements = splitSqlStatements(sql);

    console.log(`[MIGRATION] applying ${file}`);
    for (const statement of statements) {
      await run(statement);
    }

    await run(
      `INSERT INTO schema_migrations (id, applied_at) VALUES (${sqlString(file)}, ${sqlString(new Date().toISOString())})`
    );
    console.log(`[MIGRATION] applied ${file}`);
  }
}
