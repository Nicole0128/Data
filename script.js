// 確保 PapaParse 已讀取
document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.querySelector('#data-table-body');
    const summaryContainer = document.querySelector('#quick-summary');
    const searchInput = document.querySelector('#search-input');
    
    // 從網址取得搜尋參數 (例如: result.html?q=柯建銘)
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q') || "";

    // 讀取 CSV 檔案
    Papa.parse("A05_basic_all.csv", {
        download: true,
        header: true,
        complete: function(results) {
            let data = results.data;
            
            // 1. 過濾資料 (過濾姓名、政黨或地區)
            let filteredData = data.filter(row => {
                if (!row.姓名) return false;
                return row.姓名.includes(query) || 
                       row.推薦政黨.includes(query) || 
                       row.地區.includes(query);
            });

            // 2. 計算 Quick Summary
            renderSummary(filteredData);

            // 3. 渲染表格
            renderTable(filteredData);
        }
    });

    function renderTable(items) {
        if (!tableBody) return;
        tableBody.innerHTML = items.map(item => `
            <tr>
                <td class="serif-font" style="font-weight: bold;">${item.姓名}</td>
                <td>${item.推薦政黨}</td>
                <td>${item.地區}</td>
                <td style="text-align: right;">${parseInt(item.總收入).toLocaleString()}</td>
                <td style="text-align: right;">${item.營利事業捐贈比例}</td>
            </tr>
        `).join('');
    }

    function renderSummary(items) {
        if (!summaryContainer || items.length === 0) return;
        
        const totalIncome = items.reduce((acc, cur) => acc + (parseInt(cur.總收入) || 0), 0);
        const avgIncome = (totalIncome / items.length).toFixed(0);
        const topCandidate = items.reduce((prev, current) => (parseInt(prev.總收入) > parseInt(current.總收入)) ? prev : current);

        summaryContainer.innerHTML = `
            <div class="summary-item"><small>搜尋結果數</small><br><strong class="serif-font">${items.length} 筆</strong></div>
            <div class="summary-item"><small>平均募款金額</small><br><strong class="serif-font">NT$ ${(avgIncome/1000000).toFixed(1)}M</strong></div>
            <div class="summary-item"><small>該組最高收入</small><br><strong class="serif-font">${topCandidate.姓名}</strong></div>
        `;
    }
});
