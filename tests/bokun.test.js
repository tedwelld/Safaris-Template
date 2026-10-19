import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createHmac, randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { registerBokun } from '../bokun-server.js';
import { catalogueProduct, filterCatalogue } from '../bokun-catalogue.js';

test('catalogue filters precede pagination, respect durations, and never mix currencies or treat unknown prices as zero', () => {
  const products = Array.from({ length: 30 }, (_, i) => catalogueProduct({ id: i + 1, title: `Tour ${i + 1}` }, {
    location: { city: 'Livingstone' }, categories: [{ title: 'Wildlife' }], duration: { hours: 4 }, nextDefaultPriceMoney: { amount: i + 10, currency: 'USD' },
  }));
  products.push(catalogueProduct({ id: 100, title: 'Unpriced' }, { duration: { hours: 1 } }));
  products.push(catalogueProduct({ id: 101, title: 'Euro activity' }, { nextDefaultPriceMoney: { amount: 1, currency: 'EUR' } }));
  products.push(catalogueProduct({ id: 102, title: 'Free activity' }, { nextDefaultPriceMoney: { amount: 0, currency: 'USD' } }));
  const filtered = filterCatalogue(products, { destination: 'Livingstone', category: 'Wildlife', duration: 'half-day', page: '2' });
  assert.equal(filtered.totalHits, 30); assert.equal(filtered.items.length, 6);
  assert.deepEqual(filtered.facets.currencies, ['EUR', 'USD']);
  const priced = filterCatalogue(products, { maxPrice: '20', priceCurrency: 'USD', sort: 'price-asc' });
  assert.equal(priced.items[0].title, 'Free activity');
  assert.equal(priced.totalHits, 12);
  assert.ok(priced.items.every(item => item.priceFrom.currency === 'USD'));
  assert.equal(filterCatalogue(products, { duration: 'short' }).items[0].title, 'Unpriced');
  assert.throws(() => filterCatalogue(products, { minPrice: '50', maxPrice: '20', priceCurrency: 'USD' }), /Minimum price/);
  assert.throws(() => filterCatalogue(products, { sort: 'price-asc' }), /Choose a currency/);
});

