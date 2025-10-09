const express = require('express');
const router = express.Router();
const db = require('../db');

// Route: GET /api/reports - ดึงข้อมูลเรื่องร้องเรียนทั้งหมด
router.get('/', async (req, res) => {
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
        const { report_type, details, latitude, longitude } = req.body;
        
        // ตรวจสอบข้อมูลเบื้องต้น
        if (!report_type || !details || !latitude || !longitude) {
            return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });
        }

        await db.query(
            'INSERT INTO reports (report_type, details, latitude, longitude) VALUES (?, ?, ?, ?)',
            [report_type, details, latitude, longitude]
        );
        res.status(201).json({ message: 'รับเรื่องร้องเรียนสำเร็จ ขอบคุณสำหรับข้อมูลครับ' });
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการบันทึก report:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
    }
});

module.exports = router;