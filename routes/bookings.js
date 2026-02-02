const router = require("express").Router();
const { pool } = require("../database/db");
const verifyToken = require('../middleware/verifyToken.js');
const multerfunc = require('../middleware/multer.js')
const generatePdf = require("../middleware/generateCreditBookingPdf");
// ---------------- credit booking ----------------
router.post("/credit_booking", verifyToken, async (req, res) => {
    try {
        const { userid } = req.user;

        console.log(req.body);

        // ✅ Generate PDF
        const pdfPath = await generatePdf(req.body);

        const {
            client, departmant, document_number, delivery_pin_code,
            type, service, travel_by, receiver_name, receiver_address,
            mobile_number, email, content, company_name, value, weight,
            insured, eway_bill, price, length, width, height,
            vol_weight, package_charge, total_amount
        } = req.body;

        if (!client || !document_number || !receiver_name || !mobile_number) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing"
            });
        }

        const query = `
            INSERT INTO creditbooking (
              userid, client, departmant, document_number, delivery_pin_code,
              type, service, travel_by, receiver_name, receiver_address,
              mobile_number, email, content, company_name, value, weight,
              insured, eway_bill, price, length, width, height, vol_weight,
              package_charge, total_amount, pdf
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

        const values = [
            userid, client, departmant, document_number, delivery_pin_code,
            type, service, travel_by, receiver_name, receiver_address,
            mobile_number, email, content, company_name, value, weight,
            insured, eway_bill, price, length, width, height, vol_weight,
            package_charge, total_amount, pdfPath
        ];

        await pool.query(query, values);

        res.status(201).json({
            success: true,
            message: "Credit booking created & PDF generated",
            pdfPath
        });

    } catch (err) {
        console.error("Credit booking error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;