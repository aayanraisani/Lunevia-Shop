# Licenses and Assets

Last reviewed: 2026-10-20. This file separates **what was verified** from **what was not**. The audit was done without internet access, so no licence text, version or URL could be re-checked online during this work. Every "licence" below is what the project or its publisher is **generally known** to use, marked *unverified* until you confirm it at the linked source.

This is an engineering inventory, **not legal advice**. Before you sell the template, have the points under "Open concerns" checked.

## 1. How the code and the third-party material are licensed

| Part | Status |
|---|---|
| Your own HTML, CSS and JavaScript (everything in this ZIP except the third-party items below) | You decide the licence and you have to put one in. **This ZIP contains no `LICENSE` file on purpose**, because choosing the terms you sell under is your decision, not mine. |
| AI-assisted code | The project was built with Claude AI assistance, and this audit added more AI-assisted code. Rules on ownership of AI-generated output differ by country and by the terms of the tool used. Read the terms of service of the tool and, if the sale price matters, ask a lawyer. Nothing here claims AI output is automatically free of restrictions. |
| Third-party libraries, fonts and photos | Remain under **their own** licences (sections 2 to 4). Selling this template does not give you the right to relicense them. |

## 2. Code dependencies loaded from a CDN (nothing is copied into the ZIP)

| Name | Version in the pages | Source | Licence | Verified? | Commercial reuse | Notes |
|---|---|---|---|---|---|---|
| Bootstrap CSS | 5.3.8 | `https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css` | MIT (known for Bootstrap) | **Unverified** in this session (offline) | Appears permitted | The MIT notice must stay with copies of the code. Because the CSS is loaded from the CDN and not redistributed in the ZIP, nothing is bundled. If you ever copy Bootstrap into the project, include its licence text. The version number is what the original project used; its existence on the CDN could not be checked offline. |
| Bootstrap JavaScript | not loaded any more | n/a | MIT | n/a | n/a | It was only used for the mobile menu toggle. That is now plain code in `js/main.js`. |
| Bootstrap Icons (CSS and icon font) | 1.13.1 | `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css` | MIT (known for Bootstrap Icons) | **Unverified** | Appears permitted | Includes brand glyphs (Instagram, Pinterest, TikTok). The icon artwork is MIT, but the brands themselves are trademarks of their owners. The footer uses them only as profile links (still `#` placeholders). |
| Google Fonts CSS service | n/a | `fonts.googleapis.com` / `fonts.gstatic.com` | Service terms apply | **Unverified** | n/a | Every visitor's browser contacts Google to load the fonts. Depending on your market that can matter for privacy rules. Self-hosting the font files avoids it (not possible here without internet). |
| DM Sans | variable, wght 400..700 | Google Fonts | SIL Open Font License 1.1 (known) | **Unverified** | Appears permitted | OFL allows commercial use. If you ever bundle the font files, ship the OFL text with them. |
| Playfair Display | variable, wght 400..600 plus italic 400 | Google Fonts | SIL Open Font License 1.1 (known) | **Unverified** | Appears permitted | Same OFL conditions. |

**No new runtime dependency was added during this work.** One dependency was removed (Bootstrap JavaScript).

## 3. Files that are part of the ZIP

| File | Origin | Licence status | Concerns |
|---|---|---|---|
| `assets/favicon/favicon.svg` | Simple geometric mark. It carries an embedded **C2PA content-credentials manifest** showing it was produced with AI assistance (Claude). The file was left byte-for-byte unchanged to keep that provenance. | Ownership/copyrightability of purely AI-generated artwork is uncertain in some countries. **Unresolved.** | Consider replacing it with a mark you or a designer created and can document. |
| `assets/og-image.jpg` | Created during this audit with Python/Pillow: the word "Lunévia" and "BEAUTY, ELEVATED." on the brand background. It contains no photograph. Text was rendered with Liberation Serif (SIL OFL 1.1, known). | Original artwork by this work. Font licence unverified offline. | It is a plain placeholder. A designed share image is better for a real launch. |
| All other files | Your code and copy | See section 1 | Product descriptions and brand copy are sample text. Check them against your real products and local advertising rules (see section 5). |

## 4. Photographs (hotlinked, **not** in the ZIP)

The project contains **no local image files**. Every product, category and hero photo is loaded from Unsplash by URL. There are 19 distinct photos:

