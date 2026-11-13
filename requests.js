
const requestForm = document.getElementById("requestForm");
const requestMessage = document.getElementById("requestMessage");
const requestsTable = document.getElementById("requestsTable");
const requestSearch = document.getElementById("requestSearch");

const followUp = document.getElementById("followUp");
const followUpSection = document.getElementById("followUpSection");
const followUpDate = document.getElementById("followUpDate");

let requests = [];
let messageTimer;

const statuses = ["Pending", "In Progress", "Resolved", "Closed"];

// SHOW MESSAGE FOR 3 SECONDS
function showRequestMessage(message) {
    requestMessage.textContent = message;

    clearTimeout(messageTimer);

    messageTimer = setTimeout(() => {
        requestMessage.textContent = "";
    }, 3000);
}

// SHOW OR HIDE FOLLOW-UP DATE
followUp.addEventListener("change", function() {
    followUpSection.hidden = !followUp.checked;
    followUpDate.required = followUp.checked;
});

// LOAD REQUESTS
async function loadRequests() {
    try {
        const response = await fetch("/api/requests");

        if (!response.ok) {
            throw new Error("Could not load requests.");
        }

        requests = await response.json();

        updateRequestOverview();
        displayRequests(requests);

    } catch (error) {
        console.error(error);
        requestsTable.innerHTML =
            "<tr><td colspan='5'>Could not load requests.</td></tr>";
    }
}

// UPDATE REQUEST OVERVIEW
function updateRequestOverview() {
    const resolved = requests.filter(request =>
        ["resolved", "closed"].includes(
            (request.status || "").toLowerCase()
        )
    );

    const open = requests.filter(request =>
        !["resolved", "closed"].includes(
            (request.status || "").toLowerCase()
        )
    );

    document.getElementById("requestTotal").textContent = requests.length;
    document.getElementById("requestOpen").textContent = open.length;
    document.getElementById("requestResolved").textContent = resolved.length;
}

// DISPLAY REQUESTS
function displayRequests(records) {
    requestsTable.innerHTML = "";

    if (records.length === 0) {
        requestsTable.innerHTML =
            "<tr><td colspan='5'>No support requests found.</td></tr>";
        return;
    }

    records.slice().reverse().forEach(request => {
        const row = document.createElement("tr");

        const studentCell = document.createElement("td");
        studentCell.textContent = request.studentName || "—";
        row.appendChild(studentCell);

        const typeCell = document.createElement("td");
        typeCell.textContent = request.requestType || "—";
        row.appendChild(typeCell);

        const priorityCell = document.createElement("td");
        priorityCell.textContent = request.priority || "—";
        row.appendChild(priorityCell);

        // STATUS DROPDOWN
        const statusCell = document.createElement("td");
        const statusSelect = document.createElement("select");

        statuses.forEach(status => {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            statusSelect.appendChild(option);
        });

        const currentStatus = statuses.find(status =>
            status.toLowerCase() ===
            (request.status || "Pending").toLowerCase()
        ) || "Pending";

        statusSelect.value = currentStatus;

        statusSelect.addEventListener("change", async function() {
            statusSelect.disabled = true;

            try {
                const response = await fetch(
                    `/api/requests/${request.id}/status`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            status: statusSelect.value
                        })
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || "Update failed.");
                }

                showRequestMessage(
                    "Request status updated successfully!"
                );

                await loadRequests();

            } catch (error) {
                showRequestMessage(error.message);
                await loadRequests();
            }
        });

        statusCell.appendChild(statusSelect);
        row.appendChild(statusCell);

        const dateCell = document.createElement("td");
        dateCell.textContent = request.date || "—";
        row.appendChild(dateCell);

        requestsTable.appendChild(row);
    });
}

// SAVE NEW REQUEST
requestForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const newRequest = {
        studentName: document.getElementById("studentName").value.trim(),
        requestType: document.getElementById("requestType").value,
        description: document.getElementById("description").value.trim(),
        priority: document.querySelector(
            'input[name="priority"]:checked'
        )?.value || "",
        followUp: followUp.checked,
        followUpDate: followUp.checked ? followUpDate.value : ""
    };

    try {
        const response = await fetch("/api/requests", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newRequest)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Could not save request.");
        }

        requestForm.reset();
        followUpSection.hidden = true;
        followUpDate.required = false;

        showRequestMessage("Support request saved successfully!");

        await loadRequests();

    } catch (error) {
        showRequestMessage(error.message);
    }
});

// SEARCH REQUESTS
requestSearch.addEventListener("input", function() {
    const term = requestSearch.value.toLowerCase().trim();

    const filtered = requests.filter(request =>
        (request.studentName || "").toLowerCase().includes(term) ||
        (request.requestType || "").toLowerCase().includes(term) ||
        (request.status || "").toLowerCase().includes(term)
    );

    displayRequests(filtered);
});

// INITIAL LOAD
loadRequests();
