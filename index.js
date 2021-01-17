const express = require("express");
const app = express();
const arguments = process.argv.slice(2);

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

const { MongoClient, ObjectId } = require("mongodb");
const client = new MongoClient('mongodb://localhost:27017');

async function handleRedbeatMongoDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error(err);
    }

    const db = client.db("rba");
    const taskCollection = db.collection("tasks");

    // Read a task
    app.get("/task/:id", async (req, res) => {
        const id = req.params.id;
        try {
            const item = await taskCollection.findOne({_id: ObjectId(id)});
            console.log(item);
            res.json(item);
        } catch (err) {
            console.error(err);
            res.send("Item ID does not exist!");
        }
    })

    // List tasks
    app.get("/tasks", async (req, res) => {
        try {
            const items = await taskCollection.find().toArray();
            res.send(items);
        } catch (err) {
            console.error(err);
        }
    })

    // Create a task
    app.post("/task", express.json(), async (req, res) => {
        try {
            const reqContentType = req.headers["content-type"];
            const data = req.body;
    
            if (reqContentType === "application/json") {
                const result = await taskCollection.insertOne(data);
                console.log(result.ops);
                console.log("New Data Created");
                res.send("Data Received");
            } else {
                console.log(`Received: ${reqContentType}`);
                res.send("Server can only handle JSON format at this time");
            }
        } catch (err) {
            console.error(err);
        }
    })

    // Delete a task
    app.delete("/task/:id", async (req, res) => {
        const id = req.params.id;
        try {
            await taskCollection.deleteOne({_id: ObjectId(id)});
            console.log(`Deleted item ID '${id}'`);
            res.send(`Item ID '${id}' has been deleted`);
        } catch (err) {
            console.error(err);
            res.send("Item ID does not exist!");
        }
    })

    // Update a task
    app.put("/task/:id", express.json(), async (req, res) => {
        const id = req.params.id;
        const updateDetail = req.body;
        try { 
            await taskCollection.updateOne({
                _id: ObjectId(id)
            },
            {
                $set: updateDetail
            });
            console.log(`Updated item ID '${id}' with ${JSON.stringify(updateDetail)}`);
            res.send(`Item ID:${id} has been updated`);
        } catch (err) {
            console.log(err);
            res.send("Item ID does not exist!");
        }
    })
}

handleRedbeatMongoDB();

app.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
})



