const nodemailer = require("nodemailer");

async function verifyTransporter(transporter) {
    const checkTransport = await transporter.verify();
    console.log("Verify Transporter Status: ", checkTransport);
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

async function sendWelcomeMail(newUserEmail, newUsername) {

    verifyTransporter(transporter);
    const welcomePic = {
        url: "https://images.unsplash.com/photo-1460467820054-c87ab43e9b59?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1261&q=80",
        alt: "welcome_pic",
        width: "500px"
    };
    const result = await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: newUserEmail,
        subject: "Welcome email",
        text: `Welcome ${newUsername}. Thank you for registering with us!`,
        html: `<p> Welcome! your username is: ${newUsername} </p>
            </br>
            <img src=${welcomePic.url} alt=${welcomePic.alt} width=${welcomePic.width}>
            </br>
            <p> Thank you for registering with us! </p>`
    });
    console.log(result);
}

module.exports.sendWelcomeMail = sendWelcomeMail;