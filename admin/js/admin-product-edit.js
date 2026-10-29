/* =========================================================
   LUNÉVIA ADMIN — ADD / EDIT PRODUCT (js/admin-product-edit.js)
   product-edit.html           -> add a new product
   product-edit.html?id=7      -> edit product 7
========================================================= */

(function () {
    "use strict";

    const form = document.getElementById("productForm");
    const messageBox = document.getElementById("productFormMessage");
    const saveButton = document.getElementById("pfSave");
    const deleteButton = document.getElementById("pfDelete");
    const preview = document.getElementById("pfPreview");
    const fileInput = document.getElementById("pfFile");
    const urlInput = document.getElementById("pfImageUrl");

    const fieldIds = {
        name: "pfName",
        category: "pfCategory",
        price: "pfPrice",
        oldPrice: "pfOldPrice",
        stock: "pfStock",
        badge: "pfBadge",
        description: "pfDescription",
        image: "pfImageUrl"
    };

    const MAX_PHOTO_SIZE = 10 * 1024 * 1024;   // photos bigger than this are refused
    const PHOTO_PIXELS = 900;                  // photos are shrunk to this width or height
    const PHOTO_QUALITY = 0.82;

    const productId = getUrlParam("id");
    const editing = productId ? getAdminProduct(productId) : null;

    // the photo that will be saved: a web link, or an uploaded photo (a data: link)
    let imageValue = "";


    /* ---------- messages ---------- */

    function showMessage(text, type) {
        messageBox.textContent = text || "";
        messageBox.className = text ? `form-alert ${type || "error"}` : "form-alert";
    }

    function clearFieldErrors() {
        form.querySelectorAll(".has-error").forEach((holder) => holder.classList.remove("has-error"));
    }

    function showFieldError(field, text) {
        const input = document.getElementById(fieldIds[field] || "pfName");
        const holder = input ? input.closest(".form-group") : null;

        showMessage(text, "error");
        if (holder) holder.classList.add("has-error");

        if (input) {
            input.focus();
            input.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }


    /* ---------- photo ---------- */

    function updatePreview() {
        preview.src = adminImageSrc(imageValue);
    }

    // shrinks a photo so it fits comfortably in the browser's storage
    function shrinkPhoto(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onerror = () => reject(new Error("read"));

            reader.onload = () => {
                const image = new Image();

                image.onerror = () => reject(new Error("image"));

                image.onload = () => {
                    const scale = Math.min(1, PHOTO_PIXELS / Math.max(image.width, image.height));
                    const width = Math.max(1, Math.round(image.width * scale));
                    const height = Math.max(1, Math.round(image.height * scale));
                    const canvas = document.createElement("canvas");

                    canvas.width = width;
                    canvas.height = height;

                    const context = canvas.getContext("2d");
                    context.fillStyle = "#ffffff";   // see-through PNG photos get a white background
                    context.fillRect(0, 0, width, height);
                    context.drawImage(image, 0, 0, width, height);

                    resolve(canvas.toDataURL("image/jpeg", PHOTO_QUALITY));
                };

                image.src = reader.result;
            };

            reader.readAsDataURL(file);
        });
    }

    fileInput.addEventListener("change", async () => {
        const file = fileInput.files[0];
        if (!file) return;

        showMessage("");

        if (!file.type.startsWith("image/")) {
            showMessage("Please choose a photo (JPG, PNG or WebP).");
            fileInput.value = "";
            return;
        }

        if (file.size > MAX_PHOTO_SIZE) {
            showMessage("That photo is too big. Please choose one under 10 MB.");
            fileInput.value = "";
            return;
        }

        try {
            imageValue = await shrinkPhoto(file);
            urlInput.value = "";
            urlInput.placeholder = "Uploaded photo (paste a link here to replace it)";
            updatePreview();
        } catch (error) {
            showMessage("We couldn't read that photo. Try another one.");
            fileInput.value = "";
        }
    });

    urlInput.addEventListener("input", () => {
        imageValue = urlInput.value.trim();
        urlInput.placeholder = "https://example.com/photo.jpg";
        updatePreview();
    });


    /* ---------- fill the form when editing ---------- */

    function fillForm(product) {
        document.getElementById("pfName").value = product.name;
        document.getElementById("pfCategory").value = product.category;
        document.getElementById("pfPrice").value = product.price;
        document.getElementById("pfOldPrice").value = product.oldPrice || "";
        document.getElementById("pfStock").value = product.stock;
        document.getElementById("pfBadge").value = product.badge || "";
        document.getElementById("pfShort").value = product.shortDescription;
        document.getElementById("pfDescription").value = product.description;
        document.getElementById("pfFeatured").checked = product.featured;

        imageValue = product.image;

        if (imageValue.startsWith("data:")) {
            urlInput.placeholder = "Uploaded photo (paste a link here to replace it)";
        } else {
            urlInput.value = imageValue;
        }

        updatePreview();
    }


    /* ---------- save & delete ---------- */

    form.addEventListener("input", (event) => {
        const holder = event.target.closest(".form-group");
        if (holder) holder.classList.remove("has-error");
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        clearFieldErrors();
        showMessage("");

        const result = saveAdminProduct({
            id: editing ? editing.id : null,
            name: document.getElementById("pfName").value,
            category: document.getElementById("pfCategory").value,
            price: document.getElementById("pfPrice").value,
            oldPrice: document.getElementById("pfOldPrice").value,
            stock: document.getElementById("pfStock").value,
            badge: document.getElementById("pfBadge").value,
            shortDescription: document.getElementById("pfShort").value,
            description: document.getElementById("pfDescription").value,
            featured: document.getElementById("pfFeatured").checked,
            image: imageValue
        });

        if (!result.ok) {
            if (result.field) {
                showFieldError(result.field, result.error);
            } else {
                showMessage(result.error);
            }
            return;
        }

        saveButton.disabled = true;
        showToast(editing ? "Product saved." : "Product added.");
        setTimeout(() => { window.location.href = "products.html"; }, 700);
    });

    deleteButton.addEventListener("click", async () => {
        if (!editing) return;

        const confirmed = await adminConfirm({
            title: "Delete this product?",
            message: `"${editing.name}" will disappear from the shop. This cannot be undone.`,
            confirmText: "Delete",
            danger: true
        });

        if (!confirmed) return;

        const result = deleteAdminProduct(editing.id);

        if (!result.ok) {
            showMessage(result.error);
            return;
        }

        showToast("Product deleted.");
        setTimeout(() => { window.location.href = "products.html"; }, 700);
    });


    /* ---------- start ---------- */

    if (productId && !editing) {
        document.getElementById("productFormTitle").textContent = "Product not found";
        document.getElementById("productFormIntro").textContent = "This product does not exist or was deleted.";
        form.querySelectorAll("input, select, textarea, button").forEach((element) => { element.disabled = true; });
        showMessage("We couldn't find that product. Go back to the product list.");
        return;
    }

    if (editing) {
        document.getElementById("productFormTitle").textContent = "Edit product";
        document.getElementById("productFormIntro").textContent = "Change the details and save. The shop updates right away.";
        document.title = "Edit Product | Lunévia Admin";
        deleteButton.hidden = false;
        fillForm(editing);
    }
})();