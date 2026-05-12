import { notes } from "../store/notes.store";
import { CreateNoteDto, UpdateNoteDto, NoteResponseDto } from "../domain/note.dto";
import { randomUUID } from "crypto";

export class NotesService {
 getAll(
  courseId?: string,
  page = 1,
  pageSize = 10,
  sortBy: "title" | "createdAt" = "createdAt",
  sortDir: "asc" | "desc" = "desc"
) {
  let filtered = courseId
    ? notes.filter(n => n.courseId === courseId)
    : notes;

  filtered = filtered.sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];

    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const total = filtered.length;

  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: filtered.slice(start, end),
    total,
    page,
    pageSize,
    sortBy,
    sortDir
  };
}

  getById(id: string) {
    return notes.find(n => n.id === id);
  }

  create(dto: CreateNoteDto): NoteResponseDto {
    const note: NoteResponseDto = {
      id: randomUUID(),
      courseId: dto.courseId,
      title: dto.title,
      note: dto.note,
      createdAt: new Date().toISOString()
    };

    notes.push(note);
    return note;
  }

  update(id: string, dto: UpdateNoteDto) {
    const note = notes.find(n => n.id === id);
    if (!note) return null;

    if (dto.courseId !== undefined) note.courseId = dto.courseId;
    if (dto.title !== undefined) note.title = dto.title;
    if (dto.note !== undefined) note.note = dto.note;

    return note;
  }

  delete(id: string) {
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) return false;

    notes.splice(index, 1);
    return true;
  }
}