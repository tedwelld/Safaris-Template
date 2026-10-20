import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { registerBookingLookup } from '../booking-lookup.js';

test('booking lookup verifies email, limits guesses, expires and revokes access, and restricts voucher downloads', async () => {
  let time = Date.now();
  let status = 'CONFIRMED';
  let email = 'guest@example.test';
  const messages = [];
  const api = async (_method, path, _body, raw) => {
    if (path === '/booking.json/booking/REF-123') return { confirmationCode: 'REF-123', customer: { email, passportId: 'PRIVATE' }, currency: 'USD', totalPaid: 65, totalDue: 0, totalPrice: 65, status,
      activityBookings: [{ productConfirmationCode: 'TICKET-123', status: 'CONFIRMED', activity: { title: 'River cruise' }, date: '2026-11-02', startTime: '16:00', totalParticipants: 2 }] };
    if (raw && path === '/booking.json/activity-booking/TICKET-123/ticket') return new Response('%PDF-1.4\nfixture');
    throw Object.assign(new Error('Not found'), { status: 404 });
  };
  const app = express(); app.use(express.json());
  registerBookingLookup(app, { api, sendCode: async message => messages.push(message), now: () => time, createCode: () => '123456' });
  const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/bokun/lookup`;
  const send = (path, body, token) => fetch(url + path, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const request = async (address = 'guest@example.test', reference = 'REF-123') => (await send('/request', { reference, email: address })).json();
  try {
    assert.equal((await send('/booking')).status, 401);
    assert.equal((await send('/documents/TICKET-123')).status, 401);
    const missing = await request('no@example.test', 'MISSING');
    const mismatch = await request('wrong@example.test');
    const challenge = await request();
    assert.deepEqual(Object.keys(missing), Object.keys(challenge));
    assert.equal(missing.message, challenge.message); assert.equal(mismatch.message, challenge.message);
    assert.equal(messages.length, 1); assert.equal(messages[0].email, 'guest@example.test');
    assert.equal(challenge.code, undefined, 'public responses must never contain verification codes');
    assert.equal((await send('/request', { reference: 'REF-123', email: 'guest@example.test' })).status, 429);
    assert.equal((await send('/verify', { challengeId: mismatch.challengeId, code: '123456' })).status, 401);
    assert.equal((await send('/verify', { challengeId: challenge.challengeId, code: '000000' })).status, 401);
    const access = await (await send('/verify', { challengeId: challenge.challengeId, code: messages[0].code })).json();
    assert.match(access.token, /^[a-f0-9]{64}$/);
    assert.equal((await send('/verify', { challengeId: challenge.challengeId, code: '123456' })).status, 401, 'codes can be used once');
    const result = await (await send('/booking', undefined, access.token)).json();
    assert.equal(result.booking.confirmationCode, 'REF-123'); assert.equal(result.booking.activities[0].title, 'River cruise');
    assert.equal(JSON.stringify(result).includes('PRIVATE'), false); assert.equal(result.booking.customer, undefined);
    const docs = await (await send('/documents', undefined, access.token)).json();
    assert.deepEqual(docs.documents, [{ id: 'TICKET-123', title: 'River cruise' }]);
    assert.equal((await send('/documents/TICKET-123', undefined, access.token)).headers.get('content-type'), 'application/pdf');
    assert.equal((await send('/documents/OTHER-TICKET', undefined, access.token)).status, 404);
    status = 'CANCELLED'; assert.equal((await send('/documents/TICKET-123', undefined, access.token)).status, 409); status = 'CONFIRMED';
    await send('/logout', {}, access.token); assert.equal((await send('/booking', undefined, access.token)).status, 401);
    time += 16 * 60000;
    const exhausted = await request();
    for (let attempt = 0; attempt < 5; attempt++) assert.equal((await send('/verify', { challengeId: exhausted.challengeId, code: '000000' })).status, 401);
    assert.equal((await send('/verify', { challengeId: exhausted.challengeId, code: '123456' })).status, 401);
    time += 16 * 60000;
    const expired = await request(); time += 11 * 60000;
    assert.equal((await send('/verify', { challengeId: expired.challengeId, code: '123456' })).status, 401);
    const replacedCode = await request(); time += 61000;
    const expiringSession = await request();
    assert.equal((await send('/verify', { challengeId: replacedCode.challengeId, code: '123456' })).status, 401, 'resending must invalidate the previous code');
    const session = await (await send('/verify', { challengeId: expiringSession.challengeId, code: '123456' })).json();
    time += 31 * 60000; assert.equal((await send('/booking', undefined, session.token)).status, 401);
    const changedEmail = await request();
    const changedSession = await (await send('/verify', { challengeId: changedEmail.challengeId, code: '123456' })).json();
    email = 'new-owner@example.test'; assert.equal((await send('/booking', undefined, changedSession.token)).status, 401);
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('booking lookup fails clearly when email delivery is not configured', async () => {
  const app = express(); app.use(express.json()); registerBookingLookup(app, { api: async () => ({}), sendCode: null });
  const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/bokun/lookup/request`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference: 'REF-123', email: 'guest@example.test' }) });
    assert.equal(response.status, 503); assert.match((await response.json()).message, /being configured/);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
