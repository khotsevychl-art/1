import { randomUUID } from "crypto";
import { all, get, run } from "../infrastructure/db";
import { CreateNoteDto, NoteResponseDto, NotesQueryDto, UpdateNoteDto } from "../domain/note.dto";

export type NoteRow = {
  id: string;
  user_id: string;
  course_id: string;
  title: string;
  note: string;
  created_at: string;
};

export type NoteWithRelationsRow = NoteRow & {
  course_name: string;
  user_name: string;
};

export type NoteStatsRow = {
  courseId: string;
  courseName: string;
  total: number;
  notesCount: number;
  totalNoteLength: number;
  averageNoteLength: number;
};

const mapNote = (row: NoteRow): NoteResponseDto => ({
  id: row.id,
  userId: row.user_id,
  courseId: row.course_id,
  title: row.title,
  note: row.note,
  createdAt: row.created_at,
  priority: "normal",
});

const sortMap: Record<string, string> = {
  title: "title",
  createdAt: "created_at",
  courseId: "course_id",
  created_at: "created_at",
  course_id: "course_id",
};

type NormalizedQuery = NotesQueryDto & {
  userId?: string;
  q?: string;
  sort?: string;
  order?: string;
};

function normalizeList(query: NormalizedQuery = {}) {
  const sortKey = query.sortBy ?? query.sort ?? "createdAt";
  return {
    courseId: query.courseId,
    userId: query.userId,
    search: query.search ?? query.q,
    sortColumn: sortMap[sortKey] ?? "created_at",
    sortDir: query.sortDir === "asc" || String(query.order).toUpperCase() === "ASC" ? "ASC" : "DESC",
    page: Math.max(Number(query.page ?? 1), 1),
    pageSize: Math.min(Math.max(Number(query.pageSize ?? 10), 1), 50),
  };
}

export class NotesStore {
  async getAll(query: NormalizedQuery = {}): Promise<{ items: NoteResponseDto[]; total: number }> {
    const params = normalizeList(query);
    const where: string[] = [];
    const values: unknown[] = [];

    if (params.courseId) {
      where.push("course_id = ?");
      values.push(params.courseId);
    }
    if (params.userId) {
      where.push("user_id = ?");
      values.push(params.userId);
    }
    if (params.search) {
      where.push("(LOWER(title) LIKE ? OR LOWER(note) LIKE ?)");
      values.push(`%${params.search.toLowerCase()}%`, `%${params.search.toLowerCase()}%`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const offset = (params.page - 1) * params.pageSize;
    const countRow = await get<{ total: number }>(`SELECT COUNT(*) AS total FROM notes ${whereSql}`, values);
    const rows = await all<NoteRow>(
      `SELECT * FROM notes ${whereSql} ORDER BY ${params.sortColumn} ${params.sortDir} LIMIT ? OFFSET ?`,
      [...values, params.pageSize, offset]
    );

    return { items: rows.map(mapNote), total: Number(countRow?.total ?? 0) };
  }

  async getById(id: string): Promise<NoteResponseDto | null> {
    const row = await get<NoteRow>("SELECT * FROM notes WHERE id = ?", [id]);
    return row ? mapNote(row) : null;
  }

  async existsByContent(note: string, exceptId?: string): Promise<boolean> {
    const row = exceptId
      ? await get<{ id: string }>("SELECT id FROM notes WHERE note = ? AND id <> ? LIMIT 1", [note, exceptId])
      : await get<{ id: string }>("SELECT id FROM notes WHERE note = ? LIMIT 1", [note]);
    return !!row;
  }

  async countByCourse(courseId: string): Promise<number> {
    const row = await get<{ count: number }>("SELECT COUNT(*) AS count FROM notes WHERE course_id = ?", [courseId]);
    return row?.count ?? 0;
  }

  async countByUser(userId: string): Promise<number> {
    const row = await get<{ count: number }>("SELECT COUNT(*) AS count FROM notes WHERE user_id = ?", [userId]);
    return row?.count ?? 0;
  }

  async create(note: CreateNoteDto): Promise<NoteResponseDto> {
    const id = randomUUID();
    const createdAt = new Date().toISOString();

    await run(
      `INSERT INTO notes(id, user_id, course_id, title, note, created_at)
       VALUES(?, ?, ?, ?, ?, ?)`,
      [id, note.userId, note.courseId, note.title, note.note, createdAt]
    );

    return { id, userId: note.userId, courseId: note.courseId, title: note.title, note: note.note, createdAt, priority: "normal" };
  }

  async update(id: string, note: UpdateNoteDto): Promise<NoteResponseDto | null> {
    const current = await this.getById(id);
    if (!current) return null;

    const next = {
      userId: note.userId ?? current.userId,
      courseId: note.courseId ?? current.courseId,
      title: note.title ?? current.title,
      note: note.note ?? current.note,
    };

    await run("UPDATE notes SET user_id = ?, course_id = ?, title = ?, note = ? WHERE id = ?", [
      next.userId,
      next.courseId,
      next.title,
      next.note,
      id,
    ]);

    return { ...current, ...next };
  }

  async delete(id: string): Promise<boolean> {
    const result = await run("DELETE FROM notes WHERE id = ?", [id]);
    return result.changes > 0;
  }

  async getWithRelations(query: NormalizedQuery = {}) {
    const params = normalizeList(query);
    const where: string[] = [];
    const values: unknown[] = [];

    if (params.courseId) {
      where.push("notes.course_id = ?");
      values.push(params.courseId);
    }
    if (params.userId) {
      where.push("notes.user_id = ?");
      values.push(params.userId);
    }
    if (params.search) {
      where.push("(LOWER(notes.title) LIKE ? OR LOWER(notes.note) LIKE ?)");
      values.push(`%${params.search.toLowerCase()}%`, `%${params.search.toLowerCase()}%`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const offset = (params.page - 1) * params.pageSize;

    return all(
      `SELECT
        notes.id,
        notes.user_id AS userId,
        notes.course_id AS courseId,
        notes.title,
        notes.note,
        notes.created_at AS createdAt,
        users.name AS userName,
        courses.name AS courseName
       FROM notes
       JOIN users ON users.id = notes.user_id
       JOIN courses ON courses.id = notes.course_id
       ${whereSql}
       ORDER BY notes.${params.sortColumn} ${params.sortDir}
       LIMIT ? OFFSET ?`,
      [...values, params.pageSize, offset]
    );
  }

  async getStats(): Promise<NoteStatsRow[]> {
    return all<NoteStatsRow>(
      `SELECT
        courses.id AS courseId,
        courses.name AS courseName,
        COUNT(notes.id) AS total,
        COUNT(notes.id) AS notesCount,
        COALESCE(SUM(length(notes.note)), 0) AS totalNoteLength,
        COALESCE(AVG(length(notes.note)), 0) AS averageNoteLength
       FROM courses
       LEFT JOIN notes ON notes.course_id = courses.id
       GROUP BY courses.id, courses.name
       ORDER BY notesCount DESC`
    );
  }
}
