"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersStore = void 0;
const crypto_1 = require("crypto");
const db_1 = require("../infrastructure/db");
const allowedSort = new Set(["id", "name", "created_at"]);
class UsersStore {
    async getAll(params = {}) {
        const sort = allowedSort.has(params.sort ?? "") ? params.sort : "created_at";
        const order = params.order === "ASC" ? "ASC" : "DESC";
        const page = Math.max(Number(params.page ?? 1), 1);
        const pageSize = Math.min(Math.max(Number(params.pageSize ?? 50), 1), 100);
        const offset = (page - 1) * pageSize;
        return (0, db_1.all)(`SELECT * FROM users ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`, [pageSize, offset]);
    }
    async getById(id) {
        return (0, db_1.get)("SELECT * FROM users WHERE id = ?", [id]);
    }
    async create(data) {
        const id = (0, crypto_1.randomUUID)();
        const createdAt = new Date().toISOString();
        await (0, db_1.run)("INSERT INTO users (id, name, created_at) VALUES (?, ?, ?)", [id, data.name, createdAt]);
        const created = await this.getById(id);
        if (!created)
            throw new Error("Created user was not found");
        return created;
    }
    async update(id, data) {
        if (data.name === undefined)
            return this.getById(id);
        await (0, db_1.run)("UPDATE users SET name = ? WHERE id = ?", [data.name, id]);
        return this.getById(id);
    }
    async delete(id) {
        const result = await (0, db_1.run)("DELETE FROM users WHERE id = ?", [id]);
        return result.changes > 0;
    }
}
exports.UsersStore = UsersStore;
