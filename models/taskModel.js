const mongoose = require("mongoose");

const TaskSchema = mongoose.Schema ({
    title: {
        type: String,
        lowercase: true,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    }
});

const Task = mongoose.model("Task", TaskSchema);
module.exports = Task;