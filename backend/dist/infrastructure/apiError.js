"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(status, code, message, detail, errors) {
        super(message);
        this.status = status;
        this.code = code;
        this.detail = detail;
        this.errors = errors;
    }
}
exports.ApiError = ApiError;
