const mysql = require('mysql2');
require('dotenv').config();

// สร้าง Connection Pool เพื่อประสิทธิภาพที่ดีกว่า
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306, // เพิ่ม port เผื่อไว้
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // *** FIX: เพิ่มการตั้งค่า SSL สำหรับ Cloud DB ***
    ssl: {
        rejectUnauthorized: false
    }
});

// Export promise-based pool
module.exports = pool.promise();