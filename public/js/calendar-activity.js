// ไฟล์: public/js/calendar-activity.js (สร้างใหม่)

document.addEventListener('DOMContentLoaded', function() {
    const mainCard = document.getElementById('main-event-card');
    const calendarList = document.getElementById('calendar-list');
    let eventsData = []; // เก็บข้อมูลกิจกรรมทั้งหมด

    // ฟังก์ชันสำหรับดึงข้อมูลจาก Google Calendar API
    const fetchEvents = async () => {
        try {
            const response = await fetch('/api/calendar/events');
            if (!response.ok) {
                throw new Error('ไม่สามารถเชื่อมต่อ Google Calendar API ได้ (ตรวจสอบ Backend Log)');
            }
            eventsData = await response.json();
            
            if (eventsData.length === 0) {
                mainCard.innerHTML = '<p class="error-message">ไม่พบกิจกรรมที่กำลังจะมาถึง</p>';
                calendarList.innerHTML = '<p>ไม่มีกิจกรรมในปฏิทิน</p>';
                return;
            }

            renderCalendarList(eventsData);
            displayMainEvent(eventsData[0]); // แสดงกิจกรรมแรกเป็นค่าเริ่มต้น

        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการดึงกิจกรรม:', error);
            mainCard.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
            calendarList.innerHTML = `<p>ไม่สามารถโหลดปฏิทินได้</p>`;
        }
    };

    // ฟังก์ชันช่วยในการจัด Format วันที่
    const formatDate = (dateTime) => {
        if (!dateTime) return 'ไม่ระบุเวลา';
        const date = new Date(dateTime);
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok' };
        // แปลงให้เป็นรูปแบบที่อ่านง่าย เช่น "4 ธันวาคม 2025, 14:00"
        return date.toLocaleString('th-TH', options).replace(' ', ' ');
    };

    // ฟังก์ชันสำหรับแสดง Event Card หลักด้านซ้าย
    const displayMainEvent = (event) => {
        const startDate = formatDate(event.start);
        const descriptionHtml = event.description ? event.description.replace(/\n/g, '<br>') : 'ไม่มีคำอธิบายเพิ่มเติม'; // จัดการบรรทัดใหม่
        
        mainCard.innerHTML = `
            <h2 class="event-title">${event.summary}</h2>
            <p class="event-date-time">🗓️ เริ่ม: ${startDate}</p>
            ${event.location ? `<p class="event-location">📍 สถานที่: ${event.location}</p>` : ''}
            
            <div class="event-description">
                <h4 style="margin-top: 1.5rem;">รายละเอียด</h4>
                <p>${descriptionHtml}</p>
            </div>
            
            ${event.link ? `<a href="${event.link}" target="_blank" class="btn btn-primary btn-full-width">ดูใน Google Calendar &rarr;</a>` : ''}
        `;
        
        // จัดการ Active State
        document.querySelectorAll('.list-item').forEach(item => item.classList.remove('active'));
        const activeItem = document.querySelector(`.list-item[data-id="${event.id}"]`);
        if(activeItem) activeItem.classList.add('active');
    };

    // ฟังก์ชันสำหรับแสดงรายการกิจกรรมด้านขวา
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
                    <p class="list-item-time">${date.toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
                </div>
            `;
            
            // เพิ่ม Interactivity: Hover & Click
            dateElement.addEventListener('mouseenter', () => displayMainEvent(event));
            dateElement.addEventListener('click', () => displayMainEvent(event));
            
            calendarList.appendChild(dateElement);
        });
    };
    
    fetchEvents();
});