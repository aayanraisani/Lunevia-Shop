/* =========================================================
   LUNÉVIA ADMIN — ORDER DETAILS (js/admin-order-detail.js)
   order-detail.html?order=LV1001
========================================================= */

(function () {
    "use strict";

    const container = document.getElementById("orderDetail");
    const orderNumber = getUrlParam("order");

    function showNotFound() {
        container.innerHTML = `
            <div class="admin-card">
                <p class="admin-empty"><i class="bi bi-exclamation-circle"></i>We couldn't find that order.<br>
                <a href="orders.html" class="admin-btn admin-btn-primary" style="margin-top: 14px;">Back to orders</a></p>
            </div>
        `;
    }

    function buildStatusOptions(current) {
        return ADMIN_ORDER_STATUSES.map((status) =>
            `<option value="${status}" ${status === current ? "selected" : ""}>${escapeHtml(getStatusLabel(status))}</option>`
        ).join("");
    }

    function render() {
        const order = getAdminOrder(orderNumber);

        if (!order) {
            showNotFound();
            return;
        }

        const customer = order.customer || {};
        const name = getAdminOrderCustomerName(order);

        document.title = `Order ${order.number} | Lunévia Admin`;

        container.innerHTML = `
            <div class="admin-page-head">
                <h1>Order ${escapeHtml(order.number)}</h1>
                <p>Placed on ${escapeHtml(formatOrderDate(order.date))} &nbsp; ${buildStatusBadge(order.status)}</p>
            </div>

            <div class="admin-detail-grid">

                <div class="admin-stack">
                    <div class="admin-card">
                        <div class="admin-card-head"><h2>Items</h2></div>
                        ${buildOrderLinesHtml(order)}
                        ${buildOrderTotalsHtml(order)}
                    </div>

                    <div class="admin-card">
                        <div class="admin-card-head"><h2>Progress</h2></div>
                        ${buildStatusTimeline(order.status)}
                    </div>
                </div>

                <div class="admin-stack">

                    <div class="admin-card">
                        <div class="admin-card-head"><h2>Status</h2></div>
                        <p class="form-help">The customer sees this on the Track Order page.</p>
                        <div class="status-form">
                            <select id="orderStatusSelect" class="admin-input" aria-label="Order status">${buildStatusOptions(order.status)}</select>
                            <button type="button" class="admin-btn admin-btn-primary" id="saveStatus">Update</button>
                        </div>
                    </div>

                    <div class="admin-card">
                        <div class="admin-card-head"><h2>Customer</h2></div>
                        <dl class="kv-list">
                            <dt>Name</dt><dd>${escapeHtml(name)}</dd>
                            <dt>Email</dt><dd>${customer.email ? `<a href="mailto:${escapeHtml(customer.email)}">${escapeHtml(customer.email)}</a>` : "—"}</dd>
                            <dt>Phone</dt><dd>${customer.phone ? `<a href="tel:${escapeHtml(customer.phone.replace(/[^+\d]/g, ""))}">${escapeHtml(customer.phone)}</a>` : "—"}</dd>
                        </dl>
                    </div>

                    <div class="admin-card">
                        <div class="admin-card-head"><h2>Delivery</h2></div>
                        ${buildOrderAddressHtml(order)}
                        <dl class="kv-list">
                            <dt>Payment</dt><dd>${escapeHtml(getPaymentLabel(order))}</dd>
                            <dt>Customer note</dt><dd>${order.notes ? escapeHtml(order.notes) : "—"}</dd>
                        </dl>
                    </div>

                </div>
            </div>
        `;
    }

    async function saveStatus() {
        const select = document.getElementById("orderStatusSelect");
        const order = getAdminOrder(orderNumber);
        if (!order || select.value === order.status) return;

        if (select.value === "cancelled") {
            const confirmed = await adminConfirm({
                title: "Cancel this order?",
                message: "The customer will see this order as cancelled. Remember to contact them if needed.",
                confirmText: "Cancel order",
                danger: true
            });

            if (!confirmed) {
                select.value = order.status;
                return;
            }
        }

        const result = updateAdminOrderStatus(orderNumber, select.value);

        if (!result.ok) {
            showToast(result.error, "error");
            return;
        }

        render();
        showToast(`Status changed to "${getStatusLabel(select.value)}".`);
    }

    container.addEventListener("click", (event) => {
        if (event.target.closest("#saveStatus")) saveStatus();
    });

    render();
})();