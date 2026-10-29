/* =========================================================
   LUNÉVIA ADMIN — MESSAGES (js/admin-messages.js)
   Opening a message marks it as read.
========================================================= */

(function () {
    "use strict";

    const list = document.getElementById("messagesList");
    const countText = document.getElementById("messageCount");
    const filterTabs = document.querySelectorAll("[data-message-filter]");

    let filter = "all";

    function updateCount() {
        const all = getAdminMessages();
        const unread = all.filter((message) => !message.read).length;
        countText.textContent = `${all.length} ${all.length === 1 ? "message" : "messages"} · ${unread} unread`;
    }

    function buildMessage(message) {
        const subject = message.subject || "(no subject)";
        const replySubject = encodeURIComponent(`Re: ${subject}`);

        return `
            <details class="message-card ${message.read ? "" : "unread"}" data-message-id="${message.id}">
                <summary>
                    <span class="message-dot" aria-hidden="true"></span>
                    <span class="message-summary-text">
                        <span class="message-subject">${escapeHtml(subject)}</span>
                        <span class="message-from">${escapeHtml(message.name)} · ${escapeHtml(message.email)}</span>
                    </span>
                    <span class="message-date">${escapeHtml(formatAdminDateTime(message.date))}</span>
                </summary>
                <div class="message-body">
                    <p class="message-text">${escapeHtml(message.message)}</p>
                    <div class="row-actions" style="justify-content: flex-start;">
                        <a class="admin-btn admin-btn-primary admin-btn-small" href="mailto:${escapeHtml(message.email)}?subject=${replySubject}"><i class="bi bi-reply"></i> Reply</a>
                        <button type="button" class="admin-btn admin-btn-ghost admin-btn-small" data-toggle-read="${message.id}">${message.read ? "Mark as unread" : "Mark as read"}</button>
                        <button type="button" class="admin-btn admin-btn-danger-ghost admin-btn-small" data-delete-message="${message.id}">Delete</button>
                    </div>
                </div>
            </details>
        `;
    }

    function render() {
        const all = getAdminMessages();
        const shown = filter === "unread" ? all.filter((message) => !message.read) : all;

        updateCount();

        if (all.length === 0) {
            list.innerHTML = '<div class="admin-card"><p class="admin-empty"><i class="bi bi-envelope"></i>No messages saved in this browser demo yet.</p></div>';
            return;
        }

        if (shown.length === 0) {
            list.innerHTML = '<div class="admin-card"><p class="admin-empty"><i class="bi bi-check2-circle"></i>You have read everything.</p></div>';
            return;
        }

        list.innerHTML = shown.map(buildMessage).join("");
    }

    // changes the look of one message without redrawing (so it stays open)
    function setReadLook(card, isRead) {
        card.classList.toggle("unread", !isRead);

        const button = card.querySelector("[data-toggle-read]");
        if (button) button.textContent = isRead ? "Mark as unread" : "Mark as read";
    }

    // opening a message marks it as read (the "toggle" event does not bubble, so we listen while it travels down)
    list.addEventListener("toggle", (event) => {
        const card = event.target.closest ? event.target.closest(".message-card") : null;
        if (!card || !card.open || !card.classList.contains("unread")) return;

        if (markAdminMessageRead(Number(card.dataset.messageId), true)) {
            setReadLook(card, true);
            updateCount();
        }
    }, true);

    list.addEventListener("click", async (event) => {
        const readButton = event.target.closest("[data-toggle-read]");
        const deleteButton = event.target.closest("[data-delete-message]");

        if (readButton) {
            const card = readButton.closest(".message-card");
            const makeRead = card.classList.contains("unread");

            if (markAdminMessageRead(Number(readButton.dataset.toggleRead), makeRead)) {
                setReadLook(card, makeRead);
                updateCount();
            }
            return;
        }

        if (deleteButton) {
            const confirmed = await adminConfirm({
                title: "Delete this message?",
                message: "This cannot be undone.",
                confirmText: "Delete",
                danger: true
            });

            if (!confirmed) return;

            if (!deleteAdminMessage(Number(deleteButton.dataset.deleteMessage))) {
                showToast("Could not delete the message.", "error");
                return;
            }

            showToast("Message deleted.");
            render();
        }
    });

    filterTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            filter = tab.dataset.messageFilter;
            filterTabs.forEach((item) => item.classList.toggle("active", item === tab));
            render();
        });
    });

    render();
})();