import { useEffect, useState } from 'react'
import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import { AboutPage } from './pages/AboutPage'
import { BookingPage } from './pages/BookingPage'
import { ContactPage } from './pages/ContactPage'
import { FaqPage } from './pages/FaqPage'
import { HomePage } from './pages/HomePage'
import { SafarisPage } from './pages/SafarisPage'

const supportEmail = import.meta.env.VITE_EMAIL_SUPPORT || 'reservations@wildtracktravel.com'
const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+15551234567'
const whatsappMessage = import.meta.env.VITE_WHATSAPP_MESSAGE || 'Hi%20I%20want%20to%20plan%20a%20safari'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Safaris', to: '/safaris' },
  { label: 'Booking', to: '/booking' },
  { label: 'Contact', to: '/contact' },
  { label: 'FAQ', to: '/faq' },
]

const footerNavItems = navItems

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const revealElements = document.querySelectorAll<HTMLElement>('[data-reveal]')

    if (!revealElements.length) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )

    revealElements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [location.pathname])

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">W</div>
          <div>
            <p className="brand-name">Wildtrack Safaris</p>
            <p className="brand-tag">Luxury safari template</p>
          </div>
        </div>

        <nav className="nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="menu-toggle"
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <i className="pi pi-bars" aria-hidden="true" />
        </button>

        <NavLink className="primary-btn desktop-cta" to="/booking">
          Plan a safari
        </NavLink>
      </header>

      <div className={`mobile-menu-backdrop ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />

      <aside className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`} aria-label="Mobile navigation panel">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
            end={item.to === '/'}
            onClick={() => setMobileMenuOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}

        <NavLink className="primary-btn mobile-cta" to="/booking" onClick={() => setMobileMenuOpen(false)}>
          Plan a safari
        </NavLink>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/safaris" element={<SafarisPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
        </Routes>
      </main>

      <nav className="mobile-bottom-nav" aria-label="Mobile bottom navigation">
        {footerNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `mobile-bottom-link${isActive ? ' active' : ''}`}
            end={item.to === '/'}
          >
            <i
              className={`pi ${
                item.to === '/'
                  ? 'pi-home'
                  : item.to === '/about'
                    ? 'pi-user'
                    : item.to === '/safaris'
                      ? 'pi-map'
                      : item.to === '/booking'
                        ? 'pi-calendar'
                        : item.to === '/contact'
                          ? 'pi-envelope'
                          : 'pi-question-circle'
              }`}
              aria-hidden="true"
            />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="floating-actions" aria-label="Quick contact actions">
        <a
          className="floating-action whatsapp"
          href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${whatsappMessage}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat on WhatsApp"
          title="Chat on WhatsApp"
        >
          <i className="pi pi-whatsapp" aria-hidden="true" />
        </a>
        <a
          className="floating-action email"
          href={`mailto:${supportEmail}`}
          aria-label="Email us"
          title="Email us"
        >
          <i className="pi pi-envelope" aria-hidden="true" />
        </a>
      </div>

      <footer className="footer">
        <nav className="footer-links" aria-label="Footer pages">
          {footerNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} className="footer-link" end={item.to === '/'}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <p>Wildtrack Safaris Template • Built for premium safari websites</p>
      </footer>
    </div>
  )
}

export default App
