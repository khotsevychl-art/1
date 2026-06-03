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
  getAll(query: NotesQueryDto & Record<string, any>) {
    return store.getAll(query);
  }

  async getById(id: string) {
    const note = await store.getById(id);
    if (!note) throw new ApiError(404, "NOTE_NOT_FOUND", "Note not found", `Note with id ${id} does not exist`);
    return note;
  }

  async create(dto: CreateNoteDto) {
    await ensureRelations(dto);

    const exists = await store.existsByContent(dto.note);
    if (exists) {
      throw new ApiError(409, "DUPLICATE_NOTE", "Note with this content already exists", "Change note text and try again");
    }

    return store.create(dto);
  }

  async update(id: string, dto: UpdateNoteDto) {
    await ensureRelations(dto);

    if (dto.note) {
      const exists = await store.existsByContent(dto.note, id);
      if (exists) {
        throw new ApiError(409, "DUPLICATE_NOTE", "Note with this content already exists", "Change note text and try again");
      }
    }

    const note = await store.update(id, dto);
    if (!note) throw new ApiError(404, "NOTE_NOT_FOUND", "Note not found", `Note with id ${id} does not exist`);
    return note;
  }

  async delete(id: string) {
    const deleted = await store.delete(id);
    if (!deleted) throw new ApiError(404, "NOTE_NOT_FOUND", "Note not found", `Note with id ${id} does not exist`);
  }

  getWithRelations(query: Record<string, any> = {}) {
    return store.getWithRelations(query);
  }

  searchTeachingDemo(query: Record<string, any> = {}) {
    return store.getWithRelations({ ...query, search: query.search ?? query.q });
  }

  getStats() {
    return store.getStats();
  }
}
