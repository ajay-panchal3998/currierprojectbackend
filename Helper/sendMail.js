// const nodemailer = require('nodemailer');
// const sendMail = async (subject, message, email) => {
//     console.log(subject, message, email, '-------------------------------------------')
//     try {
//         const transporter = nodemailer.createTransport({
//             host: `${process.env.host}`,
//             port: 465,
//             secure: true,
//             auth: {
//                 user: `${process.env.mail}`,
//                 pass: `${process.env.pass}`
//             },
//         });
//         const mailOptions = {
//             from: `${process.env.mail}`,
//             to: `${email}`,
//             subject: subject,
//             html: message,
//         };
//         await transporter.verify();
//         await transporter.sendMail(mailOptions, (err, response) => {
//             if (err) {
//                 throw new Error('Something went wrong');
//             }
//         });
//     } catch (err) {
//         (err);
//     }
// }

// module.exports = sendMail;


const nodemailer = require("nodemailer");

const sendMail = async (subject, message, email) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.NODEMAILER_HOST,
            port: 465,
            secure: true,
            auth: {
                user: process.env.NODEMAILER_ID,
                pass: process.env.NODEMAILER_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.NODEMAILER_ID,
            to: email,
            subject: subject,
            html: message
        };

        await transporter.verify();

        await transporter.sendMail(mailOptions);

        console.log("Email sent successfully");

    } catch (err) {
        console.log("Mail Error:", err);
    }
};

module.exports = sendMail;