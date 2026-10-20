import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { bokun, type Product } from '../bokun/api';
import { BookingError } from '../bokun/Shared';
import { ProductCard } from '../bokun/ProductCard';

export function ActivitiesPage() {
  const [params, setParams] = useSearchParams();
  const query = params.toString();
  type Catalogue = { items: Product[]; totalHits: number; page: number; pageSize: number; facets: { destinations: string[]; categories: string[]; currencies: string[] } };
  const [state, setState] = useState<{ query: string; data?: Catalogue; error?: string }>();
  const [retry, setRetry] = useState(0);
  const data = state?.data;
  const loading = state?.query !== query;
  const error = state?.query === query ? state.error : '';
  const page = data?.page || Math.max(1, Number(params.get('page')) || 1);
  useEffect(() => {
    const controller = new AbortController();
    const request = new URLSearchParams(query);
    request.set('text', request.get('q') || ''); request.delete('q');
    bokun<Catalogue>(`/catalogue?${request}`, undefined, 'GET', controller.signal)
      .then(result => setState({ query, data: result }))
      .catch(reason => { if (!controller.signal.aborted) setState({ query, error: reason.message }); });
    return () => controller.abort();
  }, [query, retry]);
  function changePage(nextPage: number) {
    const next = new URLSearchParams(params); next.set('page', String(nextPage)); setParams(next);
  }
  return <div className="route-page bk-page"><section className="bk-catalog-hero"><img src="/images/elephants-golden.jpg" alt="Elephants in the African evening light" /><div><span className="eyebrow">DOVE JOURNEYS ACTIVITIES</span><h1>Find your next<br /><em>unforgettable moment.</em></h1><p>Explore our activities. Choose your day. Make it yours.</p></div></section>
    <section className="section-wrap"><div className="bk-toolbar"><div><span className="eyebrow">A LITTLE CLOSER TO THE WILD</span><h2>Extraordinary experiences.</h2></div><Link className="text-link" to="/cart"><i className="pi pi-shopping-bag" aria-hidden="true" /> Your selection</Link></div>
      <form className="bk-filters" key={`${query}:${Boolean(data)}`} onSubmit={event => {
        event.preventDefault();
        const next = new URLSearchParams();
        for (const [key, value] of new FormData(event.currentTarget)) if (String(value).trim()) next.set(key, String(value).trim());
        if (next.toString() === query) { setState(undefined); setRetry(value => value + 1); } else setParams(next);
      }}>
        <label className="bk-filter-search">Search activities<input name="q" defaultValue={params.get('q') || ''} placeholder="Activities, destinations and adventures" /></label>
        <label>Destination<select name="destination" defaultValue={params.get('destination') || ''}><option value="">All destinations</option>{[...new Set([...(data?.facets.destinations || []), params.get('destination')].filter((value): value is string => Boolean(value)))].map(value => <option key={value}>{value}</option>)}</select></label>
        <label>Category<select name="category" defaultValue={params.get('category') || ''}><option value="">All categories</option>{[...new Set([...(data?.facets.categories || []), params.get('category')].filter((value): value is string => Boolean(value)))].map(value => <option key={value}>{value}</option>)}</select></label>
        <label>Duration<select name="duration" defaultValue={params.get('duration') || ''}><option value="">Any duration</option><option value="short">Up to 3 hours</option><option value="half-day">Over 3 to 6 hours</option><option value="full-day">Over 6 to 24 hours</option><option value="multi-day">More than 1 day</option></select></label>
        <label>Price currency<select name="priceCurrency" defaultValue={params.get('priceCurrency') || data?.facets.currencies[0] || ''}><option value="">Choose currency</option>{[...new Set([...(data?.facets.currencies || []), params.get('priceCurrency')].filter((value): value is string => Boolean(value)))].map(value => <option key={value}>{value}</option>)}</select></label>
        <label>Minimum from-price<input type="number" name="minPrice" min="0" step="0.01" defaultValue={params.get('minPrice') || ''} placeholder="Any" /></label>
        <label>Maximum from-price<input type="number" name="maxPrice" min="0" step="0.01" defaultValue={params.get('maxPrice') || ''} placeholder="Any" /></label>
        <label>Sort by<select name="sort" defaultValue={params.get('sort') || ''}><option value="">Recommended order</option><option value="title">Activity name</option><option value="price-asc">From-price: low to high</option><option value="price-desc">From-price: high to low</option></select></label>
        <div className="bk-filter-actions"><button className="primary-btn" disabled={loading}>Apply filters <i className="pi pi-filter" aria-hidden="true" /></button><Link className="text-link" to="/activities">Clear filters</Link></div>
        <p className="bk-small bk-filter-note">From-prices are indicative for the default guest category. Choose a date and guests for your final total. Price filters and sorting use one currency and exclude activities without a published price in that currency.</p>
      </form>
      {loading ? <p className="bk-message" role="status">Finding your next adventure…</p> : error ? <BookingError message={error} retry={() => { setState(undefined); setRetry(retry + 1); }} /> : <><p className="bk-muted" aria-live="polite">{data?.totalHits || 0} matching activities</p><div className="bk-cards">{data?.items.map(product => <ProductCard key={product.id} product={product} />)}</div>{!data?.items.length && <div className="bk-message"><h3>No activities match these filters.</h3><p>Try a different destination, duration or price range.</p><Link className="secondary-btn" to="/activities">View all activities</Link></div>}<div className="bk-pagination"><button className="secondary-btn" disabled={page <= 1} onClick={() => changePage(page - 1)}>Previous</button><span>Page {page}</span><button className="secondary-btn" disabled={page * (data?.pageSize || 24) >= (data?.totalHits || 0)} onClick={() => changePage(page + 1)}>Next</button></div></>}
    </section></div>;
}
