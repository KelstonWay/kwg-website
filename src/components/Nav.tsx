import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cartCount } from '../lib/cart'

export default function Nav() {
  const [count, setCount] = useState(cartCount())
  const navigate = useNavigate()

  useEffect(() => {
    const update = () => setCount(cartCount())
    window.addEventListener('cart-updated', update)
    return () => window.removeEventListener('cart-updated', update)
  }, [])

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 md:px-20 h-24 bg-white/90 backdrop-blur-md border-b border-emerald-100/50 transition-all duration-300">
      <div className="flex items-center gap-12">
        <Link to="/" className="font-['Newsreader'] text-2xl font-semibold tracking-tight text-emerald-900 italic">
          Kelston Way
        </Link>
        <nav className="hidden md:flex gap-8">
          <Link to="/availability" className="font-['Newsreader'] italic text-lg text-stone-500 hover:text-emerald-700 transition-colors duration-300">
            Wholesale Catalog
          </Link>
          <Link to="/our-story" className="font-['Newsreader'] italic text-lg text-stone-500 hover:text-emerald-700 transition-colors duration-300">
            Our Story
          </Link>
          <Link to="/contact" className="font-['Newsreader'] italic text-lg text-stone-500 hover:text-emerald-700 transition-colors duration-300">
            Contact
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/order')}
          className="relative hover:bg-surface-container transition-all duration-300 p-2.5 rounded-full"
          aria-label="View order"
        >
          <span className="material-symbols-outlined text-on-surface-variant">shopping_bag</span>
          {count > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-on-primary text-[10px] font-button rounded-full flex items-center justify-center">
              {count}
            </span>
          )}
        </button>
        <Link
          to="/availability"
          className="px-6 py-3 bg-primary text-on-primary font-button text-button rounded-sm hover:bg-primary-container transition-all duration-300"
        >
          Order Now
        </Link>
      </div>
    </header>
  )
}
