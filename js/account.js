/* =========================================================
   LUNÉVIA — ACCOUNT PAGE LOGIC
   Needs store.js.
========================================================= */

(function () {
    "use strict";

    let user = requireLogin();
    if (!user) return;

    const layout = document.getElementById("accountLayout");
    const navButtons = document.querySelectorAll("[data-account-tab]");
    const panels = document.querySelectorAll(".account-panel");
    const detailsForm = document.getElementById("detailsForm");
    const passwordForm = document.getElementById("passwordForm");

    const validTabs = ["overview", "orders", "details", "password"];


    /* ---------- tabs ---------- */

    function showTab(name) {
        const tab = validTabs.includes(name) ? name : "overview";

        navButtons.forEach((button) => {
            const isActive = button.dataset.accountTab === tab;
            button.classList.toggle("active", isActive);

            if (isActive) {
                button.setAttribute("aria-current", "page");
            } else {
                button.removeAttribute("aria-current");
            }
        });

        panels.forEach((panel) => {
            panel.hidden = panel.id !== `panel-${tab}`;
        });

        try {
            history.replaceState(null, "", `#${tab}`);
        } catch (error) {
            // some browsers block this for local files
        }
    }


    /* ---------- overview & orders ---------- */

    function renderOverview(orders) {
        const firstName = user.name.split(/\s+/)[0];

        document.getElementById("accountGreeting").textContent = `Hello, ${firstName}.`;
        document.getElementById("statOrders").textContent = orders.length;
        document.getElementById("statWishlist").textContent = getWishlist().length;

        const recent = document.getElementById("recentOrder");

        if (orders.length === 0) {
            recent.innerHTML = `
                <div class="orders-empty">
                    <i class="bi bi-bag"></i>
                    <h3>No orders yet</h3>
                    <p>When you place an order with this email, it will show up here.</p>
                    <a href="shop.html" class="btn btn-primary-custom">Start Shopping</a>
                </div>
            `;
            return;
        }

        recent.innerHTML = buildOrderCard(orders[0]);
    }

    function buildOrderCard(order) {
        return `
            <article class="order-card">
                <div class="order-card-head">
                    <div>
                        <h3>Order ${escapeHtml(order.number)}</h3>
                        <span class="order-date">Placed on ${escapeHtml(formatOrderDate(order.date))}</span>
                    </div>
                    ${buildStatusBadge(order.status)}
                </div>
                ${buildOrderLinesHtml(order)}
                ${buildOrderTotalsHtml(order)}
                <div class="order-card-actions">
                    <a href="order-tracking.html?order=${encodeURIComponent(order.number)}" class="text-link">Track this order</a>
                </div>
            </article>
        `;
    }

    function renderOrders(orders) {
        const container = document.getElementById("accountOrders");

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="orders-empty">
                    <i class="bi bi-bag"></i>
                    <h3>No orders yet</h3>
                    <p>Orders placed with ${escapeHtml(user.email)} will appear here.</p>
                    <a href="shop.html" class="btn btn-primary-custom">Start Shopping</a>
                </div>
            `;
            return;
        }

        container.innerHTML = orders.map(buildOrderCard).join("");
    }

    function renderAll() {
        const orders = getOrdersForEmail(user.email);
        renderOverview(orders);
        renderOrders(orders);
    }


    /* ---------- details form ---------- */

    const detailFields = {
        accountName: "name",
        accountPhone: "phone",
        accountAddress: "address",
        accountCity: "city",
        accountState: "state",
        accountZip: "zip",
        accountCountry: "country"
    };

    function fillDetailsForm() {
        document.getElementById("accountEmail").value = user.email;

        Object.keys(detailFields).forEach((id) => {
            const value = user[detailFields[id]] === "UK" ? "GB" : user[detailFields[id]];
            document.getElementById(id).value = value || "";
        });
    }

    detailsForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const fields = {};

        Object.keys(detailFields).forEach((id) => {
            fields[detailFields[id]] = document.getElementById(id).value;
        });

        const result = updateUserProfile(fields);

        if (!result.ok) {
            showToast(result.error, "error");
            return;
        }

        user = result.user;
        renderAll();
        showToast("Your details have been saved.");
    });


    /* ---------- password form ---------- */

    passwordForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const current = document.getElementById("currentPassword").value;
        const next = document.getElementById("newPassword").value;
        const confirm = document.getElementById("confirmPassword").value;

        if (next !== confirm) {
            showToast("The two new passwords do not match.", "error");
            return;
        }

        const result = await changeUserPassword(current, next);

        if (!result.ok) {
            showToast(result.error, "error");
            return;
        }

        passwordForm.reset();
        showToast("Your password has been changed.");
    });


    /* ---------- sign out & start ---------- */

    document.getElementById("signOutBtn").addEventListener("click", () => {
        logoutUser();
        window.location.href = "index.html";
    });

    navButtons.forEach((button) => {
        button.addEventListener("click", () => showTab(button.dataset.accountTab));
    });

    // the wishlist or orders can change in another tab
    document.addEventListener("lv:wishlist-updated", renderAll);

    fillDetailsForm();
    renderAll();
    layout.style.display = "grid";
    showTab(window.location.hash.replace("#", "") || "overview");
})();