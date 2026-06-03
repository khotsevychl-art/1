import type { ApiError, CourseDto, NoteDto, NoteRelationDto, NoteStatsDto, UserDto } from "./dtos.js";

const getEl = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

export const elements = {
  noteForm: getEl<HTMLFormElement>("noteForm"),
  userForm: getEl<HTMLFormElement>("userForm"),
  notesTableBody: getEl<HTMLTableSectionElement>("notesTableBody"),
  relationsTableBody: getEl<HTMLTableSectionElement>("relationsTableBody"),
  statsTableBody: getEl<HTMLTableSectionElement>("statsTableBody"),
  searchInput: getEl<HTMLInputElement>("searchInput"),
  courseFilter: getEl<HTMLSelectElement>("courseFilter"),
  courseSelect: getEl<HTMLSelectElement>("courseSelect"),
  userSelect: getEl<HTMLSelectElement>("userSelect"),
  sortBySelect: getEl<HTMLSelectElement>("sortBySelect"),
  sortDirSelect: getEl<HTMLSelectElement>("sortDirSelect"),
  pageSizeSelect: getEl<HTMLSelectElement>("pageSizeSelect"),
  userNameInput: getEl<HTMLInputElement>("userNameInput"),
  submitBtn: getEl<HTMLButtonElement>("submitBtn"),
  resetBtn: getEl<HTMLButtonElement>("resetBtn"),
  refreshBtn: getEl<HTMLButtonElement>("refreshBtn"),
  refreshRelationsBtn: getEl<HTMLButtonElement>("refreshRelationsBtn"),
  refreshStatsBtn: getEl<HTMLButtonElement>("refreshStatsBtn"),
  refreshUsersBtn: getEl<HTMLButtonElement>("refreshUsersBtn"),
  createUserBtn: getEl<HTMLButtonElement>("createUserBtn"),
  cancelBtn: getEl<HTMLButtonElement>("cancelBtn"),
  prevPageBtn: getEl<HTMLButtonElement>("prevPageBtn"),
  nextPageBtn: getEl<HTMLButtonElement>("nextPageBtn"),
  formTitle: getEl<HTMLHeadingElement>("formTitle"),
  noteUserError: getEl<HTMLParagraphElement>("noteUserError"),
  courseError: getEl<HTMLParagraphElement>("courseError"),
  titleError: getEl<HTMLParagraphElement>("titleError"),
  noteError: getEl<HTMLParagraphElement>("noteError"),
  userError: getEl<HTMLParagraphElement>("userError"),
  notice: getEl<HTMLDivElement>("notice"),
  listStatus: getEl<HTMLDivElement>("listStatus"),
  relationsStatus: getEl<HTMLDivElement>("relationsStatus"),
  statsStatus: getEl<HTMLDivElement>("statsStatus"),
  usersStatus: getEl<HTMLDivElement>("usersStatus"),
  usersList: getEl<HTMLDivElement>("usersList"),
  detailsPanel: getEl<HTMLDivElement>("detailsPanel"),
  pageInfo: getEl<HTMLSpanElement>("pageInfo"),
};

export function fillCourseSelects(courses: CourseDto[]) {
  const selects = [elements.courseSelect, elements.courseFilter];

  selects.forEach((select) => {
    const firstText = select.id === "courseFilter" ? "Усі дисципліни" : "Оберіть курс...";
    select.innerHTML = `<option value="">${firstText}</option>`;

    courses.forEach((course) => {
      const option = document.createElement("option");
      option.value = course.id;
      option.textContent = course.name;
      select.appendChild(option);
    });
  });
}

export function fillUserSelect(users: UserDto[]) {
  elements.userSelect.innerHTML = `<option value="">Оберіть користувача...</option>`;

  users.forEach((user) => {
    const option = document.createElement("option");
    option.value = user.id;
    option.textContent = user.name || "Користувач без імені";
    elements.userSelect.appendChild(option);
  });
}

export function renderStatus(
  el: HTMLElement,
  status: "idle" | "loading" | "success" | "empty" | "error",
  emptyText = "Немає даних",
  err?: ApiError
) {
  if (status === "success" || status === "idle") {
    el.className = "status";
    el.textContent = "";
    return;
  }

  el.className = `status status-${status}`;

  if (status === "loading") el.textContent = "Завантаження...";
  else if (status === "empty") el.textContent = emptyText;
  else if (status === "error") el.textContent = `Помилка (${err?.status ?? 0}): ${err?.message ?? "невідома"}`;
}

export function renderListStatus(status: "idle" | "loading" | "success" | "empty" | "error", err?: ApiError) {
  renderStatus(elements.listStatus, status, "Немає нотаток", err);
}

