/* =========================================================
   LUNÉVIA — HOMEPAGE LOGIC
   Requires products.js and main.js to be loaded first.
========================================================= */

(function () {
    "use strict";

    const sections = [
        { gridId: "featuredGrid", getProducts: () => getFeaturedProducts(4), empty: "No featured products are available right now." },
        { gridId: "arrivalsGrid", getProducts: () => getNewArrivals(4), empty: "No new arrivals right now. Check back soon." }
    ];

    function renderSection({ gridId, getProducts, empty }) {
        const grid = document.getElementById(gridId);
        if (!grid) return;

        const unavailable = typeof getProducts !== "function" || typeof buildProductCard !== "function";
        const items = unavailable ? [] : getProducts();

        if (!items.length) {
            const message = unavailable ? "Products are temporarily unavailable." : empty;
            grid.innerHTML = `<div class="col-12"><p class="text-center" role="status">${message} <a href="shop.html">Browse the shop</a>.</p></div>`;
            return;
        }

        grid.innerHTML = items.map((product) => buildProductCard(product, { colClass: "col-12 col-sm-6 col-lg-3" })).join("");
    }

    function renderAll() {
        sections.forEach(renderSection);
        if (typeof updateWishlistButtons === "function") updateWishlistButtons();
    }

    renderAll();

    // refresh the cards if the demo admin changes the catalogue in this tab
    document.addEventListener("lv:products-updated", renderAll);
})();
