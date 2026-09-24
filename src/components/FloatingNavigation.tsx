import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';

const pages = [
  { label: 'Home', to: '/', icon: 'pi-home' },
  { label: 'Activities', to: '/safaris', icon: 'pi-compass' },
  { label: 'Booking', to: '/booking', icon: 'pi-calendar' },
  { label: 'About us', to: '/about', icon: 'pi-users' },
  { label: 'Contact', to: '/contact', icon: 'pi-envelope' },
  { label: 'FAQs', to: '/faq', icon: 'pi-question-circle' },
  { label: 'Terms & conditions', to: '/terms', icon: 'pi-file' },
];

export function FloatingNavigation() {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  return (
    <div className="floating-navigation" ref={container}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}>
      <button ref={trigger} className="navigation-fab" type="button"
        aria-expanded={open} aria-controls="floating-pages"
        aria-label={open ? 'Close page navigation' : 'Open page navigation'}
        onClick={() => setOpen(!open)}>
        <i className={`pi ${open ? 'pi-times' : 'pi-bars'}`} aria-hidden="true" />
        <span>{open ? 'Close' : 'Explore'}</span>
      </button>
      {open && (
        <nav id="floating-pages" className="floating-pages" aria-label="All pages">
          <span className="floating-pages-title">Explore Dove Journeys</span>
          {pages.map(page => (
            <NavLink key={page.to} to={page.to} end={page.to === '/'}
              onClick={() => setOpen(false)}>
              <i className={`pi ${page.icon}`} aria-hidden="true" />
              <span>{page.label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
