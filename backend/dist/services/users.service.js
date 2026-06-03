"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const apiError_1 = require("../infrastructure/apiError");
const notes_store_1 = require("../store/notes.store");
const users_store_1 = require("../store/users.store");
const usersStore = new users_store_1.UsersStore();
const notesStore = new notes_store_1.NotesStore();
function toUserResponse(row) {
    return { id: row.id, name: row.name, createdAt: row.created_at, created_at: row.created_at };
}
function validateUserName(value) {
    if (typeof value !== "string" || value.trim().length < 2) {
        throw new apiError_1.ApiError(400, "VALIDATION_ERROR", "Invalid data", "name must be at least 2 characters", {
            name: ["Мінімум 2 символи"],
        });
    }
    return value.trim();
}
class UsersService {
    async getAll(query = {}) {
        const rows = await usersStore.getAll({
            sort: typeof query.sort === "string" ? query.sort : undefined,
            order: String(query.order).toUpperCase() === "ASC" ? "ASC" : "DESC",
            page: Number(query.page ?? 1),
            pageSize: Number(query.pageSize ?? 50),
        });
        return rows.map(toUserResponse);
    }
    async getById(id) {
        const user = await usersStore.getById(id);
        if (!user)
            throw new apiError_1.ApiError(404, "USER_NOT_FOUND", "User not found", `User with id ${id} does not exist`);
        return toUserResponse(user);
    }
    async create(data) {
        const name = validateUserName(data.name);
        const created = await usersStore.create({ name });
        return toUserResponse(created);
    }
    async update(id, data) {
        await this.getById(id);
        const name = validateUserName(data.name);
        const updated = await usersStore.update(id, { name });
        if (!updated)
            throw new apiError_1.ApiError(404, "USER_NOT_FOUND", "User not found");
        return toUserResponse(updated);
    }
    async patch(id, data) {
        const current = await usersStore.getById(id);
        if (!current)
            throw new apiError_1.ApiError(404, "USER_NOT_FOUND", "User not found");
        return this.update(id, { name: data.name ?? current.name });
    }
    async delete(id) {
        await this.getById(id);
        const linkedNotes = await notesStore.countByUser(id);
        if (linkedNotes > 0) {
            throw new apiError_1.ApiError(409, "USER_HAS_NOTES", "User cannot be deleted because it has notes", "Delete linked notes first", {
                linkedNotes: [String(linkedNotes)],
            });
        }
        const deleted = await usersStore.delete(id);
        if (!deleted)
            throw new apiError_1.ApiError(404, "USER_NOT_FOUND", "User not found");
    }
}
exports.UsersService = UsersService;
