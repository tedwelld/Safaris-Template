const safariTrips = [
  {
    title: 'Savannah Signature',
    length: '5 days',
    region: 'Kenya',
    price: '$1,980',
    description: 'Luxury tented camps, sunrise game drives, and private bush dinners under the stars.',
  },
  {
    title: 'Great Migration',
    length: '7 days',
    region: 'Tanzania',
    price: '$2,640',
    description: 'Follow the herds across the plains and experience some of the most dramatic wildlife moments on earth.',
  },
  {
    title: 'Family Adventure',
    length: '6 days',
    region: 'Kenya & Tanzania',
    price: '$2,150',
    description: 'Comfortable, easy-paced journeys with expert guides and child-friendly experiences.',
  },
  {
    title: 'Luxury Private Escape',
    length: '8 days',
    region: 'Botswana',
    price: '$3,480',
    description: 'Exclusive safari lodges, fly-in access, and tailored routes for guests seeking privacy and style.',
  },
]

export function SafarisPage() {
  return (
    <div className="route-page">
      <section className="card-section">
        <div className="section-header" data-reveal>
          <span className="eyebrow">Our safaris</span>
          <h2>Choose the journey that feels right for you.</h2>
        </div>

        <div className="safari-grid">
          {safariTrips.map((trip, index) => (
            <article className="safari-card" key={trip.title} data-reveal style={{ transitionDelay: `${index * 80}ms` }}>
              <div className="safari-meta">
                <span>{trip.length}</span>
                <span>{trip.region}</span>
              </div>
              <h3>{trip.title}</h3>
              <p>{trip.description}</p>
              <div className="safari-footer">
                <strong>{trip.price}</strong>
                <a href="/booking">Book now</a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
