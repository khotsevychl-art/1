"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sqlString = sqlString;
exports.sqlNumber = sqlNumber;
exports.normalizePage = normalizePage;
exports.normalizePageSize = normalizePageSize;
exports.normalizeSort = normalizeSort;
exports.normalizeOrder = normalizeOrder;
function sqlString(value) {
    return `'${String(value).replace(/'/g, "''")}'`;
}
function sqlNumber(value) {
    if (!Number.isFinite(value)) {
        return "0";
    }
    return String(Math.trunc(value));
}
function normalizePage(value, fallback = 1) {
    const page = Number(value);
    return Number.isFinite(page) && page > 0 ? Math.trunc(page) : fallback;
}
function normalizePageSize(value, fallback = 10) {
    const pageSize = Number(value);
    if (!Number.isFinite(pageSize) || pageSize <= 0)
        return fallback;
    return Math.min(Math.trunc(pageSize), 50);
}
function normalizeSort(value, allowed, fallback) {
    const sort = String(value || fallback);
    return allowed.includes(sort) ? sort : fallback;
}
function normalizeOrder(value) {
    return String(value).toUpperCase() === "ASC" ? "ASC" : "DESC";
}
