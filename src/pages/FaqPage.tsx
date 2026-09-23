const faqs = [
  {
    question: 'Can I connect custom booking flows to Bokun?',
    answer: 'Yes. This template is designed to support Bokun widget embedding, package booking links, and a structured enquiry flow for safari operators.',
  },
  {
    question: 'Does the template support email communications?',
    answer: 'Yes. The design includes email automation touchpoints such as booking confirmations, reminders, and follow-up messages for guests.',
  },
  {
    question: 'Can I use WhatsApp for conversion and support?',
    answer: 'Absolutely. The site includes quick links and message flows to help convert warm leads directly into safari conversations.',
  },
  {
    question: 'Can I accept deposits and full payments online?',
    answer: 'Yes. The booking page is structured for PayPal checkout, secure payment steps, and follow-up confirmation messaging after payment success.',
  },
]

export function FaqPage() {
  return (
    <div className="route-page">
      <section className="card-section narrow">
        <div className="section-header" data-reveal>
          <span className="eyebrow">FAQ</span>
          <h2>Frequently asked questions.</h2>
        </div>

        <div className="faq-list">
          {faqs.map((item, index) => (
            <details key={item.question} className="faq-item" open data-reveal style={{ transitionDelay: `${index * 80}ms` }}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
