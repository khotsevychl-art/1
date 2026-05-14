import { db } from "../infrastructure/db";
import { randomUUID } from "crypto";

export class NotesStore {

  getAll(courseId?: string, sort = "created_at") {
    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM notes`;

      if (courseId) {
        sql += ` WHERE course_id='${courseId}'`;
      }

      sql += ` ORDER BY ${sort} DESC LIMIT 10`;

      db.all(sql, (err, rows) => {
        if (err) {
          console.log("SQL ERROR (getAll):", err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getById(id: string) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM notes WHERE id='${id}'`,
        (err, row) => {
          if (err) {
            console.log("SQL ERROR (getById):", err);
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  create(note: any) {
  console.log("CREATE NOTE INPUT:", note);

  return new Promise((resolve, reject) => {
    const id = randomUUID();
    const createdAt = new Date().toISOString();

    const sql = `
      INSERT INTO notes(
        id, user_id, course_id, title, note, created_at
      )
      VALUES(
        '${id}',
        '1',
        '${note.courseId}',
        '${note.title}',
        '${note.note}',
        '${createdAt}'
      )
    `;

    db.run(sql, (err) => {
      if (err) {
        console.log("SQL ERROR (create):", err);
        reject(err);
      } else {
        resolve({
          id,
          userId: "1",
          courseId: note.courseId,
          title: note.title,
          note: note.note,
          createdAt
        });
      }
    });
  });
}

  update(id: string, note: any) {
    return new Promise((resolve, reject) => {
      db.run(
        `
        UPDATE notes
        SET
          course_id='${note.courseId}',
          title='${note.title}',
          note='${note.note}'
        WHERE id='${id}'
        `,
        (err) => {
          if (err) {
            console.log("SQL ERROR (update):", err);
            reject(err);
          } else {
            resolve(note);
          }
        }
      );
    });
  }

  delete(id: string) {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM notes WHERE id='${id}'`,
        (err) => {
          if (err) {
            console.log("SQL ERROR (delete):", err);
            reject(err);
          } else {
            resolve(true);
          }
        }
      );
    });
  }

  getWithRelations() {
    return new Promise((resolve, reject) => {
      db.all(
        `
        SELECT
          notes.id,
          notes.title,
          notes.note,
          users.name AS userName,
          courses.name AS courseName
        FROM notes
        JOIN users ON users.id = notes.user_id
        JOIN courses ON courses.id = notes.course_id
        `,
        (err, rows) => {
          if (err) {
            console.log("SQL ERROR (relations):", err);
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  getStats() {
    return new Promise((resolve, reject) => {
      db.all(
        `
        SELECT course_id, COUNT(*) as total
        FROM notes
        GROUP BY course_id
        `,
        (err, rows) => {
          if (err) {
            console.log("SQL ERROR (stats):", err);
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }
}