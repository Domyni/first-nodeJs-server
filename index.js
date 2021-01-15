const express = require("express");
const app = express();
const arguments = process.argv.slice(2);
const fs = require("fs");

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
        console.log(`User arguments doesn't include '=', default to port:${port}`)
    }
}

function writeFilePromise(path, data) {
    return new Promise((resolve, rejects) => {
        fs.writeFile(path, data, err => {
            if (err) {
                throw err;
            } else {
                resolve(`Successfully write at ${path}`);
            }
        })
    })
}

app.get("/", (req, res) => {
    res.json(req.query);
})

app.post("/", (req, res) => {
        let data = "";
        req.on("data", chunk => data += chunk);
        req.on("end", async () => {
            try {
                if (req.headers['content-type'] === "application/json") {
                const dataObj = JSON.parse(data);
                const {name, age, gender} = dataObj;
                const dataJSON = JSON.stringify({name, age, gender}, null, 2);
                const processData = await writeFilePromise("./user.json", dataJSON);
                console.log(processData);
                res.send("Data Recieved!");
                }
            } catch (err) {
                console.error(err);
            }
        })
        res.on("error", e => {
            console.error(e);
        });
})

app.listen(port, () => {
    console.log(`Server is listening at ${port}`)
})


