/* =========================================================
   LUNÉVIA ADMIN — CUSTOMERS (js/admin-customers.js)
========================================================= */

(function () {
    "use strict";

    const table = document.getElementById("customersTable");
    const searchInput = document.getElementById("customerSearch");
    const countText = document.getElementById("customerCount");

    // how many orders each customer placed, and how much they spent (cancelled orders do not count)
    function getOrderStats(email) {
        const target = normalizeEmail(email);
        const own = getAdminOrders().filter((order) => normalizeEmail((order.customer || {}).email) === target);
        const active = own.filter((order) => order.status !== "cancelled");

        return {
            count: own.length,
            spent: active.reduce((sum, order) => sum + (Number(order.total) || 0), 0)
        };
    }

    function render() {
        const all = getAdminCustomers().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const query = searchInput.value.trim().toLowerCase();

        const rows = all.filter((customer) => !query || `${customer.name} ${customer.email}`.toLowerCase().includes(query));

        countText.textContent = `${rows.length} of ${all.length} customers`;

        if (all.length === 0) {
            table.innerHTML = '<p class="admin-empty"><i class="bi bi-people"></i>No customers yet. People appear here when they create an account.</p>';
            return;
        }

        if (rows.length === 0) {
            table.innerHTML = '<p class="admin-empty"><i class="bi bi-search"></i>No customers match your search.</p>';
            return;
        }

        table.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Location</th>
                        <th>Joined</th>
                        <th class="num">Orders</th>
                        <th class="num">Spent</th>
                        <th><span class="visually-hidden">Actions</span></th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.map((customer) => {
                        const stats = getOrderStats(customer.email);
                        const location = [customer.city, getCountryName(customer.country)].filter(Boolean).join(", ");

                        return `
                            <tr>
                                <td>
                                    <strong>${escapeHtml(customer.name)}</strong><br>
                                    <small class="text-muted">${escapeHtml(customer.email)}</small>
                                </td>
                                <td>${escapeHtml(customer.phone || "—")}</td>
                                <td>${escapeHtml(location || "—")}</td>
                                <td>${escapeHtml(formatOrderDate(customer.createdAt) || "—")}</td>
                                <td class="num">${stats.count}</td>
                                <td class="num">${formatPrice(stats.spent)}</td>
                                <td>
                                    <div class="row-actions">
                                        <a class="admin-btn admin-btn-ghost admin-btn-small" href="orders.html?search=${encodeURIComponent(customer.email)}">Orders</a>
                                        <button type="button" class="admin-btn admin-btn-danger-ghost admin-btn-small" data-delete-customer="${escapeHtml(customer.email)}">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join("")}
                </tbody>
            </table>
        `;
    }

    async function deleteCustomer(email) {
        const confirmed = await adminConfirm({
            title: "Delete this account?",
            message: `The account for ${email} will be removed. Their past orders stay in the order list.`,
            confirmText: "Delete account",
            danger: true
        });

        if (!confirmed) return;

        if (!deleteAdminCustomer(email)) {
            showToast("Could not delete the account.", "error");
            return;
        }

        showToast("Account deleted.");
        render();
    }

    table.addEventListener("click", (event) => {
        const button = event.target.closest("[data-delete-customer]");
        if (button) deleteCustomer(button.dataset.deleteCustomer);
    });

    searchInput.addEventListener("input", render);

    render();
})();