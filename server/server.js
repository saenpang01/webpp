// server/server.js

// 1. Import Packages
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

// Import routes
const postRoutes = require('./routes/posts');
const webhookRoutes = require('./routes/webhook');
const calendarRoutes = require('./routes/calendar'); // Feature: Google Calendar
const { startScheduler } = require('./scheduler');

// 2. Initialize Express App
const app = express();
const PORT = process.env.PORT || 3001;

// 3. Middlewares
app.use(cors());

// --- 4. กำหนดเส้นทาง (Routes) ---

// *** สำคัญ: ทำให้โฟลเดอร์ public เป็นโฟลเดอร์หลักสำหรับไฟล์ Frontend ***
app.use(express.static(path.join(__dirname, '../public')));

// *** เรียกใช้ Webhook ก่อน express.json() ***
app.use('/api/line-webhook', webhookRoutes); 

// Middleware สำหรับอ่าน JSON body
app.use(express.json()); 

// API Routes
app.use('/api/posts', postRoutes);       // ข่าวสาร (Read-only)
app.use('/api/calendar', calendarRoutes); // ปฏิทินกิจกรรม

// Basic Route (Fallback)
app.get('/', (req, res) => {
    res.send('<h1>Backend ของพรรคประชาชนอุตรดิตถ์ (Clean Version)</h1>');
});

// 5. Start the Server
app.listen(PORT, () => {
    console.log(`เซิร์ฟเวอร์กำลังทำงานที่ http://localhost:${PORT}`);
    startScheduler();
});