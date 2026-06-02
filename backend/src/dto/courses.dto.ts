export type CreateCourseRequestDto = {
  name: string;
};

export type UpdateCourseRequestDto = Partial<CreateCourseRequestDto>;

export type CourseResponseDto = {
  id: string;
  name: string;
};
