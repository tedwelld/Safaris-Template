import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supportEmail } from '../config';
import { activities, calculateTotal, money } from '../data/activities';

export function EnquiryForm({ interest = '', planning = false }: { interest?: string; planning?: boolean }) {
  const initial = activities.find(item => item.id === interest || item.title === interest);
  const [selected, setSelected] = useState<string[]>(initial ? [initial.id] : []);
  const [kind, setKind] = useState(planning ? 'Booking' : 'Enquiry');
  const [pax, setPax] = useState(2);
  const [start, setStart] = useState('');
  const [emailDraft, setEmailDraft] = useState('');
  const [prepared, setPrepared] = useState(false);
  const chosen = activities.filter(item => selected.includes(item.id));
  const total = calculateTotal(chosen, pax);
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (kind === 'Booking' && chosen.length === 0) return;
    const data = new FormData(event.currentTarget);
    const lines = chosen.map(item => `${item.title} (${item.region}): ${item.priceUsd === null ? 'Quote required' : `${money(item.priceUsd)} x ${pax} = ${money(item.priceUsd * pax)}`}`);
    const body = [`Request: ${kind}`, `Name: ${data.get('name')}`, `Reply email: ${data.get('email')}`, `Dates: ${start || 'Flexible'} to ${data.get('endDate') || start || 'Flexible'}`, `Number of pax: ${pax}`, '', 'Selected activities:', ...lines, chosen.length ? `Total (USD): ${total.complete ? money(total.subtotal) : 'Quote required — unpriced activities are not included in the subtotal'}` : 'No activity selected — general request', `Priced subtotal (USD): ${money(total.subtotal)}`, 'Fees, transfers and child rates to be confirmed.', '', `Message: ${data.get('message')}`, `Booking request terms acknowledged: ${data.get('terms') ? 'Yes' : 'Not applicable'}`].join('\n');
    setEmailDraft(`mailto:${supportEmail}?subject=${encodeURIComponent(`Dove Journeys ${kind} — ${data.get('name')}`)}&body=${encodeURIComponent(body)}`);
    setPrepared(true);
  }
  return <form className="contact-form" onSubmit={submit} onChange={() => setPrepared(false)}>
    <h2>Let’s plan your experience</h2>
    <label>How can we help?<select value={kind} onChange={event => setKind(event.target.value)}><option>Booking</option><option>Enquiry</option><option>Query</option></select></label>
    <div className="form-row"><label>Your name<input name="name" autoComplete="name" required maxLength={100} /></label><label>Your email<input name="email" type="email" autoComplete="email" required maxLength={200} /></label></div>
    <fieldset className="activity-picker"><legend>Choose activities {kind === 'Booking' ? '(select at least one)' : '(optional)'}</legend>
      {activities.map(item => <label className="activity-option" key={item.id}><input type="checkbox" checked={selected.includes(item.id)} onChange={event => setSelected(event.target.checked ? [...selected, item.id] : selected.filter(id => id !== item.id))} /><span>{item.title}<small>{item.region} · {item.priceUsd === null ? 'Quote required' : `${money(item.priceUsd)} / person`}</small></span></label>)}
    </fieldset>
    <div className="form-row"><label>Preferred date<input name="startDate" type="date" min={minDate} value={start} onChange={event => setStart(event.target.value)} required={kind === 'Booking'} /></label><label>End date (optional)<input name="endDate" type="date" min={start || minDate} /></label></div>
    <label>Number of pax (guests)<input name="pax" type="number" min="1" max="100" step="1" required value={Number.isNaN(pax) ? '' : pax} onChange={event => setPax(event.target.valueAsNumber)} /></label>
    <section className="request-total" aria-live="polite" aria-label="Activity cost summary"><h3>Your activity summary</h3>
      {chosen.length ? <><ul>{chosen.map(item => <li key={item.id}>{item.title} <strong>{item.priceUsd === null ? 'Quote required' : money(item.priceUsd * (Number.isFinite(pax) ? pax : 0))}</strong></li>)}</ul><p>Priced subtotal: <strong>{money(total.subtotal)} USD</strong></p><p>Total: <strong>{total.complete ? `${money(total.subtotal)} USD` : 'Quote required'}</strong></p>{total.unpriced > 0 && <p>{total.unpriced} selected {total.unpriced === 1 ? 'activity needs' : 'activities need'} a quote. The subtotal is not the final amount payable.</p>}</> : <p>Select activities to see your summary.</p>}
      <small>Rates are per person. Child rates, park fees, transfers and other inclusions will be confirmed in your personalised quote. No payment is collected here.</small>
    </section>
    <label>{kind === 'Query' ? 'Your question or booking reference' : 'Tell us more'}<textarea name="message" rows={4} required maxLength={1200} placeholder="Children’s ages, preferred activity times, accessibility needs, or your question" /></label>
    {kind === 'Booking' && <label className="terms-check"><input type="checkbox" name="terms" required /><span>I have read the <Link to="/terms">terms and conditions</Link> and understand this is a booking request, subject to a confirmed quote.</span></label>}
    <button className="primary-btn" disabled={!supportEmail || (kind === 'Booking' && !chosen.length)} type="submit">Prepare email <i className="pi pi-envelope" aria-hidden="true" /></button>
    {kind === 'Booking' && !chosen.length && <p>Select at least one activity to prepare a booking request.</p>}
    {!supportEmail && <p role="status">Email requests are temporarily unavailable. Please use WhatsApp.</p>}
    {prepared && <div className="success-message" role="status"><p>Your request is ready. Open your email app, review it and press Send to contact our team. Nothing has been sent yet.</p><a className="text-link" href={emailDraft}>Open email app <i className="pi pi-envelope" aria-hidden="true" /></a></div>}
  </form>;
}
