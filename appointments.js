
// LOAD APPOINTMENTS
const appointmentForm = document.getElementById("appointmentForm");
const appointmentMessage = document.getElementById("appointmentMessage");
const appointmentSearch = document.getElementById("appointmentSearch");
const tableBody = document.getElementById("appointmentsTable");

let allAppointments = [];


// LOAD DATA FROM SERVER
async function loadAppointments() {
    try {
        const response = await fetch("/api/appointments");

        if (!response.ok) {
            throw new Error("Could not load appointments");
        }

        allAppointments = await response.json();

        updateAppointmentOverview(allAppointments);
        displayAppointments(allAppointments);

    } catch (error) {
        console.error("Appointment loading error:", error);
        tableBody.innerHTML =
            '<tr><td colspan="6">Unable to load appointments.</td></tr>';
    }
}


// UPDATE OVERVIEW
function updateAppointmentOverview(appointments) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completed = appointments.filter(a =>
        (a.status || "").toLowerCase() === "completed"
    );

    const upcoming = appointments.filter(a => {
        const status = (a.status || "Scheduled").toLowerCase();
        const date = new Date(a.appointmentDate + "T00:00:00");

        return date >= today &&
            status !== "completed" &&
            status !== "cancelled";
    });

    document.getElementById("totalAppointments").textContent =
        appointments.length;

    document.getElementById("upcomingAppointments").textContent =
        upcoming.length;

    document.getElementById("completedAppointments").textContent =
        completed.length;
}


// DISPLAY TABLE
function displayAppointments(appointments) {
    tableBody.innerHTML = "";

    if (appointments.length === 0) {
        tableBody.innerHTML =
            '<tr><td colspan="6">No appointments have been booked yet.</td></tr>';
        return;
    }

    appointments.slice().reverse().forEach(a => {
        const row = document.createElement("tr");

        const values = [
            a.studentName || "—",
            a.appointmentType || "—",
            a.appointmentDate || "—",
            a.appointmentTime || "—"
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        // STATUS DROPDOWN
        const statusCell = document.createElement("td");

        const statusSelect = document.createElement("select");
        statusSelect.setAttribute(
            "aria-label",
            "Status for " + (a.studentName || "appointment")
        );

        ["Scheduled", "Completed", "Cancelled"].forEach(status => {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            statusSelect.appendChild(option);
        });

        statusSelect.value = a.status || "Scheduled";

        statusSelect.addEventListener("change", async function() {
            await updateAppointmentStatus(a.id, statusSelect.value);
        });

        statusCell.appendChild(statusSelect);
        row.appendChild(statusCell);

        tableBody.appendChild(row);
    });
}


// UPDATE APPOINTMENT STATUS
async function updateAppointmentStatus(id, status) {
    appointmentMessage.textContent = "Updating appointment status...";

    try {
        const response = await fetch(
            `/api/appointments/${encodeURIComponent(id)}/status`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Could not update status.");
        }

        appointmentMessage.textContent = result.message;

        await loadAppointments();

    } catch (error) {
        appointmentMessage.textContent = error.message;
        await loadAppointments();
    }
}


// SEARCH
appointmentSearch.addEventListener("input", function() {
    const term = appointmentSearch.value.toLowerCase().trim();

    const filtered = allAppointments.filter(a =>
        (a.studentName || "").toLowerCase().includes(term) ||
        (a.appointmentType || "").toLowerCase().includes(term) ||
        (a.status || "").toLowerCase().includes(term)
    );

    displayAppointments(filtered);
});


// SAVE APPOINTMENT
appointmentForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    appointmentMessage.textContent = "Saving appointment...";

    const data = {
        studentName: document.getElementById("studentName").value.trim(),
        appointmentType: document.getElementById("appointmentType").value,
        appointmentDate: document.getElementById("appointmentDate").value,
        appointmentTime: document.getElementById("appointmentTime").value,
        appointmentNotes: document.getElementById("additionalNotes").value.trim()
    };

    try {
        const response = await fetch("/api/appointments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Could not save appointment");
        }

        appointmentMessage.textContent = "Appointment booked successfully!";
        appointmentForm.reset();

        await loadAppointments();

    } catch (error) {
        appointmentMessage.textContent = error.message;
    }
});


// INITIAL LOAD
loadAppointments();
