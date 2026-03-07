const nodemailer = require("nodemailer");

const sendBookingEmail = async (senderEmail, receiverEmail, bookingData, pdfPath) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.NODEMAILER_ID, // Your Gmail
                pass: process.env.NODEMAILER_PASSWORD    // Your Google App Password
            }
        });

        const mailOptions = {
            from: '"Anushka Courier" <your-email@gmail.com>',
            to: [senderEmail, receiverEmail], // Passing as an array sends to both
            subject: `New Booking Confirmed: ${bookingData.document_number}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #004a99; color: white; padding: 20px; text-align: center;">
                        <h1>Anushka Courier</h1>
                    </div>
                    <div style="padding: 20px; color: #333;">
                        <h3>Hello,</h3>
                        <p>A new courier booking has been successfully created. Below are the shipment details:</p>
                        
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p><b>Document No:</b> ${bookingData.document_number}</p>
                            <p><b>Company:</b> ${bookingData.company_name}</p>
                            <p><b>Sender:</b> ${bookingData.sender_name}</p>
                            <p><b>Receiver:</b> ${bookingData.receiver_name}</p>
                            <p><b>Total Amount:</b> ₹${bookingData.total_amount}</p>
                        </div>

                        <p>The official receipt is attached to this email as a PDF.</p>
                    </div>
                    <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #777;">
                        © 2026 Anushka Courier Service. All rights reserved.
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: `Receipt_${bookingData.document_number}.pdf`,
                    path: pdfPath
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Email Error: ", error);
        return false;
    }
};
module.exports = sendBookingEmail;
