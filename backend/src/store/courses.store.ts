import { randomUUID } from "crypto";
import { all, get, run } from "../infrastructure/db";
import { sqlNumber, sqlString } from "../utils/sql";

export type CourseRow = {
  id: string;
  name: string;
};

export class CoursesStore {
  async getAll(params: { sort: string; order: "ASC" | "DESC"; page: number; pageSize: number }): Promise<CourseRow[]> {
    const offset = (params.page - 1) * params.pageSize;
    return all<CourseRow>(
      `SELECT * FROM courses ORDER BY ${params.sort} ${params.order} LIMIT ${sqlNumber(params.pageSize)} OFFSET ${sqlNumber(offset)}`
    );
  }

  async getById(id: string): Promise<CourseRow | undefined> {
    return get<CourseRow>(`SELECT * FROM courses WHERE id = ${sqlString(id)}`);
  }

  async getByName(name: string): Promise<CourseRow | undefined> {
    return get<CourseRow>(`SELECT * FROM courses WHERE name = ${sqlString(name)}`);
  }

  async create(data: { name: string }): Promise<CourseRow> {
    const id = randomUUID();
    await run(`INSERT INTO courses (id, name) VALUES (${sqlString(id)}, ${sqlString(data.name)})`);
    const created = await this.getById(id);
    if (!created) throw new Error("Created course was not found");
    return created;
  }

  async update(id: string, data: { name?: string }): Promise<CourseRow | undefined> {
    const updates: string[] = [];
    if (data.name !== undefined) updates.push(`name = ${sqlString(data.name)}`);
    if (updates.length === 0) return this.getById(id);

    await run(`UPDATE courses SET ${updates.join(", ")} WHERE id = ${sqlString(id)}`);
    return this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await run(`DELETE FROM courses WHERE id = ${sqlString(id)}`);
    return result.changes > 0;
  }
}
