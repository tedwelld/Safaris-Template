import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bokun, dateKey, today, type Availability, type Product } from './api';

export function HomeAvailabilityForm() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<Availability[] | null>(null);
  const product = products.find(item => String(item.id) === productId);

  useEffect(() => {
    const controller = new AbortController();
    bokun<{ items: Product[]; totalHits: number }>(`/products?page=${page}`, undefined, 'GET', controller.signal)
      .then(data => {
        setProducts(previous => [...new Map([...previous, ...data.items].map(item => [item.id, item])).values()]);
        setTotal(data.totalHits);
      })
      .catch(reason => { if (!controller.signal.aborted) setError(reason.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, retry]);

  async function checkAvailability() {
    if (!product || checking) return;
    setChecking(true); setError(''); setResult(null);
    try {
      const slots = await bokun<Availability[]>(`/products/${product.id}/availability?start=${date}&end=${date}`);
      setResult(slots.filter(slot => !slot.soldOut && (slot.unlimitedAvailability || slot.availabilityCount > 0) && dateKey(slot.date) === date));
    } catch (reason) { setError((reason as Error).message); }
    finally { setChecking(false); }
  }

  return <section className="home-availability" aria-labelledby="home-availability-heading">
    <div className="home-availability-heading">
      <div><span className="eyebrow">MAKE ROOM FOR SOMETHING EXTRAORDINARY</span><h2 id="home-availability-heading">Find your next adventure.</h2></div>
      <Link className="text-link" to="/activities">View all activities <i className="pi pi-arrow-up-right" aria-hidden="true" /></Link>
    </div>
    <form className="home-availability-fields" onSubmit={event => { event.preventDefault(); void checkAvailability(); }}>
      <label htmlFor="home-experience">Your experience
        <select id="home-experience" required disabled={loading || checking || !products.length} value={productId} onChange={event => { setProductId(event.target.value); setResult(null); setError(''); }}>
          <option value="">{loading ? 'Finding experiences…' : 'Choose an experience'}</option>
          {products.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
      </label>
      <label htmlFor="home-experience-date">{product?.bookingType === 'PASS' ? 'Flexible experience' : 'Preferred date'}
        <input id="home-experience-date" type="date" min={today()} required={product?.bookingType !== 'PASS'} disabled={checking || product?.bookingType === 'PASS'} value={date} onChange={event => { setDate(event.target.value); setResult(null); setError(''); }} />
      </label>
      {product?.bookingType === 'PASS' ? <Link className="primary-btn" to={`/product/${product.id}#book`}>View booking options <i className="pi pi-arrow-right" aria-hidden="true" /></Link> : <button className="primary-btn" disabled={!product || !date || loading || checking}>{checking ? 'Checking…' : 'Check availability'}<i className="pi pi-calendar" aria-hidden="true" /></button>}
    </form>
    <div className="home-availability-footnote"><p>{product?.bookingType === 'PASS' ? 'This experience has flexible dates. View its booking options to continue.' : 'Choose an experience and a day. We’ll check live departures for you.'}</p>{products.length < total && <button type="button" className="text-link" disabled={loading || checking} onClick={() => { setLoading(true); setError(''); setPage(value => value + 1); }}>{loading ? 'Loading…' : 'Load more experiences'}</button>}</div>
    {!loading && !error && !products.length && <p role="status">No online experiences are currently listed. <Link className="text-link" to="/contact">Ask our team to plan your experience.</Link></p>}
    {error && <div className="home-availability-notice" role="alert"><p>{error}</p>{!products.length && <button className="text-link" disabled={loading} onClick={() => { setLoading(true); setError(''); setRetry(value => value + 1); }}>Try again</button>}<Link className="text-link" to="/contact">Ask our team for help <i className="pi pi-arrow-up-right" aria-hidden="true" /></Link></div>}
    {result !== null && product && <div className="home-availability-results" aria-live="polite"><h3>{result.length ? `${product.title} · ${date}` : 'A different day, perhaps?'}</h3>{result.length ? <><p>{product.capacityType === 'ON_REQUEST' ? 'These departures require supplier confirmation.' : 'Available departures. Choose one to continue with guest details and pricing.'}</p><div className="home-availability-departures">{result.map(slot => <Link className="secondary-btn" key={slot.id} to={`/product/${product.id}?date=${date}&departure=${encodeURIComponent(slot.id)}#book`}><span>{product.bookingType === 'DATE_AND_TIME' ? slot.startTimeLabel || slot.startTime || 'View departure' : 'View departure'}<small>{slot.unlimitedAvailability ? 'Spaces available' : `${slot.availabilityCount} spaces available`}</small></span><i className="pi pi-arrow-right" aria-hidden="true" /></Link>)}</div><p className="bk-small">Availability is checked again when you book.</p></> : <p>No departures are available for this experience on your selected date. Try another date or <Link className="text-link" to="/contact">talk to our team</Link>.</p>}</div>}
  </section>;
}
