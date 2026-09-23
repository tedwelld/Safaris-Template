import { Link } from 'react-router-dom'

const features = [
  {
    title: 'Bokun-ready bookings',
    text: 'Connect your safari calendar, live availability, and guest capture to your online sales flow.',
  },
  {
    title: 'Email automations',
    text: 'Send confirmations, reminders, and post-trip follow-ups without manual admin work.',
  },
  {
    title: 'WhatsApp selling',
    text: 'Guide visitors from initial inquiry to itinerary confirmation with instant messaging.',
  },
  {
    title: 'PayPal checkout',
    text: 'Collect deposits or full payments with secure checkout journeys built for travel brands.',
  },
]

const packages = [
  {
    title: 'Savannah Signature',
    length: '5 days',
    price: 'From $1,980',
    summary: 'Private game drives, luxury bush camps, and unforgettable sunset dinners.',
  },
  {
    title: 'Great Migration',
    length: '7 days',
    price: 'From $2,640',
    summary: 'Track the herds across iconic plains with expert local guides and conservation stops.',
  },
  {
    title: 'Family Adventure',
    length: '6 days',
    price: 'From $2,150',
    summary: 'A smooth, child-friendly safari journey with lodge comfort and cultural experiences.',
  },
]

const stats = [
  { value: '4.9/5', label: 'traveler rating' },
  { value: '120+', label: 'custom itineraries' },
  { value: '24/7', label: 'guest support' },
]

const storyNotes = [
  'Private guides who know the roads, waterholes, and seasonal rhythms of the land.',
  'Flexible planning that balances iconic highlights with restful, high-touch lodge time.',
  'Seamless handovers from enquiry to arrival with clear communication at every step.',
]

export function HomePage() {
  return (
    <div className="route-page home-page">
      <section className="hero-grid">
        <div className="hero-copy" data-reveal>
          <span className="eyebrow">Luxury safari website template</span>
          <h1>Experience the wild without the friction.</h1>
          <p>
            Wildtrack Safaris helps premium travel brands turn inspiration into bookings with a polished,
            conversion-focused website built for Bokun, email flows, WhatsApp messaging, and PayPal.
          </p>

          <div className="cta-row">
            <Link className="primary-btn" to="/safaris">
              Explore safaris
            </Link>
            <a
              className="secondary-btn"
              href="https://wa.me/15551234567?text=Hi%20I%20want%20to%20plan%20a%20safari"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp us
            </a>
          </div>

          <div className="stats-grid">
            {stats.map((item) => (
              <div className="stat-card" key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-panel" data-reveal>
          <div className="panel-header">
            <span className="dot green" />
            <span className="dot yellow" />
            <span className="dot red" />
          </div>

          <div className="trip-card">
            <p className="trip-label">Featured itinerary</p>
            <h2>Kenya & Tanzania Explorer</h2>
            <ul>
              <li>Luxury lodge stays</li>
              <li>Private game drives</li>
              <li>Hot air balloon experience</li>
            </ul>
            <div className="trip-footer">
              <span>7 nights</span>
              <strong>$3,240</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        {features.map((feature, index) => (
          <article className="feature-card" key={feature.title} data-reveal style={{ transitionDelay: `${index * 80}ms` }}>
            <span className="feature-icon">✦</span>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>

      <section className="story-section" data-reveal>
        <div className="story-copy">
          <span className="eyebrow">The journey</span>
          <h2>Not a brochure itinerary. A safari shaped around you.</h2>
          <p>
            Every experience is planned to feel personal and immersive, with room for wildlife moments,
            quiet lodge time, and the kind of local expertise that turns a trip into a story worth retelling.
          </p>

          <ul className="story-notes">
            {storyNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>

        <div className="story-photo-stack" aria-label="Safari lifestyle imagery collage">
          <div className="story-photo photo-one" />
          <div className="story-photo photo-two" />
          <div className="story-photo photo-three" />
        </div>
      </section>

      <section className="card-section">
        <div className="section-header">
          <span className="eyebrow">Top picks</span>
          <h2>Curated experiences for every traveler.</h2>
        </div>

        <div className="package-grid">
          {packages.map((item, index) => (
            <article className="package-card" key={item.title} data-reveal style={{ transitionDelay: `${index * 80}ms` }}>
              <div className="package-topline">
                <span>{item.length}</span>
                <span>{item.price}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <Link to="/booking">View itinerary</Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
