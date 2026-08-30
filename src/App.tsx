import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import Nav from './components/Nav'
import Footer from './components/Footer'
import RouteMeta from './components/RouteMeta'
import PreviewGate from './components/PreviewGate'
import Home from './pages/Home'
import Availability from './pages/Availability'
import Fundraisers from './pages/Fundraisers'
import Order from './pages/Order'
import OrderConfirmed from './pages/OrderConfirmed'
import OrderStatus from './pages/OrderStatus'
import OrderEditConfirm from './pages/OrderEditConfirm'
import MeetTheTeam from './pages/MeetTheTeam'
import Contact from './pages/Contact'
import Account from './pages/Account'
import AccountOrderDetail from './pages/AccountOrderDetail'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <PreviewGate>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <ScrollToTop />
            <RouteMeta />
            <div className="flex min-h-screen flex-col bg-background text-on-background">
              <Nav />
              <main className="flex-1 pt-16">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/availability" element={<Availability />} />
                  <Route path="/fundraisers" element={<Fundraisers />} />
                  <Route path="/order" element={<Order />} />
                  <Route path="/order/confirmed" element={<OrderConfirmed />} />
                  <Route path="/order/:id" element={<OrderStatus />} />
                  <Route path="/order/:id/confirm" element={<OrderEditConfirm />} />
                  <Route path="/team" element={<MeetTheTeam />} />
                  {/* Renamed from Our Story (Titus, 2026-08-20). Old links keep working. */}
                  <Route path="/our-story" element={<Navigate to="/team" replace />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/account/order/:id" element={<AccountOrderDetail />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </PreviewGate>
  )
}
