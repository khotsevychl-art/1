import { CreateNoteDto, NotesQueryDto, UpdateNoteDto } from "../domain/note.dto";
import { ApiError } from "../infrastructure/apiError";
import { CoursesStore } from "../store/courses.store";
import { NotesStore } from "../store/notes.store";
import { UsersStore } from "../store/users.store";

const store = new NotesStore();
const coursesStore = new CoursesStore();
const usersStore = new UsersStore();

async function ensureRelations(dto: Partial<CreateNoteDto>) {
  if (dto.userId) {
    const user = await usersStore.getById(dto.userId);
    if (!user) throw new ApiError(400, "VALIDATION_ERROR", "Invalid data", "userId does not exist", { userId: ["Користувача не знайдено"] });
  }

  if (dto.courseId) {
    const course = await coursesStore.getById(dto.courseId);
    if (!course) throw new ApiError(400, "VALIDATION_ERROR", "Invalid data", "courseId does not exist", { courseId: ["Курс не знайдено"] });
  }
}

export class NotesService {
  getAll(query: NotesQueryDto & Record<string, any>, currentUserId: string) {
    return store.getAll({ ...query, userId: currentUserId });
  }

  async getById(id: string, currentUserId: string) {
    const note = await store.getByIdForUser(id, currentUserId);
    if (!note) throw new ApiError(404, "NOTE_NOT_FOUND", "Note not found", "Note does not exist or belongs to another user");
    return note;
  }

  async create(dto: CreateNoteDto, currentUserId: string) {
    const safeDto = { ...dto, userId: currentUserId };
    await ensureRelations(safeDto);

    const exists = await store.existsByContent(safeDto.note);
    if (exists) {
      throw new ApiError(409, "DUPLICATE_NOTE", "Note with this content already exists", "Change note text and try again");
    }

    return store.create(safeDto, currentUserId);
  }

  async update(id: string, dto: UpdateNoteDto, currentUserId: string) {
    const safeDto = { ...dto, userId: currentUserId };
    await ensureRelations(safeDto);

    if (dto.note) {
      const exists = await store.existsByContent(dto.note, id);
      if (exists) {
        throw new ApiError(409, "DUPLICATE_NOTE", "Note with this content already exists", "Change note text and try again");
      }
    }

    const note = await store.update(id, safeDto, currentUserId);
    if (!note) throw new ApiError(404, "NOTE_NOT_FOUND", "Note not found", "Note does not exist or belongs to another user");
    return note;
  }

  async delete(id: string, currentUserId: string) {
    const deleted = await store.delete(id, currentUserId);
    if (!deleted) throw new ApiError(404, "NOTE_NOT_FOUND", "Note not found", "Note does not exist or belongs to another user");
  }

  getWithRelations(currentUserId: string, query: Record<string, any> = {}) {
    return store.getWithRelations({ ...query, userId: currentUserId });
  }

  searchTeachingDemo(currentUserId: string, query: Record<string, any> = {}) {
    return store.getWithRelations({ ...query, userId: currentUserId, search: query.search ?? query.q });
  }

  getStats(currentUserId: string) {
    return store.getStats(currentUserId);
  }
}
