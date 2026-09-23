import { useEffect, useState } from 'react'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const bokunWidgetUrl = import.meta.env.VITE_BOKUN_WIDGET_URL || ''
const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'YOUR_PAYPAL_CLIENT_ID'

const bookingSteps = [
  'Select a safari package and preferred travel dates',
  'Capture traveler details and any extras required for the journey',
  'Confirm your itinerary and pay the deposit securely via PayPal',
  'Receive a booking email plus WhatsApp confirmation updates',
]

export function BookingPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    if (!bokunWidgetUrl) {
      return
    }

    const existingScript = document.querySelector('script[data-bokun-template]')
    if (existingScript) {
      return
    }

    const script = document.createElement('script')
    script.src = bokunWidgetUrl
    script.async = true
    script.setAttribute('data-bokun-template', 'true')
    document.body.appendChild(script)
  }, [])

  const handlePayPalCheckout = async () => {
    setIsProcessing(true)
    setStatusMessage('')

    try {
      const response = await fetch(`${apiBaseUrl}/api/paypal/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: 'Savannah Signature Safari',
          total: '1980.00',
          currency: 'USD',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to create PayPal order.')
      }

      if (data.approvalUrl) {
        window.location.href = data.approvalUrl
        return
      }

      setStatusMessage(data.message || 'Your booking request has been created.')
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Could not initiate checkout.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="route-page">
      <section className="card-section">
        <div className="section-header" data-reveal>
          <span className="eyebrow">Booking</span>
          <h2>Reserve your safari in a few simple steps.</h2>
        </div>

        <div className="booking-layout">
          <div className="info-card" data-reveal>
            <p>
              This booking view is structured for a live Bokun widget, or a fallback placeholder while your
              widget URL is configured. The flow supports custom itinerary capture, quote requests, and
              secure checkout progression.
            </p>
            <ol>
              {bookingSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <div className="small-code-block" data-reveal>
              <strong>PayPal client:</strong>
              <code>{paypalClientId}</code>
            </div>

            <button type="button" className="primary-btn checkout-button" onClick={handlePayPalCheckout} disabled={isProcessing}>
              {isProcessing ? 'Preparing checkout...' : 'Pay deposit with PayPal'}
            </button>

            {statusMessage ? <p className="status-message">{statusMessage}</p> : null}
          </div>

          <div className="booking-widget-panel" data-reveal>
            {bokunWidgetUrl ? (
              <div className="bokun-host">
                <div className="bokun-widget" data-bokun-widget="true" />
              </div>
            ) : (
              <div className="widget-placeholder">
                <p>Connect Bokun</p>
                <small>Add your Bokun widget URL in your environment variables to activate the booking widget.</small>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
