let rawData = [];

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q') || "";
    const category = urlParams.get('cat') || "姓名";

    Papa.parse("A05_basic_all.csv", {
        download: true,
        header: true,
        complete: function(results) {
            rawData = results.data.filter(row => {
                if (!row[category]) return false;
                return row[category].includes(query);
            });
            sortData('總收入');
        }
    });
});

function sortData(field, element) {
    if (element) {
        document.querySelectorAll('.sort-tag').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
    }

    let sortedData = [...rawData].sort((a, b) => parseNumber(b[field]) - parseNumber(a[field]));
    renderTable(sortedData);
    renderSummary(sortedData);
}

function parseNumber(val) {
    if (!val) return 0;
    return parseFloat(val.toString().replace(/[%,]/g, '')) || 0;
}

function renderTable(items) {
    const tableBody = document.querySelector('#data-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = items.map(item => `
        <tr>
            <td class="serif-font" style="font-weight:bold;">${item.姓名}</td>
            <td><span class="tag">${item.推薦政黨}</span></td>
            <td>${item.地區}</td>
            <td style="text-align:right;">${parseInt(item.總收入 || 0).toLocaleString()}</td>
            <td style="text-align:right;">${parseInt(item.得票數 || 0).toLocaleString()}</td>
            <td style="text-align:right;">${item.營利事業捐贈比例 || '0%'}</td>
        </tr>
    `).join('');
}

function renderSummary(items) {
    const container = document.querySelector('#quick-summary');
    if (!container || items.length === 0) return;
    const total = items.reduce((acc, cur) => acc + parseNumber(cur.總收入), 0);
    container.innerHTML = `
        <div class="summary-item"><small>結果筆數</small><br><strong class="serif-font">${items.length}</strong></div>
        <div class="summary-item"><small>總募款額</small><br><strong class="serif-font">NT$ ${(total/100000000).toFixed(2)}億</strong></div>
        <div class="summary-item"><small>榜首</small><br><strong class="serif-font">${items[0].姓名}</strong></div>
    `;
}
