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

app.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
})

app.get("/", (req, res) => {
    res.send("Home Sweet Home");
})

app.get("/health", (req, res) => {
    res.send("ok");
})

const mongoose = require("mongoose");

const UserSchema = mongoose.Schema ({
    firstName: {
        type: String,
        lowercase: true,
        required: true,
        validate: {
            validator: value => {
                return /^[a-zA-Z]{6,30}$/.test(value);
            },
            message: "Only characters(a-z,A-Z) are allowed, must be between 6 to 30 characters and no space in between."  
        }
    },
    lastName: {
        type: String,
        lowercase: true,
        required: true,
        validate: {
            validator: value => {
                return /^[a-zA-Z]{6,30}$/.test(value);
            },
            message: "Only characters(a-z,A-Z) are allowed, must be between 6 to 30 characters and no space in between." 
        }
    },
    age: {
        type: Number,
        required: true,
        min: 1,
        max: 130
    },
    gender: {
        type: String,
        lowercase: true,
        required: true,
        validate: {
            validator: value => {
                    if (value.toLowerCase() === "male" || value.toLowerCase() === "female"){
                        return true;
                    }   else {
                        return false;
                    }
            },
            message: "Can only accept 'male' or 'female' value"
        }
    }
});

const User = mongoose.model("User", UserSchema);

async function connectToMongoose() {
    try {
        await mongoose.connect("mongodb://localhost:27017/rba",{
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        let connection = mongoose.connection.readyState === 1? "Connected to Mongoose!": "Not connected to Mongoose!";
        console.log(connection);
    } catch (err) {
        console.error(err);
    }
}

connectToMongoose();

// Read a user
app.get("/user/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const userData = await User.findById(id);
        console.log(userData);
        res.json(userData);
    } catch (err) {
        console.error(err);
        res.status(400).send(err.message);
    }
})

// List users
app.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
})

// Create a user
app.post("/user", express.json(), async (req, res) => {
    try {
        const user = new User(req.body);
        const savedUser = await user.save(); 
        console.log(savedUser);
        console.log(`Received: ${req.body.type}`);
        console.log("Data created");
        res.status(201).json(savedUser);

    } catch (err) {
        console.error(err);
        res.status(400).send(err.message);
    }
})

// Delete a user
app.delete("/user/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findById(id);
        await user.delete();
        console.log(`Deleted user ID '${id}'`);
        res.send(`User ID '${id}' has been deleted`);
    } catch (err) {
        console.error(err);
        res.status(400).send(err.message);
    }
})


const schemaKeysArr = Object.keys(UserSchema.obj);
const keyExistsInSchema = (obj) => {
    for (let prop in obj) {
        for (let elem of schemaKeysArr){
            if (prop === elem) {
                return true;
            }
        }
    }
    return false;
}

// Update a user
app.put("/user/:id", express.json(), async (req, res) => {
    
    const id = req.params.id;
    const updateDetail = req.body;
    const opts = { 
        runValidators: true
    };
    if (keyExistsInSchema(updateDetail)) {
        try { 
            await User.updateOne({
                _id: id
            },
            {
                $set: updateDetail
            },
            opts
            );
            res.send(`User ID:${id} has been updated. Note that only (${schemaKeysArr}) will be updated`);
        } catch (err) {
            console.log(err);
            res.send(err.message);
        }
    } else {
        res.send("No such key(s) to update in the database!");
    }
})




