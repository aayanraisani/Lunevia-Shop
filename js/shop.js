/* =========================================================
   LUNÉVIA — SHOP PAGE LOGIC
========================================================= */

(function () {
    "use strict";

    const state = {
        category: "all",
        search: "",
        sort: "featured",
        minPrice: null,
        maxPrice: null
    };

    const shopGrid = document.getElementById("shopGrid");
    const shopResultCount = document.getElementById("shopResultCount");
    const shopEmptyState = document.getElementById("shopEmptyState");
    const categoryButtons = document.querySelectorAll("[data-shop-category]");
    const sortSelect = document.getElementById("shopSort");
    const shopSearchInput = document.getElementById("shopSearchInput");
    const priceMinInput = document.getElementById("priceMin");
    const priceMaxInput = document.getElementById("priceMax");
    const priceApplyButton = document.getElementById("priceApply");
    const priceClearButton = document.getElementById("priceClear");
    const resetFiltersButton = document.getElementById("shopResetFilters");

    const validCategories = ["skincare", "beauty", "jewelry", "accessories"];

    // heading and text shown at the top of the shop for each category
    const categoryInfo = {
        all: {
            title: "Shop <em>everything.</em>",
            text: "Skincare, beauty, jewelry and accessories — all in one place.",
            pageTitle: "Shop | Lunévia"
        },
        skincare: {
            title: "Shop <em>skincare.</em>",
            text: "Rituals for your natural glow.",
            pageTitle: "Skincare | Lunévia"
        },
        beauty: {
            title: "Shop <em>beauty.</em>",
            text: "Essentials that elevate you.",
            pageTitle: "Beauty | Lunévia"
        },
        jewelry: {
            title: "Shop <em>jewelry.</em>",
            text: "Little details, lasting impressions.",
            pageTitle: "Jewelry | Lunévia"
        },
        accessories: {
            title: "Shop <em>accessories.</em>",
            text: "Complete your everyday style.",
            pageTitle: "Accessories | Lunévia"
        }
    };


    /* ---------- start-up ---------- */

    function removeRatingSortIfHidden() {
        if (SHOW_RATINGS || !sortSelect) return;

        const option = sortSelect.querySelector('option[value="rating"]');
        if (option) option.remove();
    }

    function initStateFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const categoryParam = params.get("category");
        const searchParam = params.get("search");

        if (validCategories.includes(categoryParam)) state.category = categoryParam;

        if (searchParam) {
            state.search = searchParam.trim();
            if (shopSearchInput) shopSearchInput.value = state.search;
        }
    }

    function updateHeader() {
        const info = categoryInfo[state.category] || categoryInfo.all;

        const heading = document.querySelector(".shop-header h1");
        const description = document.querySelector(".shop-header-desc");

        if (heading) heading.innerHTML = info.title;
        if (description) description.textContent = info.text;

        document.title = info.pageTitle;
    }

    // keeps the address bar in sync so a filtered page can be shared or refreshed
    function updateUrl() {
        const params = new URLSearchParams();

        if (state.category !== "all") params.set("category", state.category);
        if (state.search) params.set("search", state.search);

        const query = params.toString();

        try {
            history.replaceState(null, "", query ? `shop.html?${query}` : "shop.html");
        } catch (error) {
            // some browsers block this when the page is opened as a local file
        }

        if (typeof highlightActiveNav === "function") highlightActiveNav();
    }

    function setActiveCategoryTab() {
        categoryButtons.forEach((button) => {
            const isActive = button.dataset.shopCategory === state.category;
            button.classList.toggle("active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });
    }


    /* ---------- filtering & sorting ---------- */

    function sortProducts(list, sortType) {
        const sorted = [...list];

        switch (sortType) {
            case "price-low": return sorted.sort((a, b) => a.price - b.price);
            case "price-high": return sorted.sort((a, b) => b.price - a.price);
            case "rating": return sorted.sort((a, b) => b.rating - a.rating);
            case "newest": return sorted.sort((a, b) => b.id - a.id);
            case "featured":
            default: return sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        }
    }

    function getVisibleProducts() {
        let result = searchProducts(state.search);

        if (state.category !== "all") {
            result = result.filter((product) => product.category === state.category);
        }

        if (state.minPrice !== null) {
            result = result.filter((product) => product.price >= state.minPrice);
        }

        if (state.maxPrice !== null) {
            result = result.filter((product) => product.price <= state.maxPrice);
        }

        return sortProducts(result, state.sort);
    }

    function render() {
        if (!shopGrid) return;

        const result = getVisibleProducts();

        if (shopResultCount) {
            shopResultCount.textContent = `${result.length} ${result.length === 1 ? "product" : "products"}`;
        }

        if (result.length === 0) {
            shopGrid.innerHTML = "";
            if (shopEmptyState) shopEmptyState.style.display = "block";
            return;
        }

        if (shopEmptyState) shopEmptyState.style.display = "none";

        shopGrid.innerHTML = result.map((product) => buildProductCard(product, { headingTag: "h2" })).join("");
    }


    /* ---------- price filter ---------- */

    function readPrice(input) {
        if (!input || input.value.trim() === "") return null;

        const value = parseFloat(input.value);
        return Number.isFinite(value) && value >= 0 ? value : null;
    }

    function applyPriceFilter() {
        const minValue = readPrice(priceMinInput);
        const maxValue = readPrice(priceMaxInput);

        if (minValue !== null && maxValue !== null && minValue > maxValue) {
            showToast("The minimum price can't be higher than the maximum.", "error");
            return;
        }

        state.minPrice = minValue;
        state.maxPrice = maxValue;
        render();
    }

    function clearPriceFilter() {
        state.minPrice = null;
        state.maxPrice = null;

        if (priceMinInput) priceMinInput.value = "";
        if (priceMaxInput) priceMaxInput.value = "";
    }

    function resetAllFilters() {
        state.category = "all";
        state.search = "";
        state.sort = "featured";

        clearPriceFilter();

        if (shopSearchInput) shopSearchInput.value = "";
        if (sortSelect) sortSelect.value = "featured";

        setActiveCategoryTab();
        updateHeader();
        updateUrl();
        render();
    }


    /* ---------- events ---------- */

    categoryButtons.forEach((button) => {
        button.addEventListener("click", () => {
            state.category = button.dataset.shopCategory;
            setActiveCategoryTab();
            updateHeader();
            updateUrl();
            render();
        });
    });

    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            state.sort = sortSelect.value;
            render();
        });
    }

    let searchDebounceTimer = null;

    if (shopSearchInput) {
        shopSearchInput.addEventListener("input", () => {
            clearTimeout(searchDebounceTimer);

            searchDebounceTimer = setTimeout(() => {
                state.search = shopSearchInput.value.trim();
                updateUrl();
                render();
            }, 250);
        });
    }

    if (priceApplyButton) priceApplyButton.addEventListener("click", applyPriceFilter);

    [priceMinInput, priceMaxInput].forEach((input) => {
        if (!input) return;

        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                applyPriceFilter();
            }
        });
    });

    if (priceClearButton) {
        priceClearButton.addEventListener("click", () => {
            clearPriceFilter();
            render();
        });
    }

    if (resetFiltersButton) resetFiltersButton.addEventListener("click", resetAllFilters);


    /* ---------- go ---------- */

    removeRatingSortIfHidden();
    initStateFromUrl();
    setActiveCategoryTab();
    updateHeader();
    render();
})();