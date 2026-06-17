// const PDFDocument = require("pdfkit");
// const bwipjs = require("bwip-js");
// const path = require("path");
// const fs = require("fs");

// module.exports = async (data) => {

//     const uploadDir = path.join(__dirname, "../uploads/pdfs");

//     if (!fs.existsSync(uploadDir)) {
//         fs.mkdirSync(uploadDir, { recursive: true });
//     }

//     const fileName = `retail_${Date.now()}.pdf`;
//     const filePath = path.join(uploadDir, fileName);

//     const doc = new PDFDocument({ size: "A4", margin: 25 });
//     const stream = fs.createWriteStream(filePath);

//     doc.pipe(stream);

//     const awb = data.document_number || "000000";

//     // ---------------- COMPANY LOGO ----------------

//     const company = (data.company_name || "").toLowerCase();

//     let logo = "maruti.png";

//     if (company.includes("dtdc")) logo = "dtdc.png";
//     else if (company.includes("trackon")) logo = "trackon.png";
//     else if (company.includes("pushpak")) logo = "pushpak.png";

//     try {
//         const logoPath = path.join(__dirname, "../assests", logo);
//         doc.image(logoPath, 40, 35, { width: 140 });
//     } catch {
//         doc.fontSize(18).text(data.company_name || "Courier", 40, 40);
//     }

//     doc.rect(25, 25, 545, 100).stroke();

//     doc.fontSize(10)
//         .text(`Date : ${new Date().toLocaleString("en-IN")}`, 400, 35)
//         .text(`AWB : ${awb}`, 400, 55)
//         .text(`Payment : ${data.payment}`, 400, 75);

//     // ---------------- BARCODE ----------------

//     const barcode = await bwipjs.toBuffer({
//         bcid: "code128",
//         text: awb,
//         scale: 2,
//         height: 8,
//         includetext: true
//     });

//     doc.image(barcode, 380, 85, { width: 160 });

//     // ---------------- SENDER ----------------

//     doc.rect(25, 135, 270, 120).stroke();

//     doc.fontSize(11).text("SENDER", 35, 140);

//     doc.fontSize(10)
//         .text(`Name : ${data.sender_name}`, 35, 160)
//         .text(`Company : ${data.company_name}`, 35, 175)
//         .text(`Address : ${data.sender_address}`, 35, 190)
//         .text(`Pincode : ${data.sender_pincode}`, 35, 205)
//         .text(`Mobile : ${data.mobile_number}`, 35, 220)
//         .text(`Email : ${data.email_address}`, 35, 235);

//     // ---------------- RECEIVER ----------------

//     doc.rect(300, 135, 270, 120).stroke();

//     doc.fontSize(11).text("RECEIVER", 310, 140);

//     doc.fontSize(10)
//         .text(`Name : ${data.receiver_name}`, 310, 160)
//         .text(`Address : ${data.receiver_address}`, 310, 175)
//         .text(`Pincode : ${data.delivery_pin_code}`, 310, 190)
//         .text(`Mobile : ${data.receiver_mobile}`, 310, 205)
//         .text(`Email : ${data.receiver_email}`, 310, 220);

//     // ---------------- KYC ----------------

//     doc.rect(25, 260, 545, 50).stroke();

//     doc.fontSize(10)
//         .text(`KYC Type : ${data.kyc_type}`, 40, 275)
//         .text(`KYC Number : ${data.kyc_number}`, 250, 275)
//         .text(`GST : ${data.gst_number || "N/A"}`, 430, 275);

//     // ---------------- SHIPMENT ----------------

//     doc.rect(25, 320, 545, 80).stroke();

//     doc.fontSize(10)
//         .text(`Type : ${data.type}`, 40, 335)
//         .text(`Service : ${data.service}`, 200, 335)
//         .text(`Mode : ${data.travel_by}`, 380, 335)
//         .text(`Content : ${data.content}`, 40, 355);

//     // weight format
//     const weightText =
//         data.type === "DOX"
//             ? `${data.weight} gm`
//             : `${data.weight} Kg`;

//     doc.text(`Weight : ${weightText}`, 380, 355);

//     // NON DOX extra info
//     if (data.type === "NON DOX") {

