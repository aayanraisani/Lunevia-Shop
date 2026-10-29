/* =========================================================
   LUNÉVIA ADMIN — DASHBOARD (js/admin-dashboard.js)
========================================================= */

(function () {
    "use strict";

    // products with this many left (or fewer) count as low stock
    const LOW_STOCK = 5;

    const statGrid = document.getElementById("statGrid");
    const salesChart = document.getElementById("salesChart");
    const lowStockList = document.getElementById("lowStockList");
    const latestOrders = document.getElementById("latestOrders");

    const orders = getAdminOrders();
    const catalog = getAdminProducts();
    const lowStock = catalog.filter((product) => product.stock <= LOW_STOCK).sort((a, b) => a.stock - b.stock);

    // cancelled orders are not sales
    const activeOrders = orders.filter((order) => order.status !== "cancelled");
    const salesTotal = activeOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

    function renderStats() {
        const cards = [
            { label: "Sales", value: formatPrice(salesTotal), hint: "This browser’s local demo records", href: "orders.html" },
            { label: "Orders", value: orders.length, hint: "Local demo only", href: "orders.html" },
            { label: "New orders", value: orders.filter((order) => order.status === "pending").length, hint: "Local demo only", href: "orders.html?status=pending" },
            { label: "Low stock", value: lowStock.length, hint: `${LOW_STOCK} or fewer left`, href: "products.html" },
            { label: "Unread messages", value: getAdminMessages().filter((message) => !message.read).length, hint: "Local browser demo only", href: "messages.html" },
            { label: "Customers", value: getAdminCustomers().length, hint: "With an account", href: "customers.html" },
            { label: "Subscribers", value: getAdminSubscribers().length, hint: "Local browser demo only", href: "subscribers.html" },
            { label: "Products", value: catalog.length, hint: "In the shop", href: "products.html" }
        ];

        statGrid.innerHTML = cards.map((card) => `
            <a class="stat-card" href="${card.href}">
                <span class="stat-label">${escapeHtml(card.label)}</span>
                <span class="stat-value">${escapeHtml(card.value)}</span>
                <span class="stat-hint">${escapeHtml(card.hint)}</span>
            </a>
        `).join("");
    }

    function getDayKey(date) {
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${date.getFullYear()}-${month}-${day}`;
    }

    function renderChart() {
        const days = [];

        for (let back = 6; back >= 0; back--) {
            const date = new Date();
            date.setDate(date.getDate() - back);
            days.push({ key: getDayKey(date), label: date.toLocaleDateString("en-US", { weekday: "short" }), total: 0 });
        }

        activeOrders.forEach((order) => {
            const day = days.find((item) => item.key === getDayKey(new Date(order.date)));
            if (day) day.total += Number(order.total) || 0;
        });

        const highest = Math.max(...days.map((day) => day.total), 0);

        salesChart.setAttribute("aria-label", "Sales for the last 7 days: " + days.map((day) => `${day.label} ${formatPrice(day.total)}`).join(", "));

        salesChart.innerHTML = days.map((day) => {
            const height = highest > 0 ? Math.round((day.total / highest) * 70) : 0;

            return `
                <div class="mini-bar" title="${escapeHtml(day.label)}: ${formatPrice(day.total)}">
                    <span class="mini-bar-value">${day.total > 0 ? formatPriceShort(Math.round(day.total)) : ""}</span>
                    <div class="mini-bar-fill" style="height: ${height}%"></div>
                    <span class="mini-bar-label">${escapeHtml(day.label)}</span>
                </div>
            `;
        }).join("");
    }

    function renderLowStock() {
        if (lowStock.length === 0) {
            lowStockList.innerHTML = '<p class="admin-empty">All products are well stocked.</p>';
            return;
        }

        lowStockList.innerHTML = lowStock.slice(0, 6).map((product) => `
            <div class="low-stock-row">
                <a href="product-edit.html?id=${product.id}">${escapeHtml(product.name)}</a>
                <span class="stock-low">${product.stock === 0 ? "Sold out" : `${product.stock} left`}</span>
            </div>
        `).join("");
    }

    function renderLatestOrders() {
        const latest = orders.slice(0, 5);

        if (latest.length === 0) {
            latestOrders.innerHTML = '<p class="admin-empty"><i class="bi bi-receipt"></i>No orders saved in this browser demo yet.</p>';
            return;
        }

        latestOrders.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr><th>Order</th><th>Customer</th><th>Date</th><th class="num">Total</th><th>Status</th></tr>
                </thead>
                <tbody>
                    ${latest.map((order) => `
                        <tr>
                            <td><a href="order-detail.html?order=${encodeURIComponent(order.number)}">${escapeHtml(order.number)}</a></td>
                            <td>${escapeHtml(getAdminOrderCustomerName(order))}</td>
                            <td>${escapeHtml(formatAdminDateTime(order.date))}</td>
                            <td class="num">${formatPrice(order.total)}</td>
                            <td>${buildStatusBadge(order.status)}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;
    }

    renderStats();
    renderChart();
    renderLowStock();
    renderLatestOrders();
})();