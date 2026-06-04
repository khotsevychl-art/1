"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotesStats = exports.searchTeachingDemo = exports.getNotesWithRelations = exports.deleteNote = exports.updateNote = exports.createNote = exports.getNote = exports.getNotes = void 0;
const notes_service_1 = require("../services/notes.service");
const apiError_1 = require("../infrastructure/apiError");
const service = new notes_service_1.NotesService();
const allowedSort = new Set(["title", "createdAt", "courseId"]);
const allowedDir = new Set(["asc", "desc"]);
function getCurrentUserId(req) {
    return req.currentUserId;
}
function buildQuery(req) {
    const sortBy = (req.query.sortBy ?? req.query.sort);
    const sortDir = (req.query.sortDir ?? req.query.order);
    if (sortBy && !allowedSort.has(sortBy)) {
        throw new apiError_1.ApiError(400, "INVALID_SORT", "Invalid sortBy", "sortBy must be one of: title, createdAt, courseId", {
            sortBy: ["Дозволено тільки title, createdAt або courseId"],
        });
    }
    if (sortDir && !allowedDir.has(String(sortDir).toLowerCase())) {
        throw new apiError_1.ApiError(400, "INVALID_SORT_DIR", "Invalid sortDir", "sortDir must be asc or desc", {
            sortDir: ["Дозволено тільки asc або desc"],
        });
    }
    return {
        courseId: req.query.courseId,
        search: (req.query.search ?? req.query.q),
        sortBy: sortBy,
        sortDir: String(sortDir ?? "desc").toLowerCase(),
        page: Number(req.query.page ?? 1),
        pageSize: Number(req.query.pageSize ?? 10),
    };
}
const getNotes = async (req, res) => {
    const query = buildQuery(req);
    const result = await service.getAll(query, getCurrentUserId(req));
    res.json({
        data: result.items,
        items: result.items,
        meta: {
            total: result.total,
            page: query.page ?? 1,
            pageSize: query.pageSize ?? 10,
        },
    });
};
exports.getNotes = getNotes;
const getNote = async (req, res) => {
    const data = await service.getById(req.params.id, getCurrentUserId(req));
    res.json({ data, item: data });
};
exports.getNote = getNote;
const createNote = async (req, res) => {
    const data = await service.create(req.body, getCurrentUserId(req));
    res.status(201).json({ data, item: data });
};
exports.createNote = createNote;
const updateNote = async (req, res) => {
    const data = await service.update(req.params.id, req.body, getCurrentUserId(req));
    res.json({ data, item: data });
};
exports.updateNote = updateNote;
const deleteNote = async (req, res) => {
    await service.delete(req.params.id, getCurrentUserId(req));
    res.status(204).send();
};
exports.deleteNote = deleteNote;
const getNotesWithRelations = async (req, res) => {
    const data = await service.getWithRelations(getCurrentUserId(req), req.query);
    res.json({ data, items: data });
};
exports.getNotesWithRelations = getNotesWithRelations;
const searchTeachingDemo = async (req, res) => {
    const data = await service.searchTeachingDemo(getCurrentUserId(req), req.query);
    res.json({ data, items: data });
};
exports.searchTeachingDemo = searchTeachingDemo;
const getNotesStats = async (req, res) => {
    const data = await service.getStats(getCurrentUserId(req));
    res.json({ data, items: data });
};
exports.getNotesStats = getNotesStats;
