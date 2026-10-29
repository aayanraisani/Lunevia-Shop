/* =========================================================
   LUNÉVIA ADMIN — PRODUCTS LIST (js/admin-products.js)
========================================================= */

(function () {
    "use strict";

    const LOW_STOCK = 5;

    const table = document.getElementById("productsTable");
    const searchInput = document.getElementById("productSearch");
    const categoryFilter = document.getElementById("productCategoryFilter");
    const countText = document.getElementById("productCount");
    const restoreButton = document.getElementById("restoreSamples");

    function buildPrice(product) {
        const oldPrice = product.oldPrice ? ` <s class="old-price">${formatPrice(product.oldPrice)}</s>` : "";
        return `${formatPrice(product.price)}${oldPrice}`;
    }

    function buildStock(product) {
        if (product.stock === 0) return '<span class="stock-low">Sold out</span>';
        if (product.stock <= LOW_STOCK) return `<span class="stock-low">${product.stock} left</span>`;
        return String(product.stock);
    }

    function buildTags(product) {
        const tags = [];
        if (product.badge) tags.push(`<span class="tag">${escapeHtml(product.badge)}</span>`);
        if (product.featured) tags.push('<span class="tag">Homepage</span>');
        return tags.join(" ");
    }

    function render() {
        const all = getAdminProducts();
        const query = searchInput.value.trim().toLowerCase();
        const category = categoryFilter.value;

        const rows = all
            .filter((product) => !category || product.category === category)
            .filter((product) => !query || `${product.name} ${product.category}`.toLowerCase().includes(query))
            .sort((a, b) => b.id - a.id);

        countText.textContent = `${rows.length} of ${all.length} products`;

        if (all.length === 0) {
            table.innerHTML = `
                <div class="admin-empty">
                    <i class="bi bi-box-seam"></i>
                    You have no products yet.<br>
                    <a href="product-edit.html" class="admin-btn admin-btn-primary" style="margin-top: 14px;">Add your first product</a>
                </div>
            `;
            return;
        }

        if (rows.length === 0) {
            table.innerHTML = '<p class="admin-empty"><i class="bi bi-search"></i>No products match your search.</p>';
            return;
        }

        table.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th class="num">Price</th>
                        <th class="num">Stock</th>
                        <th>Tags</th>
                        <th><span class="visually-hidden">Actions</span></th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.map((product) => `
                        <tr>
                            <td>
                                <div class="cell-product">
                                    <img class="thumb-sm" src="${escapeHtml(adminImageSrc(product.image))}" alt="" loading="lazy">
                                    <div>
                                        <strong>${escapeHtml(product.name)}</strong>
                                        <small>ID ${product.id}</small>
                                    </div>
                                </div>
                            </td>
                            <td>${escapeHtml(capitalize(product.category))}</td>
                            <td class="num">${buildPrice(product)}</td>
                            <td class="num">${buildStock(product)}</td>
                            <td>${buildTags(product)}</td>
                            <td>
                                <div class="row-actions">
                                    <a class="admin-btn admin-btn-ghost admin-btn-small" href="product-edit.html?id=${product.id}">Edit</a>
                                    <a class="admin-btn admin-btn-ghost admin-btn-small" href="../product.html?id=${product.id}" target="_blank" rel="noopener">View</a>
                                    <button type="button" class="admin-btn admin-btn-danger-ghost admin-btn-small" data-delete-product="${product.id}">Delete</button>
                                </div>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;
    }

    async function deleteProduct(id) {
        const product = getAdminProduct(id);
        if (!product) return;

        const confirmed = await adminConfirm({
            title: "Delete this product?",
            message: `"${product.name}" will disappear from the shop. This cannot be undone.`,
            confirmText: "Delete",
            danger: true
        });

        if (!confirmed) return;

        const result = deleteAdminProduct(id);

        if (!result.ok) {
            showToast(result.error, "error");
            return;
        }

        showToast("Product deleted.");
        render();
    }

    async function restoreSamples() {
        const confirmed = await adminConfirm({
            title: "Restore the sample products?",
            message: "All products will be replaced by the 12 sample products. Products you added or changed will be lost.",
            confirmText: "Restore",
            danger: true
        });

        if (!confirmed) return;

        const result = restoreSampleProducts();

        if (!result.ok) {
            showToast(result.error, "error");
            return;
        }

        showToast("Sample products restored.");
        render();
    }

    table.addEventListener("click", (event) => {
        const button = event.target.closest("[data-delete-product]");
        if (button) deleteProduct(button.dataset.deleteProduct);
    });

    searchInput.addEventListener("input", render);
    categoryFilter.addEventListener("change", render);
    restoreButton.addEventListener("click", restoreSamples);

    render();
})();