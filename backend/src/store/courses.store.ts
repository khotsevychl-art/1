import { randomUUID } from "crypto";
import { all, get, run } from "../infrastructure/db";

export type CourseRow = {
  id: string;
  name: string;
};

const allowedSort = new Set(["id", "name"]);

export class CoursesStore {
  async getAll(params: { sort?: string; order?: "ASC" | "DESC"; page?: number; pageSize?: number } = {}): Promise<CourseRow[]> {
    const sort = allowedSort.has(params.sort ?? "") ? params.sort : "name";
    const order = params.order === "DESC" ? "DESC" : "ASC";
    const page = Math.max(Number(params.page ?? 1), 1);
    const pageSize = Math.min(Math.max(Number(params.pageSize ?? 50), 1), 100);
    const offset = (page - 1) * pageSize;

    return all<CourseRow>(`SELECT * FROM courses ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`, [pageSize, offset]);
  }

  async getById(id: string): Promise<CourseRow | undefined> {
    return get<CourseRow>("SELECT * FROM courses WHERE id = ?", [id]);
  }

  async getByName(name: string): Promise<CourseRow | undefined> {
    return get<CourseRow>("SELECT * FROM courses WHERE name = ?", [name]);
  }

  async create(data: { name: string }): Promise<CourseRow> {
    const id = randomUUID();
    await run("INSERT INTO courses (id, name) VALUES (?, ?)", [id, data.name]);
    const created = await this.getById(id);
    if (!created) throw new Error("Created course was not found");
    return created;
  }

  async update(id: string, data: { name?: string }): Promise<CourseRow | undefined> {
    if (data.name === undefined) return this.getById(id);
    await run("UPDATE courses SET name = ? WHERE id = ?", [data.name, id]);
    return this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await run("DELETE FROM courses WHERE id = ?", [id]);
    return result.changes > 0;
  }
}
