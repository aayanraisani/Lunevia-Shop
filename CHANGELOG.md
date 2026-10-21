# Changelog

## This version (2026-10-20): Vercel-ready demo template

### Fixed
- **Forms and checkout no longer depend on Netlify.** The contact form, newsletter and checkout were wired to Netlify Forms (`POST /`), which a static Vercel site cannot handle. All Netlify attributes, hidden fields and wording were removed.
- **Honest demo mode.** New `js/config.js` with `formEndpoint`. Empty (default) means nothing is sent anywhere: messages, sign-ups and orders are saved in the visitor's browser, and every form, the checkout and the confirmation page say so. With an `https://` endpoint, forms POST JSON and show success only if the service answers 2xx; a failed order is not placed.
- Admin **Messages** and **Subscribers** pages were always empty (nothing wrote to them). They now show demo-mode data.
- Totals are computed in whole cents (`calculateCartTotals`, `roundMoney`), removing float errors that could misjudge the free-shipping threshold. Cart and checkout now share one function.
- Playfair Display italic was used but never loaded (browsers faked it); the font link now requests it, and uses variable-weight ranges instead of separate weights.
- Inline `style=""` attributes removed, so a strict Content-Security-Policy works.
- Heading levels fixed (footer `h2`, no skipped levels in cart, checkout, wishlist, shop, confirmation).
- Admin login no longer points to a README that did not exist.

### Changed
- Bootstrap JavaScript removed (it was only used for the mobile menu). The menu is now ~20 lines in `js/main.js` with `aria-expanded`, Escape to close, and reset on resize.
- All scripts load in the head with `defer`; `config.js` loads before `products.js` on every page.
- Search dialog: focus is trapped while open and returns to the search button on close.
- Contact, newsletter and checkout: inline field errors, polite live status messages, and a shared `setFieldError`.
- Responsive images: `srcset`/`sizes`/width/height on hero, category and product images (Unsplash photos), `preconnect` to Unsplash, loading placeholders on home and shop to reduce layout shift.
- Contrast: `--lv-text-light`, `--lv-text-soft` and `--lv-accent` darkened slightly; no text below 11px; header icons and small links now meet the 24px minimum target size.
- Removed unsupported content: the "Secure Shopping" badge, the "Bestseller" badge on a sample product, and invented ratings/review counts in the sample data.
- Privacy page no longer describes Netlify; legal pages carry a visible template note.
- Hero: subtle CSS-only depth effect (flat on phones, off for reduced motion).

### Added
- `vercel.json` (security headers and CSP only), `robots.txt`, `sitemap.xml`, canonical/Open Graph/Twitter tags on public pages, `noindex` on cart/checkout/wishlist, `assets/og-image.jpg`, `css/no-js.css`, `js/config.js`.
- `README.md`, `LICENSES-AND-ASSETS.md`, `CHANGELOG.md`, `QA-REPORT.md`.

### Removed
- `DEPLOYMENT-NOTES.md` (Netlify-specific, obsolete), `admin/js/admin-page.js` (empty and unused), Bootstrap JavaScript script tags, Netlify form attributes.
- Line endings converted from CRLF to LF.

### Not done
- No SRI hashes (no internet to compute real ones; see README).
- Photos are still hotlinked stock images; unused CSS not measured or removed.
- No Lighthouse run; no real Vercel deployment.
