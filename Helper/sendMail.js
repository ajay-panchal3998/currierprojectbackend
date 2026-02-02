const nodemailer = require('nodemailer');
const sendMail = async (subject, message, email) => {
    try {
        const transporter = nodemailer.createTransport({
            host: `${process.env.host}`,
            port: 465,
            secure: true,
            auth: {
                user: `${process.env.mail}`,
                pass: `${process.env.pass}`
            },
        });
        const mailOptions = {
            from: `${process.env.mail}`,
            to: `${email}`,
            subject: subject,
            html: message,
        };
        await transporter.verify();
        transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
                throw new Error('Something went wrong');
            }
        });
    } catch (err) {
        console.log(err);
    }
}

module.exports = sendMail;