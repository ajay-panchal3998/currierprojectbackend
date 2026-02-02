// const mysql = require("mysql2");

// // Create a pool instead of a single connection
// const pool = mysql.createPool({
//     host: process.env.HOST || 'localhost',
//     user: process.env.DB_USER || 'root',
//     password: process.env.PASSWORD || '',
//     database: process.env.DATABASE || 'courier_db',
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

// // Convert to promise-based to use async/await
// const promisePool = pool.promise();

// // Check connection immediately on startup
// pool.getConnection((err, connection) => {
//     if (err) {
//         console.error('❌ Database connection failed:', err.message);
//     } else {
//         console.log('✅ Connected to MySQL Database');
//         connection.release();
//     }
// });

// module.exports = promisePool;
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.PASSWORD || "",
    database: process.env.DATABASE || "courier_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Check connection
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log("✅ Connected to MySQL Database");
        connection.release();
    } catch (err) {
        console.error("❌ Database connection failed:", err.message);
    }
})();

module.exports = { pool };
