/* =========================================================
   LUNÉVIA — HOMEPAGE LOGIC
   Requires products.js and main.js to be loaded first.
========================================================= */

(function () {
    "use strict";

    const grid = document.getElementById("featuredGrid");
    if (!grid) return;

    function renderFeaturedProducts() {
        if (typeof getFeaturedProducts !== "function" || typeof buildProductCard !== "function") {
            grid.innerHTML = '<div class="col-12"><p class="text-center" role="status">Featured products are temporarily unavailable. <a href="shop.html">Browse the shop</a>.</p></div>';
            return;
        }

        const featured = getFeaturedProducts(4);
        if (!featured.length) {
            grid.innerHTML = '<div class="col-12"><p class="text-center" role="status">No featured products are available right now. <a href="shop.html">Browse all products</a>.</p></div>';
            return;
        }

        grid.innerHTML = featured
            .map((product) => buildProductCard(product, { colClass: "col-12 col-sm-6 col-lg-3" }))
            .join("");

        if (typeof updateWishlistButtons === "function") updateWishlistButtons();
    }

    renderFeaturedProducts();

    // Refresh product cards if the local demo admin changes catalogue data in this tab.
    document.addEventListener("lv:products-updated", renderFeaturedProducts);
})();
