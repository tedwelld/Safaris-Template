export interface Photo { originalUrl: string }
export interface Rate {
  id: number; title?: string; name?: string; minPerBooking?: number; maxPerBooking?: number; pricingCategoryIds?: number[];
  pickupSelectionType?: string; dropoffSelectionType?: string;
}
export interface Product {
  id: number; title: string; excerpt?: string; description?: string; keyPhoto?: Photo; photos?: Photo[];
  durationText?: string; durationHours?: number; durationMinutes?: number; durationDays?: number;
  duration?: { weeks?: number; days?: number; hours?: number; minutes?: number };
  destinations?: string[]; catalogueCategories?: string[]; durationTotalMinutes?: number | null;
  priceFrom?: { amount: number; currency: string } | null;
  location?: { address?: string }; vendor?: { title: string }; difficultyLevel?: string;
  bookingType: 'DATE' | 'DATE_AND_TIME' | 'PASS'; capacityType?: string;
  pricingCategories?: { id: number; title: string; minAge?: number; maxAge?: number }[];
  rates?: Rate[]; customPickupAllowed?: boolean; customDropoffAllowed?: boolean;
  included?: unknown[]; excluded?: unknown[]; inclusions?: unknown[]; exclusions?: unknown[];
  requirements?: string[]; knowBeforeYouGoItems?: { title: string }[];
  cancellationPolicy?: { title?: string; description?: string } | string;
}
export interface Availability {
  id: string; date: number; startTimeId?: number; startTime?: string; startTimeLabel?: string;
  soldOut?: boolean; unlimitedAvailability: boolean; availabilityCount: number; minParticipantsToBookNow?: number;
  rates: Rate[];
  pricesByRate: { activityRateId: number; pricePerCategoryUnit?: { id: number; amount: { amount: number; currency: string } }[]; pricePerBooking?: { amount: number; currency: string } }[];
}
export interface Cart {
  sessionId: string; currency: string; totalPrice: number; totalPriceInInvoiceCurrency?: number; size: number;
  activityBookings: { id: number; activity: Product; date?: string; startTime?: { time?: string }; totalPrice: number; productConfirmationCode: string; pricingCategoryBookings?: unknown[] }[];
}
export interface Question {
  questionId: string; label: string; help?: string; required?: boolean; placeholder?: string;
  dataType?: string; dataFormat?: string; pattern?: string; defaultValue?: string; answers?: string[];
  selectFromOptions?: boolean; selectMultiple?: boolean; answerOptions?: { label: string; value: string }[];
}
export interface QuestionGroup {
  bookingId?: number; activityId?: number; pricingCategoryId?: number; activityTitle?: string; pricingCategoryTitle?: string;
  mainContactDetails?: Question[]; passengerDetails?: Question[]; questions?: Question[]; pickupQuestions?: Question[]; dropoffQuestions?: Question[];
  activityBookings?: QuestionGroup[]; passengers?: QuestionGroup[]; extras?: QuestionGroup[];
}
export interface CheckoutOption {
  type: string; label: string; amount: number; currency: string; formattedAmount?: string; partialPayment?: boolean; minPartialAmount?: number;
  questions?: Question[]; paymentMethods: { cardProvider?: { title: string; questions?: Question[] } };
}
export interface Checkout { options: CheckoutOption[]; questions: QuestionGroup }
export interface Booking { confirmationCode: string; status: string; totalPaid: number; totalDue: number; currency: string }
export interface CheckoutResult {
  booking?: Booking; dccQuote?: unknown;
  redirectRequest?: { url: string; method: string; parameters?: { name: string; value: string }[] };
  travelDocuments?: { activityTickets?: { productTitle: string; ticket: string }[] };
}
const base = (import.meta.env.VITE_BOKUN_API_BASE_URL || '').replace(/\/$/, '');
export async function downloadVoucher(checkoutId: string, documentId: string) {
  const response = await fetch(`${base}/api/bokun/cart/${encodeURIComponent(checkoutId)}/documents/${encodeURIComponent(documentId)}`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Your voucher could not be downloaded. Please try again.');
  }
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a'); link.href = url;
  link.download = `dove-journeys-${documentId.replace(/[^a-z0-9_-]/gi, '')}.pdf`;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
export async function bokun<T>(path: string, body?: unknown, method = body === undefined ? 'GET' : 'POST', signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${base}/api/bokun${path}`, { method, signal, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await response.json().catch(() => ({ message: 'Live bookings are temporarily unavailable. Please contact us for help.' }));
  if (!response.ok) throw new Error(data.message || 'Please try again in a moment.');
  return data;
}
export function cartId() {
  let id = localStorage.getItem('dove-bokun-cart');
  if (!id || !/^[a-f0-9-]{36}$/i.test(id)) { id = crypto.randomUUID(); localStorage.setItem('dove-bokun-cart', id); }
  return id;
}
export function money(amount: number, currency = 'USD') { return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount); }
export function plain(value: unknown): string {
  if (typeof value === 'object' && value !== null) return plain(('title' in value ? value.title : '') || ('description' in value ? value.description : ''));
  if (typeof value !== 'string') return '';
  const document = new DOMParser().parseFromString(value.replace(/<br\s*\/?>|<\/(?:p|div|li|h[1-6])>/gi, '\n'), 'text/html');
  document.querySelectorAll('script, style').forEach(node => node.remove());
  return (document.body.textContent || '').trim();
}
export function duration(p: Product) {
  const days = p.duration?.days ?? p.durationDays;
  const hours = p.duration?.hours ?? p.durationHours;
  const minutes = p.duration?.minutes ?? p.durationMinutes;
  return p.durationText || [p.duration?.weeks && `${p.duration.weeks} weeks`, days && `${days} days`, hours && `${hours} hours`, minutes && `${minutes} minutes`].filter(Boolean).join(' ');
}
export function dateKey(date: number) { return new Date(date < 1e12 ? date * 1000 : date).toISOString().slice(0, 10); }
export function today() { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
