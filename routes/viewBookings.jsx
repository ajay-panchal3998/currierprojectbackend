const router = require("express").Router();
const { pool } = require("../database/db");

// ---------------- credit booking ----------------
router.post("/credit_booking", async (req, res) => {
    try {

    } catch (err) {
        console.error("Credit booking error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
module.exports = router;