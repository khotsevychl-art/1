"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
function exec(sql) {
    return new Promise((resolve, reject) => {
        db_1.db.exec(sql, (err) => (err ? reject(err) : resolve()));
    });
}
const runMigrations = async () => {
    await (0, db_1.run)("PRAGMA foreign_keys = ON");
    const dir = path_1.default.join(process.cwd(), "src/infrastructure/migrations");
    const files = fs_1.default.existsSync(dir) ? fs_1.default.readdirSync(dir).filter((file) => file.endsWith(".sql")).sort() : [];
    for (const file of files) {
        const sql = fs_1.default.readFileSync(path_1.default.join(dir, file), "utf-8");
        await exec(sql);
        console.log("Applied:", file);
    }
};
exports.runMigrations = runMigrations;
