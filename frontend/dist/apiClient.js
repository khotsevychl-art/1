import { API_BASE_URL, REQUEST_TIMEOUT_MS } from "./config.js";
const listCache = new Map();
const DEMO_USER_STORAGE_KEY = "demoUserId";
let activeController = null;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export function getDemoUserId() {
    return window.localStorage.getItem(DEMO_USER_STORAGE_KEY) || "1";
}
export function setDemoUserId(userId) {
    window.localStorage.setItem(DEMO_USER_STORAGE_KEY, userId);
    listCache.clear();
}
function buildQuery(params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "")
            query.set(key, String(value));
    });
    const text = query.toString();
    return text ? `?${text}` : "";
}
function normalizeError(status, rawText) {
    let payload = null;
    try {
        payload = rawText ? JSON.parse(rawText) : null;
    }
    catch {
        payload = null;
    }
    return {
        status,
        code: payload?.code ?? "HTTP_ERROR",
        message: payload?.message ?? payload?.title ?? "HTTP помилка",
        detail: payload?.detail ?? rawText ?? `HTTP ${status}`,
        errors: payload?.errors ?? undefined,
    };
}
export function cancelActiveRequest() {
    activeController?.abort();
}
async function request(path, options = {}, retrySafe = false) {
    const url = `${API_BASE_URL}${path}`;
    const attempts = retrySafe ? 2 : 1;
    for (let attempt = 1; attempt <= attempts; attempt++) {
        activeController = new AbortController();
        const timerId = window.setTimeout(() => activeController?.abort(), REQUEST_TIMEOUT_MS);
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    "X-Demo-UserId": getDemoUserId(),
                    ...(options.body ? { "Content-Type": "application/json" } : {}),
                    ...(options.headers ?? {}),
                },
                signal: activeController.signal,
            });
            if (response.status === 204)
                return null;
            const rawText = await response.text();
            if (response.ok) {
                if (!rawText)
                    return null;
                return JSON.parse(rawText);
            }
            const err = normalizeError(response.status, rawText);
            if (retrySafe && [429, 503].includes(response.status) && attempt < attempts) {
                await wait(500);
                continue;
            }
            throw err;
        }
        catch (e) {
            const err = e;
            if (err?.status)
                throw err;
            if (err?.name === "AbortError") {
                throw {
                    status: 0,
                    code: "REQUEST_TIMEOUT_OR_ABORTED",
                    message: "Запит скасовано або перевищено таймаут",
                    detail: "Спробуй ще раз або перевір, чи працює бекенд.",
                };
            }
            if (attempt < attempts) {
                await wait(500);
                continue;
            }
            throw {
                status: 0,
                code: "NETWORK_OR_CORS_ERROR",
                message: "Помилка мережі або CORS",
                detail: err?.message ?? "Бекенд може бути вимкнений, порт неправильний або CORS заблокував запит.",
            };
        }
        finally {
            window.clearTimeout(timerId);
            activeController = null;
        }
    }
    throw {
        status: 0,
        code: "UNKNOWN_REQUEST_ERROR",
        message: "Невідома помилка запиту",
    };
}
export async function getCourses() {
    const result = await request("/courses", {}, true);
    return result.data;
}
export async function getUsers() {
    const result = await request("/users", {}, true);
    return result.data;
}
export async function createUser(dto) {
    const result = await request("/users", {
        method: "POST",
        body: JSON.stringify(dto),
    });
    return result.data;
}
export async function updateUser(id, dto) {
    const result = await request(`/users/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(dto),
    });
    return result.data;
}
export async function getList(query) {
    const key = JSON.stringify(query);
    const cached = listCache.get(key);
    if (cached)
        return cached;
    const result = await request(`/notes${buildQuery(query)}`, {}, true);
    listCache.set(key, result);
    return result;
}
export async function getNotesWithRelations() {
    const result = await request("/notes/relations", {}, true);
    return result.data;
}
export async function getNotesStats() {
    const result = await request("/notes/stats", {}, true);
    return result.data;
}
export async function getById(id) {
    const result = await request(`/notes/${encodeURIComponent(id)}`, {}, true);
    return result.data;
}
export async function create(dto) {
    const result = await request("/notes", {
        method: "POST",
        body: JSON.stringify(dto),
    });
    listCache.clear();
    return result.data;
}
export async function update(id, dto) {
    const result = await request(`/notes/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(dto),
    });
    listCache.clear();
    return result.data;
}
export async function patchNote(id, dto) {
    const result = await request(`/notes/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(dto),
    });
    listCache.clear();
    return result.data;
}
export async function remove(id) {
    await request(`/notes/${encodeURIComponent(id)}`, { method: "DELETE" });
    listCache.clear();
}
export function clearListCache() {
    listCache.clear();
}
