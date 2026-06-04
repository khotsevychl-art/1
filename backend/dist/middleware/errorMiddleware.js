"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = void 0;
const apiError_1 = require("../infrastructure/apiError");
const notFound = (req, res) => {
    res.status(404).json({
        status: 404,
        code: "ROUTE_NOT_FOUND",
        title: "Route not found",
        message: "Route not found",
        detail: "The requested API route does not exist",
    });
};
exports.notFound = notFound;
const errorHandler = (err, req, res, next) => {
    console.error("API ERROR:", err);
    if (err instanceof apiError_1.ApiError) {
        return res.status(err.status).json({
            status: err.status,
            code: err.code,
            title: err.message,
            message: err.message,
            detail: err.detail,
            errors: err.errors,
        });
    }
    return res.status(500).json({
        status: 500,
        code: "INTERNAL_ERROR",
        title: "Server error",
        message: "Server error",
        detail: process.env.NODE_ENV === "production" ? undefined : "Unexpected backend error. Check backend console for details.",
    });
};
exports.errorHandler = errorHandler;
