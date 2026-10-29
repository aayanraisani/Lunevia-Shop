/* =========================================================
   LUNÉVIA — CART PAGE LOGIC
========================================================= */

(function () {
    "use strict";

    const cartItemsContainer = document.getElementById("cartItemsContainer");
    const cartEmptyState = document.getElementById("cartEmptyState");
    const cartSummaryBox = document.getElementById("cartSummaryBox");
    const cartSubtotalEl = document.getElementById("cartSubtotal");
    const cartShippingEl = document.getElementById("cartShipping");
    const cartTotalEl = document.getElementById("cartTotal");
    const cartItemCountEl = document.getElementById("cartItemCount");
    const cartShippingNoteEl = document.getElementById("cartShippingNote");

    if (!cartItemsContainer) return;


    function buildCartRow(cartItem) {
        const product = getProductById(cartItem.id);
        if (!product) return "";

        const name = escapeHtml(product.name);
        const lineTotal = product.price * cartItem.quantity;
        const atMaxStock = cartItem.quantity >= product.stock;

        return `
            <div class="cart-row" data-cart-id="${product.id}">
                <div class="cart-row-image">
                    <img src="${escapeHtml(product.image)}" alt="${name}" loading="lazy">
                </div>
                <div class="cart-row-info">
                    <p class="cart-row-category">${escapeHtml(product.category.toUpperCase())}</p>
                    <h3><a href="product.html?id=${product.id}">${name}</a></h3>
                    <span class="cart-row-price">${formatPrice(product.price)}</span>
                    <button type="button" class="cart-row-remove" data-remove-id="${product.id}" aria-label="Remove ${name} from your bag">
                        <i class="bi bi-trash"></i> Remove
                    </button>
                </div>
                <div class="cart-row-qty">
                    <button type="button" class="qty-btn" data-qty-decrease="${product.id}" aria-label="Decrease quantity of ${name}">−</button>
                    <input type="text" class="qty-input" value="${cartItem.quantity}" readonly aria-label="Quantity of ${name}">
                    <button type="button" class="qty-btn" data-qty-increase="${product.id}" aria-label="Increase quantity of ${name}" ${atMaxStock ? "disabled" : ""}>+</button>
                </div>
                <div class="cart-row-total">
                    ${formatPrice(lineTotal)}
                </div>
            </div>
        `;
    }

    function updateShippingNote(subtotal) {
        if (!cartShippingNoteEl) return;

        if (subtotal <= 0) {
            cartShippingNoteEl.textContent = "";
        } else if (subtotal >= FREE_SHIPPING_THRESHOLD) {
            cartShippingNoteEl.textContent = "You've unlocked free shipping.";
        } else {
            cartShippingNoteEl.textContent = `Add ${formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more to get free shipping.`;
        }
    }

    function updateCartSummary(cart) {
        let subtotal = 0;
        let itemCount = 0;

        cart.forEach((item) => {
            const product = getProductById(item.id);

            if (product) {
                subtotal += product.price * item.quantity;
                itemCount += item.quantity;
            }
        });

        const shipping = getShippingCost(subtotal);
        const total = subtotal + shipping;

        if (cartSubtotalEl) cartSubtotalEl.textContent = formatPrice(subtotal);
        if (cartShippingEl) cartShippingEl.textContent = shipping === 0 ? "Free" : formatPrice(shipping);
        if (cartTotalEl) cartTotalEl.textContent = formatPrice(total);

        if (cartItemCountEl) {
            cartItemCountEl.textContent = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;
        }

        updateShippingNote(subtotal);
    }

    function renderCart() {
        const cart = getCart();

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = "";
            if (cartEmptyState) cartEmptyState.style.display = "block";
            if (cartSummaryBox) cartSummaryBox.style.display = "none";
            if (cartItemCountEl) cartItemCountEl.textContent = "0 items";
            return;
        }

        if (cartEmptyState) cartEmptyState.style.display = "none";
        if (cartSummaryBox) cartSummaryBox.style.display = "block";

        cartItemsContainer.innerHTML = cart.map((item) => buildCartRow(item)).join("");
        updateCartSummary(cart);
    }


    function changeQuantity(productId, delta) {
        const id = Number(productId);
        let cart = getCart();

        const item = cart.find((cartItem) => cartItem.id === id);
        if (!item) return;

        const product = getProductById(id);

        item.quantity = (Number(item.quantity) || 0) + delta;

        // never go above the stock we have
        if (product && item.quantity > product.stock) item.quantity = product.stock;

        if (item.quantity <= 0) {
            cart = cart.filter((cartItem) => cartItem.id !== id);
        }

        if (!saveCart(cart)) {
            showToast("Could not update your bag. Please allow site storage in your browser.", "error");
            return;
        }

        updateCartCount();
        renderCart();
    }

    function removeFromCart(productId) {
        const id = Number(productId);
        const cart = getCart().filter((cartItem) => cartItem.id !== id);

        if (!saveCart(cart)) {
            showToast("Could not update your bag. Please allow site storage in your browser.", "error");
            return;
        }

        updateCartCount();
        renderCart();
    }


    // one listener handles every button, even after the list is redrawn
    cartItemsContainer.addEventListener("click", (event) => {
        const increase = event.target.closest("[data-qty-increase]");
        const decrease = event.target.closest("[data-qty-decrease]");
        const remove = event.target.closest("[data-remove-id]");

        if (increase && !increase.disabled) changeQuantity(increase.dataset.qtyIncrease, 1);
        else if (decrease) changeQuantity(decrease.dataset.qtyDecrease, -1);
        else if (remove) removeFromCart(remove.dataset.removeId);
    });

    // the bag changed in another tab
    document.addEventListener("lv:cart-updated", renderCart);

    renderCart();
})();