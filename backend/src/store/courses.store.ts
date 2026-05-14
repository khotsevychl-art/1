import { db } from "../infrastructure/db";

export class CoursesStore {

  getAll() {

    return new Promise((resolve, reject) => {

      db.all(`SELECT * FROM courses`, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });

    });
  }
}