import { ApiError } from "../infrastructure/apiError";
import { CoursesStore, CourseRow } from "../store/courses.store";
import { NotesStore } from "../store/notes.store";

const coursesStore = new CoursesStore();
const notesStore = new NotesStore();

function toCourseResponse(row: CourseRow) {
  return { id: row.id, name: row.name };
}

function validateCourseName(value: unknown): string {
  if (typeof value !== "string" || value.trim().length < 2) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid data", "name must be at least 2 characters", {
      name: ["Мінімум 2 символи"],
    });
  }
  return value.trim();
}

export class CoursesService {
  async getAll(query: Record<string, unknown> = {}) {
    const rows = await coursesStore.getAll({
      sort: typeof query.sort === "string" ? query.sort : undefined,
      order: String(query.order).toUpperCase() === "DESC" ? "DESC" : "ASC",
      page: Number(query.page ?? 1),
      pageSize: Number(query.pageSize ?? 50),
    });
    return rows.map(toCourseResponse);
  }

  async getById(id: string) {
    const course = await coursesStore.getById(id);
    if (!course) throw new ApiError(404, "COURSE_NOT_FOUND", "Course not found", `Course with id ${id} does not exist`);
    return toCourseResponse(course);
  }

  async create(data: { name: unknown }) {
    const name = validateCourseName(data.name);
    const duplicate = await coursesStore.getByName(name);
    if (duplicate) throw new ApiError(409, "DUPLICATE_COURSE", "Course with this name already exists");
    const created = await coursesStore.create({ name });
    return toCourseResponse(created);
  }

  async update(id: string, data: { name: unknown }) {
    await this.getById(id);
    const name = validateCourseName(data.name);
    const duplicate = await coursesStore.getByName(name);
    if (duplicate && duplicate.id !== id) throw new ApiError(409, "DUPLICATE_COURSE", "Course with this name already exists");
    const updated = await coursesStore.update(id, { name });
    if (!updated) throw new ApiError(404, "COURSE_NOT_FOUND", "Course not found");
    return toCourseResponse(updated);
  }

  async patch(id: string, data: { name?: unknown }) {
    const current = await coursesStore.getById(id);
    if (!current) throw new ApiError(404, "COURSE_NOT_FOUND", "Course not found");
    return this.update(id, { name: data.name ?? current.name });
  }

  async delete(id: string) {
    await this.getById(id);
    const linkedNotes = await notesStore.countByCourse(id);
    if (linkedNotes > 0) {
      throw new ApiError(409, "COURSE_HAS_NOTES", "Course cannot be deleted because it has notes", "Delete linked notes first", {
        linkedNotes: [String(linkedNotes)],
      });
    }
    const deleted = await coursesStore.delete(id);
    if (!deleted) throw new ApiError(404, "COURSE_NOT_FOUND", "Course not found");
  }
}
