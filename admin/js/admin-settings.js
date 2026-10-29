/* =========================================================
   LUNÉVIA ADMIN — SETTINGS (js/admin-settings.js)
========================================================= */

(function () {
    "use strict";

    const shippingForm = document.getElementById("shippingForm");
    const passwordForm = document.getElementById("adminPasswordForm");
    const thresholdInput = document.getElementById("setThreshold");
    const feeInput = document.getElementById("setFee");


    function showMessage(id, text, type) {
        const box = document.getElementById(id);
        if (!box) return;

        box.textContent = text || "";
        box.className = text ? `form-alert ${type || "error"}` : "form-alert";
    }


    /* ---------- shipping ---------- */

    function fillShipping() {
        const settings = getAdminSettings();
        thresholdInput.value = settings.freeShippingThreshold;
        feeInput.value = settings.flatShippingFee;
    }

    shippingForm.addEventListener("submit", (event) => {
        event.preventDefault();
        showMessage("shippingMessage", "");

        const result = saveAdminSettings({
            freeShippingThreshold: thresholdInput.value,
            flatShippingFee: feeInput.value
        });

        if (!result.ok) {
            showMessage("shippingMessage", result.error, "error");
            const field = result.field === "freeShippingThreshold" ? thresholdInput : feeInput;
            field.focus();
            return;
        }

        fillShipping();
        showMessage("shippingMessage", "Shipping saved. The shop uses the new amounts straight away.", "success");
        showToast("Shipping saved.");
    });


    /* ---------- admin password ---------- */

    passwordForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        showMessage("adminPasswordMessage", "");

        const current = document.getElementById("apCurrent").value;
        const next = document.getElementById("apNew").value;
        const confirm = document.getElementById("apConfirm").value;

        if (next !== confirm) {
            showMessage("adminPasswordMessage", "The two new passwords do not match.", "error");
            return;
        }

        const result = await changeAdminPassword(current, next);

        if (!result.ok) {
            showMessage("adminPasswordMessage", result.error, "error");
            return;
        }

        passwordForm.reset();
        showMessage("adminPasswordMessage", "Your password has been changed.", "success");
        showToast("Password changed.");
    });


    /* ---------- data & storage ---------- */

    function renderStorage() {
        const usage = getAdminStorageUsage();
        const fill = document.getElementById("storageFill");
        const megabytes = (usage.usedBytes / (1024 * 1024)).toFixed(2);

        fill.style.width = `${Math.max(usage.percent, 1)}%`;
        fill.classList.toggle("warn", usage.percent >= 80);

        document.getElementById("storageText").textContent =
            `${megabytes} MB of about 5 MB used (${usage.percent}%).` +
            (usage.percent >= 80 ? " Storage is almost full. Use photo links instead of uploads, or download a backup." : "");
    }

    document.getElementById("exportData").addEventListener("click", () => {
        const today = new Date().toISOString().slice(0, 10);
        downloadTextFile(`lunevia-backup-${today}.json`, JSON.stringify(getAdminExportData(), null, 2), "application/json");
        showToast("Backup downloaded.");
    });


    /* ---------- start ---------- */

    const email = getAdminEmail();
    document.getElementById("adminSignedInAs").textContent = email ? `Signed in as ${email}.` : "";

    fillShipping();
    renderStorage();
})();