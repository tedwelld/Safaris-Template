import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bokun, cartId, money, type Cart } from '../bokun/api';
import { BookingError, BookingSteps } from '../bokun/Shared';
export function CartPage() {
  const [cart, setCart] = useState<Cart>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    bokun<Cart>(`/cart/${cartId()}`, undefined, 'GET', controller.signal).then(setCart).catch(e => { if (!controller.signal.aborted) setError(e.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [retry]);
  async function remove(code: string) {
    setRemoving(code); setError('');
    try { setCart(await bokun<Cart>(`/cart/${cartId()}/items/${encodeURIComponent(code)}`, undefined, 'DELETE')); window.dispatchEvent(new Event('bokun-cart-updated')); }
    catch (e) { setError((e as Error).message); } finally { setRemoving(''); }
  }
  return <div className="route-page bk-page"><section className="page-intro"><span className="eyebrow">YOUR DOVE JOURNEY</span><h1>A few unforgettable<br /><em>moments, chosen by you.</em></h1><p>Review your experiences before we take care of the details.</p></section><section className="section-wrap"><BookingSteps step={1} />{error && <BookingError message={error} retry={() => { setLoading(true); setError(''); setRetry(retry + 1); }} />}{loading ? <p role="status">Retrieving your selection…</p> : cart?.activityBookings?.length ? <div className="bk-cart-layout"><div>{cart.activityBookings.map(item => <article className="bk-cart-item" key={item.id}><img src={item.activity.keyPhoto?.originalUrl || '/images/safari.jpg'} alt="" /><div><span className="eyebrow">YOUR EXPERIENCE</span><h2><Link to={`/product/${item.activity.id}`}>{item.activity.title}</Link></h2><p>{item.date ? item.date.slice(0, 10) : 'Flexible pass'}{item.startTime?.time && ` · ${item.startTime.time}`}<br />{item.pricingCategoryBookings?.length || 0} guests</p><button className="text-link" disabled={Boolean(removing)} onClick={() => remove(item.productConfirmationCode)}>{removing === item.productConfirmationCode ? 'Removing…' : 'Remove experience'}</button></div><strong>{money(item.totalPrice, cart.currency)}<small>{cart.currency}</small></strong></article>)}<Link className="text-link" to="/activities"><i className="pi pi-plus" aria-hidden="true" /> Add another experience</Link></div><aside className="bk-summary"><span className="eyebrow">A JOURNEY TAKING SHAPE</span><h2>Your selection.</h2><p>{cart.activityBookings.length} {cart.activityBookings.length === 1 ? 'experience' : 'experiences'} to look forward to.</p><p>Final currency, fees, payment options and total are confirmed at checkout.</p><Link className="primary-btn" to="/checkout">Continue to checkout <i className="pi pi-arrow-right" aria-hidden="true" /></Link><p className="bk-small">Your selection does not reserve availability until the booking is processed.</p></aside></div> : !error && <div className="bk-message"><i className="pi pi-compass" aria-hidden="true" /><h2>Your journey is still unwritten.</h2><p>Start with an experience you’ll remember.</p><Link className="primary-btn" to="/activities">Explore experiences</Link></div>}</section></div>;
}

