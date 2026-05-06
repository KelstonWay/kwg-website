import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { cartCount } from '../lib/cart'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/availability', label: 'Availability' },
  { to: '/our-story', label: 'Our Story' },
  { to: '/contact', label: 'Contact' },
]

export default function Nav() {
  const [count, setCount] = useState(cartCount())
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    const update = () => setCount(cartCount())
    window.addEventListener('cart-updated', update)
    return () => window.removeEventListener('cart-updated', update)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-5 md:px-20 h-16 bg-white/90 backdrop-blur-md border-b border-emerald-100/50 transition-all duration-300">
        <div className="flex items-center gap-6">
          <Link to="/">
            <img src="/logo-cropped.png" alt="Kelston Way" className="h-11 w-auto" />
          </Link>
          <nav className="hidden md:flex gap-2">
            {NAV_LINKS.map(({ to, label }) => {
              const active = to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(to + '/')
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-4 py-1.5 rounded-full font-button text-button text-sm transition-all duration-200 ${
                    active
                      ? 'bg-secondary text-on-secondary font-semibold'
                      : 'bg-secondary/70 text-on-secondary hover:bg-secondary'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
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
            className="hidden md:block px-6 py-2.5 bg-secondary text-on-secondary font-button text-button font-semibold rounded-sm hover:opacity-90 transition-all duration-300"
          >
            Order Now
          </Link>
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-surface-container transition-colors"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            <span className="material-symbols-outlined text-on-surface-variant">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 flex flex-col pt-16 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <nav className="relative bg-white border-b border-outline-variant/30 px-5 py-4 flex flex-col gap-2 shadow-lg">
            {NAV_LINKS.map(({ to, label }) => {
              const active = to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(to + '/')
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-4 py-3 rounded-xl font-button text-button transition-all ${
                    active
                      ? 'bg-secondary text-on-secondary font-semibold'
                      : 'text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
            <Link
              to="/availability"
              className="mt-2 px-4 py-3 bg-secondary text-on-secondary font-button text-button font-semibold rounded-xl text-center hover:opacity-90 transition-all"
            >
              Order Now
            </Link>
          </nav>
        </div>
      )}
    </>
  )
}
