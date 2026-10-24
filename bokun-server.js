import { createHmac } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { catalogueProduct, filterCatalogue } from './bokun-catalogue.js';
import { registerBookingLookup } from './booking-lookup.js';
import { bookingDocuments, sendBookingVoucher } from './bokun-documents.js';
import { createBookingEmailSender } from './booking-emails.js';

// Only these application operations are exposed; this is not an open API proxy.
export function registerBokun(app) {
  const base = process.env.BOKUN_API_BASE || 'https://api.bokun.is';
  const access = process.env.BOKUN_ACCESS_KEY;
  const secret = process.env.BOKUN_SECRET_KEY;
  const currency = process.env.BOKUN_CURRENCY || 'USD';
  const checkouts = new Map();
  const sendBookingEmail = createBookingEmailSender();
  const notificationsInProgress = new Set();
  const stateDirectory = resolve(process.env.BOKUN_STATE_DIRECTORY || '.bokun-checkouts');
  function getState(uuid) {
    if (checkouts.has(uuid)) return checkouts.get(uuid);
    const file = resolve(stateDirectory, `${uuid}.json`);
    if (!existsSync(file)) return undefined;
    const state = JSON.parse(readFileSync(file, 'utf8'));
    checkouts.set(uuid, state);
    return state;
  }
  function saveState(uuid, state) {
    mkdirSync(stateDirectory, { recursive: true });
    writeFileSync(resolve(stateDirectory, `${uuid}.json`), JSON.stringify(state), { mode: 0o600 });
    checkouts.set(uuid, state);
  }
  function assertEditable(uuid) {
    if (getState(uuid)) throw Object.assign(new Error('This selection has already entered checkout. Please check its booking status before starting another booking.'), { status: 409 });
  }
  const uuidPattern = /^[a-f0-9-]{36}$/i;
  const idPattern = /^\d+$/;
  async function api(method, path, body, raw = false) {
    if (!access || !secret) throw Object.assign(new Error('Live bookings are being prepared. Please contact us to arrange your experience.'), { status: 503 });
    const date = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const signature = createHmac('sha1', secret).update(date + access + method + path).digest('base64');
    const response = await fetch(base + path, {
      method, headers: { 'X-Bokun-Date': date, 'X-Bokun-AccessKey': access, 'X-Bokun-Signature': signature, 'Content-Type': 'application/json;charset=UTF-8' },
      body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(25000),
    });
    if (!response.ok) {
      // Supplier responses may contain personal data. Never forward raw errors.
      throw Object.assign(new Error(response.status === 404 ? 'This experience could not be found.' : 'Bókun could not complete this request. Check your selection and try again.'), { status: response.status === 404 ? 404 : 502 });
    }
    return raw ? response : response.json();
  }
  const route = fn => async (req, res) => {
    res.set('Cache-Control', 'no-store');
    try {
      if (req.params.uuid && !uuidPattern.test(req.params.uuid)) return res.status(400).json({ message: 'Invalid cart.' });
      if (req.params.id && !idPattern.test(req.params.id)) return res.status(400).json({ message: 'Invalid experience.' });
      res.json(await fn(req));
    } catch (error) { res.status(error.status || 502).json({ message: error.message || 'Bookings are temporarily unavailable.' }); }
  };
  registerBookingLookup(app, { api });
  app.get('/api/bokun/products', route(req => api('POST', '/activity.json/search', {
    page: Math.max(1, Math.min(1000, Number(req.query.page) || 1)), pageSize: 24,
    ...(req.query.text ? { textFilter: { text: String(req.query.text).slice(0, 150), searchTitle: true, searchKeywords: true, searchFullText: true } } : {}),
  })));
  let catalogueCache;
  let catalogueExpires = 0;
  async function catalogue() {
    if (catalogueCache && Date.now() < catalogueExpires) return catalogueCache;
    catalogueExpires = Date.now() + 60000;
    catalogueCache = (async () => {
      const summaries = new Map();
      for (let page = 1; ; page++) {
        const data = await api('POST', '/activity.json/search', { page, pageSize: 100 });
        for (const item of data.items || []) summaries.set(Number(item.id), item);
        if (!(data.items || []).length || summaries.size >= data.totalHits) break;
        if (page >= 100) throw new Error('The activity catalogue is too large to load. Please contact us for help.');
      }
      const items = [...summaries.values()];
      const order = new Map(items.map((item, index) => [Number(item.id), index]));
      const enriched = [];
      // Limit supplier requests while loading metadata needed for catalogue-wide filters.
      let next = 0;
      await Promise.all(Array.from({ length: Math.min(4, items.length) }, async () => {
        while (next < items.length) {
          const item = items[next++];
          const details = await api('GET', `/activity.json/${Number(item.id)}`);
          enriched.push(catalogueProduct(item, details));
        }
      }));
      return enriched.sort((a, b) => order.get(a.id) - order.get(b.id));
    })();
    try { return await catalogueCache; } catch (error) { catalogueCache = undefined; throw error; }
  }
  app.get('/api/bokun/catalogue', route(async req => filterCatalogue(await catalogue(), req.query)));
  app.get('/api/bokun/products/:id', route(req => api('GET', `/activity.json/${req.params.id}`)));
  app.get('/api/bokun/products/:id/places', route(req => api('GET', `/activity.json/${req.params.id}/pickup-places`)));
  app.get('/api/bokun/products/:id/availability', route(req => {
    const { start, end } = req.query;
    if (![start, end].every(d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && Number.isFinite(Date.parse(d))) || end < start || Date.parse(end) - Date.parse(start) > 32 * 86400000) {
      throw Object.assign(new Error('Choose a valid date range of up to 31 days.'), { status: 400 });
    }
    return api('GET', `/activity.json/${req.params.id}/availabilities?start=${start}&end=${end}&currency=${encodeURIComponent(currency)}`);
  }));
  app.get('/api/bokun/cart/:uuid', route(async req => ({ ...await api('GET', `/cart.json/${req.params.uuid}?currency=${encodeURIComponent(currency)}`), currency })));
  app.post('/api/bokun/cart/:uuid/items', route(req => {
    const { activityId, date, startTimeId, rateId, passengers, pickup, pickupPlaceId, pickupDescription, dropoff, dropoffPlaceId, dropoffDescription } = req.body || {};
    if (!Number.isInteger(activityId) || !Array.isArray(passengers) || !passengers.length || passengers.length > 100 || passengers.some(p => !Number.isInteger(p.pricingCategoryId))) {
      throw Object.assign(new Error('Choose an experience and at least one guest.'), { status: 400 });
    }
    assertEditable(req.params.uuid);
    return api('POST', `/cart.json/${req.params.uuid}/activity?currency=${encodeURIComponent(currency)}`, { activityId, date, startTimeId, rateId, passengers, pickup, pickupPlaceId, pickupDescription, dropoff, dropoffPlaceId, dropoffDescription });
  }));
  app.delete('/api/bokun/cart/:uuid/items/:code', route(req => {
    assertEditable(req.params.uuid);
    return api('GET', `/cart.json/${req.params.uuid}/remove/${encodeURIComponent(req.params.code)}?currency=${encodeURIComponent(currency)}`).then(cart => ({ ...cart, currency }));
  }));
  const customerOptions = data => (data.options || []).filter(option =>
    (['CUSTOMER_FULL_PAYMENT', 'CUSTOMER_PARTIAL_PAYMENT'].includes(option.type) && option.paymentMethods?.allowedMethods?.includes('CARD') && option.paymentMethods.cardProvider?.providerType === 'REDIRECT') ||
    (process.env.BOKUN_ALLOW_PAY_LATER === 'true' && option.type === 'CUSTOMER_NO_PAYMENT' && option.paymentMethods?.allowedMethods?.includes('CASH')));
  app.get('/api/bokun/cart/:uuid/checkout', route(async req => {
    const data = await api('GET', `/checkout.json/options/shopping-cart/${req.params.uuid}?currency=${encodeURIComponent(currency)}`);
    return { ...data, options: customerOptions(data) };
  }));
  app.post('/api/bokun/cart/:uuid/checkout', route(async req => {
    const uuid = req.params.uuid;
    const existing = getState(uuid);
    if (existing?.result) return existing.result;
    if (existing) throw Object.assign(new Error('This checkout is being processed. Please wait before trying again.'), { status: 409 });
    const state = { pending: true };
    checkouts.set(uuid, state);
    let submitted = false;
    try {
      const data = await api('GET', `/checkout.json/options/shopping-cart/${uuid}?currency=${encodeURIComponent(currency)}`);
      const option = customerOptions(data).find(o => o.type === req.body?.checkoutOption);
      if (!option) throw Object.assign(new Error('This payment option is no longer available. Refresh checkout.'), { status: 400 });
      const origin = process.env.PUBLIC_SITE_URL;
      if (!origin || !/^https?:\/\//.test(origin)) throw Object.assign(new Error('Online checkout is being configured. Please contact us to book.'), { status: 503 });
      const returnUrl = new URL('/checkout/return', origin).href;
      saveState(uuid, state);
      submitted = true;
      const result = await api('POST', `/checkout.json/submit?currency=${encodeURIComponent(currency)}`, {
        source: 'SHOPPING_CART', shoppingCart: { uuid, bookingAnswers: req.body.bookingAnswers },
        checkoutOption: option.type, paymentMethod: option.type === 'CUSTOMER_NO_PAYMENT' ? 'CASH' : 'CARD',
        checkoutOptionAnswers: req.body.checkoutOptionAnswers, cardPaymentProviderAnswers: req.body.cardPaymentProviderAnswers,
        uti: option.paymentMethods.cardProvider?.uti, sendNotificationToMainContact: true, showPricesInNotification: true,
        ...(option.partialPayment ? { amount: option.minPartialAmount, currency: option.currency } : {}),
        successUrl: `${returnUrl}?status=success`, errorUrl: `${returnUrl}?status=error`, cancelUrl: `${returnUrl}?status=cancelled`,
      });
      // Store only payment continuation and a reference, rather than customer details.
      state.result = { redirectRequest: result.redirectRequest, booking: result.booking && { confirmationCode: result.booking.confirmationCode, status: result.booking.status, totalPaid: result.booking.totalPaid, totalDue: result.booking.totalDue, currency: result.booking.currency }, dccQuote: result.dccQuote };
      saveState(uuid, state);
      return result;
    } catch (error) {
      // A timeout may occur after Bókun accepted a booking. Do not submit it twice.
      if (submitted) {
        state.pending = true;
        throw Object.assign(new Error('We could not verify the checkout result. Please contact us before making another booking.'), { status: 409 });
      }
      checkouts.delete(uuid);
      throw error;
    }
  }));
  app.get('/api/bokun/cart/:uuid/result', route(async req => {
    const state = getState(req.params.uuid);
    const result = state?.result;
    const code = result?.booking?.confirmationCode;
    if (!code) return { verified: false };
    const booking = await api('GET', `/booking.json/booking/${encodeURIComponent(code)}`);
    if (String(booking.status).toUpperCase() === 'CONFIRMED' && !notificationsInProgress.has(req.params.uuid)) {
      const uuid = req.params.uuid;
      notificationsInProgress.add(uuid);
      void (async () => {
        try {
          state.emailNotifications ||= {};
          for (const recipient of ['admin', 'guest']) {
            if (state.emailNotifications[recipient]) continue;
            try {
              const sent = await sendBookingEmail(booking, recipient);
              state.emailNotifications[recipient] = sent ? 'sent' : 'skipped';
              saveState(uuid, state);
            } catch {
              // Email delivery must not change the result of a booking that Bókun confirmed.
              console.warn(`Booking ${recipient} notification failed for a confirmed checkout.`);
            }
          }
        } finally { notificationsInProgress.delete(uuid); }
      })();
    }
    return { verified: true, booking: { confirmationCode: booking.confirmationCode, status: booking.status, totalPaid: booking.totalPaid, totalDue: booking.totalDue, currency: booking.currency } };
  }));
  async function checkoutBooking(uuid) {
    if (!uuidPattern.test(uuid)) throw Object.assign(new Error('Invalid checkout.'), { status: 400 });
    const code = getState(uuid)?.result?.booking?.confirmationCode;
    if (!code) throw Object.assign(new Error('No completed checkout was found in this browser.'), { status: 404 });
    return api('GET', `/booking.json/booking/${encodeURIComponent(code)}`);
  }
  app.get('/api/bokun/cart/:uuid/documents', route(async req => ({ documents: bookingDocuments(await checkoutBooking(req.params.uuid)) })));
  app.get('/api/bokun/cart/:uuid/documents/:document', async (req, res) => {
    res.set({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
    try {
      await sendBookingVoucher(api, await checkoutBooking(req.params.uuid), req.params.document, res);
    } catch (error) { res.status(error.status || 502).json({ message: error.message || 'We could not download this voucher. Please try again.' }); }
  });
}
