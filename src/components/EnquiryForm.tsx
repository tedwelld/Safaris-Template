import { useState } from "react";
import type { FormEvent } from "react";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
const supportEmail =
  import.meta.env.VITE_EMAIL_SUPPORT || "reservations@wildtracktravel.com";
export function EnquiryForm({
  interest = "",
  planning = false,
}: {
  interest?: string;
  planning?: boolean;
}) {
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [emailDraft, setEmailDraft] = useState("");
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const message = `${String(values.get("message") || "")}${planning ? `\nPreferred month: ${values.get("dates") || "Flexible"}\nTravellers: ${values.get("travellers")}` : ""}`;
    const payload = {
      name: String(values.get("name") || ""),
      email: String(values.get("email") || ""),
      tripInterest: String(values.get("tripInterest") || ""),
      message,
    };
    setEmailDraft(
      `mailto:${supportEmail}?subject=${encodeURIComponent(`Safari enquiry: ${payload.tripInterest}`)}&body=${encodeURIComponent(`Name: ${payload.name}\nEmail: ${payload.email}\n\n${message}`)}`,
    );
    setStatus("sending");
    try {
      const response = await fetch(`${apiBaseUrl}/api/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error("Unable to submit enquiry");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }
  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>
          Your name
          <input
            name="name"
            autoComplete="name"
            placeholder="Full name"
            required
            maxLength={120}
          />
        </label>
        <label>
          Email address
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            maxLength={200}
          />
        </label>
      </div>
      <label>
        Your safari interest
        <input
          name="tripInterest"
          placeholder="A destination, a journey, or just an idea"
          defaultValue={interest}
          required
          maxLength={200}
        />
      </label>
      {planning && (
        <div className="form-row">
          <label>
            Preferred travel month
            <input
              name="dates"
              type="month"
              min={new Date().toISOString().slice(0, 7)}
            />
          </label>
          <label>
            Number of travellers
            <select name="travellers" defaultValue="2">
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
              <option>6+</option>
            </select>
          </label>
        </div>
      )}
      <label>
        Tell us a little more
        <textarea
          name="message"
          rows={5}
          placeholder="Tell us about your dream safari, travel companions, and must-see places."
          required
          maxLength={5000}
        />
      </label>
      <button
        className="primary-btn"
        type="submit"
        disabled={status === "sending"}
      >
        {status === "sending"
          ? "Sending your enquiry…"
          : "Begin the conversation"}{" "}
        <span>↗</span>
      </button>
      <p className="booking-note">
        An enquiry is the first step. No payment or commitment is required.
      </p>
      {status === "success" && (
        <p className="success-message" role="status">
          Thank you. Your enquiry has been received.
        </p>
      )}
      {status === "error" && (
        <div className="error-message" role="alert">
          We couldn’t send your enquiry. Please try again, or{" "}
          <a className="text-link" href={emailDraft}>
            send it by email ↗
          </a>
          . Your details are still here.
        </div>
      )}
    </form>
  );
}
