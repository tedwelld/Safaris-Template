import { Link, useSearchParams } from "react-router-dom";
const trips = [
  {
    title: "Savannah Signature",
    length: "5 days",
    region: "Kenya",
    price: "$1,980",
    image: "safari",
    description:
      "Sunrise game drives, intimate tented camps, and dinner beneath a sky full of stars.",
  },
  {
    title: "The Great Migration",
    length: "7 days",
    region: "Tanzania",
    price: "$2,640",
    image: "plains",
    description:
      "Wide-open plains and the thrill of following the herds, with time to take it all in.",
  },
  {
    title: "A Family Adventure",
    length: "6 days",
    region: "Kenya & Tanzania",
    price: "$2,150",
    image: "wildlife",
    description:
      "A gentler pace, shared discoveries, and little moments that become your biggest memories.",
  },
  {
    title: "The Private Wilderness",
    length: "8 days",
    region: "Botswana",
    price: "$3,480",
    image: "wildlife",
    description:
      "Remote landscapes, intimate lodges, and an escape shaped around your own sense of adventure.",
  },
];
export function SafarisPage() {
  const [params, setParams] = useSearchParams();
  const region = params.get("region") || "All destinations";
  const filtered = trips.filter(
    (trip) => region === "All destinations" || trip.region.includes(region),
  );
  return (
    <div className="route-page">
      <section className="page-intro">
        <span className="eyebrow">THE SAFARI COLLECTION</span>
        <h1>
          Find your kind
          <br />
          of <em>extraordinary.</em>
        </h1>
        <p>
          Consider these a starting point. Every journey can be shaped around
          the places, people, and moments that matter to you.
        </p>
      </section>
      <section className="section-wrap">
        <div className="filter-bar" aria-label="Filter by destination">
          {["All destinations", "Kenya", "Tanzania", "Botswana"].map((item) => (
            <button
              key={item}
              className={region === item ? "selected" : ""}
              aria-pressed={region === item}
              onClick={() =>
                setParams(item === "All destinations" ? {} : { region: item })
              }
            >
              {item}
            </button>
          ))}
        </div>
        <div className="safari-grid">
          {filtered.map((trip) => (
            <article className="safari-card" key={trip.title}>
              <img
                src={`/images/${trip.image}.jpg`}
                alt={`Wildlife and landscapes of ${trip.region}`}
                loading="lazy"
              />
              <div className="safari-card-body">
                <span className="eyebrow">
                  {trip.region} · {trip.length}
                </span>
                <h2>{trip.title}</h2>
                <p>{trip.description}</p>
                <div className="safari-footer">
                  <span>
                    From <strong>{trip.price}</strong>
                    <small>per person · indicative price</small>
                  </span>
                  <Link
                    className="text-link"
                    to={`/booking?trip=${encodeURIComponent(trip.title)}`}
                  >
                    Enquire <span>↗</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        {!filtered.length && (
          <p>
            No journeys found. Choose another destination to explore the
            collection.
          </p>
        )}
        <p className="collection-note">
          Every safari is personal. Final pricing depends on your dates,
          accommodation, and group size.
        </p>
      </section>
    </div>
  );
}
