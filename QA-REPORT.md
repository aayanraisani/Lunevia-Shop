# QA Report

Date: 2026-10-20. Tool: headless Chromium (Playwright) against a local static server that applies the project's own `vercel.json` headers. The sandbox had **no internet**, so Bootstrap CSS/JS, Bootstrap Icons, Google Fonts and Unsplash photos were **replaced with local stand-ins** (Bootstrap 5.3.2 files, an empty icon font, no web fonts, generated placeholder images). Layout and behaviour results are real; font, icon and photo rendering were **not** verified, and the real CDN/Vercel were never contacted.

## Summary

| Check | Result |
|---|---|
| JavaScript syntax (`node --check`, all 26 JS files) | Passed |
| Internal references (813 links, scripts, stylesheets, images, `#anchors`, sitemap entries) | Passed, none broken |
| Responsive sweep: 21 pages x 9 widths (320, 375, 390, 430, 768, 1024, 1366, 1440, 1920) | No page-level horizontal scroll, no console errors, no failed local requests, no CSP violations. The shop category tabs scroll inside their own container on phones (intended) |
| Functional/behaviour suite | 77/77 passed (table below) |
| Automated accessibility checks (19 pages x 2 widths; custom script, not axe) | No missing alt text, labels or duplicate IDs; no contrast failures under the script's approximate method; heading levels fixed. Remaining: native checkboxes/radios are 18px (inside larger labels); 1,064 elements are under the 44px best-practice target size |
| Local blocking-time comparison (4x CPU throttle, 12 interleaved runs, stand-in assets) | No measurable difference: median 50 ms original vs 62 ms final (ranges overlap). **Not Lighthouse; not comparable to your earlier scores** |

## Not tested (could not be, or not done)

- **Lighthouse / Core Web Vitals**: not run. No performance score is claimed. The earlier Lighthouse numbers (Performance 30) are historical and unverified for this code; the likely cost is in network-loaded resources that could not be measured offline.
- **Real Vercel deployment**: not deployed; headers/CSP not verified on Vercel. 404 behaviour verified only locally.
- **Real CDN, font, icon and photo loading**, and SRI (none used).
- **A real form service** (live mode was tested only against a mock endpoint).
- Firefox, Safari, real phones, screen readers, keyboard testing beyond the checks below, print.
- Visual review: screenshots were reviewed for the home, shop, product, cart, contact, checkout, hero (4 widths) and admin dashboard pages. Other pages were checked programmatically only.

## Functional suite (Chromium, 1440x900 unless noted)

