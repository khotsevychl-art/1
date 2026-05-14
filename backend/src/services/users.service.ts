import { randomUUID } from "crypto";
import { UsersStore } from "../store/users.store";

export class UsersService {

  private store = new UsersStore();

  getAll() {
    return this.store.getAll();
  }

  getById(id: string) {
    return this.store.getById(id);
  }

  create(dto: any) {

    const user = {
      id: randomUUID(),
      name: dto.name,
      createdAt: new Date().toISOString()
    };

    return this.store.create(user);
  }

  delete(id: string) {
    return this.store.delete(id);
  }
}