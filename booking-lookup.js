import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import nodemailer from 'nodemailer';
import { bookingDocuments, sendBookingVoucher } from './bokun-documents.js';

function smtpSender() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_FROM || !SMTP_USER || !SMTP_PASSWORD) return null;
  const port = Number(process.env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, requireTLS: port !== 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD }, connectionTimeout: 15000, greetingTimeout: 10000, socketTimeout: 20000,
    disableFileAccess: true, disableUrlAccess: true,
  });
  return async ({ email, code }) => {
    await transport.sendMail({ from: SMTP_FROM, to: { address: email }, subject: 'Your Dove Journeys verification code',
      text: `Your verification code is ${code}.\n\nEnter this code on the Dove Journeys booking lookup page. It expires in 10 minutes and can be used once.\n\nDo not share this code. If you did not request it, you can ignore this message.`,
    });
  };
}

export function registerBookingLookup(app, { api, sendCode = smtpSender(), now = Date.now, createCode = () => String(randomInt(100000, 1000000)) }) {
  const challenges = new Map(), sessions = new Map(), limits = new Map();
  const secret = randomBytes(32);
  const digest = value => createHash('sha256').update(value).digest('hex');
  const codeHash = (id, code) => createHmac('sha256', secret).update(`${id}:${code}`).digest();
  const emailOf = booking => String(booking.customer?.email || '').trim().toLowerCase();
  const error = (message, status = 400) => Object.assign(new Error(message), { status });
  function cleanup() {
    for (const store of [challenges, sessions, limits]) for (const [key, entry] of store) if (entry.expires <= now()) store.delete(key);
  }
  function limit(key, maximum, windowMs) {
    const entry = limits.get(key) || { count: 0, expires: now() + windowMs };
    if (entry.count >= maximum) throw error('Too many attempts. Please wait before trying again.', 429);
    entry.count++; limits.set(key, entry);
  }
  const route = fn => async (req, res) => {
    res.set({ 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' });
    try { cleanup(); const result = await fn(req, res); if (!res.headersSent) res.json(result); }
    catch (reason) { if (!res.headersSent) res.status(reason.status || 503).json({ message: reason.status ? reason.message : 'Booking lookup is temporarily unavailable. Please try again or contact us.' }); }
  };
  app.post('/api/bokun/lookup/request', route(async req => {
    const reference = typeof req.body?.reference === 'string' ? req.body.reference.trim().toUpperCase() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!/^[A-Z0-9_-]{3,100}$/.test(reference) || email.length > 254 || !/^[^\s@<>;,]+@[^\s@<>;,]+\.[^\s@<>;,]+$/.test(email)) throw error('Enter your booking reference and a valid booking email.');
    if (!sendCode) throw error('Email verification is being configured. Please contact our team for your booking.', 503);
    limit(`request-ip:${req.ip}`, 10, 15 * 60000);
    const account = digest(`${reference}:${email}`);
    limit(`account:${account}`, 5, 15 * 60000); limit(`cooldown:${account}`, 1, 60000);
    // Invalidate previous codes for the same booking/email combination.
    for (const [id, challenge] of challenges) if (challenge.account === account) challenges.delete(id);
    let booking;
    try { booking = await api('GET', `/booking.json/booking/${encodeURIComponent(reference)}`); }
    catch (reason) { if (reason.status !== 404) throw error('Booking lookup is temporarily unavailable. Please try again or contact us.', 503); }
    const id = randomBytes(24).toString('hex'), code = createCode();
    const valid = Boolean(booking && emailOf(booking) === email && booking.confirmationCode?.toUpperCase() === reference);
    const challenge = { account, reference, email, hash: codeHash(id, code), valid, attempts: 0, expires: now() + 10 * 60000 };
    challenges.set(id, challenge);
    if (valid) {
      // Sending asynchronously keeps the public response identical for matching and nonmatching email addresses.
      Promise.resolve().then(() => sendCode({ email, code })).catch(() => { challenge.valid = false; });
    }
    return { challengeId: id, expiresIn: 600, resendAfter: 60, message: 'If the reference and email match a booking, a verification code will arrive shortly. Check your inbox and spam folder.' };
  }));
  app.post('/api/bokun/lookup/verify', route(async req => {
    limit(`verify-ip:${req.ip}`, 30, 15 * 60000);
    const id = String(req.body?.challengeId || ''), code = String(req.body?.code || '');
    const challenge = challenges.get(id);
    const failure = () => error('The code is invalid or expired. Request a new code if needed.', 401);
    if (!challenge || challenge.attempts >= 5) throw failure();
    challenge.attempts++;
    if (!/^\d{6}$/.test(code) || !timingSafeEqual(challenge.hash, codeHash(id, code)) || !challenge.valid) throw failure();
    challenges.delete(id); // Consume before fetching to prevent concurrent reuse.
    const booking = await api('GET', `/booking.json/booking/${encodeURIComponent(challenge.reference)}`);
    if (emailOf(booking) !== challenge.email) throw failure();
    const token = randomBytes(32).toString('hex'), expires = now() + 30 * 60000;
    sessions.set(digest(token), { reference: challenge.reference, email: challenge.email, expires });
    return { token, expiresAt: expires };
  }));
  async function authorized(req) {
    const token = String(req.headers.authorization || '').replace(/^Bearer /, '');
    const session = /^[a-f0-9]{64}$/.test(token) ? sessions.get(digest(token)) : undefined;
    if (!session) throw error('Your verification session has expired. Please verify your email again.', 401);
    const booking = await api('GET', `/booking.json/booking/${encodeURIComponent(session.reference)}`);
    if (emailOf(booking) !== session.email) { sessions.delete(digest(token)); throw error('Please verify your booking email again.', 401); }
    return booking;
  }
  app.get('/api/bokun/lookup/booking', route(async req => {
    const booking = await authorized(req);
    return { booking: { confirmationCode: booking.confirmationCode, status: booking.status, currency: booking.currency,
      totalPrice: booking.totalPrice, totalPaid: booking.totalPaid, totalDue: booking.totalDue,
      activities: (booking.activityBookings || []).map(item => ({ title: item.activity?.title || item.product?.title || 'Your activity', date: item.date, startTime: item.startTime, status: item.status || booking.status, guests: item.totalParticipants })),
    } };
  }));
  app.get('/api/bokun/lookup/documents', route(async req => ({ documents: bookingDocuments(await authorized(req)) })));
  app.get('/api/bokun/lookup/documents/:document', route(async (req, res) => sendBookingVoucher(api, await authorized(req), req.params.document, res)));
  app.post('/api/bokun/lookup/logout', route(async req => { const token = String(req.headers.authorization || '').replace(/^Bearer /, ''); sessions.delete(digest(token)); return { loggedOut: true }; }));
}
