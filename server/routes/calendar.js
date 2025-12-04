// ไฟล์: server/routes/calendar.js (สร้างใหม่)
const express = require('express');
const router = express.Router();
const calendarService = require('../calendarService');

// Route สาธารณะสำหรับให้ Frontend ดึงข้อมูลปฏิทินไปแสดง
router.get('/events', async (req, res) => {
    const events = await calendarService.getUpcomingEvents();
    res.json(events);
});

module.exports = router;