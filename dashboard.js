



// LOAD DASHBOARD DATA
async function loadDashboardData() {

    try {
        const [studentsResponse, requestsResponse] = await Promise.all([
            fetch("/api/students"),
            fetch("/api/requests")
        ]);

        if (!studentsResponse.ok || !requestsResponse.ok) {
            throw new Error("Could not load dashboard data");
        }

        const students = await studentsResponse.json();
        const requests = await requestsResponse.json();

        // Calculate overview numbers
        const resolved = requests.filter(request =>
            (request.status || "").toLowerCase() === "resolved"
        );

        const open = requests.filter(request =>
            !["resolved", "closed"].includes(
                (request.status || "").toLowerCase()
            )
        );

        const followUps = requests.filter(request =>
            request.followUp === true &&
            !["resolved", "closed"].includes(
                (request.status || "").toLowerCase()
            )
        );

        // Display numbers
        const totalStudents = document.getElementById("totalStudents");
const openRequests = document.getElementById("openRequests");
const pendingFollowUps = document.getElementById("pendingFollowUps");
const resolvedRequests = document.getElementById("resolvedRequests");

if (totalStudents) totalStudents.textContent = students.length;
if (openRequests) openRequests.textContent = open.length;
if (pendingFollowUps) pendingFollowUps.textContent = followUps.length;
if (resolvedRequests) resolvedRequests.textContent = resolved.length;

        // Display recent requests
        displayRecentRequests(requests);

    } catch (error) {
        console.error("Dashboard loading error:", error);
    }
}


// DISPLAY RECENT SUPPORT REQUESTS
function displayRecentRequests(requests) {

    const tableBody = document.getElementById("dashboardRequests");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (requests.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.textContent =
            "No support requests yet. Add your first request using the form above.";

        cell.style.textAlign = "center";
        cell.style.padding = "25px";

        row.appendChild(cell);
        tableBody.appendChild(row);

        return;
    }

    const recentRequests = requests.slice().reverse().slice(0, 5);

    recentRequests.forEach(function (request) {

        const row = document.createElement("tr");

        const values = [
            request.studentName || "—",
            request.requestType || "—",
            request.date || "—",
            request.status || "Pending"
        ];

        values.forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
}


// RUN WHEN DASHBOARD OPENS
loadDashboardData();
