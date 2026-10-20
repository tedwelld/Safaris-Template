import { Link } from 'react-router-dom';
import { duration, money, plain, type Product } from './api';

export function ProductCard({ product }: { product: Product }) {
  return <Link className="bk-card" to={`/product/${product.id}`}>
    <div className="bk-card-photo">
      <img src={product.keyPhoto?.originalUrl || product.photos?.[0]?.originalUrl || '/images/safari.jpg'} alt={product.title} loading="lazy" />
      <span>Explore activity <i className="pi pi-arrow-up-right" aria-hidden="true" /></span>
    </div>
    <div className="bk-card-body">
      <span className="eyebrow">{duration(product) || 'Your next adventure'}</span>
      <h3>{product.title}</h3>
      <p>{plain(product.excerpt || product.description).slice(0, 180)}</p>
      {product.priceFrom && <p className="bk-card-price">From <strong>{money(product.priceFrom.amount, product.priceFrom.currency)}</strong> <small>{product.priceFrom.currency} · indicative</small></p>}
      <span className="text-link">View details & availability <i className="pi pi-arrow-right" aria-hidden="true" /></span>
    </div>
  </Link>;
}
