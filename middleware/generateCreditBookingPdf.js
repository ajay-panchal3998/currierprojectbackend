const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");

module.exports = async (data) => {
    const uploadDir = path.join(__dirname, "../uploads/pdfs");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = `credit_booking_${Date.now()}.pdf`;
    const filePath = path.join(uploadDir, fileName);

    const html = await ejs.renderFile(
        path.join(__dirname, "../templates/creditBooking.ejs"),
        {
            ...data,
            date: new Date().toLocaleString()
        }
    );

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.pdf({
        path: filePath,
        format: "A4",
        printBackground: true
    });

    await browser.close();
    return filePath;
};
