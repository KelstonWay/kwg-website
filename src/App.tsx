import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Home from './pages/Home'
import Availability from './pages/Availability'
import Order from './pages/Order'
import OrderConfirmed from './pages/OrderConfirmed'
import OrderStatus from './pages/OrderStatus'
import OurStory from './pages/OurStory'
import Contact from './pages/Contact'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-on-background flex flex-col">
        <Nav />
        <main className="flex-1 pt-24">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/availability" element={<Availability />} />
            <Route path="/order" element={<Order />} />
            <Route path="/order/confirmed" element={<OrderConfirmed />} />
            <Route path="/order/:id" element={<OrderStatus />} />
            <Route path="/our-story" element={<OurStory />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
