document.addEventListener('DOMContentLoaded', () => {
    const activitiesGrid = document.getElementById('activities-grid');
    const loadingMessage = document.querySelector('.loading-message');

    async function fetchAndDisplayActivities() {
        try {
            // เราใช้ URL เต็มเพื่อให้ทำงานได้ถูกต้อง
            const response = await fetch('http://localhost:3001/api/posts');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const posts = await response.json();

            activitiesGrid.innerHTML = '';

            if (posts.length === 0) {
                activitiesGrid.innerHTML = '<p>ยังไม่มีกิจกรรมในขณะนี้</p>';
                return;
            }

            posts.forEach(post => {
                const card = document.createElement('div');
                card.className = 'news-card';

                const postDate = new Date(post.created_at).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                const excerpt = post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content;

                // === 1. สร้างปุ่มอัลบั้ม (ถ้ามีลิงก์) ===
                let albumButton = '';
                if (post.album_url) {
                    albumButton = `<a href="${post.album_url}" class="btn-album" target="_blank">ดูอัลบั้มเต็ม</a>`;
                }

                card.innerHTML = `
                    <img src="${post.image_url}" alt="${post.title}">
                    <div class="card-content">
                        <div>
                           <span class="news-category">${post.category || 'กิจกรรม'}</span>
                           <h3>${post.title}</h3>
                           <p class="news-excerpt">${excerpt}</p>
                        </div>
                        <div class="card-footer">
                            <span class="news-date">${postDate}</span>
                            <div>
                                ${albumButton} <a href="#" class="read-more">อ่านต่อ</a>
                            </div>
                        </div>
                    </div>
                `;
                activitiesGrid.appendChild(card);
            });

        } catch (error) {
            console.error('Failed to fetch activities:', error);
            if (loadingMessage) {
                loadingMessage.textContent = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
                loadingMessage.style.color = 'red';
            }
        }
    }

    fetchAndDisplayActivities();
});