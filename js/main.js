/* =========================================================
   LUNÉVIA — MAIN JAVASCRIPT (loaded on every page)
   Needs products.js to be loaded first.
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




/* ---------- local demo-form submission helper ---------- */

/*
 * This project is a static front-end demo deployed on Vercel.
 * Without a backend or form provider, submissions can only be stored in the
 * current browser. The admin demo reads these same localStorage records.
 */
async function submitDemoForm(form) {
    if (!(form instanceof HTMLFormElement)) throw new Error("Form was not found.");

    const formName = String(form.getAttribute("name") || "").trim();
    const formData = new FormData(form);

    if (formName === "contact") {
        const message = {
            id: Date.now(),
            name: String(formData.get("name") || "").trim(),
            email: String(formData.get("email") || "").trim().toLowerCase(),
            subject: String(formData.get("subject") || "").trim(),
            message: String(formData.get("message") || "").trim(),
            date: new Date().toISOString(),
            read: false
        };

        if (!message.name || !isValidEmail(message.email) || !message.subject || !message.message) {
            throw new Error("Please complete all contact fields with valid details.");
        }

        const messages = readList("luneviaMessages");
        while (messages.some((item) => Number(item.id) === message.id)) message.id += 1;
        messages.unshift(message);

        if (!writeList("luneviaMessages", messages)) {
            throw new Error("Browser storage is unavailable. The message was not saved.");
        }

        return { ok: true, duplicate: false };
    }

    if (formName === "newsletter") {
        const email = String(formData.get("email") || "").trim().toLowerCase();
        if (!isValidEmail(email)) throw new Error("Please enter a valid email address.");

        const subscribers = readList("luneviaSubscribers");
        if (subscribers.includes(email)) return { ok: true, duplicate: true };
        subscribers.push(email);

        if (!writeList("luneviaSubscribers", subscribers)) {
            throw new Error("Browser storage is unavailable. The subscription was not saved.");
        }

        return { ok: true, duplicate: false };
    }

    throw new Error("This form is not supported by the local demo handler.");
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


/* ---------- search overlay ---------- */

function openSearch() {
    const overlay = document.getElementById("searchOverlay");
    if (!overlay) return;

    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    setTimeout(() => {
        const input = document.getElementById("searchInput");
        if (input) input.focus();
    }, 300);
}

function closeSearch() {
    const overlay = document.getElementById("searchOverlay");
    if (!overlay || !overlay.classList.contains("active")) return;

    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    const button = document.getElementById("searchButton");
    if (button) button.focus();
}

function initSearch() {
    const button = document.getElementById("searchButton");
    const closeButton = document.getElementById("searchClose");
    const input = document.getElementById("searchInput");

    if (button) button.addEventListener("click", openSearch);
    if (closeButton) closeButton.addEventListener("click", closeSearch);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeSearch();
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
        if (form.dataset.submitting === "true") return;

        const emailInput = document.getElementById("newsletterEmail");
        if (!emailInput) return;

        const email = emailInput.value.trim().toLowerCase();
        if (!isValidEmail(email)) {
            showToast("Please enter a valid email address.", "error");
            emailInput.focus();
            return;
        }

        const button = form.querySelector('button[type="submit"]');
        const originalText = button ? button.innerHTML : "";
        form.dataset.submitting = "true";
        if (button) {
            button.disabled = true;
            button.textContent = "Submitting…";
        }
        emailInput.value = email;

        try {
            const result = await submitDemoForm(form);
            showToast(result.duplicate ? "This email is already saved in the local demo list." : "Demo subscription saved in this browser only.", result.duplicate ? "error" : "success");
            form.reset();
        } catch (error) {
            console.error("Newsletter submission failed:", error);
            showToast("We couldn't submit your subscription. Please try again later.", "error");
        } finally {
            form.dataset.submitting = "false";
            if (button) {
                button.disabled = false;
                button.innerHTML = originalText;
            }
        }
    });
}

/* ---------- contact form (contact.html) ---------- */

function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (form.dataset.submitting === "true") return;

        const nameInput = document.getElementById("contactName");
        const emailInput = document.getElementById("contactEmail");
        const subjectInput = document.getElementById("contactSubject");
        const messageInput = document.getElementById("contactMessage");
        if (!nameInput || !emailInput || !subjectInput || !messageInput) return;

        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const subject = subjectInput.value.trim();
        const message = messageInput.value.trim();

        if (!name || !subject || !message) {
            showToast("Please fill in every field.", "error");
            return;
        }
        if (!isValidEmail(email)) {
            showToast("Please enter a valid email address.", "error");
            emailInput.focus();
            return;
        }

        const button = form.querySelector('button[type="submit"]');
        const originalText = button ? button.innerHTML : "";
        form.dataset.submitting = "true";
        if (button) {
            button.disabled = true;
            button.textContent = "Sending…";
        }
        nameInput.value = name;
        emailInput.value = email;
        subjectInput.value = subject;
        messageInput.value = message;

        try {
            await submitDemoForm(form);
            showToast("Demo message saved in this browser only.");
            form.reset();
        } catch (error) {
            console.error("Contact form submission failed:", error);
            showToast("We couldn't submit your message. Please try again later.", "error");
        } finally {
            form.dataset.submitting = "false";
            if (button) {
                button.disabled = false;
                button.innerHTML = originalText;
            }
        }
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


/* ---------- store settings (changed in the admin panel) ---------- */

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
sanitizeCart();
sanitizeWishlist();
initSearch();
initNewsletter();
initContactForm();
highlightActiveNav();
updateWishlistCount();
updateWishlistButtons();
updateCartCount();