test('Bókun checkout signs requests, restricts options, verifies status, and prevents duplicate submissions across restarts', async () => {
  const nativeFetch = globalThis.fetch;
  const directory = mkdtempSync(join(tmpdir(), 'dove-bokun-test-'));
  const oldEnv = { ...process.env };
  Object.assign(process.env, { BOKUN_API_BASE: 'https://bokun-test.invalid', BOKUN_ACCESS_KEY: 'test-access', BOKUN_SECRET_KEY: 'test-secret', PUBLIC_SITE_URL: 'http://localhost:5173', BOKUN_STATE_DIRECTORY: directory, BOKUN_ALLOW_PAY_LATER: 'false' });
  let submissions = 0;
  let payload;
  let bookingStatus = 'CONFIRMED';
  let ticketRequests = 0;
  let catalogueSearches = 0;
  const options = { questions: {}, options: [
    { type: 'AGENT_RESELLER', paymentMethods: { allowedMethods: ['CASH'] } },
    { type: 'CUSTOMER_NO_PAYMENT', paymentMethods: { allowedMethods: ['CASH'] } },
    { type: 'CUSTOMER_FULL_PAYMENT', amount: 95, currency: 'USD', paymentMethods: { allowedMethods: ['CARD'], cardProvider: { providerType: 'REDIRECT', uti: 'test-uti' } } },
  ] };
  globalThis.fetch = async (url, init) => {
    if (!String(url).startsWith(process.env.BOKUN_API_BASE)) return nativeFetch(url, init);
    const path = String(url).replace(process.env.BOKUN_API_BASE, '');
    assert.equal(init.headers['X-Bokun-Signature'], createHmac('sha1', 'test-secret').update(init.headers['X-Bokun-Date'] + 'test-access' + init.method + path).digest('base64'));
    if (path === '/activity.json/search') {
      const request = JSON.parse(init.body);
      if (request.pageSize === 24) {
        assert.equal(request.textFilter.text, 'river'); assert.equal(request.text, undefined);
        return Response.json({ items: [], totalHits: 0 });
      }
      catalogueSearches++;
      return Response.json({ items: Array.from({ length: request.page === 1 ? 100 : 1 }, (_, i) => ({ id: request.page === 1 ? i + 1 : 101, title: 'Activity' })), totalHits: 101 });
    }
    if (/^\/activity.json\/\d+$/.test(path)) {
      const id = Number(path.split('/').at(-1));
      return Response.json({ id, title: `Activity ${id}`, duration: { hours: 5 }, location: { city: id === 101 ? 'Livingstone' : 'Victoria Falls' }, categories: [{ title: 'Wildlife' }], nextDefaultPriceMoney: { amount: id, currency: 'USD' } });
    }
    if (path.startsWith('/checkout.json/options/')) return Response.json(options);
    if (path.startsWith('/checkout.json/submit')) {
      submissions++; payload = JSON.parse(init.body);
      return Response.json({ booking: { confirmationCode: 'TEST-123', status: 'RESERVED', currency: 'USD', totalPaid: 0, totalDue: 95 }, redirectRequest: { url: 'https://payment.example.test/pay', method: 'GET', parameters: [] } });
    }
    if (path === '/booking.json/booking/TEST-123') return Response.json({ confirmationCode: 'TEST-123', status: bookingStatus, totalPaid: 95, totalDue: 0, currency: 'USD', customer: { private: true }, activityBookings: [{ productConfirmationCode: 'ACT-123', status: 'CONFIRMED', activity: { title: 'River cruise' } }, { productConfirmationCode: 'CANCELLED-123', status: 'CANCELLED', activity: { title: 'Cancelled activity' } }] });
    if (path === '/booking.json/activity-booking/ACT-123/ticket') { ticketRequests++; return new Response('%PDF-1.4\nLocal fixture voucher', { headers: { 'Content-Type': 'application/pdf' } }); }
    throw new Error(`Unexpected upstream call: ${path}`);
  };
  async function start() {
    const app = express(); app.use(express.json()); registerBokun(app);
    const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
    return server;
  }
  let server = await start();
  const uuid = randomUUID();
  const send = (path, body) => nativeFetch(`http://127.0.0.1:${server.address().port}/api/bokun${path}`, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  try {
    assert.equal((await send('/cart/not-a-uuid')).status, 400);
    assert.equal((await send('/products/nope')).status, 400);
    assert.equal((await send('/products/1/availability?start=2026-10-01&end=2027-10-01')).status, 400);
    assert.equal((await send('/booking.json/secret')).status, 404);
    await send('/products?text=river');
    const catalogue = await (await send('/catalogue?destination=Livingstone&category=Wildlife&duration=half-day&maxPrice=150&priceCurrency=USD')).json();
    assert.equal(catalogue.totalHits, 1); assert.equal(catalogue.items[0].id, 101);
    assert.equal(catalogueSearches, 2, 'catalogue-wide filtering must include the second supplier page');
    await send('/catalogue?sort=title'); assert.equal(catalogueSearches, 2, 'metadata should be cached across filter changes');
    const available = await (await send(`/cart/${uuid}/checkout`)).json();
    assert.deepEqual(available.options.map(o => o.type), ['CUSTOMER_FULL_PAYMENT']);
    assert.equal((await send(`/cart/${uuid}/checkout`, { checkoutOption: 'AGENT_RESELLER' })).status, 400);
    const answers = { mainContactDetails: [{ questionId: 'email', values: ['guest@example.test'] }] };
    const result = await (await send(`/cart/${uuid}/checkout`, { checkoutOption: 'CUSTOMER_FULL_PAYMENT', bookingAnswers: answers })).json();
    assert.equal(result.booking.confirmationCode, 'TEST-123');
    assert.equal(payload.uti, 'test-uti'); assert.equal(payload.source, 'SHOPPING_CART');
    assert.deepEqual(payload.shoppingCart.bookingAnswers, answers);
    assert.equal(payload.paymentMethod, 'CARD'); assert.equal(payload.successUrl, 'http://localhost:5173/checkout/return?status=success');
    await send(`/cart/${uuid}/checkout`, { checkoutOption: 'CUSTOMER_FULL_PAYMENT' });
    assert.equal(submissions, 1);
    await new Promise(resolve => server.close(resolve)); server = await start();
    await send(`/cart/${uuid}/checkout`, { checkoutOption: 'CUSTOMER_FULL_PAYMENT' });
    assert.equal(submissions, 1, 'restarting must not repeat a payment submission');
    const verified = await (await send(`/cart/${uuid}/result`)).json();
    assert.equal(verified.verified, true); assert.equal(verified.booking.status, 'CONFIRMED');
    assert.equal(verified.booking.customer, undefined);
    const documents = await (await send(`/cart/${uuid}/documents`)).json();
    assert.deepEqual(documents.documents, [{ id: 'ACT-123', title: 'River cruise' }]);
    const pdf = await send(`/cart/${uuid}/documents/ACT-123`);
    assert.equal(pdf.headers.get('content-type'), 'application/pdf');
    assert.match(pdf.headers.get('content-disposition'), /attachment/);
    assert.ok((await pdf.text()).startsWith('%PDF-'));
    assert.equal((await send(`/cart/${uuid}/documents/OTHER-BOOKING`)).status, 404);
    assert.equal((await send(`/cart/${uuid}/documents/CANCELLED-123`)).status, 404);
    assert.equal((await send(`/cart/${randomUUID()}/documents/ACT-123`)).status, 404);
    bookingStatus = 'CANCELLED';
    assert.equal((await send(`/cart/${uuid}/documents/ACT-123`)).status, 409);
    assert.equal(ticketRequests, 1, 'unauthorized or cancelled vouchers must never be fetched from the supplier');
    assert.equal((await send(`/cart/${uuid}/items`, { activityId: 1, passengers: [{ pricingCategoryId: 1 }] })).status, 409);
  } finally {
    await new Promise(resolve => server.close(resolve)); globalThis.fetch = nativeFetch;
    for (const key of Object.keys(process.env)) if (!(key in oldEnv)) delete process.env[key];
    Object.assign(process.env, oldEnv); rmSync(directory, { recursive: true, force: true });
  }
});
