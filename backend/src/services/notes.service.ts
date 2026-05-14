import { NotesStore } from "../store/notes.store";

const store = new NotesStore();

export class NotesService {

  getAll(courseId?: string, sort?: string) {
    return store.getAll(courseId, sort);
  }

  getById(id: string) {
    return store.getById(id);
  }

  create(dto: any) {
    return store.create(dto);
  }

  update(id: string, dto: any) {
    return store.update(id, dto);
  }

  delete(id: string) {
    return store.delete(id);
  }

  getWithRelations() {
    return store.getWithRelations();
  }

  getStats() {
    return store.getStats();
  }
}