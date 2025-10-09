document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/api/posts';
    const UPLOAD_URL = '/api/upload';

    const form = document.getElementById('post-form');
    const postsList = document.getElementById('posts-list');
    const formTitle = document.getElementById('form-title');
    const postIdInput = document.getElementById('post-id');
    const imageFileInput = document.getElementById('imageFile');
    const imageUrlInput = document.getElementById('image_url');
    const cancelEditBtn = document.getElementById('cancel-edit');

    // ฟังก์ชันสำหรับรีเซ็ตฟอร์ม
    const resetFormState = () => {
        form.reset(); // ล้างข้อมูลในฟอร์มทั้งหมด
        postIdInput.value = '';
        imageUrlInput.value = '';
        formTitle.textContent = 'เพิ่มข่าวใหม่';
        cancelEditBtn.style.display = 'none';
    };

    // ฟังก์ชันสำหรับดึงและแสดงข่าวทั้งหมด
    const fetchPosts = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('ไม่สามารถดึงข้อมูลได้');
            }
            const posts = await response.json();
            postsList.innerHTML = '';
            posts.forEach(post => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span><b>${post.id}:</b> ${post.title}</span>
                    <div>
                        <button class="edit-btn" data-id="${post.id}">แก้ไข</button>
                        <button class="delete-btn" data-id="${post.id}">ลบ</button>
                    </div>
                `;
                postsList.appendChild(li);
            });
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการโหลดข่าว:', error);
            postsList.innerHTML = '<li>ไม่สามารถโหลดรายการข่าวได้</li>';
        }
    };

    // จัดการการ submit ฟอร์ม (สร้าง/แก้ไข)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        let imageUrl = imageUrlInput.value; // ใช้ URL เดิมก่อน (กรณีแก้ไขแต่ไม่เปลี่ยนรูป)

        // 1. ตรวจสอบว่ามีการเลือกไฟล์ใหม่หรือไม่
        if (imageFileInput.files.length > 0) {
            const file = imageFileInput.files[0];
            const formData = new FormData();
            formData.append('imageFile', file);

            try {
                // 2. อัปโหลดไฟล์ภาพไปที่ Backend ก่อน
                const uploadResponse = await fetch(UPLOAD_URL, {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    throw new Error('การอัปโหลดไฟล์ล้มเหลว');
                }
                const uploadResult = await uploadResponse.json();
                imageUrl = uploadResult.filePath; // 3. ได้ Path ของรูปภาพใหม่
            } catch (error) {
                console.error(error);
                alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
                return;
            }
        } else if (!postIdInput.value) {
            // กรณีสร้างโพสต์ใหม่แต่ไม่ได้เลือกรูป
            alert('กรุณาเลือกรูปภาพประกอบ');
            return;
        }

        // 4. รวบรวมข้อมูลทั้งหมด
        const id = postIdInput.value;
        const postData = {
            title: document.getElementById('title').value,
            content: document.getElementById('content').value,
            image_url: imageUrl,
            category: document.getElementById('category').value,
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL;

        // 5. ส่งข้อมูลข่าวไปบันทึก
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });
            if (!response.ok) {
                throw new Error('การบันทึกข้อมูลล้มเหลว');
            }
            // 6. Reset ฟอร์มและโหลดข้อมูลใหม่
            resetFormState();
            fetchPosts();
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการบันทึก:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    });

    // จัดการการคลิกปุ่ม แก้ไข/ลบ
    postsList.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('คุณต้องการลบข่าวนี้ใช่หรือไม่?')) {
                await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                fetchPosts();
            }
        }

        if (e.target.classList.contains('edit-btn')) {
            const response = await fetch(`${API_URL}/${id}`);
            const post = await response.json();
            
            formTitle.textContent = `แก้ไขข่าว ID: ${post.id}`;
            postIdInput.value = post.id;
            document.getElementById('title').value = post.title;
            document.getElementById('content').value = post.content;
            imageUrlInput.value = post.image_url; 
            document.getElementById('category').value = post.category;
            
            cancelEditBtn.style.display = 'block';
            window.scrollTo(0, 0);
        }
    });

    // ยกเลิกการแก้ไข
    cancelEditBtn.addEventListener('click', () => {
        resetFormState();
    });
    
    // เริ่มต้นโดยการดึงข่าวทั้งหมด
    fetchPosts();
});