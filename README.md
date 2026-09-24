# Dove Journeys

A React, TypeScript, and Vite safari website inspired by Micato's editorial travel presentation, with original Dove Journeys branding and copy.

## Local development

Run `npm install` and `npm run dev`. Use `npm run build` for production and `npm run lint` for lint checks. Production hosting must rewrite application routes to `index.html`.

## Pages and interactions

- Home: full-width photography, destination links, and travel styles.
- Activities: Victoria Falls and Livingstone location filters stored in the URL; booking links preserve the selected activity.
- About: the Dove Journeys approach and travel philosophy.
- Booking: activity selections, exact dates, guest count, cost summary, email draft and optional Bokun host.
- Contact: enquiry form, email, and optional WhatsApp.
- FAQs: keyboard-accessible expandable answers.

All pages have responsive navigation, visible focus styles, and reduced-motion support.

## Configuration and integration status

Copy `.env.example` to `.env.local` and supply your own public contact details. Restart Vite after changing environment variables. Never place private credentials in VITE variables.

`VITE_API_BASE_URL` points to the enquiry backend, defaulting to `http://localhost:3001`. The client request form now prepares a structured email draft; clients must send it from their email app. It does not use the demonstration lead endpoint.

The supplied `server.js` is a demonstration backend: leads are logged, not stored or delivered. Run it locally with `npm run server`. Connect a real lead service before launch. The PayPal endpoint returns mock orders; the redesigned guest flow therefore requests a quote and does not expose that mock checkout.

`VITE_BOKUN_WIDGET_URL` retains the existing optional script/host integration. Leave it blank until you have the provider's actual embed script and any required widget identifiers. A real widget needs verification against your Bokun account.

Activity rates remain unpublished until approved; the catalogue and calculator display “Quote required” for these activities. Google Fonts provides Cormorant Garamond and DM Sans; system fonts serve as fallbacks.

## Photography

Images are stored locally in `public/images` and sourced from Unsplash:

- Safari sunset: https://images.unsplash.com/photo-1516426122078-c23e76319801
- Zebras on the plains (Sutirta Budiman): https://unsplash.com/photos/Jgiv1rSIpVM
- Elephant: https://images.unsplash.com/photo-1549366021-9f761d450615

## Validation

Production build and ESLint. Browser checks cover all six pages at desktop, tablet, and mobile widths, mobile navigation, destination filters, selected-trip handoff, FAQ expansion, and enquiry success/error responses with a mocked API. Live payment, email delivery, and Bokun availability are not verified.

Additional cinematic photography (Unsplash):

- Golden-hour elephants, Dana Luig: https://unsplash.com/photos/snTfL3nnj8g
- Maasai Mara giraffe, Carlos Torres: https://unsplash.com/photos/4rnGfF7XbYY
- Namib dunes, Andreas Felske: https://unsplash.com/photos/nt66_G8DCBM
- Resting lion, Steffen Wienberg: https://unsplash.com/photos/Dl4foQja1r8

## Dove Journeys branding and theme

The supplied logo is split at its horizontal divider into `public/images/dove-journeys-light.png` and `public/images/dove-journeys-dark.png`. The original split panels are retained as source assets. The header and footer now use `public/images/dove-journeys-transparent.png` with real alpha transparency. The light header darkens the artwork using CSS for contrast; dark mode and the dark footer retain its cream colour. The site does not infer daylight from location or time.

Set `VITE_EMAIL_SUPPORT`, `VITE_WHATSAPP_NUMBER` (international country code and number), and `VITE_WHATSAPP_MESSAGE` (plain text, not URL-encoded) in `.env.local`. Empty email/WhatsApp values hide those contact links. Restart development servers or rebuild production after changes.

`ADMIN_EMAILS` is reserved for private, server-side email recipients, comma-separated. The demonstration backend does not send email yet; this setting does not enable delivery. Do not expose private admin recipients through `VITE_` variables. The backend loads `.env.local` and `.env` using Node's built-in environment loader (Node 22+); deployment environment values take precedence. Local environment files are ignored by Git, and `.env.example` documents the configuration without real contact details.

## Activity requests and contact controls

Public contact links use `VITE_EMAIL_SUPPORT` and `VITE_WHATSAPP_NUMBER` from `.env.local`. The floating email icon opens the request form; WhatsApp opens the configured business chat. The icons are the installed PrimeIcons WhatsApp brand glyph and envelope. Contact buttons sit at the bottom right, above any visible terms notice. The header stays fixed at the top on all screens, with desktop navigation and an expandable mobile menu. Its measured height reserves space so page content and anchor targets remain visible. There is no bottom navigation bar or navigation FAB.

`src/data/activities.ts` holds the Victoria Falls and Livingstone activity descriptions and per-person USD rates. Rates are deliberately `null` until approved; add numeric `priceUsd` values to enable numerical totals. Mixed priced/unpriced selections show a priced subtotal and require a final quote. The same data drives catalogue cards, selection, summaries and email drafts. Published rates are not a payment demand; availability, child rates and extra fees need confirmation.

Activity context was checked against https://www.zambiatourism.com/activities/livingstone/, https://www.zambiatourism.com/activities/adventure/livingstone-island/ and https://www.victoriafalls-guide.net/victoria-falls-activities.html. These sources establish regional activities, not Dove Journeys supplier agreements or rates. Confirm operational arrangements before accepting bookings.

The first-visit notice stores accept/decline under `dove-journeys-terms-v1`. Both choices allow browsing and questions. The footer reopens the notice. Booking requests require a separate terms acknowledgement. `/terms` explains the request process and explicitly states that cancellation, refund and payment policies are not yet published; it does not invent those policies.

## Production contact buttons (Vercel)

`.env.production` contains only public contact values and is included in Git so Vite production builds can render the WhatsApp, email and developer-credit links. `.env.example` is documentation and is not loaded by Vite; `.env.local` is ignored by Git and is not present in a Git-based deployment.

Push `.env.production` and the `.gitignore` exception, then redeploy. Hosting environment variables override file values: if `VITE_EMAIL_SUPPORT`, `VITE_WHATSAPP_NUMBER` or `VITE_AXENTRA_WHATSAPP_NUMBER` already exist in Vercel, ensure they contain the correct nonempty values (or remove those overrides to use the file). Environment changes require a new build. Keep secrets and server-only settings out of `.env.production`.

Logo background edit: built-in imagegen, background-extraction. Prompt: remove all black background including inside letters, preserve the dove, circle, mountains, river, layout and exact text “DOVE”, “JOURNEYS”, “YOUR JOURNEY CHANGES LIVES”; output a transparent PNG with cream-gold artwork, no new elements. Saved as `public/images/dove-journeys-transparent.png`.
