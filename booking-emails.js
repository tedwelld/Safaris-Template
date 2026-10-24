import nodemailer from 'nodemailer';

function createTransport() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_FROM || !SMTP_USER || !SMTP_PASSWORD) return null;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;
  return nodemailer.createTransport({ host: SMTP_HOST, port, secure, requireTLS: !secure,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD }, connectionTimeout: 15000, greetingTimeout: 10000, socketTimeout: 20000,
    disableFileAccess: true, disableUrlAccess: true,
  });
}

const clean = value => String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
const formatAmount = (amount, currency) => amount == null ? 'Not available' : `${currency || ''} ${amount}`.trim();

function bookingSummary(booking) {
  const activities = (booking.activityBookings || []).map(item => {
    const title = clean(item.activity?.title || item.product?.title || 'Experience');
    const date = clean(item.date).slice(0, 10);
    const time = clean(item.startTime?.time || item.startTime);
    const guests = item.totalParticipants == null ? '' : ` (${item.totalParticipants} guests)`;
    return `- ${title}${date ? ` — ${date}` : ''}${time ? ` at ${time}` : ''}${guests}`;
  });
  return [
    `Booking reference: ${clean(booking.confirmationCode)}`,
    `Status: ${clean(booking.status)}`,
    `Total: ${formatAmount(booking.totalPrice, booking.currency)}`,
    `Paid: ${formatAmount(booking.totalPaid, booking.currency)}`,
    `Due: ${formatAmount(booking.totalDue, booking.currency)}`,
    '', 'Experiences:', ...(activities.length ? activities : ['- Details are available in the booking system.']),
  ].join('\n');
}

export function createBookingEmailSender() {
  const transport = createTransport();
  const from = process.env.SMTP_FROM;
  const adminRecipients = [...new Set([process.env.BOOKING_INBOX, process.env.ADMIN_EMAILS].filter(Boolean).flatMap(value => value.split(',')).map(value => value.trim()).filter(Boolean))];
  return async (booking, recipientType) => {
    if (!transport) throw new Error('SMTP is not configured.');
    const summary = bookingSummary(booking);
    if (recipientType === 'admin') {
      if (!adminRecipients.length) return false;
      const customer = booking.customer || {};
      const name = [customer.firstName, customer.lastName].map(clean).filter(Boolean).join(' ');
      await transport.sendMail({ from, to: adminRecipients.join(', '), subject: `New confirmed booking ${clean(booking.confirmationCode)}`,
        text: `A booking has been confirmed through the Dove Journeys website.\n\n${summary}\n\nGuest: ${name || 'Not provided'}\nGuest email: ${clean(customer.email) || 'Not provided'}\nGuest phone: ${clean(customer.phoneNumber || customer.phone) || 'Not provided'}` });
      return true;
    }
    const email = clean(booking.customer?.email);
    if (!email) return false;
    const name = clean(booking.customer?.firstName) || 'traveller';
    const bookingUrl = new URL('/my-booking', process.env.PUBLIC_SITE_URL || 'http://localhost:5173').href;
    await transport.sendMail({ from, to: { address: email }, subject: `Your Dove Journeys booking ${clean(booking.confirmationCode)} is confirmed`,
      text: `Hello ${name},\n\nYour Dove Journeys booking is confirmed. Keep this reference for your records.\n\n${summary}\n\nYou can view your booking and available vouchers at ${bookingUrl}.\n\nThank you for choosing Dove Journeys.` });
    return true;
  };
}
