const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { pool } = require("../database/db");
const { genUserId } = require("../Helper/generationIdfunc");
const { encryptPassword, decryptPassword } = require("../helper/encriptpass");
const verifyToken = require('../middleware/verifyToken.js');
const genJwtToken = require("../middleware/genjwttoken.js");

// ---------------- REGISTER ----------------
router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: "All fields required" });

        // check user exists
        const [exist] = await pool.query(
            "SELECT id FROM users WHERE email=?",
            [email]
        );

        if (exist.length > 0) return res.status(409).json({ message: "User already exists" });

        const userid = await genUserId();
        const hashPassword = await encryptPassword(password);

        await pool.query(
            "INSERT INTO users (userid, email, password, created_at) VALUES (?, ?, ?, NOW())",
            [userid, email, hashPassword]
        );

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            userid
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


// ---------------- LOGIN ----------------
router.post("/login", async (req, res) => {
    try {
        const { userid, email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: "email & password required" });

        const [rows] = await pool.query("SELECT * FROM users WHERE email=?", [email]);

        if (rows.length === 0) return res.status(404).json({ message: "User not found" });

        const user = rows[0];

        const isMatch = await decryptPassword(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
        const token = genJwtToken(userid, email);
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/update-password/send-otp", verifyToken, async (req, res) => {
    try {
        const { userid } = req.user;
        const otp = genOTP();

        await pool.query("UPDATE users SET otp=?, otp_created_at=NOW() WHERE userid=?", [otp, userid]);
        const [user] = await pool.query("SELECT email FROM users WHERE userid=?", [userid]);
        const email = user[0].email;
        await sendMail(
            "Update Password OTP",
            message(otp, "", email),
            email
        );
        res.json({ success: true, message: "OTP sent" });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/update-password", verifyToken, async (req, res) => {
    try {
        const { otp, newPassword } = req.body;
        const { userid } = req.user;

        if (!otp || !newPassword)
            return res.status(400).json({ message: "All fields required" });

        const [rows] = await pool.query(
            "SELECT otp, otp_created_at FROM users WHERE userid=?",
            [userid]
        );

        if (rows[0].otp !== otp)
            return res.status(401).json({ message: "Invalid OTP" });

        const diff = (new Date() - new Date(rows[0].otp_created_at)) / 60000;
        if (diff > 5)
            return res.status(401).json({ message: "OTP expired" });

        const hash = await encryptPassword(newPassword);

        await pool.query(
            "UPDATE users SET password=?, otp=NULL WHERE userid=?",
            [hash, userid]
        );

        res.json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;