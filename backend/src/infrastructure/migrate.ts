import fs from "fs";
import path from "path";
import { db } from "./db";

export const runMigrations = () => {
  return new Promise<void>((resolve, reject) => {

    const dir = path.join(process.cwd(), "src/infrastructure/migrations");
    const files = fs.readdirSync(dir).sort();

    db.serialize(() => {

      files.forEach((file) => {

        const sql = fs.readFileSync(path.join(dir, file), "utf-8");

        db.exec(sql, (err) => {
          if (err) {
            console.error("Migration error:", file, err.message);
            reject(err);
          } else {
            console.log("Applied:", file);
          }
        });

      });

      resolve();
    });
  });
};