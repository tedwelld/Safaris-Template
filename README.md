# Wildtrack Safaris

A React, TypeScript, and Vite safari website inspired by Micato's editorial travel presentation, with original Wildtrack branding and copy.

## Local development

Run `npm install` and `npm run dev`. Use `npm run build` for production and `npm run lint` for lint checks. Production hosting must rewrite application routes to `index.html`.

## Pages and interactions

- Home: full-width photography, destination links, and travel styles.
- Safaris: destination filters stored in the URL; enquiry links preserve the selected trip.
- About: the Wildtrack approach and travel philosophy.
- Booking: trip enquiry, preferred month, group size, and optional Bokun host.
- Contact: enquiry form, email, and optional WhatsApp.
- FAQs: keyboard-accessible expandable answers.

All pages have responsive navigation, visible focus styles, and reduced-motion support.

## Configuration and integration status

Copy `.env.example` to `.env.local` and supply your own public contact details. Restart Vite after changing environment variables. Never place private credentials in VITE variables.

`VITE_API_BASE_URL` points to the enquiry backend, defaulting to `http://localhost:3001`. Forms POST name, email, tripInterest, and message to `/api/lead`. They handle failed requests without discarding the guest's input and provide an email fallback. Booking dates and group size are included in message.

The supplied `server.js` is a demonstration backend: leads are logged, not stored or delivered. Run it locally with `npm run server`. Connect a real lead service before launch. The PayPal endpoint returns mock orders; the redesigned guest flow therefore requests a quote and does not expose that mock checkout.

`VITE_BOKUN_WIDGET_URL` retains the existing optional script/host integration. Leave it blank until you have the provider's actual embed script and any required widget identifiers. A real widget needs verification against your Bokun account.

Trip prices are sample starting prices, not live quotes. Replace them with approved rates before launch. Google Fonts provides Cormorant Garamond and DM Sans; system fonts serve as fallbacks.

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
