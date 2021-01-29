const express = require("express");
const User = require("../models/userModel");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const verifyToken = require("../middlewares/verifyToken");
const multer = require("multer");
const fs = require("fs");
const nodemailer = require("nodemailer");

const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const path = `avatars/${req.ctxVerifiedUserData.id}/`;

            fs.access(path, err => {
                if (err) {
                    fs.mkdir(path, err => {
                        console.error(err);
                    })
                }
                cb(null, path);
            })
        },
        filename: function (req, file, cb) {
            const fileNameArr = file.originalname.split(".");
            const fileExtension = fileNameArr.pop();
            const fileNameStr = fileNameArr.join("");

            cb(null, `${fileNameStr}-${Date.now()}.${fileExtension}`);
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


// Register, Create a new user, Send email
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
   
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: process.env.MAIL_SECURE,
            auth: {
                type: "login",
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        });
        const checkTransport = await transporter.verify();
        console.log("Verify Transporter: ", checkTransport);

        const welcomePic = {
            url: "https://images.unsplash.com/photo-1460467820054-c87ab43e9b59?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1261&q=80",
            alt: "welcome_pic",
            width: "500px"
        };
    
        const result = await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: req.body.email,
            subject: "Welcome email",
            text: `Welcome ${req.body.username}. Thank you for registering with us!`,
            html: `<p> Welcome! your username is: ${req.body.username} </p>
                   </br>
                   <img src=${welcomePic.url} alt=${welcomePic.alt} width=${welcomePic.width}>
                   </br>
                   <p> Thank you for registering with us! </p>`
        });

        console.log(result);
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