import { Link, useSearchParams } from "react-router-dom";
import { EnquiryForm } from "../components/EnquiryForm";
import { supportEmail, whatsappUrl } from "../config";
export function ContactPage() {
  const [params] = useSearchParams();
  return (
    <div className="route-page">
      <section className="page-intro photographic-intro ">
        <img
          className="cinematic-backdrop"
          src="/images/namib-dunes.jpg"
          alt="Sculpted orange dunes in the Namib Desert"
          fetchPriority="high"
        />
        <span className="eyebrow">LET’S START SOMETHING WONDERFUL</span>
        <h1>
          Your safari.
          <br />
          <em>Our conversation.</em>
        </h1>
        <p>
          A well-formed plan or the very first spark of an idea. Wherever you
          are in your dreaming, we’d love to hear from you.
        </p>
      </section>
      <div className="contact-layout" id="request-form">
        <EnquiryForm
          key={params.get("interest")}
          interest={params.get("interest") || ""}
        />
        <aside className="contact-panel">
          <img
            className="contact-photo"
            src="/images/elephants-golden.jpg"
            alt="An elephant and calf in golden evening light"
          />
          <span className="eyebrow">A PERSONAL CONNECTION</span>
          <h2>
            Every great journey
            <br />
            starts here.
          </h2>
          <p>
            Tell us what you’re imagining. We’ll help you explore the
            destinations, seasons, and experiences that suit you.
          </p>
          {supportEmail && <Link className="text-link" to="/contact#request-form">
            Email our team
          </Link>}
          {whatsappUrl && (
            <p>
              <a
                className="text-link"
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
              >
                Chat on WhatsApp ↗
              </a>
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
