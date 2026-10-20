import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supportEmail, whatsappUrl } from '../config';
const storageKey = 'dove-journeys-terms-v1';
export function ClientAccess() {
  const [choice, setChoice] = useState<string | null>(() => {
    try { const saved = localStorage.getItem(storageKey); return saved === 'accepted' || saved === 'declined' ? saved : null; } catch { return null; }
  });
  const banner = useRef<HTMLElement>(null);
  const [termsExpanded, setTermsExpanded] = useState(false);
  useEffect(() => {
    const element = banner.current;
    if (!element) { document.documentElement.style.setProperty('--terms-height', '0px'); return; }
    const observer = new ResizeObserver(() => document.documentElement.style.setProperty('--terms-height', `${element.getBoundingClientRect().height + 12}px`));
    observer.observe(element);
    return () => { observer.disconnect(); document.documentElement.style.removeProperty('--terms-height'); };
  }, [choice]);
  function choose(value: 'accepted' | 'declined') {
    try { localStorage.setItem(storageKey, value); } catch { /* Keep the choice for this visit if storage is unavailable. */ }
    setChoice(value);
  }
  return <>
    <div className="floating-contact" aria-label="Contact Dove Journeys">
      {whatsappUrl && <a className="whatsapp-contact" href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Chat with Dove Journeys on WhatsApp" title="Chat on WhatsApp"><i className="pi pi-whatsapp" aria-hidden="true" /></a>}
      {supportEmail && <Link className="email-contact" to="/contact#request-form" aria-label="Email Dove Journeys: booking, enquiry or query" title="Email a booking, enquiry or query"><i className="pi pi-envelope" aria-hidden="true" /></Link>}
    </div>
    {!choice && <section ref={banner} className="terms-banner" aria-label="Terms and conditions preference"><div className="terms-banner-copy"><strong>Welcome to Dove Journeys</strong><p>Please read the full terms and conditions before choosing. Declining still allows you to browse and ask questions; booking requests require a separate acknowledgement.</p><button className="terms-expand" type="button" aria-expanded={termsExpanded} aria-controls="banner-full-terms" onClick={() => setTermsExpanded((expanded) => !expanded)}>{termsExpanded ? 'Hide full terms' : 'Read full terms and conditions'}</button>{termsExpanded && <div id="banner-full-terms" className="banner-full-terms"><h2>Requests and confirmation</h2><p>Submitting or emailing a request does not create a confirmed booking. The Dove Journeys team must confirm the activity, operator, dates, availability and price with you before you commit. This website does not collect payment.</p><h2>Activity prices and inclusions</h2><p>“Quote required” means that a rate has not yet been published. A priced subtotal includes only activities with published rates and is not a complete total when other selected activities are unpriced. Your written quote will explain currency, guest rates, park fees, transfers, meals and other inclusions or exclusions.</p><h2>Changes, cancellations and refunds</h2><p>Cancellation, refund, payment and amendment policies have not yet been published on this website. Ask the team for the applicable written policies for your chosen activities and review them before confirming or paying. Do not assume that a request reserves a place or that a cancellation will be free.</p><h2>Activity suitability and conditions</h2><p>Activities depend on operator availability, weather, water levels and safety decisions. Tell the team about children’s ages and relevant accessibility or participation needs so they can check suitability. Cross-border arrangements and required travel documents must be confirmed for your itinerary.</p><h2>Email and WhatsApp</h2><p>The email form prepares a message in your own email application. You must press Send there; preparing a message alone does not deliver it. WhatsApp opens an external service. Share only information needed for your request and avoid sending payment card details or identity documents in an initial enquiry.</p><h2>Your choice</h2><p>You may accept or decline this first-visit notice. Your choice is stored in this browser and can be changed using “Review terms preference” in the footer. Declining does not prevent browsing or general enquiries. Booking requests ask you to acknowledge these request conditions separately; the final booking policies will accompany your quote.</p><p><Link to="/terms">Open the full terms page</Link></p></div>}</div><div className="terms-actions"><button className="primary-btn" onClick={() => choose('accepted')}>I agree to the full terms and conditions</button><button className="secondary-btn" onClick={() => choose('declined')}>Decline</button></div></section>}
    <div className="terms-preference"><button onClick={() => setChoice(null)}>Review terms preference</button><span className="visually-hidden" role="status">{choice === 'accepted' ? 'Terms accepted.' : choice === 'declined' ? 'Terms declined. You can continue browsing and asking questions.' : ''}</span></div>
  </>;
}