| Test | Result | Note |
|---|---|---|
| Home: 4 featured cards rendered, skeletons replaced | PASS |  |
| Home: hero image is eager, high priority, has srcset+sizes+dimensions | PASS |  |
| Home: featured card images use srcset + width/height | PASS |  |
| Home: no 'Secure Shopping' claim remains | PASS |  |
| Home: no JS errors / CSP violations | PASS | [] |
| CSP is enforced in test setup (inline style attribute blocked) | PASS | canary produced violation |
| Shop: 12 products render, skeletons replaced | PASS | cards=12 |
| Shop: category filter (skincare) shows only skincare | PASS | 3 cards |
| Shop: search 'serum' narrows results | PASS | 1 results |
| Shop: no-results empty state shown, then reset works | PASS |  |
| Shop: reset filters restores all products | PASS |  |
| Shop: sort price low→high is ascending | PASS | [22.0, 24.0, 26.0, 29.0, 29.0, 32.0, 34.0, 38.0, 41.0, 45.0, 52.0, 58.0] |
| Shop: sort price high→low is descending | PASS |  |
| Shop: price filter 30–50 keeps only that range | PASS | [38.0, 45.0, 32.0, 34.0, 41.0] |
| Shop: price clear restores list | PASS |  |
| Shop: no JS errors | PASS | [] |
| Shop @375: category tabs scroll horizontally inside their own container (not clipped) | PASS | ['auto', 498, 351] |
| Product: id=1 shows its own name and price | PASS | Glow Renewal Serum 38.0 |
| Product: title updated + JSON-LD uses configured currency | PASS | Glow Renewal Serum / Lunévia |
| Product: add 2 to bag updates header counter | PASS | 2 |
| Product: unknown id shows not-found state | PASS |  |
| Cart: line shows 2 × price | PASS | $76.00 |
| Cart: quantity + updates subtotal | PASS |  |
| Cart: quantity − updates subtotal | PASS |  |
| Cart: shipping fee/total consistent below threshold | PASS | ship=$5.00 total=43.0 |
| Cart: remove item → empty state, counter 0 | PASS |  |
| Totals: float-safe (19.99+55.01 → 75, ships free; 0.1+0.2 → 0.3) | PASS | [75, 0, 0.3] |
| Totals: unknown ids and bad quantities ignored | PASS | {'subtotal': 76, 'shipping': 0, 'total': 76, 'itemCount': 2} |
| Wishlist: heart toggles and header counter = 1 | PASS |  |
| Wishlist: page lists the item | PASS |  |
| Wishlist: removing item → empty state | PASS |  |
| Product/Cart/Wishlist: no JS errors | PASS | [] |
| Storage: corrupted localStorage does not break pages | PASS | [] |
| Checkout: empty bag shows empty state | PASS |  |
| Checkout: demo notice visible (no payment, nothing sent) | PASS |  |
| Checkout: blank submit shows field errors and stays on page | PASS | 9 errors |
| Checkout: invalid email rejected | PASS |  |
| Checkout: valid demo order reaches confirmation with order number | PASS | LV1001 |
| Confirmation: demo notice shown, false 'we have received your order' hidden | PASS |  |
| Confirmation: bag emptied after order | PASS |  |
| Tracking: order found with order number + email (same browser) | PASS |  |
| Tracking: wrong email does not reveal the order | PASS |  |
| Checkout/Confirmation/Tracking: no JS errors | PASS | [] |
| Contact: demo notice visible | PASS |  |
| Contact: blank submit → 4 inline errors, focus on first field | PASS |  |
| Contact: demo submit says NOTHING was sent (no false delivery claim) | PASS | Demo mode: your message was not sent to anyone. It was saved in this browser only. |
| Contact: demo message saved locally for the demo admin | PASS |  |
| Newsletter: invalid email → error status, aria-invalid | PASS |  |
| Newsletter: demo submit says nothing was subscribed | PASS | Demo mode: nothing was sent and no subscription was created. Your address was saved in thi |
| Newsletter: lowercased address saved locally; duplicate not added | PASS |  |
| Contact/Newsletter: no JS errors | PASS | [] |
| Admin: first-visit setup creates a local account and opens the dashboard | PASS | http://127.0.0.1:56825/admin/dashboard.html |
| Admin: messages.html shows the demo data written by the storefront | PASS |  |
| Admin: subscribers.html shows the demo data written by the storefront | PASS |  |
| Admin: orders.html shows the demo data written by the storefront | PASS |  |
| Admin: dashboard/products/customers/settings load without JS errors or CSP violations | PASS | [] |
| Admin: dashboard bar chart heights applied via DOM (no inline style attr) | PASS | ['0%', '0%', '0%', '0%', '0%', '0%', '70%'] |
| Admin: unauthenticated visit is redirected to login (UI gate only, not real security) | PASS | http://127.0.0.1:56825/admin/login.html?next=products.html |
| LIVE mode (mock 200): contact POSTs JSON to endpoint and shows success | PASS | thank you. your message has been sent. |
| LIVE mode: demo notice hidden | PASS |  |
| LIVE mode (mock 200): order POSTed with items/total, then confirmation shown | PASS |  |
| LIVE mode (mock 500): contact shows an error, never a success message | PASS | we could not send your message. please try again later. |
| LIVE mode (mock 500): order NOT placed — stays on checkout, no order saved, bag kept | PASS |  |
| Mobile nav: closed by default | PASS |  |
| Mobile nav: toggle opens menu, aria-expanded=true | PASS |  |
| Mobile nav: Escape closes and returns focus to toggle | PASS |  |
| Nav: resizing to desktop resets state, links visible | PASS |  |
| Search: overlay opens and input is focused | PASS |  |
| Search: Tab stays trapped inside the dialog | PASS |  |
| Search: Escape closes and focus returns to the search button | PASS |  |
| Search: Enter goes to shop with the query | PASS |  |
| Keyboard: first Tab stop has a visible focus indicator | PASS | ['A', 'skip-link', 'solid', '2px', 'none'] |
| Reduced motion: hero float animation and tilt disabled | PASS | ['none', 'none'] |
| Hero depth active on desktop (float animation, tilt, perspective) | PASS | ['lv-float', 'matrix3d(0.999048, 0, 0.0436194, 0, -0.000761263, 0.999848, 0.0174358, 0, -0 |
| Hero tilt is off on mobile (flat photo) | PASS | none |
| CLS (local lab, stubbed assets) home @1440px ≤ 0.1 | PASS | 0.0000 |
| CLS (local lab, stubbed assets) home @375px ≤ 0.1 | PASS | 0.0000 |

## Unresolved issues

See "Known issues and limits" in `README.md` and the open concerns in `LICENSES-AND-ASSETS.md`.
