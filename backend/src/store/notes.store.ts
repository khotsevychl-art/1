import { randomUUID } from "crypto";
import { all, get, run } from "../infrastructure/db";
import { sqlNumber, sqlString } from "../utils/sql";

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
  course_id: string;
  course_name: string;
  notes_count: number;
  total_note_length: number;
  average_note_length: number;
};

export type NotesListParams = {
  courseId?: string;
  userId?: string;
  sort: string;
  order: "ASC" | "DESC";
  page: number;
  pageSize: number;
};

export class NotesStore {
  async getAll(params: NotesListParams): Promise<NoteRow[]> {
    const where: string[] = [];

    if (params.courseId) {
      where.push(`course_id = ${sqlString(params.courseId)}`);
    }
    if (params.userId) {
      where.push(`user_id = ${sqlString(params.userId)}`);
    }

    const offset = (params.page - 1) * params.pageSize;
    let sql = "SELECT * FROM notes";

    if (where.length > 0) {
      sql += ` WHERE ${where.join(" AND ")}`;
    }

    sql += ` ORDER BY ${params.sort} ${params.order}`;
    sql += ` LIMIT ${sqlNumber(params.pageSize)} OFFSET ${sqlNumber(offset)}`;

    return all<NoteRow>(sql);
  }

  async getById(id: string): Promise<NoteRow | undefined> {
    return get<NoteRow>(`SELECT * FROM notes WHERE id = ${sqlString(id)}`);
  }

  async getByNoteText(note: string): Promise<NoteRow | undefined> {
    return get<NoteRow>(`SELECT * FROM notes WHERE note = ${sqlString(note)}`);
  }

  async countByCourse(courseId: string): Promise<number> {
    const row = await get<{ count: number }>(`SELECT COUNT(*) AS count FROM notes WHERE course_id = ${sqlString(courseId)}`);
    return row?.count || 0;
  }

  async countByUser(userId: string): Promise<number> {
    const row = await get<{ count: number }>(`SELECT COUNT(*) AS count FROM notes WHERE user_id = ${sqlString(userId)}`);
    return row?.count || 0;
  }

  async create(data: { userId: string; courseId: string; title: string; note: string }): Promise<NoteRow> {
    const id = randomUUID();
    const createdAt = new Date().toISOString();

    await run(
      `INSERT INTO notes (id, user_id, course_id, title, note, created_at)
       VALUES (${sqlString(id)}, ${sqlString(data.userId)}, ${sqlString(data.courseId)}, ${sqlString(data.title)}, ${sqlString(data.note)}, ${sqlString(createdAt)})`
    );

    const created = await this.getById(id);
    if (!created) {
      throw new Error("Created note was not found");
    }
    return created;
  }

  async update(id: string, data: { courseId?: string; title?: string; note?: string }): Promise<NoteRow | undefined> {
    const updates: string[] = [];

    if (data.courseId !== undefined) updates.push(`course_id = ${sqlString(data.courseId)}`);
    if (data.title !== undefined) updates.push(`title = ${sqlString(data.title)}`);
    if (data.note !== undefined) updates.push(`note = ${sqlString(data.note)}`);

    if (updates.length === 0) {
      return this.getById(id);
    }

    await run(`UPDATE notes SET ${updates.join(", ")} WHERE id = ${sqlString(id)}`);
    return this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await run(`DELETE FROM notes WHERE id = ${sqlString(id)}`);
    return result.changes > 0;
  }

  async getWithRelations(params: NotesListParams): Promise<NoteWithRelationsRow[]> {
    const where: string[] = [];

    if (params.courseId) {
      where.push(`notes.course_id = ${sqlString(params.courseId)}`);
    }
    if (params.userId) {
      where.push(`notes.user_id = ${sqlString(params.userId)}`);
    }

    const offset = (params.page - 1) * params.pageSize;
    let sql = `
      SELECT
        notes.id,
        notes.user_id,
        notes.course_id,
        notes.title,
        notes.note,
        notes.created_at,
        courses.name AS course_name,
        users.name AS user_name
      FROM notes
      JOIN courses ON notes.course_id = courses.id
      JOIN users ON notes.user_id = users.id
    `;

    if (where.length > 0) {
      sql += ` WHERE ${where.join(" AND ")}`;
    }

    sql += ` ORDER BY notes.${params.sort} ${params.order}`;
    sql += ` LIMIT ${sqlNumber(params.pageSize)} OFFSET ${sqlNumber(offset)}`;

    return all<NoteWithRelationsRow>(sql);
  }

  async searchTeachingDemo(params: { q?: string; courseId?: string; sort: string; order: "ASC" | "DESC"; page: number; pageSize: number }): Promise<NoteWithRelationsRow[]> {
    const where: string[] = [];

    
    if (params.q) {
      where.push(`(notes.title LIKE ${sqlString(`%${params.q}%`)} OR notes.note LIKE ${sqlString(`%${params.q}%`)})`);
    }
    if (params.courseId) {
      where.push(`notes.course_id = ${sqlString(params.courseId)}`);
    }

    const offset = (params.page - 1) * params.pageSize;
    let sql = `
      SELECT
        notes.id,
        notes.user_id,
        notes.course_id,
        notes.title,
        notes.note,
        notes.created_at,
        courses.name AS course_name,
        users.name AS user_name
      FROM notes
      JOIN courses ON notes.course_id = courses.id
      JOIN users ON notes.user_id = users.id
    `;

    if (where.length > 0) {
      sql += ` WHERE ${where.join(" AND ")}`;
    }

    sql += ` ORDER BY notes.${params.sort} ${params.order}`;
    sql += ` LIMIT ${sqlNumber(params.pageSize)} OFFSET ${sqlNumber(offset)}`;

    return all<NoteWithRelationsRow>(sql);
  }

  async getStats(): Promise<NoteStatsRow[]> {
    return all<NoteStatsRow>(`
      SELECT
        courses.id AS course_id,
        courses.name AS course_name,
        COUNT(notes.id) AS notes_count,
        COALESCE(SUM(length(notes.note)), 0) AS total_note_length,
        COALESCE(AVG(length(notes.note)), 0) AS average_note_length
      FROM courses
      LEFT JOIN notes ON notes.course_id = courses.id
      GROUP BY courses.id, courses.name
      ORDER BY notes_count DESC
    `);
  }
}
