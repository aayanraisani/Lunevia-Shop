/* =========================================================
   LUNÉVIA ADMIN — ORDERS LIST (js/admin-orders.js)
   orders.html?status=pending   -> only new orders
   orders.html?search=sara@x.com -> filtered by search
========================================================= */

(function () {
    "use strict";

    const table = document.getElementById("ordersTable");
    const searchInput = document.getElementById("orderSearch");
    const statusFilter = document.getElementById("orderStatusFilter");
    const countText = document.getElementById("orderCount");
    const exportButton = document.getElementById("exportOrders");

    let visibleOrders = [];

    function matchesSearch(order, query) {
        const customer = order.customer || {};
        const text = `${order.number} ${customer.firstName || ""} ${customer.lastName || ""} ${customer.email || ""} ${customer.phone || ""}`;
        return text.toLowerCase().includes(query);
    }

    function render() {
        const all = getAdminOrders();
        const query = searchInput.value.trim().toLowerCase();
        const status = statusFilter.value;

        visibleOrders = all
            .filter((order) => !status || order.status === status)
            .filter((order) => !query || matchesSearch(order, query));

        countText.textContent = `${visibleOrders.length} of ${all.length} orders`;
        exportButton.disabled = visibleOrders.length === 0;

        if (all.length === 0) {
            table.innerHTML = '<p class="admin-empty"><i class="bi bi-receipt"></i>No orders saved in this browser demo yet.</p>';
            return;
        }

        if (visibleOrders.length === 0) {
            table.innerHTML = '<p class="admin-empty"><i class="bi bi-search"></i>No orders match your search.</p>';
            return;
        }

        table.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Order</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th class="num">Items</th>
                        <th class="num">Total</th>
                        <th>Status</th>
                        <th><span class="visually-hidden">Actions</span></th>
                    </tr>
                </thead>
                <tbody>
                    ${visibleOrders.map((order) => `
                        <tr>
                            <td><a href="order-detail.html?order=${encodeURIComponent(order.number)}">${escapeHtml(order.number)}</a></td>
                            <td>${escapeHtml(formatAdminDateTime(order.date))}</td>
                            <td>
                                ${escapeHtml(getAdminOrderCustomerName(order))}<br>
                                <small class="text-muted">${escapeHtml((order.customer || {}).email || "")}</small>
                            </td>
                            <td class="num">${getAdminOrderItemCount(order)}</td>
                            <td class="num">${formatPrice(order.total)}</td>
                            <td>${buildStatusBadge(order.status)}</td>
                            <td>
                                <div class="row-actions">
                                    <a class="admin-btn admin-btn-ghost admin-btn-small" href="order-detail.html?order=${encodeURIComponent(order.number)}">View</a>
                                </div>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;
    }

    function exportCsv() {
        const rows = [[
            "Order", "Date", "Status", "Name", "Email", "Phone", "Address", "City", "State", "Postal code",
            "Country", "Items", "Subtotal", "Shipping", "Total", "Payment", "Notes"
        ]];

        visibleOrders.forEach((order) => {
            const customer = order.customer || {};

            rows.push([
                order.number, order.date, getStatusLabel(order.status), getAdminOrderCustomerName(order),
                customer.email, customer.phone, customer.address, customer.city, customer.state, customer.zip,
                getCountryName(customer.country), getAdminOrderItemCount(order), order.subtotal, order.shipping,
                order.total, getPaymentLabel(order), order.notes
            ]);
        });

        const today = new Date().toISOString().slice(0, 10);
        downloadTextFile(`lunevia-orders-${today}.csv`, toCsv(rows), "text/csv;charset=utf-8");
    }

    // links from other pages can open this page already filtered
    const statusParam = getUrlParam("status");
    const searchParam = getUrlParam("search");

    if (statusParam && ADMIN_ORDER_STATUSES.includes(statusParam)) statusFilter.value = statusParam;
    if (searchParam) searchInput.value = searchParam;

    searchInput.addEventListener("input", render);
    statusFilter.addEventListener("change", render);
    exportButton.addEventListener("click", exportCsv);

    render();
})();