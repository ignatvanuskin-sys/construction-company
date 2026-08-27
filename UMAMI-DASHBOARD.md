# Umami dashboard setup

The NOVA FORMA client sends privacy-conscious custom events through the existing Umami script. In Umami, create a dashboard for the production website and add the following event-based views.

| View | Event | Recommended visualization | Purpose |
|---|---|---|---|
| Form conversion | `contact_form_submit_success` | Total events and unique visitors | Measure completed inquiries sent to Telegram |
| Form funnel | `contact_form_view`, `contact_form_submit_attempt`, `contact_form_submit_success`, `contact_form_submit_error` | Event comparison | Identify drop-off and delivery errors |
| Hero motion reach | `liquid_metal_active`, `liquid_metal_fallback` | Event comparison | Compare capable desktop devices with fallback devices |
| Motion engagement | `cursor_target_hover`, `process_orb_interaction`, `project_card_hover` | Total events | Measure interaction with motion surfaces and projects |
| Loading experience | `preloader_complete` | Total events and median time on page | Confirm the entry animation completes for visitors |
| Project interest | `project_card_hover` with the `project` property | Table or event breakdown | Compare project-card interest by slug |

Use the production hostname as the dashboard filter. Keep the dashboard focused on event counts, unique visitors, and conversion rate; do not collect form field values or message contents as analytics properties. The Telegram submission payload remains server-side and is not sent to Umami.

## Required Vercel variables

The client needs `VITE_ANALYTICS_ENDPOINT` and `VITE_ANALYTICS_WEBSITE_ID` in the Production environment. These values are public by design because the browser loads the Umami script. The project already contains the event instrumentation; after the next deployment, events will appear in the selected Umami website.

## Validation checklist

Open the production site in a private window, wait for the preloader to finish, hover a CTA or project card, move over the process section, and submit a real test inquiry only when appropriate. In Umami, filter the last 30 minutes by the production hostname and confirm the event names above. If events do not appear, check that the production variables point to the intended Umami website and that the analytics endpoint is reachable from the deployed domain.
