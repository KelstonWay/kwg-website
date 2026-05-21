import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-emerald-100 bg-stone-50 px-8 py-20 md:px-32">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <Link
            to="/"
            className="mb-6 block font-['Newsreader'] text-xl font-bold italic text-emerald-900"
          >
            Kelston Way
          </Link>
          <p className="max-w-xs font-['Newsreader'] text-base leading-relaxed text-stone-600">
            A premier Texas greenhouse providing professional-grade wholesale plant supply for
            commercial buyers.
          </p>
          <div className="mt-8 flex gap-4">
            <a
              href="https://instagram.com/kelstonway"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-outline/30 text-secondary transition-colors hover:bg-secondary hover:text-white"
            >
              <span className="material-symbols-outlined text-sm">filter_vintage</span>
            </a>
          </div>
        </div>
        <div className="md:col-span-2">
          <h4 className="mb-6 font-label-caps text-label-caps text-on-surface">WHOLESALE</h4>
          <ul className="space-y-4">
            <li>
              <Link
                to="/availability"
                className="font-['Newsreader'] text-base text-stone-600 opacity-80 transition-opacity hover:text-emerald-800 hover:opacity-100"
              >
                Current Availability
              </Link>
            </li>
            <li>
              <Link
                to="/order"
                className="font-['Newsreader'] text-base text-stone-600 opacity-80 transition-opacity hover:text-emerald-800 hover:opacity-100"
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
                className="font-['Newsreader'] text-base text-stone-600 opacity-80 transition-opacity hover:text-emerald-800 hover:opacity-100"
              >
                Our Story
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="font-['Newsreader'] text-base text-stone-600 opacity-80 transition-opacity hover:text-emerald-800 hover:opacity-100"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div className="flex flex-col md:col-span-4 md:items-end">
          <h4 className="mb-6 font-label-caps text-label-caps text-on-surface">DISTRIBUTION</h4>
          <p className="text-left font-['Newsreader'] text-base text-stone-600 md:text-right">
            Oglesby, Coryell County
            <br />
            Texas
            <br />
            <span className="mt-2 block italic">Opening January 2027</span>
          </p>
        </div>
      </div>
      <div className="mt-20 border-t border-stone-200/50 pt-8 text-center">
        <p className="font-['Newsreader'] text-sm text-stone-500">
          © {new Date().getFullYear()} Kelston Way Greenhouse. Professional Wholesale Supply.
        </p>
      </div>
    </footer>
  )
}
