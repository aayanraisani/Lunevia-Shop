# Lunévia: e-commerce frontend template

Lunévia is a beauty, skincare, jewellery and accessories storefront built as a **frontend-only template** with plain HTML5, CSS3, JavaScript and Bootstrap 5. There is no build step and no backend. It is meant to be bought, rebranded and connected to a real backend by the next developer.

> **Read this first.** The shop works as a demo: browsing, search, filters, bag, wishlist, a demo checkout, accounts and an admin panel. Everything that would normally be stored or sent by a server (accounts, orders, messages, sign-ups, payments, email) is **kept in the visitor's own browser only**, or not done at all. See [Demo-only behaviour](#12-demo-only-behaviour) and [Backend functionality not included](#14-backend-functionality-not-included).

Live demo of the original deployment: https://lunevia-shop.vercel.app/ (the deployed copy has not been updated by this package).

## 1. Technologies

- HTML5, CSS3, vanilla JavaScript (no framework, no bundler, no npm packages)
- Bootstrap 5.3.8 **CSS** from the jsDelivr CDN (Bootstrap JavaScript is not used)
- Bootstrap Icons 1.13.1 from the jsDelivr CDN
- Google Fonts: DM Sans and Playfair Display
- Sample photos hotlinked from Unsplash
- Hosting target: Vercel (static)

## 2. Features that actually work

| Area | What works (verified in a real browser, see `QA-REPORT.md`) |
|---|---|
| Browsing | Homepage with featured products, shop catalogue (12 sample products), product detail pages, category pages, breadcrumbs, related products |
| Shop tools | Text search, category filter, price range filter, sorting, empty state |
| Bag | Add, change quantity (respects stock), remove, free-shipping progress, totals computed in whole cents, empty state |
| Wishlist | Heart toggle on cards and product page, wishlist page, header counters |
| Checkout (demo) | Field validation with inline errors, cash-on-delivery order, order number, confirmation page, order tracking by order number plus email (same browser only) |
| Accounts (demo) | Register, sign in, account page with order history, change details/password. Browser-only |
| Admin panel (demo) | Dashboard, products (add/edit), orders, customers, demo messages and sign-ups, settings. Browser-only |
| Forms | Contact and newsletter forms with validation, honeypot field, accessible status messages. Behaviour depends on `js/config.js` (below) |
| Site | Responsive layout, mobile menu, search dialog, 404 page, FAQ, policy pages |
| Hero | Subtle CSS-only depth (tilted photo, offset frame, floating card). Flat on phones and switched off for `prefers-reduced-motion` |

## 3. Directory and file structure

```
lunevia/
├─ index.html  shop.html  product.html  cart.html  wishlist.html
├─ checkout.html  order-confirmation.html  order-tracking.html
├─ login.html  account.html  about.html  contact.html  faq.html
├─ shipping-returns.html  privacy.html  terms.html  404.html
├─ css/
│  ├─ style.css        brand tokens (:root), layout, components, hero, responsive rules
│  ├─ pages.css        styles used only by account/order/FAQ/legal pages
│  └─ no-js.css        loaded only when JavaScript is off (hides loading placeholders)
├─ js/
│  ├─ config.js        THE FILE TO EDIT FIRST: currency + optional form endpoint
│  ├─ products.js      product catalogue, prices, shipping rules, shared helpers, product card
│  ├─ main.js          shared behaviour: header, menu, search, counters, toasts, forms
│  ├─ store.js         accounts and orders (browser storage), shared by account/checkout pages
│  ├─ home.js  shop.js  product.js  cart.js  wishlist.js
│  ├─ checkout.js  confirmation.js  tracking.js  account.js  auth.js
├─ admin/              demo admin panel (login.html, dashboard.html, products, orders, ...)
│  ├─ css/admin.css
│  └─ js/admin-*.js
├─ assets/
│  ├─ favicon/favicon.svg
│  └─ og-image.jpg     1200x630 share image (placeholder artwork)
├─ vercel.json         security headers only (no build, no rewrites)
├─ robots.txt  sitemap.xml
└─ README.md  LICENSES-AND-ASSETS.md  CHANGELOG.md  QA-REPORT.md
```

Every page loads its scripts in the head with `defer`, in this order: `config.js`, `products.js`, `main.js`, then (when needed) `store.js` and the page's own script.

## 4. Prerequisites

- Any static file server. The documented way uses Python 3 (`python3 --version`).
- A modern browser. The site was tested in Chromium only (see `QA-REPORT.md`).
- An internet connection: Bootstrap CSS, Bootstrap Icons, the fonts and all product photos are loaded from the internet. **Offline, the site loads but looks unstyled and has no images or icons.**

