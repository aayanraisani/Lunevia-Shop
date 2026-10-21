/* =========================================================
   LUNÉVIA — ACCOUNTS & ORDERS (store.js)
   Load after products.js and main.js.

   IMPORTANT: accounts and orders live in this browser only
   (localStorage). That is fine for a demo, but real customers
   need a server-side backend that checks passwords, stores
   accounts and orders in a database, and sends emails. No
   backend is included in this template.
========================================================= */


/* ---------- small helpers ---------- */

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

function getCountryName(code) {
    const names = {
        PK: "Pakistan",
        US: "United States",
        GB: "United Kingdom",
        UK: "United Kingdom",
        CA: "Canada",
        AE: "United Arab Emirates",
        OTHER: "Other"
    };

    return names[code] || code || "";
}

function formatOrderDate(isoDate) {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function bytesToBase64(bytes) {
    let text = "";
    bytes.forEach((byte) => { text += String.fromCharCode(byte); });
    return btoa(text);
}

function base64ToBytes(base64) {
    return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}


/* ---------- password hashing ---------- */

// passwords are never saved as plain text: we save a salted PBKDF2 hash
async function hashPassword(password, saltBase64) {
    if (!window.crypto || !window.crypto.subtle) {
        throw new Error("secure-context");
    }

    const salt = saltBase64 ? base64ToBytes(saltBase64) : window.crypto.getRandomValues(new Uint8Array(16));
    const key = await window.crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await window.crypto.subtle.deriveBits(
        { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
        key,
        256
    );

    return { hash: bytesToBase64(new Uint8Array(bits)), salt: bytesToBase64(salt) };
}

const SECURE_CONTEXT_MESSAGE = "Accounts need a secure page. Open the site with Live Server (or https) and try again.";
const STORAGE_BLOCKED_MESSAGE = "Could not save your details. Please allow site storage in your browser.";


/* ---------- users & session ---------- */

function getUsers() {
    return readList("luneviaUsers");
}

// the customer's details without the password data
function toPublicUser(user) {
    const copy = Object.assign({}, user);
    delete copy.passwordHash;
    delete copy.passwordSalt;
    return copy;
}

function startSession(email) {
    try {
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        localStorage.setItem("luneviaSession", JSON.stringify({ email: email, expires: Date.now() + thirtyDays }));
    } catch (error) {
        // the customer will simply have to sign in again
    }
}

function getSessionEmail() {
    try {
        const session = JSON.parse(localStorage.getItem("luneviaSession"));
        if (session && session.email && session.expires > Date.now()) return session.email;
    } catch (error) {
        // broken data counts as signed out
    }

    return null;
}

// returns the signed-in customer, or null
function getCurrentUser() {
    const email = getSessionEmail();
    if (!email) return null;

    const user = getUsers().find((item) => item.email === email);
    return user ? toPublicUser(user) : null;
}

function logoutUser() {
    try {
        localStorage.removeItem("luneviaSession");
    } catch (error) {
        // nothing to do
    }
}

// sends signed-out visitors to the login page, and brings them back afterwards
function requireLogin() {
    const user = getCurrentUser();

    if (!user) {
        const page = window.location.pathname.split("/").pop() || "account.html";
        window.location.replace(`login.html?redirect=${encodeURIComponent(page)}`);
        return null;
    }

    return user;
}

async function registerUser(data) {
    const name = String(data.name || "").trim();
    const email = normalizeEmail(data.email);
    const password = String(data.password || "");

    if (name.length < 2) return { ok: false, error: "Enter your full name." };
    if (!isValidEmail(email)) return { ok: false, error: "Enter a valid email address." };
    if (password.length < 8) return { ok: false, error: "Your password must be at least 8 characters." };

    const users = getUsers();

    if (users.some((user) => user.email === email)) {
        return { ok: false, error: "An account with this email already exists. Try signing in instead." };
    }

    let secret;

    try {
        secret = await hashPassword(password);
    } catch (error) {
        return { ok: false, error: SECURE_CONTEXT_MESSAGE };
    }

    const user = {
        id: Date.now(),
        name: name,
        email: email,
        phone: String(data.phone || "").trim(),
        address: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        passwordHash: secret.hash,
        passwordSalt: secret.salt,
        createdAt: new Date().toISOString()
    };

    users.push(user);

    if (!writeList("luneviaUsers", users)) return { ok: false, error: STORAGE_BLOCKED_MESSAGE };

    startSession(email);
    return { ok: true, user: toPublicUser(user) };
}

async function loginUser(emailInput, password) {
    const email = normalizeEmail(emailInput);
    const user = getUsers().find((item) => item.email === email);
    const wrongDetails = { ok: false, error: "Incorrect email or password." };

    if (!user) return wrongDetails;

    try {
        const attempt = await hashPassword(String(password || ""), user.passwordSalt);
        if (attempt.hash !== user.passwordHash) return wrongDetails;
    } catch (error) {
        return { ok: false, error: SECURE_CONTEXT_MESSAGE };
    }

    startSession(email);
    return { ok: true, user: toPublicUser(user) };
}

function updateUserProfile(fields) {
    const email = getSessionEmail();
    const users = getUsers();
    const user = users.find((item) => item.email === email);

    if (!user) return { ok: false, error: "Please sign in again." };

    const name = String(fields.name || "").trim();
    if (name.length < 2) return { ok: false, error: "Enter your full name." };

    user.name = name;

    ["phone", "address", "city", "state", "zip", "country"].forEach((key) => {
        user[key] = String(fields[key] || "").trim();
    });

    if (!writeList("luneviaUsers", users)) return { ok: false, error: STORAGE_BLOCKED_MESSAGE };

    return { ok: true, user: toPublicUser(user) };
}

async function changeUserPassword(currentPassword, newPassword) {
    const email = getSessionEmail();
    const users = getUsers();
    const user = users.find((item) => item.email === email);

    if (!user) return { ok: false, error: "Please sign in again." };
    if (String(newPassword || "").length < 8) return { ok: false, error: "Your new password must be at least 8 characters." };

    try {
        const check = await hashPassword(String(currentPassword || ""), user.passwordSalt);
        if (check.hash !== user.passwordHash) return { ok: false, error: "Your current password is not correct." };

        const secret = await hashPassword(String(newPassword));
        user.passwordHash = secret.hash;
        user.passwordSalt = secret.salt;
    } catch (error) {
        return { ok: false, error: SECURE_CONTEXT_MESSAGE };
    }

    if (!writeList("luneviaUsers", users)) return { ok: false, error: STORAGE_BLOCKED_MESSAGE };

    return { ok: true };
}


/* ---------- orders ---------- */

const ORDER_STEPS = ["pending", "processing", "shipped", "delivered"];

function getAllOrders() {
    return readList("luneviaOrders");
}

// newest first
function getOrdersForEmail(email) {
    const target = normalizeEmail(email);

    return getAllOrders()
        .filter((order) => order.customer && normalizeEmail(order.customer.email) === target)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function findOrderByNumber(number) {
    const wanted = String(number || "").trim().toUpperCase().replace(/^#/, "");
    return getAllOrders().find((order) => String(order.number).toUpperCase() === wanted) || null;
}

function getStatusLabel(status) {
    const labels = {
        pending: "Order received",
        processing: "Being prepared",
        shipped: "Shipped",
        delivered: "Delivered",
        cancelled: "Cancelled"
    };

    return labels[status] || "Order received";
}

function buildStatusBadge(status) {
    const safeStatus = ORDER_STEPS.includes(status) || status === "cancelled" ? status : "pending";
    return `<span class="status-badge status-${safeStatus}">${escapeHtml(getStatusLabel(safeStatus))}</span>`;
}

function buildStatusTimeline(status) {
    if (status === "cancelled") {
        return '<p class="form-alert error">This order was cancelled. Please contact us if you have any questions.</p>';
    }

    const currentIndex = Math.max(0, ORDER_STEPS.indexOf(status));

    const steps = ORDER_STEPS.map((step, index) => {
        const stateClass = index < currentIndex ? "done" : index === currentIndex ? "current" : "";
        const current = index === currentIndex ? ' aria-current="step"' : "";
        return `<li class="${stateClass}"${current}>${escapeHtml(getStatusLabel(step))}</li>`;
    }).join("");

    return `<ol class="order-timeline" aria-label="Order progress">${steps}</ol>`;
}

// orders keep a short photo link only; big uploaded photos are looked up in the catalog
function getOrderItemImage(item) {
    if (item.image) return item.image;

    const product = typeof getProductById === "function" ? getProductById(item.id) : null;
    if (product && product.image) return product.image;

    return typeof PLACEHOLDER_IMAGE !== "undefined" ? PLACEHOLDER_IMAGE : "";
}

function buildOrderLinesHtml(order) {
    const lines = (order.items || []).map((item) => `
        <li class="order-line">
            <div class="order-line-image"><img src="${escapeHtml(resizeImageUrl(getOrderItemImage(item), 200))}" width="64" height="80" alt="${escapeHtml(item.name)}" loading="lazy"></div>
            <div class="order-line-info">
                <strong>${escapeHtml(item.name)}</strong>
                <span>Qty ${Number(item.quantity) || 1} × ${formatPrice(item.price)}</span>
            </div>
            <div class="order-line-price">${formatPrice(item.price * item.quantity)}</div>
        </li>
    `).join("");

    return `<ul class="order-lines">${lines}</ul>`;
}

function buildOrderTotalsHtml(order) {
    return `
        <div class="order-totals">
            <div class="summary-row"><span>Subtotal</span><span>${formatPrice(order.subtotal)}</span></div>
            <div class="summary-row"><span>Shipping</span><span>${order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span></div>
            <div class="summary-row summary-total"><span>Total</span><span>${formatPrice(order.total)}</span></div>
        </div>
    `;
}

function buildOrderAddressHtml(order) {
    const customer = order.customer || {};

    const lines = [
        `<strong>${escapeHtml(`${customer.firstName || ""} ${customer.lastName || ""}`.trim())}</strong>`,
        escapeHtml(customer.address),
        escapeHtml([customer.city, customer.state, customer.zip].filter(Boolean).join(", ")),
        escapeHtml(getCountryName(customer.country)),
        escapeHtml(customer.phone)
    ].filter(Boolean);

    return `<p class="order-address">${lines.join("<br>")}</p>`;
}

function getPaymentLabel(order) {
    return order.payment === "cod" ? "Cash on delivery" : "Card";
}