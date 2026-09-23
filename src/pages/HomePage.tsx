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
      <section
        className="photo-story section-wrap"
        aria-labelledby="photo-story-heading"
      >
        <div className="section-heading">
          <div>
            <span className="eyebrow">A CONTINENT THAT MOVES YOU</span>
            <h2 id="photo-story-heading">
              Let the view
              <br />
              <em>take your breath away.</em>
            </h2>
          </div>
          <p>
            Wild encounters. Sculpted landscapes.
            <br />A different kind of beautiful, every day.
          </p>
        </div>
        <div className="photo-story-grid">
          <figure className="landscape-frame">
            <img
              src="/images/namib-dunes.jpg"
              alt="Light and shadow across the sweeping orange dunes of Namibia"
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <span className="eyebrow">THE ART OF NATURE</span>
              <span>Horizons without an end.</span>
            </figcaption>
          </figure>
          <figure className="portrait-frame">
            <img
              src="/images/giraffe-savannah.jpg"
              alt="A giraffe standing tall beneath dramatic clouds in the Maasai Mara"
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <span className="eyebrow">A MOMENT OF CONNECTION</span>
              <span>Wonder, in the wild.</span>
            </figcaption>
          </figure>
          <figure className="wildlife-frame">
            <img
              src="/images/lion-grasslands.jpg"
              alt="A male lion resting in sunlit grass"
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <span className="eyebrow">ON NATURE’S TIME</span>
              <span>Stay a little longer.</span>
            </figcaption>
          </figure>
        </div>
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
              image: "giraffe-savannah",
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
              image: "elephants-golden",
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
              image: "plains",
              alt: "Zebras moving through golden grass",
              title: "The classic safari",
              text: "Iconic landscapes, remarkable wildlife, and the timeless romance of the bush.",
            },
            {
              image: "safari",
              alt: "Warm sunset over a safari game drive",
              title: "Just the two of you",
              text: "Quiet corners, golden sunsets, and unforgettable moments to share.",
            },
            {
              image: "elephants-golden",
              alt: "An elephant and calf together in the evening light",
              title: "Together, in the wild",
              text: "Bring your favourite people. Make the kind of memories that become family stories.",
            },
          ].map((item) => (
            <Link
              to={`/contact?interest=${encodeURIComponent(item.title)}`}
              className="style-card photographic-style"
              key={item.title}
            >
              <img
                className="style-photo"
                src={`/images/${item.image}.jpg`}
                alt={item.alt}
                loading="lazy"
                decoding="async"
              />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <span className="text-link">Make it yours ↗</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="quote-section photographic-quote">
        <img
          className="cinematic-backdrop"
          src="/images/namib-dunes.jpg"
          alt=""
          loading="lazy"
          decoding="async"
        />
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
