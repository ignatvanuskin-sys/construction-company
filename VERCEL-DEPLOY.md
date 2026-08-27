# Vercel deployment checklist

The project is linked to the Vercel project `bbc-b318/construction-company` and the GitHub repository `ignatvanuskin-sys/construction-company`. The Vercel project uses the Vite framework preset. `vercel.json` sets `pnpm build`, serves `dist/public`, and routes `/api/trpc/*` to the bundled serverless adapter in `api/trpc/[...path].js`.

## Required Production variables

| Variable | Required | Visibility | Purpose |
|---|---:|---|---|
| `VITE_ANALYTICS_ENDPOINT` | Yes | Public/config | Umami script endpoint |
| `VITE_ANALYTICS_WEBSITE_ID` | Yes | Public/config | Umami website identifier |
| `TELEGRAM_BOT_TOKEN` | Yes | Secret | Server-side Telegram Bot API delivery |
| `TELEGRAM_CHAT_ID` | Yes | Secret | Telegram recipient chat ID |
| `TURNSTILE_SECRET_KEY` | Optional | Secret | Enables server-side Turnstile verification |
| `VITE_TURNSTILE_SITEKEY` | Optional | Public/config | Enables the Turnstile widget in the form |

Cloudflare Turnstile must remain disabled unless both Turnstile variables are present and the production hostname is allowed in the widget settings.

## Safe publish workflow

1. Confirm that the GitHub `main` branch contains the latest commit and that the Vercel project is connected to `ignatvanuskin-sys/construction-company`.
2. Confirm the four required Production variables above in Vercel. Never place `TELEGRAM_BOT_TOKEN` or `TELEGRAM_CHAT_ID` in frontend code.
3. Trigger a deployment from the Vercel dashboard or with the authorized Vercel CLI. Do not reuse the old deployment that rendered source files; it predates `vercel.json` and the serverless adapter.
4. Wait for the deployment to report `Ready`, then open the resulting URL in a private window.
5. Verify that the homepage renders the NOVA FORMA interface rather than source code, `/projects/sosnovy-sklon` renders the project detail page, and the browser console has no fatal errors.
6. Verify the tRPC route with a harmless invalid request and submit one real form test only when appropriate. Confirm that the Telegram message arrives at the configured chat.
7. In Umami, filter by the production hostname and confirm `preloader_complete`, `contact_form_view`, `contact_form_submit_attempt`, `contact_form_submit_success`, `liquid_metal_active` or `liquid_metal_fallback`, `cursor_target_hover`, `project_card_hover`, and `process_orb_interaction`.

The local Vercel build has been validated. The current live deployment must be redeployed before it can be considered verified, because the earlier production URL was observed serving source code.

## Latest deployment verification

The GitHub-connected deployment at `https://construction-company-hjqa4regv-bbc-b318.vercel.app` reached `Ready` after commit `d904be4`. The live page now renders the NOVA FORMA interface, uses the public CDN image URLs, exposes the full page content, and no longer serves source code. The scroll issue was caused by the preloader leaving `html.is-loading { overflow: hidden; }` active after returning `null`; the lifecycle now removes that class before hiding the preloader.
