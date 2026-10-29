/* =========================================================
   LUNÉVIA ADMIN — LOGIN PAGE (js/admin-login.js)
   First visit: create the admin account. After that: sign in.
   Needs ../js/store.js and js/admin-data.js.
========================================================= */

(function () {
    "use strict";

    const loginForm = document.getElementById("adminLoginForm");
    const setupForm = document.getElementById("adminSetupForm");

    if (!loginForm || !setupForm) return;

    // only these pages can be opened after signing in (stops redirects to other sites)
    const allowedPages = [
        "dashboard.html", "products.html", "orders.html", "customers.html",
        "messages.html", "subscribers.html", "settings.html"
    ];

    function getNextPage() {
        let next = new URLSearchParams(window.location.search).get("next") || "";

        // some static hosts remove ".html" from page URLs, so we add it back before checking
        if (next && !next.endsWith(".html")) next += ".html";

        return allowedPages.includes(next) ? next : "dashboard.html";
    }

    function showMessage(id, text) {
        const box = document.getElementById(id);
        if (!box) return;

        box.textContent = text || "";
        box.className = text ? "form-alert error" : "form-alert";
    }

    function setBusy(button, isBusy, busyText) {
        if (isBusy) {
            button.dataset.originalHtml = button.innerHTML;
            button.textContent = busyText;
        } else if (button.dataset.originalHtml) {
            button.innerHTML = button.dataset.originalHtml;
        }

        button.disabled = isBusy;
    }

    // development switch in admin-layout.js: no login needed
    if (!ADMIN_AUTH_ENABLED || isAdminLoggedIn()) {
        window.location.replace(getNextPage());
        return;
    }

    // first time ever: set up the admin account. Otherwise: sign in.
    if (hasAdminAccount()) {
        loginForm.hidden = false;
    } else {
        setupForm.hidden = false;
    }

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const button = loginForm.querySelector('button[type="submit"]');
        showMessage("adminLoginMessage", "");
        setBusy(button, true, "Signing in…");

        const result = await loginAdmin(
            document.getElementById("adminEmail").value,
            document.getElementById("adminPassword").value
        );

        if (!result.ok) {
            setBusy(button, false);
            showMessage("adminLoginMessage", result.error);
            return;
        }

        window.location.href = getNextPage();
    });

    setupForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const button = setupForm.querySelector('button[type="submit"]');
        const password = document.getElementById("setupPassword").value;
        const confirm = document.getElementById("setupConfirm").value;

        showMessage("adminSetupMessage", "");

        if (password !== confirm) {
            showMessage("adminSetupMessage", "The two passwords do not match.");
            return;
        }

        setBusy(button, true, "Creating your account…");

        const result = await setupAdmin(document.getElementById("setupEmail").value, password);

        if (!result.ok) {
            setBusy(button, false);
            showMessage("adminSetupMessage", result.error);
            return;
        }

        window.location.href = getNextPage();
    });
})();