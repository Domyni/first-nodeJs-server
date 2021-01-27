const express = require("express");
const Task = require("../models/taskModel");
const router = express.Router();

// Get all tasks
router.get("/task/all", express.json(), async (req, res, next) => {

    try {
        const items = await Task.find();
        res.json(items);
    } catch (err) {
        next(new Error(err.message));
    }

});


// Create a task
router.post("/task", express.json(), async (req, res, next) => {
    try {
        const task = new Task(req.body);
        await task.save(); 
        res.json({
            state: "success"
        });
    }
     catch (err) {
        next(new Error(err.message));
    }
});


// Delete a task
router.delete("/task/:id", async (req, res, next) => {
    const id = req.params.id;
    try {
        const task = await Task.findById(id);
        await task.delete();
        res.json({
            state: "success"
        });
    } catch (err) {
        console.error(err);
        next(new Error("Task ID not found"));
    }
});


// Check if user's input keys exist in the schema
const schemaKeysArr = Object.keys(Task.schema.obj);
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


// Update a task
router.put("/task/:id", express.json(), async (req, res, next) => {
    const id = req.params.id;
    const updateDetail = req.body;
    const opts = { 
        runValidators: true
    };
    if (keyExistsInSchema(updateDetail)) {
        try { 
            await Task.updateOne({
                _id: id
            },
            {
                $set: updateDetail
            },
            opts
            );
            res.json({
                state: "success"
            });
        } catch (err) {
            console.error(err);
            next(new Error(err.message));
        }
    } else {
        next(new Error("No such data to update"));
    }
});

module.exports = router;