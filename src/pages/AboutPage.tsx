import { Link } from "react-router-dom";
export function AboutPage() {
  return (
    <div className="route-page">
      <section className="page-intro">
        <span className="eyebrow">THE WILDTRACK WAY</span>
        <h1>
          A love of Africa.
          <br />
          <em>A sense of belonging.</em>
        </h1>
        <p>
          We travel for connection. To the land, to its people, and to the
          feeling of being somewhere truly extraordinary.
        </p>
      </section>
      <section className="editorial-section">
        <div className="editorial-image">
          <img src="/images/plains.jpg" alt="An expansive African wilderness" />
          <span>A DIFFERENT PERSPECTIVE</span>
        </div>
        <div className="editorial-copy">
          <span className="eyebrow">PERSONAL BY NATURE</span>
          <h2>
            A journey with
            <br />
            <em>you at its heart.</em>
          </h2>
          <p>
            Your idea of a perfect safari is unique. Perhaps it’s the excitement
            of your first game drive, the quiet of a remote camp, or watching
            your children discover a whole new world.
          </p>
          <p>
            We start by listening. Then we bring together thoughtful routes,
            welcoming places to stay, and time to enjoy the moments that cannot
            be scheduled.
          </p>
          <Link className="text-link" to="/contact">
            Tell us what moves you ↗
          </Link>
        </div>
      </section>
      <section className="section-wrap travel-styles">
        <span className="eyebrow">THE LITTLE THINGS ARE THE BIG THINGS</span>
        <h2>
          Thoughtfully considered.
          <br />
          <em>Beautifully experienced.</em>
        </h2>
        <div className="style-grid">
          {[
            {
              title: "01. We listen",
              text: "Your interests, your pace, your travel companions. We begin with what makes a journey meaningful to you.",
            },
            {
              title: "02. We make it personal",
              text: "The right landscapes, a welcoming camp, and time for discovery. Each detail earns its place in your itinerary.",
            },
            {
              title: "03. We stay connected",
              text: "Clear guidance before you leave and a familiar point of contact as you plan your adventure.",
            },
          ].map((item) => (
            <article className="style-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