//         doc.text(`L×B×H : ${data.length} x ${data.width} x ${data.height}`, 200, 355);

//         doc.text(`Vol Weight : ${data.vol_weight}`, 380, 370);
//     }


//     // ---------------- PRICE CALC ----------------

//     const base = Number(data.price || 0);
//     const pack = Number(data.package_charge || 0);
//     const insurance = Number(data.insurance_value || 0);

//     const taxable = base + pack + insurance;

//     const sgst = +(taxable * 0.09).toFixed(2);
//     const cgst = +(taxable * 0.09).toFixed(2);

//     const total = +(taxable + sgst + cgst).toFixed(2);


//     // ---------------- CHARGES ----------------

//     doc.rect(25, 400, 545, 170).stroke();

//     doc.fontSize(12).text("CHARGES SUMMARY", 40, 410);

//     let y = 440;

//     const row = (label, val) => {

//         doc.fontSize(10).text(label, 60, y);

//         doc.text(`${val}`, 450, y, {
//             width: 100,
//             align: "right"
//         });

//         y += 20;
//     };

//     row("BASE RATE", base.toFixed(2));
//     row("PACKAGING", pack.toFixed(2));
//     row("INSURANCE", insurance.toFixed(2));
//     row("SUBTOTAL", taxable.toFixed(2));
//     row("SGST 9%", sgst.toFixed(2));
//     row("CGST 9%", cgst.toFixed(2));

//     doc.moveTo(40, y).lineTo(540, y).stroke();

//     y += 10;

//     doc.fontSize(14).text("TOTAL AMOUNT", 60, y);

//     doc.text(`${data.total_amount || total}`, 450, y, {
//         width: 100,
//         align: "right"
//     });

//     // ---------------- SIGNATURE ----------------

//     doc.rect(25, 600, 270, 55).stroke();
//     doc.rect(300, 600, 270, 55).stroke();

//     doc.fontSize(10).text("Sender Signature", 100, 630);
//     doc.text("Receiver Signature", 380, 630);

//     // ---------------- TERMS ----------------

//     doc.rect(25, 665, 545, 150).stroke();

//     doc.fontSize(9).text("Terms & Conditions", 35, 675);

