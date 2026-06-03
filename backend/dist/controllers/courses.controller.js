"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCourse = exports.patchCourse = exports.updateCourse = exports.createCourse = exports.getCourse = exports.getCourses = void 0;
const courses_service_1 = require("../services/courses.service");
const service = new courses_service_1.CoursesService();
const getCourses = async (req, res) => {
    const data = await service.getAll(req.query);
    res.json({ data });
};
exports.getCourses = getCourses;
const getCourse = async (req, res) => {
    const data = await service.getById(req.params.id);
    res.json({ data });
};
exports.getCourse = getCourse;
const createCourse = async (req, res) => {
    const data = await service.create(req.body);
    res.status(201).json({ data });
};
exports.createCourse = createCourse;
const updateCourse = async (req, res) => {
    const data = await service.update(req.params.id, req.body);
    res.json({ data });
};
exports.updateCourse = updateCourse;
const patchCourse = async (req, res) => {
    const data = await service.patch(req.params.id, req.body);
    res.json({ data });
};
exports.patchCourse = patchCourse;
const deleteCourse = async (req, res) => {
    await service.delete(req.params.id);
    res.status(204).send();
};
exports.deleteCourse = deleteCourse;
