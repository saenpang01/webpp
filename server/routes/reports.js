const express = require('express');
const router = express.Router();
const db = require('../db');
const line = require('@line/bot-sdk'); // 1. Import LINE SDK

// 2. สร้าง Client สำหรับยิง Push Message
const client = new line.Client({
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
});

const basicAuth = require('express-basic-auth');
const users = { [process.env.ADMIN_USER]: process.env.ADMIN_PASSWORD };
const authMiddleware = basicAuth({ users, challenge: true });

// Route: GET /api/reports - ดึงข้อมูลเรื่องร้องเรียนทั้งหมด
// 2. เพิ่ม authMiddleware เข้าไปใน Route
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [reports] = await db.query('SELECT * FROM reports ORDER BY created_at DESC');
        res.json(reports);
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล reports:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
    }
});

// Route: POST /api/reports - รับเรื่องร้องเรียนใหม่
router.post('/', async (req, res) => {
    try {
        const { reporter_name, reporter_phone, report_type, details, latitude, longitude } = req.body;
        
        if (!reporter_name || !reporter_phone || !report_type || !details || !latitude || !longitude) {
            return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน กรุณากรอกทุกช่อง" });
        }

        await db.query(
            'INSERT INTO reports (reporter_name, reporter_phone, report_type, details, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)',
            [reporter_name, reporter_phone, report_type, details, latitude, longitude]
        );

        // --- 3. ส่วนการแจ้งเตือน Admin ---
        const adminUserId = process.env.ADMIN_LINE_USER_ID;
        if (adminUserId) {
            const message = {
                type: 'text',
                text: `🔔 มีเรื่องร้องเรียนใหม่!
จาก: ${reporter_name}
เบอร์: ${reporter_phone}
ประเภท: ${report_type}
รายละเอียด: ${details.substring(0, 100)}...
พิกัด: ${latitude}, ${longitude}`
            };
            await client.pushMessage(adminUserId, message);
        }
        // ---------------------------------

        res.status(201).json({ message: 'รับเรื่องร้องเรียนสำเร็จ ขอบคุณสำหรับข้อมูลครับ' });
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการบันทึก report:", error);
        // หากมี Error ให้ส่ง Error ไปยัง Admin ด้วย
        if (process.env.ADMIN_LINE_USER_ID) {
             await client.pushMessage(process.env.ADMIN_LINE_USER_ID, {
                type: 'text',
                text: '⚠️ เกิดข้อผิดพลาดในการบันทึกเรื่องร้องเรียน!'
             });
        }
        res.status(500).json({ message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
    }
});

module.exports = router;