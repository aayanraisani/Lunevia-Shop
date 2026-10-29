/* =========================================================
   LUNÉVIA — CHECKOUT PAGE LOGIC
========================================================= */

(function () {
    "use strict";

    const checkoutForm = document.getElementById("checkoutForm");
    const checkoutItemsContainer = document.getElementById("checkoutItemsContainer");
    const checkoutSubtotalEl = document.getElementById("checkoutSubtotal");
    const checkoutShippingEl = document.getElementById("checkoutShipping");
    const checkoutTotalEl = document.getElementById("checkoutTotal");
    const checkoutEmptyState = document.getElementById("checkoutEmptyState");
    const checkoutMainContent = document.getElementById("checkoutMainContent");
    const placeOrderButton = document.getElementById("placeOrderBtn");

    if (!checkoutForm) return;

    // we show our own messages instead of the browser's
    checkoutForm.noValidate = true;


    /* ---------- order summary ---------- */

    function buildCheckoutRow(cartItem) {
        const product = getProductById(cartItem.id);
        if (!product) return "";

        const name = escapeHtml(product.name);

        return `
            <div class="checkout-row">
                <div class="checkout-row-image">
                    <img src="${escapeHtml(product.image)}" alt="${name}">
                    <span class="checkout-row-qty-badge">${cartItem.quantity}</span>
                </div>
                <div class="checkout-row-info">
                    <h4>${name}</h4>
                    <p>${escapeHtml(product.category.toUpperCase())}</p>
                </div>
                <div class="checkout-row-price">
                    ${formatPrice(product.price * cartItem.quantity)}
                </div>
            </div>
        `;
    }

    function getCartTotals(cart) {
        let subtotal = 0;

        cart.forEach((item) => {
            const product = getProductById(item.id);
            if (product) subtotal += product.price * item.quantity;
        });

        const shipping = getShippingCost(subtotal);

        return { subtotal: subtotal, shipping: shipping, total: subtotal + shipping };
    }

    function renderCheckoutSummary() {
        const cart = getCart();

        if (cart.length === 0) {
            if (checkoutMainContent) checkoutMainContent.style.display = "none";
            if (checkoutEmptyState) checkoutEmptyState.style.display = "block";
            return;
        }

        if (checkoutMainContent) checkoutMainContent.style.display = "grid";
        if (checkoutEmptyState) checkoutEmptyState.style.display = "none";

        if (checkoutItemsContainer) {
            checkoutItemsContainer.innerHTML = cart.map((item) => buildCheckoutRow(item)).join("");
        }

        const totals = getCartTotals(cart);

        if (checkoutSubtotalEl) checkoutSubtotalEl.textContent = formatPrice(totals.subtotal);
        if (checkoutShippingEl) checkoutShippingEl.textContent = totals.shipping === 0 ? "Free" : formatPrice(totals.shipping);
        if (checkoutTotalEl) checkoutTotalEl.textContent = formatPrice(totals.total);
    }


    /* ---------- validation ---------- */

    function getInputValue(id) {
        const element = document.getElementById(id);
        return element ? element.value.trim() : "";
    }

    function required(message) {
        return (value) => (value ? "" : message);
    }

    // each rule returns an error message, or "" when the field is fine
    const rules = [
        { id: "checkoutEmail", check: (value) => (isValidEmail(value) ? "" : "Enter a valid email address, like name@example.com.") },
        {
            id: "checkoutPhone",
            check: (value) => {
                const digits = value.replace(/\D/g, "");
                const looksRight = /^\+?[0-9\s\-()]+$/.test(value);
                return looksRight && digits.length >= 7 && digits.length <= 15 ? "" : "Enter a valid phone number (7 to 15 digits).";
            }
        },
        { id: "checkoutFirstName", check: required("Enter your first name.") },
        { id: "checkoutLastName", check: required("Enter your last name.") },
        { id: "checkoutAddress", check: required("Enter your street address.") },
        { id: "checkoutCity", check: required("Enter your city.") },
        { id: "checkoutZip", check: required("Enter your postal code.") },
        { id: "checkoutCountry", check: required("Choose your country.") }
    ];

    function setFieldError(id, message) {
        const field = document.getElementById(id);
        if (!field) return;

        const holder = field.closest(".form-group") || field.closest(".checkout-terms") || field.parentElement;
        let error = holder.querySelector(".field-error");

        if (message) {
            if (!error) {
                error = document.createElement("p");
                error.className = "field-error";
                error.id = `${id}Error`;
                holder.appendChild(error);
            }

            error.textContent = message;
            holder.classList.add("has-error");
            field.setAttribute("aria-invalid", "true");
            field.setAttribute("aria-describedby", error.id);
        } else {
            if (error) error.remove();
            holder.classList.remove("has-error");
            field.removeAttribute("aria-invalid");
            field.removeAttribute("aria-describedby");
        }
    }

    // returns the id of the first field with a problem, or null if all is well
    function validateForm() {
        let firstInvalid = null;

        rules.forEach((rule) => {
            const message = rule.check(getInputValue(rule.id));
            setFieldError(rule.id, message);
            if (message && !firstInvalid) firstInvalid = rule.id;
        });

        const terms = document.getElementById("checkoutTerms");

        if (terms) {
            const message = terms.checked ? "" : "Please accept the Terms and Privacy Policy to place your order.";
            setFieldError("checkoutTerms", message);
            if (message && !firstInvalid) firstInvalid = "checkoutTerms";
        }

        return firstInvalid;
    }

    // clear a field's message as soon as the customer edits it
    checkoutForm.addEventListener("input", (event) => {
        if (event.target.id) setFieldError(event.target.id, "");
    });

    checkoutForm.addEventListener("change", (event) => {
        if (event.target.id) setFieldError(event.target.id, "");
    });


    /* ---------- creating the order ---------- */

    // LV1001, LV1002, ... always one more than the highest saved order
    function getNextOrderNumber(orders) {
        const highest = orders.reduce((max, order) => {
            const number = Number(String(order.number).replace("LV", ""));
            return number > max ? number : max;
        }, 1000);

        return "LV" + (highest + 1);
    }

    function createOrder(cart, orders) {
        const items = [];

        cart.forEach((item) => {
            const product = getProductById(item.id);
            if (!product) return;

            items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                // uploaded photos are big, so only short links are copied into the order
                image: product.image.length > 500 ? "" : product.image
            });
        });

        const totals = getCartTotals(cart);

        return {
            number: getNextOrderNumber(orders),
            date: new Date().toISOString(),
            status: "pending",
            customer: {
                email: getInputValue("checkoutEmail"),
                phone: getInputValue("checkoutPhone"),
                firstName: getInputValue("checkoutFirstName"),
                lastName: getInputValue("checkoutLastName"),
                address: getInputValue("checkoutAddress"),
                city: getInputValue("checkoutCity"),
                state: getInputValue("checkoutState"),
                zip: getInputValue("checkoutZip"),
                country: getInputValue("checkoutCountry")
            },
            // card payments are not available yet, so every order is cash on delivery
            payment: "cod",
            notes: getInputValue("checkoutNotes"),
            items: items,
            subtotal: totals.subtotal,
            shipping: totals.shipping,
            total: totals.total
        };
    }

    function setPlacingOrder(isPlacing) {
        if (!placeOrderButton) return;

        placeOrderButton.disabled = isPlacing;

        if (isPlacing) {
            placeOrderButton.dataset.originalHtml = placeOrderButton.innerHTML;
            placeOrderButton.textContent = "Placing your order…";
        } else if (placeOrderButton.dataset.originalHtml) {
            placeOrderButton.innerHTML = placeOrderButton.dataset.originalHtml;
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (checkoutForm.dataset.submitting === "true") return;

        const cart = getCart();
        if (cart.length === 0) {
            showToast("Your cart is empty. Add an item before checking out.", "error");
            return;
        }

        const firstInvalid = validateForm();
        if (firstInvalid) {
            const field = document.getElementById(firstInvalid);
            if (field) field.focus();
            showToast("Please check the highlighted fields.", "error");
            return;
        }

        const orders = readList("luneviaOrders");
        const order = createOrder(cart, orders);
        if (order.items.length === 0) {
            showToast("Your cart has no valid products. Please review it before checking out.", "error");
            return;
        }

        checkoutForm.dataset.submitting = "true";
        setPlacingOrder(true);

        // This is a front-end demo: orders are saved only in this browser.
        // A real store needs a backend or a connected order-management service.
        orders.push(order);
        if (!writeList("luneviaOrders", orders)) {
            checkoutForm.dataset.submitting = "false";
            setPlacingOrder(false);
            showToast("The demo order could not be saved in this browser. No order was recorded.", "error");
            return;
        }

        saveCart([]);
        updateCartCount();

        try {
            sessionStorage.setItem("luneviaLastOrder", order.number);
        } catch (error) {
            // Confirmation still uses local order storage when the session storage is unavailable.
        }

        window.location.href = `order-confirmation.html?order=${encodeURIComponent(order.number)}`;
    }


    /* ---------- extras ---------- */

    // signed-in customers get their saved details filled in (store.js is optional on this page)
    function prefillCheckoutForm() {
        let user = null;

        try {
            user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
        } catch (error) {
            user = null;
        }

        if (!user) return;

        const nameParts = String(user.name || "").trim().split(/\s+/);
        const country = user.country === "UK" ? "GB" : user.country;

        const values = {
            checkoutEmail: user.email,
            checkoutPhone: user.phone,
            checkoutFirstName: nameParts[0],
            checkoutLastName: nameParts.slice(1).join(" "),
            checkoutAddress: user.address,
            checkoutCity: user.city,
            checkoutState: user.state,
            checkoutZip: user.zip,
            checkoutCountry: country
        };

        Object.keys(values).forEach((id) => {
            const field = document.getElementById(id);
            if (field && values[id]) field.value = values[id];
        });
    }

    // only cash on delivery works for now
    function lockPaymentToCashOnDelivery() {
        const cod = checkoutForm.querySelector('input[name="paymentMethod"][value="cod"]');
        if (cod) cod.checked = true;
    }

    checkoutForm.addEventListener("submit", handleSubmit);

    // the bag changed in another tab
    document.addEventListener("lv:cart-updated", renderCheckoutSummary);

    renderCheckoutSummary();
    prefillCheckoutForm();
    lockPaymentToCashOnDelivery();
})();