// public/js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    loadActivities();
});

// ฟังก์ชันจำลองการโหลดข้อมูล (เดี๋ยวเราเปลี่ยนเป็น fetch('/api/posts') ทีหลัง)
function loadActivities() {
    const container = document.getElementById('admin-posts-container');
    
    // ข้อมูลตัวอย่าง (Mock Data)
    const mockData = [
        {
            title: "ลงพื้นที่ตลาดท่าอิฐ รับฟังปัญหาพ่อค้าแม่ค้า",
            date: "24 ธ.ค. 2025",
            image: "/images/hero01.jpeg"
        },
        {
            title: "ประชุมทีมงานสาขาอุตรดิตถ์ วางแผนปี 2569",
            date: "22 ธ.ค. 2025",
            image: "/images/goals01.jpg"
        },
        {
            title: "กิจกรรมแจกถุงยังชีพช่วยเหลือผู้ประสบภัย",
            date: "20 ธ.ค. 2025",
            image: "/images/bangconkeHero.jpg"
        }
    ];

    let html = '';
    
    mockData.forEach((item, index) => {
        html += `
            <div class="card">
                <img src="${item.image}" alt="Activity Image">
                <div class="card-body">
                    <div class="card-title">${item.title}</div>
                    <div class="card-date">
                        <i class="far fa-clock"></i> ${item.date}
                    </div>
                    <div class="card-actions">
                        <button class="btn-icon" title="แก้ไข">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteItem(${index})" title="ลบ">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    // ใส่ HTML เข้าไปในหน้าเว็บ
    container.innerHTML = html;
}

// ฟังก์ชันลบข้อมูล (จำลอง)
function deleteItem(index) {
    if(confirm('คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?')) {
        alert('ลบข้อมูลเรียบร้อย (จำลอง)');
        // ของจริงจะต้องเรียก fetch DELETE API
    }
}