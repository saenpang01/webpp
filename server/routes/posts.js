// server/routes/posts.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET posts (Public Read-only) - ดึงข่าวทั้งหมดไปแสดงหน้าบ้าน
router.get('/', async (req, res) => {
    try {
        // ดึงข้อมูล post ทั้งหมด เรียงจากใหม่ไปเก่า
        const [posts] = await db.query('SELECT id, title, content, image_url, category, created_at, album_url FROM posts ORDER BY created_at DESC');
        res.json(posts);
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ message: 'Database error' });
    }
});

// GET post by ID (Public Read-only) - ดึงข่าวเดี่ยว (เผื่ออนาคตทำหน้าอ่านต่อ)
router.get('/:id', async (req, res) => {
    try {
        const [post] = await db.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
        if (post.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post[0]);
    } catch (err) {
        console.error('Error fetching post by ID:', err);
        res.status(500).json({ message: 'Database error' });
    }
});

module.exports = router;