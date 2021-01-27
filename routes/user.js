const express = require("express");
const User = require("../models/userModel");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const verifyToken = require("../middlewares/verifyToken");
const multer = require("multer");
const fs = require("fs");

 const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const path = `avatars/${req.ctxVerifiedUserData.id}/`;

            fs.access(path, function(err) {
                if (err) {
                    fs.mkdir(path, function(err) {
                        console.error(err);
                    })
                }
                cb(null, path);
            })
        },
        filename: function (req, file, cb) {
            const fileNameArr = file.originalname.split(".");
            fileNameArr.pop();
            const fileNameStr = fileNameArr.join("");

            cb(null, `${fileNameStr}-${Date.now()}`);
        }
    });

const uploader = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== "image/jpeg") {
            return cb(new Error("Invalid file type, only accepts JPEG files"));
        }
        cb(null, true);
    }
});

// Upload a file
router.post("/user/avatar", verifyToken, uploader.single("avatar"), (req, res) => {
    res.json({
        state: "success",
        url: `http://localhost:3000/${req.file.path}`
    });
});


// Register, Create a new user
router.post("/user/register", express.json(), async (req, res, next) => {
    const usernameExist = await User.findOne({ username: req.body.username });
    const emailExist = await User.findOne({ email: req.body.email });

    if (usernameExist) {
        return next(new Error("Username already exist"));
    } 
    if (emailExist) {
        return next(new Error("Email already exist"));
    } 
    if (req.body.password.length < 8) {
        return next(new Error("Password must be at least 8 characters"));
    }

    try {
        const hassedPassword = await bcrypt.hash(req.body.password, saltRounds);
        const user = new User({
            username: req.body.username,
            password: hassedPassword,
            email: req.body.email
        });
        await user.save(); 
        res.status(201).json({
            state: "success"
        });
    } catch (err) {
        console.error(err);
        next(new Error(err.message));
    }
});


// Log in, authenticate username && password
router.post("/user/login", express.json(), async (req, res, next) => {
    const username = await User.findOne({ username: req.body.username });
    if (!username) {
        return next(new Error("Invalid username or password"));
    } 
    if (!await bcrypt.compare(req.body.password, username.password)) {
        return next(new Error("Invalid username or password"));
    } 

    const token = jwt.sign({
        id: username._id
    }, 
        process.env.SECRET_KEY,
    {
        expiresIn: process.env.JWT_EXPIRY
    });
    res.json({
        token,
    });
});


// Get user data with valid token
router.get("/user/", express(), verifyToken, async (req, res, next) => {
    res.body = req.ctxVerifiedUserData;
    try {
        const userExist = await User.findById(res.body.id, {
            password: 0,
            __v: 0
        });
        res.json(userExist);
    } catch {
        return next(new Error("User not found"));
    }
});


// Check if user's input keys exist in the schema
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


// Update user data
router.put("/user/", express.json(), verifyToken, async (req, res, next) => {
    const verifiedUser = req.ctxVerifiedUserData;
    const userExist = await User.findById(verifiedUser.id);
    
    if (!userExist) {
        return next(new Error("User not found"));
    }
    if (req.body.password || req.body.password === "") {
        return next(new Error("We can't change your password at the moment"));
    }

    const updateDetail = req.body;
    const opts = { 
        runValidators: true
    };

    if (keyExistsInSchema(updateDetail)) {
        try { 
            await User.updateOne({
                _id: verifiedUser.id
            },
            {
                $set: updateDetail
            },
            opts
            );
            res.json({
            state : "success"
            }) 
        } catch (err) {
            console.error(err);
            next(new Error(err.message));
        }
    } else {
        next(new Error("No such data to update"));
    }
});

module.exports = router;