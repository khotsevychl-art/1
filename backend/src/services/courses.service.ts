import { CreateCourseRequestDto, CourseResponseDto, UpdateCourseRequestDto } from "../dto/courses.dto";
import { AppError } from "../errors/AppError";
import { CoursesStore, CourseRow } from "../store/courses.store";
import { NotesStore } from "../store/notes.store";
import { normalizeOrder, normalizePage, normalizePageSize, normalizeSort } from "../utils/sql";

const coursesStore = new CoursesStore();
const notesStore = new NotesStore();
const courseSortColumns = ["id", "name"];

function toCourseResponse(row: CourseRow): CourseResponseDto {
  return { id: row.id, name: row.name };
}

function validateCourseName(value: unknown): string {
  if (typeof value !== "string" || value.trim().length < 2) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid request", "name must be at least 2 characters");
  }
  return value.trim();
}

export class CoursesService {
  async getAll(query: Record<string, unknown>): Promise<CourseResponseDto[]> {
    const rows = await coursesStore.getAll({
      sort: normalizeSort(query.sort, courseSortColumns, "name"),
      order: normalizeOrder(query.order),
      page: normalizePage(query.page),
      pageSize: normalizePageSize(query.pageSize)
    });
    return rows.map(toCourseResponse);
  }

  async getById(id: string): Promise<CourseResponseDto> {
    const course = await coursesStore.getById(id);
    if (!course) throw new AppError(404, "NOT_FOUND", "Course not found");
    return toCourseResponse(course);
  }

  async create(data: CreateCourseRequestDto): Promise<CourseResponseDto> {
    const name = validateCourseName(data.name);
    const duplicate = await coursesStore.getByName(name);
    if (duplicate) throw new AppError(409, "CONFLICT", "Course with this name already exists");

    const created = await coursesStore.create({ name });
    return toCourseResponse(created);
  }

  async update(id: string, data: CreateCourseRequestDto): Promise<CourseResponseDto> {
    await this.getById(id);
    const name = validateCourseName(data.name);
    const duplicate = await coursesStore.getByName(name);
    if (duplicate && duplicate.id !== id) throw new AppError(409, "CONFLICT", "Course with this name already exists");

    const updated = await coursesStore.update(id, { name });
    if (!updated) throw new AppError(404, "NOT_FOUND", "Course not found");
    return toCourseResponse(updated);
  }

  async patch(id: string, data: UpdateCourseRequestDto): Promise<CourseResponseDto> {
    const current = await coursesStore.getById(id);
    if (!current) throw new AppError(404, "NOT_FOUND", "Course not found");
    return this.update(id, { name: data.name ?? current.name });
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    const linkedNotes = await notesStore.countByCourse(id);
    if (linkedNotes > 0) {
      throw new AppError(409, "CONFLICT", "Course cannot be deleted because it has notes", { linkedNotes });
    }

    const deleted = await coursesStore.delete(id);
    if (!deleted) throw new AppError(404, "NOT_FOUND", "Course not found");
  }
}
