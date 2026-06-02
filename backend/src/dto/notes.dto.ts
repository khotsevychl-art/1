export type CreateNoteRequestDto = {
  courseId: string;
  title: string;
  note: string;
};

export type UpdateNoteRequestDto = Partial<CreateNoteRequestDto>;

export type NoteResponseDto = {
  id: string;
  userId: string;
  courseId: string;
  title: string;
  note: string;
  createdAt: string;
};

export type NoteWithRelationsResponseDto = NoteResponseDto & {
  courseName: string;
  userName: string;
};

export type NoteStatsResponseDto = {
  courseId: string;
  courseName: string;
  notesCount: number;
  totalNoteLength: number;
  averageNoteLength: number;
};
