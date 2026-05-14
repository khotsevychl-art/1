import { db } from "../infrastructure/db";

export class UsersStore {

  getAll() {

    return new Promise((resolve, reject) => {

      db.all(
        `SELECT * FROM users ORDER BY created_at DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );

    });
  }

  getById(id: string) {

    return new Promise((resolve, reject) => {

      db.get(
        `SELECT * FROM users WHERE id='${id}'`,
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );

    });
  }

  create(user: any) {

    return new Promise((resolve, reject) => {

      db.run(
        `
        INSERT INTO users(id, name, created_at)
        VALUES('${user.id}', '${user.name}', '${user.createdAt}')
        `,
        (err) => {
          if (err) reject(err);
          else resolve(user);
        }
      );

    });
  }

  delete(id: string) {

    return new Promise((resolve, reject) => {

      db.run(
        `DELETE FROM users WHERE id='${id}'`,
        (err) => {
          if (err) reject(err);
          else resolve(true);
        }
      );

    });
  }
}