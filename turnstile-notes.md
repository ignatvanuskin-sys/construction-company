# Cloudflare Turnstile implementation notes

Cloudflare's official documentation states that a client widget is not enough: every token must be validated server-side through `POST https://challenges.cloudflare.com/turnstile/v0/siteverify`. Tokens expire after 300 seconds and are single-use, so the form must reject missing, expired, or already-consumed tokens. The sitekey is public; the secret key must remain server-side.

For this React SPA, explicit rendering is appropriate because the contact form is dynamic. Load the exact script URL `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit`, render the widget with a public sitekey, pass the token to the public tRPC mutation, and reset the widget after success or expiration. Keep the widget visible and disable submit until a token exists.

Use `TURNSTILE_SITEKEY` as the public frontend value and `TURNSTILE_SECRET_KEY` as the server-only secret. Use Cloudflare's dummy keys only in automated tests; production keys reject dummy tokens.

References:
- https://developers.cloudflare.com/turnstile/get-started/
- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
- https://developers.cloudflare.com/turnstile/troubleshooting/testing/
