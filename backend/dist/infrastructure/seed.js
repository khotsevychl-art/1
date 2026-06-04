"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const db_1 = require("./db");
const seedDatabase = async () => {
    console.log("[INFO] Start seed");
    const now = new Date().toISOString();
    const users = [
        ["1", "Student", now],
        ["2", "Student 2", now],
    ];
    for (const user of users) {
        await (0, db_1.run)(`INSERT OR IGNORE INTO users (id, name, created_at)
       VALUES (?, ?, ?)`, user);
    }
    const courses = [
        ["1", "Math"],
        ["2", "ITK"],
        ["3", "Security"],
    ];
    for (const course of courses) {
        await (0, db_1.run)(`INSERT OR IGNORE INTO courses (id, name) VALUES (?, ?)`, course);
    }
    await (0, db_1.run)(`INSERT OR IGNORE INTO notes (id, user_id, course_id, title, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`, ["demo-note-user-1", "1", "3", "SQLi protected", "Пошук використовує параметризовані запити", now]);
    await (0, db_1.run)(`INSERT OR IGNORE INTO notes (id, user_id, course_id, title, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`, ["demo-note-user-2", "2", "3", "IDOR protected", "Ця нотатка належить другому користувачу", now]);
    console.log("[INFO] Seed completed");
};
exports.seedDatabase = seedDatabase;
