/* =========================================================
   LUNÉVIA — LOGIN & REGISTER PAGE LOGIC
   Needs store.js.
========================================================= */

(function () {
    "use strict";

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const tabs = document.querySelectorAll("[data-auth-tab]");
    const panels = document.querySelectorAll(".auth-panel");

    if (!loginForm || !registerForm) return;

    // only these pages can be opened after signing in (stops redirects to other sites)
    const allowedRedirects = ["account.html", "checkout.html", "order-tracking.html"];

    function getRedirectTarget() {
        let target = new URLSearchParams(window.location.search).get("redirect") || "";

        // some hosts show pages without ".html" (clean URLs), so we add it back before checking
        if (target && !target.endsWith(".html")) target += ".html";

        return allowedRedirects.includes(target) ? target : "account.html";
    }

    function showTab(name) {
        tabs.forEach((tab) => {
            const isActive = tab.dataset.authTab === name;
            tab.classList.toggle("active", isActive);
            tab.setAttribute("aria-selected", String(isActive));
        });

        panels.forEach((panel) => {
            panel.hidden = panel.dataset.authPanel !== name;
        });
    }

    function showMessage(id, text, type) {
        const box = document.getElementById(id);
        if (!box) return;

        box.textContent = text || "";
        box.className = text ? `form-alert ${type}` : "form-alert";
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

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => showTab(tab.dataset.authTab));
    });

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const button = loginForm.querySelector('button[type="submit"]');
        showMessage("loginMessage", "");
        setBusy(button, true, "Signing in…");

        const result = await loginUser(
            document.getElementById("loginEmail").value,
            document.getElementById("loginPassword").value
        );

        if (!result.ok) {
            setBusy(button, false);
            showMessage("loginMessage", result.error, "error");
            return;
        }

        window.location.href = getRedirectTarget();
    });

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const button = registerForm.querySelector('button[type="submit"]');
        const password = document.getElementById("registerPassword").value;
        const confirm = document.getElementById("registerConfirm").value;

        showMessage("registerMessage", "");

        if (password !== confirm) {
            showMessage("registerMessage", "The two passwords do not match.", "error");
            return;
        }

        setBusy(button, true, "Creating your account…");

        const result = await registerUser({
            name: document.getElementById("registerName").value,
            email: document.getElementById("registerEmail").value,
            phone: document.getElementById("registerPhone").value,
            password: password
        });

        if (!result.ok) {
            setBusy(button, false);
            showMessage("registerMessage", result.error, "error");
            return;
        }

        window.location.href = getRedirectTarget();
    });

    // signed-in customers do not need this page
    if (getCurrentUser()) {
        window.location.replace(getRedirectTarget());
        return;
    }

    showTab(new URLSearchParams(window.location.search).get("tab") === "register" ? "register" : "login");
})();