## 5. Run locally

```bash
cd lunevia
python3 -m http.server 8000
```

Open http://localhost:8000/. Serve the folder over `http://localhost`. Opening `index.html` directly from disk (`file://`) is not tested and the account/admin pages need a secure context, which `localhost` provides. Any other static server works as well; none is required by the project.

## 6. Vercel deployment

The project is static: no build command, no output directory, no environment variables.

1. Put the folder in a Git repository (or use the Vercel CLI from the folder).
2. In Vercel choose **Add New → Project** and import the repository.
3. Framework Preset: **Other**. Leave Build Command, Install Command and Output Directory empty.
4. Deploy. Vercel serves `404.html` for unknown paths and applies the headers from `vercel.json`.
5. Before going public, do the checklist in section 7.

`vercel.json` contains headers only (Content-Security-Policy, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, and `X-Robots-Tag: noindex` for `/admin/`). **It was tested with a local server that applies the same headers, not on Vercel itself.** After your first deploy, open the browser console on each page type and confirm there are no "Refused to ..." messages. No custom cache headers are set: the files are not fingerprinted, so aggressive caching could keep visitors on old CSS/JS. Vercel's default revalidation and compression apply.

`README` and the other `.md` files will be publicly reachable on the deployed site unless you delete them or add a `.vercelignore` before deploying.

## 7. Before you launch (checklist)

1. **Replace the site URL.** `https://lunevia-shop.vercel.app` is written into the canonical links, `og:url`/`og:image` tags, `sitemap.xml` and `robots.txt`. Replace it everywhere with your real domain:
   `grep -rl "lunevia-shop.vercel.app" . | xargs sed -i 's#https://lunevia-shop.vercel.app#https://YOUR-DOMAIN#g'` (Linux/macOS; use find-and-replace in your editor on Windows). Canonical URLs are only correct once this is done.
2. Replace the 19 sample photos (see `LICENSES-AND-ASSETS.md`).
3. Replace placeholder contact details (`hello@lunevia.com`, `+92 300 0000000`), the `#` social links in the footer, and the sample policy text. Remove the visible "template note" boxes on the policy pages after review.
4. Decide how forms are delivered (section 9) or keep the demo mode, and update `privacy.html` to match.
5. Add Subresource Integrity (section 10) and consider self-hosting fonts and icons.
6. Replace the sample products, the announcement-bar text, shipping threshold and fee, and the currency.

## 8. Customisation map

| I want to change... | Edit |
|---|---|
| Brand colours, border and text colours | `:root` variables at the top of `css/style.css` (`--lv-bg`, `--lv-text`, `--lv-accent`, ...) |
| Fonts | The Google Fonts `<link>` in each page head, and `--lv-font-display` / `--lv-font-body` in `css/style.css` |
| Products, prices, stock, categories, badges, photos | `js/products.js` (the sample catalogue at the top) |
| Free-shipping threshold and flat fee | `FREE_SHIPPING_THRESHOLD` and `FLAT_SHIPPING_FEE` in `js/products.js` |
| Currency symbol and code | `js/config.js` |
| Where forms are sent | `js/config.js` (`formEndpoint`) |
| Logo | The text wordmark in the navbar of every page (`.navbar-brand`) and `assets/favicon/favicon.svg` |
| Hero image and category images | `<img>` tags in `index.html` |
| Hero depth effect | The "HERO DEPTH" block at the end of `css/style.css` |
| Header, footer, announcement bar | Repeated in each HTML page (static HTML, no template engine). Use search-and-replace across files |
| Share image | `assets/og-image.jpg` (1200x630) |

## 9. Forms: demo mode and live mode

`js/config.js` has one switch, `formEndpoint`.

- **Empty (default) = demo mode.** Nothing is sent anywhere. Contact messages, newsletter addresses and orders are saved in the visitor's browser so the demo admin panel can show them, and every message on the site says so ("Demo mode: your message was not sent to anyone").
- **An `https://` URL = live mode.** The contact form, newsletter form and checkout POST JSON (`{ "form": "contact" | "newsletter" | "order", ...fields }`) to that URL. A success message appears **only** when the service answers with a 2xx status. If it fails, the visitor sees an error and, for checkout, **no order is placed**.

To use a service such as Formspree you must also:

