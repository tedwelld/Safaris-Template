import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { ClientAccess } from "./components/ClientAccess";
import { TermsPage } from "./pages/TermsPage";
import { AboutPage } from "./pages/AboutPage";
import { BookingPage } from "./pages/BookingPage";
import { ContactPage } from "./pages/ContactPage";
import { FaqPage } from "./pages/FaqPage";
import { HomePage } from "./pages/HomePage";
import { SafarisPage } from "./pages/SafarisPage";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Activities", to: "/safaris" },
  { label: "The Dove Journeys way", to: "/about" },
  { label: "Safari essentials", to: "/faq" },
  { label: "Get in touch", to: "/contact" },
];
import { supportEmail, poweredByWhatsappUrl } from "./config";


function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Dove Journeys home">
      <img className="brand-logo" src="/images/dove-journeys-transparent.png" alt="Dove Journeys — Your journey changes lives" width="1862" height="845" />
    </Link>
  );
}
function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const fixedHeader = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const header = fixedHeader.current;
    if (!header) return;
    const updateHeight = () => document.documentElement.style.setProperty('--header-height', `${header.getBoundingClientRect().height}px`);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--header-height');
    };
  }, []);
  useEffect(() => {
    if (location.hash) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);
  return (
    <div className="page-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="fixed-header" ref={fixedHeader}>
      <div className="utility-bar">
        <span>EXTRAORDINARY PLACES. PERSONAL JOURNEYS.</span>
        <Link to="/contact">
          Talk to a safari specialist <i className="pi pi-arrow-up-right" />
        </Link>
      </div>
      <header className="topbar">
        <Brand />
        <nav className="nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} className="nav-link">
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Link className="primary-btn desktop-cta" to="/booking">
          Plan your safari <span>↗</span>
        </Link>
        <button
          className="menu-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <i className={`pi ${menuOpen ? "pi-times" : "pi-bars"}`} />
        </button>
      </header>
      {menuOpen && (
        <nav
          id="mobile-navigation"
          className="mobile-menu"
          aria-label="Mobile navigation"
        >
          {[...navItems, { label: "Plan your safari", to: "/booking" }].map(
            (item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
                <span>↗</span>
              </NavLink>
            ),
          )}
        </nav>
      )}
      </div>
      <main id="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/safaris" element={<SafarisPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route
            path="*"
            element={
              <section className="page-intro">
                <span className="eyebrow">A little off the beaten track</span>
                <h1>Let’s find your way back.</h1>
                <Link className="primary-btn" to="/">
                  Return home ↗
                </Link>
              </section>
            }
          />
        </Routes>
      </main>
      <section className="journey-cta">
        <img
          className="cinematic-backdrop"
          src="/images/elephants-golden.jpg"
          alt=""
          loading="lazy"
          decoding="async"
        />
        <div>
          <span className="eyebrow">YOUR NEXT GREAT STORY</span>
          <h2>
            It begins with
            <br />a conversation.
          </h2>
          <p>
            The golden light. The open horizon. Your own unforgettable chapter.
          </p>
        </div>
        <Link className="light-btn" to="/contact">
          Let’s dream it up <span>↗</span>
        </Link>
      </section>
      <footer className="footer">
        <div className="footer-top">
          <div>
            <Brand />
            <p>
              A little closer to the wild.
              <br />A world away from the everyday.
            </p>
          </div>
          <div>
            <h3>Explore</h3>
            <Link to="/safaris">Victoria Falls & Zambezi activities</Link>
            <Link to="/about">The Dove Journeys way</Link>
            <Link to="/faq">Safari essentials</Link>
          </div>
          <div>
            <h3>Let’s connect</h3>
            {supportEmail && <Link to="/contact#request-form">{supportEmail}</Link>}
            <Link to="/terms">Terms and conditions</Link>
            <Link to="/contact">Speak to a specialist ↗</Link>
            <Link to="/booking">Plan your journey ↗</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Dove Journeys. All rights reserved.
          </span>
          {poweredByWhatsappUrl && (
            <a className="powered-by" href={poweredByWhatsappUrl} target="_blank" rel="noreferrer">
              Powered by Axentra Tech Solutions
            </a>
          )}
        </div>
      </footer>
      <ClientAccess />
    </div>
  );
}
export default App;
