import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { bokun, cartId, money, type Booking, type Checkout, type CheckoutResult } from '../bokun/api';
import { answerTree, answers, Questions, QuestionTree, type Values } from '../bokun/Questions';
import { BookingError, BookingSteps } from '../bokun/Shared';
import { BookingDocuments } from '../bokun/BookingDocuments';

function redirectPayment(request: NonNullable<CheckoutResult['redirectRequest']>) {
  const url = new URL(request.url);
  if (url.protocol !== 'https:') throw new Error('The payment provider returned an invalid payment address. Please contact us.');
  if (!['GET', 'POST'].includes(request.method.toUpperCase())) throw new Error('Unsupported payment redirect. Please contact us.');
  const form = document.createElement('form');
  form.method = request.method; form.action = url.href;
  for (const p of request.parameters || []) { const input = document.createElement('input'); input.type = 'hidden'; input.name = p.name; input.value = p.value; form.appendChild(input); }
  document.body.appendChild(form); form.submit();
}
export function CheckoutPage() {
  const [checkoutId] = useState(cartId);
  const navigate = useNavigate();
  const [data, setData] = useState<Checkout>();
  const [selected, setSelected] = useState('');
  const [values, setValues] = useState<Values>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const option = data?.options.find(o => o.type === selected);
  useEffect(() => {
    const controller = new AbortController();
    bokun<Checkout>(`/cart/${checkoutId}/checkout`, undefined, 'GET', controller.signal).then(checkout => { setData(checkout); setSelected(checkout.options[0]?.type || ''); }).catch(e => { if (!controller.signal.aborted) setError(e.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [retry, checkoutId]);
  function change(key: string, value: string[]) { setValues(v => ({ ...v, [key]: value })); }
  async function submit() {
    if (!data || !option || busy) return;
    setBusy(true); setError('');
    try {
      sessionStorage.setItem('dove-bokun-last-checkout', checkoutId);
      const response = await bokun<CheckoutResult>(`/cart/${checkoutId}/checkout`, { checkoutOption: option.type, bookingAnswers: answerTree(data.questions || {}, values), checkoutOptionAnswers: answers(option.questions, `option.${option.type}`, values), cardPaymentProviderAnswers: answers(option.paymentMethods.cardProvider?.questions, `provider.${option.type}`, values) });
      if (response.dccQuote) throw new Error('Your provider offered a currency conversion. Please contact our team to complete payment.');
      if (response.redirectRequest) redirectPayment(response.redirectRequest);
      else if (response.booking) navigate('/checkout/return', { replace: true });
      else throw new Error('The booking result could not be verified. Please contact us before trying again.');
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return <div className="route-page bk-page"><section className="page-intro"><span className="eyebrow">THE DETAILS THAT MAKE IT YOURS</span><h1>One step closer<br /><em>to extraordinary.</em></h1><p>Your guest details, your final total, and a secure way to book.</p></section><section className="section-wrap"><BookingSteps step={2} /><Link className="text-link" to="/cart">← Back to your selection</Link>{error && <BookingError message={error} retry={!data ? () => { setError(''); setLoading(true); setRetry(retry + 1); } : undefined} />}{loading ? <p className="bk-message" role="status">Confirming your booking options…</p> : data && !data.options.length ? <div className="bk-message"><h2>Let’s finish this together.</h2><p>Online payment is unavailable for this selection. Our team can help arrange your booking.</p><Link className="primary-btn" to="/contact">Contact our team</Link></div> : data && option && <form className="bk-checkout-layout" onSubmit={event => { event.preventDefault(); void submit(); }}><fieldset className="bk-checkout-details" disabled={busy}><legend>Guest details</legend><p>Complete the details requested by your experience provider. Fields marked * are required.</p><QuestionTree group={data.questions || {}} values={values} change={change} /><Questions questions={option.questions} path={`option.${option.type}`} values={values} change={change} /><Questions questions={option.paymentMethods.cardProvider?.questions} path={`provider.${option.type}`} values={values} change={change} /></fieldset><aside className="bk-summary"><span className="eyebrow">YOUR NEXT CHAPTER</span><h2>Ready when you are.</h2><label>Payment option<select value={selected} disabled={busy} onChange={e => setSelected(e.target.value)}>{data.options.map(o => <option key={o.type} value={o.type}>{o.label || o.type.replaceAll('_', ' ')}</option>)}</select></label><div className="bk-price"><span>Booking total</span><strong>{money(option.amount, option.currency)}<small>{option.currency}</small></strong></div>{option.partialPayment && <p>Deposit payable now: <strong>{money(option.minPartialAmount || 0, option.currency)}</strong>. The remaining balance is payable under your supplier’s terms.</p>}<p>{option.type === 'CUSTOMER_NO_PAYMENT' ? 'Payment is due separately under the supplier’s terms. This booking is not marked as paid.' : `You’ll continue to ${option.paymentMethods.cardProvider?.title || 'our payment provider'} to enter your card details securely.`}</p><label className="bk-consent"><input type="checkbox" required disabled={busy} /> <span>I have reviewed my selection, the <Link to="/terms" target="_blank">booking terms</Link>, and each experience’s cancellation policy.</span></label><button className="primary-btn" disabled={busy}>{busy ? 'Processing…' : option.type === 'CUSTOMER_NO_PAYMENT' ? 'Confirm booking · pay later' : 'Continue to secure payment'}<i className="pi pi-lock" aria-hidden="true" /></button><p className="bk-small">Availability is checked again when you book. Please keep this page open while your request is processed.</p></aside></form>}</section></div>;
}
function BookingOutcome({ booking, checkoutId }: { booking: Booking; checkoutId: string }) {
  const confirmed = booking.status === 'CONFIRMED';
  return <section className="section-wrap bk-message"><span className="eyebrow">YOUR DOVE JOURNEY</span><i className={`pi ${confirmed ? 'pi-check-circle' : 'pi-clock'}`} aria-hidden="true" /><h1>{confirmed ? 'Your adventure awaits.' : 'Your booking update.'}</h1><p>{confirmed ? 'Your booking has been confirmed by Bókun.' : `Booking status: ${booking.status.toLowerCase().replaceAll('_', ' ')}. Our team can help with the next steps.`}</p><p>Reference: <strong>{booking.confirmationCode}</strong></p><p>Paid: {money(booking.totalPaid || 0, booking.currency)} · Balance: {money(booking.totalDue || 0, booking.currency)}</p>{confirmed && <BookingDocuments checkoutId={checkoutId} />}<div className="bk-actions"><Link className="primary-btn" to="/activities">Explore more experiences</Link><Link className="secondary-btn" to="/contact">Contact us</Link></div></section>;
}
export function CheckoutReturnPage() {
  const [params] = useSearchParams();
  const [result, setResult] = useState<{ verified: boolean; booking?: Booking }>();
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [checkoutId] = useState(() => sessionStorage.getItem('dove-bokun-last-checkout') || cartId());
  useEffect(() => {
    const controller = new AbortController();
    bokun<{ verified: boolean; booking?: Booking }>(`/cart/${checkoutId}/result`, undefined, 'GET', controller.signal).then(data => {
      setResult(data);
      if (data.verified && ['CONFIRMED', 'REQUESTED'].includes(data.booking?.status || '')) {
        if (localStorage.getItem('dove-bokun-cart') === checkoutId) localStorage.removeItem('dove-bokun-cart');
        window.dispatchEvent(new Event('bokun-cart-updated'));
      }
    }).catch(e => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, [retry, checkoutId]);
  if (result?.verified && result.booking) return <BookingOutcome booking={result.booking} checkoutId={checkoutId} />;
  return <section className="section-wrap bk-message">{error ? <BookingError message={error} /> : !result ? <p role="status">Checking your booking with Bókun…</p> : <><h1>{params.get('status') === 'cancelled' ? 'Payment cancelled.' : params.get('status') === 'error' ? 'Payment needs attention.' : 'We’re checking your booking.'}</h1><p>We have not yet verified a confirmed booking. Please check again or contact our team before starting another payment.</p></>}<div className="bk-actions"><button className="secondary-btn" onClick={() => { setError(''); setResult(undefined); setRetry(retry + 1); }}>Check booking status</button><Link className="primary-btn" to="/contact">Contact our team</Link></div></section>;
}
