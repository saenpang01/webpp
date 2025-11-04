document.addEventListener('DOMContentLoaded', () => {
    const reportsList = document.getElementById('reports-list');

    async function fetchReports() {
        try {
            // เราใช้ Relative Path เพราะหน้านี้จะถูกเสิร์ฟจาก /admin ซึ่งมี Auth แล้ว
            const response = await fetch('/api/reports'); 
            
            if (!response.ok) {
                 if(response.status === 401) {
                    throw new Error('ไม่ได้รับอนุญาต (Unauthorized)');
                 }
                throw new Error('ไม่สามารถดึงข้อมูลได้');
            }
            
            const reports = await response.json();
            reportsList.innerHTML = ''; // Clear loading

            if (reports.length === 0) {
                reportsList.innerHTML = '<tr><td colspan="6" style="text-align: center;">ยังไม่มีเรื่องร้องเรียน</td></tr>';
                return;
            }

            reports.forEach(report => {
                const tr = document.createElement('tr');
                
                const formattedDate = new Date(report.created_at).toLocaleString('th-TH');
                const googleMapsLink = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;

                tr.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${report.reporter_name}</td>
                    <td>${report.reporter_phone}</td>
                    <td>${report.report_type}</td>
                    <td class="col-details">${report.details}</td>
                    <td class="col-location">
                        <a href="${googleMapsLink}" target="_blank">ดูแผนที่</a>
                    </td>
                `;
                reportsList.appendChild(tr);
            });

        } catch (error) {
            console.error('เกิดข้อผิดพลาด:', error);
            reportsList.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">${error.message}</td></tr>`;
        }
    }

    fetchReports();
});