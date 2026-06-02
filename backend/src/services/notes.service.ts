import { AppError } from "../errors/AppError";
import { CourseRow, CoursesStore } from "../store/courses.store";
import { NotesStore, NoteRow, NoteStatsRow, NoteWithRelationsRow } from "../store/notes.store";
import { CreateNoteRequestDto, NoteResponseDto, NoteStatsResponseDto, NoteWithRelationsResponseDto, UpdateNoteRequestDto } from "../dto/notes.dto";
import { normalizeOrder, normalizePage, normalizePageSize, normalizeSort } from "../utils/sql";

const DEFAULT_USER_ID = "1";
const noteSortColumns = ["created_at", "title", "course_id"];

const notesStore = new NotesStore();
const coursesStore = new CoursesStore();

function toNoteResponse(row: NoteRow): NoteResponseDto {
  return {
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    title: row.title,
    note: row.note,
    createdAt: row.created_at
  };
}

function toNoteWithRelationsResponse(row: NoteWithRelationsRow): NoteWithRelationsResponseDto {
  return {
    ...toNoteResponse(row),
    courseName: row.course_name,
    userName: row.user_name
  };
}

function toStatsResponse(row: NoteStatsRow): NoteStatsResponseDto {
  return {
    courseId: row.course_id,
    courseName: row.course_name,
    notesCount: row.notes_count,
    totalNoteLength: row.total_note_length,
    averageNoteLength: Number(row.average_note_length)
  };
}

function validateRequiredText(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid request", `${field} is required`);
  }
  return value.trim();
}

function validateNoteFields(data: CreateNoteRequestDto): CreateNoteRequestDto {
  const courseId = validateRequiredText(data.courseId, "courseId");
  const title = validateRequiredText(data.title, "title");
  const note = validateRequiredText(data.note, "note");

  if (title.length < 3) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid request", "title must be at least 3 characters");
  }
  if (note.length < 5) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid request", "note must be at least 5 characters");
  }

  return { courseId, title, note };
}

function parseListParams(query: Record<string, unknown>) {
  return {
    courseId: typeof query.courseId === "string" ? query.courseId : undefined,
    userId: typeof query.userId === "string" ? query.userId : undefined,
    sort: normalizeSort(query.sort, noteSortColumns, "created_at"),
    order: normalizeOrder(query.order),
    page: normalizePage(query.page),
    pageSize: normalizePageSize(query.pageSize)
  };
}

export class NotesService {
  async getAll(query: Record<string, unknown>): Promise<NoteResponseDto[]> {
    const params = parseListParams(query);
    const rows = await notesStore.getAll(params);
    return rows.map(toNoteResponse);
  }

  async getById(id: string): Promise<NoteResponseDto> {
    const note = await notesStore.getById(id);
    if (!note) {
      throw new AppError(404, "NOT_FOUND", "Note not found");
    }
    return toNoteResponse(note);
  }

  async create(data: CreateNoteRequestDto): Promise<NoteResponseDto> {
    const validData = validateNoteFields(data);
    const course: CourseRow | undefined = await coursesStore.getById(validData.courseId);
    if (!course) {
      throw new AppError(400, "VALIDATION_ERROR", "Invalid request", "courseId does not exist");
    }

    const duplicate = await notesStore.getByNoteText(validData.note);
    if (duplicate) {
      throw new AppError(409, "CONFLICT", "Note with this text already exists");
    }

    const created = await notesStore.create({ ...validData, userId: DEFAULT_USER_ID });
    return toNoteResponse(created);
  }

  async update(id: string, data: CreateNoteRequestDto): Promise<NoteResponseDto> {
    await this.getById(id);
    const validData = validateNoteFields(data);

    const course = await coursesStore.getById(validData.courseId);
    if (!course) {
      throw new AppError(400, "VALIDATION_ERROR", "Invalid request", "courseId does not exist");
    }

    const duplicate = await notesStore.getByNoteText(validData.note);
    if (duplicate && duplicate.id !== id) {
      throw new AppError(409, "CONFLICT", "Note with this text already exists");
    }

    const updated = await notesStore.update(id, validData);
    if (!updated) throw new AppError(404, "NOT_FOUND", "Note not found");
    return toNoteResponse(updated);
  }

  async patch(id: string, data: UpdateNoteRequestDto): Promise<NoteResponseDto> {
    const current = await notesStore.getById(id);
    if (!current) throw new AppError(404, "NOT_FOUND", "Note not found");

    const nextData: CreateNoteRequestDto = {
      courseId: data.courseId ?? current.course_id,
      title: data.title ?? current.title,
      note: data.note ?? current.note
    };

    return this.update(id, nextData);
  }

  async delete(id: string): Promise<void> {
    const deleted = await notesStore.delete(id);
    if (!deleted) {
      throw new AppError(404, "NOT_FOUND", "Note not found");
    }
  }

  async getWithRelations(query: Record<string, unknown>): Promise<NoteWithRelationsResponseDto[]> {
    const params = parseListParams(query);
    const rows = await notesStore.getWithRelations(params);
    return rows.map(toNoteWithRelationsResponse);
  }

  async searchTeachingDemo(query: Record<string, unknown>): Promise<NoteWithRelationsResponseDto[]> {
    const params = parseListParams(query);
    const rows = await notesStore.searchTeachingDemo({
      q: typeof query.q === "string" ? query.q : undefined,
      courseId: params.courseId,
      sort: params.sort,
      order: params.order,
      page: params.page,
      pageSize: params.pageSize
    });
    return rows.map(toNoteWithRelationsResponse);
  }

  async getStats(): Promise<NoteStatsResponseDto[]> {
    const rows = await notesStore.getStats();
    return rows.map(toStatsResponse);
  }
}
