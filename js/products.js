/* =========================================================
   LUNÉVIA — PRODUCT CATALOG & SHARED HELPERS
   Load this file on EVERY page, after config.js and before main.js.
========================================================= */


/* ---------- store settings ---------- */

// Star ratings are hidden until they come from real customer reviews.
// The sample products below carry no ratings on purpose. When you have real
// reviews, add `rating` and `reviewCount` to each product and set this to true.
const SHOW_RATINGS = false;

// The admin panel (Settings page) can change the shipping rules. These are the defaults.
// Orders with a subtotal at or above FREE_SHIPPING_THRESHOLD ship free.
// Smaller orders pay FLAT_SHIPPING_FEE.
const SETTINGS_STORAGE_KEY = "luneviaSettings";
const PRODUCTS_STORAGE_KEY = "luneviaProducts";
const PRODUCT_CATEGORIES = ["skincare", "beauty", "jewelry", "accessories"];

function loadStoreSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY));
        return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
    } catch (error) {
        return {};
    }
}

// a number that is at least `min`, or the fallback when it is missing or wrong
function numberOrDefault(value, fallback, min) {
    if (value === undefined || value === null || value === "") return fallback;

    const number = Number(value);
    return Number.isFinite(number) && number >= min ? number : fallback;
}

const STORE_SETTINGS = loadStoreSettings();
const FREE_SHIPPING_THRESHOLD = numberOrDefault(STORE_SETTINGS.freeShippingThreshold, 75, 0);
const FLAT_SHIPPING_FEE = numberOrDefault(STORE_SETTINGS.flatShippingFee, 5, 0);

// Shown when a product photo fails to load.
const PLACEHOLDER_IMAGE =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">' +
        '<rect width="400" height="500" fill="#f2ede7"/>' +
        '<text x="200" y="255" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="#8d6d5b">Lunévia</text>' +
        "</svg>"
    );


/* ---------- sample products (the admin can add, change and delete products) ---------- */

