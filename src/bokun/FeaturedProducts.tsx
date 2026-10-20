import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bokun, type Product } from './api';
import { ProductCard } from './ProductCard';

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    bokun<{ items: Product[] }>('/products?page=1', undefined, 'GET', controller.signal)
      .then(data => setProducts(data.items.slice(0, 3)))
      .catch(reason => { if (!controller.signal.aborted) setError(reason.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [retry]);

  return <section className="section-wrap bk-featured-products" aria-labelledby="featured-activities-heading">
    <div className="bk-toolbar">
      <div><span className="eyebrow">A FEW MOMENTS TO LOOK FORWARD TO</span><h2 id="featured-activities-heading">Find your extraordinary.</h2></div>
      <Link className="text-link" to="/activities">View all activities <i className="pi pi-arrow-up-right" aria-hidden="true" /></Link>
    </div>
    <p className="bk-featured-intro">A taste of the adventures waiting for you. Explore an activity to see the details and plan your day.</p>
    {loading ? <p role="status">Finding experiences for your next journey…</p> : error ? <div className="bk-message" role="status"><p>{error}</p><div className="bk-actions"><button className="secondary-btn" onClick={() => { setLoading(true); setError(''); setRetry(value => value + 1); }}>Try again</button><Link className="primary-btn" to="/activities">Browse activities</Link></div></div> : products.length ? <div className="bk-cards">{products.map(product => <ProductCard key={product.id} product={product} />)}</div> : <p role="status">Our online activities are being prepared. <Link className="text-link" to="/contact">Let us help plan your day.</Link></p>}
  </section>;
}
