const express = require("express");
const User = require("../models/userModel");
const router = express.Router();
const userModel = require("../models/userModel");

// List users
router.get("/all", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// Read a user
router.get("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const userData = await User.findById(id);
        console.log(userData);
        res.json(userData);
    } catch (err) {
        console.error(err);
        res.status(400).send(err.message);
    }
});

// Create a user
router.post("/", express.json(), async (req, res) => {
    try {
        const user = new User(req.body);
        const savedUser = await user.save(); 
        console.log(savedUser);
        console.log(`Received: ${req.headers["content-type"]}`);
        console.log("Data created");
        res.status(201).json(savedUser);

    } catch (err) {
        console.error(err);
        res.status(400).send(`Please ensure data is in JSON format ${err.message}`);
    }
});

// Delete a user
router.delete("/:id", async (req, res) => {
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
});

const schemaKeysArr = Object.keys(User.schema.obj);
const keyExistsInSchema = (obj) => {
    for (let prop in obj) {
        for (let elem of schemaKeysArr){
            if (prop === elem) {
                return true;
            }
        }
    }
    return false;
};

// Update a user
router.put("/:id", express.json(), async (req, res) => {
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
});

module.exports = router;