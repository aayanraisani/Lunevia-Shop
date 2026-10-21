/* =========================================================
   LUNÉVIA — WISHLIST PAGE LOGIC
   The heart and "Add to Bag" buttons are handled in main.js.
   This file only draws the list and redraws it when it changes.
========================================================= */

(function () {
    "use strict";

    const wishlistGrid = document.getElementById("wishlistGrid");
    const wishlistEmptyState = document.getElementById("wishlistEmptyState");

    if (!wishlistGrid) return;

    function renderWishlist() {
        const wishlistProducts = getWishlist()
            .map((id) => getProductById(id))
            .filter((product) => product !== null);

        if (wishlistProducts.length === 0) {
            wishlistGrid.innerHTML = "";
            if (wishlistEmptyState) wishlistEmptyState.style.display = "block";
            return;
        }

        if (wishlistEmptyState) wishlistEmptyState.style.display = "none";

        wishlistGrid.innerHTML = wishlistProducts
            .map((product) => buildProductCard(product, { headingTag: "h2" }))
            .join("");
    }

    // runs after a heart is clicked here, or when the wishlist changes in another tab
    document.addEventListener("lv:wishlist-updated", renderWishlist);

    renderWishlist();
})();