import { useState } from 'react'
import type { FormEvent } from 'react'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const supportEmail = import.meta.env.VITE_EMAIL_SUPPORT || 'reservations@wildtracktravel.com'
const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+15551234567'
const whatsappMessage = import.meta.env.VITE_WHATSAPP_MESSAGE || 'Hi%20I%20want%20to%20plan%20a%20safari'

export function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = {
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      tripInterest: String(formData.get('tripInterest') || ''),
      message: String(formData.get('message') || ''),
    }

    setIsSubmitting(true)

    try {
      await fetch(`${apiBaseUrl}/api/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Hi, my name is ${payload.name}. I am interested in ${payload.tripInterest}. ${payload.message}`,
      )}`
      const emailBody = encodeURIComponent(
        `Name: ${payload.name}\nEmail: ${payload.email}\nTrip interest: ${payload.tripInterest}\n\nMessage:\n${payload.message}`,
      )
      const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent('Safari enquiry from website')}&body=${emailBody}`

      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
      window.location.href = mailtoLink
      setSubmitted(true)
      form.reset()
    } catch (error) {
      console.error('Lead submission failed', error)
      setSubmitted(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="route-page">
      <section className="card-section">
        <div className="section-header" data-reveal>
          <span className="eyebrow">Contact</span>
          <h2>Let’s plan your next safari.</h2>
        </div>

        <div className="contact-layout">
          <form className="contact-form" onSubmit={handleSubmit} data-reveal>
            <label>
              Full name
              <input name="name" type="text" placeholder="Your name" required />
            </label>
            <label>
              Email address
              <input name="email" type="email" placeholder="you@example.com" required />
            </label>
            <label>
              Trip interest
              <input name="tripInterest" type="text" placeholder="Luxury safari, honeymoon, family holiday..." required />
            </label>
            <label>
              Message
              <textarea name="message" rows={5} placeholder="Tell us about your dream safari and preferred dates." required />
            </label>
            <button type="submit" className="primary-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Sending enquiry...' : 'Send enquiry'}
            </button>
            {submitted ? <p className="success-message">Your enquiry is being sent via WhatsApp and email.</p> : null}
          </form>

          <div className="contact-panel">
            <div className="info-card" data-reveal>
              <h3>Reach the team</h3>
              <p>
                Email: <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
              </p>
              <p>
                WhatsApp:{' '}
                <a href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${whatsappMessage}`} target="_blank" rel="noreferrer">
                  {whatsappNumber}
                </a>
              </p>
            </div>

            <div className="info-card accent-card" data-reveal>
              <h3>Quick response flows</h3>
              <ul>
                <li>Initial enquiry acknowledgement within 30 minutes</li>
                <li>Offer and availability follow-up by email or WhatsApp</li>
                <li>Secure payment link and confirmation after booking</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
