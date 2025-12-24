// ไฟล์: server/calendarService.js
const { google } = require('googleapis');

// --- เพิ่ม 2 บรรทัดนี้เพื่อเช็คค่า ---
console.log("--> DEBUG: กำลังใช้ ID:", process.env.GOOGLE_CALENDAR_ID);
console.log("--> DEBUG: กำลังใช้ KEY:", process.env.GOOGLE_API_KEY ? "มีค่า (ซ่อนไว้)" : "ไม่มีค่า");
// --------------------------------

// ดึงค่า ID และ Key จาก Environment Variables
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

// ใช้ API Key ง่ายที่สุดสำหรับการดึงข้อมูลแบบ Public
const calendar = google.calendar({
    version: 'v3',
    auth: process.env.GOOGLE_API_KEY // API Key ที่สร้างจาก Google Cloud Console
});

const getUpcomingEvents = async () => {
    // ตรวจสอบว่ามีค่า Env Var ครบหรือไม่
    if (!CALENDAR_ID || !process.env.GOOGLE_API_KEY) {
        console.error("Error: GOOGLE_CALENDAR_ID or GOOGLE_API_KEY is missing in environment variables.");
        return [];
    }
    
    try {
        // --- ส่วนที่แก้ไข (FIX) ---
        // สร้าง object วันที่ปัจจุบัน และตั้งเวลาเป็น 00:00:00 (เริ่มวัน)
        // เพื่อให้ดึงกิจกรรมที่เริ่มไปแล้วในช่วงเช้าของวันนี้มาแสดงด้วย
        const now = new Date();
        now.setHours(0, 0, 0, 0); 

        const response = await calendar.events.list({
            calendarId: CALENDAR_ID,
            timeMin: now.toISOString(), // ใช้เวลาเริ่มต้นของวัน (แทนเวลาปัจจุบัน)
            maxResults: 15, // ดึงมา 15 กิจกรรมล่าสุด
            singleEvents: true,
            orderBy: 'startTime',
            timeZone: 'Asia/Bangkok' // ระบุ Timezone เพื่อความถูกต้องแม่นยำ
        });
        
        // จัดรูปแบบข้อมูลให้ง่ายต่อการใช้งานในฝั่ง Frontend
        const events = response.data.items.map(event => ({
            id: event.id,
            summary: event.summary,
            description: event.description || '', // ป้องกันค่า null
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
            location: event.location || '',
            link: event.htmlLink,
        }));

        return events;

    } catch (error) {
        console.error('Error fetching Google Calendar events:', error.message);
        
        // เพิ่ม Log พิเศษเพื่อช่วยตรวจสอบปัญหา (Debug)
        if (error.code === 404) {
            console.error('-> สาเหตุที่เป็นไปได้: Calendar ID ผิด หรือ ปฏิทินยังไม่ได้ตั้งค่าเป็น "สาธารณะ" (Public)');
        } else if (error.code === 403) {
            console.error('-> สาเหตุที่เป็นไปได้: API Key ผิด หรือ ยังไม่ได้ Enable Google Calendar API ใน Console');
        }
        
        return [];
    }
};

module.exports = { getUpcomingEvents };