//     doc.fontSize(8).text(
//         `1. Shipment booked on said to contain basis.
// 2. Company not responsible for prohibited items.
// 3. Insurance calculated on declared shipment value.
// 4. Claims must be filed within 7 days.
// 5. Liability limited to declared value.`,
//         35,
//         695,
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

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: "A4", margin: 25 });

            // --- CLOUDINARY UPLOAD LOGIC ---
            const cld_upload_stream = cloudinary.uploader.upload_stream(
                {
                    folder: "courier_pdfs",
                    public_id: `retail_${Date.now()}`,
                    resource_type: "raw",
                    format: "pdf"
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result.secure_url); // Ye aapko permanent link dega
                }
            );

            doc.pipe(cld_upload_stream);

            // --- EXACT SAME PDF DESIGN START ---
            const awb = data.document_number || "000000";
            const company = (data.company_name || "").toLowerCase();
            let logo = "maruti.png";

            if (company.includes("dtdc")) logo = "dtdc.png";
            else if (company.includes("trackon")) logo = "trackon.png";
            else if (company.includes("pushpak")) logo = "pushpak.png";

            try {
                const logoPath = path.join(__dirname, "../assests", logo);
                doc.image(logoPath, 40, 35, { width: 140 });
            } catch {
                doc.fontSize(18).text(data.company_name || "Courier", 40, 40);
            }

            doc.rect(25, 25, 545, 100).stroke();
            doc.fontSize(10)
                .text(`Date : ${new Date().toLocaleString("en-IN")}`, 400, 35)
                .text(`AWB : ${awb}`, 400, 55)
                .text(`Payment : ${data.payment}`, 400, 75);

            const barcode = await bwipjs.toBuffer({
                bcid: "code128", text: awb, scale: 2, height: 8, includetext: true
            });
            doc.image(barcode, 380, 85, { width: 160 });

            // SENDER
            doc.rect(25, 135, 270, 120).stroke();
            doc.fontSize(11).text("SENDER", 35, 140);
            doc.fontSize(10)
                .text(`Name : ${data.sender_name}`, 35, 160)
                .text(`Company : ${data.company_name}`, 35, 175)
                .text(`Address : ${data.sender_address}`, 35, 190)
                .text(`Pincode : ${data.sender_pincode}`, 35, 205)
                .text(`Mobile : ${data.mobile_number}`, 35, 220)
                .text(`Email : ${data.email_address}`, 35, 235);

            // RECEIVER
            doc.rect(300, 135, 270, 120).stroke();
            doc.fontSize(11).text("RECEIVER", 310, 140);
            doc.fontSize(10)
                .text(`Name : ${data.receiver_name}`, 310, 160)
                .text(`Address : ${data.receiver_address}`, 310, 175)
                .text(`Pincode : ${data.delivery_pin_code}`, 310, 190)
                .text(`Mobile : ${data.receiver_mobile}`, 310, 205)
                .text(`Email : ${data.receiver_email}`, 310, 220);

            // KYC & SHIPMENT
            doc.rect(25, 260, 545, 50).stroke();
            doc.fontSize(10)
                .text(`KYC Type : ${data.kyc_type}`, 40, 275)
                .text(`KYC Number : ${data.kyc_number}`, 250, 275)
                .text(`GST : ${data.gst_number || "N/A"}`, 430, 275);

            doc.rect(25, 320, 545, 80).stroke();
            doc.fontSize(10)
                .text(`Type : ${data.type}`, 40, 335)
                .text(`Service : ${data.service}`, 200, 335)
                .text(`Mode : ${data.travel_by}`, 380, 335)
                .text(`Content : ${data.content}`, 40, 355);

            const weightText = data.type === "DOX" ? `${data.weight} gm` : `${data.weight} Kg`;
            doc.text(`Weight : ${weightText}`, 380, 355);

            if (data.type === "NON DOX") {
                doc.text(`L×B×H : ${data.length} x ${data.width} x ${data.height}`, 200, 355);
                doc.text(`Vol Weight : ${data.vol_weight}`, 380, 370);
            }

            // PRICE CALC
            const base = Number(data.price || 0);
            const pack = Number(data.package_charge || 0);
            const insurance = Number(data.insurance_value || 0);
            const taxable = base + pack + insurance;
            const sgst = +(taxable * 0.09).toFixed(2);
            const cgst = +(taxable * 0.09).toFixed(2);
            const total = +(taxable + sgst + cgst).toFixed(2);

            // CHARGES SUMMARY
            doc.rect(25, 400, 545, 170).stroke();
            doc.fontSize(12).text("CHARGES SUMMARY", 40, 410);
            let y = 440;
            const row = (label, val) => {
                doc.fontSize(10).text(label, 60, y);
                doc.text(`${val}`, 450, y, { width: 100, align: "right" });
                y += 20;
            };
            row("BASE RATE", base.toFixed(2));
            row("PACKAGING", pack.toFixed(2));
            row("INSURANCE", insurance.toFixed(2));
            row("SUBTOTAL", taxable.toFixed(2));
            row("SGST 9%", sgst.toFixed(2));
            row("CGST 9%", cgst.toFixed(2));

            doc.moveTo(40, y).lineTo(540, y).stroke();
            y += 10;
            doc.fontSize(14).text("TOTAL AMOUNT", 60, y);
            doc.text(`${data.total_amount || total}`, 450, y, { width: 100, align: "right" });

            // SIGNATURE & TERMS
            doc.rect(25, 600, 270, 55).stroke();
            doc.rect(300, 600, 270, 55).stroke();
            doc.fontSize(10).text("Sender Signature", 100, 630);
            doc.text("Receiver Signature", 380, 630);

            doc.rect(25, 665, 545, 150).stroke();
            doc.fontSize(9).text("Terms & Conditions", 35, 675);
            doc.fontSize(8).text(
                `1. Shipment booked on said to contain basis.\n2. Company not responsible for prohibited items.\n3. Insurance calculated on declared shipment value.\n4. Claims must be filed within 7 days.\n5. Liability limited to declared value.`,
                35, 695, { width: 520 }
            );
            // --- EXACT SAME PDF DESIGN END ---

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};