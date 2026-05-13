import { useLocation } from 'react-router-dom'

const HIDDEN_PATHS = ['/order']

export default function FloatingContact() {
  const { pathname } = useLocation()

  if (HIDDEN_PATHS.some(p => pathname.startsWith(p))) return null

  return (
    <a
      href="mailto:samuel@kelstonway.com"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center hover:bg-primary-container transition-colors"
      aria-label="Email us"
    >
      <span className="material-symbols-outlined text-2xl">mail</span>
    </a>
  )
}
