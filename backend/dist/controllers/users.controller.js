"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.patchUser = exports.updateUser = exports.createUser = exports.getUser = exports.getUsers = void 0;
const users_service_1 = require("../services/users.service");
const service = new users_service_1.UsersService();
const getUsers = async (req, res) => {
    const data = await service.getAll(req.query);
    res.json({ data });
};
exports.getUsers = getUsers;
const getUser = async (req, res) => {
    const data = await service.getById(req.params.id);
    res.json({ data });
};
exports.getUser = getUser;
const createUser = async (req, res) => {
    const data = await service.create(req.body);
    res.status(201).json({ data });
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    const data = await service.update(req.params.id, req.body);
    res.json({ data });
};
exports.updateUser = updateUser;
const patchUser = async (req, res) => {
    const data = await service.patch(req.params.id, req.body);
    res.json({ data });
};
exports.patchUser = patchUser;
const deleteUser = async (req, res) => {
    await service.delete(req.params.id);
    res.status(204).send();
};
exports.deleteUser = deleteUser;
