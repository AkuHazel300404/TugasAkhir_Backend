const nodemailer = require('nodemailer');
require('dotenv').config();

const tranporter = nodemailer.createTransport( {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const sendEmail = async ({ to, subject, html }) => {
    const mailOptions = {
        from: `"Admin" <$${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    };

    const info = await tranporter.sendMail(mailOptions);
    return info;
};

module.exports = { sendEmail };