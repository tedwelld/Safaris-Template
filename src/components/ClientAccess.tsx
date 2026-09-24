import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supportEmail, whatsappUrl } from '../config';
const storageKey = 'dove-journeys-terms-v1';
export function ClientAccess() {
  const [choice, setChoice] = useState<string | null>(() => {
    try { const saved = localStorage.getItem(storageKey); return saved === 'accepted' || saved === 'declined' ? saved : null; } catch { return null; }
  });
  const banner = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = banner.current;
    if (!element) { document.documentElement.style.setProperty('--terms-height', '0px'); return; }
    const observer = new ResizeObserver(() => document.documentElement.style.setProperty('--terms-height', `${element.getBoundingClientRect().height + 12}px`));
    observer.observe(element);
    return () => { observer.disconnect(); document.documentElement.style.removeProperty('--terms-height'); };
  }, [choice]);
  function choose(value: string) {
    try { localStorage.setItem(storageKey, value); } catch { /* Keep the choice for this visit if storage is unavailable. */ }
    setChoice(value);
  }
  return <>
    <div className="floating-contact" aria-label="Contact Dove Journeys">
      {whatsappUrl && <a className="whatsapp-contact" href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Chat with Dove Journeys on WhatsApp" title="Chat on WhatsApp"><i className="pi pi-whatsapp" aria-hidden="true" /></a>}
      {supportEmail && <Link className="email-contact" to="/contact#request-form" aria-label="Email Dove Journeys: booking, enquiry or query" title="Email a booking, enquiry or query"><i className="pi pi-envelope" aria-hidden="true" /></Link>}
    </div>
    {!choice && <section ref={banner} className="terms-banner" aria-label="Terms and conditions preference"><div><strong>Welcome to Dove Journeys</strong><p>Please read our <Link to="/terms">terms and conditions</Link>. You may accept or decline. Declining still allows you to browse and ask questions; booking requests require a separate acknowledgement.</p></div><div className="terms-actions"><button className="primary-btn" onClick={() => choose('accepted')}>Accept</button><button className="secondary-btn" onClick={() => choose('declined')}>Decline</button></div></section>}
    <div className="terms-preference"><button onClick={() => setChoice(null)}>Review terms preference</button><span className="visually-hidden" role="status">{choice === 'accepted' ? 'Terms accepted.' : choice === 'declined' ? 'Terms declined. You can continue browsing and asking questions.' : ''}</span></div>
  </>;
}
