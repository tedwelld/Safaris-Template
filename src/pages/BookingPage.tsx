import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EnquiryForm } from "../components/EnquiryForm";
const bokunWidgetUrl = import.meta.env.VITE_BOKUN_WIDGET_URL || "";
export function BookingPage() {
  const [params] = useSearchParams();
  const [widgetFailed, setWidgetFailed] = useState(false);
  useEffect(() => {
    if (!bokunWidgetUrl) return;
    const script = document.createElement("script");
    script.src = bokunWidgetUrl;
    script.async = true;
    script.onerror = () => setWidgetFailed(true);
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);
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
          {bokunWidgetUrl && (
            <section
              className="booking-widget-panel"
              aria-label="Safari availability"
            >
              {widgetFailed ? (
                <p role="status">
                  Live availability is temporarily unavailable. Please use the
                  enquiry form above.
                </p>
              ) : (
                <>
                  <p>
                    Explore live availability, or enquire above for a personal
                    itinerary.
                  </p>
                  <div className="bokun-widget" data-bokun-widget="true" />
                </>
              )}
            </section>
          )}
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
