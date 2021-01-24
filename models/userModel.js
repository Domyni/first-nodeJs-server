const mongoose = require("mongoose");

const UserSchema = mongoose.Schema ({
    username: {
        type: String,
        lowercase: true,
        required: true,
        validate: {
            validator: value => {
                return /^[a-zA-Z][a-zA-Z\d]{5,30}$/.test(value);
            },
            message: "Must start with characters(a-z,A-Z). Usernames can only contain letters (a-z,A-Z) and numbers (0-9) and must be between 6-30 characters long"  
        }
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: value => {
                return /\S+@\S+\.\S/.test(value);
            },
            message: "Invalid email" 
        }
    },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;