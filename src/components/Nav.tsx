import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/availability', label: 'Availability' },
  { to: '/our-story', label: 'Our Story' },
  { to: '/contact', label: 'Contact' },
  { to: '/account', label: 'Account' },
]

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()
  const { varietyCount: count } = useCart()

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <>
      <header className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-outline-variant/30 bg-white/90 px-5 backdrop-blur-md transition-all duration-300 md:px-20">
        <div className="flex items-center gap-6">
          <Link to="/">
            <img src="/logo-cropped.png" alt="Kelston Way" className="h-11 w-auto" />
          </Link>
          <nav className="hidden gap-2 md:flex">
            {NAV_LINKS.map(({ to, label }) => {
              const active =
                to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(to + '/')
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-1.5 font-button text-sm transition-all duration-200 ${
                    active
                      ? 'border-b border-on-surface font-semibold text-on-surface'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/account"
            className="relative rounded-full p-2.5 transition-all duration-300 hover:bg-surface-container"
            aria-label="Account"
          >
            <span className="material-symbols-outlined text-on-surface-variant">
              {user ? 'account_circle' : 'person'}
            </span>
            {user && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            )}
          </Link>
          <button
            onClick={() => navigate('/order')}
            className="relative rounded-full p-2.5 transition-all duration-300 hover:bg-surface-container"
            aria-label="View order"
          >
            <span className="material-symbols-outlined text-on-surface-variant">shopping_bag</span>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary font-button text-[10px] text-on-primary">
                {count}
              </span>
            )}
          </button>
          <Link
            to="/availability"
            className="hidden rounded-sm bg-secondary px-6 py-2.5 font-button text-button font-semibold text-on-secondary transition-all duration-300 hover:opacity-90 md:block"
          >
            Order Now
          </Link>
          {/* Hamburger — mobile only */}
          <button
            className="rounded-full p-2 transition-colors hover:bg-surface-container md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
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
          <nav className="relative flex flex-col gap-2 border-b border-outline-variant/30 bg-white px-5 py-4 shadow-lg">
            {NAV_LINKS.map(({ to, label }) => {
              const active =
                to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(to + '/')
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-4 py-3 font-button text-button transition-all ${
                    active
                      ? 'font-semibold text-on-surface'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
            <Link
              to="/availability"
              className="mt-2 rounded-sm bg-secondary px-4 py-3 text-center font-button text-button font-semibold text-on-secondary transition-all hover:opacity-90"
            >
              Order Now
            </Link>
          </nav>
        </div>
      )}
    </>
  )
}
