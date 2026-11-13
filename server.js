
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.static(__dirname));

const dataFile = path.join(__dirname, "students.json");
const requestsFile = path.join(__dirname, "requests.json");
const appointmentsFile = path.join(__dirname, "appointments.json");

// CREATE DATA FILES IF THEY DON'T EXIST
[dataFile, requestsFile, appointmentsFile].forEach(file => {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, "[]");
    }
});

// STUDENTS: GET ALL
app.get("/api/students", (req, res) => {
    const students = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    res.json(students);
});

// STUDENTS: ADD NEW
app.post("/api/students", (req, res) => {
    const { name, studentId, email, department } = req.body;

    if (!name || !studentId || !email || !department) {
        return res.status(400).json({
            message: "Complete all fields."
        });
    }

    const students = JSON.parse(fs.readFileSync(dataFile, "utf8"));

    if (students.some(s => s.studentId === studentId)) {
        return res.status(409).json({
            message: "Student ID already exists."
        });
    }

    const student = {
        id: Date.now(),
        name,
        studentId,
        email,
        department
    };

    students.push(student);
    fs.writeFileSync(dataFile, JSON.stringify(students, null, 2));

    res.status(201).json({
        message: "Student added successfully!",
        student
    });
});

// REQUESTS: GET ALL
app.get("/api/requests", (req, res) => {
    const requests = JSON.parse(fs.readFileSync(requestsFile, "utf8"));
    res.json(requests);
});

// REQUESTS: ADD NEW
app.post("/api/requests", (req, res) => {
    const {
        studentName,
        requestType,
        description,
        priority,
        followUp,
        followUpDate
    } = req.body;

    if (!studentName || !requestType || !description || !priority) {
        return res.status(400).json({
            message: "Please complete all required fields."
        });
    }

    const requests = JSON.parse(fs.readFileSync(requestsFile, "utf8"));

    const request = {
        id: Date.now(),
        studentName,
        requestType,
        description,
        priority,
        followUp: followUp || false,
        followUpDate: followUpDate || "",
        status: "Pending",
        date: new Date().toLocaleDateString("en-GB")
    };

    requests.push(request);

    fs.writeFileSync(
        requestsFile,
        JSON.stringify(requests, null, 2)
    );

    res.status(201).json({
        message: "Support request added successfully!",
        request
    });
});

// REQUESTS: UPDATE STATUS
app.patch("/api/requests/:id/status", (req, res) => {
    const { status } = req.body;

    const allowedStatuses = [
        "Pending",
        "In Progress",
        "Resolved",
        "Closed"
    ];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid request status."
        });
    }

    const requests = JSON.parse(fs.readFileSync(requestsFile, "utf8"));

    const request = requests.find(
        r => String(r.id) === req.params.id
    );

    if (!request) {
        return res.status(404).json({
            message: "Support request not found."
        });
    }

    request.status = status;

    fs.writeFileSync(
        requestsFile,
        JSON.stringify(requests, null, 2)
    );

    res.json({
        message: "Support request status updated successfully!",
        request
    });
});

// APPOINTMENTS: GET ALL
app.get("/api/appointments", (req, res) => {
    const appointments = JSON.parse(
        fs.readFileSync(appointmentsFile, "utf8")
    );

    res.json(appointments);
});

// APPOINTMENTS: ADD NEW
app.post("/api/appointments", (req, res) => {
    const {
        studentName,
        appointmentType,
        appointmentDate,
        appointmentTime,
        appointmentNotes
    } = req.body;

    if (!studentName || !appointmentType ||
        !appointmentDate || !appointmentTime) {
        return res.status(400).json({
            message: "Please complete all required fields."
        });
    }

    const appointments = JSON.parse(
        fs.readFileSync(appointmentsFile, "utf8")
    );

    const appointment = {
        id: Date.now(),
        studentName,
        appointmentType,
        appointmentDate,
        appointmentTime,
        appointmentNotes: appointmentNotes || "",
        status: "Scheduled"
    };

    appointments.push(appointment);

    fs.writeFileSync(
        appointmentsFile,
        JSON.stringify(appointments, null, 2)
    );

    res.status(201).json({
        message: "Appointment saved successfully!",
        appointment
    });
});

// APPOINTMENTS: UPDATE STATUS
app.patch("/api/appointments/:id/status", (req, res) => {
    const { status } = req.body;

    const allowedStatuses = [
        "Scheduled",
        "Completed",
        "Cancelled"
    ];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid appointment status."
        });
    }

    const appointments = JSON.parse(
        fs.readFileSync(appointmentsFile, "utf8")
    );

    const appointment = appointments.find(
        a => String(a.id) === req.params.id
    );

    if (!appointment) {
        return res.status(404).json({
            message: "Appointment not found."
        });
    }

    appointment.status = status;

    fs.writeFileSync(
        appointmentsFile,
        JSON.stringify(appointments, null, 2)
    );

    res.json({
        message: "Appointment status updated successfully!",
        appointment
    });
});

// START SERVER
app.listen(PORT, () => {
    console.log("CampusCare server running at http://localhost:" + PORT);
});
