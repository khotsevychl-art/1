"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesService = void 0;
const apiError_1 = require("../infrastructure/apiError");
const courses_store_1 = require("../store/courses.store");
const notes_store_1 = require("../store/notes.store");
const coursesStore = new courses_store_1.CoursesStore();
const notesStore = new notes_store_1.NotesStore();
function toCourseResponse(row) {
    return { id: row.id, name: row.name };
}
function validateCourseName(value) {
    if (typeof value !== "string" || value.trim().length < 2) {
        throw new apiError_1.ApiError(400, "VALIDATION_ERROR", "Invalid data", "name must be at least 2 characters", {
            name: ["Мінімум 2 символи"],
        });
    }
    return value.trim();
}
class CoursesService {
    async getAll(query = {}) {
        const rows = await coursesStore.getAll({
            sort: typeof query.sort === "string" ? query.sort : undefined,
            order: String(query.order).toUpperCase() === "DESC" ? "DESC" : "ASC",
            page: Number(query.page ?? 1),
            pageSize: Number(query.pageSize ?? 50),
        });
        return rows.map(toCourseResponse);
    }
    async getById(id) {
        const course = await coursesStore.getById(id);
        if (!course)
            throw new apiError_1.ApiError(404, "COURSE_NOT_FOUND", "Course not found", `Course with id ${id} does not exist`);
        return toCourseResponse(course);
    }
    async create(data) {
        const name = validateCourseName(data.name);
        const duplicate = await coursesStore.getByName(name);
        if (duplicate)
            throw new apiError_1.ApiError(409, "DUPLICATE_COURSE", "Course with this name already exists");
        const created = await coursesStore.create({ name });
        return toCourseResponse(created);
    }
    async update(id, data) {
        await this.getById(id);
        const name = validateCourseName(data.name);
        const duplicate = await coursesStore.getByName(name);
        if (duplicate && duplicate.id !== id)
            throw new apiError_1.ApiError(409, "DUPLICATE_COURSE", "Course with this name already exists");
        const updated = await coursesStore.update(id, { name });
        if (!updated)
            throw new apiError_1.ApiError(404, "COURSE_NOT_FOUND", "Course not found");
        return toCourseResponse(updated);
    }
    async patch(id, data) {
        const current = await coursesStore.getById(id);
        if (!current)
            throw new apiError_1.ApiError(404, "COURSE_NOT_FOUND", "Course not found");
        return this.update(id, { name: data.name ?? current.name });
    }
    async delete(id) {
        await this.getById(id);
        const linkedNotes = await notesStore.countByCourse(id);
        if (linkedNotes > 0) {
            throw new apiError_1.ApiError(409, "COURSE_HAS_NOTES", "Course cannot be deleted because it has notes", "Delete linked notes first", {
                linkedNotes: [String(linkedNotes)],
            });
        }
        const deleted = await coursesStore.delete(id);
        if (!deleted)
            throw new apiError_1.ApiError(404, "COURSE_NOT_FOUND", "Course not found");
    }
}
exports.CoursesService = CoursesService;
