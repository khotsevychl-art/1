"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesStore = void 0;
const crypto_1 = require("crypto");
const db_1 = require("../infrastructure/db");
const allowedSort = new Set(["id", "name"]);
class CoursesStore {
    async getAll(params = {}) {
        const sort = allowedSort.has(params.sort ?? "") ? params.sort : "name";
        const order = params.order === "DESC" ? "DESC" : "ASC";
        const page = Math.max(Number(params.page ?? 1), 1);
        const pageSize = Math.min(Math.max(Number(params.pageSize ?? 50), 1), 100);
        const offset = (page - 1) * pageSize;
        return (0, db_1.all)(`SELECT * FROM courses ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`, [pageSize, offset]);
    }
    async getById(id) {
        return (0, db_1.get)("SELECT * FROM courses WHERE id = ?", [id]);
    }
    async getByName(name) {
        return (0, db_1.get)("SELECT * FROM courses WHERE name = ?", [name]);
    }
    async create(data) {
        const id = (0, crypto_1.randomUUID)();
        await (0, db_1.run)("INSERT INTO courses (id, name) VALUES (?, ?)", [id, data.name]);
        const created = await this.getById(id);
        if (!created)
            throw new Error("Created course was not found");
        return created;
    }
    async update(id, data) {
        if (data.name === undefined)
            return this.getById(id);
        await (0, db_1.run)("UPDATE courses SET name = ? WHERE id = ?", [data.name, id]);
        return this.getById(id);
    }
    async delete(id) {
        const result = await (0, db_1.run)("DELETE FROM courses WHERE id = ?", [id]);
        return result.changes > 0;
    }
}
exports.CoursesStore = CoursesStore;