const SEED_PRODUCTS = [

    { id: 1, name: "Glow Renewal Serum", category: "skincare", price: 38.00, oldPrice: null, badge: "New", image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=800&q=85", images: ["https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=1000&q=85"], description: "A lightweight, fast-absorbing serum formulated with bakuchiol and niacinamide to visibly renew skin's natural radiance overnight.", shortDescription: "Bakuchiol + niacinamide overnight glow serum.", stock: 42, featured: true },

    { id: 2, name: "Hydrogel Glass Skin Mask", category: "skincare", price: 24.00, oldPrice: 30.00, badge: "Sale", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=85", images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=85"], description: "An intensely hydrating hydrogel mask that delivers a smooth, dewy 'glass skin' finish in just 15 minutes.", shortDescription: "15-minute dewy glass-skin hydration.", stock: 65, featured: false },

    { id: 3, name: "Scalp Renewal Treatment", category: "skincare", price: 32.00, oldPrice: null, badge: "New", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=85", images: ["https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1000&q=85"], description: "A soothing scalp treatment infused with kojic acid and botanical extracts to balance and refresh the scalp.", shortDescription: "Kojic acid scalp balancing treatment.", stock: 30, featured: false },

    { id: 4, name: "Everyday Beauty Set", category: "beauty", price: 45.00, oldPrice: null, badge: null, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=85", images: ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=85"], description: "A curated five-piece beauty essentials set designed to simplify your everyday routine without sacrificing quality.", shortDescription: "Five-piece daily beauty essentials.", stock: 38, featured: true },

    { id: 5, name: "Collagen Beauty Powder", category: "beauty", price: 29.00, oldPrice: null, badge: "New", image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=85", images: ["https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1000&q=85"], description: "A hair, skin, and nails collagen blend that mixes seamlessly into your morning routine for a beauty boost from within.", shortDescription: "Hair, skin & nails collagen blend.", stock: 54, featured: false },

    { id: 6, name: "Matte Finish Lip Set", category: "beauty", price: 26.00, oldPrice: 32.00, badge: "Sale", image: "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&w=800&q=85", images: ["https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&w=1000&q=85"], description: "A trio of long-wearing matte lip colors formulated to feel weightless while delivering full, buildable pigment.", shortDescription: "Trio of long-wear weightless mattes.", stock: 47, featured: false },

    { id: 7, name: "Aurelia Necklace", category: "jewelry", price: 52.00, oldPrice: null, badge: "New", image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=800&q=85", images: ["https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1000&q=85"], description: "A delicate 18k gold-plated layering necklace with a hand-set pendant, designed to be worn alone or stacked.", shortDescription: "18k gold-plated layering necklace.", stock: 25, featured: true },

    { id: 8, name: "Stainless Steel Hoop Set", category: "jewelry", price: 34.00, oldPrice: null, badge: null, image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=85", images: ["https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1000&q=85"], description: "A waterproof, tarnish-resistant stainless steel hoop trio built for everyday wear, from workouts to nights out.", shortDescription: "Waterproof tarnish-resistant hoop trio.", stock: 40, featured: false },

    { id: 9, name: "Charm Build-Your-Own Bracelet", category: "jewelry", price: 41.00, oldPrice: 48.00, badge: "Sale", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=85", images: ["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1000&q=85"], description: "Start with a base chain and add personalized charms one at a time to build a bracelet that's entirely your own.", shortDescription: "Customizable charm-by-charm bracelet.", stock: 33, featured: false },

    // Moved to jewelry (pearl earrings). The SALE badge was removed because there is no old price.
    { id: 10, name: "Luna Pearl Earrings", category: "jewelry", price: 29.00, oldPrice: null, badge: null, image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=800&q=85", images: ["https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1000&q=85"], description: "Freshwater pearl drop earrings with a gold-finished hook, light enough for all-day wear.", shortDescription: "Freshwater pearl drops, gold-finished.", stock: 36, featured: true },

    { id: 11, name: "Silk Hair Scarf", category: "accessories", price: 22.00, oldPrice: null, badge: "New", image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=85", images: ["https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1000&q=85"], description: "A soft, lightweight silk-blend scarf that doubles as a hair accessory, neck scarf, or bag charm.", shortDescription: "Multi-way silk-blend scarf.", stock: 48, featured: false },

    { id: 12, name: "Structured Mini Tote", category: "accessories", price: 58.00, oldPrice: 68.00, badge: "Sale", image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=85", images: ["https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1000&q=85"], description: "A structured vegan-leather mini tote with an interior pocket, sized perfectly for daily essentials.", shortDescription: "Structured vegan-leather mini tote.", stock: 21, featured: false }

];


/* ---------- the catalog the shop uses ---------- */

// makes sure a product has every field in the right type, or returns null if it is unusable
function normalizeProduct(raw) {
    if (!raw || typeof raw !== "object") return null;

    const id = Number(raw.id);
    const price = Number(raw.price);
    const name = String(raw.name || "").trim();

    if (!Number.isFinite(id) || id <= 0 || !name) return null;
    if (!PRODUCT_CATEGORIES.includes(raw.category)) return null;
    if (!Number.isFinite(price) || price < 0) return null;

    const image = String(raw.image || "");
    const oldPrice = Number(raw.oldPrice);

    return {
        id: id,
        name: name,
        category: raw.category,
        price: price,
        oldPrice: Number.isFinite(oldPrice) && oldPrice > price ? oldPrice : null,
        rating: Number(raw.rating) || 0,
        reviewCount: Math.max(0, Math.floor(Number(raw.reviewCount)) || 0),
        badge: raw.badge ? String(raw.badge) : null,
        image: image,
        images: Array.isArray(raw.images) && raw.images.length ? raw.images.map(String) : (image ? [image] : []),
        description: String(raw.description || ""),
        shortDescription: String(raw.shortDescription || ""),
        stock: Math.max(0, Math.floor(Number(raw.stock)) || 0),
        featured: Boolean(raw.featured)
    };
}

// products saved by the admin panel win. If nothing was saved yet, the sample products are used.
function loadCatalog() {
    try {
        const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);

        if (raw !== null) {
            const saved = JSON.parse(raw);
            if (Array.isArray(saved)) return saved.map(normalizeProduct).filter(Boolean);
        }
    } catch (error) {
        // broken saved data: fall back to the sample products
    }

    return SEED_PRODUCTS.map(normalizeProduct);
}

const products = loadCatalog();


/* ---------- catalog helpers ---------- */

function getAllProducts() {
    return products;
}

function getProductById(id) {
    const numericId = Number(id);
    return products.find((product) => product.id === numericId) || null;
}

function getProductsByCategory(category) {
    if (!category || category === "all") return products;
    return products.filter((product) => product.category === category);
}

// Every word you type must match the product name, category or description.
function searchProducts(query) {
    const terms = String(query || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return products;

    return products.filter((product) => {
        const haystack = `${product.name} ${product.category} ${product.description}`.toLowerCase();
        return terms.every((term) => haystack.includes(term));
    });
}

// Same category first, then other products, so there are always enough to show.
function getRelatedProducts(product, limit = 4) {
    if (!product) return [];

    const sameCategory = products.filter((item) => item.category === product.category && item.id !== product.id);
    const others = products.filter((item) => item.category !== product.category);

    return [...sameCategory, ...others].slice(0, limit);
}

function getFeaturedProducts(limit = 4) {
    return products.filter((product) => product.featured).slice(0, limit);
}


/* ---------- formatting & safety helpers ---------- */

function formatPrice(price) {
    return `${LUNEVIA_CONFIG.currencySymbol}${Number(price).toFixed(2)}`;
}

// "$75" for whole numbers, "$7.50" otherwise
function formatPriceShort(price) {
    const number = Number(price);
    return Number.isInteger(number) ? `${LUNEVIA_CONFIG.currencySymbol}${number}` : formatPrice(number);
}

// Rounds to whole cents so sums like 19.99 + 55.01 never end up as 74.99999999999999.
function roundMoney(value) {
    return Math.round((Number(value) || 0) * 100) / 100;
}

// Always escape text before putting it into innerHTML.
function escapeHtml(value) {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return String(value === null || value === undefined ? "" : value).replace(/[&<>"']/g, (char) => map[char]);
}

function capitalize(text) {
    const value = String(text || "");
    return value.charAt(0).toUpperCase() + value.slice(1);
}


/* ---------- shipping ---------- */

function getShippingCost(subtotal) {
    const amount = roundMoney(subtotal);
    if (amount <= 0 || amount >= FREE_SHIPPING_THRESHOLD) return 0;
    return FLAT_SHIPPING_FEE;
}

// One place for the bag maths, used by the cart page and the checkout page.
// Products that no longer exist in the catalogue are ignored.
function calculateCartTotals(cart) {
    let subtotalCents = 0;
    let itemCount = 0;

    (cart || []).forEach((item) => {
        const product = getProductById(item.id);
        const quantity = Math.max(0, Math.floor(Number(item.quantity)) || 0);
        if (!product || quantity === 0) return;

        subtotalCents += Math.round(product.price * 100) * quantity;
        itemCount += quantity;
    });

    const subtotal = subtotalCents / 100;
    const shipping = getShippingCost(subtotal);

    return { subtotal: subtotal, shipping: shipping, total: roundMoney(subtotal + shipping), itemCount: itemCount };
}


/* ---------- responsive images ---------- */

// The sample photos come from Unsplash, which can resize on request (?w=…).
// Photos on any other host (your own files, uploaded photos) are used as they are.
const RESIZABLE_IMAGE_HOST = "images.unsplash.com";
const CARD_IMAGE_WIDTHS = [400, 600, 800];

function isResizableImage(url) {
    try {
        return new URL(url).hostname === RESIZABLE_IMAGE_HOST;
    } catch (error) {
        return false;
    }
}

function resizeImageUrl(url, width) {
    if (!isResizableImage(url)) return url;

    const resized = new URL(url);
    resized.searchParams.set("w", String(width));
    resized.searchParams.set("q", "75");
    return resized.toString();
}

// srcset text, or "" when the image cannot be resized
function buildImageSrcset(url, widths = CARD_IMAGE_WIDTHS) {
    if (!isResizableImage(url)) return "";
    return widths.map((width) => `${resizeImageUrl(url, width)} ${width}w`).join(", ");
}


/* ---------- product card (shared by home, shop, wishlist, related) ---------- */

function getBadgeClass(badge) {
    const name = String(badge || "").toLowerCase();
    if (name === "new") return "new";
    if (name === "sale") return "sale";
    return "";
}

function buildRatingHtml(product) {
    if (!SHOW_RATINGS || !product.reviewCount) return "";

    return `
        <div class="product-rating">
            <i class="bi bi-star-fill"></i>
            <span>${product.rating}</span>
        </div>
    `;
}

function buildProductCard(product, options = {}) {
    const colClass = options.colClass || "col-12 col-sm-6 col-lg-4";
    // how wide the card is on screen, so the browser can pick the right file size
    // h3 by default (cards sit under a section heading); pages whose heading is the h1 pass "h2"
    const headingTag = options.headingTag === "h2" ? "h2" : "h3";
    const imageSizes = options.sizes || "(min-width: 992px) 33vw, (min-width: 576px) 50vw, 100vw";
    const wishlist = typeof getWishlist === "function" ? getWishlist() : [];
    const isWishlisted = wishlist.includes(String(product.id));
    const name = escapeHtml(product.name);
    const link = `product.html?id=${product.id}`;

    const badgeHtml = product.badge
        ? `<span class="product-badge ${getBadgeClass(product.badge)}">${escapeHtml(product.badge.toUpperCase())}</span>`
        : "";

    const oldPriceHtml = product.oldPrice
        ? `<s class="old-price">${formatPrice(product.oldPrice)}</s>`
        : "";

    const srcset = buildImageSrcset(product.image);
    const imageSrc = resizeImageUrl(product.image, 800);
    const srcsetAttrs = srcset ? ` srcset="${escapeHtml(srcset)}" sizes="${escapeHtml(imageSizes)}"` : "";

    const cartButton = product.stock > 0
        ? `<button type="button" class="btn-add-to-cart-shop" data-add-to-cart="${product.id}">Add to Bag <i class="bi bi-bag"></i></button>`
        : `<button type="button" class="btn-add-to-cart-shop" disabled>Out of Stock</button>`;

    return `
        <div class="${colClass}">
            <article class="product-card">
                <div class="product-image">
                    ${badgeHtml}
                    <button type="button" class="product-wishlist ${isWishlisted ? "active" : ""}" data-product-id="${product.id}" aria-pressed="${isWishlisted}" aria-label="${isWishlisted ? "Remove from wishlist" : "Add to wishlist"}">
                        <i class="bi ${isWishlisted ? "bi-heart-fill" : "bi-heart"}"></i>
                    </button>
                    <a href="${link}" class="product-image-link" tabindex="-1" aria-hidden="true">
                        <img src="${escapeHtml(imageSrc)}"${srcsetAttrs} width="800" height="840" alt="${name}" loading="lazy" decoding="async">
                    </a>
                    <a href="${link}" class="quick-add">View Product<span class="visually-hidden">: ${name}</span></a>
                </div>
                <div class="product-info">
                    <p class="product-category">${escapeHtml(product.category.toUpperCase())}</p>
                    <${headingTag}><a href="${link}">${name}</a></${headingTag}>
                    <div class="product-bottom">
                        <span class="product-price">
                            ${formatPrice(product.price)}
                            ${oldPriceHtml}
                        </span>
                        ${buildRatingHtml(product)}
                    </div>
                    ${cartButton}
                </div>
            </article>
        </div>
    `;
}