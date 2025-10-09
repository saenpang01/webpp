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

    // ========== 3. Fetch and Display News Posts ==========
    const newsGrid = document.querySelector(".news-grid");
    if (newsGrid) {
        // *** แก้ไขตรงนี้: เปลี่ยนเป็น Relative Path ***
        fetch('/api/posts') 
            .then(response => response.json())
            .then(posts => {
                newsGrid.innerHTML = ''; 
                posts.forEach(post => {
                    const postElement = document.createElement('div');
                    postElement.classList.add('news-card');
                    postElement.innerHTML = `
                        <img src="${post.image_url}" alt="${post.title}">
                        <div class="card-content">
                            <span class="news-category">${post.category}</span>
                            <h3>${post.title}</h3>
                            <p class="news-excerpt">${post.content.substring(0, 100)}...</p>
                            <a href="#" class="read-more">อ่านต่อ &rarr;</a>
                        </div>
                    `;
                    newsGrid.appendChild(postElement);
                });
            })
            .catch(error => {
                console.error('เกิดข้อผิดพลาดในการดึงข้อมูลข่าวสาร:', error);
                newsGrid.innerHTML = '<p>ไม่สามารถโหลดข้อมูลข่าวสารได้ในขณะนี้</p>';
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
                alert(`คุณคลิกที่: ${districtName}`);
            });
        });
    }
});