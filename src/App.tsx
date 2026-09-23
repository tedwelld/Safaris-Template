import { useEffect, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { AboutPage } from "./pages/AboutPage";
import { BookingPage } from "./pages/BookingPage";
import { ContactPage } from "./pages/ContactPage";
import { FaqPage } from "./pages/FaqPage";
import { HomePage } from "./pages/HomePage";
import { SafarisPage } from "./pages/SafarisPage";

const navItems = [
  { label: "Our safaris", to: "/safaris" },
  { label: "The Wildtrack way", to: "/about" },
  { label: "Safari essentials", to: "/faq" },
  { label: "Get in touch", to: "/contact" },
];
const supportEmail =
  import.meta.env.VITE_EMAIL_SUPPORT || "reservations@wildtracktravel.com";

function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Wildtrack Safaris home">
      <span className="brand-symbol">✳</span>
      <span>
        WILDTRACK<small>S A F A R I S</small>
      </span>
    </Link>
  );
}
function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
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
            <NavLink key={item.to} to={item.to} className="nav-link">
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
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
                <span>↗</span>
              </NavLink>
            ),
          )}
        </nav>
      )}
      <main id="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/safaris" element={<SafarisPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
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
        <div>
          <span className="eyebrow">YOUR NEXT GREAT STORY</span>
          <h2>It begins with a conversation.</h2>
        </div>
        <Link className="primary-btn" to="/contact">
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
            <Link to="/safaris">Our safari collection</Link>
            <Link to="/about">The Wildtrack way</Link>
            <Link to="/faq">Safari essentials</Link>
          </div>
          <div>
            <h3>Let’s connect</h3>
            <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
            <Link to="/contact">Speak to a specialist ↗</Link>
            <Link to="/booking">Plan your journey ↗</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Wildtrack Safaris. All rights reserved.
          </span>
          <span>Made for the extraordinary.</span>
        </div>
      </footer>
    </div>
  );
}
export default App;
