const express = require("express");
const app = express();
const arguments = process.argv.slice(2);
const usersRoute = require ("./routes/user");
const connectToDatabase = require("./utils/database");

let port = 3000;
for (let i = 0; i < arguments.length; i++) {
    if (arguments[i].includes("=")) {
        const segment = arguments[i].split("=");
        switch (segment[0]) {
            case "--port":
                port = segment[1];
                break;
            default:
                console.error("Only accept '--port=number' as an argument");
                break;
            }
    } else {
        console.log(`Invalid arguments, only accept '--port=number' as an argument, default to port:${port}`);
    }
}

app.use("/user", usersRoute);

connectToDatabase();
app.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
})

app.get("/", (req, res) => {
    res.send("Home Sweet Home");
})

app.get("/health", (req, res) => {
    res.send("ok");
})

