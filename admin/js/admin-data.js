/* =========================================================
   LUNÉVIA ADMIN — DATA LAYER (js/admin-data.js)

   RULE: admin pages never read or write saved data directly.
   They only call the functions in THIS file.

   Today these functions use the browser's storage. When we build
   the backend, we change only this file so it talks to the server
   instead. The admin pages stay exactly the same.

   Needs ../js/main.js (readList, writeList) to be loaded first.
========================================================= */

// where each kind of data is saved
const ADMIN_KEYS = {
    products: "luneviaProducts",       // products added or changed in the admin (next step)
    orders: "luneviaOrders",           // written by checkout.js
    users: "luneviaUsers",             // written by login.html (customers)
    messages: "luneviaMessages",       // contact messages submitted in this browser demo
    subscribers: "luneviaSubscribers", // newsletter emails submitted in this browser demo
    settings: "luneviaSettings",       // store rules (later step)
    account: "luneviaAdminAccount",    // the admin email + scrambled password
    session: "luneviaAdminSession",    // who is signed in to the admin right now
    attempts: "luneviaAdminAttempts"   // failed sign-in counter (slows down guessing)
};


/* ---------- ready to use: reading what the store already saves ---------- */

// newest first
function getAdminOrders() {
    return readList(ADMIN_KEYS.orders).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getAdminOrder(orderNumber) {
    return readList(ADMIN_KEYS.orders).find((order) => order.number === orderNumber) || null;
}

// customers without their password data
function getAdminCustomers() {
    return readList(ADMIN_KEYS.users).map((user) => {
        const copy = Object.assign({}, user);
        delete copy.passwordHash;
        delete copy.passwordSalt;
        return copy;
    });
}

// newest first
function getAdminMessages() {
    return readList(ADMIN_KEYS.messages).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getAdminSubscribers() {
    return readList(ADMIN_KEYS.subscribers);
}


/* ---------- products ----------
   The shop reads its products from "luneviaProducts" (see ../js/products.js).
   The first time the admin saves a product, the sample products are copied
   there too, so nothing is lost.
---------------------------------------------------------- */

const ADMIN_BADGES = ["", "New", "Sale", "Bestseller"];

// a fresh copy of the catalog: saved products, or the sample products if nothing was saved yet
function getAdminProducts() {
    return loadCatalog();
}

function getAdminProduct(id) {
    return getAdminProducts().find((product) => product.id === Number(id)) || null;
}

// checks a product form. Returns { product } when fine, or { field, error } to show.
function validateAdminProduct(input) {
    const name = String(input.name || "").trim();
    const description = String(input.description || "").trim();
    const image = String(input.image || "").trim();
    const price = Number(input.price);
    const stock = Number(input.stock);
    const hasOldPrice = !(input.oldPrice === "" || input.oldPrice === null || input.oldPrice === undefined);
    const oldPrice = hasOldPrice ? Number(input.oldPrice) : null;

    if (name.length < 2) return { field: "name", error: "Enter the product name." };
    if (!PRODUCT_CATEGORIES.includes(input.category)) return { field: "category", error: "Choose a category." };
    if (input.price === "" || !Number.isFinite(price) || price <= 0) return { field: "price", error: "Enter a price greater than 0." };

    if (hasOldPrice && (!Number.isFinite(oldPrice) || oldPrice <= price)) {
        return { field: "oldPrice", error: "The old price must be higher than the price. Leave it empty if there is no sale." };
    }

    if (input.stock === "" || !Number.isInteger(stock) || stock < 0) {
        return { field: "stock", error: "Enter the stock as a whole number (0 or more)." };
    }

    if (!ADMIN_BADGES.includes(String(input.badge || ""))) return { field: "badge", error: "Choose a badge from the list." };
    if (description.length < 10) return { field: "description", error: "Write a description of at least 10 characters." };
    if (!image) return { field: "image", error: "Add a photo: upload one or paste a link." };

    if (!/^(https?:\/\/|assets\/|\.\/|\/|data:image\/)/i.test(image)) {
        return { field: "image", error: "The photo link must start with https:// (or upload a photo instead)." };
    }

    return {
        product: {
            name: name,
            category: input.category,
            price: Math.round(price * 100) / 100,
            oldPrice: hasOldPrice ? Math.round(oldPrice * 100) / 100 : null,
            stock: stock,
            badge: input.badge ? String(input.badge) : null,
            featured: Boolean(input.featured),
            shortDescription: String(input.shortDescription || "").trim().slice(0, 80) || description.slice(0, 70),
            description: description,
            image: image
        }
    };
}

const PRODUCT_SAVE_FAILED = "Could not save. The browser storage may be full. Try a smaller photo or paste a photo link.";

// adds a new product (no id) or updates an existing one (with id)
function saveAdminProduct(input) {
    const checked = validateAdminProduct(input);
    if (!checked.product) return { ok: false, field: checked.field, error: checked.error };

    const list = getAdminProducts();
    const existing = input.id ? list.find((product) => product.id === Number(input.id)) : null;
    let saved;

    if (existing) {
        saved = Object.assign({}, existing, checked.product, { images: [checked.product.image] });
        list[list.indexOf(existing)] = saved;
    } else {
        const newId = list.reduce((max, product) => Math.max(max, product.id), 0) + 1;
        saved = Object.assign({ id: newId, rating: 0, reviewCount: 0 }, checked.product, { images: [checked.product.image] });
        list.push(saved);
    }

    if (!writeList(ADMIN_KEYS.products, list)) return { ok: false, error: PRODUCT_SAVE_FAILED };

    return { ok: true, product: saved };
}

function deleteAdminProduct(id) {
    const list = getAdminProducts().filter((product) => product.id !== Number(id));
    return writeList(ADMIN_KEYS.products, list) ? { ok: true } : { ok: false, error: PRODUCT_SAVE_FAILED };
}

// back to the built-in sample products
function restoreSampleProducts() {
    try {
        localStorage.removeItem(ADMIN_KEYS.products);
        return { ok: true };
    } catch (error) {
        return { ok: false, error: "Could not restore the sample products." };
    }
}


/* ---------- orders ---------- */

const ADMIN_ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

function updateAdminOrderStatus(orderNumber, status) {
    if (!ADMIN_ORDER_STATUSES.includes(status)) return { ok: false, error: "Unknown status." };

    const orders = readList(ADMIN_KEYS.orders);
    const order = orders.find((item) => item.number === orderNumber);

    if (!order) return { ok: false, error: "Order not found." };

    order.status = status;
    order.updatedAt = new Date().toISOString();

    return writeList(ADMIN_KEYS.orders, orders)
        ? { ok: true, order: order }
        : { ok: false, error: STORAGE_BLOCKED_MESSAGE };
}


function getAdminOrderCustomerName(order) {
    const customer = order.customer || {};
    return `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Guest";
}

function getAdminOrderItemCount(order) {
    return (order.items || []).reduce((total, item) => total + (Number(item.quantity) || 0), 0);
}


/* ---------- messages, subscribers, customers ---------- */

function markAdminMessageRead(id, isRead) {
    const messages = readList(ADMIN_KEYS.messages);
    const message = messages.find((item) => item.id === id);
    if (!message) return false;

    message.read = Boolean(isRead);
    return writeList(ADMIN_KEYS.messages, messages);
}

function deleteAdminMessage(id) {
    return writeList(ADMIN_KEYS.messages, readList(ADMIN_KEYS.messages).filter((item) => item.id !== id));
}

function deleteAdminSubscriber(email) {
    return writeList(ADMIN_KEYS.subscribers, readList(ADMIN_KEYS.subscribers).filter((item) => item !== email));
}

// removes the account only. Their past orders stay in the order list.
function deleteAdminCustomer(email) {
    return writeList(ADMIN_KEYS.users, readList(ADMIN_KEYS.users).filter((user) => user.email !== email));
}


/* ---------- settings ---------- */

// the shipping rules in use (admin changes, or the defaults from products.js)
function getAdminSettings() {
    const saved = loadStoreSettings();

    return {
        freeShippingThreshold: numberOrDefault(saved.freeShippingThreshold, 75, 0),
        flatShippingFee: numberOrDefault(saved.flatShippingFee, 5, 0)
    };
}

function saveAdminSettings(input) {
    const threshold = Number(input.freeShippingThreshold);
    const fee = Number(input.flatShippingFee);

    if (input.freeShippingThreshold === "" || !Number.isFinite(threshold) || threshold < 0 || threshold > 100000) {
        return { ok: false, field: "freeShippingThreshold", error: "Enter the free-shipping amount (0 or more)." };
    }

    if (input.flatShippingFee === "" || !Number.isFinite(fee) || fee < 0 || fee > 100000) {
        return { ok: false, field: "flatShippingFee", error: "Enter the shipping fee (0 or more)." };
    }

    const settings = Object.assign({}, loadStoreSettings(), {
        freeShippingThreshold: Math.round(threshold * 100) / 100,
        flatShippingFee: Math.round(fee * 100) / 100
    });

    return writeList(ADMIN_KEYS.settings, settings)
        ? { ok: true, settings: settings }
        : { ok: false, error: STORAGE_BLOCKED_MESSAGE };
}


/* ---------- backup & storage ---------- */

// everything the store has saved (without any passwords)
function getAdminExportData() {
    return {
        exportedAt: new Date().toISOString(),
        products: getAdminProducts(),
        orders: readList(ADMIN_KEYS.orders),
        customers: getAdminCustomers(),
        messages: readList(ADMIN_KEYS.messages),
        subscribers: readList(ADMIN_KEYS.subscribers),
        settings: getAdminSettings()
    };
}

// browsers allow about 5 MB per site
function getAdminStorageUsage() {
    let characters = 0;

    try {
        for (let index = 0; index < localStorage.length; index++) {
            const key = localStorage.key(index);
            characters += key.length + String(localStorage.getItem(key)).length;
        }
    } catch (error) {
        // unknown
    }

    const usedBytes = characters * 2;
    const limitBytes = 5 * 1024 * 1024;

    return { usedBytes: usedBytes, limitBytes: limitBytes, percent: Math.min(100, Math.round((usedBytes / limitBytes) * 100)) };
}


/* ---------- admin sign-in ----------

   The admin email and password are chosen the first time someone opens
   the login page. The password is never saved as plain text, only as a
   salted PBKDF2 hash (hashPassword comes from ../js/store.js).

   IMPORTANT: in this browser-only version the sign-in is a convenience
   gate, not real security. Anyone who can use DevTools in this browser can
   get around it. Real protection arrives with the backend, where the
   server checks the password and keeps the data.
---------------------------------------------------------- */

const ADMIN_SESSION_HOURS = 8;
const ADMIN_MAX_ATTEMPTS = 5;
const ADMIN_LOCK_SECONDS = 60;

function getAdminAccount() {
    try {
        const account = JSON.parse(localStorage.getItem(ADMIN_KEYS.account));
        return account && account.email && account.passwordHash && account.passwordSalt ? account : null;
    } catch (error) {
        return null;
    }
}

function hasAdminAccount() {
    return getAdminAccount() !== null;
}

function startAdminSession(email) {
    try {
        const expires = Date.now() + ADMIN_SESSION_HOURS * 60 * 60 * 1000;
        localStorage.setItem(ADMIN_KEYS.session, JSON.stringify({ email: email, expires: expires }));
    } catch (error) {
        // the admin will simply have to sign in again
    }
}

// true only if the session is valid, not expired, and belongs to the admin account
function isAdminLoggedIn() {
    try {
        const session = JSON.parse(localStorage.getItem(ADMIN_KEYS.session));
        const account = getAdminAccount();
        return Boolean(session && account && session.email === account.email && session.expires > Date.now());
    } catch (error) {
        return false;
    }
}

function getAdminEmail() {
    return isAdminLoggedIn() ? getAdminAccount().email : null;
}

function logoutAdmin() {
    try {
        localStorage.removeItem(ADMIN_KEYS.session);
    } catch (error) {
        // nothing to do
    }
}

// first-time setup: only works while no admin account exists
async function setupAdmin(emailInput, password) {
    if (hasAdminAccount()) return { ok: false, error: "An admin account already exists. Please sign in." };

    const email = normalizeEmail(emailInput);

    if (!isValidEmail(email)) return { ok: false, error: "Enter a valid email address." };
    if (String(password || "").length < 10) return { ok: false, error: "Your password must be at least 10 characters." };

    let secret;

    try {
        secret = await hashPassword(String(password));
    } catch (error) {
        return { ok: false, error: SECURE_CONTEXT_MESSAGE };
    }

    const account = {
        email: email,
        passwordHash: secret.hash,
        passwordSalt: secret.salt,
        createdAt: new Date().toISOString()
    };

    try {
        localStorage.setItem(ADMIN_KEYS.account, JSON.stringify(account));
    } catch (error) {
        return { ok: false, error: STORAGE_BLOCKED_MESSAGE };
    }

    startAdminSession(email);
    return { ok: true };
}

// seconds left before another sign-in attempt is allowed (0 = allowed now)
function getAdminLockSeconds() {
    try {
        const attempts = JSON.parse(localStorage.getItem(ADMIN_KEYS.attempts));
        if (attempts && attempts.lockedUntil > Date.now()) {
            return Math.ceil((attempts.lockedUntil - Date.now()) / 1000);
        }
    } catch (error) {
        // broken data counts as not locked
    }

    return 0;
}

function recordAdminFailure() {
    let attempts = { count: 0, lockedUntil: 0 };

    try {
        attempts = JSON.parse(localStorage.getItem(ADMIN_KEYS.attempts)) || attempts;
    } catch (error) {
        // start counting again
    }

    // an old lock that has finished starts a fresh count
    if (attempts.lockedUntil && attempts.lockedUntil <= Date.now()) {
        attempts = { count: 0, lockedUntil: 0 };
    }

    attempts.count = (attempts.count || 0) + 1;

    if (attempts.count >= ADMIN_MAX_ATTEMPTS) {
        attempts.lockedUntil = Date.now() + ADMIN_LOCK_SECONDS * 1000;
        attempts.count = 0;
    }

    try {
        localStorage.setItem(ADMIN_KEYS.attempts, JSON.stringify(attempts));
    } catch (error) {
        // nothing to do
    }
}

function clearAdminFailures() {
    try {
        localStorage.removeItem(ADMIN_KEYS.attempts);
    } catch (error) {
        // nothing to do
    }
}

async function loginAdmin(emailInput, password) {
    const waitSeconds = getAdminLockSeconds();

    if (waitSeconds > 0) {
        return { ok: false, error: `Too many attempts. Try again in ${waitSeconds} seconds.` };
    }

    const account = getAdminAccount();
    if (!account) return { ok: false, error: "No admin account exists yet." };

    const email = normalizeEmail(emailInput);
    let matches = false;

    try {
        // the password is always checked, so a wrong email takes the same time as a wrong password
        const attempt = await hashPassword(String(password || ""), account.passwordSalt);
        matches = email === account.email && attempt.hash === account.passwordHash;
    } catch (error) {
        return { ok: false, error: SECURE_CONTEXT_MESSAGE };
    }

    if (!matches) {
        recordAdminFailure();

        const lockedFor = getAdminLockSeconds();

        return lockedFor > 0
            ? { ok: false, error: `Too many attempts. Try again in ${lockedFor} seconds.` }
            : { ok: false, error: "Incorrect email or password." };
    }

    clearAdminFailures();
    startAdminSession(email);
    return { ok: true };
}


async function changeAdminPassword(currentPassword, newPassword) {
    const account = getAdminAccount();
    if (!account) return { ok: false, error: "Please sign in again." };

    if (String(newPassword || "").length < 10) {
        return { ok: false, error: "Your new password must be at least 10 characters." };
    }

    try {
        const check = await hashPassword(String(currentPassword || ""), account.passwordSalt);
        if (check.hash !== account.passwordHash) return { ok: false, error: "Your current password is not correct." };

        const secret = await hashPassword(String(newPassword));
        account.passwordHash = secret.hash;
        account.passwordSalt = secret.salt;
    } catch (error) {
        return { ok: false, error: SECURE_CONTEXT_MESSAGE };
    }

    try {
        localStorage.setItem(ADMIN_KEYS.account, JSON.stringify(account));
    } catch (error) {
        return { ok: false, error: STORAGE_BLOCKED_MESSAGE };
    }

    return { ok: true };
}