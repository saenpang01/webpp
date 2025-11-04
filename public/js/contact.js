document.addEventListener('DOMContentLoaded', () => {
    const reportForm = document.getElementById('report-form');
    const getLocationBtn = document.getElementById('get-location-btn');
    const locationStatus = document.getElementById('location-status');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    const formStatus = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');

    // 1. จัดการการกดปุ่มขอพิกัด
    getLocationBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
            locationStatus.textContent = 'เบราว์เซอร์ของคุณไม่รองรับ Geolocation';
            return;
        }

        getLocationBtn.disabled = true;
        getLocationBtn.textContent = '🛰️ กำลังค้นหาพิกัด...';
        locationStatus.textContent = '';

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                latitudeInput.value = latitude;
                longitudeInput.value = longitude;
                
                getLocationBtn.textContent = '✅ พบพิกัดแล้ว!';
                locationStatus.textContent = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
                locationStatus.style.color = 'green';
            },
            (error) => {
                let errorMessage = 'เกิดข้อผิดพลาด';
                if (error.code === 1) errorMessage = 'คุณปฏิเสธการเข้าถึงตำแหน่ง';
                
                locationStatus.textContent = errorMessage;
                locationStatus.style.color = 'red';
                getLocationBtn.disabled = false;
                getLocationBtn.textContent = '📍 ค้นหาพิกัดปัจจุบัน';
            },
            { enableHighAccuracy: true }
        );
    });

    // 2. จัดการการส่งฟอร์ม
    reportForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!latitudeInput.value || !longitudeInput.value) {
            alert('กรุณากดปุ่ม "ค้นหาพิกัดปัจจุบัน" ก่อนส่งข้อมูล');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'กำลังส่งข้อมูล...';

        const formData = {
            reporter_name: document.getElementById('reporter_name').value, // <-- เพิ่ม
            reporter_phone: document.getElementById('reporter_phone').value, // <-- เพิ่ม
            report_type: document.getElementById('report_type').value,
            details: document.getElementById('details').value,
            latitude: latitudeInput.value,
            longitude: longitudeInput.value,
        };

        try {
            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            formStatus.style.display = 'block';
            if (response.ok) {
                formStatus.textContent = result.message;
                formStatus.className = 'form-status-message status-success';
                reportForm.reset();
                locationStatus.textContent = '';
            } else {
                throw new Error(result.message || 'เกิดข้อผิดพลาด');
            }

        } catch (error) {
            formStatus.textContent = `เกิดข้อผิดพลาด: ${error.message}`;
            formStatus.className = 'form-status-message status-error';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'ส่งเรื่อง';
            getLocationBtn.disabled = false;
            getLocationBtn.textContent = '📍 ค้นหาพิกัดปัจจุบัน';
        }
    });
});