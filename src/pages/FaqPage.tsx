import { Link } from "react-router-dom";
const faqs = [
  {
    question: "When is the best time to go on safari?",
    answer:
      "It depends on your destination and what you hope to see. Dry seasons can make wildlife easier to spot around water sources, while greener months bring different landscapes and quieter camps. Share your preferred dates and we’ll help you explore the options.",
  },
  {
    question: "Can you tailor a journey around us?",
    answer:
      "Absolutely. Our collection is a starting point. We can discuss the route, pace, accommodation, and experiences that suit your interests and your group.",
  },
  {
    question: "Is a safari suitable for families?",
    answer:
      "Many safaris are wonderful for families. Age policies vary by lodge and activity, so tell us your children’s ages when you enquire. We’ll help you consider suitable stays and a comfortable pace.",
  },
  {
    question: "What is included in the price?",
    answer:
      "Inclusions depend on your itinerary. Your personalised quote will set out accommodation, meals, activities, transfers, and any exclusions before you confirm.",
  },
  {
    question: "How do I begin planning?",
    answer:
      "Send us your preferred destination, approximate dates, group size, and any ideas you have. We’ll discuss the possibilities and help shape your itinerary before you make a booking.",
  },
  {
    question: "What should I pack?",
    answer:
      "Think comfortable layers, neutral colours, sturdy shoes, sun protection, and a camera or binoculars. Your final packing list will depend on the season, activities, and baggage limits on your itinerary.",
  },
];
export function FaqPage() {
  return (
    <div className="route-page">
      <section className="page-intro">
        <span className="eyebrow">
          A LITTLE KNOWLEDGE, A LOT OF POSSIBILITY
        </span>
        <h1>
          Before the
          <br />
          <em>adventure begins.</em>
        </h1>
        <p>
          A few answers to get you dreaming. For everything else, we’re just a
          conversation away.
        </p>
      </section>
      <section className="faq-section">
        {faqs.map((item) => (
          <details className="faq-item" key={item.question}>
            <summary>
              {item.question}
              <span aria-hidden="true">+</span>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
        <div className="faq-help">
          <p>Have something else on your mind?</p>
          <Link className="text-link" to="/contact">
            Ask a safari specialist ↗
          </Link>
        </div>
      </section>
    </div>
  );
}
