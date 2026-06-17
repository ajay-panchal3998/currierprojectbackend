// const PDFDocument = require("pdfkit");
// const bwipjs = require("bwip-js");
// const path = require("path");
// const fs = require("fs");

// module.exports = async (data) => {
//     const uploadDir = path.join(__dirname, "../uploads/pdfs");
//     if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

//     const fileName = `booking_${Date.now()}.pdf`;
//     const filePath = path.join(uploadDir, fileName);

//     const doc = new PDFDocument({ size: "A4", margin: 25 });
//     const stream = fs.createWriteStream(filePath);
//     doc.pipe(stream);

//     const awb = data.document_number || "000000000";

//     // ------------------ COMPANY LOGO ------------------
//     const company = (data.company_name || "").toLowerCase();
//     let logo = "maruti.png";
//     if (company.includes("dtdc")) logo = "dtdc.png";
//     else if (company.includes("pushpak")) logo = "pushpak.png";
//     else if (company.includes("trackon")) logo = "trackon.png";

//     try {
//         const logoPath = path.join(__dirname, "../assests", logo);
//         doc.image(logoPath, 40, 35, { width: 150 });
//     } catch {
//         doc.fontSize(18).text(data.company_name || "Courier", 40, 40);
//     }

//     // HEADER BOX
//     doc.rect(25, 25, 545, 95).stroke();

//     doc
//         .fontSize(10)
//         .text(`Date : ${new Date().toLocaleString("en-IN")}`, 400, 35);

//     doc
//         .fontSize(10)
//         .text(`AWB No : ${awb}`, 400, 55);

//     // ------------------ BARCODE ------------------
//     const barcode = await bwipjs.toBuffer({
//         bcid: "code128",
//         text: awb,
//         scale: 2,
//         height: 8,
//         includetext: true
//     });

//     doc.image(barcode, 380, 70, { width: 160 });

//     // ------------------ SENDER / RECEIVER ------------------

//     doc.rect(25, 130, 270, 95).stroke();
//     doc.rect(300, 130, 270, 95).stroke();

//     const senderName = data.client || "-";
//     const senderAddress = data.sender_address || `PIN : ${data.delivery_pin_code}`;

//     doc.fontSize(11).text("Sender", 35, 135);

//     doc
//         .fontSize(10)
//         .text(`Name : ${senderName}`, 35, 155)
//         .text(`Address : ${senderAddress}`, 35, 170)
//         .text(`Mobile : ${data.mobile_number || "-"}`, 35, 185);

//     doc.fontSize(11).text("Receiver", 310, 135);

//     doc
//         .fontSize(10)
//         .text(`Name : ${data.receiver_name || "-"}`, 310, 155)
//         .text(`Address : ${data.receiver_address || "-"}`, 310, 170)
//         .text(`Mobile : ${data.receiver_mobile_number || "-"}`, 310, 185);

//     // ------------------ SHIPMENT INFO ------------------

//     doc.rect(25, 235, 545, 60).stroke();

//     doc.fontSize(10)
//         .text(`Type : ${data.type}`, 40, 250)
//         .text(`Service : ${data.service}`, 200, 250)
//         .text(`Mode : ${data.travel_by}`, 380, 250)
//         .text(`Weight : ${data.weight} gm`, 40, 270)
//         .text(`Content : ${data.content}`, 200, 270);

//     // ------------------ PRICE CALC ------------------

//     const base = Number(data.price || 0);
//     const pack = Number(data.package_charge || 0);

//     const taxable = base + pack;

//     const sgst = +(taxable * 0.09).toFixed(2);
//     const cgst = +(taxable * 0.09).toFixed(2);

//     const total = +(taxable + sgst + cgst).toFixed(2);

//     const insurance = Number(data.insurance_value || 0);
//     const shipmentValue = Number(data.value || 0);

//     // ------------------ BOOKING SUMMARY ------------------

//     doc.rect(25, 310, 545, 210).stroke();

//     doc.fontSize(12).text("BOOKING SUMMARY", 40, 320);

//     let y = 350;

