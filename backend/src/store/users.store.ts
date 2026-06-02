import { randomUUID } from "crypto";
import { all, get, run } from "../infrastructure/db";
import { sqlNumber, sqlString } from "../utils/sql";

export type UserRow = {
  id: string;
  name: string;
  created_at: string;
};

export class UsersStore {
  async getAll(params: { sort: string; order: "ASC" | "DESC"; page: number; pageSize: number }): Promise<UserRow[]> {
    const offset = (params.page - 1) * params.pageSize;
    return all<UserRow>(
      `SELECT * FROM users ORDER BY ${params.sort} ${params.order} LIMIT ${sqlNumber(params.pageSize)} OFFSET ${sqlNumber(offset)}`
    );
  }

  async getById(id: string): Promise<UserRow | undefined> {
    return get<UserRow>(`SELECT * FROM users WHERE id = ${sqlString(id)}`);
  }

  async create(data: { name: string }): Promise<UserRow> {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    await run(`INSERT INTO users (id, name, created_at) VALUES (${sqlString(id)}, ${sqlString(data.name)}, ${sqlString(createdAt)})`);
    const created = await this.getById(id);
    if (!created) throw new Error("Created user was not found");
    return created;
  }

  async update(id: string, data: { name?: string }): Promise<UserRow | undefined> {
    const updates: string[] = [];
    if (data.name !== undefined) updates.push(`name = ${sqlString(data.name)}`);
    if (updates.length === 0) return this.getById(id);

    await run(`UPDATE users SET ${updates.join(", ")} WHERE id = ${sqlString(id)}`);
    return this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await run(`DELETE FROM users WHERE id = ${sqlString(id)}`);
    return result.changes > 0;
  }
}
