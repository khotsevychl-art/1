import { cancelActiveRequest, clearListCache, create, createUser, getById, getCourses, getList, getNotesStats, getNotesWithRelations, getUsers, remove, update, } from "./apiClient.js";
import { clearErrors, elements, fillCourseSelects, fillUserSelect, renderDetails, renderListStatus, renderNotes, renderRelations, renderStats, renderStatus, renderUsers, setFormEnabled, setUserFormEnabled, showFieldErrors, showNotice, updatePager, } from "./ui.js";
let editId = null;
let currentPage = 1;
let currentItems = [];
let currentTotal = 0;
let coursesState = [];
let usersState = [];
const fallbackCourses = [
    { id: "1", name: "Math" },
    { id: "2", name: "ITK" },
    { id: "3", name: "Security" },
];
function getQuery() {
    return {
        search: elements.searchInput.value.trim(),
        courseId: elements.courseFilter.value,
        sortBy: elements.sortBySelect.value,
        sortDir: elements.sortDirSelect.value,
        page: currentPage,
        pageSize: Number(elements.pageSizeSelect.value),
    };
}
function validate(dto) {
    clearErrors();
    let ok = true;
    if (!dto.userId) {
        elements.noteUserError.textContent = "Оберіть користувача";
        ok = false;
    }
    if (!dto.courseId) {
        elements.courseError.textContent = "Оберіть курс";
        ok = false;
    }
    if (dto.title.length < 3) {
        elements.titleError.textContent = "Мінімум 3 символи";
        ok = false;
    }
    if (dto.title.length > 80) {
        elements.titleError.textContent = "Максимум 80 символів";
        ok = false;
    }
    if (dto.note.length < 5) {
        elements.noteError.textContent = "Мінімум 5 символів";
        ok = false;
    }
    if (dto.note.length > 1000) {
        elements.noteError.textContent = "Максимум 1000 символів";
        ok = false;
    }
    return ok;
}
async function loadCourses() {
    try {
        const courses = await getCourses();
        coursesState = courses.length ? courses : fallbackCourses;
        fillCourseSelects(coursesState);
    }
    catch {
        coursesState = fallbackCourses;
        fillCourseSelects(coursesState);
        showNotice("Курси взято з резервного списку, бо API курсів недоступне", "info");
    }
}
async function loadList(force = false) {
    if (force)
        clearListCache();
    renderListStatus("loading");
    elements.cancelBtn.disabled = false;
    try {
        const result = await getList(getQuery());
        currentItems = result.data ?? [];
        currentTotal = result.meta?.total ?? currentItems.length;
        renderNotes(currentItems, coursesState, usersState);
        updatePager(currentPage, currentTotal, Number(elements.pageSizeSelect.value));
        if (currentItems.length === 0)
            renderListStatus("empty");
        else
            renderListStatus("success");
    }
    catch (e) {
        const err = e;
        currentItems = [];
        currentTotal = 0;
        renderNotes([], coursesState, usersState);
        renderListStatus("error", err);
        showNotice(`${err.message}. ${err.detail ?? ""}`, "error");
    }
    finally {
        elements.cancelBtn.disabled = true;
    }
}
async function loadRelations() {
    renderStatus(elements.relationsStatus, "loading");
    try {
        const rows = await getNotesWithRelations();
        renderRelations(rows);
        renderStatus(elements.relationsStatus, rows.length ? "success" : "empty", "Немає зв'язаних нотаток");
    }
    catch (e) {
        const err = e;
        renderRelations([]);
        renderStatus(elements.relationsStatus, "error", "", err);
    }
}
async function loadStats() {
    renderStatus(elements.statsStatus, "loading");
    try {
        const rows = await getNotesStats();
        renderStats(rows, coursesState);
        renderStatus(elements.statsStatus, rows.length ? "success" : "empty", "Статистика ще порожня");
    }
    catch (e) {
        const err = e;
        renderStats([], coursesState);
        renderStatus(elements.statsStatus, "error", "", err);
    }
}
async function loadUsers() {
    renderStatus(elements.usersStatus, "loading");
    try {
        const users = await getUsers();
        usersState = users;
        fillUserSelect(usersState);
        renderUsers(users);
        renderStatus(elements.usersStatus, users.length ? "success" : "empty", "Користувачів немає");
    }
    catch (e) {
        const err = e;
        usersState = [];
        fillUserSelect([]);
        renderUsers([]);
        renderStatus(elements.usersStatus, "error", "", err);
    }
}
function resetForm() {
    editId = null;
    elements.submitBtn.textContent = "Додати";
    elements.formTitle.textContent = "Додати нотатку";
    elements.noteForm.reset();
    clearErrors();
}
function readForm() {
    return {
        userId: elements.userSelect.value,
        courseId: elements.courseSelect.value,
        title: document.getElementById("titleInput").value.trim(),
        note: document.getElementById("noteText").value.trim(),
    };
}
elements.noteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const dto = readForm();
    if (!validate(dto))
        return;
    setFormEnabled(false);
    try {
        if (editId) {
            await update(editId, dto);
            showNotice("Нотатку оновлено через PUT", "success");
        }
        else {
            await create(dto);
            showNotice("Нотатку створено", "success");
        }
        resetForm();
        await loadList(true);
        await Promise.all([loadRelations(), loadStats()]);
    }
    catch (e) {
        const err = e;
        showFieldErrors(err.errors);
        showNotice(`${err.message}. ${err.detail ?? ""}`, "error");
    }
    finally {
        setFormEnabled(true);
    }
});
elements.userForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();
    const name = elements.userNameInput.value.trim();
    if (name.length < 2) {
        elements.userError.textContent = "Мінімум 2 символи";
        return;
    }
    if (name.length > 60) {
        elements.userError.textContent = "Максимум 60 символів";
        return;
    }
    setUserFormEnabled(false);
    try {
        await createUser({ name });
        elements.userForm.reset();
        showNotice("Користувача створено. Тепер його можна обрати у формі нотатки", "success");
        await loadUsers();
    }
    catch (e) {
        const err = e;
        showNotice(`${err.message}. ${err.detail ?? ""}`, "error");
    }
    finally {
        setUserFormEnabled(true);
    }
});
elements.notesTableBody.addEventListener("click", async (e) => {
    const target = e.target;
    const id = target.dataset.id;
    if (!id)
        return;
    if (target.classList.contains("delete-btn")) {
        const confirmed = window.confirm("Видалити цю нотатку?");
        if (!confirmed)
            return;
        try {
            await remove(id);
            showNotice("Нотатку видалено", "success");
            await loadList(true);
            await Promise.all([loadRelations(), loadStats()]);
        }
        catch (err) {
            const apiErr = err;
            showNotice(`${apiErr.message}. ${apiErr.detail ?? ""}`, "error");
        }
    }
    if (target.classList.contains("edit-btn")) {
        const note = currentItems.find((x) => x.id === id) ?? (await getById(id));
        elements.userSelect.value = note.userId;
        elements.courseSelect.value = note.courseId;
        document.getElementById("titleInput").value = note.title;
        document.getElementById("noteText").value = note.note;
        editId = id;
        elements.submitBtn.textContent = "Зберегти";
        elements.formTitle.textContent = "Редагування нотатки";
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (target.classList.contains("details-btn")) {
        try {
            const note = await getById(id);
            renderDetails(note, coursesState, usersState);
        }
        catch (err) {
            const apiErr = err;
            showNotice(`${apiErr.message}. ${apiErr.detail ?? ""}`, "error");
        }
    }
});
elements.searchInput.addEventListener("input", () => {
    currentPage = 1;
    loadList();
});
elements.courseFilter.addEventListener("change", () => {
    currentPage = 1;
    loadList();
});
elements.sortBySelect.addEventListener("change", () => loadList());
elements.sortDirSelect.addEventListener("change", () => loadList());
elements.pageSizeSelect.addEventListener("change", () => {
    currentPage = 1;
    loadList(true);
});
elements.prevPageBtn.addEventListener("click", () => {
    currentPage = Math.max(currentPage - 1, 1);
    loadList();
});
elements.nextPageBtn.addEventListener("click", () => {
    currentPage += 1;
    loadList();
});
elements.refreshBtn.addEventListener("click", () => loadList(true));
elements.refreshRelationsBtn.addEventListener("click", loadRelations);
elements.refreshStatsBtn.addEventListener("click", loadStats);
elements.refreshUsersBtn.addEventListener("click", loadUsers);
elements.cancelBtn.addEventListener("click", cancelActiveRequest);
elements.resetBtn.addEventListener("click", resetForm);
Promise.all([loadCourses(), loadUsers()]).then(async () => {
    await loadList();
    await Promise.all([loadRelations(), loadStats()]);
});
