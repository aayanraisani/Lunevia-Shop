/* =========================================================
   LUNÉVIA ADMIN — SUBSCRIBERS (js/admin-subscribers.js)
========================================================= */

(function () {
    "use strict";

    const table = document.getElementById("subscribersTable");
    const searchInput = document.getElementById("subscriberSearch");
    const countText = document.getElementById("subscriberCount");
    const exportButton = document.getElementById("exportSubscribers");

    function render() {
        const all = getAdminSubscribers();
        const query = searchInput.value.trim().toLowerCase();
        const rows = all.filter((email) => !query || email.toLowerCase().includes(query));

        countText.textContent = `${rows.length} of ${all.length} subscribers`;
        exportButton.disabled = all.length === 0;

        if (all.length === 0) {
            table.innerHTML = '<p class="admin-empty"><i class="bi bi-megaphone"></i>No newsletter emails saved in this browser demo yet.</p>';
            return;
        }

        if (rows.length === 0) {
            table.innerHTML = '<p class="admin-empty"><i class="bi bi-search"></i>No emails match your search.</p>';
            return;
        }

        table.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr><th class="num" style="width: 60px;">#</th><th>Email</th><th><span class="visually-hidden">Actions</span></th></tr>
                </thead>
                <tbody>
                    ${rows.map((email, index) => `
                        <tr>
                            <td class="num">${index + 1}</td>
                            <td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
                            <td>
                                <div class="row-actions">
                                    <button type="button" class="admin-btn admin-btn-danger-ghost admin-btn-small" data-delete-subscriber="${escapeHtml(email)}">Remove</button>
                                </div>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;
    }

    async function removeSubscriber(email) {
        const confirmed = await adminConfirm({
            title: "Remove this subscriber?",
            message: `${email} will be removed from the newsletter list.`,
            confirmText: "Remove",
            danger: true
        });

        if (!confirmed) return;

        if (!deleteAdminSubscriber(email)) {
            showToast("Could not remove the subscriber.", "error");
            return;
        }

        showToast("Subscriber removed.");
        render();
    }

    function exportCsv() {
        const rows = [["Email"]].concat(getAdminSubscribers().map((email) => [email]));
        const today = new Date().toISOString().slice(0, 10);

        downloadTextFile(`lunevia-subscribers-${today}.csv`, toCsv(rows), "text/csv;charset=utf-8");
    }

    table.addEventListener("click", (event) => {
        const button = event.target.closest("[data-delete-subscriber]");
        if (button) removeSubscriber(button.dataset.deleteSubscriber);
    });

    searchInput.addEventListener("input", render);
    exportButton.addEventListener("click", exportCsv);

    render();
})();