| ID | Product | Image path |
|---|---|---|
| 1 | Glow Renewal Serum | `images.unsplash.com/photo-1611930022073-b7a4ba5fcccd` |
| 2 | Hydrogel Glass Skin Mask | `images.unsplash.com/photo-1596755094514-f87e34085b2c` |
| 3 | Scalp Renewal Treatment | `images.unsplash.com/photo-1556228578-8c89e6adf883` |
| 4 | Everyday Beauty Set | `images.unsplash.com/photo-1596462502278-27bfdc403348` |
| 5 | Collagen Beauty Powder | `images.unsplash.com/photo-1571781926291-c477ebfd024b` |
| 6 | Matte Finish Lip Set | `images.unsplash.com/photo-1625093742435-6fa192b6fb10` |
| 7 | Aurelia Necklace | `images.unsplash.com/photo-1602173574767-37ac01994b2a` |
| 8 | Stainless Steel Hoop Set | `images.unsplash.com/photo-1630019852942-f89202989a59` |
| 9 | Charm Build-Your-Own Bracelet | `images.unsplash.com/photo-1611591437281-460bfbe1220a` |
| 10 | Luna Pearl Earrings | `images.unsplash.com/photo-1617038220319-276d3cfab638` |
| 11 | Silk Hair Scarf | `images.unsplash.com/photo-1601924994987-69e26d50dc26` |
| 12 | Structured Mini Tote | `images.unsplash.com/photo-1591561954557-26941169b49e` |

| Image path | Used on |
|---|---|
| `images.unsplash.com/photo-1487412947147-5cebf100ffc2` | about.html |
| `images.unsplash.com/photo-1515377905703-c4788e51af15` | index.html |
| `images.unsplash.com/photo-1515562141207-7a88fb7ce338` | index.html |
| `images.unsplash.com/photo-1522335789203-aabd1fc54bc9` | index.html, about.html |
| `images.unsplash.com/photo-1523779917675-b6ed3a42a561` | index.html |
| `images.unsplash.com/photo-1556229010-6c3f2c9ca5f8` | index.html |
| `images.unsplash.com/photo-1612817288484-6f916006741a` | index.html |

| Item | Status |
|---|---|
| Licence | Photos hosted on Unsplash are normally published under the **Unsplash License** (free to use, including commercially, without asking; limits on selling photos unchanged and on building a competing photo service). **Unverified** here. Each photo's page must be checked. |
| Photographer / credit | **Not recorded anywhere in the source.** The Unsplash License does not require credit, but crediting is good practice and you need the information if a photo ever has to be replaced. |
| Do the photos match the products? | **Almost certainly not.** They are stock images, so a buyer's shop must replace them with photos of the real products. Using a stock photo to represent a specific product can be misleading to customers. |
| People, logos and trademarks in the photos | **Unchecked.** The Unsplash License does not grant rights over people's likeness or brands that appear in a photo. |
| Availability | The site depends on `images.unsplash.com` being reachable and every one of the 19 photos still existing. The original deployment notes showed one product photo had already stopped loading once. |
| Redistribution inside the ZIP | Not applicable: only URLs are shipped. If you download and bundle the photos, re-read the licence for redistribution inside a product you sell. |
| Recommendation | Replace all 19 with photos you own or have an explicit written licence for before selling the template as a finished product, or sell it clearly as a template that uses placeholder images. |

## 5. Other things that affect resale

- **Brand name "Lunévia"**: no trademark search was done. Check it before selling or building a business on it.
- **Sample product claims**: descriptions mention ingredients, materials (for example gold plating, tarnish resistance) and skin or hair effects. They are placeholders and are **not** substantiated. Skincare and supplement-style claims (for example the collagen product) are regulated in many countries. Replace them with accurate information.
- **Sample policies** (`privacy.html`, `terms.html`, `shipping-returns.html`, `faq.html`): generic sample text, assume delivery inside Pakistan and show prices in USD. Not legal advice. Each legal page carries a visible "template note" for the site owner to remove after review.
- **Contact details** such as `hello@lunevia.com` and `+92 300 0000000` are placeholders.
- **Test data** used during QA (names, emails, orders) is not in the ZIP.

## 6. Open concerns, in priority order

1. Photos: replace the 19 hotlinked stock photos or verify each one (section 4).
2. Favicon provenance and AI-generated asset ownership (section 3).
3. Confirm the MIT / OFL / Unsplash terms from the official sources when you are online.
4. Trademark check for the name.
5. Legal review of the sample policy pages and product claims.
