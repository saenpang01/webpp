document.addEventListener('DOMContentLoaded', function() {

    // ========== 1. Navbar Scroll Effect ==========
    const nav = document.querySelector('.navbar');
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }

    // ========== 2. Hamburger Menu Toggle ==========
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });

        document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
        }));
    }

    // ========== 3. Fetch News for Home Page (From Database) ==========
    const newsGrid = document.querySelector(".news-grid");
    // ทำงานเฉพาะเมื่อเจอ .news-grid (หน้าแรก) และไม่มี id="past-activities-grid" (หน้ากิจกรรม)
    if (newsGrid && !document.getElementById('past-activities-grid')) {
        fetch('/api/posts') // เรียก API ดึงข้อมูลจากฐานข้อมูล
            .then(response => response.json())
            .then(posts => {
                newsGrid.innerHTML = ''; 
                
                // ตัดมาแค่ 3 ข่าวล่าสุด
                const recentPosts = posts.slice(0, 3);

                if (recentPosts.length === 0) {
                    newsGrid.innerHTML = '<p style="width:100%; text-align:center;">ยังไม่มีข่าวสารประชาสัมพันธ์</p>';
                    return;
                }

                recentPosts.forEach(post => {
                    // จัดรูปแบบวันที่
                    const postDate = new Date(post.created_at).toLocaleDateString('th-TH', {
                        day: 'numeric', month: 'short', year: '2-digit'
                    });
                    
                    // ใช้รูปจาก LINE หรือรูป Default
                    const imageUrl = post.image_url || '/images/goals01.jpg';

                    const postElement = document.createElement('div');
                    postElement.classList.add('news-card');
                    postElement.innerHTML = `
                        <div style="height: 200px; overflow: hidden;">
                            <img src="${imageUrl}" alt="${post.title}" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                        <div class="card-content">
                            <span class="news-category">${post.category || 'กิจกรรม'}</span>
                            <h3 style="margin-top:0.5rem; font-size:1.1rem;">${post.title}</h3>
                            <p style="font-size:0.9rem; color:#888; margin-bottom:0.5rem;">📅 ${postDate}</p>
                            <p class="news-excerpt">${post.content.substring(0, 80)}${post.content.length > 80 ? '...' : ''}</p>
                            ${post.album_url ? `<a href="${post.album_url}" target="_blank" class="read-more">ดูอัลบั้มเต็ม &rarr;</a>` : ''}
                        </div>
                    `;
                    newsGrid.appendChild(postElement);
                });
            })
            .catch(error => {
                console.error('Error fetching posts:', error);
                newsGrid.innerHTML = '<p>ไม่สามารถโหลดข้อมูลข่าวสารได้</p>';
            });
    }

    // ========== 4. Map Tooltip Script ==========
    const tooltip = document.getElementById("tooltip");
    const mapWrapper = document.querySelector(".map-wrapper");

    if (mapWrapper) {
        const paths = mapWrapper.querySelectorAll(".map-overlay path");

        paths.forEach(path => {
            const group = path.closest('g');
            const districtName = group.getAttribute("data-name") || group.id;

            path.addEventListener("mousemove", (e) => {
                const rect = mapWrapper.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                tooltip.style.left = `${x}px`;
                tooltip.style.top = `${y}px`;
                tooltip.textContent = districtName;
                tooltip.style.display = 'block';
            });

            path.addEventListener("mouseleave", () => {
                tooltip.style.display = 'none';
            });

            path.addEventListener("click", () => {
                // ลิงก์ไปยังหน้าอำเภอ (ถ้ามี)
                // location.href = `/${districtName}.html`; 
                alert(`คุณคลิกที่: ${districtName}`);
            });
        });
    }
});