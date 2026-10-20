export function bookingDocuments(booking) {
  if (booking.status !== 'CONFIRMED') throw Object.assign(new Error('Vouchers are available once your booking is confirmed.'), { status: 409 });
  return (booking.activityBookings || [])
    .filter(item => !item.status || item.status === 'CONFIRMED')
    .map(item => ({ id: item.productConfirmationCode || item.confirmationCode, title: item.activity?.title || item.product?.title || 'Activity voucher' }))
    .filter(item => typeof item.id === 'string' && item.id.length);
}

export async function sendBookingVoucher(api, booking, documentId, res) {
  const document = bookingDocuments(booking).find(item => item.id === documentId);
  if (!document) throw Object.assign(new Error('This voucher does not belong to your booking.'), { status: 404 });
  const response = await api('GET', `/booking.json/activity-booking/${encodeURIComponent(document.id)}/ticket`, undefined, true);
  const pdf = Buffer.from(await response.arrayBuffer());
  if (pdf.subarray(0, 5).toString() !== '%PDF-') throw new Error('Your supplier’s voucher is not ready yet. Please try again shortly or contact us.');
  res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="dove-journeys-${document.id.replace(/[^a-z0-9_-]/gi, '')}.pdf"` });
  res.send(pdf);
}
