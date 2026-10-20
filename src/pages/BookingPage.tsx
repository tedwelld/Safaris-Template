import { Link, useSearchParams } from "react-router-dom";
import { EnquiryForm } from "../components/EnquiryForm";
export function BookingPage() {
  const [params] = useSearchParams();
  return (
    <div className="route-page">
      <section className="page-intro photographic-intro ">
        <img
          className="cinematic-backdrop"
          src="/images/safari.jpg"
          alt="A game drive at sunset"
          fetchPriority="high"
        />
        <span className="eyebrow">
          THE FIRST STEP TO SOMETHING EXTRAORDINARY
        </span>
        <h1>
          Let’s make it
          <br />
          <em>your journey.</em>
        </h1>
        <p>
          Tell us a little about your plans. Together, we’ll turn a wish list
          into a safari worth remembering.
        </p>
      </section>
      <div className="booking-layout">
        <div>
          <EnquiryForm
            key={params.get("trip")}
            interest={params.get("trip") || ""}
            planning
          />
          <section className="booking-widget-panel"><h2>Already know your next adventure?</h2><p>Explore our experiences and choose your preferred date with live availability.</p><Link className="primary-btn" to="/activities">Book an experience <i className="pi pi-arrow-up-right" aria-hidden="true" /></Link></section>
        </div>
        <aside className="contact-panel">
          <img
            className="contact-photo"
            src="/images/safari.jpg"
            alt="A safari vehicle at sunset"
          />
          <span className="eyebrow">FROM AN IDEA TO AFRICA</span>
          <h2>
            A little planning.
            <br />A lifetime of memories.
          </h2>
          <ol>
            <li>Share your travel dreams and preferred dates.</li>
            <li>Explore a personalised itinerary and quote.</li>
            <li>Confirm the details with your safari specialist.</li>
            <li>Pack your curiosity. Your adventure awaits.</li>
          </ol>
          <p className="booking-note">
            Availability and final pricing are confirmed with your itinerary.
            Your specialist will explain the payment options when you’re ready
            to book.
          </p>
        </aside>
      </div>
    </div>
  );
}
