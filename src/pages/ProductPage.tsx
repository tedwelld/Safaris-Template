import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { bokun, cartId, dateKey, duration, money, plain, today, type Availability, type Product } from '../bokun/api';
import { BookingError, BookingSteps } from '../bokun/Shared';

export function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product>();
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    bokun<Product>(`/products/${id}`, undefined, 'GET', controller.signal).then(setProduct).catch(e => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, [id, retry]);
  if (error) return <section className="section-wrap"><BookingError message={error} retry={() => { setError(''); setRetry(retry + 1); }} /></section>;
  if (!product || product.id !== Number(id)) return <p className="bk-message" role="status">Preparing your experience…</p>;
  return <ProductDetails key={product.id} product={product} />;
}
function ProductDetails({ product }: { product: Product }) {
  const [photo, setPhoto] = useState(0);
  const { hash } = useLocation();
  useEffect(() => {
    if (hash === '#book') document.getElementById('book')?.scrollIntoView({ block: 'start' });
  }, [hash]);
  const images = [...new Set([product.keyPhoto?.originalUrl, ...(product.photos || []).map(p => p.originalUrl)].filter((p): p is string => Boolean(p)))];
  const sections = [
    { title: 'The experience', content: plain(product.description || product.excerpt) },
    { title: 'What’s included', content: (product.inclusions || product.included || []).map(plain).filter(Boolean) },
    { title: 'Not included', content: (product.exclusions || product.excluded || []).map(plain).filter(Boolean) },
    { title: 'Before you go', content: [...(product.requirements || []).map(plain), ...(product.knowBeforeYouGoItems || []).map(plain)] },
    { title: 'Meeting & location', content: product.location?.address || '' },
    { title: 'Cancellation policy', content: plain(product.cancellationPolicy) },
  ].filter(s => s.content.length);
  return <div className="route-page bk-page"><div className="bk-breadcrumb"><Link to="/activities">Activities</Link><span>/</span><span>{product.title}</span></div>
    <div className="bk-product-gallery"><img className="bk-product-main" src={images[photo] || '/images/safari.jpg'} alt={product.title} />{images.length > 1 && <div className="bk-thumbnails">{images.map((src, i) => <button key={src} onClick={() => setPhoto(i)} aria-label={`View photo ${i + 1}`} aria-pressed={photo === i}><img src={src} alt="" loading="lazy" /></button>)}</div>}</div>
    <section className="section-wrap"><BookingSteps step={0} /><div className="bk-product-layout"><div><span className="eyebrow">{product.vendor?.title || 'DOVE JOURNEYS'}</span><h1 className="bk-product-title">{product.title}</h1><div className="bk-meta">{duration(product) && <span><i className="pi pi-clock" aria-hidden="true" /> {duration(product)}</span>}{product.difficultyLevel && <span>{product.difficultyLevel.replaceAll('_', ' ').toLowerCase()}</span>}{product.capacityType === 'ON_REQUEST' && <span>Supplier confirmation required</span>}</div><p className="bk-lead">{plain(product.excerpt)}</p><nav className="bk-section-links" aria-label="Experience information">{sections.map((s, i) => <a key={s.title} href={`#details-${i}`}>{s.title}</a>)}</nav>{sections.map((s, i) => <section className="bk-detail-section" id={`details-${i}`} key={s.title}><h2>{s.title}</h2>{Array.isArray(s.content) ? <ul>{s.content.map((line, j) => <li key={j}>{line}</li>)}</ul> : <p className="bk-prose">{s.content}</p>}</section>)}</div><BookingPanel product={product} /></div></section></div>;
}
function BookingPanel({ product }: { product: Product }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requestedDate = params.get('date') || '';
  const initialDate = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) && Number.isFinite(Date.parse(requestedDate)) && requestedDate >= today() ? requestedDate : '';
  const requestedDeparture = params.get('departure') || '';
  const [date, setDate] = useState(initialDate);
  const [slots, setSlots] = useState<Availability[]>([]);
  const [slotId, setSlotId] = useState('');
  const [rateId, setRateId] = useState('');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [places, setPlaces] = useState<{ pickupPlaces?: { id: number; title: string }[]; dropoffPlaces?: { id: number; title: string }[] }>({});
  const [pickupPlace, setPickupPlace] = useState('');
  const [dropoffPlace, setDropoffPlace] = useState('');
  const [pickupText, setPickupText] = useState('');
  const [dropoffText, setDropoffText] = useState('');
  useEffect(() => {
    if (!initialDate || product.bookingType === 'PASS') return;
    const controller = new AbortController();
    setLoading(true);
    bokun<Availability[]>(`/products/${product.id}/availability?start=${initialDate}&end=${initialDate}`, undefined, 'GET', controller.signal)
      .then(data => {
        const available = data.filter(slot => !slot.soldOut && (slot.unlimitedAvailability || slot.availabilityCount > 0) && dateKey(slot.date) === initialDate);
        setDate(initialDate); setSlots(available); setChecked(true);
        setSlotId(available.some(slot => slot.id === requestedDeparture) ? requestedDeparture : '');
      })
      .catch(reason => { if (!controller.signal.aborted) setError(reason.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [initialDate, requestedDeparture, product.id, product.bookingType]);
  const slot = slots.find(s => s.id === slotId);
  const rates = product.bookingType === 'PASS' ? product.rates || [] : slot?.rates || [];
  const price = slot?.pricesByRate?.find(p => p.activityRateId === Number(rateId));
  const guests = Object.values(counts).reduce((a, b) => a + b, 0);
  const rate = rates.find(r => r.id === Number(rateId));
  const minimum = Math.max(1, slot?.minParticipantsToBookNow || 1, rate?.minPerBooking || 1);
  const maximum = Math.min(100, rate?.maxPerBooking || 100, slot && !slot.unlimitedAvailability ? slot.availabilityCount : 100);
  const categories = (product.pricingCategories || []).filter(c => !rate?.pricingCategoryIds?.length || rate.pricingCategoryIds.includes(c.id));
  const priced = categories.filter(c => counts[c.id] > 0);
  const priceComplete = Boolean(price) && (Boolean(price?.pricePerBooking) || priced.every(c => price?.pricePerCategoryUnit?.some(p => p.id === c.id)));
  const total = price?.pricePerBooking?.amount ?? priced.reduce((sum, c) => sum + (price?.pricePerCategoryUnit?.find(p => p.id === c.id)?.amount.amount || 0) * counts[c.id], 0);
  const currency = price?.pricePerBooking?.currency || price?.pricePerCategoryUnit?.[0]?.amount.currency || 'USD';
  const needsPickup = rate?.pickupSelectionType === 'PRESELECTED';
  const needsDropoff = rate?.dropoffSelectionType === 'PRESELECTED';
  const pickupReady = !needsPickup || pickupPlace || (product.customPickupAllowed && pickupText.trim());
  const dropoffReady = !needsDropoff || dropoffPlace || (product.customDropoffAllowed && dropoffText.trim());
  const ready = guests >= minimum && guests <= maximum && rateId && pickupReady && dropoffReady && (product.bookingType === 'PASS' || slot);
  useEffect(() => {
    if (!rateId) return;
    const controller = new AbortController();
    bokun<typeof places>(`/products/${product.id}/places`, undefined, 'GET', controller.signal).then(setPlaces).catch(e => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, [product.id, rateId]);
  async function check() {
    setLoading(true); setChecked(false); setError(''); setSlots([]); setSlotId(''); setRateId('');
    try {
      const data = await bokun<Availability[]>(`/products/${product.id}/availability?start=${date}&end=${date}`);
      const available = data.filter(s => !s.soldOut && (s.unlimitedAvailability || s.availabilityCount > 0) && dateKey(s.date) === date);
      setSlots(available); setChecked(true);
    } catch (e) { setError((e as Error).message); } finally { setLoading(false); }
  }
  async function add() {
    setAdding(true); setError('');
    try {
      const transfer = (kind: 'pickup' | 'dropoff', place: string, text: string) => ({ [kind]: Boolean(place || text.trim()), ...(place ? { [`${kind}PlaceId`]: Number(place) } : text.trim() ? { [`${kind}Description`]: text.trim() } : {}) });
      await bokun(`/cart/${cartId()}/items`, { activityId: product.id, ...(product.bookingType === 'PASS' ? {} : { date, ...(product.bookingType === 'DATE_AND_TIME' ? { startTimeId: slot?.startTimeId } : {}) }), rateId: Number(rateId), ...transfer('pickup', pickupPlace, pickupText), ...transfer('dropoff', dropoffPlace, dropoffText), passengers: Object.entries(counts).flatMap(([category, count]) => Array.from({ length: count }, () => ({ pricingCategoryId: Number(category) }))) });
      window.dispatchEvent(new Event('bokun-cart-updated')); navigate('/cart');
    } catch (e) { setError((e as Error).message); } finally { setAdding(false); }
  }
  return <aside className="bk-booking-panel" id="book"><span className="eyebrow">MAKE IT YOURS</span><h2>Your adventure starts here.</h2><p>Choose your preferred departure and guests to see live pricing.</p>
    {product.bookingType !== 'PASS' && <form onSubmit={e => { e.preventDefault(); void check(); }}><label>Preferred date<input type="date" required min={today()} disabled={loading} value={date} onChange={e => { setDate(e.target.value); setSlots([]); setSlotId(''); setRateId(''); setChecked(false); setError(''); }} /></label><button className="secondary-btn" disabled={!date || loading}>{loading ? 'Checking…' : 'Check availability'} <i className="pi pi-calendar" aria-hidden="true" /></button></form>}
    {checked && !slots.length && <p role="status">No departures are available on this date. Please try another day.</p>}
    {slots.length > 0 && <label>{product.bookingType === 'DATE_AND_TIME' ? 'Departure time' : 'Available departure'}<select value={slotId} onChange={e => { setSlotId(e.target.value); setRateId(''); setCounts({}); }}><option value="">Choose a departure</option>{slots.map(s => <option key={s.id} value={s.id}>{s.startTimeLabel || (product.bookingType === 'DATE_AND_TIME' ? s.startTime : date)}{!s.unlimitedAvailability ? ` · ${s.availabilityCount} spaces` : ''}</option>)}</select></label>}
    {rates.length > 0 && <label>Experience option<select value={rateId} onChange={e => { setRateId(e.target.value); setCounts({}); setPickupPlace(''); setDropoffPlace(''); setPickupText(''); setDropoffText(''); }}><option value="">Choose an option</option>{rates.map(r => <option key={r.id} value={r.id}>{r.title || ('name' in r ? r.name : '') || 'Standard'}</option>)}</select></label>}
    {rateId && <fieldset><legend>Your guests</legend>{categories.map(c => <label className="bk-guest" key={c.id}><span>{c.title}<small>{c.minAge !== undefined ? `Ages ${c.minAge}${c.maxAge !== undefined ? `–${c.maxAge}` : '+'}` : 'Guest'}{price?.pricePerCategoryUnit?.find(p => p.id === c.id) && ` · ${money(price.pricePerCategoryUnit.find(p => p.id === c.id)!.amount.amount, currency)}`}</small></span><input type="number" aria-label={`Number of ${c.title} guests`} min="0" max={maximum} value={counts[c.id] || 0} onChange={e => setCounts({ ...counts, [c.id]: Math.max(0, Math.min(100, Math.floor(Number(e.target.value) || 0))) })} /></label>)}</fieldset>}
    {rateId && (['pickup', 'dropoff'] as const).map(kind => {
      const selection = kind === 'pickup' ? rate?.pickupSelectionType : rate?.dropoffSelectionType;
      if (!selection || selection === 'UNAVAILABLE') return null;
      const pickup = kind === 'pickup';
      const value = pickup ? pickupPlace : dropoffPlace;
      const custom = pickup ? product.customPickupAllowed : product.customDropoffAllowed;
      return <div className="bk-transfer" key={kind}><label>{pickup ? 'Pick-up location' : 'Drop-off location'}{selection === 'PRESELECTED' ? ' *' : ' (optional)'}<select value={value} onChange={e => { (pickup ? setPickupPlace : setDropoffPlace)(e.target.value); (pickup ? setPickupText : setDropoffText)(''); }}><option value="">{selection === 'PRESELECTED' ? 'Choose a location' : 'No transfer selected'}</option>{(pickup ? places.pickupPlaces : places.dropoffPlaces)?.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select></label>{custom && !value && <label>Or enter your {pickup ? 'pick-up' : 'drop-off'} address<input value={pickup ? pickupText : dropoffText} onChange={e => (pickup ? setPickupText : setDropoffText)(e.target.value)} maxLength={500} /></label>}</div>;
    })}
    {guests > 0 && <div className="bk-price"><span>{priceComplete ? 'Experience subtotal' : 'Final total calculated in your selection'}<small>{guests} {guests === 1 ? 'guest' : 'guests'} · Transfers may cost extra</small></span>{priceComplete && <strong>{money(total, currency)} <small>{currency}</small></strong>}</div>}
    {guests > 0 && (guests < minimum || guests > maximum) && <p role="status">Choose between {minimum} and {maximum} guests for this departure.</p>}
    {error && <p className="bk-error" role="alert">{error}</p>}
    <button className="primary-btn" disabled={!ready || adding || loading} onClick={add}>{adding ? 'Adding your experience…' : 'Add to your journey'} <i className="pi pi-arrow-right" aria-hidden="true" /></button><p className="bk-small">Availability and the final total are checked by Bókun before checkout.{product.capacityType === 'ON_REQUEST' && ' Your booking requires supplier confirmation.'}</p><Link className="text-link" to="/contact">Prefer a little guidance? Talk to us.</Link>
  </aside>;
}