//     const drawRow = (label, value) => {

//         // Left label
//         doc
//             .fontSize(10)
//             .text(label, 50, y);

//         // Right price (shifted left + fixed width)
//         doc
//             .fontSize(10)
//             .text(` ${value}`, 430, y, {
//                 width: 120,
//                 align: "right"
//             });

//         y += 20;
//     };

//     drawRow("BASE RATE", base.toFixed(2));
//     drawRow("PACKAGING CHARGES", pack.toFixed(2));
//     drawRow("VALUE OF SHIPMENT", shipmentValue.toFixed(2));
//     drawRow("INSURANCE / FOV", insurance.toFixed(2));
//     drawRow("SUBTOTAL (TAXABLE)", taxable.toFixed(2));
//     drawRow("SGST @ 9%", sgst.toFixed(2));
//     drawRow("CGST @ 9%", cgst.toFixed(2));

//     doc.moveTo(40, y).lineTo(540, y).stroke();

//     y += 10;

//     doc.fontSize(14).text("TOTAL AMOUNT", 50, y);

//     doc
//         .fontSize(14)
//         .text(` ${total.toFixed(2)}`, 430, y, {
//             width: 120,
//             align: "right"
//         });
//     // ------------------ SIGNATURE ------------------

//     doc.rect(25, 530, 270, 55).stroke();
//     doc.rect(300, 530, 270, 55).stroke();

//     doc.fontSize(10).text("Consignor Signature", 95, 560);
//     doc.text("Received By", 390, 560);

//     // ------------------ TERMS ------------------

//     doc.rect(25, 595, 545, 210).stroke();

//     doc.fontSize(9).text("Terms & Conditions", 35, 605);

//     doc.fontSize(8).text(
//         `1. Shipment booked on said to contain basis.
// 2. Company not responsible for prohibited items.
// 3. Insurance calculated on declared shipment value.
// 4. Liability limited to declared value.
// 5. Claims within 7 days only.`,
//         35,
//         625,
//         { width: 520 }
//     );

//     doc.end();

//     await new Promise(resolve => stream.on("finish", resolve));

//     return `uploads/pdfs/${fileName}`;
// };



const PDFDocument = require("pdfkit");
const bwipjs = require("bwip-js");
const path = require("path");
const cloudinary = require("cloudinary").v2;

