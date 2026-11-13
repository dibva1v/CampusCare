
// STUDENT FORM ELEMENTS
const studentForm = document.getElementById("studentForm");
const studentsTable = document.getElementById("studentsTable");
const message = document.getElementById("message");
const search = document.getElementById("search");

let students = [];


// LOAD STUDENTS
async function loadStudents() {
    studentsTable.innerHTML =
        "<tr><td colspan='4'>Loading student records...</td></tr>";

    try {
        const response = await fetch("/api/students");

        if (!response.ok) {
            throw new Error("Could not load students.");
        }

        students = await response.json();

        updateStudentOverview(students);
        displayStudents(students);

    } catch (error) {
        console.error("Student loading error:", error);

        studentsTable.innerHTML =
            "<tr><td colspan='4'>Could not load student records.</td></tr>";
    }
}


// UPDATE STUDENT OVERVIEW
function updateStudentOverview(records) {
    const departments = new Set(
        records.map(student => student.department).filter(Boolean)
    );

    document.getElementById("studentTotal").textContent =
        records.length;

    document.getElementById("studentDepartments").textContent =
        departments.size;
}


// DISPLAY STUDENTS
function displayStudents(records) {
    studentsTable.innerHTML = "";

    if (records.length === 0) {
        studentsTable.innerHTML =
            "<tr><td colspan='4'>No students found.</td></tr>";
        return;
    }

    records.forEach(student => {
        const row = document.createElement("tr");

        [
            student.name,
            student.studentId,
            student.email,
            student.department
        ].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value || "—";
            row.appendChild(cell);
        });

        studentsTable.appendChild(row);
    });
}


// ADD A STUDENT
studentForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    message.textContent = "Saving student...";

    const newStudent = {
        name: document.getElementById("name").value.trim(),
        studentId: document.getElementById("studentId").value.trim(),
        email: document.getElementById("email").value.trim(),
        department: document.getElementById("department").value
    };

    try {
        const response = await fetch("/api/students", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newStudent)
        });

        const result = await response.json();

        if (!response.ok) {
            message.textContent =
                result.message || result.error || "Could not save student.";
            return;
        }

        message.textContent = result.message || "Student added successfully!";

        studentForm.reset();
        await loadStudents();

    } catch (error) {
        message.textContent =
            "Unable to save student. Please try again.";
    }
});


// SEARCH STUDENTS
search.addEventListener("input", function() {
    const term = search.value.toLowerCase().trim();

    const filtered = students.filter(student =>
        (student.name || "").toLowerCase().includes(term) ||
        (student.studentId || "").toLowerCase().includes(term)
    );

    displayStudents(filtered);
});


// INITIAL LOAD
loadStudents();
