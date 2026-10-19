const readable = value => String(value || '').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
const validPrice = price => price && typeof price.amount === 'number' && Number.isFinite(price.amount) && price.amount >= 0 && /^[A-Z]{3}$/.test(price.currency || '');

export function catalogueProduct(summary, details = {}) {
  const product = { ...summary, ...details, id: Number(summary.id) };
  const duration = typeof product.duration === 'object' && product.duration ? product.duration : {};
  const durationMinutes = (duration.weeks ?? product.durationWeeks ?? 0) * 10080 + (duration.days ?? product.durationDays ?? 0) * 1440 + (duration.hours ?? product.durationHours ?? 0) * 60 + (duration.minutes ?? product.durationMinutes ?? 0);
  const destinations = [...new Set([product.location?.city, product.locationCode?.name, ...(product.startPoints || []).map(point => point.location?.city)].filter(Boolean))];
  const categories = [...new Set([...(product.categories || []).map(category => category.title || category.name), ...(product.activityCategories || []).map(readable)].filter(Boolean))];
  return { ...product, destinations, catalogueCategories: categories, durationTotalMinutes: durationMinutes > 0 ? durationMinutes : null, priceFrom: validPrice(product.nextDefaultPriceMoney) ? product.nextDefaultPriceMoney : null };
}

export function filterCatalogue(products, query) {
  const text = String(query.text || '').trim().toLowerCase();
  const destination = String(query.destination || '');
  const category = String(query.category || '');
  const duration = String(query.duration || '');
  const priceCurrency = String(query.priceCurrency || '');
  const number = value => value !== undefined && value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;
  const min = number(query.minPrice), max = number(query.maxPrice);
  if (min !== null && max !== null && min > max) throw Object.assign(new Error('Minimum price must be no greater than maximum price.'), { status: 400 });
  if ((min !== null || max !== null || ['price-asc', 'price-desc'].includes(query.sort)) && !/^[A-Z]{3}$/.test(priceCurrency)) throw Object.assign(new Error('Choose a currency to compare prices.'), { status: 400 });
  const pricesActive = min !== null || max !== null;
  const result = products.filter(product => {
    const searchable = [product.title, product.excerpt, ...(product.destinations || []), ...(product.catalogueCategories || [])].join(' ').toLowerCase();
    if (text && !searchable.includes(text)) return false;
    if (destination && !product.destinations?.includes(destination)) return false;
    if (category && !product.catalogueCategories?.includes(category)) return false;
    const minutes = product.durationTotalMinutes;
    if (duration === 'short' && !(minutes > 0 && minutes <= 180)) return false;
    if (duration === 'half-day' && !(minutes > 180 && minutes <= 360)) return false;
    if (duration === 'full-day' && !(minutes > 360 && minutes <= 1440)) return false;
    if (duration === 'multi-day' && !(minutes > 1440)) return false;
    if ((pricesActive || ['price-asc', 'price-desc'].includes(query.sort)) && product.priceFrom?.currency !== priceCurrency) return false;
    if (pricesActive && (!product.priceFrom || (min !== null && product.priceFrom.amount < min) || (max !== null && product.priceFrom.amount > max))) return false;
    return true;
  });
  if (query.sort === 'title') result.sort((a, b) => a.title.localeCompare(b.title));
  if (query.sort === 'price-asc') result.sort((a, b) => a.priceFrom.amount - b.priceFrom.amount);
  if (query.sort === 'price-desc') result.sort((a, b) => b.priceFrom.amount - a.priceFrom.amount);
  const pageSize = 24, page = Math.max(1, Math.min(1000, Math.floor(Number(query.page) || 1)));
  const facets = key => [...new Set(products.flatMap(product => product[key] || []))].sort();
  return { items: result.slice((page - 1) * pageSize, page * pageSize), totalHits: result.length, page, pageSize,
    facets: { destinations: facets('destinations'), categories: facets('catalogueCategories'), currencies: [...new Set(products.flatMap(product => product.priceFrom ? [product.priceFrom.currency] : []))].sort() },
    pricesAreIndicative: true,
  };
}
