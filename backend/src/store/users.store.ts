import { randomUUID } from "crypto";
import { all, get, run } from "../infrastructure/db";

export type UserRow = {
  id: string;
  name: string;
  created_at: string;
};

const allowedSort = new Set(["id", "name", "created_at"]);

export class UsersStore {
  async getAll(params: { sort?: string; order?: "ASC" | "DESC"; page?: number; pageSize?: number } = {}): Promise<UserRow[]> {
    const sort = allowedSort.has(params.sort ?? "") ? params.sort : "created_at";
    const order = params.order === "ASC" ? "ASC" : "DESC";
    const page = Math.max(Number(params.page ?? 1), 1);
    const pageSize = Math.min(Math.max(Number(params.pageSize ?? 50), 1), 100);
    const offset = (page - 1) * pageSize;

    return all<UserRow>(`SELECT * FROM users ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`, [pageSize, offset]);
  }

  async getById(id: string): Promise<UserRow | undefined> {
    return get<UserRow>("SELECT * FROM users WHERE id = ?", [id]);
  }

  async create(data: { name: string }): Promise<UserRow> {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    await run("INSERT INTO users (id, name, created_at) VALUES (?, ?, ?)", [id, data.name, createdAt]);
    const created = await this.getById(id);
    if (!created) throw new Error("Created user was not found");
    return created;
  }

  async update(id: string, data: { name?: string }): Promise<UserRow | undefined> {
    if (data.name === undefined) return this.getById(id);
    await run("UPDATE users SET name = ? WHERE id = ?", [data.name, id]);
    return this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await run("DELETE FROM users WHERE id = ?", [id]);
    return result.changes > 0;
  }
}
