"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesService = void 0;
const apiError_1 = require("../infrastructure/apiError");
const courses_store_1 = require("../store/courses.store");
const notes_store_1 = require("../store/notes.store");
const users_store_1 = require("../store/users.store");
const store = new notes_store_1.NotesStore();
const coursesStore = new courses_store_1.CoursesStore();
const usersStore = new users_store_1.UsersStore();
async function ensureRelations(dto) {
    if (dto.userId) {
        const user = await usersStore.getById(dto.userId);
        if (!user)
            throw new apiError_1.ApiError(400, "VALIDATION_ERROR", "Invalid data", "userId does not exist", { userId: ["Користувача не знайдено"] });
    }
    if (dto.courseId) {
        const course = await coursesStore.getById(dto.courseId);
        if (!course)
            throw new apiError_1.ApiError(400, "VALIDATION_ERROR", "Invalid data", "courseId does not exist", { courseId: ["Курс не знайдено"] });
    }
}
class NotesService {
    getAll(query) {
        return store.getAll(query);
    }
    async getById(id) {
        const note = await store.getById(id);
        if (!note)
            throw new apiError_1.ApiError(404, "NOTE_NOT_FOUND", "Note not found", `Note with id ${id} does not exist`);
        return note;
    }
    async create(dto) {
        await ensureRelations(dto);
        const exists = await store.existsByContent(dto.note);
        if (exists) {
            throw new apiError_1.ApiError(409, "DUPLICATE_NOTE", "Note with this content already exists", "Change note text and try again");
        }
        return store.create(dto);
    }
    async update(id, dto) {
        await ensureRelations(dto);
        if (dto.note) {
            const exists = await store.existsByContent(dto.note, id);
            if (exists) {
                throw new apiError_1.ApiError(409, "DUPLICATE_NOTE", "Note with this content already exists", "Change note text and try again");
            }
        }
        const note = await store.update(id, dto);
        if (!note)
            throw new apiError_1.ApiError(404, "NOTE_NOT_FOUND", "Note not found", `Note with id ${id} does not exist`);
        return note;
    }
    async delete(id) {
        const deleted = await store.delete(id);
        if (!deleted)
            throw new apiError_1.ApiError(404, "NOTE_NOT_FOUND", "Note not found", `Note with id ${id} does not exist`);
    }
    getWithRelations(query = {}) {
        return store.getWithRelations(query);
    }
    searchTeachingDemo(query = {}) {
        return store.getWithRelations({ ...query, search: query.search ?? query.q });
    }
    getStats() {
        return store.getStats();
    }
}
exports.NotesService = NotesService;
