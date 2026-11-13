# Lunévia admin

The admin account is created in the browser the first time `admin/login.html` is opened. There is no default email or password.

## Forgot the password / need the "Create admin account" form again

Open `admin/login.html`, press F12, choose the Console tab and run:

```js
localStorage.removeItem("luneviaAdminAccount");
localStorage.removeItem("luneviaAdminSession");
location.reload();
```

This only removes the admin login. Orders, products and customers in this browser are kept.

## Notes

- The login is a browser-only demo. Do not rely on it for a live store; move authentication to a server first (see `DEPLOYMENT-NOTES.md`).
- Each browser keeps its own account and data. Passwords need at least 10 characters and the site must be served over HTTPS (or localhost).
