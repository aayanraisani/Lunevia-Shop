/* =========================================================
   LUNÉVIA — VISUAL EFFECTS
   Scroll reveals, header/progress/back-to-top, cart feedback,
   parallax and product zoom. No libraries; does nothing for
   visitors who prefer reduced motion.
========================================================= */

(function () {
    "use strict";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const REVEAL_TARGETS = [
        ".section-heading-row", ".section-heading", ".trust-item", ".category-card",
        ".ritual-step", ".newsletter-box", ".footer-brand", ".site-footer .col-6",
        ".shop-header", ".page-hero", ".info-card", ".faq-item", ".about-section .row > *"
    ].join(",");

    const GRID_IDS = ["featuredGrid", "arrivalsGrid", "shopGrid", "wishlistGrid", "relatedGrid", "relatedProductsGrid"];

    const observer = "IntersectionObserver" in window
        ? new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" })
        : null;

    function reveal(element, index = 0, variant = "") {
        if (!observer || element.classList.contains("lv-reveal")) return;

        element.classList.add("lv-reveal");
        if (variant) element.classList.add(`lv-reveal--${variant}`);
        element.style.setProperty("--lv-delay", `${Math.min(index, 7) * 90}ms`);
        observer.observe(element);
    }

    function revealGridChildren(grid) {
        Array.from(grid.children).forEach((child, index) => reveal(child, index));
    }

    function initReveals() {
        document.querySelectorAll(REVEAL_TARGETS).forEach((element, index) => reveal(element, index % 4));
        document.querySelectorAll(".editorial-content").forEach((element) => reveal(element, 0, "left"));
        document.querySelectorAll(".editorial-image").forEach((element) => reveal(element, 1, "right"));

        GRID_IDS.map((id) => document.getElementById(id)).filter(Boolean).forEach((grid) => {
            revealGridChildren(grid);
            // cards are rendered by JavaScript, often after this script runs
            new MutationObserver(() => revealGridChildren(grid)).observe(grid, { childList: true });
        });
    }

    /* ---------- header, progress bar, back to top, parallax ---------- */

    function initScrollEffects() {
        const header = document.querySelector(".site-header");
        const heroImage = document.querySelector(".hero-image img");
        const editorialImage = document.querySelector(".editorial-image img");

        const bar = document.createElement("div");
        bar.className = "scroll-progress";
        bar.setAttribute("aria-hidden", "true");

        const topButton = document.createElement("button");
        topButton.type = "button";
        topButton.className = "back-to-top";
        topButton.setAttribute("aria-label", "Back to top");
        topButton.innerHTML = '<i class="bi bi-arrow-up"></i>';
        topButton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

        document.body.append(bar, topButton);

        let ticking = false;

        function update() {
            const scrolled = window.scrollY;
            const max = document.documentElement.scrollHeight - window.innerHeight;

            bar.style.transform = `scaleX(${max > 0 ? Math.min(scrolled / max, 1) : 0})`;
            topButton.classList.toggle("is-shown", scrolled > 600);
            if (header) header.classList.toggle("is-scrolled", scrolled > 10);

            if (heroImage && scrolled < window.innerHeight) heroImage.style.translate = `0 ${scrolled * 0.06}px`;

            if (editorialImage) {
                const box = editorialImage.parentElement.getBoundingClientRect();
                if (box.top < window.innerHeight && box.bottom > 0) editorialImage.style.translate = `0 ${(box.top - window.innerHeight / 2) * -0.04}px`;
            }

            ticking = false;
        }

        window.addEventListener("scroll", () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        }, { passive: true });

        update();
    }

    /* ---------- cart & wishlist feedback ---------- */

    function initCounterBump() {
        document.querySelectorAll(".nav-count").forEach((count) => {
            let previous = count.textContent;

            new MutationObserver(() => {
                if (count.textContent === previous) return;

                previous = count.textContent;
                count.classList.remove("is-bumping");
                void count.offsetWidth;
                count.classList.add("is-bumping");
            }).observe(count, { childList: true, characterData: true, subtree: true });
        });
    }

    // a small copy of the product photo flies into the bag icon
    function flyToBag(button) {
        const target = document.querySelector(".nav-action .cart-count");
        const source = button.closest(".product-card, .product-detail-section, main")?.querySelector("img");
        if (!target || !source) return;

        const from = source.getBoundingClientRect();
        const to = target.getBoundingClientRect();
        const dot = document.createElement("img");

        dot.src = source.currentSrc || source.src;
        dot.alt = "";
        dot.className = "fly-dot";
        dot.style.left = `${from.left + from.width / 2 - 27}px`;
        dot.style.top = `${from.top + from.height / 2 - 27}px`;
        document.body.appendChild(dot);

        const animation = dot.animate([
            { transform: "translate(0, 0) scale(1)", opacity: 1 },
            { transform: `translate(${to.left - from.left - from.width / 2 + 10}px, ${to.top - from.top - from.height / 2 + 10}px) scale(0.2)`, opacity: 0.25 }
        ], { duration: 750, easing: "cubic-bezier(0.5, 0, 0.75, 0)" });

        animation.onfinish = () => dot.remove();
    }

    function initFlyToBag() {
        document.addEventListener("click", (event) => {
            const button = event.target.closest("[data-add-to-cart], #productAddToCart");
            const count = document.querySelector(".nav-action .cart-count");
            if (!button || button.disabled || !count) return;

            // only animate when the item really went into the bag
            const before = count.textContent;
            requestAnimationFrame(() => {
                if (count.textContent !== before) flyToBag(button);
            });
        }, true); // capture phase: snapshot the count before main.js updates it
    }

    /* ---------- product page zoom follows the cursor ---------- */

    function initProductZoom() {
        const frame = document.querySelector(".product-main-image");
        if (!frame) return;

        frame.addEventListener("pointermove", (event) => {
            const box = frame.getBoundingClientRect();
            frame.style.setProperty("--zoom-x", `${((event.clientX - box.left) / box.width) * 100}%`);
            frame.style.setProperty("--zoom-y", `${((event.clientY - box.top) / box.height) * 100}%`);
        });
    }

    initReveals();
    initScrollEffects();
    initCounterBump();
    initFlyToBag();
    initProductZoom();
})();
