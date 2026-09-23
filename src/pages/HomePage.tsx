import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="home-page">
      <section className="hero">
        <img
          className="hero-image"
          src="/images/safari.jpg"
          alt="A safari vehicle beneath acacia trees at sunset"
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="hero-content">
          <span className="eyebrow">AFRICA, AS YOU’VE ALWAYS IMAGINED</span>
          <h1>
            Some journeys
            <br />
            stay with you.
            <br />
            <em>Forever.</em>
          </h1>
          <p>
            Extraordinary safaris. Thoughtfully crafted.
            <br />
            Discover the wild, and a little of yourself.
          </p>
          <Link className="light-btn" to="/safaris">
            Find your extraordinary <span>↗</span>
          </Link>
        </div>
        <div className="hero-bottom">
          <span>
            <i className="pi pi-map-marker" /> THE CALL OF THE AFRICAN WILD
          </span>
          <a href="#discover">
            SCROLL TO DISCOVER <span>↓</span>
          </a>
        </div>
      </section>
      <div className="promise-strip">
        <span>Personally crafted journeys</span>
        <span className="star">✳</span>
        <span>Remarkable places to stay</span>
        <span className="star">✳</span>
        <span>Local knowledge. Lasting memories.</span>
      </div>
      <section id="discover" className="intro-section">
        <span className="eyebrow">WELCOME TO WILDTRACK SAFARIS</span>
        <h2>
          There’s Africa.
          <br />
          And then there’s <em>your Africa.</em>
        </h2>
        <p>
          The hush before a lion’s roar. The warmth of a fireside welcome. A
          horizon that seems to go on forever. These are the moments we travel
          for. We bring them together in a safari that feels entirely your own.
        </p>
        <Link className="text-link" to="/about">
          Discover the Wildtrack way <span>↗</span>
        </Link>
      </section>
      <section className="collection-section section-wrap">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FOLLOW YOUR CURIOSITY</span>
            <h2>
              Out of the ordinary.
              <br />
              <em>Into the wild.</em>
            </h2>
          </div>
          <Link className="text-link" to="/safaris">
            Explore all safaris <span>↗</span>
          </Link>
        </div>
        <div className="destination-grid">
          {[
            {
              name: "Kenya",
              tag: "THE HEART OF THE SAVANNAH",
              image: "safari",
              filter: "Kenya",
            },
            {
              name: "Tanzania",
              tag: "A FRONT-ROW SEAT TO THE WILD",
              image: "plains",
              filter: "Tanzania",
            },
            {
              name: "Botswana",
              tag: "WILDERNESS, WITHOUT LIMITS",
              image: "wildlife",
              filter: "Botswana",
            },
          ].map((item) => (
            <Link
              className="destination-card"
              to={`/safaris?region=${item.filter}`}
              key={item.name}
            >
              <img
                src={`/images/${item.image}.jpg`}
                alt={`Safari inspiration for ${item.name}`}
                loading="lazy"
              />
              <div>
                <span className="eyebrow">{item.tag}</span>
                <h3>
                  {item.name}
                  <span>↗</span>
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="editorial-section">
        <div className="editorial-image">
          <img
            src="/images/wildlife.jpg"
            alt="An elephant emerging from the forest"
            loading="lazy"
          />
          <span>LESS HURRY. MORE WONDER.</span>
        </div>
        <div className="editorial-copy">
          <span className="eyebrow">THE DIFFERENCE IS PERSONAL</span>
          <h2>
            Big on wonder.
            <br />
            <em>Thoughtful in every detail.</em>
          </h2>
          <p>
            We believe the best safaris leave room for the unexpected. An extra
            hour at the waterhole. A picnic with a view. A story shared long
            after the fire burns low.
          </p>
          <p>
            From the first conversation to your last sunset, we shape the
            details around you, so you can simply be there.
          </p>
          <Link className="text-link" to="/about">
            A more personal way to travel <span>↗</span>
          </Link>
        </div>
      </section>
      <section className="travel-styles section-wrap">
        <span className="eyebrow">YOUR PEOPLE. YOUR PACE.</span>
        <h2>
          One extraordinary continent.
          <br />
          <em>So many ways to experience it.</em>
        </h2>
        <div className="style-grid">
          {[
            {
              icon: "pi-compass",
              title: "The classic safari",
              text: "Iconic landscapes, remarkable wildlife, and the timeless romance of the bush.",
            },
            {
              icon: "pi-sun",
              title: "Just the two of you",
              text: "Quiet corners, golden sunsets, and unforgettable moments to share.",
            },
            {
              icon: "pi-users",
              title: "Together, in the wild",
              text: "Bring your favourite people. Make the kind of memories that become family stories.",
            },
          ].map((item) => (
            <Link
              to={`/contact?interest=${encodeURIComponent(item.title)}`}
              className="style-card"
              key={item.title}
            >
              <i className={`pi ${item.icon}`} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <span className="text-link">Make it yours ↗</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="quote-section">
        <span className="star">✳</span>
        <blockquote>
          A quieter mind. A wider horizon. A collection of moments to carry with
          you, long after the journey home.
        </blockquote>
        <span className="eyebrow">THE SPIRIT OF WILDTRACK</span>
      </section>
    </div>
  );
}
