let editId = null;

const noteForm = document.getElementById('noteForm');
const notesTableBody = document.getElementById('notesTableBody');
const searchInput = document.getElementById('searchInput');
const courseFilter = document.getElementById('courseFilter');
const submitBtn = document.getElementById('submitBtn');
const formTitle = document.getElementById('formTitle');

const courseError = document.getElementById('courseError');
const titleError = document.getElementById('titleError');
const noteError = document.getElementById('noteError');

function getNotes() {
    return JSON.parse(localStorage.getItem('studentNotes')) || [];
}

function saveNotes(notes) {
    localStorage.setItem('studentNotes', JSON.stringify(notes));
}

function loadCourses() {
    const fallback = [
        { id: "math", name: "Вища математика" },
        { id: "itk", name: "ІТК" },
        { id: "cyber", name: "Кібербезпека та захист інформації" }
    ];

    fillCourseSelects(fallback);
}

function fillCourseSelects(courses) {
    const selects = [document.getElementById('courseSelect'), courseFilter];

    selects.forEach(select => {
        select.innerHTML = `<option value="">Усі дисципліни</option>`;

        courses.forEach(c => {
            const option = document.createElement("option");
            option.value = c.id;
            option.textContent = c.name;
            select.appendChild(option);
        });
    });
}

function renderNotes() {
    const notes = getNotes();

    const searchText = searchInput.value.toLowerCase();
    const filterValue = courseFilter.value;

    notesTableBody.innerHTML = '';

    const filtered = notes.filter(n =>
        n.title.toLowerCase().includes(searchText) &&
        (filterValue === "" || n.courseId === filterValue)
    );

    filtered.sort((a, b) => b.id.localeCompare(a.id));

    filtered.forEach(n => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${n.courseId}</td>
            <td>${n.title}</td>
            <td>${n.note}</td>
            <td>${n.createdAt}</td>
            <td>
                <button class="edit-btn" data-id="${n.id}">Редагувати</button>
                <button class="delete-btn" data-id="${n.id}">Видалити</button>
            </td>
        `;

        notesTableBody.appendChild(row);
    });
}

function clearErrors() {
    courseError.textContent = '';
    titleError.textContent = '';
    noteError.textContent = '';
}

function validate(courseId, title, note) {
    clearErrors();

    let ok = true;

    if (!courseId) {
        courseError.textContent = 'Оберіть курс';
        ok = false;
    }

    if (title.length < 3) {
        titleError.textContent = 'Мінімум 3 символи';
        ok = false;
    }

    if (note.length < 5) {
        noteError.textContent = 'Мінімум 5 символів';
        ok = false;
    }

    return ok;
}

noteForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const courseId = document.getElementById('courseSelect').value;
    const title = document.getElementById('titleInput').value.trim();
    const note = document.getElementById('noteText').value.trim();

    if (!validate(courseId, title, note)) return;

    let notes = getNotes();

    if (editId) {
        notes = notes.map(n =>
            n.id === editId
                ? { ...n, courseId, title, note }
                : n
        );
    } else {
        notes.push({
            id: Date.now().toString(),
            courseId,
            title,
            note,
            createdAt: new Date().toLocaleString()
        });
    }

    saveNotes(notes);

    resetForm();
    renderNotes();
});

notesTableBody.addEventListener('click', (e) => {
    const id = e.target.dataset.id;

    if (e.target.classList.contains('delete-btn')) {
        let notes = getNotes();
        notes = notes.filter(n => n.id !== id);
        saveNotes(notes);
        renderNotes();
    }

    if (e.target.classList.contains('edit-btn')) {
        const notes = getNotes();
        const n = notes.find(x => x.id === id);

        document.getElementById('courseSelect').value = n.courseId;
        document.getElementById('titleInput').value = n.title;
        document.getElementById('noteText').value = n.note;

        editId = id;

        submitBtn.textContent = 'Зберегти';
        formTitle.textContent = 'Редагування нотатки';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

function resetForm() {
    editId = null;
    submitBtn.textContent = 'Додати';
    formTitle.textContent = 'Додати нотатку';

    noteForm.reset();
    clearErrors();
}

searchInput.addEventListener('input', renderNotes);
courseFilter.addEventListener('change', renderNotes);

document.getElementById('resetBtn').addEventListener('click', resetForm);

loadCourses();
renderNotes();