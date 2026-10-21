/* =========================================================
   LUNÉVIA — ORDER CONFIRMATION PAGE LOGIC
   Needs store.js.
   Only shows an order that was placed in this browser session.
========================================================= */

(function () {
    "use strict";

    const content = document.getElementById("confirmContent");
    const missing = document.getElementById("confirmMissing");

    if (!content || !missing) return;

    function getLastOrderNumber() {
        try {
            return sessionStorage.getItem("luneviaLastOrder");
        } catch (error) {
            return null;
        }
    }

    const requested = new URLSearchParams(window.location.search).get("order");
    const order = requested ? findOrderByNumber(requested) : null;
    const isFromThisSession = order && getLastOrderNumber() === order.number;

    if (!isFromThisSession) {
        missing.style.display = "block";
        return;
    }

    document.title = `Order ${order.number} | Lunévia`;
    document.getElementById("confirmNumber").textContent = order.number;
    document.getElementById("confirmLines").innerHTML = buildOrderLinesHtml(order);
    document.getElementById("confirmTotals").innerHTML = buildOrderTotalsHtml(order);
    document.getElementById("confirmAddress").innerHTML = buildOrderAddressHtml(order);
    document.getElementById("confirmPayment").textContent = getPaymentLabel(order);
    document.getElementById("confirmTrackLink").href = `order-tracking.html?order=${encodeURIComponent(order.number)}`;

    content.style.display = "block";
})();