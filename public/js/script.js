/* ========== Map Section Script ========== */
document.addEventListener('DOMContentLoaded', function() {
    const sheetID = "1OxE4XdiUGttHMMEMQF-DOwTb-IcQrGFtPgzys2NliGQ";
    const sheetName = "ชีต1";
    const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;
    let allData = [];

    // Check if map container exists on the page
    if (document.getElementById('map-container')) {
        fetch(url)
            .then(res => res.json())
            .then(data => {
                allData = data;
                showProvinceData();

                const svgDoc = document.querySelector("#map-container svg");

                data.forEach(row => {
                    const zoneId = row.เขต;
                    const zoneEl = svgDoc.getElementById(zoneId);

                    if (zoneEl) {
                        zoneEl.style.cursor = "pointer";
                        zoneEl.addEventListener("mouseenter", () => showZoneData(row));
                        zoneEl.addEventListener("mouseleave", showProvinceData);
                        if (row.ลิงก์) {
                            zoneEl.addEventListener("click", () => {
                                window.open(row.ลิงก์, "_blank");
                            });
                        }
                    } else {
                        console.warn("ไม่พบ element สำหรับ:", zoneId);
                    }
                });
            })
            .catch(err => console.error("Error fetching map data:", err));

        document.getElementById('toggle-info').addEventListener('click', function () {
            document.querySelector('.info-box-wrapper').classList.toggle('hidden');
        });
    }

    function showZoneData(data) {
        document.getElementById("zone-name").textContent = `อ. ${data.เขต}`;
        document.getElementById("pop").textContent = parseInt(data.ประชากร).toLocaleString();
        document.getElementById("members").textContent = parseInt(data.สมาชิกพรรค).toLocaleString();
        document.getElementById("area").textContent = parseFloat(data.พื้นที่).toFixed(2);
    }

    function showProvinceData() {
        if (allData.length > 0) {
            const totalPop = allData.reduce((sum, d) => sum + parseInt(d.ประชากร || 0), 0);
            const totalMem = allData.reduce((sum, d) => sum + parseInt(d.สมาชิกพรรค || 0), 0);
            const totalArea = allData.reduce((sum, d) => sum + parseFloat(d.พื้นที่ || 0), 0);

            document.getElementById("zone-name").textContent = "ข้อมูลรวมทั้งจังหวัด";
            document.getElementById("pop").textContent = totalPop.toLocaleString();
            document.getElementById("members").textContent = totalMem.toLocaleString();
            document.getElementById("area").textContent = totalArea.toFixed(2);
        }
    }
});

/* ========== Map Tooltip Script ========== */
document.addEventListener('DOMContentLoaded', function() {
    const tooltip = document.getElementById("tooltip");
    const mapContainer = document.querySelector(".map-wrapper");

    if (mapContainer) {
        const paths = mapContainer.querySelectorAll(".map-overlay path");

        paths.forEach(path => {
            const group = path.closest('g');
            const districtName = group.getAttribute("data-name") || group.id;

            path.addEventListener("mousemove", (e) => {
                // คำนวณตำแหน่ง Tooltip ให้อยู่ในกรอบ .map-wrapper
                const rect = mapContainer.getBoundingClientRect();
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
                // ในอนาคตสามารถใส่ลิงก์ไปหน้าของอำเภอนั้นๆ ได้
                alert(`คุณคลิกที่: ${districtName}`);
            });
        });
    }
});

/* ========== Hamburger Menu Toggle ========== */
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });

        // Optional: Close menu when a link is clicked
        document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
        }));
    }
});

/* ========== Fetch and Display News Posts ========== */
document.addEventListener('DOMContentLoaded', function() {
    const newsGrid = document.querySelector(".news-grid");

    // ตรวจสอบว่ามี .news-grid ในหน้านี้หรือไม่
    if (newsGrid) {
        fetch('http://localhost:3001/api/posts') // <<< ยิง request ไปที่ Backend ของเรา
            .then(response => response.json())
            .then(posts => {
                newsGrid.innerHTML = ''; // ล้างข้อมูลเก่า (ถ้ามี)

                posts.forEach(post => {
                    const postElement = document.createElement('div');
                    postElement.classList.add('news-card');

                    // Function to format date (optional but recommended)
                    const formattedDate = new Date(post.created_at).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    postElement.innerHTML = `
                        <img src="${post.image_url}" alt="${post.title}">
                        <div class="card-content">
                            <span class="news-category">${post.category}</span>
                            <h3>${post.title}</h3>
                            <p class="news-excerpt">${post.content}</p>
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
});