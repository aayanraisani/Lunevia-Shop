# Changelog

## Bug fixes

- **Catalog:** sample products added to `js/products.js` now reach browsers that already saved a catalog (`luneviaSeedSeen` tracks which sample products were merged; products deleted in the admin stay deleted).
- **Stock:** placing an order now reduces stock; cancelling an order in the admin puts it back (re-opening takes it out again). Checkout re-checks the bag against stock before it saves the order.
- **Admin:** editing a product no longer drops its extra gallery photos; "Restore sample products" shows the real product count; removed the empty `admin/js/admin-page.js`.
- **Shipping text:** the free-shipping threshold and flat fee in the announcement bar, product page, FAQ and Shipping & Returns pages now follow the values in Admin > Settings instead of a hardcoded $75 / $5.
- **Forms:** the checkout, contact and newsletter forms no longer carry leftover `method="POST" action="/"` (a submit without JavaScript hit a 405 on Vercel).
- **SEO:** product JSON-LD image URLs are now absolute.
- **Shop:** `shop.html?sort=newest` (and other sort values) now works from the address bar.
- **Performance:** all scripts use `defer`; the hero image is smaller, has width/height and a preload hint.

## New

- 24 new products (ids 13 to 36, six per category) with two local illustrations each in `assets/products/`. Replace them with your own photos from Admin > Products.
- Homepage: scrolling strip, New Arrivals grid, "Build your ritual" section.
- `js/effects.js` + a motion block at the end of `css/style.css`: scroll reveals, hero entrance and floating card, header shadow, scroll progress bar, back-to-top, cart/wishlist badge bump, heart pop, fly-to-bag, product-page zoom and image crossfade. All of it is switched off for visitors who prefer reduced motion.
