"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.dbPath = void 0;
exports.run = run;
exports.get = get;
exports.all = all;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const dataDir = path_1.default.join(process.cwd(), "data");
fs_1.default.mkdirSync(dataDir, { recursive: true });
exports.dbPath = path_1.default.join(dataDir, "app.db");
exports.db = new sqlite3_1.default.Database(exports.dbPath);
exports.db.run("PRAGMA foreign_keys = ON");
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        exports.db.run(sql, params, function (err) {
            if (err)
                reject(err);
            else
                resolve({ changes: this.changes, lastID: this.lastID });
        });
    });
}
function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        exports.db.get(sql, params, (err, row) => {
            if (err)
                reject(err);
            else
                resolve(row);
        });
    });
}
function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        exports.db.all(sql, params, (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}
