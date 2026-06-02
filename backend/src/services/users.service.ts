import { CreateUserRequestDto, UpdateUserRequestDto, UserResponseDto } from "../dto/users.dto";
import { AppError } from "../errors/AppError";
import { NotesStore } from "../store/notes.store";
import { UserRow, UsersStore } from "../store/users.store";
import { normalizeOrder, normalizePage, normalizePageSize, normalizeSort } from "../utils/sql";

const usersStore = new UsersStore();
const notesStore = new NotesStore();
const userSortColumns = ["created_at", "name", "id"];

function toUserResponse(row: UserRow): UserResponseDto {
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

function validateUserName(value: unknown): string {
  if (typeof value !== "string" || value.trim().length < 2) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid request", "name must be at least 2 characters");
  }
  return value.trim();
}

export class UsersService {
  async getAll(query: Record<string, unknown>): Promise<UserResponseDto[]> {
    const rows = await usersStore.getAll({
      sort: normalizeSort(query.sort, userSortColumns, "created_at"),
      order: normalizeOrder(query.order),
      page: normalizePage(query.page),
      pageSize: normalizePageSize(query.pageSize)
    });
    return rows.map(toUserResponse);
  }

  async getById(id: string): Promise<UserResponseDto> {
    const user = await usersStore.getById(id);
    if (!user) throw new AppError(404, "NOT_FOUND", "User not found");
    return toUserResponse(user);
  }

  async create(data: CreateUserRequestDto): Promise<UserResponseDto> {
    const name = validateUserName(data.name);
    const created = await usersStore.create({ name });
    return toUserResponse(created);
  }

  async update(id: string, data: CreateUserRequestDto): Promise<UserResponseDto> {
    await this.getById(id);
    const name = validateUserName(data.name);
    const updated = await usersStore.update(id, { name });
    if (!updated) throw new AppError(404, "NOT_FOUND", "User not found");
    return toUserResponse(updated);
  }

  async patch(id: string, data: UpdateUserRequestDto): Promise<UserResponseDto> {
    const current = await usersStore.getById(id);
    if (!current) throw new AppError(404, "NOT_FOUND", "User not found");
    return this.update(id, { name: data.name ?? current.name });
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    const linkedNotes = await notesStore.countByUser(id);
    if (linkedNotes > 0) {
      throw new AppError(409, "CONFLICT", "User cannot be deleted because it has notes", { linkedNotes });
    }

    const deleted = await usersStore.delete(id);
    if (!deleted) throw new AppError(404, "NOT_FOUND", "User not found");
  }
}
