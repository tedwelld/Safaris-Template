import { Link } from 'react-router-dom';
export function BookingError({ message, retry }: { message: string; retry?: () => void }) {
  return <div className="bk-message" role="alert"><i className="pi pi-info-circle" aria-hidden="true" /><h2>A little help with your journey.</h2><p>{message}</p><div className="bk-actions">{retry && <button className="secondary-btn" onClick={retry}>Try again</button>}<Link className="primary-btn" to="/contact">Speak to our team</Link></div></div>;
}
export function BookingSteps({ step }: { step: number }) {
  return <ol className="bk-steps" aria-label="Booking progress">{['Choose an experience', 'Your selection', 'Details & payment'].map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined}><span>{index < step ? <i className="pi pi-check" aria-hidden="true" /> : `0${index + 1}`}</span>{label}</li>)}</ol>;
}
