
const totalStudents = document.getElementById("totalStudents");
const totalRequests = document.getElementById("totalRequests");
const pendingRequests = document.getElementById("pendingRequests");
const totalAppointments = document.getElementById("totalAppointments");

const reportTable = document.getElementById("reportTable");
const appointmentReportTable =
    document.getElementById("appointmentReportTable");
const reportMessage = document.getElementById("reportMessage");

async function loadReports() {
    reportMessage.textContent = "Loading report data...";

    try {
        const [
            studentsResponse,
            requestsResponse,
            appointmentsResponse
        ] = await Promise.all([
            fetch("/api/students"),
            fetch("/api/requests"),
            fetch("/api/appointments")
        ]);

        if (
            !studentsResponse.ok ||
            !requestsResponse.ok ||
            !appointmentsResponse.ok
        ) {
            throw new Error("Unable to load report data.");
        }

        const students = await studentsResponse.json();
        const requests = await requestsResponse.json();
        const appointments = await appointmentsResponse.json();

        // SYSTEM OVERVIEW
        totalStudents.textContent = students.length;
        totalRequests.textContent = requests.length;

        pendingRequests.textContent = requests.filter(request =>
            (request.status || "").toLowerCase() === "pending"
        ).length;

        // ALL APPOINTMENTS, NOT JUST SCHEDULED
        totalAppointments.textContent = appointments.length;

        // SUPPORT REQUEST SUMMARY
        const requestTypes = [
            "Academic Support",
            "Financial Support",
            "Personal Support",
            "Health Support",
            "Other"
        ];

        reportTable.innerHTML = "";

        requestTypes.forEach(type => {
            const count = requests.filter(request =>
                request.requestType === type
            ).length;

            const row = document.createElement("tr");
            const typeCell = document.createElement("td");
            const countCell = document.createElement("td");

            typeCell.textContent = type;
            countCell.textContent = count;

            row.appendChild(typeCell);
            row.appendChild(countCell);
            reportTable.appendChild(row);
        });

        // APPOINTMENT SUMMARY
        const appointmentStatuses = [
            "Scheduled",
            "Completed",
            "Cancelled"
        ];

        appointmentReportTable.innerHTML = "";

        appointmentStatuses.forEach(status => {
            const count = appointments.filter(appointment =>
                (appointment.status || "").toLowerCase() ===
                status.toLowerCase()
            ).length;

            const row = document.createElement("tr");
            const statusCell = document.createElement("td");
            const countCell = document.createElement("td");

            statusCell.textContent = status;
            countCell.textContent = count;

            row.appendChild(statusCell);
            row.appendChild(countCell);
            appointmentReportTable.appendChild(row);
        });

        reportMessage.textContent = "Report data is up to date.";

    } catch (error) {
        console.error("Reports loading error:", error);

        totalStudents.textContent = "—";
        totalRequests.textContent = "—";
        pendingRequests.textContent = "—";
        totalAppointments.textContent = "—";

        reportTable.innerHTML =
            '<tr><td colspan="2">Unable to load report data.</td></tr>';

        appointmentReportTable.innerHTML =
            '<tr><td colspan="2">Unable to load appointment data.</td></tr>';

        reportMessage.textContent =
            "Could not load reports. Please refresh the page.";
    }
}

loadReports();

setInterval(loadReports, 10000);

document.addEventListener("visibilitychange", function() {
    if (!document.hidden) {
        loadReports();
    }
});
