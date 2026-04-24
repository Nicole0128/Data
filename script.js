let rawData = [];
let myChart = null; // 用於儲存圖表實例

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    
    Papa.parse("A05_basic_all.csv", {
        download: true,
        header: true,
        complete: function(results) {
            rawData = results.data;
            applyFilters(); // 初始化顯示
        }
    });
});

function applyFilters() {
    const q = document.getElementById('search-q').value.toLowerCase();
    const party = document.getElementById('filter-party').value;
    const gender = document.getElementById('filter-gender').value;
    const elected = document.getElementById('filter-elected').value;

    let filtered = rawData.filter(row => {
        const matchName = row.姓名 ? row.姓名.includes(q) : true;
        const matchParty = party ? row.推薦政黨 === party : true;
        const matchGender = gender ? row.性別 === gender : true;
        const matchElected = elected ? row.當選註記 === (elected === "是" ? "*" : "") : true;
        return matchName && matchParty && matchGender && matchElected;
    });

    renderTable(filtered);
    updateChart(filtered);
    renderSummary(filtered);
}

// 渲染圖表：顯示該群組的平均收入來源佔比
function updateChart(data) {
    const ctx = document.getElementById('incomeChart').getContext('2d');
    if (myChart) myChart.destroy();

    const avg = {
        personal: 0, corporate: 0, party: 0, group: 0, anonymous: 0
    };

    data.forEach(d => {
        avg.personal += parseNumber(d.個人捐贈收入);
        avg.corporate += parseNumber(d.營利事業捐贈收入);
        avg.party += parseNumber(d.政黨捐贈收入);
        avg.group += parseNumber(d.人民團體捐贈收入);
        avg.anonymous += parseNumber(d.匿名捐贈收入);
    });

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['個人', '企業', '政黨', '人民團體', '匿名'],
            datasets: [{
                data: [avg.personal, avg.corporate, avg.party, avg.group, avg.anonymous],
                backgroundColor: ['#000', '#C5B358', '#E5E5E5', '#888', '#D4AF37'],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '80%',
            plugins: { legend: { position: 'bottom', labels: { font: { family: 'Montserrat' } } } }
        }
    });
}

function parseNumber(val) {
    if (!val) return 0;
    return parseFloat(val.toString().replace(/[%,]/g, '')) || 0;
}

function renderTable(items) {
    const tbody = document.getElementById('data-table-body');
    tbody.innerHTML = items.slice(0, 50).map(item => `
        <tr class="fade-in">
            <td class="serif-font"><strong>${item.姓名}</strong></td>
            <td><span class="tag">${item.推薦政黨}</span></td>
            <td>${item.性別} | ${item.出生年次}</td>
            <td style="text-align:right;">NT$ ${parseInt(item.總收入).toLocaleString()}</td>
            <td style="text-align:right;">${item.當選註記 === '*' ? '✓ 當選' : '-'}</td>
            <td><button class="btn-sm" onclick="addToCompare('${item.姓名}')">對比</button></td>
        </tr>
    `).join('');
}
