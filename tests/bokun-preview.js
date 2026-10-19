// Local UI fixture only. No Bókun or payment-provider requests are made.
// Run on port 3002 and set Vite's BOKUN_PROXY_TARGET=http://127.0.0.1:3002.
import express from 'express';
import { catalogueProduct, filterCatalogue } from '../bokun-catalogue.js';
import { registerBookingLookup } from '../booking-lookup.js';
const app = express();
app.use(express.json());
const product = {
  id: 101, title: 'Zambezi sunset cruise', excerpt: 'Slow down. Watch the river turn to gold. A remarkable evening on the upper Zambezi.',
  description: 'Set out on the upper Zambezi as the afternoon light softens. Enjoy the river, its islands and the wildlife along the banks.\nYour guide shares the stories of this extraordinary landscape as you cruise towards sunset.',
  vendor: { title: 'Dove Journeys · LOCAL TEST DATA' }, keyPhoto: { originalUrl: '/images/elephants-golden.jpg' }, photos: [{ originalUrl: '/images/safari.jpg' }],
  bookingType: 'DATE_AND_TIME', capacityType: 'LIMITED', durationHours: 2,
  pricingCategories: [{ id: 1, title: 'Adults', minAge: 12 }, { id: 2, title: 'Children', minAge: 4, maxAge: 11 }],
  inclusions: ['Guided river cruise', 'Refreshments'], exclusions: ['River fees'],
  location: { address: 'Victoria Falls, Zimbabwe', city: 'Victoria Falls' }, categories: [{ title: 'River cruises' }], nextDefaultPriceMoney: { amount: 65, currency: 'USD' }, cancellationPolicy: { description: 'Test cancellation policy for local UI verification only.' },
};
const products = [product, { ...product, id: 102, title: 'Victoria Falls guided walk', durationHours: 3, categories: [{ title: 'Guided walks' }], nextDefaultPriceMoney: { amount: 45, currency: 'USD' }, keyPhoto: { originalUrl: '/images/safari.jpg' } }, { ...product, id: 103, title: 'Livingstone wildlife drive', durationHours: 5, location: { city: 'Livingstone', address: 'Livingstone, Zambia' }, categories: [{ title: 'Wildlife' }], nextDefaultPriceMoney: { amount: 120, currency: 'USD' }, keyPhoto: { originalUrl: '/images/wildlife.jpg' } }];
const carts = new Map();
const completed = new Set();
const emptyCart = uuid => ({ sessionId: uuid, activityBookings: [], totalPrice: 0, currency: 'USD', size: 0 });
app.get('/api/bokun/products', (req, res) => {
  const matches = products.filter(item => !req.query.text || item.title.toLowerCase().includes(String(req.query.text).toLowerCase()));
  res.json({ items: matches, totalHits: matches.length });
});
app.get('/api/bokun/catalogue', (req, res) => {
  try { res.json(filterCatalogue(products.map(item => catalogueProduct(item)), req.query)); }
  catch (error) { res.status(error.status || 500).json({ message: error.message }); }
});
app.get('/api/bokun/products/:id', (req, res) => res.json(products.find(item => item.id === Number(req.params.id)) || product));
app.get('/api/bokun/products/:id/places', (_req, res) => res.json({ pickupPlaces: [], dropoffPlaces: [] }));
app.get('/api/bokun/products/:id/availability', (req, res) => res.json([{ id: 'test-slot', date: Date.parse(req.query.start), startTime: '16:00', startTimeId: 9, unlimitedAvailability: false, availabilityCount: 8, rates: [{ id: 10, title: 'Classic sunset cruise', pricingCategoryIds: [1, 2] }], pricesByRate: [{ activityRateId: 10, pricePerCategoryUnit: [{ id: 1, amount: { amount: 65, currency: 'USD' } }, { id: 2, amount: { amount: 35, currency: 'USD' } }] }] }]));
app.get('/api/bokun/cart/:uuid', (req, res) => res.json(carts.get(req.params.uuid) || emptyCart(req.params.uuid)));
app.post('/api/bokun/cart/:uuid/items', (req, res) => {
  const cart = carts.get(req.params.uuid) || emptyCart(req.params.uuid);
  const price = req.body.passengers.reduce((total, p) => total + (p.pricingCategoryId === 1 ? 65 : 35), 0);
  cart.activityBookings.push({ id: Date.now(), productConfirmationCode: `LOCAL-TEST-${cart.size + 1}`, activity: products.find(item => item.id === req.body.activityId) || product, date: req.body.date, startTime: { time: '16:00' }, totalPrice: price, pricingCategoryBookings: req.body.passengers });
  cart.totalPrice += price; cart.size++; carts.set(req.params.uuid, cart); res.json(cart);
});
app.delete('/api/bokun/cart/:uuid/items/:code', (req, res) => {
  const cart = carts.get(req.params.uuid) || emptyCart(req.params.uuid);
  cart.activityBookings = cart.activityBookings.filter(item => item.productConfirmationCode !== req.params.code);
  cart.size = cart.activityBookings.length; cart.totalPrice = cart.activityBookings.reduce((sum, item) => sum + item.totalPrice, 0);
  carts.set(req.params.uuid, cart); res.json(cart);
});
const question = (id, label, format) => ({ questionId: id, label, required: true, dataFormat: format, dataType: 'SHORT_TEXT' });
app.get('/api/bokun/cart/:uuid/checkout', (req, res) => {
  const cart = carts.get(req.params.uuid);
  res.json({ options: cart?.size ? [{ type: 'CUSTOMER_FULL_PAYMENT', label: 'Pay in full securely', amount: cart.totalPrice, currency: 'USD', paymentMethods: { cardProvider: { title: 'Local test payment provider' } } }] : [], questions: { mainContactDetails: [question('firstName', 'First name'), question('lastName', 'Last name'), question('email', 'Email address', 'EMAIL_ADDRESS')], activityBookings: cart?.activityBookings.map(item => ({ activityId: 101, bookingId: item.id, activityTitle: product.title, questions: [{ questionId: 'diet', label: 'Dietary requirements', dataType: 'LONG_TEXT' }], passengers: item.pricingCategoryBookings.map((p, i) => ({ bookingId: i + 1, pricingCategoryId: p.pricingCategoryId, passengerDetails: [question('guestName', 'Guest full name')] })) })) || [] } });
});
app.post('/api/bokun/cart/:uuid/checkout', (req, res) => { completed.add(req.params.uuid); res.json({ booking: { confirmationCode: 'LOCAL-TEST-ONLY', status: 'CONFIRMED', totalPaid: 0, totalDue: 0, currency: 'USD' } }); });
app.get('/api/bokun/cart/:uuid/result', (req, res) => res.json(completed.has(req.params.uuid) ? { verified: true, booking: { confirmationCode: 'LOCAL-TEST-ONLY', status: 'CONFIRMED', totalPaid: 0, totalDue: 0, currency: 'USD' } } : { verified: false }));
app.get('/api/bokun/cart/:uuid/documents', (req, res) => res.json({ documents: completed.has(req.params.uuid) ? (carts.get(req.params.uuid)?.activityBookings || []).map(item => ({ id: item.productConfirmationCode, title: item.activity.title })) : [] }));
function testVoucherPdf() {
  const content = 'BT /F1 16 Tf 40 750 Td (LOCAL TEST ONLY - Not valid for travel) Tj ET';
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${content.length} >>\nstream\n${content}\nendstream`];
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const startxref = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')}\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF`;
  return pdf;
}
app.get('/api/bokun/cart/:uuid/documents/:code', (req, res) => {
  if (!completed.has(req.params.uuid) || !carts.get(req.params.uuid)?.activityBookings.some(item => item.productConfirmationCode === req.params.code)) return res.sendStatus(404);
  res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="local-test-voucher.pdf"' }).send(testVoucherPdf());
});
registerBookingLookup(app, {
  api: async (_method, path, _body, raw) => {
    if (path === '/booking.json/booking/LOCAL-TEST-ONLY') return { confirmationCode: 'LOCAL-TEST-ONLY', status: 'CONFIRMED', customer: { email: 'guest@example.test' }, currency: 'USD', totalPrice: 65, totalPaid: 65, totalDue: 0, activityBookings: [{ activity: { title: 'Zambezi sunset cruise · LOCAL TEST DATA' }, productConfirmationCode: 'LOCAL-LOOKUP-TICKET', date: '2026-11-02', startTime: '16:00', status: 'CONFIRMED', totalParticipants: 1 }] };
    if (raw && path === '/booking.json/activity-booking/LOCAL-LOOKUP-TICKET/ticket') return new Response(testVoucherPdf());
    throw Object.assign(new Error('Not found'), { status: 404 });
  },
  sendCode: async () => {}, createCode: () => '123456',
});
app.listen(3002, '127.0.0.1', () => console.log('LOCAL TEST DATA ONLY — UI fixture listening on http://127.0.0.1:3002'));
