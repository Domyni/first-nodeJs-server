const { default: axios } = require("axios");
const nodemailer = require("nodemailer");

async function verifyTransporter(transporter) {
    try {
        const checkTransport = await transporter.verify();
        console.log("Verify Transporter Status: ", checkTransport);
    } catch (err) {
        console.error(err);
    }
}

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

const welcomePic = {
    url: "https://images.unsplash.com/photo-1460467820054-c87ab43e9b59?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1261&q=80",
    alt: "welcome_pic",
    width: "500px"
};

const welcomeContent = (newUsername) => {
    return (`<p> Welcome! your username is: ${newUsername} </p>
            </br>
            <img src=${welcomePic.url} alt=${welcomePic.alt} width=${welcomePic.width}>
            </br>
            <p> Thank you for registering with us! </p>`);
}

async function sendWelcomeMailNodemailer(newUserEmail, newUsername) {
    try {
        verifyTransporter(transporter);
        const result = await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: newUserEmail,
            subject: "Welcome email",
            text: `Welcome ${newUsername}. Thank you for registering with us!`,
            html: welcomeContent(newUsername)
            });        
        console.log(result);
    } catch (err) {
        console.error(err);
    }
}

async function sendWelcomeMailAxious(newUserEmail, newUsername) {
    try {   
        const response = await axios.post("https://api.sendinblue.com/v3/smtp/email", {
            sender: {email: process.env.MAIL_USER},
            to: [{email: `${newUserEmail}`}],
            subject: 'Welcome Email Axious',
            htmlContent: welcomeContent(newUsername)
            }, 
        {
            headers: {
                'api-key': process.env.MAIL_API_KEY
            },
        });
        console.log(response);
    } catch (err) {
        console.error(err);
    }
}

module.exports.sendWelcomeMailNodemailer = sendWelcomeMailNodemailer;
module.exports.sendWelcomeMailAxious = sendWelcomeMailAxious;