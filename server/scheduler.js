// server/scheduler.js
const cron = require('node-cron');
const line = require('@line/bot-sdk');
const calendarService = require('./calendarService'); // เรียกใช้ Service ที่เราทำไว้
require('dotenv').config();

// ตั้งค่า LINE Client สำหรับส่งข้อความ (Push Message)
const lineConfig = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};
const client = new line.Client(lineConfig);

// User ID ของ Admin หรือ Group ID ที่ต้องการแจ้งเตือน
// (คุณต้องเอา User ID ของคุณมาใส่ตรงนี้ หรือตั้งเป็น ENV ก็ได้)
const TARGET_USER_ID = process.env.ADMIN_LINE_USER_ID; 

const startScheduler = () => {
    console.log('🕒 Scheduler started: Waiting to check calendar events...');

    // ตั้งเวลา: รันทุกวัน เวลา 08:00 น.
    // รูปแบบ Cron: "นาที ชั่วโมง วัน เดือน วันในสัปดาห์"
    // "0 8 * * *" = 08:00 ทุกวัน
    cron.schedule('0 8 * * *', async () => {
        console.log('⏰ Running daily calendar check...');
        
        try {
            // 1. ดึงข้อมูลกิจกรรมจาก Google Calendar
            const events = await calendarService.getUpcomingEvents();
            
            // 2. กรองเฉพาะกิจกรรมที่ "เริ่มวันนี้"
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0]; // ได้ค่า "YYYY-MM-DD"

            const todaysEvents = events.filter(event => {
                const eventDate = new Date(event.start).toISOString().split('T')[0];
                return eventDate === todayStr;
            });

            // 3. ถ้ามีกิจกรรมวันนี้ ให้ส่ง LINE
            if (todaysEvents.length > 0) {
                console.log(`🎉 Found ${todaysEvents.length} events for today. Sending notification...`);
                
                for (const event of todaysEvents) {
                    await sendLineNotification(event);
                }
            } else {
                console.log('💤 No events today.');
            }

        } catch (error) {
            console.error('❌ Scheduler Error:', error);
        }
    }, {
        timezone: "Asia/Bangkok" // ตั้งเวลาตามโซนไทย
    });
};

// ฟังก์ชันสร้างข้อความและส่งเข้า LINE
const sendLineNotification = async (event) => {
    if (!TARGET_USER_ID) {
        console.error('⚠️ ADMIN_LINE_USER_ID is not set in .env');
        return;
    }

    // จัดรูปแบบเวลา
    const startTime = new Date(event.start).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    
    // สร้าง Flex Message ให้ดูสวยงาม
    const message = {
        type: 'flex',
        altText: `📅 กิจกรรมวันนี้: ${event.summary}`,
        contents: {
            type: 'bubble',
            hero: {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1000&auto=format&fit=crop', // รูปหัวข้อกิจกรรม (ใส่รูป Placeholder หรือรูปพรรค)
                size: 'full',
                aspectRatio: '20:13',
                aspectMode: 'cover',
            },
            body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'text',
                        text: 'กิจกรรมวันนี้!',
                        weight: 'bold',
                        color: '#FF6A13',
                        size: 'sm'
                    },
                    {
                        type: 'text',
                        text: event.summary,
                        weight: 'bold',
                        size: 'xl',
                        margin: 'md',
                        wrap: true
                    },
                    {
                        type: 'text',
                        text: event.location || 'ไม่ระบุสถานที่',
                        size: 'sm',
                        color: '#aaaaaa',
                        margin: 'xs',
                        wrap: true
                    },
                    {
                        type: 'separator',
                        margin: 'lg'
                    },
                    {
                        type: 'box',
                        layout: 'vertical',
                        margin: 'lg',
                        spacing: 'sm',
                        contents: [
                            {
                                type: 'box',
                                layout: 'baseline',
                                spacing: 'sm',
                                contents: [
                                    {
                                        type: 'text',
                                        text: 'เวลา',
                                        color: '#aaaaaa',
                                        size: 'sm',
                                        flex: 1
                                    },
                                    {
                                        type: 'text',
                                        text: `${startTime} น.`,
                                        wrap: true,
                                        color: '#666666',
                                        size: 'sm',
                                        flex: 5
                                    }
                                ]
                            },
                            {
                                type: 'box',
                                layout: 'baseline',
                                spacing: 'sm',
                                contents: [
                                    {
                                        type: 'text',
                                        text: 'รายละ',
                                        color: '#aaaaaa',
                                        size: 'sm',
                                        flex: 1
                                    },
                                    {
                                        type: 'text',
                                        text: event.description || '-',
                                        wrap: true,
                                        color: '#666666',
                                        size: 'sm',
                                        flex: 5,
                                        maxLines: 3
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            footer: {
                type: 'box',
                layout: 'vertical',
                spacing: 'sm',
                contents: [
                    {
                        type: 'button',
                        style: 'link',
                        height: 'sm',
                        action: {
                            type: 'uri',
                            label: 'ดูใน Google Calendar',
                            uri: event.link || 'https://calendar.google.com'
                        }
                    }
                ],
                flex: 0
            }
        }
    };

    try {
        await client.pushMessage(TARGET_USER_ID, message);
        console.log(`✅ Sent notification for event: ${event.summary}`);
    } catch (err) {
        console.error('❌ Failed to send LINE message:', err.originalError?.response?.data || err);
    }
};

module.exports = { startScheduler };