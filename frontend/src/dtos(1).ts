export type Id = string;

export interface NoteDto {
  id: Id;
  userId: Id;
  courseId: Id;
  title: string;
  note: string;
  createdAt: string;
  priority?: "normal";
}

export interface NoteRelationDto {
  id: Id;
  title: string;
  note: string;
  userName: string;
  courseName: string;
}

export interface NoteStatsDto {
  courseId: Id;
  total: number;
}

export interface CourseDto {
  id: Id;
  name: string;
}

export interface UserDto {
  id: Id;
  name: string;
  created_at?: string;
  createdAt?: string;
}

export interface CreateUserDto {
  name: string;
}

export interface CreateNoteDto {
  userId: Id;
  courseId: Id;
  title: string;
  note: string;
}

export type UpdateNoteDto = CreateNoteDto;
export type PartialUpdateNoteDto = Partial<CreateNoteDto>;

export interface ApiListResponse<T> {
  data: T[];
  meta?: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface ApiSingleResponse<T> {
  data: T;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

export interface NoteListQuery {
  courseId?: string;
  search?: string;
  sortBy?: "title" | "createdAt" | "courseId";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}
