// ไฟล์: server/calendarService.js (สร้างใหม่)
const { google } = require('googleapis');

// ดึงค่า ID และ Key จาก Environment Variables
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

// ใช้ API Key ง่ายที่สุดสำหรับการดึงข้อมูลแบบ Public
const calendar = google.calendar({
    version: 'v3',
    auth: process.env.GOOGLE_API_KEY // API Key ที่สร้างจาก Google Cloud Console
});

const getUpcomingEvents = async () => {
    if (!CALENDAR_ID || !process.env.GOOGLE_API_KEY) {
        console.error("GOOGLE_CALENDAR_ID or API_KEY is missing in environment variables.");
        return [];
    }
    
    try {
        const response = await calendar.events.list({
            calendarId: CALENDAR_ID,
            timeMin: (new Date()).toISOString(), // เริ่มจากเวลาปัจจุบัน
            maxResults: 15, // ดึงมา 15 กิจกรรมล่าสุด
            singleEvents: true,
            orderBy: 'startTime',
        });
        
        // จัดรูปแบบข้อมูลให้ง่ายต่อการใช้งาน
        const events = response.data.items.map(event => ({
            id: event.id,
            summary: event.summary,
            description: event.description,
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
            location: event.location,
            link: event.htmlLink,
        }));

        return events;

    } catch (error) {
        console.error('Error fetching Google Calendar events:', error.message);
        return [];
    }
};

module.exports = { getUpcomingEvents };