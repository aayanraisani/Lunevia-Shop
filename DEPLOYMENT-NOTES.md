# Lunévia — deployment and feature notes

## Current deployment model

- The project is a static front-end demo deployed on Vercel.
- Product catalogue, cart, wishlist, sample accounts, demo admin settings, contact messages, newsletter emails, and sample orders use browser `localStorage`.
- Contact and newsletter submissions can be viewed in the demo admin panel only when the same browser profile is used.
- Orders are saved locally and can be displayed on the confirmation/tracking screens in that browser. No real order is sent to a store owner or fulfilment team.
- The project does not include a backend, shared database, payment gateway, email sender, or secure server-side admin authentication.

## Before accepting real customers

1. Connect a backend/database for accounts, inventory, orders, messages and newsletter subscriptions.
2. Move authentication and authorization to the server. The browser-based admin login is only a demo and can be bypassed.
3. Integrate a supported payment provider before offering card payments. The current checkout is demonstration-only and does not process payment.
4. Replace placeholder email/phone details, confirm the actual currency, delivery coverage, shipping charges and return policy.
5. Verify image licences, third-party asset terms, accessibility, responsive behavior and production performance.
6. Replace `privacy.html` with a policy that describes the actual providers and data handling after backend services are connected.

## Limitations

The browser is the only source of truth in this front-end demo. Local data does not sync between visitors, devices or browsers; clearing browser storage may remove it. Order numbers are only unique within one browser's saved order list. Do not use this demo to store real customer data or operate a live shop without a backend and proper security.
