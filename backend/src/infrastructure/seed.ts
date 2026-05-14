import { db } from "./db";

export const seedDatabase = () => {
  console.log("[INFO] Start seed");

  db.serialize(() => {
    db.run(`
      INSERT OR IGNORE INTO users (id, name, created_at)
      VALUES ('1', 'Student', datetime('now'))
    `);

    db.run(`
      INSERT OR IGNORE INTO courses (id, name)
      VALUES 
        ('1', 'Math'),
        ('2', 'ITK'),
        ('3', 'Security')
    `);
  });

  console.log("[INFO] Seed completed");
};