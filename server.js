const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Load and save functions
const FILE_PATH = 'appointments.txt';

function loadAppointmentsFromFile() {
    try {
        const data = fs.readFileSync(FILE_PATH, 'utf8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error("Error reading file:", error);
        return [];
    }
}

function saveAppointmentsToFile(appointments) {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(appointments, null, 2));
    } catch (error) {
        console.error("Error saving file:", error);
    }
}

// Load appointments on startup
let appointments = loadAppointmentsFromFile();
// GET /: Serve HTML page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// POST /submit-booking: Create or modify an appointment
app.post('/submit-booking', (req, res) => {
    const { name, phone, service, time, date, notes } = req.body;

    // Check if the appointment exists
    const index = appointments.findIndex(appt => appt.phone === phone);

    if (index !== -1) {
        // Update existing appointment
        appointments[index] = { name, phone, service, time, date, notes };
        saveAppointmentsToFile(appointments);
        res.send('Appointment updated successfully!');
    } else {
        // Add new appointment
        appointments.push({ name, phone, service, time, date, notes });
        saveAppointmentsToFile(appointments);
        res.send('Appointment booked successfully!');
    }
});

// POST /modify-appointment: Modify an existing appointment
app.post('/modify-appointment', (req, res) => {
    const { phone, service, time, date, notes } = req.body;

    const appointment = appointments.find(appt => appt.phone === phone);

    if (appointment) {
        appointment.service = service;
        appointment.time = time;
        appointment.date = date;
        appointment.notes = notes;
        saveAppointmentsToFile(appointments);
        res.send('Appointment modified successfully!');
    } else {
        res.status(404).send('Appointment not found!');
    }
});

// POST /cancel-appointment: Cancel an appointment
app.post('/cancel-appointment', (req, res) => {
    const { phone } = req.body;

    const index = appointments.findIndex(appt => appt.phone === phone);

    if (index !== -1) {
        appointments.splice(index, 1);
        saveAppointmentsToFile(appointments);
        res.send('Appointment cancelled successfully!');
    } else {
        res.status(404).send('Appointment not found!');
    }
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
