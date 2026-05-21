document.addEventListener('DOMContentLoaded', () => {
    // Constants
    const API_URL = 'https://salesandrevenue.onrender.com/api';
    let salesData = [];
    let charts = {};

    // Particles.js Initialization
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '#00d2ff' },
            shape: { type: 'circle' },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: '#00d2ff', opacity: 0.2, width: 1 },
            move: { enable: true, speed: 2, direction: 'none', random: true, straight: false, out_mode: 'out', bounce: false }
        },
        interactivity: {
            detect_on: 'canvas',
            events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
            modes: { grab: { distance: 140, line_linked: { opacity: 1 } }, push: { particles_nb: 4 } }
        },
        retina_detect: true
    });

    // Clock Logic
    setInterval(() => {
        const now = new Date();
        document.getElementById('clock').innerText = now.toLocaleTimeString();
    }, 1000);

    // Sidebar Toggle
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        const icon = sidebarToggle.querySelector('i');
        icon.classList.toggle('fa-chevron-left');
        icon.classList.toggle('fa-chevron-right');
    });

    // Navigation logic
    document.querySelectorAll('.sidebar-nav li').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-nav li').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            // Section switching could be implemented here
            showToast(`Navigating to ${item.dataset.section}...`);
        });
    });

    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
        showToast('Theme switched!');
    });

    // Initial Data Fetch
    fetchDashboardData();

    async function fetchDashboardData() {
        try {
            const [salesRes, summaryRes, chartsRes, insightsRes] = await Promise.all([
                fetch(`${API_URL}/sales`),
                fetch(`${API_URL}/dashboard-summary`),
                fetch(`${API_URL}/charts-data`),
                fetch(`${API_URL}/ai-insights`)
            ]);

            salesData = await salesRes.json();
            const summary = await summaryRes.json();
            const chartData = await chartsRes.json();
            const insights = await insightsRes.json();

            updateKPIs(summary);
            renderTable(salesData);
            initCharts(chartData);
            renderInsights(insights);
            populateFilters(salesData);
        } catch (error) {
            console.error('Error fetching data:', error);
            showToast('Failed to connect to backend. Make sure FastAPI is running!', 'error');
        }
    }

    function updateKPIs(summary) {
        gsap.to('#kpi-revenue', { innerText: summary.total_revenue, duration: 2, snap: { innerText: 1 }, onUpdate: function() {
            document.getElementById('kpi-revenue').innerText = `$${Math.floor(this.targets()[0].innerText).toLocaleString()}`;
        }});
        gsap.to('#kpi-sales', { innerText: summary.total_sales, duration: 2, snap: { innerText: 1 } });
        gsap.to('#kpi-orders', { innerText: summary.total_orders, duration: 2, snap: { innerText: 1 } });
        gsap.to('#kpi-profit', { innerText: summary.total_profit, duration: 2, snap: { innerText: 1 }, onUpdate: function() {
            document.getElementById('kpi-profit').innerText = `$${Math.floor(this.targets()[0].innerText).toLocaleString()}`;
        }});
        document.getElementById('kpi-top-product').innerText = summary.top_product;
        document.getElementById('kpi-growth').innerText = `${summary.monthly_growth}%`;
    }

    function renderTable(data) {
        const tbody = document.querySelector('#sales-table tbody');
        tbody.innerHTML = '';
        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.product}</td>
                <td><span class="badge-cat">${item.category}</span></td>
                <td>$${item.revenue.toLocaleString()}</td>
                <td>$${item.profit.toLocaleString()}</td>
                <td>${item.quantity}</td>
                <td>${item.region}</td>
                <td>${item.date}</td>
                <td>
                    <button class="btn-icon edit" onclick="editRow(${item.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon delete" onclick="deleteRow(${item.id})"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function initCharts(data) {
        const ctx1 = document.getElementById('revenueTrendChart').getContext('2d');
        const ctx2 = document.getElementById('categoryChart').getContext('2d');
        
        // Destroy existing charts if they exist
        if(charts.revenue) charts.revenue.destroy();
        if(charts.category) charts.category.destroy();

        charts.revenue = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: data.trend.labels,
                datasets: [{
                    label: 'Revenue',
                    data: data.trend.data,
                    borderColor: '#00d2ff',
                    backgroundColor: 'rgba(0, 210, 255, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });

        charts.category = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: data.category.labels,
                datasets: [{
                    data: data.category.data,
                    backgroundColor: ['#00d2ff', '#9d50bb', '#00ff88', '#ff4d4d', '#ffcc00']
                }]
            },
            options: { responsive: true }
        });

        // Add more charts as needed (Monthly Sales, Profit Area)
    }

    function renderInsights(insights) {
        const container = document.getElementById('insights-container');
        container.innerHTML = '';
        insights.forEach((insight, index) => {
            setTimeout(() => {
                const div = document.createElement('div');
                div.className = 'insight-item animate-in';
                div.innerHTML = `<i class="fas fa-check-circle neon-text"></i> ${insight}`;
                container.appendChild(div);
            }, index * 500);
        });
    }

    // Modal Logic
    const uploadModal = document.getElementById('upload-modal');
    const spreadsheetModal = document.getElementById('spreadsheet-modal');
    
    document.getElementById('btn-upload').addEventListener('click', () => uploadModal.style.display = 'flex');
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            uploadModal.style.display = 'none';
            spreadsheetModal.style.display = 'none';
        });
    });

    // File Upload handling
    const fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if(!file) return;

        const formData = new FormData();
        formData.append('file', file);

        showToast('Uploading file...');
        try {
            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            const result = await res.json();
            showToast(result.message);
            uploadModal.style.display = 'none';
            fetchDashboardData();
        } catch (error) {
            showToast('Upload failed', 'error');
        }
    });

    // Manual Data Entry (Handsontable)
    let hot;
    document.getElementById('add-manual-data').addEventListener('click', () => {
        spreadsheetModal.style.display = 'flex';
        const container = document.getElementById('spreadsheet-container');
        if(!hot) {
            hot = new Handsontable(container, {
                data: [
                    ['Product A', 'Electronics', 1000, 200, 1, 'North', '2024-05-21'],
                    ['', '', '', '', '', '', '']
                ],
                colHeaders: ['Product', 'Category', 'Revenue', 'Profit', 'Quantity', 'Region', 'Date'],
                rowHeaders: true,
                height: 'auto',
                licenseKey: 'non-commercial-and-evaluation',
                stretchH: 'all'
            });
        }
    });

    document.getElementById('save-spreadsheet').addEventListener('click', async () => {
        const data = hot.getData();
        // Post each row to backend
        for(let row of data) {
            if(!row[0]) continue;
            await fetch(`${API_URL}/sales`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product: row[0], category: row[1], revenue: parseFloat(row[2]),
                    profit: parseFloat(row[3]), quantity: parseInt(row[4]),
                    region: row[5], date: row[6]
                })
            });
        }
        showToast('Manual data saved!');
        spreadsheetModal.style.display = 'none';
        fetchDashboardData();
    });

    // Chat Widget Logic
    const chatToggle = document.getElementById('chat-toggle');
    const aiChat = document.getElementById('ai-chat');
    chatToggle.addEventListener('click', () => aiChat.classList.toggle('active'));
    document.querySelector('.chat-close').addEventListener('click', () => aiChat.classList.remove('active'));

    const sendChat = document.getElementById('send-chat');
    const chatInput = aiChat.querySelector('input');
    const chatMessages = document.getElementById('chat-messages');

    sendChat.addEventListener('click', () => {
        const msg = chatInput.value.trim();
        if(!msg) return;
        
        appendMessage('user', msg);
        chatInput.value = '';

        // Simple Bot Logic
        setTimeout(() => {
            let response = "I'm analyzing your data...";
            if(msg.toLowerCase().includes('top product')) {
                const top = document.getElementById('kpi-top-product').innerText;
                response = `The top-selling product is currently ${top}.`;
            } else if(msg.toLowerCase().includes('revenue')) {
                const rev = document.getElementById('kpi-revenue').innerText;
                response = `Your total revenue is ${rev}.`;
            }
            appendMessage('ai', response);
        }, 1000);
    });

    function appendMessage(type, text) {
        const div = document.createElement('div');
        div.className = `message ${type}`;
        div.innerText = text;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Export Logic
    document.getElementById('export-csv').addEventListener('click', () => {
        const csv = Papa.unparse(salesData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'insightx_sales_data.csv');
        link.click();
    });

    document.getElementById('btn-generate-report').addEventListener('click', () => {
        const element = document.querySelector('main');
        html2pdf().from(element).save('InsightX_Dashboard_Report.pdf');
    });

    // Helper: Toast
    function showToast(msg, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = msg;
        document.getElementById('toast-container').appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    function populateFilters(data) {
        const cats = [...new Set(data.map(d => d.category))];
        const regions = [...new Set(data.map(d => d.region))];
        
        const catFilter = document.getElementById('filter-category');
        const regionFilter = document.getElementById('filter-region');
        
        cats.forEach(c => {
            const opt = document.createElement('option');
            opt.value = opt.innerText = c;
            catFilter.appendChild(opt);
        });
        
        regions.forEach(r => {
            const opt = document.createElement('option');
            opt.value = opt.innerText = r;
            regionFilter.appendChild(opt);
        });
    }
});

// Global functions for table actions
function editRow(id) {
    alert('Edit functionality for ID: ' + id);
}

async function deleteRow(id) {
    if(confirm('Are you sure you want to delete this record?')) {
        // Backend delete endpoint would go here
        alert('Delete requested for ID: ' + id);
    }
}
