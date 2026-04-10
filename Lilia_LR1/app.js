let notes = JSON.parse(localStorage.getItem('studentNotes')) || [];
let editId = null;

const noteForm = document.getElementById('noteForm');
const notesTableBody = document.getElementById('notesTableBody');
const searchInput = document.getElementById('searchInput');
const courseFilter = document.getElementById('courseFilter');
const submitBtn = document.getElementById('submitBtn');
const formTitle = document.getElementById('formTitle');

function saveToLocal() {
    localStorage.setItem('studentNotes', JSON.stringify(notes));
}

function renderNotes() {
    const searchText = searchInput.value.toLowerCase();
    const filterValue = courseFilter.value;
    notesTableBody.innerHTML = '';

    let filteredNotes = notes.filter(n => 
        n.title.toLowerCase().includes(searchText) && 
        (filterValue === "" || n.course === filterValue)
    );

    filteredNotes.sort((a, b) => b.id - a.id);

    filteredNotes.forEach(note => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${note.course}</td>
            <td>${note.title}</td>
            <td>${note.content}</td>
            <td>${note.date}</td>
            <td>
                <button class="edit-btn" data-id="${note.id}">Редагувати</button>
                <button class="delete-btn" data-id="${note.id}">Видалити</button>
            </td>
        `;
        notesTableBody.appendChild(row);
    });
}

function clearErrors() {
    document.querySelectorAll('.error-text').forEach(p => p.textContent = '');
}

function resetForm() {
    editId = null;
    submitBtn.textContent = 'Додати';
    formTitle.textContent = 'Додати нотатку';
    clearErrors();
    noteForm.reset();
}

noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    const course = document.getElementById('courseSelect').value;
    const title = document.getElementById('titleInput').value.trim();
    const content = document.getElementById('noteText').value.trim();

    let isValid = true;
    if (!course) { document.getElementById('courseError').textContent = 'Оберіть курс'; isValid = false; }
    if (title.length < 3) { document.getElementById('titleError').textContent = 'Мінімум 3 символи'; isValid = false; }
    if (content.length < 5) { document.getElementById('noteError').textContent = 'Мінімум 5 символів'; isValid = false; }

    if (!isValid) return;

    if (editId) {
        notes = notes.map(n => n.id === editId ? { ...n, course, title, content, date: new Date().toLocaleString() } : n);
    } else {
        notes.push({ id: Date.now(), course, title, content, date: new Date().toLocaleString() });
    }

    saveToLocal();
    renderNotes();
    resetForm();
});

notesTableBody.addEventListener('click', (e) => {
    const id = parseInt(e.target.dataset.id);
    if (e.target.classList.contains('delete-btn')) {
        if (confirm('Видалити?')) {
            notes = notes.filter(n => n.id !== id);
            saveToLocal();
            renderNotes();
        }
    }
    if (e.target.classList.contains('edit-btn')) {
        const n = notes.find(item => item.id === id);
        if (n) {
            document.getElementById('courseSelect').value = n.course;
            document.getElementById('titleInput').value = n.title;
            document.getElementById('noteText').value = n.content;
            editId = id;
            submitBtn.textContent = 'Зберегти';
            formTitle.textContent = 'Редагування нотатки';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
});

searchInput.addEventListener('input', renderNotes);
courseFilter.addEventListener('change', renderNotes);
document.getElementById('resetBtn').addEventListener('click', resetForm);

renderNotes();