/* =========================================================
   LUNÉVIA — PRODUCT CATALOG & SHARED HELPERS
   Load this file on EVERY page, before main.js.
========================================================= */


/* ---------- store settings ---------- */

// Star ratings are hidden until they come from real customer reviews.
// When you have real reviews, update rating / reviewCount below and set this to true.
const SHOW_RATINGS = false;

// The admin panel (Settings page) can change the shipping rules. These are the defaults.
// Orders with a subtotal at or above FREE_SHIPPING_THRESHOLD ship free.
// Smaller orders pay FLAT_SHIPPING_FEE.
const SETTINGS_STORAGE_KEY = "luneviaSettings";
const PRODUCTS_STORAGE_KEY = "luneviaProducts";
const SEEN_SEED_STORAGE_KEY = "luneviaSeedSeen";
// catalogs saved before seed tracking existed already contained the first 12 sample products
const LEGACY_SEED_LIMIT = 12;
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

// builds a sample product with two local illustrations (replace them with your own photos in the admin)
function seedProduct(id, name, category, price, oldPrice, badge, slug, shortDescription, description, stock, featured) {
    const main = `assets/products/${slug}-1.svg`;

    return {
        id: id, name: name, category: category, price: price, oldPrice: oldPrice,
        rating: 0, reviewCount: 0, badge: badge,
        image: main, images: [main, `assets/products/${slug}-2.svg`],
        description: description, shortDescription: shortDescription, stock: stock, featured: featured
    };
}

