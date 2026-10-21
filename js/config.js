/* =========================================================
   LUNÉVIA — SITE CONFIGURATION
   The one file a buyer edits first. Load it BEFORE products.js.
========================================================= */

const LUNEVIA_CONFIG = Object.freeze({

    // Shown in prices on every page, and used in the product structured data.
    currencySymbol: "$",
    currencyCode: "USD",

    // FORM RECEIVER (optional)
    // ------------------------------------------------------------
    // This template has no backend. The contact form, newsletter form and
    // checkout can only deliver data somewhere if you give them an HTTPS
    // endpoint that accepts a JSON POST (for example a Formspree form URL).
    //
    //   ""  (empty)  -> DEMO MODE. Nothing is sent anywhere. Messages,
    //                   subscribers and orders are saved in the visitor's own
    //                   browser only, and the pages say so.
    //   "https://…"  -> LIVE MODE. Forms are POSTed to that URL and a success
    //                   message is shown only if the service answers "OK".
    //
    // If you set an endpoint you must also (1) allow it in the
    // Content-Security-Policy "connect-src" in vercel.json and
    // (2) update privacy.html to name the service that receives the data.
    formEndpoint: ""
});

// true when no receiving service is configured
const IS_DEMO_MODE = !/^https:\/\//i.test(LUNEVIA_CONFIG.formEndpoint);