export function renderNotes(notes: NoteDto[], courses: CourseDto[] = [], users: UserDto[] = []) {
  elements.notesTableBody.innerHTML = "";
  const courseMap = new Map(courses.map((course) => [course.id, course.name]));
  const userMap = new Map(users.map((user) => [user.id, user.name]));

  notes.forEach((note) => {
    const row = document.createElement("tr");

    const fields = [
      userMap.get(note.userId) ?? "—",
      courseMap.get(note.courseId) ?? "—",
      note.title ?? "(без назви)",
      note.note ?? "—",
      note.priority ?? "normal",
      new Date(note.createdAt).toLocaleString("uk-UA"),
    ];

    fields.forEach((field) => {
      const cell = document.createElement("td");
      cell.textContent = field;
      row.appendChild(cell);
    });

    const actionCell = document.createElement("td");

    const detailsButton = document.createElement("button");
    detailsButton.className = "details-btn";
    detailsButton.dataset.id = note.id;
    detailsButton.textContent = "Деталі";

    const editButton = document.createElement("button");
    editButton.className = "edit-btn";
    editButton.dataset.id = note.id;
    editButton.textContent = "Редагувати";

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.dataset.id = note.id;
    deleteButton.textContent = "Видалити";

    actionCell.append(detailsButton, editButton, deleteButton);
    row.appendChild(actionCell);
    elements.notesTableBody.appendChild(row);
  });
}

export function renderDetails(note: NoteDto, courses: CourseDto[] = [], users: UserDto[] = []) {
  elements.detailsPanel.innerHTML = "";
  const courseName = courses.find((course) => course.id === note.courseId)?.name ?? "—";
  const userName = users.find((user) => user.id === note.userId)?.name ?? "—";

  const title = document.createElement("h3");
  title.textContent = note.title ?? "(без назви)";

  const text = document.createElement("p");
  text.textContent = note.note ?? "—";

  const meta = document.createElement("p");
  meta.className = "muted";
  meta.textContent = `Користувач: ${userName} | Курс: ${courseName} | Дата: ${new Date(note.createdAt).toLocaleString("uk-UA")}`;

  elements.detailsPanel.append(title, text, meta);
}

export function renderRelations(rows: NoteRelationDto[]) {
  elements.relationsTableBody.innerHTML = "";

  rows.forEach((item) => {
    const row = document.createElement("tr");
    [item.title, item.note, item.userName, item.courseName].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value ?? "—";
      row.appendChild(cell);
    });
    elements.relationsTableBody.appendChild(row);
  });
}

export function renderStats(rows: NoteStatsDto[], courses: CourseDto[]) {
  elements.statsTableBody.innerHTML = "";
  const courseMap = new Map(courses.map((course) => [course.id, course.name]));

  rows.forEach((item) => {
    const row = document.createElement("tr");
    [courseMap.get(item.courseId) ?? item.courseId, String(item.total)].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });
    elements.statsTableBody.appendChild(row);
  });
}

export function renderUsers(users: UserDto[]) {
  elements.usersList.innerHTML = "";

  users.forEach((user) => {
    const card = document.createElement("div");
    card.className = "user-card";

    const name = document.createElement("strong");
    name.textContent = user.name || "Користувач без імені";

    const created = document.createElement("span");
    const createdRaw = user.createdAt ?? user.created_at;
    created.textContent = createdRaw ? `Створено: ${new Date(createdRaw).toLocaleString("uk-UA")}` : "";

    card.append(name, created);
    elements.usersList.appendChild(card);
  });
}

export function showNotice(text: string, type: "success" | "error" | "info" = "info") {
  elements.notice.className = `notice notice-${type}`;
  elements.notice.textContent = text;

  if (text) {
    window.setTimeout(() => {
      elements.notice.textContent = "";
      elements.notice.className = "notice";
    }, 4500);
  }
}

export function clearErrors() {
  elements.noteUserError.textContent = "";
  elements.courseError.textContent = "";
  elements.titleError.textContent = "";
  elements.noteError.textContent = "";
  elements.userError.textContent = "";
}

export function showFieldErrors(errors?: Record<string, string[]>) {
  clearErrors();
  if (!errors) return;

  elements.noteUserError.textContent = errors.userId?.join(", ") ?? "";
  elements.courseError.textContent = errors.courseId?.join(", ") ?? "";
  elements.titleError.textContent = errors.title?.join(", ") ?? "";
  elements.noteError.textContent = errors.note?.join(", ") ?? "";
  elements.userError.textContent = errors.name?.join(", ") ?? "";
}

export function setFormEnabled(isEnabled: boolean) {
  const fields = elements.noteForm.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement>(
    "input, select, textarea, button"
  );

  fields.forEach((field) => {
    field.disabled = !isEnabled;
  });
}

export function setUserFormEnabled(isEnabled: boolean) {
  const fields = elements.userForm.querySelectorAll<HTMLInputElement | HTMLButtonElement>("input, button");

  fields.forEach((field) => {
    field.disabled = !isEnabled;
  });
}

export function updatePager(page: number, total: number, pageSize: number) {
  const pages = Math.max(Math.ceil(total / pageSize), 1);
  elements.pageInfo.textContent = `Сторінка ${page} з ${pages} | Усього: ${total}`;
  elements.prevPageBtn.disabled = page <= 1;
  elements.nextPageBtn.disabled = page >= pages;
}
