export interface CreateNoteDto {
  courseId: string;
  title: string;
  note: string;
}

export interface UpdateNoteDto {
  courseId?: string;
  title?: string;
  note?: string;
}

export interface NoteResponseDto {
  id: string;
  courseId: string;
  title: string;
  note: string;
  createdAt: string;
}