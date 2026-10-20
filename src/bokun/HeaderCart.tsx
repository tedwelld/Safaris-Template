import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { bokun, type Cart } from './api';

export function HeaderCart() {
  const { pathname } = useLocation();
  const [version, setVersion] = useState(0);
  const [count, setCount] = useState<number | null>(0);
  useEffect(() => {
    const refresh = () => setVersion(value => value + 1);
    const storage = (event: StorageEvent) => { if (event.key === 'dove-bokun-cart' || event.key === null) refresh(); };
    window.addEventListener('bokun-cart-updated', refresh);
    window.addEventListener('storage', storage);
    return () => { window.removeEventListener('bokun-cart-updated', refresh); window.removeEventListener('storage', storage); };
  }, []);
  useEffect(() => {
    const id = localStorage.getItem('dove-bokun-cart');
    if (!id || !/^[a-f0-9-]{36}$/i.test(id)) { setCount(0); return; }
    const controller = new AbortController();
    bokun<Cart>(`/cart/${id}`, undefined, 'GET', controller.signal)
      .then(cart => setCount(cart.activityBookings?.length || 0))
      .catch(() => { if (!controller.signal.aborted) setCount(null); });
    return () => controller.abort();
  }, [pathname, version]);
  return <Link className="header-cart" to="/cart" aria-label={count === null ? 'View your selected activities' : `View your selection: ${count} ${count === 1 ? 'activity' : 'activities'}`}>
    <i className="pi pi-shopping-bag" aria-hidden="true" />
    {count !== null && <span className="header-cart-count" aria-hidden="true">{count}</span>}
  </Link>;
}
