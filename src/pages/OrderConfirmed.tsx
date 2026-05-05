import { useLocation, Link } from 'react-router-dom'

export default function OrderConfirmed() {
  const { state } = useLocation() as { state: { orderId?: string; email?: string } | null }
  const ref = state?.orderId?.slice(0, 8).toUpperCase() ?? '—'

  return (
    <div className="px-8 md:px-32 py-section-padding max-w-3xl mx-auto text-center">
      <span className="material-symbols-outlined text-5xl text-primary mb-6 block">check_circle</span>
      <span className="font-label-caps text-label-caps text-primary mb-6 block">Order Confirmed</span>
      <h1 className="font-['Newsreader'] text-display-lg text-on-background mb-8 italic">
        Thank you for your order.
      </h1>
      <p className="font-body-lg text-on-surface-variant mb-4">
        Your order is being reviewed. We'll reach out with your invoice within 1 business day.
      </p>
      {state?.email && (
        <p className="font-body-md text-on-surface-variant mb-8">
          A confirmation has been sent to <strong>{state.email}</strong>.
        </p>
      )}
      <div className="inline-block px-6 py-3 bg-surface-container-low border border-outline-variant rounded-full font-label-caps text-label-caps tracking-widest text-primary mb-16">
        Order Reference: #{ref}
      </div>
      <div className="flex gap-4 justify-center flex-wrap">
        <Link
          to="/availability"
          className="px-8 py-4 bg-primary text-on-primary font-button text-button rounded-sm hover:bg-primary-container transition-all duration-300"
        >
          Browse More
        </Link>
        <Link
          to="/"
          className="px-8 py-4 border border-secondary text-secondary font-button text-button rounded-sm hover:bg-secondary-container/20 transition-all duration-300"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
