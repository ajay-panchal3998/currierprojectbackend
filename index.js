const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorhandler');
const bodyParser = require('body-parser');
const http = require('http');
const fs = require('fs');
const https = require('https');
require('dotenv').config({ quiet: true });
const app = express();

app.use(bodyParser.json());
const corsOptions = {
    origin: "*",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    exposedHeaders: ['x-auth-token']
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// Middlewares
app.use(cors());
app.use(express.json());

app.use("/api/user", require('./routes/users'));
app.use("/api/bookings", require('./routes/bookings'));

app.use(errorHandler);
const path = require("path");
// Handling Errors
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    res.status(err.statusCode).json({
        message: err.message,
    });
});

// Add this middleware to serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    res.status(err.statusCode).json({ message: err.message });
});


// CREATE SERVER
let server;
if (process.env.NODE_ENV === "production") {
    const fs = require("fs");
    // SSL certificates
    var privateKey = fs.readFileSync('/root/apic_myreview_website/apic_myreview_website.key', 'utf-8');
    var certificate = fs.readFileSync('/root/apic_myreview_website/apic_myreview_website.crt', 'utf-8');
    var ca = fs.readFileSync('/root/apic_myreview_website/apic_myreview_website.ca-bundle', 'utf-8');
    const credentials = { key: privateKey, cert: certificate, ca: ca };

    // Create HTTPS server
    server = https.createServer(credentials, app);
} else {
    // Create HTTP server
    server = http.createServer(app);
}

// Start the server
const port = process.env.NODE_ENV === "production" ? process.env.SECURE_PORT : process.env.PORT;
server.listen(port, () => {
    console.log(`Server is listening on ${process.env.NODE_ENV === "production" ? 'https://apic.myreview.website' : 'http://localhost'}:${port}`);
});