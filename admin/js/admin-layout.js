/* =========================================================
   LUNÉVIA ADMIN — SHARED LAYOUT (js/admin-layout.js)
   Adds the sidebar and top bar to every admin page, marks the
   current page in the menu, and (later) checks the admin login.
   Every page only needs: <body data-admin-page="products"> and
   <main id="adminContent"> ... </main>
========================================================= */

/* ---------- helpers every admin page can use ---------- */

function getUrlParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

// photos saved as "assets/..." are relative to the store folder, so admin pages need ../ in front
function adminImageSrc(path) {
    const value = String(path || "");

    if (!value) return "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
    if (/^(https?:|data:|\/)/i.test(value)) return value;

    return "../" + value.replace(/^\.\//, "");
}

function formatAdminDateTime(isoDate) {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function downloadTextFile(filename, text, mimeType) {
    const blob = new Blob([text], { type: mimeType || "text/plain" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

// rows = an array of arrays. Opens fine in Excel (UTF-8 mark added).
function toCsv(rows) {
    const text = rows.map((row) => row.map((cell) => {
        let value = cell === null || cell === undefined ? "" : String(cell);

        // a leading = + - @ can run as a formula in Excel, so it is neutralised
        if (/^[=+\-@]/.test(value)) value = "'" + value;

        return `"${value.replace(/"/g, '""')}"`;
    }).join(",")).join("\r\n");

    return "\ufeff" + text;
}

// a nice "Are you sure?" window. Returns a promise: true if the admin confirms.
function adminConfirm(options) {
    const settings = Object.assign({ title: "Are you sure?", message: "", confirmText: "Confirm", danger: false }, options);

    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        const previousFocus = document.activeElement;

        overlay.className = "admin-modal";
        overlay.setAttribute("role", "alertdialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.setAttribute("aria-labelledby", "adminModalTitle");
        overlay.setAttribute("aria-describedby", "adminModalText");

        overlay.innerHTML = `
            <div class="admin-modal-box">
                <h2 id="adminModalTitle">${escapeHtml(settings.title)}</h2>
                <p id="adminModalText">${escapeHtml(settings.message)}</p>
                <div class="admin-modal-actions">
                    <button type="button" class="admin-btn admin-btn-ghost" data-modal="cancel">Cancel</button>
                    <button type="button" class="admin-btn ${settings.danger ? "admin-btn-danger" : "admin-btn-primary"}" data-modal="ok">${escapeHtml(settings.confirmText)}</button>
                </div>
            </div>
        `;

        function close(result) {
            document.removeEventListener("keydown", onKey);
            overlay.remove();
            if (previousFocus && previousFocus.focus) previousFocus.focus();
            resolve(result);
        }

        function onKey(event) {
            if (event.key === "Escape") {
                close(false);
                return;
            }

            if (event.key === "Tab") {
                const buttons = overlay.querySelectorAll("button");
                const first = buttons[0];
                const last = buttons[buttons.length - 1];

                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        }

        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
                close(false);
                return;
            }

            const button = event.target.closest("[data-modal]");
            if (button) close(button.dataset.modal === "ok");
        });

        document.body.appendChild(overlay);
        document.addEventListener("keydown", onKey);
        overlay.querySelector('[data-modal="cancel"]').focus();
    });
}


// true = every admin page needs the admin sign-in.
// Set it to false only while developing, to skip the login.
const ADMIN_AUTH_ENABLED = true;

const ADMIN_NAV = [
    { page: "dashboard", href: "dashboard.html", label: "Dashboard", icon: "bi-speedometer2" },
    { page: "products", href: "products.html", label: "Products", icon: "bi-box-seam" },
    { page: "orders", href: "orders.html", label: "Orders", icon: "bi-receipt" },
    { page: "customers", href: "customers.html", label: "Customers", icon: "bi-people" },
    { page: "messages", href: "messages.html", label: "Messages", icon: "bi-envelope" },
    { page: "subscribers", href: "subscribers.html", label: "Subscribers", icon: "bi-megaphone" },
    { page: "settings", href: "settings.html", label: "Settings", icon: "bi-gear" }
];

// pages that are not in the menu belong under one menu item
const ADMIN_PARENT_PAGE = {
    "product-edit": "products",
    "order-detail": "orders"
};

(function renderAdminLayout() {
    "use strict";

    const page = document.body.dataset.adminPage;
    const content = document.getElementById("adminContent");

    // the login page has no sidebar
    if (!page || page === "login" || !content) return;

    // send visitors who are not signed in to the login page (and bring them back after)
    if (ADMIN_AUTH_ENABLED) {
        const isSignedIn = typeof isAdminLoggedIn === "function" && isAdminLoggedIn();

        if (!isSignedIn) {
            const currentFile = window.location.pathname.split("/").pop() || "dashboard.html";
            window.location.replace(`login.html?next=${encodeURIComponent(currentFile)}`);
            return;
        }
    }

    // the page content stays hidden until the check above has passed
    document.body.classList.remove("admin-checking");

    const signedInEmail = typeof getAdminEmail === "function" ? getAdminEmail() : null;

    const activePage = ADMIN_PARENT_PAGE[page] || page;

    const menuItems = ADMIN_NAV.map((item) => {
        const isActive = item.page === activePage;
        const current = isActive ? ' aria-current="page"' : "";

        return `
            <a href="${item.href}" class="${isActive ? "active" : ""}"${current}>
                <i class="bi ${item.icon}"></i>
                <span>${item.label}</span>
            </a>
        `;
    }).join("");

    const shell = document.createElement("div");
    shell.className = "admin-shell";

    shell.innerHTML = `
        <aside class="admin-sidebar" id="adminSidebar" aria-label="Admin menu">
            <div class="admin-brand">Lunévia <small>ADMIN</small></div>
            <nav class="admin-nav">${menuItems}</nav>
            <div class="admin-sidebar-footer">
                <a href="../index.html" target="_blank" rel="noopener"><i class="bi bi-box-arrow-up-right"></i><span>View store</span></a>
            </div>
        </aside>

        <div class="admin-backdrop" id="adminBackdrop"></div>

        <div class="admin-main">
            <header class="admin-topbar">
                <button type="button" class="admin-menu-toggle" id="adminMenuToggle" aria-label="Open menu" aria-controls="adminSidebar" aria-expanded="false">
                    <i class="bi bi-list"></i>
                </button>
                <span class="admin-topbar-title">Admin panel</span>
                ${signedInEmail ? `<span class="admin-topbar-user">${escapeHtml(signedInEmail)}</span>` : ""}
                <button type="button" class="admin-signout" id="adminSignOut">
                    <i class="bi bi-box-arrow-right"></i> Sign out
                </button>
            </header>
        </div>
    `;

    // put the shell where the page content was, then move the content into it
    document.body.insertBefore(shell, content);
    const adminMain = shell.querySelector(".admin-main");
    adminMain.appendChild(content);

    // This interface and the storefront demo use this browser's storage only.
    // It is not a secure shared backend and records do not sync across devices.
    const demoNotice = document.createElement("aside");
    demoNotice.className = "admin-demo-notice";
    demoNotice.setAttribute("role", "note");
    demoNotice.innerHTML = '<strong>Front-end demo only:</strong> products, customers, messages, newsletter emails, and orders are saved in this browser only. They do not sync across devices or reach a store owner. This panel is not secure enough for real customer data; connect a backend before production use.';
    adminMain.insertBefore(demoNotice, content);


    /* ---------- menu button on small screens ---------- */

    const toggle = document.getElementById("adminMenuToggle");
    const backdrop = document.getElementById("adminBackdrop");

    function setMenu(isOpen) {
        shell.classList.toggle("menu-open", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));
    }

    toggle.addEventListener("click", () => setMenu(!shell.classList.contains("menu-open")));
    backdrop.addEventListener("click", () => setMenu(false));

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") setMenu(false);
    });


    /* ---------- sign out ---------- */

    document.getElementById("adminSignOut").addEventListener("click", () => {
        if (typeof logoutAdmin === "function") logoutAdmin();
        window.location.href = "login.html";
    });
})();