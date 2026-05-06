import { users } from "../store/users.store";
import { CreateUserDto, UserResponseDto } from "../domain/user.dto";
import { randomUUID } from "crypto";

export class UsersService {
  getAll() {
    return users;
  }

  create(dto: CreateUserDto): UserResponseDto {
    const user: UserResponseDto = {
      id: randomUUID(),
      name: dto.name,
      createdAt: new Date().toISOString()
    };

    users.push(user);
    return user;
  }
}