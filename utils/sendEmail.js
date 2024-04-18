const nodemailer = require('nodemailer');

const sendEmail = async function({ email, subject, message }) {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: false,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        const mailOptions = {
            from: 'info@gotajiri.com',
            to: email,
            subject,
            html: message
        };

       await transporter.sendMail(mailOptions);
       console.log('Email sent successfully!');

    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = sendEmail;