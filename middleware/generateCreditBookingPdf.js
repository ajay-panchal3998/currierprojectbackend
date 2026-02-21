// const puppeteer = require("puppeteer");
// const path = require("path");
// const fs = require("fs");
// const ejs = require("ejs");

// module.exports = async (data) => {
//     console.log(data, '344r343')
//     const uploadDir = path.join(__dirname, "../uploads/pdfs");
//     if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

//     const fileName = `credit_booking_${Date.now()}.pdf`;
//     const filePath = `uploads/pdfs/${fileName}`;
//     // --- LOGIC TO GET LOGO FROM ASSETS ---
//     let logoBase64 = "";
//     const company = (data.company_name || "").toLowerCase();

//     // Determine which image to use from your assets folder
//     let logoName = "maruti.png"; // default
//     if (company.includes("dtdc")) logoName = "dtdc.webp";
//     if (company.includes("pushpak")) logoName = "pushpak.png";

//     try {
//         const logoPath = path.join(__dirname, "../assests", logoName);
//         const image = fs.readFileSync(logoPath);
//         logoBase64 = `data:image/${path.extname(logoName).replace('.', '')};base64,${image.toString('base64')}`;
//     } catch (err) {
//         console.log("Logo not found, skipping image");
//     }

//     const html = await ejs.renderFile(
//         path.join(__dirname, "../templates/creditBooking.ejs"),
//         {
//             ...data,
//             logo: logoBase64, // Pass the base64 image to EJS
//             date: new Date().toLocaleString('en-IN')
//         }
//     );

//     const browser = await puppeteer.launch({
//         headless: "new",
//         args: ["--no-sandbox", "--disable-setuid-sandbox"]
//     });

//     const page = await browser.newPage();
//     await page.setContent(html, { waitUntil: "networkidle0" });

//     await page.pdf({
//         path: filePath,
//         format: "A4",
//         margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
//         printBackground: true
//     });

//     await browser.close();
//     return filePath;
// };

const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");

module.exports = async (data) => {
    console.log(data, '344r343')
    const uploadDir = path.join(__dirname, "../uploads/pdfs");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = `credit_booking_${Date.now()}.pdf`;
    const filePath = `uploads/pdfs/${fileName}`;
    let logoBase64 = "";
    const company = (data.company_name || "").toLowerCase();

    // Determine which image to use based on company name
    let logoName = "maruti.png"; // default
    if (company.includes("dtdc")) {
        logoName = "dtdc.webp";
    } else if (company.includes("pushpak")) {
        logoName = "pushpak.png";
    } else if (company.includes("trackon")) {
        logoName = "trackon.png";
    }

    try {
        const logoPath = path.join(__dirname, "../assests", logoName);
        const image = fs.readFileSync(logoPath);
        logoBase64 = `data:image/${path.extname(logoName).replace('.', '')};base64,${image.toString('base64')}`;
    } catch (err) {
        console.log("Logo not found, skipping image");
    }

    const html = await ejs.renderFile(
        path.join(__dirname, "../templates/creditBooking.ejs"),
        {
            ...data,
            logo: logoBase64, // Pass the base64 image to EJS
            date: new Date().toLocaleString('en-IN')
        }
    );

    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    await page.pdf({
        path: filePath,
        format: "A4",
        margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
        printBackground: true
    });

    await browser.close();
    return filePath;
};