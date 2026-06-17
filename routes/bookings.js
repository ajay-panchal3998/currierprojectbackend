const router = require("express").Router();
const { pool } = require("../database/db");
const multerfunc = require('../middleware/multer.js');
const generatePdf = require("../middleware/generateCreditBookingPdf");
const generateretailPdf = require("../middleware/generateRetailBookingPdf.js");
const sendBookingEmail = require("../middleware/sendbookingemail.js");

const upload = multerfunc();

// ---------------- credit booking ----------------
router.post("/credit_booking", async (req, res) => {
    try {
        // const { userid } = req.user;
        const userid = 22;
        // ✅ Generate PDF
        const pdfPath = await generatePdf(req.body);

        const {
            client, department, document_number, delivery_pin_code,
            type, service, travel_by, receiver_name, receiver_address,
            mobile_number, receiver_mobile_number, email, content, company_name, value, weight,
            insured, price, length, width, height,
            vol_weight, package_charge, total_amount
        } = req.body;

        // 2. ✅ Check if Document Number already exists
        const checkQuery = "SELECT document_number FROM creditbooking WHERE document_number = ?";
        const [existingDoc] = await pool.query(checkQuery, [document_number]);

        if (existingDoc.length > 0) return res.status(409).json({ success: false, message: `Document number ${document_number} already exists.` });
        if (!client || !document_number || !receiver_name || !mobile_number) return res.status(400).json({ success: false, message: "Required fields missing" });

        const query = `
            INSERT INTO creditbooking (
              userid, client, department, document_number, delivery_pin_code,
              type, service, travel_by, receiver_name, receiver_address,
              mobile_number,receiver_mobile_number, email, content, company_name, value, weight,
              insured, price, length, width, height, vol_weight,
              package_charge, total_amount, pdf
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

        const values = [
            userid, client, department, document_number, delivery_pin_code,
            type, service, travel_by, receiver_name, receiver_address,
            mobile_number, receiver_mobile_number, email, content, company_name, value, weight,
            insured, price, length, width, height, vol_weight,
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

// ---------------- fetch clients ----------------
router.post('/fetch_clients', async (req, res) => {
    try {
        const { search = "" } = req.body;
        let query;
        let trimValue = search.trim()
        let params = [];

        if (!trimValue) {
            query = `
                SELECT DISTINCT client 
                FROM creditbooking 
                ORDER BY client ASC 
                LIMIT 5
            `;
        } else {
            query = `
                SELECT DISTINCT client 
                FROM creditbooking 
                WHERE client LIKE ?   -- PREFIX SEARCH
                ORDER BY client ASC
                LIMIT 5
            `;
            params.push(`${trimValue}%`); // ⭐ optimized
        }

        const [rows] = await pool.execute(query, params);

        res.json(rows.map(r => r.client));

    } catch (err) {
        console.error("fetch clients error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ---------------- fetch departments by client ----------------
router.post('/fetch_departments', async (req, res) => {

    try {
        const { client = "", department = "" } = req.body;
        let query;
        let params = [];

        if (!client.trim()) {
            // No client selected, ignore department search, return top 5 departments
            query = `
                SELECT DISTINCT department
                FROM creditbooking
                ORDER BY department ASC
                LIMIT 5
            `;
        } else {
            // Client is selected, filter by client and optional department prefix
            query = `
                SELECT DISTINCT department
                FROM creditbooking
                WHERE client = ?
            `;
            params.push(client.trim());

            if (department.trim()) {
                query += " AND department LIKE ?";
                params.push(`${department.trim()}%`);
            }

            query += " ORDER BY department ASC LIMIT 10";
        }

        const [rows] = await pool.execute(query, params);
        res.json(rows.map(r => r.department));

    } catch (err) {
        console.error("fetch departments error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ---------------- fetch departments by client ----------------
router.post("/retail_booking", upload.single("document_image"), async (req, res) => {
    try {
        const data = req.body;
        const document_image = req.file ? req.file.path : null;
        const pdfPath = await generateretailPdf(req.body, document_image);
        const checkQuery = "SELECT document_number FROM retail_booking WHERE document_number = ?";
        const [existingDoc] = await pool.query(checkQuery, [data?.document_number,]);

        if (existingDoc.length > 0) return res.status(409).json({ success: false, message: `Document number ${data?.document_number} already exists.` });

        const sql = `
        INSERT INTO retail_booking (
        company_name,
        document_number,
        delivery_pin_code,
        discount_booking,
        sender_name,
        sender_pincode,
        sender_address,
        email_address,
        mobile_number,
        gst_number,
        kyc_type,
        kyc_number,
        receiver_name,
        receiver_address,
        receiver_mobile,
        receiver_email,
        type,
        content,
        weight,
        travel_by,
        service,
        value,
        insured,
        payment,
        price,
        package_charge,
        length,
        width,
        height,
        vol_weight,
        insurance_percentage,
        insurance_value,
        document_type,
        document_image,
        total_amount,
        pdf
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

        const values = [
            data.company_name,
            data.document_number,
            data.delivery_pin_code,
            data.discount_booking,
            data.sender_name,
            data.sender_pincode,
            data.sender_address,
            data.email_address,
            data.mobile_number,
            data.gst_number,
            data.kyc_type,
            data.kyc_number,
            data.receiver_name,
            data.receiver_address,
            data.receiver_mobile,
            data.receiver_email,
            data.type,
            data.content,
            data.weight,
            data.travel_by,
            data.service,
            data.value,
            data.insured,
            data.payment,
            data.price,
            data.package_charge,
            data.length,
            data.width,
            data.height,
            data.vol_weight,
            data.insurance_percentage,
            data.insurance_value,
            data.document_type,
            document_image,
            data.total_amount,
            pdfPath
        ];

        await pool.query(sql, values);

        res.status(201).json({
            success: true,
            message: "Credit booking created & PDF generated",
            pdfPath
        });
        await sendBookingEmail(data.email_address, data.receiver_email, data, pdfPath);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

router.post('/fetch_credit_booking', async (req, res) => {

    const { fromDate, toDate, client, department, docSearch: search, page = 1, limit = 20 } = req.body;
    let where = "WHERE 1=1";
    let values = [];

    if (fromDate && toDate) {
        where += " AND DATE(created_at) BETWEEN ? AND ?";
        values.push(fromDate, toDate);
    }

    if (client) {
        where += " AND client = ?";
        values.push(client);
    }

    if (department) {
        where += " AND department = ?";
        values.push(department);
    }

    if (search) {
        where += ` AND (
            id LIKE ?
            OR document_number LIKE ?
            OR delivery_pin_code LIKE ?
            OR type LIKE ?
            OR service LIKE ?
            OR travel_by LIKE ?
            OR receiver_name LIKE ?
            OR receiver_address LIKE ?
            OR mobile_number LIKE ?
            OR receiver_mobile_number LIKE ?
            OR email LIKE ?
            OR content LIKE ?
            OR company_name LIKE ?
            OR value LIKE ?
            OR weight LIKE ?
            OR price LIKE ?
            OR length LIKE ?
            OR width LIKE ?
            OR height LIKE ?
            OR vol_weight LIKE ?
            OR package_charge LIKE ?
            OR total_amount LIKE ?
        )`;

        const searchValue = `%${search}%`;

        values.push(
            searchValue, searchValue, searchValue, searchValue, searchValue,
            searchValue, searchValue, searchValue, searchValue, searchValue,
            searchValue, searchValue, searchValue, searchValue, searchValue,
            searchValue, searchValue, searchValue, searchValue, searchValue,
            searchValue, searchValue
        );
    }

    // TOTAL COUNT
    const countQuery = `SELECT COUNT(*) as total FROM creditbooking ${where}`;
    const [countRows] = await pool.execute(countQuery, values);

    const total = countRows[0].total;

    // PAGINATION
    const offset = (page - 1) * limit;

    const query = `
        SELECT *
        FROM creditbooking
        ${where}
        ORDER BY id DESC
        LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.execute(query, [...values, Number(limit), Number(offset)]);

    res.json({
        success: true,
        data: rows,
        total
    });

});

// ---------------- delete retail booking ----------------
router.delete("/delete_retail_booking", async (req, res) => {
    try {

        const { id } = req.body;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Id is required"
            });
        }

        const query = "DELETE FROM retail_booking WHERE id = ?";

        const [result] = await pool.execute(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Booking deleted successfully"
        });

    } catch (error) {
        console.error("Delete booking error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});




router.post('/fetch_retail_booking', async (req, res) => {
    // 1. Client aur Department hata diye gaye hain
    const { fromDate, toDate, search, page = 1, limit = 20 } = req.body;
    let where = "WHERE 1=1";
    let values = [];

    // Date Range Filter
    if (fromDate && toDate) {
        where += " AND DATE(created_at) BETWEEN ? AND ?";
        values.push(fromDate, toDate);
    }

    // Dynamic Search Logic
    if (search) {
        const searchFields = [
            "document_number", "delivery_pin_code", "sender_name", "sender_pincode",
            "sender_address", "email_address", "mobile_number", "gst_number",
            "kyc_number", "receiver_name", "receiver_address", "receiver_mobile",
            "receiver_email", "type", "content", "travel_by", "service",
            "company_name", "insured", "payment", "document_type"
        ];

        // Search in numeric/decimal fields as well
        const numericFields = [
            "weight", "value", "price", "package_charge", "total_amount",
            "vol_weight", "insurance_value"
        ];

        const allFields = [...searchFields, ...numericFields];

        // OR condition banana sabhi fields ke liye
        const searchConditions = allFields.map(field => `${field} LIKE ?`).join(" OR ");

        where += ` AND (${searchConditions})`;

        const searchValue = `%${search}%`;
        allFields.forEach(() => {
            values.push(searchValue);
        });
    }

    try {
        // TOTAL COUNT (Pagination ke liye)
        const countQuery = `SELECT COUNT(*) as total FROM retail_booking ${where}`;
        const [countRows] = await pool.execute(countQuery, values);
        const total = countRows[0].total;

        // PAGINATION
        const offset = (Number(page) - 1) * Number(limit);

        // MAIN QUERY
        const query = `
            SELECT *
            FROM retail_booking
            ${where}
            ORDER BY id DESC
            LIMIT ? OFFSET ?
        `;

        // Values array mein limit aur offset add karna
        const [rows] = await pool.execute(query, [...values, Number(limit), Number(offset)]);

        res.json({
            success: true,
            data: rows,
            total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error("Fetch Retail Booking Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
});


// ---------------- delete credit booking ----------------
router.delete("/delete_credit_booking", async (req, res) => {
    try {

        const { id } = req.body;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Id is required"
            });
        }

        const query = "DELETE FROM creditbooking WHERE id = ?";

        const [result] = await pool.execute(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Booking deleted successfully"
        });

    } catch (error) {
        console.error("Delete booking error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

module.exports = router;