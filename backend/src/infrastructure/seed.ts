import { run } from "./db";

export const seedDatabase = async () => {
  console.log("[INFO] Start seed");

  await run(
    `INSERT OR IGNORE INTO users (id, name, created_at)
     VALUES (?, ?, ?)`,
    ["1", "Student", new Date().toISOString()]
  );

  const courses = [
    ["1", "Math"],
    ["2", "ITK"],
    ["3", "Security"],
  ];

  for (const course of courses) {
    await run(`INSERT OR IGNORE INTO courses (id, name) VALUES (?, ?)`, course);
  }

  console.log("[INFO] Seed completed");
};
