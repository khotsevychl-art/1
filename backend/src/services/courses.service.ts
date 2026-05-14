import { CoursesStore } from "../store/courses.store";

export class CoursesService {

  private store = new CoursesStore();

  getAll() {
    return this.store.getAll();
  }
}