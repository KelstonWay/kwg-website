import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-stone-50 py-20 px-8 md:px-32 border-t border-emerald-100">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 max-w-screen-2xl mx-auto">
        <div className="md:col-span-4">
          <Link to="/" className="font-['Newsreader'] text-xl font-bold text-emerald-900 mb-6 block italic">
            Kelston Way
          </Link>
          <p className="font-['Newsreader'] text-base text-stone-600 max-w-xs leading-relaxed">
            A premier Texas greenhouse providing professional-grade wholesale plant supply for commercial buyers.
          </p>
          <div className="flex gap-4 mt-8">
            <a href="https://instagram.com/kelstonway" target="_blank" rel="noreferrer"
              className="w-10 h-10 rounded-full border border-outline/30 flex items-center justify-center text-secondary hover:bg-secondary hover:text-white transition-colors">
              <span className="material-symbols-outlined text-sm">filter_vintage</span>
            </a>
          </div>
        </div>
        <div className="md:col-span-2">
          <h4 className="font-label-caps text-label-caps text-on-surface mb-6">WHOLESALE</h4>
          <ul className="space-y-4">
            <li><Link to="/availability" className="font-['Newsreader'] text-base text-stone-600 hover:text-emerald-800 transition-opacity opacity-80 hover:opacity-100">Current Catalog</Link></li>
            <li><Link to="/order" className="font-['Newsreader'] text-base text-stone-600 hover:text-emerald-800 transition-opacity opacity-80 hover:opacity-100">Place an Order</Link></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <h4 className="font-label-caps text-label-caps text-on-surface mb-6">COMPANY</h4>
          <ul className="space-y-4">
            <li><Link to="/our-story" className="font-['Newsreader'] text-base text-stone-600 hover:text-emerald-800 transition-opacity opacity-80 hover:opacity-100">Our Story</Link></li>
            <li><Link to="/contact" className="font-['Newsreader'] text-base text-stone-600 hover:text-emerald-800 transition-opacity opacity-80 hover:opacity-100">Contact</Link></li>
          </ul>
        </div>
        <div className="md:col-span-4 flex flex-col md:items-end">
          <h4 className="font-label-caps text-label-caps text-on-surface mb-6">DISTRIBUTION</h4>
          <p className="font-['Newsreader'] text-base text-stone-600 text-left md:text-right">
            Oglesby, Coryell County<br />
            Texas<br />
            <span className="italic mt-2 block">Opening January 2027</span>
          </p>
        </div>
      </div>
      <div className="mt-20 pt-8 border-t border-stone-200/50 text-center">
        <p className="font-['Newsreader'] text-sm text-stone-500">© {new Date().getFullYear()} Kelston Way Greenhouse. Professional Wholesale Supply.</p>
      </div>
    </footer>
  )
}
