# Dove Journeys

A React, TypeScript, and Vite safari website inspired by Micato's editorial travel presentation, with original Dove Journeys branding and copy.

## Local development

Run `npm install` and `npm run dev`. Use `npm run build` for production and `npm run lint` for lint checks. Production hosting must rewrite application routes to `index.html`.

## Pages and interactions

- Home: full-width photography, destination links, and travel styles.
- Activities: live Bókun product catalogue at `/activities`, with product search, destination/category/duration/price filters, sorting, pagination and links to booking details.
- About: the Dove Journeys approach and travel philosophy.
- Booking: personalised itinerary enquiry; bookable Bókun experiences use the separate catalogue and checkout below.
- Contact: enquiry form, email, and optional WhatsApp.
- FAQs: keyboard-accessible expandable answers.

All pages have responsive navigation, visible focus styles, and reduced-motion support.

## Configuration and integration status

Copy `.env.example` to `.env.local` and supply your own public contact details. Restart Vite after changing environment variables. Never place private credentials in VITE variables.

`VITE_API_BASE_URL` points to the enquiry backend, defaulting to `http://localhost:3001`. The client request form now prepares a structured email draft; clients must send it from their email app. It does not use the demonstration lead endpoint.

The supplied `server.js` is a demonstration backend: leads are logged, not stored or delivered. Run it locally with `npm run server`. Connect a real lead service before launch. The PayPal endpoint returns mock orders; the redesigned guest flow therefore requests a quote and does not expose that mock checkout.

The previous optional Bókun script placeholder has been replaced by custom product, booking, cart and checkout pages. See the Bókun setup below.

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

The first-visit notice stores accept/decline under `dove-journeys-terms-v1`. Both choices allow browsing and questions. The footer reopens the notice. Booking requests and online checkout require a separate acknowledgement. `/terms` distinguishes enquiries from online bookings and directs guests to each supplier’s cancellation policy.

## Custom Bókun booking flow

Adapted from the Bókun components in `D:/Repos/Websites/CaracalSafaris`, with Dove Journeys branding and native React Router pages:

- Homepage: product/date availability form below the hero, with live departures and a handoff that preserves the chosen date and departure in the product booking panel. Flexible passes link directly to their booking options.
- Homepage product display: up to three products from the Bókun catalogue, with photos, descriptions and links to product details. “View all activities” opens the full catalogue.
- `/activities`: the full product catalogue with live product search and pagination. Navigation, homepage cards and booking links use this page. Legacy `/experiences` and `/safaris` URLs redirect here, preserving search parameters; older region links become destination searches.
- `/product/:id`: photo gallery, description, inclusions, exclusions, meeting details, cancellation policy, live departure times, rates, age categories, guest limits and pick-up/drop-off selection.
- `/cart`: Bókun-backed selections, dates, guest counts and item removal. The browser stores only a random cart ID; Bókun stores the selection. Prices are rechecked at checkout.
- `/checkout`: supplier-provided main contact and per-guest questions, final currency/amount, full or minimum-deposit payment options and secure card-provider redirect.
- `/checkout/return`: booking status read from the server and Bókun. A `status=success` URL parameter never establishes payment or confirmation.
- Header cart: always visible on desktop and mobile, with the number of selected activities. It refreshes after cart changes, navigation and changes made in another tab; a failed cart request hides the count instead of inventing a total.
- Tickets and vouchers: the verified confirmation page lists PDF vouchers for confirmed activity bookings. Downloads pass through the backend, which checks the saved checkout and current Bókun status before fetching the selected activity’s ticket. Unknown checkouts, another booking’s ticket, and cancelled/unconfirmed bookings cannot retrieve PDFs. Direct checkout also opens `/checkout/return` so refresh preserves confirmation and voucher access in the current browser tab.
- `/my-booking`: booking lookup using the parent booking confirmation reference and booking email. A one-time email code is required before status, dates, totals or vouchers are returned. Access is read-only; guests contact the team for amendments or cancellations. Links appear in the desktop utility bar, mobile navigation and footer.

Catalogue filters apply before pagination to the complete catalogue, cached for 60 seconds. Product details supply destination, category, duration and `nextDefaultPriceMoney` metadata. Prices are labelled indicative and compared only within a selected currency; unpriced products remain in ordinary results but are excluded from price filters/sorting. Destination/category options come from supplier metadata. Catalogue metadata loads with up to four concurrent supplier requests; actual availability, checkout and voucher authorization bypass the cache. Very large catalogues should move metadata synchronization to a persistent indexed store.

The `/booking` itinerary enquiry remains available. The previous static activity guide at `/safaris` is now replaced by the live catalogue through a redirect to `/activities`. No Caracal branding, contact details, credentials or unrelated features were copied.

### Enable live bookings

1. Copy the server settings from `.env.example` into `.env.local`. Configure `BOKUN_ACCESS_KEY` and `BOKUN_SECRET_KEY` for the intended website booking channel. Use `https://api.bokuntest.com` for sandbox testing or `https://api.bokun.is` for live traffic. Keys stay on the Express server.
2. Set `BOKUN_CURRENCY` and `PUBLIC_SITE_URL` to the intended currency and exact frontend origin. The server constructs payment return URLs from this configured origin.
3. Configure a **REDIRECT** card provider in Bókun. Only customer-facing redirect payment options are offered. Pay-later checkout requires `BOKUN_ALLOW_PAY_LATER=true` plus a channel that explicitly offers `CUSTOMER_NO_PAYMENT` with `CASH`. No fake PayPal endpoint is used by this flow.
4. Run `npm run server` and `npm run dev` in separate terminals. Vite proxies `/api/bokun` to port 3001. For production, deploy the Express backend and route `/api/bokun` to it; static frontend hosting alone cannot run the private API. Alternatively set `VITE_BOKUN_API_BASE_URL` to the separately hosted backend origin and rebuild.
5. Complete a sandbox booking with your actual product configurations and payment provider before accepting live bookings. No real booking or charge was made during implementation.

