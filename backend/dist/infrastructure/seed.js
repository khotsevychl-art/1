"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const db_1 = require("./db");
const seedDatabase = async () => {
    console.log("[INFO] Start seed");
    await (0, db_1.run)(`INSERT OR IGNORE INTO users (id, name, created_at)
     VALUES (?, ?, ?)`, ["1", "Student", new Date().toISOString()]);
    const courses = [
        ["1", "Math"],
        ["2", "ITK"],
        ["3", "Security"],
    ];
    for (const course of courses) {
        await (0, db_1.run)(`INSERT OR IGNORE INTO courses (id, name) VALUES (?, ?)`, course);
    }
    console.log("[INFO] Seed completed");
};
exports.seedDatabase = seedDatabase;
