"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = void 0;
const allowedOrigins = new Set([
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]);
const allowedMethods = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
const allowedHeaders = "Content-Type,Authorization";
const corsMiddleware = (req, res, next) => {
    const origin = req.headers.origin;
    if (!origin || allowedOrigins.has(origin)) {
        if (origin) {
            res.setHeader("Access-Control-Allow-Origin", origin);
            res.setHeader("Vary", "Origin");
        }
        res.setHeader("Access-Control-Allow-Methods", allowedMethods);
        res.setHeader("Access-Control-Allow-Headers", allowedHeaders);
    }
    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    if (origin && !allowedOrigins.has(origin)) {
        return res.status(403).json({
            status: 403,
            code: "CORS_ORIGIN_DENIED",
            title: "CORS origin is not allowed",
            message: "CORS origin is not allowed",
            detail: `Origin ${origin} is not in whitelist`,
        });
    }
    next();
};
exports.corsMiddleware = corsMiddleware;
