const mysql = require('mysql2');
require('dotenv').config(); // ตรวจสอบว่ามีบรรทัดนี้แล้ว

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'webpp_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // เพิ่มบรรทัดนี้เผื่อ Cloud DB บังคับใช้ SSL
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool.promise();