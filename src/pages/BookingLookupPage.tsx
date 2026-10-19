import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bokun, money, type Booking } from '../bokun/api';
import { BookingDocuments } from '../bokun/BookingDocuments';

type RetrievedBooking = Booking & { totalPrice?: number; activities: { title: string; date?: string; startTime?: string; status: string; guests?: number }[] };
type Challenge = { challengeId: string; message: string; expiresIn: number; resendAfter: number };
const sessionKey = 'dove-bokun-lookup-session';

export function BookingLookupPage() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(sessionKey));
  const [booking, setBooking] = useState<RetrievedBooking>();
  const [reference, setReference] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [challenge, setChallenge] = useState<Challenge>();
  const [resendAt, setResendAt] = useState(0);
  const [clock, setClock] = useState(Date.now);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!challenge) return;
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [challenge]);
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    bokun<{ booking: RetrievedBooking }>('/lookup/booking', undefined, 'GET', controller.signal, token)
      .then(data => setBooking(data.booking))
      .catch(reason => {
        if (controller.signal.aborted) return;
        setError(reason.message);
        if (reason.status === 401) { sessionStorage.removeItem(sessionKey); setToken(null); setBooking(undefined); }
      }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [token, retry]);
  async function requestCode() {
    setBusy(true); setError('');
    try {
      const result = await bokun<Challenge>('/lookup/request', { reference, email });
      setChallenge(result); setCode(''); setClock(Date.now()); setResendAt(Date.now() + result.resendAfter * 1000);
    } catch (reason) { setError((reason as Error).message); }
    finally { setBusy(false); }
  }
  async function verify() {
    if (!challenge) return;
    setBusy(true); setError('');
    try {
      const result = await bokun<{ token: string }>('/lookup/verify', { challengeId: challenge.challengeId, code });
      sessionStorage.setItem(sessionKey, result.token); setLoading(true); setToken(result.token); setChallenge(undefined); setCode('');
    } catch (reason) { setError((reason as Error).message); }
    finally { setBusy(false); }
  }
  async function signOut() {
    setBusy(true);
    try { await bokun('/lookup/logout', {}, 'POST', undefined, token || undefined); }
    finally { sessionStorage.removeItem(sessionKey); setToken(null); setBooking(undefined); setChallenge(undefined); setReference(''); setEmail(''); setCode(''); setLoading(false); setBusy(false); setError(''); }
  }
  const resendSeconds = Math.max(0, Math.ceil((resendAt - clock) / 1000));
  return <div className="route-page bk-page"><section className="page-intro"><span className="eyebrow">YOUR JOURNEY, ALL IN ONE PLACE</span><h1>Your next chapter.<br /><em>Your booking details.</em></h1><p>Check your booking status and keep your activity vouchers close at hand.</p></section>
    <section className="section-wrap bk-lookup">
      {error && <p className="bk-error" role="alert">{error}</p>}
      {token ? loading ? <p role="status">Retrieving your booking securely…</p> : booking ? <>
        <div className="bk-toolbar"><div><span className="eyebrow">BOOKING REFERENCE</span><h2>{booking.confirmationCode}</h2><p>Status: <strong>{booking.status.replaceAll('_', ' ').toLowerCase()}</strong></p></div><button className="secondary-btn" disabled={busy} onClick={() => void signOut().catch(() => {})}>Sign out</button></div>
        <div className="bk-lookup-totals">{booking.totalPrice !== undefined && <div><span>Booking total</span><strong>{money(booking.totalPrice, booking.currency)}</strong></div>}<div><span>Paid</span><strong>{money(booking.totalPaid || 0, booking.currency)}</strong></div><div><span>Balance</span><strong>{money(booking.totalDue || 0, booking.currency)}</strong></div></div>
        <div className="bk-lookup-activities">{booking.activities.map((activity, index) => <article key={index}><h3>{activity.title}</h3><p>{activity.date ? activity.date.slice(0, 10) : 'Flexible experience'}{activity.startTime && ` · ${activity.startTime}`}{activity.guests !== undefined && ` · ${activity.guests} ${activity.guests === 1 ? 'guest' : 'guests'}`}</p><p>Status: {activity.status.replaceAll('_', ' ').toLowerCase()}</p></article>)}</div>
        {booking.status === 'CONFIRMED' ? <BookingDocuments verificationToken={token} /> : <p>Vouchers become available when your booking is confirmed. Contact our team if you need help with this status.</p>}
        <p className="bk-small">For your privacy, access expires after 30 minutes. Sign out when using a shared device.</p>
      </> : <div className="bk-actions"><button className="secondary-btn" onClick={() => { setError(''); setLoading(true); setRetry(value => value + 1); }}>Try again</button><button className="secondary-btn" onClick={() => void signOut().catch(() => {})}>Sign out</button></div> : <div className="bk-lookup-layout"><div className="bk-lookup-form">
        <span className="eyebrow">A QUICK, SECURE CHECK</span><h2>{challenge ? 'Check your inbox.' : 'Find your booking.'}</h2>
        {challenge ? <><p role="status">{challenge.message}</p><form onSubmit={event => { event.preventDefault(); void verify(); }}><label>Verification code<input type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ''))} /></label><p className="bk-small">Codes expire after ten minutes and allow up to five attempts.</p><button className="primary-btn" disabled={busy}>{busy ? 'Verifying…' : 'View my booking'} <i className="pi pi-lock" aria-hidden="true" /></button></form><div className="bk-actions"><button className="text-link" disabled={busy || resendSeconds > 0} onClick={() => void requestCode()}>{resendSeconds ? `Resend code in ${resendSeconds}s` : 'Resend code'}</button><button className="text-link" disabled={busy} onClick={() => { setChallenge(undefined); setCode(''); setError(''); }}>Change reference or email</button></div></> : <><p>Use the booking reference from your confirmation and the email address used to book.</p><form onSubmit={event => { event.preventDefault(); void requestCode(); }}><label>Booking reference<input autoComplete="off" maxLength={100} minLength={3} pattern="[A-Za-z0-9_-]{3,100}" required value={reference} onChange={event => setReference(event.target.value.toUpperCase())} placeholder="Your confirmation reference" /></label><label>Booking email<input type="email" autoComplete="email" maxLength={254} required value={email} onChange={event => setEmail(event.target.value)} placeholder="The email used for your booking" /></label><button className="primary-btn" disabled={busy}>{busy ? 'Requesting code…' : 'Send verification code'} <i className="pi pi-envelope" aria-hidden="true" /></button></form></>}
      </div><aside className="bk-summary"><span className="eyebrow">READY FOR YOUR ADVENTURE</span><h2>A little peace of mind.</h2><p>See your current booking status, check your activity dates and download confirmed vouchers.</p><p>We’ll verify your email before showing any booking details.</p><Link className="text-link" to="/contact">Need a hand? Talk to our team.</Link></aside></div>}
    </section></div>;
}
