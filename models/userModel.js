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

module.exports = User;