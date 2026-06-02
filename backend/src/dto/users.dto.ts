export type CreateUserRequestDto = {
  name: string;
};

export type UpdateUserRequestDto = Partial<CreateUserRequestDto>;

export type UserResponseDto = {
  id: string;
  name: string;
  createdAt: string;
};
