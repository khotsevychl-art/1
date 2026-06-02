import { get, run } from "./db";
import { sqlString } from "../utils/sql";

type CountRow = { count: number };

export async function seedDatabase(): Promise<void> {
  const usersCount = await get<CountRow>("SELECT COUNT(*) as count FROM users");
  if ((usersCount?.count || 0) > 0) {
    console.log("[SEED] skipped: data already exists");
    return;
  }

  console.log("[SEED] start");

  await run(
    `INSERT INTO users (id, name, created_at) VALUES (${sqlString("1")}, ${sqlString("Основний користувач")}, ${sqlString(new Date().toISOString())})`
  );

  await run(`INSERT INTO courses (id, name) VALUES (${sqlString("1")}, ${sqlString("Вища математика")})`);
  await run(`INSERT INTO courses (id, name) VALUES (${sqlString("2")}, ${sqlString("ІТК")})`);
  await run(`INSERT INTO courses (id, name) VALUES (${sqlString("3")}, ${sqlString("Кібербезпека та захист інформації")})`);

  await run(
    `INSERT INTO notes (id, user_id, course_id, title, note, created_at)
     VALUES (${sqlString("seed-note-1")}, ${sqlString("1")}, ${sqlString("1")}, ${sqlString("Інтеграли")}, ${sqlString("Повторити методи інтегрування")}, ${sqlString(new Date().toISOString())})`
  );
  await run(
    `INSERT INTO notes (id, user_id, course_id, title, note, created_at)
     VALUES (${sqlString("seed-note-2")}, ${sqlString("1")}, ${sqlString("2")}, ${sqlString("Мережі")}, ${sqlString("Вивчити TCP/IP модель")}, ${sqlString(new Date().toISOString())})`
  );
  await run(
    `INSERT INTO notes (id, user_id, course_id, title, note, created_at)
     VALUES (${sqlString("seed-note-3")}, ${sqlString("1")}, ${sqlString("3")}, ${sqlString("Шифрування")}, ${sqlString("AES та RSA алгоритми")}, ${sqlString(new Date().toISOString())})`
  );

  console.log("[SEED] completed");
}