1. Add the endpoint's origin to `connect-src` in the Content-Security-Policy in `vercel.json` (currently `'self'` only, so a configured endpoint is blocked by the browser until you do).
2. Check that the service accepts this JSON shape (adapt `sendToFormEndpoint` in `js/main.js` if it does not, for example to add an access key).
3. Update `privacy.html` to name the service.

Live mode was tested **only against a mock endpoint**, never against a real form service.

The old Netlify Forms attributes were removed. They do nothing on Vercel.

## 10. External dependencies

| Dependency | Purpose | Notes |
|---|---|---|
| `bootstrap@5.3.8` CSS (jsDelivr) | Grid, utilities, base styles | No `integrity` attribute: see below |
| `bootstrap-icons@1.13.1` (jsDelivr) | Icons | No `integrity` attribute. Loads one CSS file plus an icon font (about 100 KB or more) even though only some icons are used |
| Google Fonts | DM Sans, Playfair Display | Visitors' browsers contact Google. Google's CSS cannot use SRI |
| Unsplash | Sample photos | Remote hotlinks. Replace before selling |

**Subresource Integrity was not added.** It needs the hash of the exact file bytes, and this audit had no internet access, so any hash would have been invented. To add it yourself:

```bash
curl -s https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css | openssl dgst -sha384 -binary | openssl base64 -A
```

Then add `integrity="sha384-<result>" crossorigin="anonymous"` to the matching `<link>` in every page. Do the same for the Bootstrap Icons URL. Test every page afterwards: a wrong hash makes the browser block the file.

## 11. Why Bootstrap JavaScript was removed

Only the mobile menu used it. A few lines in `js/main.js` do the same job (open/close, Escape to close, `aria-expanded`). If you want Bootstrap components such as modals or dropdowns, add the Bootstrap bundle script back.

## 12. Demo-only behaviour

- Checkout takes **no payment** and sends the order nowhere (unless you configure an endpoint). Payment method is cash on delivery only.
- Order tracking only finds orders placed in the same browser.
- Accounts: passwords are hashed in the browser and stored in `localStorage`. Anyone with access to that browser can read or clear them.
- Admin panel: the first visitor to open `/admin/login.html` on a browser creates a local admin account for that browser. **The login is a user-interface gate, not security.** Hiding a page or checking a password in JavaScript cannot protect data. Forgot the demo admin password? Clear this site's data in the browser.
- Sample products, descriptions, prices and policies are placeholders.
- Ratings and reviews are hidden (`SHOW_RATINGS = false`) and the sample data contains none.

## 13. Frontend-only limitations

No server-side validation, authentication, authorisation, database, inventory sync, payment processing, email delivery, rate limiting or spam protection (the honeypot field is a weak, browser-side measure). Client-side validation only improves the experience. It never replaces checks on a server.

## 14. Backend functionality not included

A production shop needs: a database for products, customers and orders; secure authentication (hashed passwords on a server, sessions or tokens); real authorisation for the admin area; a payment provider; transactional email; inventory control; form handling with spam protection; and legal and tax handling. None of this is in the template. `js/store.js` and `admin/js/admin-data.js` are the two places that currently read and write browser storage and are the natural places to swap in API calls.

## 15. Known issues and limits

- Photos, Bootstrap CSS, icons and fonts depend on third-party hosts. No SRI hashes.
- Product pages are drawn by JavaScript, so search engines that do not run JavaScript will see an empty product page. Product pages have no canonical link (the URL uses `?id=`).
- Footer social links are `#` placeholders.
- `css/style.css` is about 3,000 lines and still contains some older, overridden duplicate rules. Unused CSS was **not** measured or removed.
- Tested in Chromium only. Not tested in Firefox or Safari, on real devices, with a screen reader, or on a real Vercel deployment. No Lighthouse run was possible.
- About 1,060 interactive elements across the tested views are smaller than the 44 px touch-target size recommended as best practice. They meet the 24 px WCAG 2.2 AA minimum except native checkboxes and radio buttons (18 px), which sit inside larger clickable labels.
- Currency is USD while the sample policies describe delivery inside Pakistan. Align them for your market.

## 16. Licensing reference

See `LICENSES-AND-ASSETS.md`. It separates verified from unverified information and lists unresolved concerns. No licence for your own code is included: choose the terms you sell under.

## 17. Credits

Built by the project owner with Claude AI assistance. Third-party credits: Bootstrap, Bootstrap Icons, DM Sans, Playfair Display and the Unsplash photographers (individual photographers were not recorded in the source).

## More documents

- `CHANGELOG.md`: what changed in this version
- `QA-REPORT.md`: what was tested, what passed and what could not be tested
