"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotesStats = exports.searchTeachingDemo = exports.getNotesWithRelations = exports.deleteNote = exports.updateNote = exports.createNote = exports.getNote = exports.getNotes = void 0;
const notes_service_1 = require("../services/notes.service");
const service = new notes_service_1.NotesService();
const getNotes = async (req, res) => {
    const query = {
        courseId: req.query.courseId,
        userId: req.query.userId,
        search: (req.query.search ?? req.query.q),
        sortBy: (req.query.sortBy ?? req.query.sort),
        sortDir: (req.query.sortDir ?? req.query.order),
        page: Number(req.query.page ?? 1),
        pageSize: Number(req.query.pageSize ?? 10),
    };
    const result = await service.getAll(query);
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
    const data = await service.getById(req.params.id);
    res.json({ data, item: data });
};
exports.getNote = getNote;
const createNote = async (req, res) => {
    const data = await service.create(req.body);
    res.status(201).json({ data, item: data });
};
exports.createNote = createNote;
const updateNote = async (req, res) => {
    const data = await service.update(req.params.id, req.body);
    res.json({ data, item: data });
};
exports.updateNote = updateNote;
const deleteNote = async (req, res) => {
    await service.delete(req.params.id);
    res.status(204).send();
};
exports.deleteNote = deleteNote;
const getNotesWithRelations = async (req, res) => {
    const data = await service.getWithRelations(req.query);
    res.json({ data, items: data });
};
exports.getNotesWithRelations = getNotesWithRelations;
const searchTeachingDemo = async (req, res) => {
    const data = await service.searchTeachingDemo(req.query);
    res.json({ data, items: data });
};
exports.searchTeachingDemo = searchTeachingDemo;
const getNotesStats = async (req, res) => {
    const data = await service.getStats();
    res.json({ data, items: data });
};
exports.getNotesStats = getNotesStats;