const SEED_PRODUCTS = [

    { id: 1, name: "Glow Renewal Serum", category: "skincare", price: 38.00, oldPrice: null, rating: 4.9, reviewCount: 214, badge: "Bestseller", image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=800&q=85", images: ["https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=1000&q=85"], description: "A lightweight, fast-absorbing serum formulated with bakuchiol and niacinamide to visibly renew skin's natural radiance overnight.", shortDescription: "Bakuchiol + niacinamide overnight glow serum.", stock: 42, featured: true },

    { id: 2, name: "Hydrogel Glass Skin Mask", category: "skincare", price: 24.00, oldPrice: 30.00, rating: 4.7, reviewCount: 132, badge: "Sale", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=85", images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=85"], description: "An intensely hydrating hydrogel mask that delivers a smooth, dewy 'glass skin' finish in just 15 minutes.", shortDescription: "15-minute dewy glass-skin hydration.", stock: 65, featured: false },

    { id: 3, name: "Scalp Renewal Treatment", category: "skincare", price: 32.00, oldPrice: null, rating: 4.6, reviewCount: 58, badge: "New", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=85", images: ["https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1000&q=85"], description: "A soothing scalp treatment infused with kojic acid and botanical extracts to balance and refresh the scalp.", shortDescription: "Kojic acid scalp balancing treatment.", stock: 30, featured: false },

    { id: 4, name: "Everyday Beauty Set", category: "beauty", price: 45.00, oldPrice: null, rating: 4.8, reviewCount: 176, badge: null, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=85", images: ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=85"], description: "A curated five-piece beauty essentials set designed to simplify your everyday routine without sacrificing quality.", shortDescription: "Five-piece daily beauty essentials.", stock: 38, featured: true },

    { id: 5, name: "Collagen Beauty Powder", category: "beauty", price: 29.00, oldPrice: null, rating: 4.5, reviewCount: 91, badge: "New", image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=85", images: ["https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1000&q=85"], description: "A hair, skin, and nails collagen blend that mixes seamlessly into your morning routine for a beauty boost from within.", shortDescription: "Hair, skin & nails collagen blend.", stock: 54, featured: false },

    { id: 6, name: "Matte Finish Lip Set", category: "beauty", price: 26.00, oldPrice: 32.00, rating: 4.9, reviewCount: 203, badge: "Sale", image: "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&w=800&q=85", images: ["https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&w=1000&q=85"], description: "A trio of long-wearing matte lip colors formulated to feel weightless while delivering full, buildable pigment.", shortDescription: "Trio of long-wear weightless mattes.", stock: 47, featured: false },

    { id: 7, name: "Aurelia Necklace", category: "jewelry", price: 52.00, oldPrice: null, rating: 5.0, reviewCount: 89, badge: "New", image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=800&q=85", images: ["https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1000&q=85"], description: "A delicate 18k gold-plated layering necklace with a hand-set pendant, designed to be worn alone or stacked.", shortDescription: "18k gold-plated layering necklace.", stock: 25, featured: true },

    { id: 8, name: "Stainless Steel Hoop Set", category: "jewelry", price: 34.00, oldPrice: null, rating: 4.7, reviewCount: 64, badge: null, image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=85", images: ["https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1000&q=85"], description: "A waterproof, tarnish-resistant stainless steel hoop trio built for everyday wear, from workouts to nights out.", shortDescription: "Waterproof tarnish-resistant hoop trio.", stock: 40, featured: false },

    { id: 9, name: "Charm Build-Your-Own Bracelet", category: "jewelry", price: 41.00, oldPrice: 48.00, rating: 4.8, reviewCount: 112, badge: "Sale", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=85", images: ["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1000&q=85"], description: "Start with a base chain and add personalized charms one at a time to build a bracelet that's entirely your own.", shortDescription: "Customizable charm-by-charm bracelet.", stock: 33, featured: false },

    // Moved to jewelry (pearl earrings). The SALE badge was removed because there is no old price.
    { id: 10, name: "Luna Pearl Earrings", category: "jewelry", price: 29.00, oldPrice: null, rating: 4.9, reviewCount: 147, badge: null, image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=800&q=85", images: ["https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1000&q=85"], description: "Freshwater pearl drop earrings with a gold-finished hook, light enough for all-day wear.", shortDescription: "Freshwater pearl drops, gold-finished.", stock: 36, featured: true },

    { id: 11, name: "Silk Hair Scarf", category: "accessories", price: 22.00, oldPrice: null, rating: 4.6, reviewCount: 53, badge: "New", image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=85", images: ["https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1000&q=85"], description: "A soft, lightweight silk-blend scarf that doubles as a hair accessory, neck scarf, or bag charm.", shortDescription: "Multi-way silk-blend scarf.", stock: 48, featured: false },

    { id: 12, name: "Structured Mini Tote", category: "accessories", price: 58.00, oldPrice: 68.00, rating: 4.8, reviewCount: 97, badge: "Sale", image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=85", images: ["https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1000&q=85"], description: "A structured vegan-leather mini tote with an interior pocket, sized perfectly for daily essentials.", shortDescription: "Structured vegan-leather mini tote.", stock: 21, featured: false },


    /* ---------- new collection (ids 13+) — local illustrations in assets/products, swap in your own photos from the admin ---------- */

    seedProduct(13, "Vitamin C Brightening Serum", "skincare", 36, null, "New", "vitamin-c-serum", "Stabilised vitamin C for a brighter-looking tone.", "A silky 30 ml serum with 10% stabilised vitamin C and ferulic acid. It layers well under moisturiser and sunscreen and helps skin look brighter and more even with daily use.", 44, false),
    seedProduct(14, "Ceramide Barrier Cream", "skincare", 34, 40, "Sale", "ceramide-cream", "Rich 50 ml cream that cushions and comforts.", "A rich but non-greasy 50 ml moisturiser with ceramides, squalane and shea butter to cushion the skin barrier. Suitable for dry and sensitive-feeling skin, morning or night.", 58, false),
    seedProduct(15, "Gentle Gel Cleanser", "skincare", 22, null, null, "gel-cleanser", "Soft-foaming daily cleanser, 150 ml.", "A soft-foaming 150 ml gel cleanser with glycerin and chamomile extract that lifts away makeup and daily build-up without leaving skin tight. Fragrance-free.", 72, false),
    seedProduct(16, "Hyaluronic Hydration Toner", "skincare", 26, null, null, "hydration-toner", "Alcohol-free 120 ml toner for a plump, dewy base.", "An alcohol-free 120 ml toner with two weights of hyaluronic acid and panthenol. Press it in with clean hands after cleansing to prep skin for serums and creams.", 61, false),
    seedProduct(17, "Mineral Sunscreen SPF 50", "skincare", 28, null, "Bestseller", "mineral-spf", "Lightweight zinc oxide SPF 50, 50 ml.", "A lightweight 50 ml broad-spectrum SPF 50 made with zinc oxide. It blends with a soft, natural finish and sits comfortably under makeup. Reapply every two hours in strong sun.", 80, true),
    seedProduct(18, "Rosehip Facial Oil", "skincare", 31, null, null, "rosehip-oil", "Cold-pressed rosehip oil, 30 ml.", "A 30 ml cold-pressed rosehip seed oil in a UV-protective amber bottle. Warm two drops between your palms and press over moisturiser as a final evening step.", 39, false),

    seedProduct(19, "Velvet Blush Duo", "beauty", 24, null, "New", "blush-duo", "Two buildable blush shades in one compact.", "A pressed powder blush duo in a soft rose and warm peach with a velvety, blendable finish. Wear one shade alone or swirl both for a natural flush. Mirror included.", 52, false),
    seedProduct(20, "Satin Lip Oil", "beauty", 18, null, null, "lip-oil", "Non-sticky shine with a hint of tint, 8 ml.", "A glossy, non-sticky 8 ml lip oil with jojoba and vitamin E and a sheer rosy tint. Wear it alone or over your favourite matte lip colour.", 90, false),
    seedProduct(21, "Lash Lift Mascara", "beauty", 21, null, null, "lash-mascara", "Lengthening, lifting black mascara.", "A flexible-bristle black mascara that separates, lengthens and lifts lashes without clumping. Smudge-resistant and easy to remove with warm water and a cleanser.", 66, false),
    seedProduct(22, "Rose Quartz Gua Sha Set", "beauty", 39, 46, "Sale", "gua-sha-set", "Gua sha and facial roller in a travel pouch.", "A hand-finished rose quartz gua sha and facial roller set with a soft pouch. Use with a few drops of facial oil to relax the face and neck as part of your evening ritual.", 34, false),
    seedProduct(23, "Eau de Lunévia Parfum", "beauty", 64, null, "New", "parfum", "Soft florals, warm amber and musk, 50 ml.", "A 50 ml eau de parfum with a soft floral heart of jasmine and peony settling into warm amber and white musk. Refined, quiet and made to be worn every day.", 27, true),
    seedProduct(24, "Golden Hour Eyeshadow Palette", "beauty", 42, null, null, "eyeshadow-palette", "Nine warm neutrals in matte and shimmer.", "Nine finely milled eyeshadows in warm neutral matte and shimmer finishes, from soft champagne to deep cocoa. A single palette for day looks and evening glam.", 31, false),

    seedProduct(25, "Celeste Moon Necklace", "jewelry", 44, null, "New", "moon-necklace", "Crescent moon pendant on a fine gold chain.", "A dainty crescent moon pendant on an adjustable 16–18 inch chain, finished in 18k gold plating over stainless steel. Light enough to wear every day and to layer.", 29, false),
    seedProduct(26, "Pavé Stacking Ring Set", "jewelry", 38, null, null, "stacking-rings", "Three slim rings with sparkling cubic zirconia.", "A set of three slim stacking rings with hand-set cubic zirconia, in gold-plated brass. Wear them together or split them across fingers.", 36, false),
    seedProduct(27, "Gold Huggie Earrings", "jewelry", 27, null, "Bestseller", "huggie-earrings", "Small hoops that sit close to the ear.", "A pair of 12 mm huggie hoops with a secure hinged closure, in tarnish-resistant gold-plated stainless steel. Comfortable enough to sleep in.", 62, false),
    seedProduct(28, "Herringbone Chain Bracelet", "jewelry", 33, 39, "Sale", "chain-bracelet", "Flat, flexible herringbone chain.", "A flat herringbone chain bracelet with a lobster clasp and a 2 inch extender so it fits most wrists. Water-resistant stainless steel with a gold finish.", 41, false),
    seedProduct(29, "Baroque Pearl Choker", "jewelry", 48, null, null, "pearl-choker", "Freshwater baroque pearls on a gold chain.", "A choker of irregular freshwater baroque pearls on a gold-plated chain with an adjustable length. Every pearl is a little different, so each piece is unique.", 22, false),
    seedProduct(30, "Orbit Ear Cuff Set", "jewelry", 26, null, "New", "ear-cuffs", "Three no-piercing cuffs in mixed shapes.", "A trio of lightweight ear cuffs that clip on without a piercing. Mix the three shapes along the ear for a curated look in minutes.", 45, false),

    seedProduct(31, "Satin Scrunchie Set", "accessories", 14, null, null, "scrunchies", "Set of three in soft neutrals.", "Three gentle satin scrunchies in blush, cocoa and ivory. Kind to hair and easy to wear on the wrist between ponytails.", 100, false),
    seedProduct(32, "Tortoiseshell Claw Clip", "accessories", 12, null, "New", "claw-clip", "Large matte claw clip with a strong grip.", "A large matte tortoiseshell-pattern claw clip with a strong, springy grip that holds thick hair in a twist without tugging.", 120, false),
    seedProduct(33, "Canvas Market Tote", "accessories", 36, null, null, "canvas-tote", "Roomy cotton canvas tote with an inner pocket.", "A roomy heavyweight cotton canvas tote with reinforced handles and an inside zip pocket. Easy to carry from market to office.", 48, false),
    seedProduct(34, "Cat-Eye Sunglasses", "accessories", 29, null, null, "sunglasses", "Retro cat-eye frames with UV400 lenses.", "Retro cat-eye sunglasses with lightweight frames and UV400 lenses. Comes with a soft protective pouch.", 55, false),
    seedProduct(35, "Quilted Cosmetic Pouch", "accessories", 19, null, null, "cosmetic-pouch", "Soft quilted pouch with a gold zip.", "A soft quilted vegan-leather pouch with a smooth gold zip and a wipe-clean lining. Big enough for a full daily makeup edit.", 70, false),
    seedProduct(36, "Vegan Leather Card Wallet", "accessories", 24, 28, "Sale", "card-wallet", "Slim wallet with four card slots and a note pocket.", "A slim vegan-leather card wallet with four card slots and a central pocket for folded notes. Slips into any bag or pocket.", 63, false)

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

function readSeenSeedIds() {
    try {
        const seen = JSON.parse(localStorage.getItem(SEEN_SEED_STORAGE_KEY));
        if (Array.isArray(seen)) return seen.map(Number);
    } catch (error) {
        // treated as "never tracked" below
    }

    return null;
}

// saves the catalog and remembers which sample products it already knows about
function saveCatalog(list) {
    try {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(list));
        localStorage.setItem(SEEN_SEED_STORAGE_KEY, JSON.stringify(SEED_PRODUCTS.map((product) => product.id)));
        return true;
    } catch (error) {
        return false;
    }
}

// Products saved by the admin panel win. If nothing was saved yet, the sample products are used.
// Sample products added to the code later are merged into a saved catalog once, so returning
// visitors see new products too. Products the admin deleted stay deleted.
function loadCatalog() {
    try {
        const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);

        if (raw !== null) {
            const saved = JSON.parse(raw);

            if (Array.isArray(saved)) {
                const list = saved.map(normalizeProduct).filter(Boolean);
                const seen = readSeenSeedIds() || SEED_PRODUCTS.filter((product) => product.id <= LEGACY_SEED_LIMIT).map((product) => product.id);
                const fresh = SEED_PRODUCTS.filter((product) => !seen.includes(product.id));

                if (fresh.length) {
                    fresh.forEach((seed) => {
                        const next = normalizeProduct(seed);
                        if (list.some((item) => item.id === next.id)) next.id = list.reduce((max, item) => Math.max(max, item.id), 0) + 1;
                        list.push(next);
                    });

                    saveCatalog(list);
                }

                return list;
            }
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

function getNewArrivals(limit = 4) {
    return products.filter((product) => String(product.badge).toLowerCase() === "new").sort((a, b) => b.id - a.id).slice(0, limit);
}

// direction -1 takes the items out of stock (order placed), +1 puts them back (order cancelled)
function adjustStock(items, direction) {
    (items || []).forEach((item) => {
        const product = getProductById(item.id);
        if (product) product.stock = Math.max(0, product.stock + direction * (Number(item.quantity) || 0));
    });

    return saveCatalog(products);
}


/* ---------- formatting & safety helpers ---------- */

function formatPrice(price) {
    return `$${Number(price).toFixed(2)}`;
}

// "$75" for whole numbers, "$7.50" otherwise
function formatPriceShort(price) {
    const number = Number(price);
    return Number.isInteger(number) ? `$${number}` : formatPrice(number);
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
    const amount = Number(subtotal) || 0;
    if (amount <= 0 || amount >= FREE_SHIPPING_THRESHOLD) return 0;
    return FLAT_SHIPPING_FEE;
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
                        <img src="${escapeHtml(product.image)}" alt="${name}" loading="lazy" decoding="async">
                    </a>
                    <a href="${link}" class="quick-add">View Product</a>
                </div>
                <div class="product-info">
                    <p class="product-category">${escapeHtml(product.category.toUpperCase())}</p>
                    <h3><a href="${link}">${name}</a></h3>
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