import { API_BASE_URL, REQUEST_TIMEOUT_MS } from "./config.js";
import type {
  ApiError,
  ApiListResponse,
  ApiSingleResponse,
  CourseDto,
  CreateNoteDto,
  CreateUserDto,
  NoteDto,
  NoteListQuery,
  NoteRelationDto,
  NoteStatsDto,
  PartialUpdateNoteDto,
  UpdateNoteDto,
  UserDto,
} from "./dtos.js";

const listCache = new Map<string, ApiListResponse<NoteDto>>();
let activeController: AbortController | null = null;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function buildQuery(params: NoteListQuery) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });

  const text = query.toString();
  return text ? `?${text}` : "";
}

function normalizeError(status: number, rawText: string): ApiError {
  let payload: any = null;

  try {
    payload = rawText ? JSON.parse(rawText) : null;
  } catch {
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

async function request<T>(
  path: string,
  options: RequestInit = {},
  retrySafe = false
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const attempts = retrySafe ? 2 : 1;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    activeController = new AbortController();
    const timerId = window.setTimeout(() => activeController?.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...(options.headers ?? {}),
        },
        signal: activeController.signal,
      });

      if (response.status === 204) return null as T;

      const rawText = await response.text();

      if (response.ok) {
        if (!rawText) return null as T;
        return JSON.parse(rawText) as T;
      }

      const err = normalizeError(response.status, rawText);

      if (retrySafe && [429, 503].includes(response.status) && attempt < attempts) {
        await wait(500);
        continue;
      }

      throw err;
    } catch (e: unknown) {
      const err = e as ApiError & { name?: string; message?: string };

      if (err?.status) throw err;

      if (err?.name === "AbortError") {
        throw {
          status: 0,
          code: "REQUEST_TIMEOUT_OR_ABORTED",
          message: "Запит скасовано або перевищено таймаут",
          detail: "Спробуй ще раз або перевір, чи працює бекенд.",
        } satisfies ApiError;
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
      } satisfies ApiError;
    } finally {
      window.clearTimeout(timerId);
      activeController = null;
    }
  }

  throw {
    status: 0,
    code: "UNKNOWN_REQUEST_ERROR",
    message: "Невідома помилка запиту",
  } satisfies ApiError;
}

export async function getCourses() {
  const result = await request<ApiListResponse<CourseDto>>("/courses", {}, true);
  return result.data;
}

export async function getUsers() {
  const result = await request<ApiListResponse<UserDto>>("/users", {}, true);
  return result.data;
}

export async function createUser(dto: CreateUserDto) {
  const result = await request<ApiSingleResponse<UserDto>>("/users", {
    method: "POST",
    body: JSON.stringify(dto),
  });
  return result.data;
}

export async function getList(query: NoteListQuery) {
  const key = JSON.stringify(query);
  const cached = listCache.get(key);
  if (cached) return cached;

  const result = await request<ApiListResponse<NoteDto>>(`/notes${buildQuery(query)}`, {}, true);
  listCache.set(key, result);
  return result;
}

export async function getNotesWithRelations() {
  const result = await request<ApiListResponse<NoteRelationDto>>("/notes/relations", {}, true);
  return result.data;
}

export async function getNotesStats() {
  const result = await request<ApiListResponse<NoteStatsDto>>("/notes/stats", {}, true);
  return result.data;
}

export async function getById(id: string) {
  const result = await request<ApiSingleResponse<NoteDto>>(`/notes/${encodeURIComponent(id)}`, {}, true);
  return result.data;
}

export async function create(dto: CreateNoteDto) {
  const result = await request<ApiSingleResponse<NoteDto>>("/notes", {
    method: "POST",
    body: JSON.stringify(dto),
  });
  listCache.clear();
  return result.data;
}

export async function update(id: string, dto: UpdateNoteDto) {
  const result = await request<ApiSingleResponse<NoteDto>>(`/notes/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
  listCache.clear();
  return result.data;
}

export async function patchNote(id: string, dto: PartialUpdateNoteDto) {
  const result = await request<ApiSingleResponse<NoteDto>>(`/notes/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
  listCache.clear();
  return result.data;
}

export async function remove(id: string) {
  await request<null>(`/notes/${encodeURIComponent(id)}`, { method: "DELETE" });
  listCache.clear();
}

export function clearListCache() {
  listCache.clear();
}
