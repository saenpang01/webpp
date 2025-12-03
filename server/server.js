// 1. Import Packages
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const basicAuth = require('express-basic-auth');
const multer = require('multer');
const path = require('path');

// Import routes
const postRoutes = require('./routes/posts');
const webhookRoutes = require('./routes/webhook');
const reportRoutes = require('./routes/reports');

// 2. Initialize Express App
const app = express();
const PORT = process.env.PORT || 3001;

// 3. Middlewares
app.use(cors());

// --- 4. กำหนดเส้นทาง (Routes) ---

// *** สำคัญ: ทำให้โฟลเดอร์ public เป็นโฟลเดอร์หลักสำหรับไฟล์ Frontend ***
// *** วางไว้บนสุด ก่อนเส้นทางอื่นๆ ทั้งหมด ***
app.use(express.static(path.join(__dirname, '../public')));

// *** เรียกใช้ Webhook ก่อน express.json() ***
app.use('/api/line-webhook', webhookRoutes); 

// Middleware สำหรับอ่าน JSON body (จะถูกใช้กับ Route ที่อยู่หลังจากนี้)
app.use(express.json()); 

// ตั้งค่า Multer (สำหรับอัปโหลดไฟล์)
// *** FIX: เปลี่ยนเป็น Memory Storage เพื่อไม่ให้เขียนลง Render Disk ***
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

// ตั้งค่า Basic Auth (สำหรับหน้า Admin)
const users = { [process.env.ADMIN_USER]: process.env.ADMIN_PASSWORD };
const authMiddleware = basicAuth({ users, challenge: true });

// ทำให้โฟลเดอร์ uploads และ /admin เข้าถึงได้
// *** FIX: COMMENT OUT ส่วน uploads เพราะไม่มี Disk Storage แล้วบน Render ***
// app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); 
app.use('/admin', authMiddleware, express.static(path.join(__dirname, '../public'))); // ให้ยังคงเข้า admin.html ได้

// API Routes อื่นๆ
app.post('/api/upload', authMiddleware, upload.single('imageFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'ไม่มีไฟล์ถูกอัปโหลด' });
    }
    // ส่ง URL ชั่วคราวกลับไปแทน เพราะไม่ได้บันทึกไฟล์จริง
    // Note: ระบบจะไม่แสดงรูปภาพที่อัปโหลดผ่าน Admin แล้วจนกว่าจะติดตั้ง Cloudinary/S3
    res.json({ filePath: `/uploads/${req.file.originalname}` });
});
app.use('/api/posts', postRoutes);
app.use('/api/reports', reportRoutes);

// Basic Route (ถูก override ด้วย express.static บรรทัดบนแล้ว)
app.get('/', (req, res) => {
    res.send('<h1>Backend ของพรรคประชาชนอุตรดิตถ์!</h1>');
});

// 5. Start the Server
app.listen(PORT, () => {
    console.log(`เซิร์ฟเวอร์กำลังทำงานที่ http://localhost:${PORT}`);
});