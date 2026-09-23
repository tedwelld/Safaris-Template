const highlights = [
  'Boutique safari design tailored to premium travel brands',
  'Local expertise and conservation-first travel planning',
  'Seamless end-to-end guest communication from enquiry to arrival',
]

export function AboutPage() {
  return (
    <div className="route-page">
      <section className="card-section narrow">
        <div className="section-header" data-reveal>
          <span className="eyebrow">About us</span>
          <h2>Designed for unforgettable journeys across Africa.</h2>
        </div>

        <div className="two-column-layout">
          <div className="info-card" data-reveal>
            <p>
              Wildtrack Safaris is built for boutique operators who want to deliver elevated experiences,
              effortless booking journeys, and highly personalized guest service from the first click to the
              final game drive.
            </p>
            <p>
              Our template is shaped around the realities of safari travel: flexibility, trust, premium
              presentation, and clear communication. It gives your brand a polished online presence while
              keeping the operational flow simple for travel teams.
            </p>
          </div>

          <div className="info-card accent-card" data-reveal>
            <h3>Why this works</h3>
            <ul>
              {highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="card-section">
        <div className="section-header" data-reveal>
          <span className="eyebrow">Our approach</span>
          <h2>Thoughtful planning, warm hospitality, and expert guidance.</h2>
        </div>

        <div className="three-column-layout">
          <article className="mini-card" data-reveal>
            <h3>01. Research</h3>
            <p>We match each guest to the right route, pace, and experiences based on travel goals.</p>
          </article>
          <article className="mini-card" data-reveal>
            <h3>02. Design</h3>
            <p>Every itinerary is crafted to feel immersive, clear, and tailored to premium expectations.</p>
          </article>
          <article className="mini-card" data-reveal>
            <h3>03. Support</h3>
            <p>Bookings, confirmations, and follow-ups stay connected through proactive communication.</p>
          </article>
        </div>
      </section>
    </div>
  )
}
