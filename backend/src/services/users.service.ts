import { ApiError } from "../infrastructure/apiError";
import { NotesStore } from "../store/notes.store";
import { UserRow, UsersStore } from "../store/users.store";

const usersStore = new UsersStore();
const notesStore = new NotesStore();

function toUserResponse(row: UserRow) {
  return { id: row.id, name: row.name, createdAt: row.created_at, created_at: row.created_at };
}

function validateUserName(value: unknown): string {
  if (typeof value !== "string" || value.trim().length < 2) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid data", "name must be at least 2 characters", {
      name: ["Мінімум 2 символи"],
    });
  }
  return value.trim();
}

export class UsersService {
  async getAll(query: Record<string, unknown> = {}) {
    const rows = await usersStore.getAll({
      sort: typeof query.sort === "string" ? query.sort : undefined,
      order: String(query.order).toUpperCase() === "ASC" ? "ASC" : "DESC",
      page: Number(query.page ?? 1),
      pageSize: Number(query.pageSize ?? 50),
    });
    return rows.map(toUserResponse);
  }

  async getById(id: string) {
    const user = await usersStore.getById(id);
    if (!user) throw new ApiError(404, "USER_NOT_FOUND", "User not found", `User with id ${id} does not exist`);
    return toUserResponse(user);
  }

  async create(data: { name: unknown }) {
    const name = validateUserName(data.name);
    const created = await usersStore.create({ name });
    return toUserResponse(created);
  }

  async update(id: string, data: { name: unknown }) {
    await this.getById(id);
    const name = validateUserName(data.name);
    const updated = await usersStore.update(id, { name });
    if (!updated) throw new ApiError(404, "USER_NOT_FOUND", "User not found");
    return toUserResponse(updated);
  }

  async patch(id: string, data: { name?: unknown }) {
    const current = await usersStore.getById(id);
    if (!current) throw new ApiError(404, "USER_NOT_FOUND", "User not found");
    return this.update(id, { name: data.name ?? current.name });
  }

  async delete(id: string) {
    await this.getById(id);
    const linkedNotes = await notesStore.countByUser(id);
    if (linkedNotes > 0) {
      throw new ApiError(409, "USER_HAS_NOTES", "User cannot be deleted because it has notes", "Delete linked notes first", {
        linkedNotes: [String(linkedNotes)],
      });
    }
    const deleted = await usersStore.delete(id);
    if (!deleted) throw new ApiError(404, "USER_NOT_FOUND", "User not found");
  }
}
