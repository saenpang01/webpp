document.addEventListener('DOMContentLoaded', function() {
    
    // --- PART 1: Google Calendar (ส่วนบน) ---
    const mainCard = document.getElementById('main-event-card');
    const calendarList = document.getElementById('calendar-list');
    
    // ฟังก์ชันช่วยจัดรูปแบบวันที่
    const formatDate = (dateTime) => {
        if (!dateTime) return 'ไม่ระบุเวลา';
        const date = new Date(dateTime);
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok' };
        return date.toLocaleString('th-TH', options).replace(' ', ' ');
    };

    // ฟังก์ชันแยกรูปภาพออกจาก Description (Description Hack)
    const parseEventData = (event) => {
        let imageUrl = ''; 
        let description = event.description || 'ไม่มีรายละเอียดเพิ่มเติม';
        
        // ค้นหาลิงก์รูปภาพ (.jpg, .png) ที่อยู่ในคำอธิบาย
        const imgMatch = description.match(/(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i);
        if (imgMatch) {
            imageUrl = imgMatch[0]; // เก็บ URL รูป
            description = description.replace(imgMatch[0], '').trim(); // ลบ URL ออกจากข้อความที่จะแสดง
        }
        return { imageUrl, description };
    };

    const displayMainEvent = (event) => {
        const startDate = formatDate(event.start);
        const { imageUrl, description } = parseEventData(event);
        const descriptionHtml = description.replace(/\n/g, '<br>'); // เปลี่ยนการขึ้นบรรทัดใหม่เป็น <br>

        mainCard.innerHTML = `
            ${imageUrl ? `<img src="${imageUrl}" style="width:100%; max-height:350px; object-fit:cover; border-radius:8px; margin-bottom:1.5rem; box-shadow:0 4px 10px rgba(0,0,0,0.1);">` : ''}
            <h2 class="event-title">${event.summary}</h2>
            <p class="event-date-time">🗓️ เริ่ม: ${startDate}</p>
            ${event.location ? `<p class="event-location">📍 สถานที่: ${event.location}</p>` : ''}
            
            <div class="event-description">
                <h4 style="margin-top: 1.5rem; border-bottom:1px solid #eee; padding-bottom:0.5rem; margin-bottom:0.5rem;">รายละเอียด</h4>
                <p>${descriptionHtml}</p>
            </div>
            
            ${event.link ? `<a href="${event.link}" target="_blank" class="btn btn-primary btn-full-width" style="margin-top:2rem;">บันทึกลงปฏิทินของคุณ &rarr;</a>` : ''}
        `;
        
        // Update active state in list
        document.querySelectorAll('.list-item').forEach(item => item.classList.remove('active'));
        const activeItem = document.querySelector(`.list-item[data-id="${event.id}"]`);
        if(activeItem) activeItem.classList.add('active');
    };

    const renderCalendarList = (events) => {
        calendarList.innerHTML = '';
        events.forEach(event => {
            const date = new Date(event.start);
            const dateElement = document.createElement('div');
            dateElement.classList.add('list-item');
            dateElement.setAttribute('data-id', event.id);
            dateElement.innerHTML = `
                <div class="list-item-date">
                    <span class="day-of-month">${date.getDate()}</span>
                    <span class="month">${date.toLocaleString('th-TH', { month: 'short' })}</span>
                </div>
                <div class="list-item-content">
                    <p class="list-item-title">${event.summary}</p>
                    <p class="list-item-time">${date.toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
            `;
            dateElement.addEventListener('mouseenter', () => displayMainEvent(event));
            dateElement.addEventListener('click', () => displayMainEvent(event));
            calendarList.appendChild(dateElement);
        });
    };

    const fetchCalendarEvents = async () => {
        if (!mainCard) return;
        try {
            const response = await fetch('/api/calendar/events');
            if (!response.ok) throw new Error('API Error');
            const eventsData = await response.json();
            
            if (eventsData.length === 0) {
                mainCard.innerHTML = '<p class="error-message">ไม่พบกิจกรรมเร็วๆ นี้</p>';
                calendarList.innerHTML = '<p>ไม่มีกิจกรรม</p>';
                return;
            }
            renderCalendarList(eventsData);
            displayMainEvent(eventsData[0]); 
        } catch (error) {
            console.error('Calendar Error:', error);
            mainCard.innerHTML = `<p class="error-message">ไม่สามารถเชื่อมต่อปฏิทินได้</p>`;
        }
    };

    // --- PART 2: Database Posts (ส่วนล่าง - กิจกรรมที่ผ่านมา) ---
    const pastActivitiesGrid = document.getElementById('past-activities-grid');
    
    const fetchPastActivities = async () => {
        if (!pastActivitiesGrid) return;

        try {
            const response = await fetch('/api/posts'); // ดึงจาก DB (LINE Data)
            const posts = await response.json();

            pastActivitiesGrid.innerHTML = '';
            if (posts.length === 0) {
                pastActivitiesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">ยังไม่มีกิจกรรมที่ผ่านมา</p>';
                return;
            }

            posts.forEach(post => {
                const postDate = new Date(post.created_at).toLocaleDateString('th-TH', {
                    day: 'numeric', month: 'short', year: '2-digit'
                });
                const imageUrl = post.image_url || '/images/goals01.jpg';

                const postElement = document.createElement('div');
                postElement.classList.add('news-card'); // ใช้ Style เดียวกับข่าวหน้าแรก
                postElement.innerHTML = `
                    <div style="height: 200px; overflow: hidden;">
                        <img src="${imageUrl}" alt="${post.title}" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <div class="card-content">
                        <span class="news-category">${post.category || 'กิจกรรม'}</span>
                        <h3 style="margin-top:0.5rem; font-size:1.1rem;">${post.title}</h3>
                        <p style="font-size:0.9rem; color:#888; margin-bottom:0.5rem;">${postDate}</p>
                        <p class="news-excerpt">${post.content.substring(0, 100)}...</p>
                        ${post.album_url ? `<a href="${post.album_url}" target="_blank" class="read-more">ดูรูปทั้งหมด &rarr;</a>` : ''}
                    </div>
                `;
                pastActivitiesGrid.appendChild(postElement);
            });

        } catch (error) {
            console.error('Past Activities Error:', error);
            pastActivitiesGrid.innerHTML = '<p>ไม่สามารถโหลดข้อมูลกิจกรรมได้</p>';
        }
    };

    // รันทั้ง 2 ส่วน
    fetchCalendarEvents();
    fetchPastActivities();
});