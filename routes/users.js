const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { pool } = require("../database/db");
const { genUserId, genOTP } = require("../Helper/generationIdfunc");
const { encryptPassword, decryptPassword } = require("../helper/encriptpass");
const verifyToken = require('../middleware/verifyToken.js');
const genJwtToken = require("../middleware/genjwttoken.js");
const sendMail = require("../Helper/sendMail.js");

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

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: "email & password required" });

        const [rows] = await pool.query(
            "SELECT * FROM users WHERE email=?",
            [email]
        );

        if (rows.length === 0)
            return res.status(404).json({ message: "User not found" });

        const user = rows[0];

        // ✅ check access
        if (user.access !== 1)
            return res.status(403).json({ message: "Account is disabled" });

        const isMatch = await decryptPassword(password, user.password);

        if (!isMatch)
            return res.status(401).json({ message: "Invalid credentials" });

        const token = genJwtToken(user.userid, email);

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
router.post("/forgotpassword", async (req, res) => {
    try {
        const { email } = req.body;

        const otp = genOTP();

        // get user first
        const [rows] = await pool.query(
            "SELECT userid FROM users WHERE email=?",
            [email]
        );

        if (rows.length === 0)
            return res.status(404).json({ message: "User not found" });

        const userid = rows[0].userid;

        // update OTP
        await pool.query(
            "UPDATE users SET otp=?, otp_created_at=NOW() WHERE email=?",
            [otp, email]
        );

        await sendMail(
            "Update Password OTP",
            `otp for update password is ${otp}`,
            email
        );

        res.json({
            success: true,
            message: "OTP sent",
            userid   // 👈 sending userid in response
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/update-password", async (req, res) => {
    try {
        const { otp, password, userid } = req.body;


        if (!otp || !password)
            return res.status(400).json({ message: "All fields required" });

        const [rows] = await pool.query(
            "SELECT otp, otp_created_at FROM users WHERE userid=?",
            [userid]
        );
        if (rows[0].otp != otp)
            return res.status(401).json({ message: "Invalid OTP" });

        const diff = (new Date() - new Date(rows[0].otp_created_at)) / 60000;
        if (diff > 5)
            return res.status(401).json({ message: "OTP expired" });

        const hash = await encryptPassword(password);

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