/* =========================================================
   LUNÉVIA — PRODUCT DETAIL PAGE LOGIC
========================================================= */

(function () {
    "use strict";

    let currentProduct = null;
    let currentQuantity = 1;

    const addToCartButton = document.getElementById("productAddToCart");
    const qtyDisplay = document.getElementById("productQtyDisplay");
    const qtyIncrease = document.getElementById("productQtyIncrease");
    const qtyDecrease = document.getElementById("productQtyDecrease");
    const wishlistButton = document.getElementById("productWishlistBtn");
    const cartNote = document.getElementById("productCartNote");

    const addToCartHtml = 'Add to Bag <i class="bi bi-bag"></i>';


    function getProductIdFromUrl() {
        return new URLSearchParams(window.location.search).get("id");
    }

    function showProductNotFound() {
        const productContainer = document.getElementById("productDetailContainer");
        const notFoundState = document.getElementById("productNotFound");
        const relatedSection = document.getElementById("relatedProductsSection");

        if (productContainer) productContainer.style.display = "none";
        if (relatedSection) relatedSection.style.display = "none";
        if (notFoundState) notFoundState.style.display = "block";

        document.title = "Product not found | Lunévia";
    }


    /* ---------- page details for search engines ---------- */

    function updateMetaTags(product) {
        const description = product.shortDescription || product.description;

        document.title = `${product.name} | Lunévia`;

        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) metaDescription.setAttribute("content", description);

        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute("content", `${product.name} | Lunévia`);

        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) ogDescription.setAttribute("content", description);
    }

    function addStructuredData(product) {
        let tag = document.getElementById("productStructuredData");

        if (!tag) {
            tag = document.createElement("script");
            tag.type = "application/ld+json";
            tag.id = "productStructuredData";
            document.head.appendChild(tag);
        }

        tag.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            image: (product.images && product.images.length ? product.images : [product.image]).filter((link) => link && !String(link).startsWith("data:")),
            description: product.description,
            sku: `LV-${product.id}`,
            category: capitalize(product.category),
            brand: { "@type": "Brand", name: "Lunévia" },
            offers: {
                "@type": "Offer",
                url: window.location.href.split("#")[0],
                priceCurrency: LUNEVIA_CONFIG.currencyCode,
                price: product.price.toFixed(2),
                availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                itemCondition: "https://schema.org/NewCondition"
            }
        });
    }


    /* ---------- rendering ---------- */

    function renderBreadcrumb(product) {
        const breadcrumb = document.getElementById("productBreadcrumb");
        if (!breadcrumb) return;

        breadcrumb.innerHTML = `
            <a href="index.html">Home</a>
            <span aria-hidden="true">/</span>
            <a href="shop.html">Shop</a>
            <span aria-hidden="true">/</span>
            <a href="shop.html?category=${encodeURIComponent(product.category)}">${escapeHtml(capitalize(product.category))}</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">${escapeHtml(product.name)}</span>
        `;
    }

    function renderGallery(product) {
        const mainImage = document.getElementById("productMainImage");

        // the big photo: the browser picks a file size that fits the screen
        function showMainImage(url) {
            if (!mainImage) return;

            const srcset = buildImageSrcset(url, [600, 900, 1200]);
            mainImage.src = resizeImageUrl(url, 900);

            if (srcset) {
                mainImage.srcset = srcset;
                mainImage.sizes = "(min-width: 992px) 50vw, 100vw";
            } else {
                mainImage.removeAttribute("srcset");
                mainImage.removeAttribute("sizes");
            }
        }

        if (mainImage) {
            mainImage.alt = product.name;
            showMainImage(product.image);
        }

        const thumbnailContainer = document.getElementById("productThumbnails");
        if (!thumbnailContainer) return;

        const images = product.images || [];

        // thumbnails only make sense when there is more than one picture
        if (images.length <= 1) {
            thumbnailContainer.innerHTML = "";
            return;
        }

        thumbnailContainer.innerHTML = images
            .map((image, index) => `
                <button type="button" class="product-thumb ${index === 0 ? "active" : ""}" data-thumb-src="${escapeHtml(image)}" aria-label="Show picture ${index + 1}">
                    <img src="${escapeHtml(resizeImageUrl(image, 200))}" width="100" height="100" alt="${escapeHtml(product.name)} view ${index + 1}" loading="lazy">
                </button>
            `)
            .join("");

        const thumbs = thumbnailContainer.querySelectorAll(".product-thumb");

        thumbs.forEach((thumb) => {
            thumb.addEventListener("click", () => {
                thumbs.forEach((item) => item.classList.remove("active"));
                thumb.classList.add("active");
                showMainImage(thumb.dataset.thumbSrc);
            });
        });
    }

    function renderDetails(product) {
        const badgeElement = document.getElementById("productBadge");

        if (badgeElement) {
            if (product.badge) {
                badgeElement.textContent = product.badge.toUpperCase();
                badgeElement.className = `product-badge ${getBadgeClass(product.badge)}`;
                badgeElement.style.display = "inline-block";
            } else {
                badgeElement.style.display = "none";
            }
        }

        document.getElementById("productCategory").textContent = product.category.toUpperCase();
        document.getElementById("productName").textContent = product.name;
        document.getElementById("productDescription").textContent = product.description;

        const ratingElement = document.getElementById("productRating");

        if (ratingElement) {
            if (SHOW_RATINGS && product.reviewCount) {
                ratingElement.innerHTML = `
                    <i class="bi bi-star-fill"></i>
                    <span>${product.rating}</span>
                    <span class="review-count">(${product.reviewCount} reviews)</span>
                `;
                ratingElement.style.display = "flex";
            } else {
                ratingElement.innerHTML = "";
                ratingElement.style.display = "none";
            }
        }

        const priceElement = document.getElementById("productPrice");

        if (priceElement) {
            priceElement.innerHTML = `
                ${formatPrice(product.price)}
                ${product.oldPrice ? `<s class="old-price">${formatPrice(product.oldPrice)}</s>` : ""}
            `;
        }

        const stockElement = document.getElementById("productStock");

        if (stockElement) {
            if (product.stock <= 0) {
                stockElement.textContent = "Out of stock";
            } else if (product.stock <= 5) {
                stockElement.textContent = `Only ${product.stock} left`;
            } else {
                stockElement.textContent = `${product.stock} in stock`;
            }
        }
    }

    function renderRelatedProducts(product) {
        const relatedContainer = document.getElementById("relatedProductsGrid");
        const relatedSection = document.getElementById("relatedProductsSection");
        if (!relatedContainer) return;

        const related = getRelatedProducts(product, 4);

        if (related.length === 0) {
            if (relatedSection) relatedSection.style.display = "none";
            return;
        }

        relatedContainer.innerHTML = related
            .map((item) => buildProductCard(item, { colClass: "col-6 col-lg-3" }))
            .join("");
    }


    /* ---------- quantity & add to bag ---------- */

    function getQuantityInCart() {
        const item = getCart().find((cartItem) => cartItem.id === currentProduct.id);
        return item ? Number(item.quantity) || 0 : 0;
    }

    // keeps the buttons and the quantity in line with the stock left
    function refreshPurchaseControls() {
        if (!currentProduct) return;

        const inCart = getQuantityInCart();
        const remaining = Math.max(0, currentProduct.stock - inCart);

        currentQuantity = Math.min(Math.max(currentQuantity, 1), Math.max(remaining, 1));

        if (qtyDisplay) qtyDisplay.textContent = currentQuantity;
        if (qtyDecrease) qtyDecrease.disabled = currentQuantity <= 1;
        if (qtyIncrease) qtyIncrease.disabled = currentQuantity >= remaining;

        if (addToCartButton) {
            if (currentProduct.stock <= 0) {
                addToCartButton.disabled = true;
                addToCartButton.textContent = "Out of Stock";
            } else if (remaining <= 0) {
                addToCartButton.disabled = true;
                addToCartButton.textContent = "Maximum in Bag";
            } else {
                addToCartButton.disabled = false;
                addToCartButton.innerHTML = addToCartHtml;
            }
        }

        if (cartNote) {
            cartNote.textContent = inCart > 0 ? `${inCart} already in your bag.` : "";
        }
    }

    function initPurchaseControls() {
        if (qtyIncrease) {
            qtyIncrease.addEventListener("click", () => {
                currentQuantity++;
                refreshPurchaseControls();
            });
        }

        if (qtyDecrease) {
            qtyDecrease.addEventListener("click", () => {
                currentQuantity--;
                refreshPurchaseControls();
            });
        }

        if (addToCartButton) {
            addToCartButton.addEventListener("click", () => {
                if (!currentProduct || addToCartButton.disabled) return;

                const result = addToCart(currentProduct.id, currentQuantity);

                if (!result.ok) {
                    showToast(getAddToCartMessage(result), "error");
                    refreshPurchaseControls();
                    return;
                }

                currentQuantity = 1;
                refreshPurchaseControls();

                flashButton(addToCartButton, "Added ✓");
                showToast(getAddToCartMessage(result));
            });
        }
    }


    /* ---------- wishlist heart ---------- */

    function updateWishlistButton() {
        if (!wishlistButton || !currentProduct) return;

        const isSaved = getWishlist().includes(String(currentProduct.id));
        const icon = wishlistButton.querySelector("i");

        wishlistButton.classList.toggle("active", isSaved);
        wishlistButton.setAttribute("aria-pressed", String(isSaved));
        wishlistButton.setAttribute("aria-label", isSaved ? "Remove from wishlist" : "Add to wishlist");

        if (icon) icon.className = isSaved ? "bi bi-heart-fill" : "bi bi-heart";
    }

    function initWishlistButton() {
        if (!wishlistButton) return;

        wishlistButton.addEventListener("click", () => {
            if (!currentProduct) return;

            const isSaved = toggleWishlistItem(currentProduct.id);
            showToast(isSaved ? "Saved to your wishlist." : "Removed from your wishlist.");
        });

        document.addEventListener("lv:wishlist-updated", updateWishlistButton);
    }


    /* ---------- start ---------- */

    function init() {
        currentProduct = getProductById(getProductIdFromUrl());

        if (!currentProduct) {
            showProductNotFound();
            return;
        }

        const productContainer = document.getElementById("productDetailContainer");
        const notFoundState = document.getElementById("productNotFound");

        if (notFoundState) notFoundState.style.display = "none";
        if (productContainer) productContainer.style.display = "block";

        updateMetaTags(currentProduct);
        addStructuredData(currentProduct);
        renderBreadcrumb(currentProduct);
        renderGallery(currentProduct);
        renderDetails(currentProduct);
        renderRelatedProducts(currentProduct);

        initPurchaseControls();
        initWishlistButton();
        refreshPurchaseControls();
        updateWishlistButton();

        // the bag can change in another tab
        document.addEventListener("lv:cart-updated", refreshPurchaseControls);
    }

    init();
})();