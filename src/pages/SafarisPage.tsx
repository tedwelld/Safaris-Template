import { Link, useSearchParams } from 'react-router-dom';
import { activities, money } from '../data/activities';
const regions = ['All activities', 'Victoria Falls, Zimbabwe', 'Livingstone & Zambezi, Zambia'];
export function SafarisPage() {
  const [params, setParams] = useSearchParams();
  const region = regions.includes(params.get('region') || '') ? params.get('region')! : regions[0];
  const filtered = activities.filter(item => region === regions[0] || item.region === region);
  return <div className="route-page">
    <section className="page-intro"><span className="eyebrow">TWO COUNTRIES. ONE EXTRAORDINARY RIVER.</span><h1>Victoria Falls & <em>the Zambezi.</em></h1><p>Explore activities in Victoria Falls, Zimbabwe, and around Livingstone on Zambia’s Zambezi side. Choose your favourites and ask us to plan the details.</p></section>
    <section className="section-wrap">
      <div className="filter-bar" aria-label="Filter activities by location">{regions.map(item => <button key={item} aria-pressed={region === item} className={region === item ? 'selected' : ''} onClick={() => setParams(item === regions[0] ? {} : { region: item })}>{item}</button>)}</div>
      <div className="safari-grid">{filtered.map(item => <article className="safari-card" key={item.id}>
        <div className="safari-card-body"><i className={`pi ${item.icon} activity-icon`} aria-hidden="true" /><span className="eyebrow">{item.region} · {item.duration}</span><h2>{item.title}</h2><p>{item.description}</p><p>{item.details}</p><p className="activity-note">{item.note}</p>
          <div className="safari-footer"><span><strong>{item.priceUsd === null ? 'Quote required' : money(item.priceUsd)}</strong><small>{item.priceUsd === null ? 'Ask for a personalised USD quote' : 'per person · USD'}</small></span><Link className="text-link" to={`/booking?trip=${item.id}`}>Select activity ↗</Link></div>
        </div></article>)}</div>
      <p className="collection-note">All activities are on request. We confirm availability, suitability, inclusions and the final total before you commit. Tell us the ages of any children so we can check eligibility and rates.</p>
    </section></div>;
}