// Cloudinary Config (Make sure your .env has these keys)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: "A4", margin: 25 });

            // 1. Setup Cloudinary Upload Stream
            const cld_upload_stream = cloudinary.uploader.upload_stream(
                {
                    folder: "booking_pdfs",
                    public_id: `booking_${Date.now()}`,
                    resource_type: "raw", // PDF ke liye 'raw' use karna zaroori hai
                    format: "pdf"
                },
                (error, result) => {
                    if (error) return reject(error);
                    // 2. Resolve with the permanent LIVE URL
                    resolve(result.secure_url);
                }
            );

            // 3. Pipe PDFkit output to Cloudinary instead of fs
            doc.pipe(cld_upload_stream);

            const awb = data.document_number || "000000000";

            // ------------------ COMPANY LOGO ------------------
            const company = (data.company_name || "").toLowerCase();
            let logo = "maruti.png";
            if (company.includes("dtdc")) logo = "dtdc.png";
            else if (company.includes("pushpak")) logo = "pushpak.png";
            else if (company.includes("trackon")) logo = "trackon.png";

            try {
                const logoPath = path.join(__dirname, "../assests", logo);
                doc.image(logoPath, 40, 35, { width: 150 });
            } catch {
                doc.fontSize(18).text(data.company_name || "Courier", 40, 40);
            }

            // HEADER BOX
            doc.rect(25, 25, 545, 95).stroke();
            doc.fontSize(10).text(`Date : ${new Date().toLocaleString("en-IN")}`, 400, 35);
            doc.fontSize(10).text(`AWB No : ${awb}`, 400, 55);

            // ------------------ BARCODE ------------------
            const barcode = await bwipjs.toBuffer({
                bcid: "code128",
                text: awb,
                scale: 2,
                height: 8,
                includetext: true
            });
            doc.image(barcode, 380, 70, { width: 160 });

            // ------------------ SENDER / RECEIVER ------------------
            doc.rect(25, 130, 270, 95).stroke();
            doc.rect(300, 130, 270, 95).stroke();

            const senderName = data.client || "-";
            const senderAddress = data.sender_address || `PIN : ${data.delivery_pin_code}`;

            doc.fontSize(11).text("Sender", 35, 135);
            doc.fontSize(10)
                .text(`Name : ${senderName}`, 35, 155)
                .text(`Address : ${senderAddress}`, 35, 170)
                .text(`Mobile : ${data.mobile_number || "-"}`, 35, 185);

            doc.fontSize(11).text("Receiver", 310, 135);
            doc.fontSize(10)
                .text(`Name : ${data.receiver_name || "-"}`, 310, 155)
                .text(`Address : ${data.receiver_address || "-"}`, 310, 170)
                .text(`Mobile : ${data.receiver_mobile_number || "-"}`, 310, 185);

            // ------------------ SHIPMENT INFO ------------------
            doc.rect(25, 235, 545, 60).stroke();
            doc.fontSize(10)
                .text(`Type : ${data.type}`, 40, 250)
                .text(`Service : ${data.service}`, 200, 250)
                .text(`Mode : ${data.travel_by}`, 380, 250)
                .text(`Weight : ${data.weight} gm`, 40, 270)
                .text(`Content : ${data.content}`, 200, 270);

            // ------------------ PRICE CALC ------------------
            const base = Number(data.price || 0);
            const pack = Number(data.package_charge || 0);
            const taxable = base + pack;
            const sgst = +(taxable * 0.09).toFixed(2);
            const cgst = +(taxable * 0.09).toFixed(2);
            const total = +(taxable + sgst + cgst).toFixed(2);
            const insurance = Number(data.insurance_value || 0);
            const shipmentValue = Number(data.value || 0);

            // ------------------ BOOKING SUMMARY ------------------
            doc.rect(25, 310, 545, 210).stroke();
            doc.fontSize(12).text("BOOKING SUMMARY", 40, 320);

            let y = 350;
            const drawRow = (label, value) => {
                doc.fontSize(10).text(label, 50, y);
                doc.fontSize(10).text(` ${value}`, 430, y, {
                    width: 120,
                    align: "right"
                });
                y += 20;
            };

            drawRow("BASE RATE", base.toFixed(2));
            drawRow("PACKAGING CHARGES", pack.toFixed(2));
            drawRow("VALUE OF SHIPMENT", shipmentValue.toFixed(2));
            drawRow("INSURANCE / FOV", insurance.toFixed(2));
            drawRow("SUBTOTAL (TAXABLE)", taxable.toFixed(2));
            drawRow("SGST @ 9%", sgst.toFixed(2));
            drawRow("CGST @ 9%", cgst.toFixed(2));

            doc.moveTo(40, y).lineTo(540, y).stroke();
            y += 10;
            doc.fontSize(14).text("TOTAL AMOUNT", 50, y);
            doc.fontSize(14).text(` ${total.toFixed(2)}`, 430, y, {
                width: 120,
                align: "right"
            });

            // ------------------ SIGNATURE ------------------
            doc.rect(25, 530, 270, 55).stroke();
            doc.rect(300, 530, 270, 55).stroke();
            doc.fontSize(10).text("Consignor Signature", 95, 560);
            doc.text("Received By", 390, 560);

            // ------------------ TERMS ------------------
            doc.rect(25, 595, 545, 210).stroke();
            doc.fontSize(9).text("Terms & Conditions", 35, 605);
            doc.fontSize(8).text(
                `1. Shipment booked on said to contain basis.\n2. Company not responsible for prohibited items.\n3. Insurance calculated on declared shipment value.\n4. Liability limited to declared value.\n5. Claims within 7 days only.`,
                35, 625, { width: 520 }
            );

            // 4. End document to trigger the upload
            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};