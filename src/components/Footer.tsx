import { Link } from 'react-router-dom'
import { CONTACT_EMAIL, CONTACT_MAILTO, CONTACT_PHONE, CONTACT_PHONE_HREF } from '../lib/site'

export default function Footer() {
  return (
    <footer className="border-t border-outline-variant/30 bg-stone-50 px-8 py-20 md:px-32">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <Link
            to="/"
            className="mb-6 block font-['Newsreader'] text-xl font-bold italic text-primary"
          >
            Kelston Way
          </Link>
          <p className="max-w-xs font-body-md text-base leading-relaxed text-stone-600">
            A family-owned wholesale grower in Oglesby, Texas, supplying annuals, perennials, and
            seasonal color to garden centers and landscape professionals.
          </p>
        </div>
        <div className="md:col-span-2">
          <h4 className="mb-6 font-label-caps text-label-caps text-on-surface">WHOLESALE</h4>
          <ul className="space-y-4">
            <li>
              <Link
                to="/availability"
                className="font-body-md text-base text-stone-600 opacity-80 transition-opacity hover:text-primary hover:opacity-100"
              >
                Current Availability
              </Link>
            </li>
            <li>
              <Link
                to="/order"
                className="font-body-md text-base text-stone-600 opacity-80 transition-opacity hover:text-primary hover:opacity-100"
              >
                Place an Order
              </Link>
            </li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <h4 className="mb-6 font-label-caps text-label-caps text-on-surface">COMPANY</h4>
          <ul className="space-y-4">
            <li>
              <Link
                to="/our-story"
                className="font-body-md text-base text-stone-600 opacity-80 transition-opacity hover:text-primary hover:opacity-100"
              >
                Our Story
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="font-body-md text-base text-stone-600 opacity-80 transition-opacity hover:text-primary hover:opacity-100"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div className="flex flex-col md:col-span-4 md:items-end">
          <h4 className="mb-6 font-label-caps text-label-caps text-on-surface">CONTACT</h4>
          <p className="text-left font-body-md text-base text-stone-600 md:text-right">
            <a href={CONTACT_MAILTO} className="transition-colors hover:text-primary">
              {CONTACT_EMAIL}
            </a>
            <br />
            <a href={CONTACT_PHONE_HREF} className="transition-colors hover:text-primary">
              {CONTACT_PHONE}
            </a>
            <br />
            <span className="mt-2 block">
              Oglesby, Coryell County
              <br />
              Texas
            </span>
          </p>
        </div>
      </div>
      <div className="mt-20 border-t border-stone-200/50 pt-8 text-center">
        <p className="font-body-md text-sm text-stone-500">
          © {new Date().getFullYear()} Kelston Way Greenhouse · Wholesale Grower · Oglesby, Texas
        </p>
      </div>
    </footer>
  )
}
