require("dotenv/config");
const express = require("express");
const app = express();
const usersRoute = require ("./routes/user");
const tasksRoute = require ("./routes/task");

app.use("/", usersRoute);
app.use("/", tasksRoute);

app.get("/", (req, res) => {
    res.send("Home Sweet Home");
});

app.get("/health", (req, res) => {
    res.send("ok");
});

// Express Static
app.use("/uploads", express.static("./avatars"));

app.use('/', function (err, req, res, next) {;
    res.status(400).json(err.message);
});

module.exports = app;