Checkout submission records are stored in the ignored `.bokun-checkouts/` directory to prevent accidental duplicate submissions after a server restart. Mount a persistent private disk, or set `BOKUN_STATE_DIRECTORY` to one. These records include payment continuation parameters and must never be served publicly. This file store supports **one backend process**; multiple replicas or serverless hosting require a shared transactional idempotency store. If a submitted request times out, the cart is locked for manual reconciliation instead of risking another charge. The backend uses only a small set of application endpoints, rather than exposing a general signed Bókun proxy.

Token-based and server-to-server card providers, dynamic currency conversion continuation, extras selection, promo/gift cards, and complex combo itineraries are not implemented. Products requiring these features need a provider widget or additional integration. A channel without supported checkout options shows a contact fallback. Final prices, required questions and supplier validation always come from Bókun; unavailable prices are not fabricated.

### Bókun verification

`npm run build` checks TypeScript and the production bundle. `npm run test:bokun` exercises signed requests, endpoint restrictions, allowed customer payment options, payment payloads, duplicate submissions across restarts, server-verified booking status, catalogue filtering before pagination, currency isolation, unknown/zero prices and authorization for PDF downloads using mocked Bókun responses.

For an isolated UI fixture with no real supplier calls, run `node tests/bokun-preview.js`, then start Vite with `BOKUN_PROXY_TARGET=http://127.0.0.1:3002` set in the shell (PowerShell: `$env:BOKUN_PROXY_TARGET='http://127.0.0.1:3002'`). Fixture products explicitly say `LOCAL TEST DATA`; this preview is never enabled in production. Desktop/mobile browser checks cover product selection, guest pricing, cart handoff, checkout questions and missing-configuration handling. Live availability, provider redirect/payment and confirmation still require account credentials and sandbox verification.

Implementation references: [Bókun booking process](https://bokun.dev/booking-api-rest/vU6sCfxwYdJWd1QAcLt12i/booking-process/7ce3yQRdURnCYQkhJsi2op), [checkout](https://bokun.dev/booking-api-rest/vU6sCfxwYdJWd1QAcLt12i/checkout/qfxwephtAWaRgPt22kpyLF), and [booking questions](https://bokun.dev/booking-api-rest/vU6sCfxwYdJWd1QAcLt12i/booking-questions-and-answers/r69Hx5qrLtMXpYzBCC6NPp).

### Booking lookup email setup

Set the server-only `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` and `SMTP_FROM` values in `.env.local` or deployment secrets, then restart the backend. Use an approved sender on your mail provider. Port 465 uses immediate TLS; other ports require STARTTLS. Missing SMTP configuration shows a contact fallback rather than pretending a code was delivered. Enquiry email drafts are separate from this verification mail service.

The server compares the supplied email to Bókun’s main booking customer email. Unknown references and incorrect emails return the same public challenge response and never send a code. Six-digit codes are stored as HMAC digests, expire in ten minutes, allow five attempts and are consumed once. Resending invalidates the prior code, with a one-minute cooldown. Requests are limited per IP and reference/email combination. Verification creates a random, revocable 30-minute session; only the opaque token is kept in browser session storage and sent through the Authorization header. Every booking/voucher request rechecks the booking’s current email, and voucher requests additionally require current confirmed status and membership in that booking. Logout revokes the server session and clears the browser token. Codes and tokens are never logged or placed in URLs.

Challenges, sessions and rate limits are held in one backend process. Restarting it requires guests to verify again. Multiple replicas/serverless deployment require shared expiring storage and rate limiting before launch; configure trusted proxy handling only for the actual deployment proxy so per-IP throttling uses the intended client address. Live SMTP and Bókun account verification are still required. No live verification emails were sent during development.

The isolated `tests/bokun-preview.js` UI fixture supports reference `LOCAL-TEST-ONLY`, email `guest@example.test` and code `123456`; it does not send email. These fixture values and the injected code generator are not used by `server.js`. Automated tests cover non-disclosure before verification, email mismatch, missing references, code replay, expiry, attempt/cooldown limits, logout, changed booking emails and protected PDF downloads.

`public/sitemap.xml` indexes the public page sitemap in `public/sitemaps/pages.xml`. `public/robots.txt` points crawlers to the index. Update the canonical host in these files if the production domain changes. The terms notice includes the full terms text and records an explicit agreement or decline in the visitor's browser.

## Production contact buttons (Vercel)

`.env.production` contains only public contact values and is included in Git so Vite production builds can render the WhatsApp, email and developer-credit links. `.env.example` is documentation and is not loaded by Vite; `.env.local` is ignored by Git and is not present in a Git-based deployment.

Push `.env.production` and the `.gitignore` exception, then redeploy. Hosting environment variables override file values: if `VITE_EMAIL_SUPPORT`, `VITE_WHATSAPP_NUMBER` or `VITE_AXENTRA_WHATSAPP_NUMBER` already exist in Vercel, ensure they contain the correct nonempty values (or remove those overrides to use the file). Environment changes require a new build. Keep secrets and server-only settings out of `.env.production`.

Logo background edit: built-in imagegen, background-extraction. Prompt: remove all black background including inside letters, preserve the dove, circle, mountains, river, layout and exact text “DOVE”, “JOURNEYS”, “YOUR JOURNEY CHANGES LIVES”; output a transparent PNG with cream-gold artwork, no new elements. Saved as `public/images/dove-journeys-transparent.png`.
