const express = require('express');
const router = express.Router();
const db = require('../db'); // Import connection pool จาก db.js

// Route: GET /api/posts
// ดึงข้อมูลข่าวสารทั้งหมด เรียงจากใหม่ไปเก่า
router.get('/', async (req, res) => {
    try {
        const [posts] = await db.query('SELECT * FROM posts ORDER BY created_at DESC');
        res.json(posts); // ส่งข้อมูลกลับไปเป็น JSON
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
    }
});

// GET /api/posts/:id - ดึงข้อมูลข่าวชิ้นเดียว
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [post] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
        if (post.length > 0) {
            res.json(post[0]);
        } else {
            res.status(404).json({ message: "ไม่พบข่าวนี้" });
        }
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
    }
});

// POST /api/posts - สร้างข่าวใหม่
router.post('/', async (req, res) => {
    try {
        const { title, content, image_url, category } = req.body;
        const [result] = await db.query(
            'INSERT INTO posts (title, content, image_url, category) VALUES (?, ?, ?, ?)',
            [title, content, image_url, category]
        );
        res.status(201).json({ id: result.insertId, message: 'สร้างข่าวสำเร็จ' });
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการสร้างข้อมูล:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
    }
});

// PUT /api/posts/:id - แก้ไขข่าว
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, image_url, category } = req.body;
        await db.query(
            'UPDATE posts SET title = ?, content = ?, image_url = ?, category = ? WHERE id = ?',
            [title, content, image_url, category, id]
        );
        res.json({ message: 'แก้ไขข่าวสำเร็จ' });
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
    }
});

// DELETE /api/posts/:id - ลบข่าว
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM posts WHERE id = ?', [id]);
        res.json({ message: 'ลบข่าวสำเร็จ' });
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการลบข้อมูล:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
    }
});

module.exports = router;