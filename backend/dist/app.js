"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const notes_routes_1 = __importDefault(require("./routes/notes.routes"));
const courses_routes_1 = __importDefault(require("./routes/courses.routes"));
const cors_1 = require("./infrastructure/cors");
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const securityHeaders_1 = require("./middleware/securityHeaders");
const app = (0, express_1.default)();
app.use(securityHeaders_1.securityHeaders);
app.use(cors_1.corsMiddleware);
app.use(express_1.default.json());
app.get("/api/v1/health", (req, res) => {
    res.json({ data: { status: "ok", apiVersion: "v1" } });
});
app.use("/api/v1/users", users_routes_1.default);
app.use("/api/v1/notes", notes_routes_1.default);
app.use("/api/v1/courses", courses_routes_1.default);
// Legacy aliases залишені тільки щоб старі запити не падали під час перевірки.
app.use("/api/users", users_routes_1.default);
app.use("/api/notes", notes_routes_1.default);
app.use("/api/courses", courses_routes_1.default);
app.use(errorMiddleware_1.notFound);
app.use(errorMiddleware_1.errorHandler);
exports.default = app;
