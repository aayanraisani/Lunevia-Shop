/* =========================================================
   LUNÉVIA — MAIN JAVASCRIPT (loaded on every page)
   Needs config.js and products.js to be loaded first.
========================================================= */


/* ---------- saved data helpers ---------- */

// returns an empty list if nothing is saved or the saved data is broken
function readList(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
}

// returns false if the browser blocks saving (private mode, full storage)
function writeList(key, list) {
    try {
        localStorage.setItem(key, JSON.stringify(list));
        return true;
    } catch (error) {
        return false;
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || "").trim());
}




/* ---------- form delivery: demo mode or a configured endpoint ---------- */

// Sends a form to LUNEVIA_CONFIG.formEndpoint as JSON (see js/config.js).
// It only resolves when the service answers with a 2xx status, so a success
// message is never shown for data that was not accepted.
async function sendToFormEndpoint(formName, fields) {
    const response = await fetch(LUNEVIA_CONFIG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(Object.assign({ form: formName }, fields))
    });

    if (!response.ok) {
        throw new Error(`The form service answered with status ${response.status}.`);
    }

    return response;
}

// The demo admin panel reads these two lists. Only demo mode writes to them.
function saveDemoMessage(entry) {
    const messages = readList("luneviaMessages");
    messages.push(Object.assign({ id: Date.now(), date: new Date().toISOString(), read: false }, entry));
    return writeList("luneviaMessages", messages);
}

function saveDemoSubscriber(email) {
    const subscribers = readList("luneviaSubscribers");
    if (!subscribers.includes(email)) subscribers.push(email);
    return writeList("luneviaSubscribers", subscribers);
}

// Shows a message under a form. The element is a polite live region, so screen readers announce it.
function showFormStatus(form, message, type) {
    let box = form.querySelector("[data-form-status]");

    if (!box) {
        box = document.createElement("p");
        box.setAttribute("data-form-status", "");
        box.setAttribute("role", "status");
        form.appendChild(box);
    }

    box.className = message ? `form-status form-status-${type || "info"}` : "form-status";
    box.textContent = message || "";
}

// Puts an error message under a field (or clears it when message is empty).
// Works with any field inside a .form-group, and with the checkout terms box.
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

// Elements marked data-demo-notice are shown only in demo mode,
// elements marked data-live-notice only when a form endpoint is configured.
function applyDemoNotices() {
    document.querySelectorAll("[data-demo-notice]").forEach((element) => { element.hidden = !IS_DEMO_MODE; });
    document.querySelectorAll("[data-live-notice]").forEach((element) => { element.hidden = IS_DEMO_MODE; });
}

// Common submit handling: blocks double submits, shows a busy label, and always restores the button.
async function runFormSubmit(form, busyText, task) {
    if (form.dataset.submitting === "true") return;

    const button = form.querySelector('button[type="submit"]');
    const originalHtml = button ? button.innerHTML : "";

    form.dataset.submitting = "true";
    if (button) {
        button.disabled = true;
        button.textContent = busyText;
    }

    try {
        await task();
    } finally {
        form.dataset.submitting = "false";
        if (button) {
            button.disabled = false;
            button.innerHTML = originalHtml;
        }
    }
}

/* ---------- toast messages ---------- */

