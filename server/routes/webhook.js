const express = require('express');
const line = require('@line/bot-sdk');
const db = require('../db');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);

// State Management: ใช้สำหรับจดจำว่า User แต่ละคนคุยถึงขั้นตอนไหนแล้ว
const conversationState = new Map();

// ฟังก์ชันสำหรับดาวน์โหลดและบันทึกรูปภาพ
const saveImageFromLine = async (messageId) => {
    try {
        const stream = await client.getMessageContent(messageId);
        const filename = `${Date.now()}.jpg`;
        // แก้ไข Path ให้ถูกต้อง อ้างอิงจากโฟลเดอร์ server/ ไปยัง ../uploads/
        const uploadsDir = path.join(__dirname, '../../uploads'); 
        const filePath = path.join(uploadsDir, filename);

        // สร้างโฟลเดอร์ uploads หากยังไม่มี
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const writable = fs.createWriteStream(filePath);
        stream.pipe(writable);

        return new Promise((resolve, reject) => {
            stream.on('end', () => resolve(`/uploads/${filename}`));
            stream.on('error', reject);
        });
    } catch (error) {
        console.error('ไม่สามารถบันทึกรูปภาพได้:', error);
        throw error;
    }
};


// ฟังก์ชันหลักสำหรับจัดการ Event
async function handleEvent(event) {
    if (!event.source || !event.source.userId) {
        return Promise.resolve(null);
    }

    const userId = event.source.userId;
    const userState = conversationState.get(userId) || { state: 'idle', data: {} };

    // --- เริ่มต้นการสนทนา ---
    if (event.type === 'message' && event.message.type === 'text' && event.message.text === '/addnews') {
        userState.state = 'awaiting_title';
        conversationState.set(userId, userState);
        return client.replyMessage(event.replyToken, { type: 'text', text: 'กรุณาพิมพ์ "หัวข้อข่าว" ที่ต้องการ:' });
    }

    // --- จัดการสถานะต่างๆ ---
    switch (userState.state) {
        case 'awaiting_title':
            if (event.message.type === 'text') {
                userState.data.title = event.message.text;
                userState.state = 'awaiting_content';
                return client.replyMessage(event.replyToken, { type: 'text', text: 'ยอดเยี่ยม! ต่อไปกรุณาพิมพ์ "เนื้อหาข่าว":' });
            }
            break;

        case 'awaiting_content':
            if (event.message.type === 'text') {
                userState.data.content = event.message.text;
                userState.state = 'awaiting_image';
                return client.replyMessage(event.replyToken, { type: 'text', text: 'เยี่ยมเลย! ต่อไปกรุณา "อัปโหลดรูปภาพหน้าปก" (1 รูป):' });
            }
            break;

        case 'awaiting_image':
            if (event.message.type === 'image') {
                const imageUrl = await saveImageFromLine(event.message.id);
                userState.data.image_url = imageUrl;
                userState.state = 'awaiting_category';
                return client.replyMessage(event.replyToken, { type: 'text', text: 'รูปสวยมาก! "หมวดหมู่" ของข่าวคืออะไรครับ? เช่น ลงพื้นที่,ประชุม,กิจกรรม ' });
            } else {
                 return client.replyMessage(event.replyToken, { type: 'text', text: 'กรุณาอัปโหลดเป็นรูปภาพเท่านั้นครับ' });
            }
            break;

        case 'awaiting_category':
            if (event.message.type === 'text') {
                userState.data.category = event.message.text;
                userState.state = 'awaiting_album_link'; // <<< 1. เปลี่ยน state ถัดไป
                return client.replyMessage(event.replyToken, { type: 'text', text: 'สุดท้ายนี้ กรุณาส่ง "ลิงก์อัลบั้มเต็ม" (Google Drive/Photos) ครับ\n(หากไม่มี ให้พิมพ์ "ข้าม")' });
            }
            break;

        // <<< 2. เพิ่ม State ใหม่สำหรับรับลิงก์
        case 'awaiting_album_link':
            if (event.message.type === 'text') {
                if (event.message.text.toLowerCase() === 'ข้าม' || event.message.text.toLowerCase() === 'skip') {
                    userState.data.album_url = null;
                } else {
                    userState.data.album_url = event.message.text;
                }
                userState.state = 'awaiting_confirmation';
                
                // สร้างข้อความสรุป
                const summary = `กรุณาตรวจสอบข้อมูล:
- หัวข้อ: ${userState.data.title}
- เนื้อหา: ${userState.data.content.substring(0, 50)}...
- รูปภาพ: (อัปโหลดแล้ว)
- หมวดหมู่: ${userState.data.category}
- ลิงก์อัลบั้ม: ${userState.data.album_url || 'ไม่มี'}`; // <<< 3. เพิ่มลิงก์ในสรุป

                return client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: summary,
                    quickReply: {
                        items: [
                            { type: 'action', action: { type: 'message', label: '✅ ส่ง', text: 'ส่ง' } },
                            { type: 'action', action: { type: 'message', label: '❌ ไม่ส่ง', text: 'ไม่ส่ง' } },
                        ],
                    },
                });
            }
            break;

        case 'awaiting_confirmation':
            if (event.message.type === 'text') {
                if (event.message.text === 'ส่ง') {
                    // <<< 4. เพิ่ม album_url ลงใน query
                    const { title, content, image_url, category, album_url } = userState.data;
                    
                    // เพิ่มการตรวจสอบค่า album_url ก่อนส่ง
                    const final_album_url = (album_url && (album_url.startsWith('http') || album_url.startsWith('https'))) ? album_url : null;
                    
                    await db.query(
                        'INSERT INTO posts (title, content, image_url, category, album_url) VALUES (?, ?, ?, ?, ?)',
                        [title, content, image_url, category, final_album_url]
                    );
                    conversationState.delete(userId); // ล้างสถานะ
                    return client.replyMessage(event.replyToken, { type: 'text', text: 'บันทึกข่าวสารลงในระบบเรียบร้อยแล้ว! ตรวจสอบที่เว็บไซต์ได้เลยครับ' });
                } else if (event.message.text === 'ไม่ส่ง') {
                    conversationState.delete(userId); // ล้างสถานะ
                    return client.replyMessage(event.replyToken, { type: 'text', text: 'ยกเลิกการบันทึกข้อมูลแล้วครับ' });
                }
            }
            break;
    }

    return Promise.resolve(null);
}

// Webhook Endpoint (เหมือนเดิม)
router.post('/', line.middleware(config), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

module.exports = router;