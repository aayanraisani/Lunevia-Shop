/* =========================================================
   LUNÉVIA — ORDER TRACKING PAGE LOGIC
   Needs store.js.
========================================================= */

(function () {
    "use strict";

    const trackingForm = document.getElementById("trackingForm");
    const orderInput = document.getElementById("trackOrderNumber");
    const emailInput = document.getElementById("trackEmail");
    const messageBox = document.getElementById("trackingMessage");
    const resultBox = document.getElementById("trackingResult");

    if (!trackingForm) return;

    function showMessage(text) {
        messageBox.textContent = text || "";
        messageBox.className = text ? "form-alert error" : "form-alert";
    }

    function renderOrder(order) {
        resultBox.innerHTML = `
            <article class="order-card">
                <div class="order-card-head">
                    <div>
                        <h3>Order ${escapeHtml(order.number)}</h3>
                        <span class="order-date">Placed on ${escapeHtml(formatOrderDate(order.date))}</span>
                    </div>
                    ${buildStatusBadge(order.status)}
                </div>

                ${buildStatusTimeline(order.status)}
                ${buildOrderLinesHtml(order)}
                ${buildOrderTotalsHtml(order)}

                <div class="row g-4 mt-1">
                    <div class="col-12 col-md-6">
                        <h4 class="account-subheading">Delivery address</h4>
                        ${buildOrderAddressHtml(order)}
                    </div>
                    <div class="col-12 col-md-6">
                        <h4 class="account-subheading">Payment</h4>
                        <p class="order-address">${escapeHtml(getPaymentLabel(order))}</p>
                    </div>
                </div>
            </article>
        `;
    }

    // the email must match, so people can't look at each other's orders
    function lookUp(orderNumber, email) {
        resultBox.innerHTML = "";
        showMessage("");

        const order = findOrderByNumber(orderNumber);
        const emailMatches = order && order.customer && normalizeEmail(order.customer.email) === normalizeEmail(email);

        if (!order || !emailMatches) {
            showMessage("We couldn't find an order with those details. Check the order number (for example LV1001) and the email you used at checkout.");
            return;
        }

        renderOrder(order);
        resultBox.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    trackingForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const orderNumber = orderInput.value.trim();
        const email = emailInput.value.trim();

        if (!orderNumber || !isValidEmail(email)) {
            showMessage("Enter your order number and the email you used at checkout.");
            return;
        }

        lookUp(orderNumber, email);
    });

    // links from the account page fill in the order number, and the email when signed in
    const params = new URLSearchParams(window.location.search);
    const orderParam = params.get("order");
    const user = getCurrentUser();

    if (orderParam) orderInput.value = orderParam;
    if (user) emailInput.value = user.email;

    if (orderParam && user) lookUp(orderParam, user.email);
})();