function showToast(message, type = "success") {
    let container = document.getElementById("toastContainer");

    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.className = "lv-toast-container";
        container.setAttribute("role", "status");
        container.setAttribute("aria-live", "polite");
        document.body.appendChild(container);
    }

    // keep at most 3 messages on screen
    while (container.children.length >= 3) {
        container.removeChild(container.firstChild);
    }

    const toast = document.createElement("div");
    toast.className = `lv-toast lv-toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

// shows temporary text on a button, safe to click many times
function flashButton(button, text) {
    if (!button || button.dataset.flashing === "true") return;

    button.dataset.flashing = "true";
    const originalHtml = button.innerHTML;
    button.textContent = text;

    setTimeout(() => {
        button.innerHTML = originalHtml;
        button.dataset.flashing = "false";
    }, 1200);
}


/* ---------- mobile menu ---------- */

// Plain replacement for Bootstrap's collapse plugin. Bootstrap's CSS already
// hides and shows .navbar-collapse, so we only toggle the "show" class.
function initNavToggle() {
    const toggler = document.querySelector("[data-nav-toggle]");
    const menu = toggler ? document.getElementById(toggler.getAttribute("aria-controls")) : null;
    if (!toggler || !menu) return;

    function setOpen(isOpen) {
        menu.classList.toggle("show", isOpen);
        toggler.setAttribute("aria-expanded", String(isOpen));
        toggler.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    }

    toggler.addEventListener("click", () => setOpen(!menu.classList.contains("show")));

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && menu.classList.contains("show")) {
            setOpen(false);
            toggler.focus();
        }
    });

    // the desktop layout always shows the links, so reset the mobile state
    window.matchMedia("(min-width: 992px)").addEventListener("change", (event) => {
        if (event.matches) setOpen(false);
    });
}


/* ---------- search overlay ---------- */

let searchOpener = null;

function openSearch() {
    const overlay = document.getElementById("searchOverlay");
    if (!overlay) return;

    searchOpener = document.activeElement;
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    setTimeout(() => {
        const input = document.getElementById("searchInput");
        if (input) input.focus();
    }, 50);
}

function closeSearch() {
    const overlay = document.getElementById("searchOverlay");
    if (!overlay || !overlay.classList.contains("active")) return;

    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    const returnTo = searchOpener || document.getElementById("searchButton");
    if (returnTo && returnTo.focus) returnTo.focus();
}

function initSearch() {
    const overlay = document.getElementById("searchOverlay");
    const button = document.getElementById("searchButton");
    const closeButton = document.getElementById("searchClose");
    const input = document.getElementById("searchInput");

    if (button) button.addEventListener("click", openSearch);
    if (closeButton) closeButton.addEventListener("click", closeSearch);

    document.addEventListener("keydown", (event) => {
        if (!overlay || !overlay.classList.contains("active")) return;

        if (event.key === "Escape") {
            closeSearch();
            return;
        }

        // keep Tab inside the dialog while it is open
        if (event.key === "Tab") {
            const focusable = overlay.querySelectorAll("button, input");
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });

    if (input) {
        input.addEventListener("keydown", (event) => {
            if (event.key !== "Enter") return;

            const query = input.value.trim();
            if (query) {
                window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
            }
        });
    }
}


/* ---------- wishlist ---------- */

function getWishlist() {
    return readList("luneviaWishlist").map(String);
}

function saveWishlist(wishlist) {
    return writeList("luneviaWishlist", wishlist);
}

function updateWishlistCount() {
    const total = getWishlist().length;

    document.querySelectorAll(".wishlist-count").forEach((element) => {
        element.textContent = total;
    });
}

// adds or removes a product, returns true if it is now in the wishlist
function toggleWishlistItem(productId) {
    const id = String(productId);
    const wishlist = getWishlist();
    const wasSaved = wishlist.includes(id);

    const updated = wasSaved
        ? wishlist.filter((item) => item !== id)
        : [...wishlist, id];

    if (!saveWishlist(updated)) {
        showToast("Could not save your wishlist. Please allow site storage in your browser.", "error");
        return wasSaved;
    }

    document.dispatchEvent(new CustomEvent("lv:wishlist-updated", { detail: { id: id, active: !wasSaved } }));

    return !wasSaved;
}

// makes every heart button on the page match what is saved
function updateWishlistButtons() {
    const wishlist = getWishlist();

    document.querySelectorAll(".product-wishlist[data-product-id]").forEach((button) => {
        const isSaved = wishlist.includes(String(button.dataset.productId));
        const icon = button.querySelector("i");

        button.classList.toggle("active", isSaved);
        button.setAttribute("aria-pressed", String(isSaved));
        button.setAttribute("aria-label", isSaved ? "Remove from wishlist" : "Add to wishlist");

        if (icon) icon.className = isSaved ? "bi bi-heart-fill" : "bi bi-heart";
    });
}

// removes products that no longer exist and duplicates
function sanitizeWishlist() {
    if (typeof getProductById !== "function") return;

    const saved = getWishlist();
    const clean = [];

    saved.forEach((id) => {
        if (getProductById(id) && !clean.includes(id)) clean.push(id);
    });

    if (clean.length !== saved.length) saveWishlist(clean);
}


/* ---------- cart ---------- */

function getCart() {
    return readList("luneviaCart");
}

function saveCart(cart) {
    return writeList("luneviaCart", cart);
}

function updateCartCount() {
    const totalItems = getCart().reduce((total, item) => total + (Number(item.quantity) || 0), 0);

    document.querySelectorAll(".cart-count").forEach((element) => {
        element.textContent = totalItems;
    });
}

// removes products that no longer exist or are sold out, and fixes bad quantities
function sanitizeCart() {
    if (typeof getProductById !== "function") return;

    const saved = readList("luneviaCart");
    const clean = [];

    saved.forEach((item) => {
        const id = Number(item && item.id);
        const product = getProductById(id);
        if (!product || product.stock <= 0) return;

        const quantity = Math.min(Math.max(Math.floor(Number(item.quantity)) || 1, 1), product.stock);
        const existing = clean.find((cartItem) => cartItem.id === id);

        if (existing) {
            existing.quantity = Math.min(existing.quantity + quantity, product.stock);
        } else {
            clean.push({ id: id, quantity: quantity });
        }
    });

    if (JSON.stringify(clean) !== JSON.stringify(saved)) saveCart(clean);
}

// returns { ok, added, reason } so the page can show the right message
function addToCart(productId, quantity = 1) {
    const id = Number(productId);
    const wanted = Math.max(1, Math.floor(Number(quantity)) || 1);
    const product = typeof getProductById === "function" ? getProductById(id) : null;

    if (typeof getProductById === "function" && !product) {
        return { ok: false, added: 0, reason: "missing" };
    }

    const maxQuantity = product ? product.stock : Infinity;
    if (maxQuantity <= 0) return { ok: false, added: 0, reason: "out-of-stock" };

    const cart = getCart();
    const existingItem = cart.find((item) => item.id === id);
    const current = existingItem ? Number(existingItem.quantity) || 0 : 0;

    if (current >= maxQuantity) return { ok: false, added: 0, reason: "max" };

    const newQuantity = Math.min(current + wanted, maxQuantity);

    if (existingItem) {
        existingItem.quantity = newQuantity;
    } else {
        cart.push({ id: id, quantity: newQuantity });
    }

    if (!saveCart(cart)) return { ok: false, added: 0, reason: "storage" };

    updateCartCount();

    return {
        ok: true,
        added: newQuantity - current,
        reason: newQuantity - current < wanted ? "limited" : "added"
    };
}

function getAddToCartMessage(result) {
    switch (result.reason) {
        case "max": return "You already have all available stock of this item in your bag.";
        case "out-of-stock": return "Sorry, this item is out of stock.";
        case "missing": return "This product is no longer available.";
        case "storage": return "Could not save your bag. Please allow site storage in your browser.";
        case "limited": return "Added. That is all we have in stock.";
        default: return "Added to your bag.";
    }
}


/* ---------- clicks on product cards (works for cards added by JavaScript) ---------- */

document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-to-cart]");

    if (addButton) {
        if (addButton.disabled) return;

        const result = addToCart(addButton.dataset.addToCart, 1);

        if (result.ok) {
            flashButton(addButton, "Added ✓");
            showToast(getAddToCartMessage(result));
        } else {
            showToast(getAddToCartMessage(result), "error");
        }
        return;
    }

    const wishlistButton = event.target.closest(".product-wishlist[data-product-id]");

    if (wishlistButton) {
        const isSaved = toggleWishlistItem(wishlistButton.dataset.productId);
        showToast(isSaved ? "Saved to your wishlist." : "Removed from your wishlist.");
    }
});

document.addEventListener("lv:wishlist-updated", () => {
    updateWishlistCount();
    updateWishlistButtons();
});


/* ---------- newsletter ---------- */

function initNewsletter() {
    const form = document.getElementById("newsletterForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const emailInput = document.getElementById("newsletterEmail");
        if (!emailInput) return;

        const honeypot = form.querySelector('[name="bot-field"]');
        if (honeypot && honeypot.value) return; // a bot filled the hidden field

        const email = emailInput.value.trim().toLowerCase();

        if (!isValidEmail(email)) {
            emailInput.setAttribute("aria-invalid", "true");
            showFormStatus(form, "Please enter a valid email address, like name@example.com.", "error");
            emailInput.focus();
            return;
        }

        emailInput.removeAttribute("aria-invalid");
        showFormStatus(form, "");

        await runFormSubmit(form, "Submitting…", async () => {
            try {
                if (IS_DEMO_MODE) {
                    if (!saveDemoSubscriber(email)) throw new Error("storage");
                    showFormStatus(form, "Demo mode: nothing was sent and no subscription was created. Your address was saved in this browser only.", "info");
                } else {
                    await sendToFormEndpoint("newsletter", { email: email });
                    showFormStatus(form, "Thank you. You are subscribed.", "success");
                }

                form.reset();
            } catch (error) {
                console.error("Newsletter submission failed:", error);
                showFormStatus(form, "We could not submit your subscription. Please try again later.", "error");
            }
        });
    });
}

/* ---------- contact form (contact.html) ---------- */

function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const fields = ["contactName", "contactEmail", "contactSubject", "contactMessage"];

    // clear a field's message as soon as the visitor edits it
    form.addEventListener("input", (event) => {
        if (fields.includes(event.target.id)) setFieldError(event.target.id, "");
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const honeypot = form.querySelector('[name="bot-field"]');
        if (honeypot && honeypot.value) return; // a bot filled the hidden field

        const values = {
            name: document.getElementById("contactName").value.trim(),
            email: document.getElementById("contactEmail").value.trim().toLowerCase(),
            subject: document.getElementById("contactSubject").value.trim(),
            message: document.getElementById("contactMessage").value.trim()
        };

        const problems = [
            ["contactName", values.name ? "" : "Enter your name."],
            ["contactEmail", isValidEmail(values.email) ? "" : "Enter a valid email address, like name@example.com."],
            ["contactSubject", values.subject ? "" : "Enter a subject."],
            ["contactMessage", values.message ? "" : "Write your message."]
        ];

        problems.forEach(([id, message]) => setFieldError(id, message));
        showFormStatus(form, "");

        const firstProblem = problems.find(([, message]) => message);
        if (firstProblem) {
            document.getElementById(firstProblem[0]).focus();
            return;
        }

        await runFormSubmit(form, "Sending…", async () => {
            try {
                if (IS_DEMO_MODE) {
                    if (!saveDemoMessage(values)) throw new Error("storage");
                    showFormStatus(form, "Demo mode: your message was not sent to anyone. It was saved in this browser only.", "info");
                } else {
                    await sendToFormEndpoint("contact", values);
                    showFormStatus(form, "Thank you. Your message has been sent.", "success");
                }

                form.reset();
            } catch (error) {
                console.error("Contact form submission failed:", error);
                showFormStatus(form, "We could not send your message. Please try again later.", "error");
            }
        });
    });
}

/* ---------- active link in the navbar ---------- */

function getPageName(path) {
    const name = path.split("/").pop().replace(".html", "");
    return name === "" ? "index" : name;
}

// marks the link that matches the page (and category) you are on
function highlightActiveNav() {
    const links = document.querySelectorAll("#mainNavbar .nav-link");
    let currentPage = getPageName(window.location.pathname);
    let currentCategory = new URLSearchParams(window.location.search).get("category");

    // a product page belongs to the Shop
    if (currentPage === "product") {
        currentPage = "shop";
        currentCategory = null;
    }

    links.forEach((link) => {
        const url = new URL(link.getAttribute("href"), window.location.href);
        const linkPage = getPageName(url.pathname);
        const linkCategory = url.searchParams.get("category");
        const isActive = linkPage === currentPage && linkCategory === currentCategory;

        link.classList.toggle("active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}


/* ---------- broken images ---------- */

// if a photo fails to load, show the Lunévia placeholder instead
document.addEventListener("error", (event) => {
    const image = event.target;

    if (!image || image.tagName !== "IMG") return;
    if (image.dataset.fallbackApplied === "true") return;
    if (typeof PLACEHOLDER_IMAGE === "undefined") return;

    image.dataset.fallbackApplied = "true";
    image.src = PLACEHOLDER_IMAGE;
}, true);


/* ---------- keep tabs and the back button in sync ---------- */

window.addEventListener("storage", (event) => {
    if (event.key === null || event.key === "luneviaCart") {
        updateCartCount();
        document.dispatchEvent(new CustomEvent("lv:cart-updated"));
    }

    if (event.key === null || event.key === "luneviaWishlist") {
        document.dispatchEvent(new CustomEvent("lv:wishlist-updated"));
    }
});

window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;

    updateCartCount();
    updateWishlistCount();
    updateWishlistButtons();
    document.dispatchEvent(new CustomEvent("lv:cart-updated"));
});


/* ---------- store settings (changed in the demo admin panel) ---------- */

// text like "free shipping over <lv-amount data-amount="threshold">$75</lv-amount>" follows the admin settings
function applyStoreSettings() {
    if (typeof FREE_SHIPPING_THRESHOLD === "undefined") return;

    document.querySelectorAll("lv-amount").forEach((element) => {
        if (element.dataset.amount === "threshold") element.textContent = formatPriceShort(FREE_SHIPPING_THRESHOLD);
        if (element.dataset.amount === "fee") element.textContent = formatPriceShort(FLAT_SHIPPING_FEE);
    });
}


/* ---------- start ---------- */

applyStoreSettings();
applyDemoNotices();
initNavToggle();
sanitizeCart();
sanitizeWishlist();
initSearch();
initNewsletter();
initContactForm();
highlightActiveNav();
updateWishlistCount();
updateWishlistButtons();
updateCartCount();