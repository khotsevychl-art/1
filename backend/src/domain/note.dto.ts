export interface CreateNoteDto {
  userId: string;
  courseId: string;
  title: string;
  note: string;
}

export interface UpdateNoteDto {
  userId?: string;
  courseId?: string;
  title?: string;
  note?: string;
}

export interface NoteResponseDto {
  id: string;
  userId: string;
  courseId: string;
  title: string;
  note: string;
  createdAt: string;
  priority?: "normal";
}

export interface NotesQueryDto {
  courseId?: string;
  search?: string;
  sortBy?: "title" | "createdAt" | "courseId";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}
